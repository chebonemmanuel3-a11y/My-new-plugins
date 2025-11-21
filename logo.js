const { Module } = require('../main');
const config = require('../config');
const axios = require('axios');

const LOGO_STYLES = {
  facebook: 'facebook',
  instagram: 'instagram',
  twitter: 'twitter',
  pubg: 'pubg',
  avengers: 'avengers'
};

const LOGO_LIST = `🎨 Logo Maker
Usage: .logo <style> <text>

Available styles:
- facebook
- instagram
- twitter
- pubg
- avengers
`;

Module({
  pattern: 'logo ?(.*)',
  fromMe: config.MODE === 'public' ? false : true,
  desc: 'Generate styled logos',
  type: 'fun',
}, async (message, match) => {
  try {
    if (!match || match.trim() === '' || match.toLowerCase() === 'list') {
      return await message.reply(LOGO_LIST);
    }

    const args = match.split(' ');
    const style = args[0].toLowerCase();
    const text = args.slice(1).join(' ') || 'Demo';

    if (!LOGO_STYLES[style]) {
      return await message.reply(LOGO_LIST);
    }

    const imageUrl = `https://raganork-network.vercel.app/api/logo/${LOGO_STYLES[style]}?text=${encodeURIComponent(text)}`;

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    await message.send(buffer, 'image', { caption: `🎨 ${style} logo: ${text}` });
  } catch (err) {
    await message.reply('⚠️ Error generating logo. Try again or check your style name.');
  }
});
