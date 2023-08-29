#!/usr/bin/env node


require('dotenv').config();

//Instancia a API do axios
const axios = require('axios');
const googleApiKey = process.env.googleAPI;
const customSearchEngineId = process.env.customSearchEngineId;
const Discord = require('discord.js');

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
      trocaRole(channel);
    }
  });
});

//Event watcher de exemplo
client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === '$w') {
    getAstolfo(message);
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
      await insulto(message);
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

async function getAstolfo(message){
  try {
    const query = "Astolfo nsfw" // Extract query
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${customSearchEngineId}&key=${googleApiKey}&searchType=image`;
    
    const response = await axios.get(apiUrl);
    const items = response.data.items;
    
    if (items && items.length > 0) {
      const randomIndex = Math.floor(Math.random() * items.length);
      const imageUrl = items[randomIndex].link;
      
      //message.channel.send(imageUrl);
      let exampleEmbed = new EmbedBuilder()
      .setTitle('Astolfo Aleatório')
      .setImage(imageUrl);

      message.channel.send({ embeds: [exampleEmbed]});
  } else {
      message.reply('No image search results found.');
  }

  } catch (error) {
      console.error('Error fetching random image:', error);
      //message.reply('Oops! Something went wrong while fetching a random image.');
  }
}

async function insulto (message){
  try {
    // Make a request to the Evil Insult Generator API
    const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    
    // Get the insult from the response data
    const insult = response.data.insult;
    
    // Reply with the insult
    message.reply(`${insult}`);
} catch (error) {
    console.error('Error fetching insult:', error);
    message.reply('Oops! Something went wrong while fetching an insult.');
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
      let name = fetchUsernameById(channel, UserIDRoleChange);

      await channel.send(`O poder do ${name} hoje é: ${roleName}`);

      if (role) {
        try {
          await role.edit({
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