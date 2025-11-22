const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'jpg ?(.*)',
  fromMe: config.MODE === 'public' ? false : true,
  desc: 'Generate a JPG image with text (no canvas)',
  type: 'fun',
}, async (message, match) => {
  try {
    const text = match.replace(/^\.?jpg\s*/i, '').trim() || 'Stylish Text';

    // Use dummyimage.com for reliable image generation
    const imageUrl = `https://dummyimage.com/800x400/000/fff.jpg&text=${encodeURIComponent(text)}`;

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    await message.client.sendMessage(message.jid, {
      image: buffer,
      caption: `🖼️ JPG generated: ${text}`,
      mimetype: 'image/jpeg'
    });
  } catch (err) {
    console.error('jpg.js error:', err);
    await message.reply('⚠️ Failed to generate JPG image. Try again later.');
  }
});
