const { Module } = require('../main');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Simple autoplay DP updater for Raganork
// .autodp on <url1,url2,...>  -> enable and set sources
// .autodp off               -> disable
// .autodp status            -> show status

const STATE_KEY = 'AUTODP_SOURCES';
const ENABLE_KEY = 'AUTODP_ENABLED';

function persist(key, value) {
  try {
    // store in dynamic config so it can be changed at runtime
    config[key] = value;
  } catch (e) {
    console.error('Failed to persist autodp state', e);
  }
}

async function downloadImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
  return Buffer.from(res.data);
}

async function setProfilePicture(client, buffer) {
  try {
    // The bot's client exposes sendMessage and other helpers. The underlying
    // WA client supports updateProfilePicture via setProfilePicture or similar.
    // We'll attempt common methods used in this codebase.
    if (typeof client.updateProfilePicture === 'function') {
      await client.updateProfilePicture(buffer);
      return true;
    }

    // fallback: send as profile picture using presence of contact update API
    if (client.user && client.user.jid) {
      // Some clients expose `updateProfilePicture` on `client` or `client.sock`.
      if (client.sock && typeof client.sock.updateProfilePicture === 'function') {
        await client.sock.updateProfilePicture(client.user.jid, buffer);
        return true;
      }
    }

    // as a last resort try to send an image to self and hope server updates
    return false;
  } catch (e) {
    console.error('Failed to set profile picture', e);
    return false;
  }
}

let intervalId = null;

async function startAutodp(client) {
  const enabled = config[ENABLE_KEY];
  const srcs = (config[STATE_KEY] || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!enabled || !srcs.length) return;

  if (intervalId) clearInterval(intervalId);

  const run = async () => {
    for (const url of srcs) {
      try {
        const buf = await downloadImage(url);
        const ok = await setProfilePicture(client, buf);
        if (ok) {
          console.info('autodp: updated profile picture from', url);
          break; // updated successfully, wait for next tick
        }
      } catch (e) {
        console.error('autodp: failed for', url, e.message || e);
      }
    }
  };

  // immediate run then schedule every 10 minutes
  run().catch(() => {});
  intervalId = setInterval(run, 10 * 60 * 1000);
}

function stopAutodp() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

Module({
  pattern: 'autodp ?(.*)',
  fromMe: true,
  use: 'owner',
  desc: 'Auto-update profile picture from given URLs every 10 minutes',
}, async (message, match) => {
  const arg = (match[1] || '').trim();
  if (!arg) {
    return await message.sendReply('_Usage: .autodp on <url1,url2> | .autodp off | .autodp status_');
  }

  const parts = arg.split(' ');
  const cmd = parts[0].toLowerCase();
  if (cmd === 'on') {
    const urls = parts.slice(1).join(' ').split(',').map(s => s.trim()).filter(Boolean);
    if (!urls.length) return await message.sendReply('_Provide at least one image URL._');
    persist(STATE_KEY, urls.join(','));
    persist(ENABLE_KEY, true);
    startAutodp(message.client);
    return await message.sendReply(`_AutoDP enabled with ${urls.length} source(s)._`);
  } else if (cmd === 'off') {
    persist(ENABLE_KEY, false);
    stopAutodp();
    return await message.sendReply('_AutoDP disabled._');
  } else if (cmd === 'status') {
    const enabled = !!config[ENABLE_KEY];
    const urls = (config[STATE_KEY] || '').split(',').map(s => s.trim()).filter(Boolean);
    return await message.sendReply(`_AutoDP_: ${enabled ? 'Enabled' : 'Disabled'}\n_Sources:_ ${urls.length ? urls.join('\n') : 'none'}`);
  }

  return await message.sendReply('_Unknown subcommand. Use on/off/status_');
});

// Try to start on load if enabled
try {
  if (config[ENABLE_KEY]) startAutodp(global?.BotClient || {});
} catch (e) {
  console.error('autodp init failed', e);
}
