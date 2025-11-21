const { Module } = require('../main');
const axios = require('axios');

Module({
  pattern: 'flirt',
  fromMe: false,
  desc: 'Sends a flirt line, optionally mentioning the replied user',
  type: 'fun',
}, async (message, match) => {
  try {
    const res = await axios.get('https://pickup-lines-api.p.rapidapi.com/random', {
      headers: {
        'X-RapidAPI-Key': 'f0e0df3b41mshd29020f044b00c9p18cb77jsn5caa4b3bf7f0',
        'X-RapidAPI-Host': 'pickup-lines-api.p.rapidapi.com'
      }
    });

    const flirt = res.data.line || "Couldn't fetch a flirt line right now.";

    if (message.reply_message) {
      const target = message.reply_message.sender;
      await message.reply(`😍 @${target} ${flirt}`, { mentions: [message.reply_message.jid] });
    } else {
      await message.reply(`😍 ${flirt}`);
    }
  } catch (err) {
    await message.reply('⚠️ Error fetching flirt line. Try again later.');
  }
});
