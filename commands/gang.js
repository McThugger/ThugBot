const Discord = require('discord.js');
const bot = new Discord.Client();
require('mongoose');
const Users = require('../models/users');
const Prefix = require('../models/prefix');
const Suffix = require('../models/suffix');
const Listitem = require('../models/listitem');
const Prices = require('../models/prices');
const functions = require('../functions/functions.js');
const Items = require('../models/items');
const config = require('../config.json');
const Canvas = require('canvas');

module.exports.run = async (bot, message, args) => {
//this is where the actual code for the command goes
const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]

//get information from database for commands
let userinfo = await Users.findOne({serverID: message.guild.id, userID: message.author.id});
let targetinfo = await Users.findOne({serverID: message.guild.id, userID: message.mentions.users.first()});
let pricesinfo = await Prices.findOne({serverID: message.guild.id})



//changes sides EAST <==> WEST
if (commands[1] === "switch") {
  if(userinfo.dead > message.createdTimestamp) {
    return message.channel.send("You are dead ... you can't do shit!")
  }
  if (userinfo.money <  pricesinfo.switch ) {
    return message.channel.send("You can't afford " + pricesinfo.switch + " thugdollas!")
  } else if ( userinfo.side === "newbitch" ){
    return message.channel.send("You did not choose a side yet")
  } else {
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {money: -1*pricesinfo.switch}});
    let eastrole = message.guild.roles.cache.find(role => role.name === "East Side");
    let westrole = message.guild.roles.cache.find(role => role.name === "West Side");
   
    if( message.member.roles.cache.find(role => role.name === "East Side")) {
      message.member.roles.remove(eastrole);
      message.member.roles.add(westrole);
      await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{side: "westside"});
      message.channel.send("You just spent " + pricesinfo.switch + " thugdollas to change to the West Side!")
    } else if ( message.member.roles.cache.find(role => role.name === "West Side")) {
      message.member.roles.remove(westrole);
      message.member.roles.add(eastrole);
      await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{side: "eastside"});
      message.channel.send("You just spent " + pricesinfo.switch + " thugdollas to change to the East Side!")
    }
  }
}

if(commands[1] === "bestitems"){
  let bestitems = await functions.bestitems(message.guild.id,commands[2]);
  let bestitemslist = new Discord.MessageEmbed();
  if( bestitems.length <= 10 ) {
   for ( i = 0; i < bestitems.length; i++ ) {
    let user = await bot.users.fetch(bestitems[i].ownerID);
    bestitemslist.addField(1+i+ ". " + bestitems[i].name, "RAR: " + Math.round(bestitems[i].rarity) + " | ATK: " + bestitems[i].attack + " | DEF: " + bestitems[i].defense + " | STL: " + bestitems[i].stealth + " | REP: " + bestitems[i].reputation + " | Owner: " + user.username);
   }
  } else if ( bestitems.length > 10 ) {
    for (i = 0; i < 10; i++) {
      let user = await bot.users.fetch(bestitems[i].ownerID);
      bestitemslist.addField(1+i+ ". " + bestitems[i].name, "RAR: " + Math.round(bestitems[i].rarity) + " | ATK: " + bestitems[i].attack + " | DEF: " + bestitems[i].defense + " | STL: " + bestitems[i].stealth + " | REP: " + bestitems[i].reputation + " | Owner: " + user.username);
    }
  }
  message.channel.send(bestitemslist);
}

if(commands[1] === "hit") {
  if(userinfo.dead > message.createdTimestamp) {
    return message.channel.send("You are dead ... you can't do shit!")
  }
  if(!message.mentions.users.first()) {
    return message.channel.send("You did not include a target!");
  }
  let side = await functions.getside(message.member.roles);
  let targetinfo = await Users.findOne({userID: message.mentions.users.first().id, serverID: message.guild.id}, (err, user) => {
    if(err) console.log(err);
    if(!user){
      const newUser = new Users({
        userID: message.mentions.users.first().id,
        serverID: message.guild.id,
        side: side
      })
      return newUser.save().catch(err => console.log(err));
    }
  })



  if(targetinfo.dead > message.createdTimestamp) {
    return message.channel.send("They're dead already!")
  }
  
  message.channel.send(userinfo.weapon);
  message.channel.send(targetinfo.weapon)
  
  let userweapon = (userinfo.weapon !== "0"?await Items.findById(userinfo.weapon):"0");
  let targetweapon = (targetinfo.weapon !== "0"?await Items.findById(targetinfo.weapon):"0");
  let targettotal = (targetweapon === "0"?targetinfo.attack + targetinfo.defense + targetinfo.stealth + targetinfo.reputation:targetinfo.attack + targetinfo.defense + targetinfo.stealth + targetinfo.reputation + targetweapon.attack + targetweapon.defense + targetweapon.stealth + targetweapon.reputation);
  let defensechance = (targetweapon === "0"?(targetinfo.defense / targettotal):((targetinfo.defense+targetweapon.defense) / targettotal));
  let damageamount = Math.ceil((userinfo.attack + userweapon.attack)*(1-defensechance));
  let leveldiff = targetinfo.currentlevel - userinfo.currentlevel;

  message.channel.send("Damage Amount: " + damageamount + "\n Target Current Health: " + targetinfo.currenthp + "\n Defense Chance: " + defensechance);
  let useravatar = bot.guilds.resolve(message.guild.id).members.resolve(message.author.id).user.avatarURL({ format: 'jpg' })

  if ( targetinfo.currenthp <= damageamount) {
    await Users.updateOne({serverID: message.guild.id, userID: message.mentions.users.first().id},{currenthp: targetinfo.maxhp, dead: (message.createdTimestamp + 60000*config.hitTimeout)});
    let expgain = leveldiff * config.killExperience;
    if ( userinfo.currentexp + expgain >= userinfo.nextlevelexp ) {
      let attachment = await functions.levelup(message.author,message.guild.id, useravatar);
      message.channel.send('You levelled up!', attachment);
      await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {currentexp: expgain}});
    }
    message.channel.send("You attacked and KILLED <@" + message.mentions.users.first().id + ">!");
    await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {currentexp: expgain}});
  } else {
    await Users.updateOne({serverID: message.guild.id, userID: message.mentions.users.first().id},{$inc: {currenthp: -damageamount}});
    message.channel.send("You attacked <@" + message.mentions.users.first().id + "> for " + damageamount + "!")
  }



}

}

//name this whatever the command name is.
module.exports.help = {
  name: "gang"
}
