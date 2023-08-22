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

client.on('messageCreate', async (message) => {
  if (message.content === 'fabricio_role') {
      message.reply({
          content: 'em desenvolvimento.',
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

//melhorar complexidade e arrumar funcionalidade
async function trocaRole(){
    let result = await lib.discord.channels['@0.2.1'].messages.retrieve({
      message_id: `897749891177152542`,
      channel_id: `894082247567769630`
    });
    if(result.content.localeCompare(hoje) != 0){
      let messageContent = context.params.event.content.match(/hi|hey|hello|sup/i);
      
      if (intNumber == 1) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role1,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `16`,
        });
      }
      if (intNumber == 2) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role2,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `268435456`,
        });
      }
      if (intNumber == 3) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role3,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `8192`,
        });
      }
      if (intNumber == 4) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role4,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `16777216 `,
        });
      }
      if (intNumber == 5) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role5,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `1073741824`,
        });
      }
      if (intNumber == 6) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role6,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `128`,
        });
      }
      if (intNumber == 7) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role7,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `8388608`,
        });
      }
      if (intNumber == 8) {
        await lib.discord.channels['@0.2.0'].messages.create({
          channel_name: `bots`,
          content: 'O poder do <@248562627301736448> hoje é: ' + role8,
        });
        let result = await lib.discord.guilds['@0.1.0'].roles.update({
          role_id: `887726789567320126`,
          guild_id: `542112575819612162`,
          name: `Fabrício`,
          permissions: `4194304`,
        });
      }
      let result = await lib.discord.channels['@0.2.1'].messages.update({
        message_id: `897749891177152542`,
        channel_id: `894082247567769630`,
        content: hoje
      });
    }
    if(result.content.localeCompare(hoje) == 0){
      await lib.discord.channels['@0.2.0'].messages.create({
        channel_name: `bots`,
        content: 'O <@248562627301736448> já rolou sua role hoje ',
      });
    }    
}



client.login(process.env.DISCORD_BOT_ID);