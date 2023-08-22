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
  console.log("method was called")
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

//melhorar complexidade e arrumar funcionalidade
async function trocaRole() {
  const result = await lib.discord.channels['@0.2.1'].messages.retrieve({
    message_id: '897749891177152542',
    channel_id: '894082247567769630'
  });

  if (result.content.localeCompare(hoje) != 0) {
    const roles = [role1, role2, role3, role4, role5, role6, role7, role8];
    const permissions = [16, 268435456, 8192, 16777216, 1073741824, 128, 8388608, 4194304];

    if (intNumber >= 1 && intNumber <= 8) {
      const roleName = `Fabrício`;
      const rolePermissions = permissions[intNumber - 1];

      await lib.discord.channels['@0.2.0'].messages.create({
        channel_name: 'bots',
        content: `O poder do <@248562627301736448> hoje é: ${roles[intNumber - 1]}`,
      });

      await lib.discord.guilds['@0.1.0'].roles.update({
        role_id: '887726789567320126',
        guild_id: '542112575819612162',
        name: roleName,
        permissions: rolePermissions,
      });

      await lib.discord.channels['@0.2.1'].messages.update({
        message_id: '897749891177152542',
        channel_id: '894082247567769630',
        content: hoje
      });
    }
  } else {
    await lib.discord.channels['@0.2.0'].messages.create({
      channel_name: 'bots',
      content: 'O <@248562627301736448> já rolou sua role hoje ',
    });
  }
}



client.login(process.env.DISCORD_BOT_ID);