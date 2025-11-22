const { Module } = require('../main');
const config = require('../config');
const { createCanvas } = require('canvas');

Module({
  pattern: 'jpg ?(.*)',
  fromMe: config.MODE === 'public' ? false : true,
  desc: 'Generate a stylish JPG image with text',
  type: 'fun',
}, async (message, match) => {
  try {
    const text = match || 'Stylish Text';

    // Canvas setup
    const width = 1000;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#ff512f'); // orange-red
    bgGradient.addColorStop(1, '#dd2476'); // pink
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Text style
    ctx.font = 'bold 100px Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 40;

    // Text gradient
    const textGradient = ctx.createLinearGradient(0, 0, width, 0);
    textGradient.addColorStop(0, '#00c6ff'); // cyan
    textGradient.addColorStop(0.5, '#0072ff'); // deep blue
    textGradient.addColorStop(1, '#00ff88'); // neon green
    ctx.fillStyle = textGradient;

    ctx.fillText(text, width / 2, height / 2);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/jpeg');

    // Send back to chat
    await message.client.sendMessage(message.jid, {
      image: buffer,
      caption: `✨ Stylish JPG: ${text}`,
      mimetype: 'image/jpeg'
    });
  } catch (err) {
    await message.reply('⚠️ Failed to generate stylish JPG image.');
  }
});
