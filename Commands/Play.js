require('dotenv').config();

//Instancia a API do axios
const Funcoes = require ('./Funcoes');
const Queue = require ('./Queue');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');  
const { exec } = require('youtube-dl-exec');
const ytSearch = require('yt-search');
const fs = require('fs');
const audioPlayer = createAudioPlayer();
const filePath = `./custom-name.webm`;


//Instancia a API do discord
const { Client, GatewayIntentBits, Guild, EmbedBuilder, GUILD_VOICE_STATES  } = require('discord.js');
const { stream } = require('npmlog');

//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
] });

const queue = new Queue();

const highWaterMarkBytes = 32 * 1024 * 1024 * 1024;
/**     
 * @param query - parametro de busca na youtube api para retornar o url do video
 * @param message - objeto mensagem gerado pela api do discord quando um usuário digita algo
 * */ 
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

async function searchVideo(query){
    // Search for videos based on the query
    let results = await ytSearch(query);

    if (results && results.videos && results.videos.length > 0) {
      // Get the URL of the first video in the search results
      videoUrl = `https://www.youtube.com/watch?v=${results.videos[0].videoId}`;

      // Send the video URL as a response
      //message.channel.send(`Here's the video you requested: ${videoUrl}`);
      return videoUrl;
      
    }   
}

/**     
 * @param channel - canal em que o usuário está digitando, para retornar mensagens
 * @param message - objeto mensagem gerado pela api do discord quando um usuário digita algo
 * */ 
async function streamVideo(channel, message, audioPlayer){
  try {      
    // Get the video ID or throw an error
    let videoId = ""

    if(!queue.isEmpty()){
      videoId = Funcoes.getYouTubeVideoId(queue.peek());
      queue.dequeue();
    }
    
    // const stream = ytdl(videoId, { 
    //     filter: 'audioonly',
    //     liveBuffer: 40000,
    //     highWaterMark: highWaterMarkBytes ,
    //     type: 'opus'
    // });

    const vid = exec(videoId, {
      o: '-',
      q: '',
      f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
      r: '100K',
    }, { stdio: ['ignore', 'pipe', 'ignore'] })

    let stream = vid.stdout;

    if (!channel) {
      return message.reply('Voice channel not found.');
    }
    connects(message, channel, stream, audioPlayer)    

  } catch (error) {
     // Handle the error
    if (error.message === 'No video id found') {
      console.error('No video ID found in the provided URL:', query);
      message.reply('The provided URL does not contain a valid YouTube video.');
    } else {
      console.error('Error while fetching or playing the audio:', error);
      message.reply('An error occurred while fetching or playing the audio.');
    }
  }
}

/**     
 * @param audioPlayer - objeto audioplayer criado pelo discordjs/voice
 * @param streamObj - objeto criado para realizar o streaming do video em opus
 * */ 
function PlayLocal(audioPlayer, streamObj){
    // Create an audio resource from the audio stream
    console.log(streamObj)
    const audioResource = createAudioResource(streamObj);
    audioPlayer.play(audioResource);
    console.log("começou a tocar")
}

/**     
 * @param message - objeto mensagem do discord
 * @param channel - canal do discord em que o bot vai entrar
 * @param streamObj - objeto criado para realizar o streaming do video em opus
 * */ 
function connects(message, channel, streamObj, audioPlayer){
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      console.log("próxima ação é rodar a música")
      
      PlayLocal(audioPlayer, streamObj);

      audioPlayer.on('error', (error) => {      
        console.error('AudioPlayer Error:', error.message);
      });

      audioPlayer.on('idle', () => {

        deleteFile(filePath);
        
        if(!queue.isEmpty()){
          console.log('vai tentar rodar a proxima musica')
          return streamVideo(channel, message);
        }else{
          connection.disconnect();  
        }

      });

      // Subscribe the audio player to the connection
      connection.subscribe(audioPlayer);
}

function deleteFile(filePath) {
  // Check if the file exists before attempting to delete it
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`The file ${filePath} does not exist.`);
      return;
    }

    // Delete the file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error(`Error deleting the file: ${unlinkErr}`);
      } else {
        console.log(`File ${filePath} has been deleted.`);
      }
    });
  });
}

async function PreparaExec(query){
  let videoUrl = await searchVideo(query);

  let videoId = Funcoes.getYouTubeVideoId(videoUrl);

  let videoInfo = await exec(videoId, {
    o: 'custom-name' // Set your custom file name and extension here
  }, { stdio: ['ignore', 'pipe', 'ignore'] }); // Get the direct audio stream URL
}

async function TocaFita(message){
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('Please provide a YouTube video URL or search query.');
    }

    const query = args.slice(1).join(' ');
    let videoUrl = await searchVideo(query, message);
    
    audioPlayer.on('playing', () => {
      queue.enqueue(videoUrl);
      return message.reply('Música adicionada a fila: ' + videoUrl);
    });

    queue.enqueue(videoUrl);
    console.log(queue);

    deleteFile(filePath);

    
    // Get the video ID or throw an error
    const videoId = Funcoes.getYouTubeVideoId(videoUrl);

    const videoInfo = await exec(videoId, {
      o: 'custom-name' // Set your custom file name and extension here
    }, { stdio: ['ignore', 'pipe', 'ignore'] }); // Get the direct audio stream URL
     audioStream = videoInfo.stdout;

     

    var voiceid = message.member.voice.channelId;

    const channel = message.guild.channels.cache.get(voiceid);
    if (!channel) {
      return message.reply('Voice channel not found.');
    }

    connects(message, channel, filePath, audioPlayer)
    
  }

//implementar funcionalidade da queue de adicionar uma música na lista de espera
//implementar pausa
//implementar info do video
async function TocaFitaOnline(message){
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('Please provide a YouTube video URL or search query.');
    }

    const query = args.slice(1).join(' ');
    let videoUrl = await searchVideo(query, message);
    
    
    audioPlayer.on('playing', () => {
      queue.enqueue(videoUrl);
      return message.reply('Música adicionada a fila: ' + videoUrl);
    });
    
    queue.enqueue(videoUrl);
    console.log(queue);
    
    var voiceid = message.member.voice.channelId;
    const channel = message.guild.channels.cache.get(voiceid);
    
    // If nothing is currently playing, start playing the video
    if (!audioPlayer.state.status || audioPlayer.state.status === 'idle') {
      console.log(audioPlayer.state.status)
      console.log('vai iniciar')    
      await streamVideo(channel, message, audioPlayer);
    } else {
      console.log('vai enfileirar')    
    }
}


module.exports = {
    TocaFitaOnline,
    TocaFita
};

client.login(process.env.DISCORD_BOT_ID);
