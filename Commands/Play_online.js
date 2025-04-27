const Funcoes = require('./Funcoes');
const { Readable } = require('stream');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap('./yt-dlp.exe');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

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

function connects(message, channel, query) {

  // Execute yt-dlp to get the audio stream
  let readableStream = ytDlpWrap.execStream([
    query,
    '-f', 'bestaudio',  // Get the best audio quality
    '--extract-audio',    // Extract audio only (avoid video)
    '--audio-format', 'opus', // Prefer the efficient opus format
  ]);

  let readableStreamYT = new Readable({
    read() {
      readableStream.on('data', (chunk) => {
        this.push(chunk);  // Push each chunk into the readable stream
      });
    }
  });  

  // Create a new audio player for each song
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  console.log("Próxima ação é rodar a música");

  // Create an audio resource from the stream
  
  const resource = createAudioResource(readableStreamYT);
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
