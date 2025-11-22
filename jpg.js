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
    // Clean the input: remove command prefix and trim
    const text = match.replace(/^\.?jpg\s*/i, '').trim() || 'Stylish Text';

    // Use a reliable image generator (placehold.co)
    const imageUrl = `https://placehold.co/800x400/000000/FFFFFF.jpg?text=${encodeURIComponent(text)}`;

    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Send the image back to chat
    await message.client.sendMessage(message.jid, {
      image: buffer,
      caption: `🖼️ JPG generated: ${text}`,
      mimetype: 'image/jpeg'
    });
  } catch (err) {
    console.error('jpg.js error:', err);
    await message.reply('⚠️ Failed to generate JPG image.');
  }
});
