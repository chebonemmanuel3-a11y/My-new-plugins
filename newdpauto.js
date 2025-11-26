const { Module } = require("../main");
const axios = require("axios");

// 1. STATE VARIABLE: Must be outside the Module to track the timer ID.
let autodpInterval = null;
const INTERVAL_TIME = 10 * 60 * 1000;

/**
 * 2. HELPER FUNCTION: Contains the reusable logic for changing the profile picture.
 */
async function updateProfilePicture(client) {
    try {
        console.log("Raganork-MD: Attempting to change bot profile picture...");
        const imageUrl = `https://picsum.photos/720?random=${Date.now()}`;
        await client.setProfilePicture(client.user.id, { url: imageUrl });
        console.log("Raganork-MD: Bot profile picture updated successfully!");
        return "success";
    } catch (e) {
        console.error("Raganork-MD: Failed to update bot profile picture:", e.message);
        return `failure: ${e.message}`;
    }
}

/**
 * 3. MODULE REGISTRATION: Registers the command and uses the state and helper function above.
 */
Module(
  {
    pattern: "autodp ?(.*)", 
    fromMe: true,
    desc: "Controls the automatic bot profile picture changing service (10 min interval).",
    use: "utility",
  },
  async (client, message, text) => {
    const [command] = text.split(" "); 

    if (!command) {
        const status = autodpInterval ? 'running' : 'stopped';
        return await client.sendMessage(message.jid, { text: `⚠️ **Auto DP Service Status:** The service is currently *${status}*. Use \`.autodp start\` or \`.autodp stop\`.` }, { quoted: message });
    }
    
    if (command.toLowerCase() === "start") {
      if (autodpInterval) {
        return await client.sendMessage(message.jid, { text: "❌ Auto DP service is **already running**." }, { quoted: message });
      }

      const initialStatus = await updateProfilePicture(client);
      
      autodpInterval = setInterval(async () => {
          await updateProfilePicture(client);
      }, INTERVAL_TIME);

      const initialMessage = initialStatus.startsWith("success") ? 
          "✅ Started successfully. First DP set." : 
          `⚠️ Started, but initial DP set failed: ${initialStatus.substring(9)}`;
          
      await client.sendMessage(message.jid, { text: `✨ **Auto DP Service Started!**\n- Status: ${initialMessage}\n- Interval: 10 minutes.` }, { quoted: message });
      return;
    }

    if (command.toLowerCase() === "stop") {
      if (!autodpInterval) {
        return await client.sendMessage(message.jid, { text: "❌ Auto DP service is **not running**." }, { quoted: message });
      }

      clearInterval(autodpInterval);
      autodpInterval = null;
      
      await client.sendMessage(message.jid, { text: "🛑 **Auto DP Service Stopped.** The profile picture will no longer update automatically." }, { quoted: message });
      return;
    }
    
    return await client.sendMessage(message.jid, { text: "❓ Invalid command. Use \`.autodp start\` or \`.autodp stop\`." }, { quoted: message });
  }
);
