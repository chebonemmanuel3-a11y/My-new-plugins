const { Module } = require('../main');
const { MODE } = require('../config');
const { skbuffer } = require('raganork-bot');

var x = MODE === 'public' ? false : true;

const list = `\`\`\`
Logo Maker List
Usage: .logo <styleNumber> <Text>

01 - 11 : Calligraphy
12 - 13 : Beast
14 - 19 : Pubg
20 - 25 : RRR
26 - 27 : Free Fire
28 - 29 : India
30 - 32 : Avengers
33 - 34 : Pushpa
35 - 37 : Master
38 - 44 : IPL
45      : Dhoni
46      : Vijay
47 - 52 : KGF
\`\`\``;

Module({
  pattern: 'logo ?(.*)',
  fromMe: x,
  desc: 'Generate styled logos',
  type: 'logo',
}, async (message, match) => {
  try {
    if (!match || match.trim() === '' || match.toLowerCase() === 'list') {
      return await message.reply(list);
    }

    const args = match.split(' ');
    const styleNumber = args[0];
    const text = args.slice(1).join(' ') || 'Demo';

    // Example API call (adjust endpoint to your logo API)
    const url = `https://raganork-network.vercel.app/api/logo/${styleNumber}?text=${encodeURIComponent(text)}`;

    const buffer = await skbuffer(url);
    await message.send(buffer, 'image', { caption: `🎨 Logo style ${styleNumber} with text: ${text}` });
  } catch (err) {
    await message.reply('⚠️ Error generating logo. Please check your style number or text.');
  }
});
