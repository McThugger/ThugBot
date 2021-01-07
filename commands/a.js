const Discord = require('discord.js');
require('mongoose');
const functions = require('../functions/functions')
const Users = require('../models/users');
const Gangwar = require('../models/gangwar');
const Prices = require('../models/prices');
const Items = require('../models/items');
const config = require('../config.json');

module.exports.run = async (bot, message, args) => {
  //this is where the actual code for the command goes
  const commands = message.content.slice(1).trim().split(/ +/g); //splits message content into individual sections, call with commands[x]
  let userinfo = await Users.findOne({serverID: message.guild.id, userID: message.author.id});

  let weaponinfo = await Items.findById(userinfo.weaponinfo)
  let targetinfo = await Users.findOne({serverID: message.guild.id, userID: message.mentions.users.first()});
  let pricesinfo = await Prices.findOne({serverID: message.guild.id})
  let randomchance = Math.floor(Math.random() * 100);

  if(commands[1] === "patrol") {
    if(userinfo.stamina < pricesinfo.patrol) {
        return message.channel.send("You don't have enough stamina!")
    } else {
        message.channel.send("You just patrolled your turf like a badass looking for snitches and scored " + userinfo.defense +" points for your side!");
        await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {stamina: (-1)*pricesinfo.patrol, attacks: userinfo.defense}})
        if(userinfo.side === "westside") {
            await Gangwar.updateOne({serverID: message.guild.id},{$inc: {westpoints: userinfo.defense}});          
        } else if(userinfo.side === "eastside") {
            await Gangwar.updateOne({serverID: message.guild.id},{$inc: {eastpoints: userinfo.defense}})
        }
        if(randomchance <= 7 ){
            message.channel.send("You caught a snitch on your turf, you gained 1 defense, some exp and the other side lost " + randomchance*userinfo.defense + " points!");
            await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: { defense: 1 , currentexp: 1}});
            if(userinfo.side === "westside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {eastpoints: (-1)*userinfo.defense}})
            } else if (userinfo.side === "eastside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {westpoints: (-1)*userinfo.defense}})
            }
            if(userinfo.currentexp + 1 === userinfo.nextlevelexp) {
                let useravatar = bot.guilds.resolve(message.guild.id).members.resolve(message.author.id).user.avatarURL({ format: 'jpg' })
                let attachment = await functions.levelup(message.author,message.guild.id,useravatar);
                message.channel.send("Level up!", attachment);
            }
        }

    }
    }   
    if(commands[1] === "steal") {
        if(userinfo.stamina < pricesinfo.steal) {
            return message.channel.send("You don't have enough stamina!")
        } else {
            message.channel.send("You just pinched a sweet ride from the other gangs turf and gained " + userinfo.stealth +" points for your side!");
            await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {stamina: (-1)*pricesinfo.steal, attacks: userinfo.stealth}})
            if(userinfo.side === "westside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {westpoints: userinfo.stealth}});          
            } else if(userinfo.side === "eastside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {eastpoints: userinfo.stealth}})
            }
            if(randomchance <=7 ){
                message.channel.send("The ride you jacked had a weapon in the back!  You gain 1 stealth and ... ");
                await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: { stealth: 1 , currentexp: 1 }});
                var item = await functions.getweapon(message.guild.id);
                console.log(item)
                var prefix = await functions.getprefix(message.guild.id);
                console.log(prefix)
                var suffix = await functions.getsuffix(message.guild.id);
                console.log(suffix)
                embed = await functions.createitem(message.author.id, message.guild.id, item, prefix, suffix); 
                message.channel.send(embed)
            }
        }
    
    }
    if(commands[1] === "driveby") {
        if(userinfo.stamina < pricesinfo.driveby) {
            return message.channel.send("You don't have enough stamina!")
        } else {
            message.channel.send("You did a drive by in enemy territory and scored " + userinfo.attack + " points for your side!");
            await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {stamina: (-1)*pricesinfo.driveby, attacks: userinfo.attack}})
            if(userinfo.side === "westside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {westpoints: userinfo.attack}});          
            } else if(userinfo.side === "eastside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {eastpoints: userinfo.attack}})
            }
            if(randomchance <=7 ){
                message.channel.send("You took down a gang leader in the drive by!  You gain 1 attack and some " + randomchance*2 + " exp!");
                await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: { attack: 1 , currentexp: randomchance*2}});
                if(userinfo.currentexp + randomchance*2 >= userinfo.nextlevelexp) {
                    let useravatar = bot.guilds.resolve(message.guild.id).members.resolve(message.author.id).user.avatarURL({ format: 'jpg' })
                    let attachment = await functions.levelup(message.author,message.guild.id,useravatar);
                    message.channel.send("Level up!", attachment);
                }
            }
    
        }
    }
    if(commands[1] === "cruise") {
        if(userinfo.stamina < pricesinfo.cruise) {
            return message.channel.send("You don't have enough stamina!")
        } else {
            message.channel.send("You just cruised through enemy turf like a badass and scored " + userinfo.reputation + " points for your side!");
            await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {stamina: (-1)*pricesinfo.cruise, attacks: userinfo.reputation}})
            if(userinfo.side === "westside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {westpoints: userinfo.reputation}});          
            } else if(userinfo.side === "eastside") {
                await Gangwar.updateOne({serverID: message.guild.id},{$inc: {eastpoints: userinfo.reputation}})
            }
            if(randomchance <= 7 ){
                message.channel.send("You drove right up to the bosses mansion and flipped them off!  You gain 1 reputation, " + randomchance*2 + " exp and this action cost no stamina!");
                await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: { reputation: 1 , currentexp: randomchance*2, stamina: pricesinfo.cruise}});
                if(userinfo.currentexp + randomchance*2 >= userinfo.nextlevelexp) {
                    let useravatar = bot.guilds.resolve(message.guild.id).members.resolve(message.author.id).user.avatarURL({ format: 'jpg' })
                    let attachment = await functions.levelup(message.author,message.guild.id,useravatar);
                    message.channel.send("Level up!", attachment);
                }
            }
    
        }
    }
}

//name this whatever the command name is.
module.exports.help = {
  name: "a"
}
