const Funcoes = require('./Funcoes');
const { Readable } = require('stream');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap('./yt-dlp');
const fs = require('fs');
const { PassThrough } = require('stream');

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

  const bufferStream = new PassThrough(); // Acts as a buffer
  let readableStream = ytDlpWrap.execStream([
    query,
    '--cookies', './cookies.txt',
    '--no-playlist',
    '--no-cache-dir',
    '-f', 'bestaudio[ext=m4a]/bestaudio',
    '--retries', '20',
    '--fragment-retries', '20',
    '-N', '2',
  ])
  
  readableStream.pipe(bufferStream);

  // Optional: capture errors from yt-dlp
  readableStream.on('error', (err) => {
    console.error('yt-dlp stream error:', err);
  });

  readableStream.on('close', (code) => {
    if (code !== 0) {
      console.warn(`yt-dlp exited with code ${code}, will attempt retry...`);
    }
  });

  readableStream.on('exit', (code, signal) => {
    console.warn(`yt-dlp exited with code ${code}, signal ${signal}`);
    if (code !== 0 && retries < 3) {
      retries++;
      console.log(`Retrying download... (${retries})`);
      tocarMusica(channel, query, message); // retry
    }
  });
  
  bufferStream.on('end', () => {
    console.warn('⚠️ bufferStream ended unexpectedly');
  });

  // Join the voice channel
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  console.log("Playing audio from yt-dlp");

  // Create an audio resource from the yt-dlp stream
  const resource = createAudioResource(bufferStream);

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
