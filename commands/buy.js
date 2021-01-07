const Discord = require('discord.js');
require('mongoose');
const Prefix = require('../models/prefix');
const Suffix = require('../models/suffix');
const Listitem = require('../models/listitem');
const Users = require('../models/users.js');
const Prices = require('../models/prices.js');
const functions = require('../functions/functions');

module.exports.run = async (bot, message, args) => {
  //this is where the actual code for the command goes
  const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]
  const userinfo = await Users.findOne({serverID: message.guild.id, userID: message.author.id});
  const priceinfo = await Prices.findOne({serverID: message.guild.id});
  console.log("here")
  if(userinfo.dead > message.createdTimestamp) {
    return message.channel.send("You are dead ... you can't buy shit!")
  }

  if(userinfo.money >= priceinfo.weapon) {
    var item = await functions.getweapon(message.guild.id);
    console.log(item)
    var prefix = await functions.getprefix(message.guild.id);
    console.log(prefix)
    var suffix = await functions.getsuffix(message.guild.id);
    console.log(suffix)
    embed = await functions.createitem(message.author.id, message.guild.id, item, prefix, suffix); 
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc:{ money: -1*(priceinfo.weapon)}});  
    message.channel.send(embed)
  }
}
//name this whatever the command name is.
module.exports.help = {
  name: "buy"
}
