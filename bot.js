require('dotenv').config();

const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const cron = require('node-cron'); // Import the node-cron package



client.on('ready', () => {
    console.log('bot is ready');
})

client.on('ready', () => {
  console.log('Bot is ready');

  // Schedule the message to be sent at 2:00 PM every day (change the time as needed)
  cron.schedule('20 13 * * *', () => {
    const channel = client.channels.cache.get('894082247567769630'); // Replace with your channel ID
    if (channel) {
      channel.send('Essa mensagem foi enviada por um agendador as 13:20.');
    }
  });
});

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

client.login(process.env.DISCORD_BOT_ID);