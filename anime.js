const { Module } = require('../main');
const axios = require('axios');

// Supported prompts: hug, kiss, pat, slap, cuddle, wink, dance, etc.
const SUPPORTED = [
  'hug', 'kiss', 'pat', 'slap', 'cuddle', 'wink', 'dance', 'smile', 'wave', 'poke', 'cry', 'think', 'blush', 'happy', 'bored', 'sleep', 'laugh', 'handhold', 'highfive', 'yeet', 'bite', 'bully', 'shy', 'nom', 'punch', 'shoot', 'stare', 'thumbsup', 'facepalm', 'shrug', 'feed', 'tickle', 'love', 'confused', 'kill', 'kick', 'lick', 'pout', 'run', 'sip', 'tease', 'fail', 'derp', 'baka', 'smug', 'scream', 'punch', 'cry', 'sleep', 'angry', 'happy', 'sad', 'surprised', 'excited', 'bored', 'tired', 'scared', 'shocked', 'embarrassed', 'ashamed', 'proud', 'jealous', 'disgusted', 'amused', 'content', 'determined', 'frustrated', 'guilty', 'hopeful', 'lonely', 'nervous', 'relieved', 'silly', 'worried'
];

// nekos.best API: https://nekos.best/api/v2/<action>
const API_BASE = 'https://nekos.best/api/v2/';

Module({
  pattern: 'anime ?(.*)',
  fromMe: false,
  use: 'utility',
  desc: 'Send an anime gif/video for a prompt (e.g. hug, kiss, pat)',
}, async (message, match) => {
  const prompt = (match[1] || '').trim().toLowerCase();
  if (!prompt) {
    return await message.sendReply('_Usage: .anime <action>\nExample: .anime hug_');
  }
  if (!SUPPORTED.includes(prompt)) {
    return await message.sendReply('_Unsupported action. Try: ' + SUPPORTED.slice(0, 10).join(', ') + ', ..._');
  }
  try {
    const url = API_BASE + encodeURIComponent(prompt);
    const res = await axios.get(url);
    const data = res.data && res.data.results && res.data.results[0];
    if (!data || !(data.url || data.gif)) {
      return await message.sendReply('_No anime gif found for: ' + prompt + '_');
    }
    // Prefer video if available, else gif
    const mediaUrl = data.url || data.gif;
    // Send as video/gif
    await message.client.sendMessage(message.jid, {
      video: { url: mediaUrl },
      mimetype: 'video/mp4',
      caption: `Anime ${prompt}`,
    });
  } catch (e) {
    console.error('anime.js error', e);
    await message.sendReply('_Failed to fetch anime gif. Try again later._');
  }
});
