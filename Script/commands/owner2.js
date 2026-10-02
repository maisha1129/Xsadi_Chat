const fs = require("fs");
const { createCanvas } = require("canvas");

module.exports.config = {
    name: "owner2",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "Show stylish Owner Info card (no black border)",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;

    // === Canvas setup ===
    const width = 945;
    const height = 1260;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // === Background: pure smooth blue gradient ===
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#003d66");   // bright navy top
    bg.addColorStop(0.5, "#005c99"); // mid blue
    bg.addColorStop(1, "#007acc");   // bottom soft blue
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // === Card ===
    const cardX = 40, cardY = 50;
    const cardWidth = width - 80, cardHeight = height - 100;
    drawGlassCard(ctx, cardX, cardY, cardWidth, cardHeight, 40);

    // === Title ===
    ctx.font = "bold 70px 'Segoe UI'";
    const grad = ctx.createLinearGradient(cardX, cardY, cardX + 500, cardY);
    grad.addColorStop(0, "#c2f7ff");
    grad.addColorStop(1, "#6de3ff");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#00e0ff77";
    ctx.shadowBlur = 20;
    ctx.fillText("✨ OWNER INFO ✨", cardX + 120, cardY + 100);
    ctx.shadowBlur = 0;

    // === Divider line ===
    ctx.strokeStyle = "#a0f0ff44";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, cardY + 130);
    ctx.lineTo(cardX + cardWidth - 60, cardY + 130);
    ctx.stroke();

    // === Info lines ===
    ctx.font = "bold 40px 'Segoe UI'";
    ctx.fillStyle = "#ffffff";
    let y = cardY + 220;

    const info = [
        "👑 Name : Sadi Islam",
        "🧸 Nickname : Sadi",
        "🎂 Age : 20",
        "💘 Relation : Single",
        "🎓 Profession : Student",
        "🏡 Address : dhaka",
        "",
        "🔗 CONTACT LINKS",
        "📘 Facebook : fb.com/61569092843763",
        "💬 Messenger : m.me/61569092843763"
    ];

    for (const line of info) {
        ctx.fillText(line, cardX + 100, y);
        y += 80;
    }

    // === Decorative bottom line ===
    ctx.strokeStyle = "#a0f0ff33";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 80, cardY + cardHeight - 80);
    ctx.lineTo(cardX + cardWidth - 80, cardY + cardHeight - 80);
    ctx.stroke();

    // (❌ Removed Generated On text)

    // === Export ===
    const buffer = canvas.toBuffer("image/png");
    const filePath = __dirname + "/owner3_card.png";
    fs.writeFileSync(filePath, buffer);

    api.sendMessage({
        body: "💙 𝙎𝘼𝘿𝙄 𝘽𝙊𝙏 💙\n✨ Owner Information ✨",
        attachment: fs.createReadStream(filePath)
    }, threadID, messageID);
};

// === Helpers ===
function drawGlassCard(ctx, x, y, w, h, r) {
    ctx.shadowColor = "#33ddff55";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, x, y, w, h, r, true, false);
    ctx.shadowBlur = 0;
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
                         }
