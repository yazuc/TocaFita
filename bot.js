#!/usr/bin/env node

var fs = require('fs');
var obj;

fs.readFile('./appconfig.json', 'utf8', (err, data) => {
  if (err) throw err;
  obj = JSON.parse(data);
  client.login(obj.DISCORD_BOT_ID);
});


//Instancia a API do axios
const Funcoes = require ('./Commands/Funcoes');
const Play = require('./Commands/Play');
const PlayOnline = require('./Commands/Play_online');

//Instancia a API do discord
const { Client, GatewayIntentBits, Guild, EmbedBuilder, GUILD_VOICE_STATES  } = require('discord.js');

//Instancia um cliente novo para realizar login no discord
const client = new Client({ intents: [
   GatewayIntentBits.Guilds,
   GatewayIntentBits.GuildMessages,
   GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
] });


//Método watcher, serve para mostrar que o bot está ativo, e para setar o evento marcado as 13:20
//Para realizar a trocade roles do Fabricio
client.on('ready', async () => {
  console.log('Bot is ready');
  Funcoes.debug("objMessage", 'bot is ready')
  client.user.setActivity('sua mae de 4', { type: 'WATCHING' });
  const channel = client.channels.cache.get(obj.CHANNEL_ID);
	if (channel) {
	  //channel.send('ESTOU VIVO!!!!').then(() => console.log('Message sent!')).catch(err => console.error('Error sending message:', err));
  } 
  await Play.onIdle();  
});

client.on('messageCreate', async (message) => {
  if(message.content.match("!comandos")){
    message.reply("Lista de comandos com ! na frente: play 'url completa/titulo do vídeo', next, list, restart")
  }
  if (message.content.match('!play')) {
    if(Play.isPlaying()){  
      message.reply("Entrou para a fila, para ver a fila digite: !list");    
      Play.enqueue(message)
    }else{
      console.time("Tempo para TocaFita")
      message.reply("Recebi a música e já retorno ela seu ansioso.")
      //Play.enqueue(message);
      Play.TocaFita(message);
      console.timeEnd("Tempo para TocaFita")
    }
  }
  if (message.content.match('!op')) {
    if(Play.isPlaying()){      
      console.log(Play.enqueue(message))
    }else{
      PlayOnline.TocaFitaOnline(message);
    }
  }
  if(message.content.match("!next")){
    Funcoes.debug("objMessage", message.toString())
    Play.tocaProxima(message);
  }
  if(message.content.match("!list")){
    console.log(message);
    Play.listQueue(message);
  }
  if(message.content.match("!restart")){
    Funcoes.debug("objMessage", message.toString())
    Funcoes.Shutdown(message)
  }
});

//client.login(obj.DISCORD_BOT_ID);


