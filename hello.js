const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'hello',
  fromMe: false, // true if only the bot owner can use it
  desc: 'Replies with a greeting',
  type: 'fun',
}, async (message, match) => {
  await message.reply(`Hello 👋, ${config.OWNER_NAME || 'friend'}! This is your custom plugin.`);
});
