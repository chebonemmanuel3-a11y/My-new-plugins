const { Module } = require('../main');
const config = require('../config');

Module({
  pattern: 'time',
  fromMe: false,
  desc: 'Replies with the current time',
  type: 'utility',
}, async (message, match) => {
  const now = new Date();
  const options = {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const timeString = now.toLocaleString('en-US', options);
  await message.reply(`🕒 Current time in Kenya: ${timeString}`);
});
