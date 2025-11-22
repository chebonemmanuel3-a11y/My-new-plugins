const { Module } = require('../main');
const config = require('../config');

Module({
  pattern: 'bug ?(.*)',
  fromMe: false,
  use: 'utility',
  desc: 'Report a bug to maintainers',
}, async (message, match) => {
  try {
    const raw = (match[1] && match[1].trim()) || (message.reply_message && (message.reply_message.text || message.reply_message.caption)) || '';
    if (!raw) {
      return await message.sendReply(
        '_Usage: .bug <title>\n<description> (or reply to a message with .bug)_\n\nExample:_\n`.bug Login error\nBot crashes when I try to login with session`'
      );
    }

    // parse title/description
    let title = 'Bug Report';
    let description = raw;
    if (raw.includes('\n')) {
      const parts = raw.split('\n');
      title = parts.shift().trim() || title;
      description = parts.join('\n').trim();
    } else if (raw.includes('|')) {
      const parts = raw.split('|');
      title = parts.shift().trim() || title;
      description = parts.join('|').trim();
    }

    const reporter = message.senderName || message.sender || message.jid;
    const fromJid = message.jid;
    const time = new Date().toISOString();

    const reportText = `*New Bug Report*\n\n*Title:* ${title}\n*From:* ${reporter}\n*From JID:* ${fromJid}\n*Time:* ${time}\n\n*Description:*\n${description}`;

    // targets from config.RG (comma separated group jids)
    const targets = (config.RG || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (targets.length === 0) {
      await message.sendReply('_No report destination configured (check RG in config)._');
      return;
    }

    // send report to configured groups
    for (const t of targets) {
      try {
        await message.client.sendMessage(t, { text: reportText });

        // forward attachment if user replied to a media
        if (message.reply_message) {
          try {
            if (message.reply_message.image) {
              const buf = await message.reply_message.download();
              await message.client.sendMessage(t, { image: buf, caption: `Attachment for: ${title}` });
            } else if (message.reply_message.video) {
              const buf = await message.reply_message.download();
              await message.client.sendMessage(t, { video: buf, caption: `Attachment for: ${title}` });
            } else if (message.reply_message.document) {
              const buf = await message.reply_message.download();
              await message.client.sendMessage(t, { document: buf, mimetype: message.reply_message.mimetype || 'application/octet-stream', fileName: message.reply_message.fileName || 'attachment' });
            } else if (message.reply_message.audio) {
              const buf = await message.reply_message.download();
              await message.client.sendMessage(t, { audio: buf, mimetype: message.reply_message.mimetype || 'audio/mpeg' });
            } else if (message.reply_message.sticker) {
              const buf = await message.reply_message.download();
              await message.client.sendMessage(t, { sticker: buf });
            }
          } catch (e) {
            // non-fatal for attachments
            console.error('Failed to forward attachment for bug report', e);
          }
        }
      } catch (e) {
        console.error('Failed to deliver bug report to', t, e);
      }
    }

    await message.sendReply('_Thanks — bug report submitted to maintainers._');
  } catch (err) {
    console.error('Error in bug plugin', err);
    await message.sendReply('_Failed to submit bug report._');
  }
});
