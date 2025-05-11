const Funcoes = require('./Funcoes');
const Play = require('./Play.js')
const Queue = require('./Queue.js');
const { Readable } = require('stream');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap('./yt-dlp');
const fs = require('fs');
const { PassThrough } = require('stream');
const ytSearch = require('yt-search');
const { spawn } = require('child_process');

const StreamOptions ={
  seek: 0,
  volume: 1
}

const queue = new Queue(); // Se quiser manter controle extra, mas Player já tem fila interna
const audioPlayer = createAudioPlayer();

function isPlaying(){
    return audioPlayer.state.status === AudioPlayerStatus.Playing;  
}

async function onIdle(){
  audioPlayer.on('idle', () => {
    console.log("está idle")
      if(loop){
        
      }
      if(queue.isEmpty()){
        deleteFile(filePath)
        //audioPlayer.destroy();
      }else{
        tocaProxima()
      }
  });
}

async function searchVideo(query, message){
  try {
    // Search for videos based on the query
    let results = await ytSearch(query);

    if (results && results.videos && results.videos.length > 0) {
      // Get the URL of the first video in the search results
      videoUrl = `https://www.youtube.com/watch?v=${results.videos[0].videoId}`;

      // Send the video URL as a response
      //message.channel.send(`Here's the video you requested: ${videoUrl}`);
      return videoUrl;
      
  } else {
      message.channel.send('No videos found for the given query.');
    }
  } catch (error) {
    console.error('Error searching for videos:', error);
    message.channel.send('An error occurred while searching for videos.');
  }
}

function PythonExec(query){    
    const outputPath = '~/discordbot';
    
    const ytdlp = spawn('./yt-dlp', ['-o', '-', query]);    
    
    ytdlp.stdout.on('data', (chunk) => {
    console.log('Received data chunk of length:', chunk.length);
      // You can pipe this to a stream (e.g., ffmpeg, voice connection, etc.)
    });

    // Handle errors
    ytdlp.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    ytdlp.on('close', (code) => {
      console.log(`yt-dlp process exited with code ${code}`);
    });
}

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

    var url = await searchVideo(query)
        
    // Ensure the stream is passed to the Discord player
    connects(message, channel, url);
  } catch (error) {
    console.error('Erro ao baixar o vídeo:', error);
    message.reply('Ocorreu um erro ao tentar obter o áudio do YouTube.');
  }
}

async function connects(message, channel, query) {
  // Execute yt-dlp to get the audio stream
     const bufferStream = new PassThrough();
      const ytdlp = spawn('./yt-dlp', [
        '-o', '-',
        '--cookies', './cookies.txt',
        '--no-playlist',
        '--no-cache-dir',
        '-f', 'bestaudio[ext=webm]/bestaudio',
        '--retries', '20',
        '--fragment-retries', '20',
        '-N', '2',
        query,
      ]);

      // Pipe yt-dlp stdout to our PassThrough stream
      ytdlp.stdout.pipe(bufferStream);

      ytdlp.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
      });

      ytdlp.on('close', (code) => {
        console.log(`yt-dlp exited with code ${code}`);
        if (code !== 0) {
          message.reply('Falha ao baixar o áudio com yt-dlp.');
        }
      });
   
    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const resource = createAudioResource(bufferStream);
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);
  }

module.exports = {
  TocaFitaOnline
};
