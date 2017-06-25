'use strict';


const http = require('http'); // For the recieving server
const Bot = require('@kikinteractive/kik'); // For the Kk client
const config = require('./Config.json'); // For the configs
const request = require('request').defaults({ encoding: null }); // For downloading
const imgur = require('imgur-node-api');
const path = require('path');
const download = require('image-downloader');


// Set up the Imgur API
imgur.setClientID(config.ImgurClientID);


// Random number generator
function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
}


// Configure the bot API endpoint, details for your bot
const bot = new Bot({
    username: config.Username,
    apiKey: config.ApiKey,
    baseUrl: config.BaseURL,
});


bot.updateBotConfiguration();
bot.onTextMessage((message) => {

    // Set up some local variables and logs
    let randomNumber = randint(0x111111, 0xffffff);
    let id = randomNumber.toString(16);

    console.log('Message recieved: ', id);
    console.log(`${id}\tBody: ${message.body}`);
    let body = message.body.toLowerCase();
    let user = body.split(' ');

    // Determine whose profile to get
    if(message.body == "") {
        user = message.from;
    } else {
        user = message.body.split(" ")[0];
    };

    // Remove any invalid characters
    user = user.replace(/[^a-zA-Z0-9-_.]/g, '');

    console.log(`${id}\tUser: ${message.from}`);
    console.log(`${id}\tDownloading: ${user}`);

    // Look at the URL of the user
    let profilUrl = `https://cdn.kik.com/user/pic/${user}/big`;
    console.log(`${id}\t${profilUrl}`)

    // Save the image
    let options = {
        url: profilUrl,
        dest: `ProfilePictures/${user}.png`
    };

    download.image(options)
        .then(({ filename, image }) => {
            console.log('${id}\tFile saved');

            // Upload it all to Imgur
            console.log(`${id}\tImage data saved\n${id}\tUploading to Imgur`);
            imgur.upload(path.join(`ProfilePictures/${user}.png`), function (err, res) {
                console.log(`${id}\t${res.data.link}`);

                // Now send the link to Kik
                bot.send(Bot.Message.picture(res.data.link)
                    .setAttributionName('ProfilePicBot')
                    .setAttributionIcon('http://up.picr.de/12727152hk.jpg'),
                    message.from,
                    message.chatId
                );
            });            
        }).catch((err) => {
            console.log(err);
        });
});


// Set up your server and start listening
console.log('Setting up server.')
var server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);

// bot.send(Bot.Message.picture('http://i.imgur.com/oalyVlU.jpg')
//     .setAttributionName('Imgur')
//     .setAttributionIcon('http://s.imgur.com/images/favicon-96x96.png'),
//     'a.username');
