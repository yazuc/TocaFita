require('dotenv').config();

//Instancia a API do axios
const Funcoes = require ('./Funcoes');
const Queue = require ('./Queue');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { exec } = require('youtube-dl-exec');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');


//Instancia a API do discord
const { Client, GatewayIntentBits, Guild, EmbedBuilder, GUILD_VOICE_STATES  } = require('discord.js');

//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
] });

const queue = new Queue();

const highWaterMarkBytes = 32 * 1024 * 1024;
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
      message.channel.send(`Here's the video you requested: ${videoUrl}`);
      return videoUrl;
      
    } else {
      message.channel.send('No videos found for the given query.');
    }
  } catch (error) {
    console.error('Error searching for videos:', error);
    message.channel.send('An error occurred while searching for videos.');
  }
}
/**     
 * @param channel - canal em que o usuário está digitando, para retornar mensagens
 * @param message - objeto mensagem gerado pela api do discord quando um usuário digita algo
 * */ 
async function streamVideo(channel, message){
  try {      
    // Get the video ID or throw an error
    let videoId = ""

    if(!queue.isEmpty()){
      videoId = Funcoes.getYouTubeVideoId(queue.peek());
      queue.dequeue();
    }
    
    const stream = ytdl(videoId, { 
        filter: 'audioonly',
        liveBuffer: 40000,
        highWaterMark: highWaterMarkBytes ,
        type: 'opus'
    });

    if (!channel) {
      return message.reply('Voice channel not found.');
    }
    connects(message, channel, stream)    

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
    const audioResource = createAudioResource(streamObj);
    audioPlayer.play(audioResource);
}

/**     
 * @param message - objeto mensagem do discord
 * @param channel - canal do discord em que o bot vai entrar
 * @param streamObj - objeto criado para realizar o streaming do video em opus
 * */ 
function connects(message, channel, streamObj){
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const audioPlayer = createAudioPlayer();
      audioPlayer.behaviors.maxMissedFrames = 1000000;
      
      console.log("próxima ação é rodar a música")
      
      PlayLocal(audioPlayer, streamObj);

      audioPlayer.on('error', (error) => {      
        console.error('AudioPlayer Error:', error.message);
      });

      audioPlayer.on('idle', () => {
        queue.dequeue();      
        connection.disconnect();  
      });

      // Subscribe the audio player to the connection
      connection.subscribe(audioPlayer);
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
    
    queue.enqueue(videoUrl);
    console.log(queue);
    
    var voiceid = message.member.voice.channelId;
    const channel = message.guild.channels.cache.get(voiceid);
    
    await streamVideo(channel, message)
}


module.exports = {
    TocaFitaOnline
};

client.login(process.env.DISCORD_BOT_ID);
