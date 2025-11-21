const { addCommand } = require('../lib/commands');

addCommand({
  pattern: 'hello',
  desc: 'Replies with a greeting',
  type: 'fun',
}, async (message, match) => {
  await message.reply('Hello 👋, this is your custom plugin!');
});
