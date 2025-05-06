const Funcoes = require('./Funcoes');
const { Readable } = require('stream');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap('./yt-dlp');
const fs = require('fs');

const StreamOptions ={
  seek: 0,
  volume: 1
}

const queue = new Map(); // Se quiser manter controle extra, mas Player já tem fila interna
const audioPlayer = createAudioPlayer();

/**
 * Toca uma música ou adiciona na fila.
 */
async function TocaFitaOnline(message) {
  const args = message.content.split(' ').slice(1);
  if (!args.length) return message.reply('Digite o nome ou link da música.');

  const channel = message.member.voice.channel;
  if (!channel) return message.reply('Você precisa estar em um canal de voz!');

  const query = args.join(' ');

  try {
    console.log(`Procurando pela música: ${query}`);

    
    // Ensure the stream is passed to the Discord player
    connects(message, channel, query);
  } catch (error) {
    console.error('Erro ao baixar o vídeo:', error);
    message.reply('Ocorreu um erro ao tentar obter o áudio do YouTube.');
  }
}

async function connects(message, channel, query) {
  // Execute yt-dlp to get the audio stream
  let readableStream = ytDlpWrap.execStream([
    query,
    '-f', 'bestaudio',  // Get the best audio quality
    '--extract-audio',   // Extract audio only (avoid video)
    '--audio-format', 'opus', // Use opus format for efficient streaming
  ]);

  // Wrap yt-dlp stream into a Node.js Readable stream
  let readableStreamYT = new Readable({
    read() {
      readableStream.on('data', (chunk) => {
        this.push(chunk);  // Push each chunk into the readable stream
      });
      readableStream.on('end', () => {
        this.push(null);  // Push null to indicate end of stream
      });
      readableStream.on('error', (err) => {
        this.emit('error', err);  // Emit error if yt-dlp stream fails
      });
    }
  });

  // Join the voice channel
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  console.log("Playing audio from yt-dlp");

  // Create an audio resource from the yt-dlp stream
  const resource = createAudioResource(readableStreamYT, {
    inputType: StreamType.Opus, // Use the Opus format for Discord voice channel
  });

  // Play the audio resource
  audioPlayer.play(resource);

  // Error handling for the audio player
  audioPlayer.on('error', (error) => {
    console.error('AudioPlayer Error:', error.message);
    message.reply('Ocorreu um erro ao tentar tocar a música.');
  });

  // Subscribe the audio player to the connection
  connection.subscribe(audioPlayer);
}

module.exports = {
  TocaFitaOnline
};
