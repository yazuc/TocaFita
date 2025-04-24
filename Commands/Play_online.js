// Play_Online.js
const Funcoes = require('./Funcoes');
const Queue = require('./Queue');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytSearch = require('yt-search');
const { exec } = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { raw: ytdlp } = require('yt-dlp-exec');
const prism = require('prism-media');

const audioPlayer = createAudioPlayer();
const queue = new Queue();

/**
 * Search for a video on YouTube and return the first result's URL.
 */
async function searchVideo(query) {
  const results = await ytSearch(query);
  if (results && results.videos && results.videos.length > 0) {
    return `https://www.youtube.com/watch?v=${results.videos[0].videoId}`;
  }
  return null;
}

function isPlaying() {
  return audioPlayer.state.status === AudioPlayerStatus.Playing;
}

function stop() {
  audioPlayer.pause();
}

function continuar() {
  audioPlayer.unpause();
}

function listQueue(message) {
  if (queue.size() === 0) {
    message.reply("Não tem nada na fila.");
    return;
  }
  let resposta = "**Fila de músicas:**\n";
  queue.items.forEach((item, index) => {
    let musica = item.split(/!play\s+/i)[1] || "[desconhecido]";
    resposta += `${index + 1}. ${musica}\n`;
  });
  message.reply(resposta);
}

function connects(message, channel, streamObj) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  const audioResource = createAudioResource(streamObj);
  audioPlayer.play(audioResource);
  connection.subscribe(audioPlayer);

  audioPlayer.on('error', error => {
    console.error('AudioPlayer Error:', error.message);
  });
}

async function streamVideo(channel, message, videoUrl) {
  try {
    const videoId = Funcoes.getYouTubeVideoId(videoUrl);
    const output = await exec(videoId, { output: '-' });

    if (!channel) return message.reply('Voice channel not found.');
    connects(message, channel, output.stdout);
  } catch (error) {
    console.error('Error while fetching or playing the audio:', error);
    message.reply('An error occurred while trying to play the audio.');
  }
}

async function TocaFitaOnline(voiceChannel, video) {
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      });
  
      const ytdlpProcess = ytdlp(video.url, {
        output: '-',
        format: 'bestaudio[ext=webm]',
        quiet: true,
        limitRate: '100K',
        verbose: false,
        dumpSingleJson: false,
        referer: video.url,
        stdout: 'pipe'
      });
  
      const ffmpeg = new prism.FFmpeg({
        args: [
          '-analyzeduration', '0',
          '-loglevel', '0',
          '-i', 'pipe:0',
          '-f', 'opus',
          '-ar', '48000',
          '-ac', '2',
          'pipe:1'
        ]
      });
  
      ytdlpProcess.stdout.pipe(ffmpeg);
  
      const stream = ffmpeg;
  
      const resource = createAudioResource(stream, {
        inputType: StreamType.Opus
      });
  
      const player = createAudioPlayer();
      player.play(resource);
  
      connection.subscribe(player);
  
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });
  
      return { connection, player };
    } catch (error) {
      console.error('Error while fetching or playing the audio:', error);
      throw error;
    }
  }

module.exports = {
  TocaFitaOnline,
  stop,
  continuar,
  isPlaying,
  listQueue
};