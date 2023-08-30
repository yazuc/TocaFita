//check webhook
const roleID = process.env.roleID;
const GuildID = process.env.GuildID;
const UserIDRoleChange = process.env.UserIDRoleChange;
const RoleTarget = process.env.RoleTarget;
const { Client, GatewayIntentBits, Guild, EmbedBuilder  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const channel = client.channels.cache.get(process.env.ChatBotRPG); // Replace with your channel ID

function gerarNumeroAleatorio() {
  return Math.floor(Math.random() * 8) + 1;
}

async function fetchUsernameById(channel, userId) {
  try {
    const user = await client.users.fetch(userId);
    return user.username;
  } catch (error) {
    console.error(error);
    channel.send('An error occurred while fetching the user.');
  }
}

//melhorar complexidade e arrumar funcionalidade
async function trocaRole(channel) {
    const intNumber = gerarNumeroAleatorio();
    const role = await client.guilds.cache.get(GuildID)?.roles.cache.get(roleID);
  
    const roles = [
      'Manage channels', 'Manage roles', 'Manage messages', 'Move members',
      'Manage emojis', 'View audit log', 'Deafen members', 'Mute members'
    ];
    const permissions = [16, 268435456, 8192, 16777216, 1073741824, 128, 8388608, 4194304];
      if (intNumber >= 1 && intNumber <= roles.length) {
        const roleName = roles[intNumber - 1];
        const rolePermissions = permissions[intNumber - 1];
        let name = await fetchUsernameById(channel, UserIDRoleChange);
  
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
    }else{
      await channel.send(`O poder de <@${UserIDRoleChange.toString()}> já foi alterado hoje.`);
    }
  }

    client.login(process.env.DISCORD_BOT_ID);

  module.exports = {
    trocaRole
};