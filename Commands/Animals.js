//check webhook
const roleID = process.env.roleID;
const GuildID = process.env.GuildID;
const UserIDRoleChange = process.env.UserIDRoleChange;
const RoleTarget = process.env.RoleTarget;
const { Client, GatewayIntentBits, Guild, EmbedBuilder  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const channel = client.channels.cache.get(process.env.ChatBotRPG); // Replace with your channel ID
const googleApiKey = process.env.googleAPI;
const customSearchEngineId = process.env.customSearchEngineId;
const axios = require('axios');

const fs = require('fs');

function readLyricsFromFile(filePath) {
  try {
    const lyricsArray = fs
      .readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter((line) => line.trim() !== ''); // Remove empty lines

    return lyricsArray;
  } catch (error) {
    console.error('Error reading file:', error.message);
    return [];
  }
}

// // Example usage:
// const filePath = 'node_modules/Lyrics.txt'; // Replace with the actual path to your text file
// const lyrics = readLyricsFromFile(filePath);

//console.log(lyrics);


module.exports = {
    readLyricsFromFile
};

client.login(process.env.DISCORD_BOT_ID);