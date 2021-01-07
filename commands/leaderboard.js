const Discord = require('discord.js');
const mongoose = require('mongoose');
const Users = require('../models/users');

module.exports.run = async (bot, message, args) => {
  //this is where the actual code for the command goes
let westsidedata = await Users.find({serverID: message.guild.id, side: "westside"}).sort([['attacks','descending']]);
let eastsidedata = await Users.find({serverID: message.guild.id, side: "eastside"}).sort([['attacks', 'descending']]);
	let westleaderboardStr = ""
	let eastleaderboardStr = ""	
	let embed = new Discord.MessageEmbed() 
	.setTitle("Gang War Leaderboard")
	
	if (westsidedata.length === 0) {
		embed.setColor("RED");
		embed.addFields({name: "No West data Found", value: "Please attack some mother fuckers!", inline: true});
	} else if ( westsidedata.length < 10 ) {
		embed.setColor = ("BLURPLE");
		for ( i = 0; i < westsidedata.length; i++ ) {
			let member = message.guild.members.cache.get(westsidedata[i].userID) || "User Left";
			if ( member === "User Left") {
				westleaderboardStr += "" + (i+1) + ". **" + member + "** : " + westsidedata[i].attacks + " \n"
			} else {
				westleaderboardStr += "" + (i+1) + ". **" + member.user.username + "** : " + westsidedata[i].attacks + " \n"
			}
		}
		embed.addFields({name: "West", value: westleaderboardStr, inline:true});
	} else {
		embed.setColor = ("BLURPLE");
		for ( i = 0; i < 10; i++ ) {
			let member = message.guild.members.cache.get(westsidedata[i].userID) || "User Left";
			if ( member === "User Left") {
				westleaderboardStr += "" + (i+1) + ". **" + member + "** : " + westsidedata[i].attacks + " \n"
			} else {
				westleaderboardStr += "" + (i+1) + ". **" + member.user.username + "** : " + westsidedata[i].attacks + " \n"
			}
		}
		embed.addFields({name: "West", value: westleaderboardStr, inline:true});
	}
	if (eastsidedata.length === 0) {
		embed.addFields({name: "No East data Found", value: "Please attack some mother fuckers!", inline: true});
	} else if ( eastsidedata.length < 10 ) {
		embed.setColor = ("BLURPLE");
		for ( i = 0; i < eastsidedata.length; i++ ) {
			let member = message.guild.members.cache.get(eastsidedata[i].userID) || "User Left";
			if ( member === "User Left") {
				eastleaderboardStr += "" + (i+1) + ". **" + member + "** : " + eastsidedata[i].attacks + " \n"
			} else {
				eastleaderboardStr += "" + (i+1) + ". **" + member.user.username + "** : " + eastsidedata[i].attacks + " \n"
			}
		}
		embed.addFields({name: "East", value: eastleaderboardStr, inline:true});
	} else {
		for ( i = 0; i < 10; i++ ) {
			let member = message.guild.members.cache.get(eastsidedata[i].userID) || "User Left";
			if ( member === "User Left") {
				eastleaderboardStr += "" + (i+1) + ". **" + member + "** : " + eastsidedata[i].attacks + " \n"
			} else {
				eastleaderboardStr += "" + (i+1) + ". **" + member.user.username + "** : " + eastsidedata[i].attacks + " \n"
			}
		}
		embed.addFields({name: "East", value: eastleaderboardStr, inline:true});
	}
	message.channel.send(embed);
}
//name this whatever the command name is.
module.exports.help = {
  name: "leaderboard"
}