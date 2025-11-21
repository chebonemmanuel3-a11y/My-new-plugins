const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'insult',
  fromMe: false,
  desc: 'Fetches a random funny insult',
  type: 'fun',
}, async (message, match) => {
  try {
    const res = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    const insult = res.data.insult || "Couldn't fetch an insult right now.";
    await message.reply(`😈 ${insult}`);
  } catch (err) {
    await message.reply('⚠️ Error fetching insult. Try again later.');
  }
});
