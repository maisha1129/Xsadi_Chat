module.exports.config = {
  name: 'allbox',
  version: '1.0.0',
  credits: '🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰',
  hasPermssion: 2,
  description: '[Ban/Unban/Del/Remove] List[Data] thread The bot has joined in.',
  commandCategory: 'Admin',
  usages: '[page number/all/@mention]',
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

// ===== Helper: Get Threads by User ID =====
async function getThreadsByUserID(api, userID) {
    try {
        const threadList = await api.getThreadList(100, null, ["INBOX"]);
        const userThreads = [];
        
        for (const thread of threadList) {
            if (thread.isGroup) {
                const threadInfo = await api.getThreadInfo(thread.threadID);
                const participants = threadInfo.participantIDs || [];
                
                if (participants.includes(userID)) {
                    userThreads.push({
                        threadName: thread.name,
                        threadID: thread.threadID,
                        messageCount: thread.messageCount,
                        isAdmin: threadInfo.adminIDs ? threadInfo.adminIDs.includes(userID) : false
                    });
                }
            }
        }
        
        return userThreads;
    } catch (error) {
        console.error("Error getting threads by user:", error);
        return [];
    }
}

module.exports.handleReply = async function ({ api, event, args, Threads, handleReply }) {
  const { threadID, messageID } = event;
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Dhaka").format("HH:MM:ss L");
  var arg = event.body.split(" ");
  var idgr = handleReply.groupid[arg[1] - 1];
  var groupName = handleReply.groupName[arg[1] - 1];
  
  switch (handleReply.type) {
    case "reply":
      {
        if (arg[0] == "ban" || arg[0] == "Ban") {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 1;
          data.dateAdded = time;
          await Threads.setData(idgr, { data });
          global.data.threadBanned.set(idgr, { dateAdded: data.dateAdded });
          return api.sendMessage(`»Notifications from Owner 🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰\n\n🚫Group of Friends Have been banned from using bots by Ban`, idgr, () =>
            api.sendMessage(`${api.getCurrentUserID()}`, () =>
              api.sendMessage(`★★BanSuccess★★\n\n🔷${groupName} \n🔰TID:${idgr}`, threadID, () =>
                api.unsendMessage(handleReply.messageID))));
        }

        if (arg[0] == "unban" || arg[0] == "Unban" || arg[0] == "ub" || arg[0] == "Ub") {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 0;
          data.dateAdded = null;
          await Threads.setData(idgr, { data });
          global.data.threadBanned.delete(idgr, 1);
          return api.sendMessage(`»Notifications from Owner 🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰\n\n Group Of Friends That Have Been Removed Board`, idgr, () =>
            api.sendMessage(`${api.getCurrentUserID()}`, () =>
              api.sendMessage(`★★𝐔𝐧𝐛𝐚𝐧𝐒𝐮𝐜𝐜𝐞𝐬𝐬★★\n\n🔷${groupName} \n🔰𝐓𝐈𝐃:${idgr} `, threadID, () =>
                api.unsendMessage(handleReply.messageID))));
        }

        if (arg[0] == "del" || arg[0] == "Del") {
          const data = (await Threads.getData(idgr)).data || {};
          await Threads.delData(idgr, { data });
          console.log(groupName)
          api.sendMessage(`★★𝐃𝐞𝐥𝐒𝐮𝐜𝐜𝐞𝐬𝐬★★\n\n🔷${groupName} \n🔰𝐓𝐈𝐃: ${idgr} \n Successfully deleted the data!`, event.threadID, event.messageID);
          break;
        }

        if (arg[0] == "out" || arg[0] == "Out") {
          api.sendMessage(`»Notifications from Owner 🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰\n\n ★★Deleted from chat★★ group`, idgr, () =>
            api.sendMessage(`${api.getCurrentUserID()}`, () =>
              api.sendMessage(`★★𝐎𝐮𝐭𝐒𝐮𝐜𝐜𝐞𝐬𝐬★★\n\n🔷${groupName} \n🔰𝐓𝐈𝐃:${idgr} `, threadID, () =>
                api.unsendMessage(handleReply.messageID, () =>
                  api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr)))));
          break;
        }
      }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  // ===== Detect User ID from Mention/Reply/Link/UID =====
  let targetUserID = null;
  let showUserThreads = false;
  
  if (event.type === "message_reply") {
    // Way 1: Reply to a message
    targetUserID = event.messageReply.senderID;
    showUserThreads = true;
  } else if (args[0]) {
    if (args[0].indexOf(".com/") !== -1) {
      // Way 2: Facebook profile link
      targetUserID = await api.getUID(args[0]);
      showUserThreads = true;
    } else if (args.join().includes("@")) {
      // Way 3: Mention or full name
      // 3a: Direct Facebook mention
      targetUserID = Object.keys(event.mentions || {})[0];
      if (!targetUserID) {
        // 3b: Full name detection
        targetUserID = await getUIDByFullName(api, event.threadID, args.join(" "));
      }
      showUserThreads = true;
    } else if (args[0] === "all") {
      // Original "all" functionality
      showUserThreads = false;
    } else {
      // Could be UID or page number
      // Check if it's a UID (numeric and long)
      if (/^\d+$/.test(args[0]) && args[0].length > 5) {
        targetUserID = args[0];
        showUserThreads = true;
      } else {
        // Assume it's a page number
        showUserThreads = false;
      }
    }
  }
  
  // ===== Get User Threads if Target User Found =====
  if (showUserThreads && targetUserID) {
    try {
      const userThreads = await getThreadsByUserID(api, targetUserID);
      const userInfo = await api.getUserInfo(targetUserID);
      const userName = userInfo[targetUserID]?.name || "Unknown User";
      
      if (userThreads.length === 0) {
        return api.sendMessage(`🔍 User "${userName}" (${targetUserID}) is not a member of any groups where the bot is present.`, threadID, messageID);
      }
      
      let msg = `📊 Groups for: ${userName} (${targetUserID})\n`;
      msg += `📈 Total Groups: ${userThreads.length}\n\n`;
      
      const groupid = [];
      const groupName = [];
      
      userThreads.forEach((thread, index) => {
        msg += `${index + 1}. ${thread.threadName}\n`;
        msg += `   🔰TID: ${thread.threadID}\n`;
        msg += `   💌Messages: ${thread.messageCount}\n`;
        msg += `   👑Admin: ${thread.isAdmin ? "Yes" : "No"}\n\n`;
        
        groupid.push(thread.threadID);
        groupName.push(thread.threadName);
      });
      
      msg += `\n🎭 Reply with: ban/unban/del/out [number] to perform action on that group`;
      
      return api.sendMessage(msg, threadID, (e, data) => {
        if (e) return;
        global.client.handleReply.push({
          name: this.config.name,
          author: senderID,
          messageID: data.messageID,
          groupid,
          groupName,
          type: 'reply'
        });
      });
      
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Error fetching user's threads. Please try again.", threadID, messageID);
    }
  }
  
  // ===== Original Functionality (No Mention/User Specified) =====
  switch (args[0]) {
    case "all":
      {
        var threadList = [];
        var data, msg = "";
        /////////
        try {
          data = await api.getThreadList(100, null, ["INBOX"]);
        } catch (e) {
          console.log(e);
        }
        for (const thread of data) {
          if (thread.isGroup == true) threadList.push({ threadName: thread.name, threadID: thread.threadID, messageCount: thread.messageCount });
        }
        /////////////////////////////////////////////////////
        //===== sắp xếp từ cao đến thấp cho từng nhóm =====//
        threadList.sort((a, b) => {
          if (a.messageCount > b.messageCount) return -1;
          if (a.messageCount < b.messageCount) return 1;
        })

        var groupid = [];
        var groupName = [];
        var page = 1;
        page = parseInt(args[1]) || 1;
        page < -1 ? page = 1 : "";
        var limit = 100;
        var msg = "🎭DS GROUP [Data]🎭\n\n";
        var numPage = Math.ceil(threadList.length / limit);

        for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
          if (i >= threadList.length) break;
          let group = threadList[i];
          msg += `${i + 1}. ${group.threadName}\n🔰𝐓𝐈𝐃: ${group.threadID}\n💌𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐂𝐨𝐮𝐧𝐭: ${group.messageCount}\n`;
          groupid.push(group.threadID);
          groupName.push(group.threadName);
        }
        msg += `--Page ${page}/${numPage}--\nDy ${global.config.PREFIX}allbox page number/all\n\n`

        api.sendMessage(msg + '🎭Reply Out, Ban, Unban, Del[data] the order number to Out, Ban, Unban, Del[data] that thread!', event.threadID, (e, data) =>
          global.client.handleReply.push({
            name: this.config.name,
            author: event.senderID,
            messageID: data.messageID,
            groupid,
            groupName,
            type: 'reply'
          })
        )
      }
      break;

    default:
      {
        const { threadID, messageID } = event;
        var threadList = [];
        var data, msg = "";
        i = 1;
        /////////
        try {
          data = global.data.allThreadID;
        } catch (e) {
          console.log(e);
        }
        for (const thread of data) {
          var nameThread = await global.data.threadInfo.get(thread).threadName || "The name doesn't exist.";
          threadList.push(`${i++}. ${nameThread} \n🔰𝐓𝐈𝐃: ${thread}`);
        }
 
        return api.sendMessage(threadList.length != 0 ? 
          `🍄There is currently ${threadList.length} group\n\n${threadList.join("\n")}\n\n📌 Usage: ${global.config.PREFIX}allbox [page/all/@user/UID/link]` : 
          "There is currently no group!", threadID, messageID);
      }
  }
};
