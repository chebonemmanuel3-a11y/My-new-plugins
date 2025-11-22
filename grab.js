const { Module } = require('../main');
const axios = require('axios');

// Grab profile picture (DP) of a user.
// Usage:
// - In a direct chat: `.grab` -> gets the other participant's profile picture
// - In a group: reply to someone's message with `.grab` -> gets the replied user's profile picture

Module({
  pattern: 'grab',
  fromMe: false,
  use: 'utility',
  desc: 'Grab profile picture of a user',
}, async (message, match) => {
  try {
    // If the command is used as a reply, prefer the replied user's id
    let targetJid = null;

    if (message.reply_message && message.reply_message.sender) {
      targetJid = message.reply_message.sender;
    }

    // If not a reply, and it's a private chat, target the chat participant (not the bot)
    if (!targetJid) {
      const chat = message.jid || '';
      // For groups, raw JID contains - and @g.us
      if (chat.endsWith('@s.whatsapp.net') || chat.endsWith('@c.us')) {
        // In a one-on-one chat, the chat JID is the user's JID
        targetJid = chat;
      } else {
        // In a group and not a reply, inform the user how to use the command
        return await message.sendReply('_Reply to a user in the group with .grab to fetch their profile picture, or use .grab in a private chat._');
      }
    }

    // Try to fetch the profile picture URL via the client
    let ppUrl = null;
    try {
      // Many Baileys-based clients expose a 'profilePictureUrl' or `getProfilePicture`.
      // Try common locations, falling back gracefully.
      if (message.client && typeof message.client.profilePictureUrl === 'function') {
        ppUrl = await message.client.profilePictureUrl(targetJid).catch(() => null);
      }
      if (!ppUrl && message.client && message.client.profilePicture) {
        // some bots provide a map of profile pictures
        ppUrl = message.client.profilePicture[targetJid] || null;
      }
      if (!ppUrl && message.client && message.client.getProfilePicture) {
        ppUrl = await message.client.getProfilePicture(targetJid).catch(() => null);
      }
    } catch (e) {
      ppUrl = null;
    }

    if (!ppUrl) {
      return await message.sendReply('_Could not fetch profile picture for that user. They may not have a profile picture or the bot lacks permission._');
    }

    // Try to request a higher-resolution version of the profile picture by
    // rewriting common WhatsApp size parameters in the URL (e.g. s96 -> s2048).
    const upscaleProfileUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      try {
        let u = url;
        // Remove preview/type query params that may force small size
        u = u.replace(/([&?])type=preview(&|$)/i, '$1');
        u = u.replace(/[?&]$/, '');

        // Replace common size segments with a larger size
        u = u.replace(/\/s\d+(-c)?\//i, '/s2048/');
        u = u.replace(/=s\d+(-c)?/i, '=s2048');
        u = u.replace(/_s\d+/i, '_s2048');
        u = u.replace(/w\d+-h\d+/i, 'w2048-h2048');

        return u;
      } catch (err) {
        return url;
      }
    };

    const largeUrl = upscaleProfileUrl(ppUrl);

    // Download the image first and re-upload it (gives better clarity than small thumbnails)
    try {
      const res = await axios.get(largeUrl, { responseType: 'arraybuffer', timeout: 20000 });
      const mime = (res.headers && res.headers['content-type']) || 'image/jpeg';
      const buffer = Buffer.from(res.data, 'binary');

      // If the downloaded image is suspiciously small, fall back to the original URL
      if (buffer.length < 5000 && largeUrl !== ppUrl) {
        const tryOrig = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 15000 }).catch(() => null);
        if (tryOrig && tryOrig.data) {
          const mime2 = (tryOrig.headers && tryOrig.headers['content-type']) || mime;
          const buffer2 = Buffer.from(tryOrig.data, 'binary');
          await message.client.sendMessage(message.jid, { image: buffer2, caption: 'Profile picture', mimetype: mime2 });
          return;
        }
      }

      await message.client.sendMessage(message.jid, { image: buffer, caption: 'Profile picture', mimetype: mime });
    } catch (err) {
      console.error('grab.js download error', err);
      // Fallback: try sending by URL if download fails
      try {
        await message.client.sendMessage(message.jid, { image: { url: largeUrl }, caption: 'Profile picture', mimetype: 'image/jpeg' });
      } catch (err2) {
        console.error('grab.js fallback send error', err2);
        await message.sendReply('_Failed to download or send the profile picture. They may not have a large DP or the bot lacks access._');
      }
    }
  } catch (e) {
    console.error('grab.js error', e);
    await message.sendReply('_Failed to grab profile picture. Try again later._');
  }
});
