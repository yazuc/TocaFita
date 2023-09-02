#!/usr/bin/env node
require('dotenv').config();

//Instancia a API do axios
const axios = require('axios');
const Fabras = require('./Commands/Fabricio');
const Funcoes = require ('./Commands/Funcoes');
const Animals = require('./Commands/Animals');
const Play = require('./Commands/Play');

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

    if (message.content.toLowerCase() === '!insult') {
      await Funcoes.insulto(message);
    }      
})

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!play')) {
      Play.TocaFita(message);
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