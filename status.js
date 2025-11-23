const { Module } = require("../main");
const { setVar } = require("../plugins/manage");
const config = require("../config");

Module(
  {
    pattern: "statusview ?(.*)",
    fromMe: true,
    desc: "Toggles auto viewing of WhatsApp statuses. When enabled, the bot will automatically view new statuses posted by your contacts.",
    use: "utility",
    usage: "statusview <on|off>",
  },
  async (message, match) => {
    const toggle = match[1]?.toLowerCase();

    if (toggle === "on") {
      await setVar("AUTO_VIEW_STATUS", "true");
      return await message.sendReply("Auto view status has been *enabled*.");
    } else if (toggle === "off") {
      await setVar("AUTO_VIEW_STATUS", "false");
      return await message.sendReply("Auto view status has been *disabled*.");
    } else {
      return await message.sendReply(
        "Invalid argument. Please use `on` or `off`.\nUsage: `.statusview <on|off>`"
      );
    }
  }
);

Module(
  {
    on: "message",
    fromMe: false,
  },
  async (message) => {
    try {
      if (message.jid === "status@broadcast") {
        const autoViewStatus = JSON.parse(config.AUTO_VIEW_STATUS || "false");

        if (autoViewStatus) {
          await message.client.readMessages([message.data.key]);
          await message.client.sendMessage(message.jid, {
            react: {
              text: "❤️",
              key: message.data.key,
            },
          });
        }
      }
    } catch (e) {
      console.error("Error in auto-view/react status:", e);
    }
  }
);

Module(
  {
    pattern: "sreact ?(.*)",
    fromMe: true,
    desc: "Reacts to a replied WhatsApp status with an emoji.",
    use: "utility",
    usage: "sreact <emoji>",
  },
  async (message, match) => {
    try {
      if (!message.reply_message) {
        return await message.sendReply("_Reply to a status to react!_");
      }

      if (message.quoted && message.quoted.key.remoteJid === "status@broadcast") {
        const emoji = match[1];
        if (!emoji) {
          return await message.sendReply("_Provide an emoji to react with._\nUsage: `.sreact <emoji>`");
        }

        await message.client.sendMessage(message.quoted.key.remoteJid, {
          react: {
            text: emoji,
            key: message.quoted.key,
          },
        });
        await message.react("✅");
      } else {
        return await message.sendReply("_The replied message is not a status._");
      }
    } catch (e) {
      await message.sendReply(`_Error reacting to status: ${e.message}_`);
    }
  }
);
