const { Module } = require("../main");
const axios = require("axios");

// Global variable to hold the interval ID and track service state.
let autodpInterval = null;
const INTERVAL_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Function to run the profile picture update logic.
 * @param {object} client - The bot client object for API access.
 * @returns {string} - Status of the profile picture update.
 */
async function updateProfilePicture(client) {
    try {
        console.log("Raganork-MD: Attempting to change bot profile picture...");
        // Generates a URL for a random 720x720 image with a cache-buster.
        const imageUrl = `https://picsum.photos/720?random=${Date.now()}`;

        // Uses the client's API to set the bot's own profile picture.
        await client.setProfilePicture(client.user.id, { url: imageUrl });

        console.log("Raganork-MD: Bot profile picture updated successfully!");
        return "success";
    } catch (e) {
        console.error("Raganork-MD: Failed to update bot profile picture:", e.message);
        return `failure: ${e.message}`;
    }
}

// Register the module with the Raganork framework
Module(
  {
    pattern: "autodp ?(.*)", // Matches .autodp and captures any following text
    fromMe: true, // Only bot owner can use this command
    desc: "Controls the automatic bot profile picture changing service (10 min interval).",
    use: "utility",
  },
  async (client, message, text) => {
    
    // 💡 FIX: Safely initialize text to an empty string if undefined.
    // This prevents the "Cannot read properties of undefined" error when splitting.
    text = text || ""; 

    // Get the first word after .autodp to determine the action (start/stop)
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

      // Run the function once immediately and get status
      const initialStatus = await updateProfilePicture(client);
      
      // Set the interval to run every 10 minutes
      autodpInterval = setInterval(async () => {
          await updateProfilePicture(client);
      }, INTERVAL_TIME);

      // Send success feedback
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
      
      // Send success feedback
      await client.sendMessage(message.jid, { text: "🛑 **Auto DP Service Stopped.** The profile picture will no longer update automatically." }, { quoted: message });
      console.log("Raganork-MD: Auto Profile Picture Changer service stopped via command.");
      return;
    }
    
    // --- Invalid Command Feedback ---
    return await client.sendMessage(message.jid, { text: "❓ Invalid command. Use \`.autodp start\` or \`.autodp stop\`." }, { quoted: message });
  }
);
