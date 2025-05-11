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

    const stream = () => {
      const passThrough = new PassThrough();

      const ytDlpProcess = ytDlpWrap.execStream([
        query,
        '--cookies', './cookies.txt',
        '--no-playlist',
        '--no-cache-dir',
        '-f', 'bestaudio[ext=m4a]/bestaudio',
        '--retries', '20',
        '--fragment-retries', '20',
        '-N', '2',
        '-o', '-', // stream to stdout
      ]);

      ytDlpProcess.pipe(passThrough);

      ytDlpProcess.on('error', (err) => {
        console.error('yt-dlp stream error:', err);
      });

      ytDlpProcess.on('close', (code) => {
        console.warn(`yt-dlp exited with code ${code}`);
        if (code !== 0 && retries < 3) {
          retries++;
          console.log(`Retrying download... (${retries})`);
          return connects(message, channel, query); // Retry logic
        }
      });

      return passThrough;
    }; 
    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const audioStream = stream();
    const resource = createAudioResource(audioStream);

    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);
}

module.exports = {
  TocaFitaOnline
};
