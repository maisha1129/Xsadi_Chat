module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX",
    description: "Auto detect and download videos from YouTube, TikTok, Instagram, etc.",
    commandCategory: "user",
    usages: "",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {},

  handleEvent: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { alldown } = require("rx-dawonload");

    // message content
    const content = event.body ? event.body.trim() : "";
    if (!content.startsWith("https://")) return;

    try {
      // Detect platform
      let site = "Unknown";
      if (content.includes("youtube.com") || content.includes("youtu.be")) site = "YouTube";
      else if (content.includes("tiktok.com")) site = "TikTok";
      else if (content.includes("instagram.com")) site = "Instagram";
      else if (content.includes("facebook.com")) site = "Facebook";

      // React with 🔍 while processing
      api.setMessageReaction("🔰", event.messageID, () => {}, true);

      // Download video data
      const data = await alldown(content);
      if (!data || !data.url) {
        // React ❌ if failed
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return;
      }

      const title = data.title || "unknown_video";
      const videoUrl = data.url;

      // React ⬇️ before download
      api.setMessageReaction("🔰", event.messageID, () => {}, true);

      // Download video file
      const videoBuffer = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
      const filePath = __dirname + "/cache/" + title.replace(/[^\w\s]/gi, "_") + ".mp4";
      fs.writeFileSync(filePath, Buffer.from(videoBuffer, "utf-8"));

      // Send video with platform and title
      api.sendMessage(
        {
          body: `🔰𝙎𝘼𝘿𝙄_𝘽𝙊𝙏🔰\n⚡𝗔𝘂𝘁𝗼 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿⚡\n📍 Platform: ${site}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        (err) => {
          fs.unlinkSync(filePath);
          if (!err) api.setMessageReaction("🔰", event.messageID, () => {}, true);
          else api.setMessageReaction("❌", event.messageID, () => {}, true);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },
};
