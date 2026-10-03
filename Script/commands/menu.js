const fs = require("fs");
const path = require("path");

const COMMANDS_DIR = path.join(__dirname); // commands folder

function listCommands() {
  const files = fs.readdirSync(COMMANDS_DIR)
    .filter(f => f.endsWith(".js") && f !== path.basename(__filename))
    .map(f => f.replace(/\.js$/, ""));
  return files;
}

module.exports.config = {
  name: "menu",
  version: "1.2.0",
  hasPermssion: 2,
  credits: "🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Bot Control Center (Menu Only)",
  commandCategory: "system",
  usages: "menu",
  cooldowns: 2
};

const T = {
  title: "🔧 MENU • Control Center",
  ask: "Reply with the number of the option you want:",
  opts: [
    "Show current status",
    "Toggle a command ON/OFF",
    "Delete a command file (safe)",
    "Turn BOT OFF in this chat (BAN)",
    "Turn BOT ON in this chat (UNBAN)",
    "Restart bot (process.exit)"
  ],
  cancel: "❌ Cancelled.",
  confirmDel: (name)=>`Are you sure you want to delete “${name}.js”? (yes/no)`,
  notFound: "Command not found."
};

module.exports.run = async function({ api, event, Threads }) {
  const data = (await Threads.getData(event.threadID)).data || {};
  const statusLines = [
    `• This thread: ${data.banned ? "🚫 BOT OFF" : "🟢 BOT ON"}`
  ];

  const menu =
`${T.title}
${statusLines.join("\n")}

1) ${T.opts[0]}
2) ${T.opts[1]}
3) ${T.opts[2]}
4) ${T.opts[3]}
5) ${T.opts[4]}
6) ${T.opts[5]}

${T.ask}`;

  return api.sendMessage(menu, event.threadID, (err, info) => {
    if (err) return;
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      type: "menu"
    });
  });
};

module.exports.handleReply = async function (o) {
  const { api, event, handleReply, Threads } = o;
  if (event.senderID != handleReply.author) return;

  const reply = (msg, cb) => api.sendMessage(msg, event.threadID, cb);

  if (handleReply.type === "menu") {
    const choice = (event.body || "").trim();

    switch (choice) {
      case "1": {
        const cmds = listCommands();
        const lines = cmds.slice(0, 40).map(n => `• ${n}`);
        const data = (await Threads.getData(event.threadID)).data || {};
        return reply(`📊 Status:\n- Thread: ${data.banned ? "🚫 BOT OFF" : "🟢 BOT ON"}\n\n🧩 Commands (${lines.length} shown):\n${lines.join("\n")}`);
      }

      case "2": {
        const list = listCommands();
        if (list.length === 0) return reply("No commands found.");
        const menu = list.map((n,i)=>`${i+1}) ${n}`).join("\n");
        return reply(`🔁 Choose a command to toggle (just example, not linked to DB yet):\n${menu}\n\n${T.ask}`);
      }

      case "3": {
        const list = listCommands();
        if (list.length === 0) return reply("No commands found.");
        const menu = list.map((n,i)=>`${i+1}) ${n}`).join("\n");
        return reply(`🗑️ Choose a command file to delete:\n${menu}\n\n${T.ask}`, (err, info) => {
          if (err) return;
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "deletePick",
            cmds: list
          });
        });
      }

      case "4": { // ✅ BAN this thread
        const data = (await Threads.getData(event.threadID)).data || {};
        data.banned = 1;
        data.banReason = "Banned from menu";
        await Threads.setData(event.threadID, { data });
        global.data.threadBanned.set(parseInt(event.threadID), 1);
        return reply("🚫 BOT is now OFF (banned) in this chat.");
      }

      case "5": { // ✅ UNBAN this thread
        const data = (await Threads.getData(event.threadID)).data || {};
        data.banned = 0;
        delete data.banReason;
        await Threads.setData(event.threadID, { data });
        global.data.threadBanned.delete(parseInt(event.threadID));
        return reply("🟢 BOT is now ON (unbanned) in this chat.");
      }

      case "6": { // ♻️ Restart
        reply("♻️ Restarting...", () => setTimeout(()=>process.exit(1), 500));
        return;
      }

      default:
        return reply(T.cancel);
    }
  }

  if (handleReply.type === "deletePick") {
    const idx = parseInt((event.body||"").trim(), 10) - 1;
    const list = handleReply.cmds || [];
    if (!(idx >=0 && idx < list.length)) return api.sendMessage("Invalid number!", event.threadID);
    const name = list[idx];

    return api.sendMessage(T.confirmDel(name), event.threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: "confirmDelete",
        cmdName: name
      });
    });
  }

  if (handleReply.type === "confirmDelete") {
    const ans = (event.body||"").trim().toLowerCase();
    const name = handleReply.cmdName;
    if (!["yes","y","no","n"].includes(ans)) {
      return api.sendMessage("Please reply yes/no", event.threadID);
    }
    if (ans.startsWith("n")) return api.sendMessage(T.cancel, event.threadID);

    const safeName = name.replace(/[^a-z0-9_\-]/gi, "");
    const target = path.join(COMMANDS_DIR, `${safeName}.js`);
    if (!fs.existsSync(target)) return api.sendMessage(T.notFound, event.threadID);

    try {
      fs.unlinkSync(target);
      return api.sendMessage(`🗑️ Deleted: ${safeName}.js`, event.threadID);
    } catch (e) {
      return api.sendMessage(`❌ Delete failed: ${e.message}`, event.threadID);
    }
  }
};
