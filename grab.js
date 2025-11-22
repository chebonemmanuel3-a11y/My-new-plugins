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

    // Build candidate URLs (try larger sizes first), then pick the best successful download.
    const makeSizedUrl = (url, size) => {
      if (!url || typeof url !== 'string') return url;
      try {
        let u = url;
        u = u.replace(/([&?])type=preview(&|$)/i, '$1').replace(/[?&]$/, '');
        // replace /s<number>/, =s<number>, _s<number>, w<number>-h<number>
        u = u.replace(/\/s\d+(-c)?\//i, `/s${size}/`);
        u = u.replace(/=s\d+(-c)?/i, `=s${size}`);
        u = u.replace(/_s\d+/i, `_s${size}`);
        u = u.replace(/w\d+-h\d+/i, `w${size}-h${size}`);
        return u;
      } catch (err) {
        return url;
      }
    };

    const sizes = [2048, 1024, 512, 256];
    const candidates = [ppUrl];
    for (const s of sizes) candidates.push(makeSizedUrl(ppUrl, s));

    let best = { size: 0, buffer: null, mime: null, url: null, error: null };

    for (const c of candidates) {
      if (!c) continue;
      try {
        const res = await axios.get(c, { responseType: 'arraybuffer', timeout: 10000, validateStatus: null });
        if (!res || !res.data) {
          continue;
        }
        const buf = Buffer.from(res.data, 'binary');
        const len = buf.length || 0;
        const mime = (res.headers && res.headers['content-type']) || 'image/jpeg';
        // Prefer larger buffers
        if (len > best.size) {
          best = { size: len, buffer: buf, mime, url: c };
        }
        // If we got a very large image, stop early
        if (len > 100000) break;
      } catch (err) {
        // keep trying other candidates, but remember last error
        best.error = err;
        console.warn('grab.js candidate fetch error for', c, err && err.message ? err.message : err);
      }
    }

    if (best.buffer && best.size > 0) {
      // Send the best (largest) image we downloaded
      await message.client.sendMessage(message.jid, { image: best.buffer, caption: `Profile picture (${best.size} bytes)`, mimetype: best.mime });
      return;
    }

    // If no buffer was obtained, try sending the original URL (some hosts allow direct fetch)
    try {
      await message.client.sendMessage(message.jid, { image: { url: ppUrl }, caption: 'Profile picture', mimetype: 'image/jpeg' });
      return;
    } catch (err) {
      console.error('grab.js final fallback error', err);
      const userMessage = '_Failed to download or send the profile picture. They may not have a large DP or the bot lacks access._';
      // Provide a slightly more detailed message for debugging in logs
      console.error('grab.js details: ppUrl=', ppUrl, 'last error=', best.error || err);
      await message.sendReply(userMessage);
    }
  } catch (e) {
    console.error('grab.js error', e);
    await message.sendReply('_Failed to grab profile picture. Try again later._');
  }
});
