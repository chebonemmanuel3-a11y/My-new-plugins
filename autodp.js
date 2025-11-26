const { Module } = require("../main");
const axios = require("axios");

// Global variable to hold the interval ID and track service state.
// This is essential for controlling the start and stop.
let autodpInterval = null;
const INTERVAL_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Function to run the profile picture update logic.
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

// Register the module using the command pattern to allow user interaction
Module(
  {
    pattern: "autodp ?(.*)", // The new pattern to capture start/stop arguments
    fromMe: true, 
    desc: "Controls the automatic bot profile picture changing service.",
    use: "utility",
  },
  async (client, message, text) => {
    
    // ⭐ FIX FOR "Cannot read properties of undefined (reading 'split')":
    // Ensures 'text' is an empty string if no argument is provided.
    text = text || ""; 

    // Destructure the first word to get the command (start, stop, or empty)
    const [command] = text.split(" "); 

    // --- Status Check (If user types just .autodp) ---
    if (!command) {
        const status = autodpInterval ? 'running' : 'stopped';
        return await client.sendMessage(message.jid, { text: `⚠️ **Auto DP Service Status:** The service is currently *${status}*. Use \`.autodp start\` or \`.autodp stop\`.` }, { quoted: message });
    }
    
    // --- Start Command Logic ---
    if (command.toLowerCase() === "start") {
      if (autodpInterval) {
        return await client.sendMessage(message.jid, { text: "❌ Auto DP service is **already running**." }, { quoted: message });
      }

      // 1. Run once immediately
      const initialStatus = await updateProfilePicture(client);
      
      // 2. Set the interval and store the ID globally
      autodpInterval = setInterval(async () => {
          await updateProfilePicture(client);
      }, INTERVAL_TIME);

      const initialMessage = initialStatus.startsWith("success") ? 
          "✅ Started successfully. First DP set." : 
          `⚠️ Started, but initial DP set failed: ${initialStatus.substring(9)}`;
          
      await client.sendMessage(message.jid, { text: `✨ **Auto DP Service Started!**\n- Status: ${initialMessage}\n- Interval: 10 minutes.` }, { quoted: message });
      console.log("Raganork-MD: Auto Profile Picture Changer service started via command.");
      return;
    }

    // --- Stop Command Logic ---
    if (command.toLowerCase() === "stop") {
      if (!autodpInterval) {
        return await client.sendMessage(message.jid, { text: "❌ Auto DP service is **not running**." }, { quoted: message });
      }

      // Clear the interval to stop the scheduled function calls
      clearInterval(autodpInterval);
      autodpInterval = null; // Reset the tracker
      
      await client.sendMessage(message.jid, { text: "🛑 **Auto DP Service Stopped.** The profile picture will no longer update automatically." }, { quoted: message });
      console.log("Raganork-MD: Auto Profile Picture Changer service stopped via command.");
      return;
    }
    
    // --- Invalid Command Feedback ---
    return await client.sendMessage(message.jid, { text: "❓ Invalid command. Use \`.autodp start\` or \`.autodp stop\`." }, { quoted: message });
  }
);
