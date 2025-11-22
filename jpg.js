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
    // Extract raw input after command
    const raw = match?.trim();
    if (!raw) return await message.reply('⚠️ Please provide text after .jpg');

    // Clean the input (remove command prefix if present)
    const input = raw.replace(/^\.?jpg\s*/i, '').trim();

    // Generate image using dummyimage.com
    const imageUrl = `https://dummyimage.com/800x400/000/fff.jpg&text=${encodeURIComponent(input)}`;
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    await message.client.sendMessage(message.jid, {
      image: buffer,
      caption: `🖼️ JPG generated: ${input}`,
      mimetype: 'image/jpeg'
    });
  } catch (err) {
    console.error('jpg.js error:', err);
    await message.reply('⚠️ Failed to generate JPG image.');
  }
});
