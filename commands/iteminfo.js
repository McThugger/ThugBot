const Discord = require('discord.js');
require('mongoose');
const functions = require('../functions/functions')

module.exports.run = async (bot, message, args) => {
  //this is where the actual code for the command goes
  const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]

}

//name this whatever the command name is.
module.exports.help = {
  name: "iteminfo"
}
