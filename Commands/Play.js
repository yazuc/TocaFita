require('dotenv').config();

//Instancia a API do axios
const Funcoes = require ('./Funcoes');
const Queue = require ('./Queue');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { exec } = require('youtube-dl-exec');
const fs = require('fs');
const ytdl = require('ytdl-core');


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

function PlayLocal(audioPlayer, filePath){
    // Create an audio resource from the audio stream
    const audioResource = createAudioResource(filePath);

    audioPlayer.play(audioResource);
}

function connects(message, channel, filePath){
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const audioPlayer = createAudioPlayer();
      audioPlayer.behaviors.maxMissedFrames = 1000000;
      
      console.log("próxima ação é rodar a música")
      //console.log(filePath)
      
      PlayLocal(audioPlayer, filePath);

      let currentAudioResource = null;
      let playbackPosition = 0;

      audioPlayer.on('error', (error) => {      
        console.error('AudioPlayer Error:', error.message);

        // Pause playback on error.
        audioPlayer.pause();
      
        // Store the current playback position.
        if (currentAudioResource) {
          playbackPosition = currentAudioResource.playbackDuration;
        }
      
        // Implement your error handling logic here (e.g., reconnecting).
      
        // Retry playback from the stored position when the issue is resolved.
        if (currentAudioResource) {
          // Adjust the start time based on the stored playback position.
          currentAudioResource.startTimestamp = Date.now() - playbackPosition;
          
          // Resume playback.
          audioPlayer.unpause();
        }
      });

      audioPlayer.on('idle', () => {
        // Delete the file
        // fs.unlink(filePath, (err) => {
        //   if (err) {
        //     console.error('Error deleting file:', err);
        //   } else {
        //     console.log('File deleted successfully');
        //   }
        // });

        queue.dequeue();        
      });

      // Subscribe the audio player to the connection
      connection.subscribe(audioPlayer);
}

//implementar funcionalidade da queue de adicionar uma música na lista de espera
//implementar pausa
//implementar info do video
//implementar busca por query (nome da música)
async function TocaFitaOnline(message){
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('Please provide a YouTube video URL or search query.');
    }

    const query = args.slice(1).join(' ');

    queue.enqueue(query);
    console.log(queue);

    try {      
      // Get the video ID or throw an error
      const videoId = Funcoes.getYouTubeVideoId(query);
      const highWaterMarkBytes = 32 * 1024 * 1024;
      
      const stream = ytdl(videoId, { filter: 'audioonly', liveBuffer: 40000, highWaterMark: highWaterMarkBytes , type: 'opus' });

      var voiceid = message.member.voice.channelId;

      const channel = message.guild.channels.cache.get(voiceid);
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


module.exports = {
    TocaFitaOnline
};

client.login(process.env.DISCORD_BOT_ID);
