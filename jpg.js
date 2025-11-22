const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

Module({
  pattern: 'jpg ?(.*)',
  fromMe: config.MODE === 'public' ? false : true,
  desc: 'Generate a stylish JPG image with text',
  type: 'fun',
}, async (message, match) => {
  try {
    const text = match || 'Stylish Text';

    // Use FlamingText API to generate image
    const apiUrl = `https://www.flamingtext.com/net-fu/proxy_form.cgi?script=sketch-name&text=${encodeURIComponent(text)}&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100`;

    const response = await axios.get(apiUrl);
    const imageUrl = response.data.match(/<image href="(.*?)"/)?.[1];

    if (!imageUrl) {
      return await message.reply('⚠️ Could not fetch image. Try a different text.');
    }

    const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    await message.client.sendMessage(message.jid, {
      image: Buffer.from(imageBuffer.data),
      caption: `🖼️ JPG generated: ${text}`,
      mimetype: 'image/jpeg'
    });
  } catch (err) {
    console.error('jpg.js error:', err);
    await message.reply('❌ Failed to generate JPG image. Try again later.');
  }
});
