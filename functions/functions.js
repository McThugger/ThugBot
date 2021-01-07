const Discord = require('discord.js');
require('mongoose');
const functions = require('../functions/functions.js');
const Prefix = require('../models/prefix');
const Suffix = require('../models/suffix');
const Listitem = require('../models/listitem');
const Items = require('../models/items');
const Users = require('../models/users');
const config = require('../config.json');
const { isValidObjectId } = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 
const Canvas = require('canvas');
const { updateOne } = require('../models/users');
const bot = new Discord.Client();


//Functions for use stored here to be kept tidy
module.exports = {
getitems: async function (type, sort, guildid) {
    //get itemlist for boss list command
    if( type === "items" ) {
        return await Listitem.find({serverID: guildid}).sort(sort);
    } else if ( type === "prefix" ) {
        return await Prefix.find({serverID: guildid}).sort(sort);
    } else if ( type === "suffix" ) {
        return await Suffix.find({serverID: guildid}).sort(sort);
    }
},
backpack: async function (server, owner, sort) {
    if (!sort) {
        return await Items.find({serverID: server, ownerID: owner}).sort([['rarity','ascending']]);
    } else {
        return await Items.find({serverID: server, ownerID: owner}).sort([[sort,'descending']]);
    }
},
async chooseweighteditem (server, items, chances) {
    var sum = chances.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    chances = chances.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    itemname = items[chances.filter(el => el <= rand).length];
    return await Listitem.findOne({serverID: server, name: itemname});
},
async chooseweightedsuffix (server, items, chances) {
    var sum = chances.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    chances = chances.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    itemname = items[chances.filter(el => el <= rand).length];
    return await Suffix.findOne({serverID: server, name: itemname});
},
async chooseweightedprefix (server, items, chances) {
    var sum = chances.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    chances = chances.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    itemname = items[chances.filter(el => el <= rand).length];
    return await Prefix.findOne({serverID: server, name: itemname});
},
async getitem (server, owner, itemid) {
    if(!isValidObjectId(itemid)) {
        return
    }
    let item = await Items.findById(itemid);
    if ( item.ownerID === owner){
        return item;
    } else {
        return
    }
},
async getprefix (server) {
    let prefixes = await Prefix.find({serverID: server});
    var prefixnames = [];
    var prefixchance = [];

    for ( i = 0; i < prefixes.length; i++) {
        prefixnames[i] = prefixes[i].name;
        prefixchance[i] = prefixes[i].rarity;
    }
    var sum = prefixchance.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    prefixchance = prefixchance.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    itemname = prefixnames[prefixchance.filter(el => el <= rand).length];

    return await Prefix.findOne({serverID: server, name: itemname});

},
async getsuffix (server) {
    let suffixes = await Suffix.find({serverID: server});
    var suffixnames = [];
    var suffixchance = [];

    for ( i = 0; i < suffixes.length; i++) {
        suffixnames[i] = suffixes[i].name;
        suffixchance[i] = suffixes[i].rarity;
    }
    var sum = suffixchance.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    suffixchance = suffixchance.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    itemname = suffixnames[suffixchance.filter(el => el <= rand).length];
    return await Suffix.findOne({serverID: server, name: itemname});
},
async getweapon (server) {
    let listitem = await Listitem.find({serverID: server});
    var itemnames = [];
    var itemchance = [];

    for ( i = 0; i < listitem.length; i++) {
        itemnames[i] = listitem[i].name;
        itemchance[i] = listitem[i].rarity;
    }
    var sum = itemchance.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    itemchance = itemchance.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    itemname = itemnames[itemchance.filter(el => el <= rand).length];
    return await Listitem.findOne({serverID: server, name: itemname});
},
createitem: async (owner, server, item, prefix, suffix) => {
    const name = prefix.name + " " + item.name + " of the " + suffix.name;
    const attack = prefix.attack + item.attack + suffix.attack + Math.floor((Math.random() * 2) - 1);
    const defense = prefix.defense + item.defense + suffix.defense + Math.floor((Math.random() * 2) - 1);
    const stealth = prefix.stealth + item.stealth + suffix.stealth + Math.floor((Math.random() * 2) - 1);
    const reputation = prefix.reputation + item.reputation + suffix.reputation + Math.floor((Math.random() * 2) - 1);
    const image = './images/' + (item.name).toLowerCase() + '.png';
    const rarity = (item.rarity + suffix.rarity + prefix.rarity) / 3;

    //creates the item in the mongodb database with above stats
    const newitem = new Items({
        serverID: server,
        name: name,
        rarity: rarity,
        attack: attack,
        defense: defense,
        stealth: stealth,
        reputation: reputation,
        ownerID: owner,
        image: image
    });
    newitem.save().catch(err => console.log(err)); //save item in database
    //creates the embed for the new item to show in discord, returns the embed.
    let embed = new Discord.MessageEmbed();
    if (rarity <= 5) {
        embed.setColor('#ffb833');
        embed.setTitle('Legendary: ' + name);
    } else if (rarity <= 10) {
        embed.setColor('#d133ff');
        embed.setTitle('Epic: ' + name);
    } else if (rarity <= 20) {
        embed.setColor('#0fbb33');
        embed.setTitle('Uncommon: ' + name);
    } else if (rarity <= 50) {
        embed.setColor('#FFFFFF');
        embed.setTitle('Common: ' + name);
    } else {
        embed.setColor('#8a8a8a');
        embed.setTitle('Junk: ' + name);
    }
    embed.addFields(
        { name: "Attack", value: attack, inline: true },
        { name: "Defense", value: defense, inline: true },
        { name: "Stealth", value: stealth, inline: true },
        { name: "Reputation", value: reputation, inline: true },
        { name: "Rarity", value: Math.round(rarity), inline: true },
        { name: "Owner", value: "<@" + owner + ">", inline: true });
    const attachment = new Discord.MessageAttachment(('./images/' + item.name + '.png'), 'img.png');
    embed.attachFiles(attachment);
    embed.setThumbnail('attachment://img.png');

    return embed;
},
async getside (roles) {
    if (roles.cache.find( r => r.name === "East Side")) {
        let side = "eastside"
        return side;
    } else if (roles.cache.find( r => r.name === "West Side")) {
        let side =  "westside"
        return side;
    } else {
        let side =  "newbitch"
        return side;
    }

},
async equippedweapon (user, server) {
    let weapon = await Users.findOne({serverID: server, userID: user});
    if ( weapon.weapon === "0" ) {
        return "None"
    } else {
        console.log(weapon.weapon)
        let item = await Items.findById(weapon.weapon);
        return item;
    }
},
bestitems: async function (server, sort) {
    if (!sort) {
        return await Items.find({serverID: server}).sort([['rarity','ascending']]);
    } else {
        return await Items.find({serverID: server}).sort([[sort,'descending']]);
    }
},
async levelup (user, server, useravatar) {

    const applyText = (canvas, text) => {
        const ctx = canvas.getContext('2d');
      
        // Declare a base size of the font
        let fontSize = 70;
      
        do {
          // Assign the font to the context and decrement it so it can be measured again
          ctx.font = `${fontSize -= 10}px sans-serif`;
          // Compare pixel width of the text to the canvas minus the approximate avatar size
        } while (ctx.measureText(text).width > canvas.width - 300);
      
        // Return the result to use in the actual canvas
        return ctx.font;
      };
    
      const canvas = Canvas.createCanvas(800, 200);
        const ctx = canvas.getContext('2d');
        let userinfo = await Users.findOne({serverID: server, userID: user.id});
        const background = await Canvas.loadImage('./images/' + userinfo.side + '.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    
        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
        ctx.font = applyText(canvas, `${user.username}!`);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${user.username}!`, canvas.width / 3.75, canvas.height / 3.5);

        ctx.font = '34px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('You just levelled up!', canvas.width / 3.75, canvas.height / 1.8);
        
    

        ctx.font = applyText(canvas, `${user.username}!`);
        ctx.fillstyle = '#ffffff';
        ctx.fillText('Level ' + `${userinfo.currentlevel + 1}`, canvas.width / 3.75, canvas.height / 1.1)
    
        // Pick up the pen
        ctx.beginPath();
        // Start the arc to form a circle
        ctx.arc(100, 100, 90, 0, Math.PI * 2, true);
        // Put the pen down
        ctx.closePath();
        // Clip off the region you drew on
        ctx.clip();
        const avatar = await Canvas.loadImage(useravatar);
        ctx.drawImage(avatar, 0, 0, 200, 200);
    
      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'levelupimg.png');

      let nextlevelexp = Math.floor(userinfo.nextlevelexp*1.25);
      let hpinc = Math.floor(userinfo.maxhp)*0.25;
      await Users.updateOne({serverID: server, userID: user.id},{$inc: {currentlevel: 1, nextlevelexp: nextlevelexp, maxhp: hpinc}});
      await Users.updateOne({serverID: server, userID: user.id},{currenthp: userinfo.maxhp + hpinc});

      return attachment;
    },
    async stamRefresh(serverID) {
        return await Users.updateMany({serverID: serverID},{stamina: 100});
    },
    async thuginfo(user, server, useravatar) {
        const applyText = (canvas, text) => {
            const ctx = canvas.getContext('2d');
          
            // Declare a base size of the font
            let fontSize = 20;
          
            do {
              // Assign the font to the context and decrement it so it can be measured again
              ctx.font = `${fontSize -= 10}px sans-serif`;
              // Compare pixel width of the text to the canvas minus the approximate avatar size
            } while (ctx.measureText(text).width > canvas.width - 300);
          
            // Return the result to use in the actual canvas
            return ctx.font;
          };
          const canvas = Canvas.createCanvas(420, 600);
        const ctx = canvas.getContext('2d');
        let userinfo = await Users.findOne({serverID: server, userID: user.id});
        const background = await Canvas.loadImage('./images/thuginfo.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    
        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
        ctx.font = '20px sans-serif'
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${user.username}`, 230,72.5,160);
        if(userinfo.side = "westside") {
            ctx.fillText("West Side", 230,132.5,160);
        } else if(userinfo.side = "eastside") {
            ctx.fillText("East Side", 230,132.5,160);
        }

        ctx.fillText(`${userinfo.attack}`,130,252.5);
        ctx.fillText(`${userinfo.defense}`,130,292.5);
        ctx.fillText(`${userinfo.stealth}`,130,332.5);
        ctx.fillText(`${userinfo.reputation}`,130,372.5);
        
        var healthpercent = userinfo.currenthp / userinfo.maxhp;
        var exppercent = userinfo.currentexp / userinfo.nextlevelexp;
        var stampercent = userinfo.stamina / 100;
        //bar for health
        var startx = 300;
        var starty = 240;
        var radius = 10;
        var barwidth = 100;
        ctx.beginPath();
        ctx.moveTo(startx,starty);
        if (healthpercent < 0.1) {
            var firstpixels = healthpercent*100;
            ctx.arc(startx + 10, starty,radius,Math.PI,Math.PI+Math.acos((10-firstpixels)/10));
            ctx.lineTo(startx + firstpixels,starty + 20 - (10-Math.sqrt(10*10-(10-firstpixels)*(10-firstpixels))));
            ctx.arc(startx + 10, starty+10,radius,Math.PI/2 + Math.asin((10-firstpixels)/10),Math.PI)
        } else if(healthpercent == 1) {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            ctx.lineTo(startx + 90, starty - 10);
            ctx.arcTo(startx + 100,starty - 10,startx + 100, starty, radius);
            ctx.lineTo(startx + 100, starty + 10);
            ctx.arcTo(startx + 100, starty + 20,startx + 90, starty + 20, radius);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        } else if (healthpercent > 0.9) {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            var lastpixels = (1-healthpercent)*100;
            console.log(lastpixels)
            ctx.lineTo(startx + 90, starty - 10);
            ctx.arc(startx + 90, starty,radius,Math.PI*1.5,Math.PI*1.5 + Math.asin(lastpixels/10));
            ctx.lineTo(startx + 90 + lastpixels, starty + 10 + Math.sqrt(10*10 - lastpixels*lastpixels));
            ctx.arc(startx + 90,starty + 10,radius,Math.acos(lastpixels/10),Math.PI/2);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        } else {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            ctx.lineTo(startx + barwidth*healthpercent,starty - 10);
            ctx.lineTo(startx+barwidth*healthpercent, starty + 20);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        }

        ctx.lineTo(startx,starty);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
        ctx.font = '15px sans-serif'
        ctx.fillStyle = "white";
        ctx.fillText(`${userinfo.currenthp}` + "/" + `${userinfo.maxhp}`,310,250,80);
        //bar for stamina
        var startx = 300;
        var starty = 280;
        var radius = 10;
        var barwidth = 100;
        ctx.beginPath();
        ctx.moveTo(startx,starty);
        if (stampercent < 0.1) {
            var firstpixels = stampercent*100;
            ctx.arc(startx + 10, starty,radius,Math.PI,Math.PI+Math.acos((10-firstpixels)/10));
            ctx.lineTo(startx + firstpixels,starty + 20 - (10-Math.sqrt(10*10-(10-firstpixels)*(10-firstpixels))));
            ctx.arc(startx + 10, starty+10,radius,Math.PI/2 + Math.asin((10-firstpixels)/10),Math.PI)
        } else if(stampercent == 1) {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            ctx.lineTo(startx + 90, starty - 10);
            ctx.arcTo(startx + 100,starty - 10,startx + 100, starty, radius);
            ctx.lineTo(startx + 100, starty + 10);
            ctx.arcTo(startx + 100, starty + 20,startx + 90, starty + 20, radius);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        } else if (stampercent > 0.9) {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            var lastpixels = (1-stampercent)*100;
            console.log(lastpixels)
            ctx.lineTo(startx + 90, starty - 10);
            ctx.arc(startx + 90, starty,radius,Math.PI*1.5,Math.PI*1.5 + Math.asin(lastpixels/10));
            ctx.lineTo(startx + 90 + lastpixels, starty + 10 + Math.sqrt(10*10 - lastpixels*lastpixels));
            ctx.arc(startx + 90,starty + 10,radius,Math.acos(lastpixels/10),Math.PI/2);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        } else {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            ctx.lineTo(startx + barwidth*stampercent,starty - 10);
            ctx.lineTo(startx+barwidth*stampercent, starty + 20);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        }

        ctx.lineTo(startx,starty);
        ctx.fillStyle = "orange";
        ctx.fill();
        ctx.closePath();
        ctx.font = '15px sans-serif'
        ctx.fillStyle = "white";
        ctx.fillText(`${userinfo.stamina}` + "/100",310,290,80);
        //bar for experience
        var startx = 300;
        var starty = 320;
        var radius = 10;
        var barwidth = 100;
        ctx.beginPath();
        ctx.moveTo(startx,starty);
        if (exppercent < 0.1) {
            var firstpixels = exppercent*100;
            ctx.arc(startx + 10, starty,radius,Math.PI,Math.PI+Math.acos((10-firstpixels)/10));
            ctx.lineTo(startx + firstpixels,starty + 20 - (10-Math.sqrt(10*10-(10-firstpixels)*(10-firstpixels))));
            ctx.arc(startx + 10, starty+10,radius,Math.PI/2 + Math.asin((10-firstpixels)/10),Math.PI)
        } else if(exppercent == 1) {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            ctx.lineTo(startx + 90, starty - 10);
            ctx.arcTo(startx + 100,starty - 10,startx + 100, starty, radius);
            ctx.lineTo(startx + 100, starty + 10);
            ctx.arcTo(startx + 100, starty + 20,startx + 90, starty + 20, radius);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        } else if (exppercent > 0.9) {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            var lastpixels = (1-exppercent)*100;
            console.log(lastpixels)
            ctx.lineTo(startx + 90, starty - 10);
            ctx.arc(startx + 90, starty,radius,Math.PI*1.5,Math.PI*1.5 + Math.asin(lastpixels/10));
            ctx.lineTo(startx + 90 + lastpixels, starty + 10 + Math.sqrt(10*10 - lastpixels*lastpixels));
            ctx.arc(startx + 90,starty + 10,radius,Math.acos(lastpixels/10),Math.PI/2);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        } else {
            ctx.arcTo(startx,starty - radius,startx + radius,starty - radius,radius);
            ctx.lineTo(startx + barwidth*exppercent,starty - 10);
            ctx.lineTo(startx+barwidth*exppercent, starty + 20);
            ctx.lineTo(startx + 10, starty +20);
            ctx.arcTo(startx, starty+20,startx,starty + 10, radius);
        }

        ctx.lineTo(startx,starty);
        ctx.fillStyle = "lightblue";
        ctx.fill();
        ctx.closePath();
        ctx.font = '15px sans-serif'
        ctx.fillStyle = "white";
        ctx.fillText(`${userinfo.currentexp}` + "/" + `${userinfo.nextlevelexp}`,310,330,80);
        ctx.fillStyle = "white";
        var fontSize = 20;

        do{
            fontSize--;
            ctx.font = fontSize+'px sans-serif';
        } while(ctx.measureText(`${userinfo.gangname}`).width > 160)

        ctx.fillText(`${userinfo.gangname}`,230,192.5,160);
        

        // Pick up the pen
        ctx.beginPath();
        ctx.moveTo(30,40);
        ctx.arcTo(30,30,40,30,10);
        ctx.lineTo(180,30);
        ctx.arcTo(190,30,190,40,10);
        ctx.lineTo(190,180);
        ctx.arcTo(190,190,180,190,10);
        ctx.lineTo(40,190);
        ctx.arcTo(30,190,30,180,10);
        ctx.lineTo(30,40);
        ctx.closePath();
        const avatar = await Canvas.loadImage(useravatar);
        ctx.drawImage(avatar, 30, 30, 160, 160);
        
        ctx.beginPath();
        ctx.moveTo(30,430);
        ctx.arcTo(30,420,40,420,10);
        ctx.lineTo(120,420);
        ctx.arcTo(130,420,130,430,10);
        ctx.lineTo(130,510);
        ctx.arcTo(130,520,120,520,10);
        ctx.lineTo(30,520,30,510,10);
        ctx.lineTo(30,430);
        ctx.closePath();
        ctx.font = '16px sans-serif'
        if(userinfo.weapon == "0") {
            const weaponimage = await Canvas.loadImage('./images/fists.png')
            ctx.drawImage(weaponimage,30,420,100,100);
            ctx.fillText("0",260,425);
            ctx.fillText("0",260,455);
            ctx.fillText("0",260,485);
            ctx.fillText("0",260,515);
        } else {
            let item = await Items.findById(userinfo.weapon);
            const weaponimage = await Canvas.loadImage(item.image);
            ctx.drawImage(weaponimage,32,420,100,100);
            ctx.fillText(item.attack,260,425);
            ctx.fillText(item.defense,260,455);
            ctx.fillText(item.stealth,260,485);
            ctx.fillText(item.reputation,260,515);
            ctx.font = '15px sans-serif'
            ctx.fillStyle = "white";
            ctx.fillText(`${item.name}`,30,565,360);
        }


        

      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'levelupimg.png');
      return attachment;
    }
}