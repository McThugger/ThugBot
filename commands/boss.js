require('discord.js');
require('mongoose');
const Users = require('../models/users');
const Prefix = require('../models/prefix');
const Suffix = require('../models/suffix');
const Listitem = require('../models/listitem');
const Prices = require('../models/prices');
const Gangwar = require('../models/gangwar')
const functions = require('../functions/functions.js');

module.exports.run = async (bot, message, args) => {
  //this is where the actual code for the command goes
  const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]

let userinfo = await Users.findOne({serverID: message.guild.id, userID: message.author.id});

if(message.author.id === '748854088380317706') {
  await Users.updateOne({userID: message.author.id,serverID: message.guild.id},{isBoss: 1});
}

if(userinfo.isBoss === 1) {
  if(commands[1] === "newprefix") {
    const prefix = await Prefix.findOne({
      serverID: message.guild.id,
      name: commands[2]
  }, (err, prefix) => {
      if(err) console.log(err);
      if(!prefix){
        const newprefix = new Prefix({
          serverID: message.guild.id,
          name: commands[2],
          rarity: commands[3],
          attack: commands[4],
          defense: commands[5],
          stealth: commands[6],
          reputation: commands[7]})
        newprefix.save().catch(err => console.log(err));
        }
      }
    )
  }

  if(commands[1] === "setupwar") {
    Gangwar.findOne({
      serverID: message.guild.id
    }, (err, gangwar) => {
      if(err) console.log(err);
      if(!gangwar){
          const newGangwar = new Gangwar({
              serverID: message.guild.id
          })
          newGangwar.save().catch(err => console.log(err));
    return
    }})
    await Gangwar.updateOne({serverID: message.guild.id},{eastpoints: 0, westpoints: 0});
  }



  if(commands[1] === "newsuffix") {
    const suffix = await Suffix.findOne({
      serverID: message.guild.id,
      name: commands[2]
  }, (err, suffix) => {
      if(err) console.log(err);
      if(!suffix){
        const newsuffix = new Suffix({
          serverID: message.guild.id,
          name: commands[2],
          rarity: commands[3],
          attack: commands[4],
          defense: commands[5],
          stealth: commands[6],
          reputation: commands[7]})
        newsuffix.save().catch(err => console.log(err));
        }
      }
    )
  }



  if(commands[1] === "newitem") {
    const item = await Listitem.findOne({
      serverID: message.guild.id,
      name: commands[2]
  }, (err, listitem) => {
      if(err) console.log(err);
      if(!listitem){
        const newitem = new Listitem({
          serverID: message.guild.id,
          name: commands[2],
          rarity: commands[3],
          attack: commands[4],
          defense: commands[5],
          stealth: commands[6],
          reputation: commands[7]})
        newitem.save().catch(err => console.log(err));
        }
      }
    )
  }

//commands for listing items, iterates through the mongoDB for all entries of items, suffixes and prefixes and outputs an ordered list based on the variable as commands[2]

  if(commands[1] === "list") {
    if(!commands[2] || !commands[3]) {
      return message.channel.send("Please specify what to search for")
    }
    var sort = {};
    sort[commands[3]] = -1;
    let itemlist = await functions.getitems(commands[2], commands[3], message.guild.id) // calls getitems function with inputs defined in message plus sends guildid
    let itemStr = "RAR  ATK  DEF  STL  REP  NAME\n";
    for ( i = 0; i < itemlist.length; i++ ) {
      if(itemlist[i].rarity < 10) {
        const formattedrarity = "0" + itemlist[i].rarity;
        itemStr += formattedrarity + " | " + (itemlist[i].attack<0?"":"+") + itemlist[i].attack + " | " + (itemlist[i].defense<0?"":"+") + itemlist[i].defense + " | "  + (itemlist[i].stealth<0?"":"+") + itemlist[i].stealth + " | " +  (itemlist[i].reputation<0?"":"+") + itemlist[i].reputation + " | " + itemlist[i].name + "\n"
      } else {
        const formattedrarity = itemlist[i].rarity;
        itemStr += formattedrarity + " | " + (itemlist[i].attack<0?"":"+") + itemlist[i].attack + " | " + (itemlist[i].defense<0?"":"+") + itemlist[i].defense + " | "  + (itemlist[i].stealth<0?"":"+") + itemlist[i].stealth + " | " +  (itemlist[i].reputation<0?"":"+") + itemlist[i].reputation + " | " + itemlist[i].name + "\n"
      }
      
    }
    message.channel.send("```" + itemStr + "```")
  }


  //command to set up prices initially.

  if(commands[1] === "setupprices") {
    Prices.findOne({
      serverID: message.guild.id
  }, (err, prices) => {
      if(err) console.log(err);
      if(!prices){
          const newPrices = new Prices({
              serverID: message.guild.id
          })
          newPrices.save().catch(err => console.log(err));
      } else {}          
    })
  }
}
}

//name this whatever the command name is.
module.exports.help = {
  name: "boss"
}
