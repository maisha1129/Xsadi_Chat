module.exports.config = {
  name: "profile",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Get Facebook UID and profile links",
  commandCategory: "utility",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5
};

// ===== Helper: Full Name Mention Detection =====
async function getUIDByFullName(api, threadID, body) {
  if (!body.includes("@")) return null;
  const match = body.match(/@(.+)/);
  if (!match) return null;
  const targetName = match[1].trim().toLowerCase().replace(/\s+/g, " ");
  const threadInfo = await api.getThreadInfo(threadID);
  const users = threadInfo.userInfo || [];
  const user = users.find(u => {
    if (!u.name) return false;
    const fullName = u.name.trim().toLowerCase().replace(/\s+/g, " ");
    return fullName === targetName;
  });
  return user ? user.id : null;
}

module.exports.run = async function({ event, api, args }) {
  const fs = require("fs-extra");
  const request = require("request");
  
  let uid;
  let name;
  
  const sendResult = async (uid) => {
    try {
      const picURL = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const path = __dirname + `/cache/${uid}.png`;
      
      await new Promise((resolve) => {
        request(encodeURI(picURL))
          .pipe(fs.createWriteStream(path))
          .on("close", resolve);
      });
      
      if (!name) {
        const userInfo = await api.getUserInfo(uid);
        name = userInfo[uid]?.name || "Unknown";
      }
      
      const message = {
        body: `❖══════════❖\n║ 👤 𝐍𝐚𝐦𝐞 : ${name}\n║ 🆔 𝐔𝐬𝐞𝐫 𝐔𝐈𝐃 : ${uid}\n║ 🔗 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐋𝐢𝐧𝐤👇\n║ m.me/${uid}\n║ 🌐 𝐅𝐁 𝐏𝐫𝐨𝐟𝐢𝐥𝐞👇\n║ fb.com/${uid}\n❖══════════❖`,
        attachment: fs.createReadStream(path)
      };
      
      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(path);
      }, event.messageID);
      
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ An error occurred! Please try again.", event.threadID, event.messageID);
    }
  };
  
  // ===== Determine targetID in three ways =====
  if (event.type === "message_reply") {
    // Way 1: Reply to a message
    uid = event.messageReply.senderID;
    return sendResult(uid);
  }
  
  if (args[0]) {
    if (args[0].includes("facebook.com/") || args[0].includes("fb.com/") || args[0].indexOf(".com/") !== -1) {
      // Way 2: Facebook profile link
      try {
        const profileURL = args[0];
        uid = await api.getUID(profileURL);
        return sendResult(uid);
      } catch {
        return api.sendMessage("⚠️ Couldn't get UID from Facebook link!", event.threadID, event.messageID);
      }
    } else if (args.join().includes("@")) {
      // Way 3: Mention or full name
      // 3a: Direct Facebook mention
      uid = Object.keys(event.mentions || {})[0];
      if (uid) {
        name = event.mentions[uid];
        return sendResult(uid);
      } else {
        // 3b: Full name detection
        uid = await getUIDByFullName(api, event.threadID, args.join(" "));
        if (uid) {
          return sendResult(uid);
        }
      }
    } else if (!isNaN(args[0])) {
      // Direct UID
      uid = args[0];
      return sendResult(uid);
    }
  }
  
  // No arguments - show sender's own profile
  if (!uid) {
    uid = event.senderID;
    return sendResult(uid);
  }
  
  // If we reach here, show usage
  const usageMessage = `╔══════════
║        𝐔𝐬𝐚𝐠𝐞 𝐆𝐮𝐢𝐝𝐞
╠══════════
║ 🔰profile --Show your profile
║ 🔰profile--@mention
║ 🔰profile--[reply]
║ 🔰profile--[UID]
╚══════════`;
  
  api.sendMessage(usageMessage, event.threadID, event.messageID);
};
