const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'anime ?(.*)',
  fromMe: false,
  desc: 'Fetches anime details from MyAnimeList',
  type: 'search',
}, async (message, match) => {
  const query = match[1].trim();
  if (!query) {
    return await message.reply('❗ Please provide an anime name. Example: `.anime Naruto`');
  }

  try {
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
    if (!res.data.data || res.data.data.length === 0) {
      return await message.reply('😔 No anime found with that name.');
    }

    const anime = res.data.data[0];
    const replyText = `🎬 *${anime.title}*  
📅 Aired: ${anime.aired.string || 'Unknown'}  
⭐ Score: ${anime.score || 'N/A'}  
📖 Synopsis: ${anime.synopsis ? anime.synopsis.substring(0, 300) + '...' : 'No synopsis available.'}`;

    await message.reply(replyText);
  } catch (err) {
    await message.reply('⚠️ Error fetching anime details. Try again later.');
  }
});
