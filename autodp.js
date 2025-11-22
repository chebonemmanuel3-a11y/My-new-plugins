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
const DEFAULT_IMAGE_API = 'https://picsum.photos/500'; // Random image API

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
  if (!enabled) return;

  if (intervalId) clearInterval(intervalId);

  const run = async () => {
    try {
      // Fetch a random image from the API
      const buf = await downloadImage(DEFAULT_IMAGE_API + '?random=' + Date.now());
      const ok = await setProfilePicture(client, buf);
      if (ok) {
        console.info('autodp: updated profile picture from online source');
      } else {
        console.error('autodp: failed to update profile picture');
      }
    } catch (e) {
      console.error('autodp: failed to fetch/set image', e.message || e);
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
    return await message.sendReply('_Usage: .autodp on | .autodp off | .autodp status_\nWhen enabled, fetches a random image from the internet every 10 minutes.');
  }

  const cmd = arg.toLowerCase();
  if (cmd === 'on') {
    persist(ENABLE_KEY, true);
    startAutodp(message.client);
    return await message.sendReply('_AutoDP enabled. Will fetch a random image every 10 minutes._');
  } else if (cmd === 'off') {
    persist(ENABLE_KEY, false);
    stopAutodp();
    return await message.sendReply('_AutoDP disabled._');
  } else if (cmd === 'status') {
    const enabled = !!config[ENABLE_KEY];
    return await message.sendReply(`_AutoDP_: ${enabled ? 'Enabled' : 'Disabled'}\n_Source:_ ${DEFAULT_IMAGE_API}`);
  }

  return await message.sendReply('_Unknown subcommand. Use on/off/status_');
});

// Try to start on load if enabled
try {
  if (config[ENABLE_KEY]) startAutodp(global?.BotClient || {});
} catch (e) {
  console.error('autodp init failed', e);
}
