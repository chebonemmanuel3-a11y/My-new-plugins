const { Module } = require("../main");
const axios = require("axios");

let autopfpInterval = null; // store interval globally

Module(
  {
    pattern: "autopfp",
    on: "start",
    fromMe: true,
    desc: "Automatically changes bot profile picture every 10 minutes.",
    use: "utility",
  },
  async (client, message) => {
    if (autopfpInterval) {
      await client.sendMessage(message.jid, { text: "⚡ Auto Profile Picture is already running!" });
      return;
    }

    await client.sendMessage(message.jid, { text: "✅ Auto Profile Picture started successfully. It will update every 10 minutes." });

    autopfpInterval = setInterval(async () => {
      try {
        const imageUrl = `https://picsum.photos/720?random=${Date.now()}`;
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data, "binary");

        await client.updateProfilePicture(client.user.id, imageBuffer);
        console.log("Raganork-MD: Bot profile picture updated successfully!");
      } catch (e) {
        console.error("Raganork-MD: Failed to update bot profile picture:", e.message);
      }
    }, 1 * 60 * 1000);
  }
);

// Stop command
Module(
  {
    pattern: "stopautopfp",
    on: "start",
    fromMe: true,
    desc: "Stops the auto profile picture changer.",
    use: "utility",
  },
  async (client, message) => {
    if (!autopfpInterval) {
      await client.sendMessage(message.jid, { text: "⚡ Auto Profile Picture is not running." });
      return;
    }

    clearInterval(autopfpInterval);
    autopfpInterval = null;
    await client.sendMessage(message.jid, { text: "🛑 Auto Profile Picture has been stopped." });
  }
);
