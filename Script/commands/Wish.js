module.exports.config = {
 name: "wish",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰",
 description: "Happy birthday wish for your friends",
 commandCategory: "🩵love🩵",
 usages: "[@mention/reply/UID/link/name]",
 dependencies: {
 axios: "",
 "fs-extra": ""
 },
 cooldowns: 0
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

module.exports.wrapText = (ctx, text, maxWidth) => {
 return new Promise(resolve => {
 if (ctx.measureText(text).width < maxWidth) return resolve([text]);
 if (ctx.measureText("W").width > maxWidth) return resolve(null);

 const words = text.split(" ");
 const lines = [];
 let line = "";

 while (words.length > 0) {
 let split = false;
 while (ctx.measureText(words[0]).width >= maxWidth) {
 const word = words[0];
 words[0] = word.slice(0, -1);
 if (split) {
 words[1] = word.slice(-1) + words[1];
 } else {
 split = true;
 words.splice(1, 0, word.slice(-1));
 }
 }

 if (ctx.measureText(line + words[0]).width < maxWidth) {
 line += words.shift() + " ";
 } else {
 lines.push(line.trim());
 line = "";
 }

 if (words.length === 0) {
 lines.push(line.trim());
 }
 }
 return resolve(lines);
 });
};

module.exports.run = async function ({
 args,
 Users,
 Threads,
 api,
 event,
 Currencies
}) {
 const { loadImage, createCanvas } = require("canvas");
 const fs = require("fs-extra");
 const axios = require("axios");
 
 const { threadID, messageID, senderID } = event;
 let targetID;

 // ===== Determine targetID in three ways =====
 if (event.type === "message_reply") {
 // Way 1: Reply to a message
 targetID = event.messageReply.senderID;
 } else if (args[0]) {
 if (args[0].indexOf(".com/") !== -1) {
 // Way 2: Facebook profile link
 targetID = await api.getUID(args[0]);
 } else if (args.join().includes("@")) {
 // Way 3: Mention or full name
 // 3a: Direct Facebook mention
 targetID = Object.keys(event.mentions || {})[0];
 if (!targetID) {
 // 3b: Full name detection
 targetID = await getUIDByFullName(api, event.threadID, args.join(" "));
 }
 } else {
 // Direct UID
 targetID = args[0];
 }
 } else {
 // No target specified - use sender's own ID (birthday wish for self)
 targetID = senderID;
 }

 if (!targetID) {
 return api.sendMessage("❌ছাদি বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
 }

 let bgPath = __dirname + "/cache/background.png";
 let avtPath = __dirname + "/cache/Avtmot.png";

 const targetName = await Users.getNameUser(targetID);
 const wisherName = await Users.getNameUser(event.senderID);

 const bgURLs = ["https://i.postimg.cc/k4RS69d8/20230921-195836.png"];
 const bgURL = bgURLs[Math.floor(Math.random() * bgURLs.length)];

 let avtData = (await axios.get(
 `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
 { responseType: "arraybuffer" }
 )).data;
 fs.writeFileSync(avtPath, Buffer.from(avtData, "utf-8"));

 let bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
 fs.writeFileSync(bgPath, Buffer.from(bgData, "utf-8"));

 let bgImage = await loadImage(bgPath);
 let avtImage = await loadImage(avtPath);
 let canvas = createCanvas(bgImage.width, bgImage.height);
 let ctx = canvas.getContext("2d");

 ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
 ctx.font = "400 32px Arial";
 ctx.fillStyle = "#1878F3";
 ctx.textAlign = "start";

 const nameLines = await this.wrapText(ctx, targetName, 1160);
 ctx.fillText(nameLines.join("\n"), 120, 727);

 ctx.beginPath();
 ctx.drawImage(avtImage, 70, 270, 400, 400);

 const imageBuffer = canvas.toBuffer();
 fs.writeFileSync(bgPath, imageBuffer);
 fs.removeSync(avtPath);

 return api.sendMessage({
 body:
 "┏┓┏┓\n" +
 "┃┗┛ 𝒂𝒑𝒑𝒚_🎂🎆🎉\n" +
 "┃┏┓┃ 🄱🄸🅁🅃🄷🄳🄰🅈🎉🎆\n" +
 "┗┛┗┛ Birthday Wishes For You..💐💗\n" +
 "🥰 " + targetName + " 😘\n\n" +
 "_𝐇𝐚𝐩𝐩𝐲 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 🎂_\n" +
 "অনেক অনেক শুভ কামনা, দোয়া ও ভালবাসা রইল তোমার জন্য ❤\n" +
 "তোমার জীবনের প্রতিটা ক্ষণ আনন্দময় হোক এই কামনা করি...\n" +
 "শুভ জন্মদিন 🎂🎂🎂\n" +
 "🌷🌷\n\n" +
 "_𝐇𝐚𝐩𝐩𝐲 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐖𝐢𝐬𝐡𝐞𝐬 𝐟𝐨𝐫 𝐔😍_\n" +
 "𝐈 𝐰𝐢𝐬𝐡 𝐮 𝐦𝐚𝐧𝐲 𝐦𝐨𝐫𝐞 𝐡𝐚𝐩𝐩𝐲 𝐫𝐞𝐭𝐮𝐫𝐧𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐝𝐚𝐲 💞\n\n" +
 "🖤 আশা করি সারাজীবন এমনই থাকবা, সবসময় ভালো থাকো এই কামনা করি\n" +
 "❤ জন্মদিনে শুধু এটাই কাম‍্য যাতে ভবিষ্যতে অনেক অনেক সুখী হও ❤\n" +
 "শুভ জন্মদিন 🫂 ❤️‍🩹\n\n" +
 "𝐌𝐚𝐤𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐰𝐢𝐬𝐡:" + wisherName,
 attachment: fs.createReadStream(bgPath)
 }, event.threadID, () => fs.unlinkSync(bgPath), event.messageID);
};
