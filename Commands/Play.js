require('dotenv').config();

//Instancia a API do axios
const Funcoes = require ('./Funcoes');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { exec } = require('youtube-dl-exec');
const fs = require('fs');

//Instancia a API do discord
const { Client, GatewayIntentBits, Guild, EmbedBuilder, GUILD_VOICE_STATES  } = require('discord.js');

//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [
   GatewayIntentBits.Guilds,
   GatewayIntentBits.GuildMessages,
   GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
] });


async function TocaFita(message){
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('Please provide a YouTube video URL or search query.');
    }

    const query = args.slice(1).join(' ');

    try {
      const filePath = `./custom-name.webm`;

      
      // Get the video ID or throw an error
      const videoId = Funcoes.getYouTubeVideoId(query);

      const videoInfo = await exec(videoId, {
        o: 'custom-name' // Set your custom file name and extension here
      }, { stdio: ['ignore', 'pipe', 'ignore'] }); // Get the direct audio stream URL
      const audioStream = videoInfo.stdout;

      var voiceid = message.member.voice.channelId;

      const channel = message.guild.channels.cache.get(voiceid);
      if (!channel) {
        return message.reply('Voice channel not found.');
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const audioPlayer = createAudioPlayer();
      audioPlayer.behaviors.maxMissedFrames = 1000000;
      
      console.log("próxima ação é rodar a música")
      console.log(filePath)
      // Create an audio resource from the audio stream
      const audioResource = createAudioResource(filePath);

      audioPlayer.play(audioResource);

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
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully');
          }
        });
      });

      // Subscribe the audio player to the connection
      connection.subscribe(audioPlayer);
    } catch (error) {
       // Handle the error
      console.error('Error:', error);
      message.reply('An error occurred while playing the audio.');
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
    TocaFita
};

client.login(process.env.DISCORD_BOT_ID);
