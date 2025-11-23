const { Module } = require("../main");

Module(
  {
    pattern: "pp ?(.*)",
    desc: "Fetches a user's profile picture.",
    use: "utility",
    usage: ".pp <mention/reply> or .pp",
  },
  async (message, match) => {
    let jid;

    // Prioritize mentioned user
    if (message.mention && message.mention.length > 0) {
      jid = message.mention[0];
    }
    // Then check for replied message sender
    else if (message.reply_message) {
      jid = message.reply_message.jid;
    }
    // Otherwise, use the sender of the command
    else {
      jid = message.sender;
    }

    try {
      const ppUrl = await message.client.profilePictureUrl(jid, "image");
      await message.sendMessage({ url: ppUrl }, "image");
    } catch (e) {
      await message.sendReply(
        `_Couldn't fetch profile picture for ${jid.split("@")[0]}. User might not have one or it's private._`
      );
    }
  }
);
