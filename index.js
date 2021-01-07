const Discord = require("discord.js")
const config = require("./config.json")
const bot = new Discord.Client();
const fs = require("fs");
const mongoose = require("mongoose");
const functions = require('./functions/functions');
const Canvas = require('canvas');

bot.mongoose = require('./utils/mongoose');

bot.mongoose.init();
bot.login();

const Users = require("./models/users.js")
const Prices = require("./models/prices.js")

bot.commands = new Discord.Collection();
if(config.token === "setmeplease") return console.log("Set your token up! Go to https://www.discordapp.com/developers and generate a token from a bot user.");

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

jsfile.forEach((f, i) =>{
  let props = require(`./commands/${f}`);
  console.log(`${f} loaded!`);
  bot.commands.set(props.help.name, props);
});

});
var NOTIFY_CHANNEL;
const START_DATE = '2018-08-04'; // Date used as the starting point for multi-hour intervals, must be YYYY-MM-DD format
const START_HOUR = 0; // Hour of the day when the timer begins (0 is 12am, 23 is 11pm), used with START_DATE and INTERVAL_HOURS param
const INTERVAL_HOURS = 0; // Trigger at an interval of every X hours
const TARGET_MINUTE = 10; // Minute of the hour when the chest will refresh, 30 means 1:30, 2:30, etc.
const OFFSET = 5; // Notification will warn that the target is X minutes away

const NOTIFY_MINUTE = (TARGET_MINUTE < OFFSET ? 60 : 0) + TARGET_MINUTE - OFFSET;
const START_TIME = new Date(new Date(START_DATE).getTime() + new Date().getTimezoneOffset() * 60000 + START_HOUR * 3600000).getTime();

bot.on("ready", () => {
  console.log(bot.user.username + " is online.")
  NOTIFY_CHANNEL = bot.channels.cache.get(config.gangwar); // Channel to send notification
  setInterval(function() {
    var d = new Date();
    if(Math.floor((d.getTime() - START_TIME) / 3600000) % INTERVAL_HOURS > 0) return; //return if hour is not the correct interval
    if(d.getMinutes() === NOTIFY_MINUTE) return NOTIFY_CHANNEL.send('The stamina refreshes in ' + OFFSET + ' minutes!'); // Return a warning message before stamina refresh happens
    else if(d.getMinutes() === TARGET_MINUTE) {
      functions.stamRefresh(config.serverID);
      return NOTIFY_CHANNEL.send('Stamina Refreshed!')
  } else if(d.getMinutes() !== NOTIFY_MINUTE) {
    return; // Return if current minute is not the notify minute}, 60 * 1000);
  }
}, 60 * 1000);
});



bot.on("message", async message => {
  //a little bit of data parsing/general checks
  if(message.author.bot) return;
  if(message.channel.type === 'dm') return;
  let content = message.content.split(" ");
  let command = content[0];
  let args = content.slice(1);
  let prefix = config.prefix;

  //checks that user exists in database
  let side = await functions.getside(message.member.roles);
  
  await Users.findOne({userID: message.author.id, serverID: message.guild.id}, (err, user) => {

    if(err) console.log(err);
    if(!user){
      const newUser = new Users({
        userID: message.author.id,
        serverID: message.guild.id,
        side: side
      })
      newUser.save().catch(err => console.log(err));
    }
  })
  let moneytoadd = Math.ceil(Math.random() * 5);
  await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{$inc: {money: moneytoadd}});
  await Users.updateOne({serverID: message.guild.id, userID: message.author.id},{side: side});

    //checks if message contains a command and runs it
  if (message.content.startsWith(prefix)) {
  let commandfile = bot.commands.get(command.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);
}})


bot.login(config.token)
