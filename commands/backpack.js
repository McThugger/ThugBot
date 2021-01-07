const Discord = require('discord.js');
require('mongoose');
const Users = require('../models/users');
const Prefix = require('../models/prefix');
const Suffix = require('../models/suffix');
const Listitem = require('../models/listitem');
const functions = require('../functions/functions');
const Items = require('../models/items');
const { isValidObjectId } = require('mongoose');

module.exports.run = async (bot, message, args) => {
  //this is where the actual code for the command goes
  const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]
  const userinfo = await Users.findOne({userID: message.author.id, serverID: message.guild.id});


  if(commands[1] === "list"){
  let backpack = await functions.backpack(message.guild.id,message.author.id,commands[2]);
  let backpacklist = new Discord.MessageEmbed();
  if( backpack.length <= 10 ) {
   for ( i = 0; i < backpack.length; i++ ) {
     backpacklist.addField(1+i+ ". " + backpack[i].name, "RAR: " + Math.round(backpack[i].rarity) + " | ATK: " + backpack[i].attack + " | DEF: " + backpack[i].defense + " | STL: " + backpack[i].stealth + " | REP: " + backpack[i].reputation + " | ID: " + backpack[i]._id);
   }
  } else if ( backpack.length > 10 ) {
    for (i = 0; i < 10; i++) {
      backpacklist.addField(1+i+ ". " + backpack[i].name, "RAR: " + Math.round(backpack[i].rarity) + " | ATK: " + backpack[i].attack + " | DEF: " + backpack[i].defense + " | STL: " + backpack[i].stealth + " | REP: " + backpack[i].reputation + " | ID: " + backpack[i]._id);
    }
  }
  message.channel.send(backpacklist);
}

if(commands[1] === "equip"){
  if(userinfo.dead > message.createdTimestamp) {
    return message.channel.send("You are dead ... you can't equip shit!")
  }
  if(!commands[2]){
    return message.channel.send("Please include an item ID, eg. '$equip 5f955b7f3ccd845ce06f4c48'")
  } else {
    let item = await functions.getitem(message.guild.id,message.author.id,commands[2]);
    if ( !item ) {
      return message.channel.send("Error in input, you may not own that item, check $backpack list")
    }
  await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{weapon: item._id});

}
}

if(commands[1] === "info") {
  let embed = new Discord.MessageEmbed();
  if(isNaN(commands[2])){
    return message.channel.send("You need to include a number, eg $iteminfo 4.  This will show you details of the 4th rarest item you own.")
  } else {
    let item = await functions.getitem(message.guild.id,message.author.id,commands[2]);
    if ( !item ) {
      return message.channel.send("Error in input, you may not have that many items, check $backpack")
    }
    console.log(item)
    if(item.rarity <= 5) {
      embed.setColor('#ffb833');
      embed.setTitle('Legendary: ' + item.name)
    } else if (item.rarity <= 10) { 
      embed.setColor('#d133ff');
   embed.setTitle('Epic: ' + item.name)
    } else if (item.rarity <= 20) {
     embed.setColor('#0fbb33');
      embed.setTitle('Uncommon: ' + item.name)
    } else if (item.rarity <= 50) {
      embed.setColor('#FFFFFF');
      embed.setTitle('Common: ' + item.name)
    } else {
      embed.setColor('#8a8a8a');
      embed.setTitle('Junk: ' + item.name)
    }
    embed.addFields(
      { name: 'Attack', value: item.attack, inline: true },
      { name: 'Defense', value: item.defense, inline: true },
      { name: 'Stealth', value: item.stealth, inline: true },
      { name: 'Reputation', value: item.reputation, inline: true },
      { name: 'Rarity', value: Math.round(item.rarity*10)/10, inline: true},
      { name: 'Owner', value: "<@" + item.ownerID + ">",inline: true})
    const attachment = new Discord.MessageAttachment((item.image), 'img.png');
    embed.attachFiles(attachment)
    embed.setThumbnail('attachment://img.png')
  message.channel.send(embed);
    }
}

if(commands[1] === "give") {
  //code for giving thugdollas
  if(userinfo.dead > message.createdTimestamp) {
    return message.channel.send("You are dead ... you can't give shit!")
  }

  if (!isNaN(commands[2])){
    if(!message.mentions.users.first()){
      return message.channel.send("You didn't mention a target to give thugdollas to!");
    } else if ( commands[2] < 0 ){
      return message.channel.send("Don't try to cheat you bitch! No sending negatives!")
    } else {
      let userinfo = await Users.findOne({serverID: message.guild.id, userID: message.author.id});
      if ( userinfo.money >= commands[2] ) {
        await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {money: -commands[2]}});
        await Users.updateOne({serverID: message.guild.id, userID: message.mentions.users.first().id},{$inc: {money: commands[2]}});
        return message.channel.send("You just gave <@" + message.mentions.users.first().id + "> " + commands[2] + " thugdollas!");
      }
    }
  }
  //code for giving items
  if(!isValidObjectId(commands[2])){
    return message.channel.send("You didn't input a valid item ID");
  } else if (!message.mentions.users.first()) {
    return message.channel.send("You didn't mention a target to give the item to!");
  } else {
    let item = await functions.getitem(message.guild.id,message.author.id,commands[2]);
    let destination = message.mentions.users.first();
    if( item.ownerID !== message.author.id) {
      return message.channel.send("You can't give away something you don't own!");
    } else {
      await Items.findByIdAndUpdate(commands[2],{ownerID: destination.id});
      message.channel.send("You just gave " + item.name + " to " + "<@" + destination.id + ">");
    }
  }
}

if(commands[1] === "dust") {
  if(!isValidObjectId(commands[2])) {
    return message.channel.send("You didn't input a valid item ID");
  } else {
    let item = await functions.getitem(message.guild.id,message.author.id,commands[2]);
    if( item.ownerID !== message.author.id) {
      return message.channel.send("You can't dust something you don't own!");
    } else {
    let value = Math.floor(1/(item.rarity)*500);
    message.channel.send("You dusted your " + item.name + " for " + value + " dust!  You currently have " + (userinfo.dust + value) + " dust!" )
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {dust: value}});
    await Items.findByIdAndDelete(commands[2])
  }}
}
}
//name this whatever the command name is.
module.exports.help = {
  name: "backpack"
}
