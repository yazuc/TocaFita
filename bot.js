#!/usr/bin/env node
require('dotenv').config();

//Instancia a API do axios
const axios = require('axios');
const Fabras = require('./Commands/Fabricio');
const Funcoes = require ('./Commands/Funcoes');
const Animals = require('./Commands/Animals');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { createReadStream } = require('fs');
const { createFFmpegPlayer } = require('prism-media');
const { Player } = require("discord-player");
const { exec } = require('youtube-dl-exec');
const fs = require('fs');

const ytdl = require('ytdl-core');
const ytdlexec = require('youtube-dl-exec')

//Instancia a API do discord
const { Client, GatewayIntentBits, Guild, EmbedBuilder, GUILD_VOICE_STATES  } = require('discord.js');
const { Client: VoiceClient, GatewayIntentBits: VoiceGatewayIntentBits } = require('@discordjs/voice');


//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [
   GatewayIntentBits.Guilds,
   GatewayIntentBits.GuildMessages,
   GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
] });


//Instancia cron para realizar uma tarefa agendada
const cron = require('node-cron'); // Import the node-cron package
const regex = /^au{3,}/;

//array que mantem em memória a música carregada
let LyricsArray = []
let LyricsIndex = 0;
const filePath = './Commands/Lyrics.txt';
console.log("joga os valores no array ")
LyricsArray = Animals.readLyricsFromFile(filePath);
const audioFile = './Commands/animals.mp3'; // Replace with the path to your audio file


//Método watcher, serve para mostrar que o bot está ativo, e para setar o evento marcado as 13:20
//Para realizar a trocade roles do Fabricio
client.on('ready', () => {
  console.log('Bot is ready');
  client.user.setActivity('sua mae de 4', { type: 'WATCHING' });

  // Schedule the message to be sent at 2:00 PM every day (change the time as needed)
  cron.schedule('16 21 * * *', () => {
    const channel = client.channels.cache.get(process.env.ChatBotRPG); // Replace with your channel ID
    if (channel) {
      channel.send('Iniciando troca de poderes.');
      Fabras.trocaRole(channel);
    }
  });

  
});

//Event watcher de exemplo
client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === '$w') {
    Funcoes.getAstolfo(message);
  }
    if (message.content === 'ping') {
        message.reply({
            content: 'pong',
        })
    }
    else if (message.content === 'quote') {
        let resp = await axios.get(`https://api.quotable.io/random`);
        const quote = resp.data.content;

        message.reply({
            content: quote,
        })
    }

    if (message.content.toLowerCase() === '!insult') {
      await Funcoes.insulto(message);
    }

    if (message.content === '!join') {
      const channel = message.guild.channels.cache.get('338849340346859540');
      if (!channel) {
        return message.reply('Voice channel not found.');
      }
  
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const audioPlayer = createAudioPlayer();

      // Add error handling for the voice connection
      connection.on('error', (error) => {
        console.error('Voice connection error:', error);
      });

      // Create an audio resource from the audio file
      const audioResource = createAudioResource(createReadStream(audioFile), {
        inputType: StreamType.Arbitrary,
      });

      
      audioPlayer.play(audioResource);
      
      // Listen for state changes in the audio player
      audioPlayer.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
      });
      
      // Subscribe the audio player to the connection
      connection.subscribe(audioPlayer);
    }         
})

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!play')) {
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

      const channel = message.guild.channels.cache.get('338849340346859540');
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
});

//Event watcher para os comandos específicos do bot
client.on('messageCreate', async (message) => {
  const content = message.content;
  const authorId = message.author.id;

  const handleGetRoles = () => {
    const userRoles = Funcoes.getUserRoles(message.member);
    const response = userRoles.length > 0 ?
      `${message.author.displayName} has the following roles: ${userRoles.join(', ')}` :
      `${message.author.displayName} doesn't have any roles.`;
    message.channel.send(response);
  };

  const handleGetUserRoles = () => {
    const rolesMessage = Funcoes.getMentionedUserRoles(message);
    message.channel.send(rolesMessage);
  };

  const handleFabricioRole = () => {
    Fabras.trocaRole(message.channel);
  };

  const handleFabricio = () => {
    Funcoes.fetchUsernameById(message.channel, '248562627301736448');
  };

  switch (content) {
    case '!getroles':
      handleGetRoles();
      break;

    case content.startsWith('!getUserRoles'):
      handleGetUserRoles();
      break;

    case '!fabriciorole':
      handleFabricioRole();
      break;

    case '!fabricio':
      handleFabricio();
      break;

    default:
      if (authorId !== '887743506737688606' && regex.test(content)) {
        console.log("Accepted by regex");
        if (LyricsArray.length > LyricsIndex && LyricsArray[LyricsIndex] !== "") {
          console.log("Sending message");
          message.reply(LyricsArray[LyricsIndex]);
          LyricsIndex++;
        } else {
          console.log("Resetting lyricsIndex");
          LyricsIndex = 0;
          if (LyricsArray[LyricsIndex] !== "") {
            console.log("Sending message");
            message.reply(LyricsArray[LyricsIndex]);
            LyricsIndex++;
          }
        }
      }
  }
})

client.login(process.env.DISCORD_BOT_ID);