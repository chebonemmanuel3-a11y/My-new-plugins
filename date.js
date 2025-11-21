const { Module } = require('../main');
const config = require('../config');

Module({
  pattern: 'date',
  fromMe: false,
  desc: 'Replies with today’s date',
  type: 'utility',
}, async (message, match) => {
  const today = new Date();
  const options = {
    timeZone: 'Africa/Nairobi',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateString = today.toLocaleDateString('en-US', options);
  await message.reply(`📅 Today is ${dateString}`);
});
