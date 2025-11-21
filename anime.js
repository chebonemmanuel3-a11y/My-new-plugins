const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'anime ?(.*)',
  fromMe: false,
  desc: 'Fetches anime details with cover image',
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

    // Send text first
    await message.reply(replyText);

    // Send cover image
    if (anime.images && anime.images.jpg && anime.images.jpg.image_url) {
      await message.sendFromUrl(anime.images.jpg.image_url, { caption: anime.title });
    }
  } catch (err) {
    await message.reply('⚠️ Error fetching anime details. Try again later.');
  }
});
