const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'insult',
  fromMe: false,
  desc: 'Replies with a funny insult mentioning the target user',
  type: 'fun',
}, async (message, match) => {
  try {
    // Fetch insult from API
    const res = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    const insult = res.data.insult || "Couldn't fetch an insult right now.";

    // Check if the command was used as a reply
    if (message.reply_message) {
      const target = message.reply_message.sender;
      await message.reply(`😈 @${target} ${insult}`, { mentions: [message.reply_message.jid] });
    } else {
      // If not replying, just send a random insult
      await message.reply(`😈 ${insult}`);
    }
  } catch (err) {
    await message.reply('⚠️ Error fetching insult. Try again later.');
  }
});
