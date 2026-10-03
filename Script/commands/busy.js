module.exports.config = {
	name: "offline",
	version: "1.0.0",
	permissions: 2,
	credits: "🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "Turn on or off busy mode",
  	usages: "[reason]",
  	commandCategory: "utility",
  	cooldowns: 5
};

const busyPath = __dirname + '/bot/busy.json';
const fs = require('fs');

module.exports.onLoad = () => {
  if (!fs.existsSync(busyPath)) fs.writeFileSync(busyPath, JSON.stringify({}));
}

module.exports.handleEvent = async function({ api, event, Users }) {
    let busyData = JSON.parse(fs.readFileSync(busyPath));
    var { senderID, threadID, messageID, mentions } = event;
    if (senderID in busyData) {
        var info = busyData[senderID];
        delete busyData[senderID];
        fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
        return api.sendMessage(`『𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻』- বস অনলাইনে এসেছে🥰`, threadID, () => {
            if (info.tag.length == 0) api.sendMessage("『🔰𝐒𝐀𝐃𝐈 𝐁𝐎𝐓🔰』- বস তুমি যখন অফলাইনে ছিলে তখন কেউ তোমাকে ম্যানশন করে নাই🫠", threadID);
            else {
                var msg = "";
                for (var i of info.tag) {
                    msg += `${i}\n`
                }
                api.sendMessage("『🔰𝐒𝐀𝐃𝐈 𝐁𝐎𝐓🔰』- বস তুমি যখন অফলাইনে ছিলে তখন যারা তোমাকে ম্যানশন করেছে👇:\n\n" + msg, threadID)
            }
        }, messageID);
    }

    if (!mentions || Object.keys(mentions).length == 0) return;
    
    for (const [ID, name] of Object.entries(mentions)) {
        if (ID in busyData) {
            var infoBusy = busyData[ID], mentioner = await Users.getNameUser(senderID), replaceName = event.body.replace(`${name}`, "");
            infoBusy.tag.push(`${mentioner}: ${replaceName == "" ? "just mentioned Master once" : replaceName}`)
            busyData[ID] = infoBusy;
            fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
            return api.sendMessage(`👇──『𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻』──👇\n${name.replace("@", "")} বস অফলাইনে গেছে🙂‍↔️\n কোন দরকার থাকলে ম্যানশন দিয়ে লিখে যান,বস লাইনে আসলে আপনার মেসেজটি দিয়ে দিবো${infoBusy.lido ? ` with reason: ${infoBusy.lido}.` : "."}`, threadID, messageID);
        }
    }
}

module.exports.run = async function({ api, event, args, Users }) {
	await new Promise(resolve => setTimeout(resolve, 1000));
    let busyData = JSON.parse(fs.readFileSync(busyPath));
    const { threadID, senderID, messageID, body } = event;
    var content = args.join(" ") || "";
    if (!(senderID in busyData)) {
        busyData[senderID] = {
            lido: content,
            tag: []
        }
        fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
        var msg = (content.length == 0) ? '🔰──『𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻』──🔰\n বস অফলাইনে যাচ্ছে কেউ আর ম্যানশন দিয়ো না🐧' : `🔰──『𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻』──🔰\n বস অফলাইনে যাচ্ছে কেউ আর ম্যানশন দিয়ো না🐧: ${content}`;
        return api.sendMessage(msg, threadID, messageID);
    }
}
