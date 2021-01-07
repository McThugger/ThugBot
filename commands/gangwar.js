const Discord = require('discord.js');
const mongoose = require('mongoose');
const Users = require('../models/users');
const Gangwar = require('../models/gangwar');
const config = require('../config.json');

module.exports.run = async (bot, message, args) => {
		if((message.channel.id !== config.gangwar) && (message.channel.id !== config.eastside) && (message.channel.id !== config.westside)) {
		await message.delete()
		return
	} else {
  //this is where the actual code for the command goes
  const gangwar = await Gangwar.findOne({serverID: message.guild.id});
  const swingpercent = Math.floor((gangwar.eastpoints / (gangwar.eastpoints + gangwar.westpoints))*100)/5
   if( swingpercent < 10 ) {
			bar = "East Side |" + "⛉".repeat(swingpercent) + "🡄".repeat(20-swingpercent) + "| West Side"
		} else if (swingpercent > 10 ) {
			bar = "East Side |" + "🡆".repeat(swingpercent) + "⛉".repeat(20-swingpercent) + "| West Side"

		} else if (swingpercent === 10 ){
			bar = "East Side |" + "🡆".repeat(swingpercent) + "🡄".repeat(20-swingpercent) + "| West Side"
		}
  const embed = new Discord.MessageEmbed()
    .setColor('#000000')
    .setTitle("Current GangWar Status")
    .addFields(
        {name: "East Side Points", value: gangwar.eastpoints, inline: true},
        {name: "West Side Points", value: gangwar.westpoints,  inline: true},
        {name: "Swing", value: bar},
    ) 
    message.channel.send(embed)

}}
//name this whatever the command name is.
module.exports.help = {
  name: "gangwar"
}