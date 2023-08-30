#!/usr/bin/env node
require('dotenv').config();

//Instancia a API do axios
const axios = require('axios');
const Fabras = require('Fabricio');
const Funcoes = require ('Funcoes');

//Instancia a API do discord
const { Client, GatewayIntentBits, Guild, EmbedBuilder  } = require('discord.js');

//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

//Instancia cron para realizar uma tarefa agendada
const cron = require('node-cron'); // Import the node-cron package
const regex = /^au{3,}/;

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
})

//Event watcher para os comandos específicos do bot
client.on('messageCreate', async (message) => {
  if (message.content === '!getroles') {
    const userRoles = Funcoes.getUserRoles(message.member);

    const response = userRoles.length > 0 ?
      `${message.author.displayName} has the following roles: ${userRoles.join(', ')}` :
      `${message.author.displayName} doesn't have any roles.`;

    message.channel.send(response);
  }

  if (message.content.startsWith('!getUserRoles')) {
    const rolesMessage = Funcoes.getMentionedUserRoles(message);
    message.channel.send(rolesMessage);
  }

  if (message.content === '!fabriciorole') {
    Fabras.trocaRole(message.channel);
  }

  if (message.content === '!fabricio') {
    Funcoes.fetchUsernameById(message.channel, '248562627301736448');
  }
  if (message.author.id != '887743506737688606') {
      if (regex.test(message.content)) {
        //build wolf lyrics logic
        message.reply("auuuuuuuuuuuu");
        console.log("Pattern matched!");
      } else {
          console.log("Pattern not matched.");
      }    
  }
})

client.login(process.env.DISCORD_BOT_ID);