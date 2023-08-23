#!/usr/bin/env node

require('dotenv').config();

//Instancia a API do axios
const axios = require('axios');

//Instancia a API do discord
const { Client, GatewayIntentBits, Guild } = require('discord.js');

//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

//Instancia cron para realizar uma tarefa agendada
const cron = require('node-cron'); // Import the node-cron package

//Método watcher, serve para mostrar que o bot está ativo, e para setar o evento marcado as 13:20
//Para realizar a trocade roles do Fabricio
client.on('ready', () => {
  console.log('Bot is ready');

  // Schedule the message to be sent at 2:00 PM every day (change the time as needed)
  cron.schedule('34 11 * * *', () => {
    const channel = client.channels.cache.get('1143699866883735592'); // Replace with your channel ID
    if (channel) {
      channel.send('Iniciando troca de poderes.');
      trocaRole(channel);
    }
  });
});

//Event watcher de exemplo
client.on('messageCreate', async (message) => {
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
})

//Event watcher para os comandos específicos do bot
client.on('messageCreate', async (message) => {
  if (message.content === '!getroles') {
    const userRoles = getUserRoles(message.member);

    const response = userRoles.length > 0 ?
      `${message.author.displayName} has the following roles: ${userRoles.join(', ')}` :
      `${message.author.displayName} doesn't have any roles.`;

    message.channel.send(response);
  }

  if (message.content.startsWith('!getUserRoles')) {
    const rolesMessage = getMentionedUserRoles(message);
    message.channel.send(rolesMessage);
  }

  if (message.content === '!fabriciorole') {
    trocaRole(message);
  }

  if (message.content === '!fabricio') {
    fetchUsernameById(message.channel, '248562627301736448');
  }
})


function getUserRoles(member) {
  
  return member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name);
}

async function fetchUsernameById(channel, userId) {
  try {
    const user = await client.users.fetch(userId);
    channel.send(`Este é o username do fabricio: ${user.username}`);
  } catch (error) {
    console.error(error);
    channel.send('An error occurred while fetching the user.');
  }
}

function getMentionedUserRoles(message) {
  const mentionedUser = message.mentions.members.first();
  
  if (!mentionedUser) {
    return 'No user mentioned.';
  }

  const userRoles = mentionedUser.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name);
  return `${mentionedUser.user.username} has the following roles: ${userRoles.join(', ')}`;
}

const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'ultimaData.csv');

function loadCSV(){
    fs.readFile(csvFilePath, 'utf8', (err, csvContent) => {
      if (err) {
        console.error('Error reading CSV file:', err);
        return;
      }
    
      //console.log('CSV Content:', csvContent);
      return csvContent.toString();
    });
}

function gerarNumeroAleatorio() {
  return Math.floor(Math.random() * 8) + 1;
}

let hoje = new Date().getDate();



console.log(hoje + " esse é o número que hoje retorna")

const roleID = process.env.roleID;
const GuildID = process.env.GuildID;
const UserIDRoleChange = process.env.UserIDRoleChange;
const RoleTarget = process.env.RoleTarget;


//melhorar complexidade e arrumar funcionalidade
async function trocaRole(channel) {
  const intNumber = gerarNumeroAleatorio();
  const role = await client.guilds.cache.get(GuildID)?.roles.cache.get(roleID);
  const hoje = new Date().getDate();

  const roles = [
    'Manage channels', 'Manage roles', 'Manage messages', 'Move members',
    'Manage emojis', 'View audit log', 'Deafen members', 'Mute members'
  ];
  const permissions = [16, 268435456, 8192, 16777216, 1073741824, 128, 8388608, 4194304];
  console.log(hoje.toString())
  let result = loadCSV();
  console.log(result)
  if(hoje.toString() != result){
    if (intNumber >= 1 && intNumber <= roles.length) {
      const roleName = roles[intNumber - 1];
      const rolePermissions = permissions[intNumber - 1];

      await channel.send(`O poder do <@${UserIDRoleChange.toString()}> hoje é: ${roleName}`);

      if (role) {
        try {
          await role.edit({
            name: roleName,
            permissions: rolePermissions.toString(),
          });
          console.log(`Role "${roleName}" updated successfully.`);
        } catch (error) {
          console.error('Error updating role:', error);
        }
      } else {
        console.log('Role not found.');
      }
    }
  }else{
    await channel.send(`O poder de <@${UserIDRoleChange.toString()}> já foi alterado hoje.`);
  }
}

client.login(process.env.DISCORD_BOT_ID);