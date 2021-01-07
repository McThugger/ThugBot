const Discord = require('discord.js');
require('mongoose');
const Users = require('../models/users');
const Prefix = require('../models/prefix');
const Suffix = require('../models/suffix');
const Listitem = require('../models/listitem');
const Prices = require('../models/prices');
const functions = require('../functions/functions.js');
const { DiscordAPIError } = require('discord.js');

module.exports.run = async (bot, message, args) => {
//this is where the actual code for the command goes
const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]

let userinfo = await Users.findOne({serverID: message.guild.id, userID: message.author.id});
let targetinfo = await Users.findOne({serverID: message.guild.id, userID: message.mentions.users.first()});
let pricesinfo = await Prices.findOne({serverID: message.guild.id})

if( commands[1] === "info") {
  let embed = new Discord.MessageEmbed()
  let weapon = await functions.equippedweapon(message.author.id, message.guild.id);


    let useravatar = bot.guilds.resolve(message.guild.id).members.resolve(message.author.id).user.avatarURL({ format: 'jpg' })
    let attachment = await functions.thuginfo(message.author,message.guild.id, useravatar);
    message.channel.send("ThugInfo:", attachment);
}

if( commands[1] === "addstat" ) {
  if (userinfo.sparepoints <= 0) {
    return message.channel.send("You don't have any spare points to distribute!")
  } else if (commands[2] !== "attack" && commands[2] !== "defense" && commands[2] !== "stealth" && commands[2] !== "reputation") {
    return message.channel.send(commands[2] + " is not a valid stat")
  } else if (isNaN(commands[3])) {
    return message.channel.send(commands[3] + " is not a valid number")
  } else if (commands[3] > userinfo.sparepoints) {
    return message.channel.send("You do not have " + commands[3] + " spare points to allocate")
  } else {
    if(commands[2] === "attack") {
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {attack: commands[3]}})
    message.channel.send("You just gained " + commands[3] + " attack!");
  } if(commands[2] === "defense") {
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {defense: commands[3]}})
    message.channel.send("You just gained " + commands[3] + " defense!");
  } if(commands[2] === "stealth") {
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {stealth: commands[3]}})
    message.channel.send("You just gained " + commands[3] + " stealth!");
  } if(commands[2] === "reputation") {
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {reputation: commands[3]}})
    message.channel.send("You just gained " + commands[3] + "  reputation!");
  }
}
}
}
//name this whatever the command name is.
module.exports.help = {
  name: "user"
}
