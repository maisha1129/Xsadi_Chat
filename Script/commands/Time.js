const moment = require("moment-timezone");
const fs = require("fs-extra");
const { createCanvas } = require("canvas");

module.exports.config = {
 name: "time",
 version: "4.0",
 hasPermssion: 0,
 credits: "🔰𝐒𝐀𝐃𝐈 𝐈𝐒𝐋𝐀𝐌🔰",
 description: "Beautiful neon-style date/time generator",
 commandCategory: "Info",
 cooldowns: 1
};

module.exports.run = async function ({ api, event }) {

 const date = moment.tz("Asia/Dhaka").format("DD MMMM YYYY");
 
 const time = moment.tz("Asia/Dhaka").format("hh:mm A");
 const day = moment.tz("Asia/Dhaka").format("dddd");

 const WIDTH = 900;
 const HEIGHT = 1100;

 const canvas = createCanvas(WIDTH, HEIGHT);
 const ctx = canvas.getContext("2d");

 // Background gradient
 let gradient = ctx.createRadialGradient(
   WIDTH/2, HEIGHT/2, 100,
   WIDTH/2, HEIGHT/2, 600
 );
 gradient.addColorStop(0, "#001010");
 gradient.addColorStop(1, "#000000");
 ctx.fillStyle = gradient;
 ctx.fillRect(0, 0, WIDTH, HEIGHT);

 // Outer neon glow frame
 ctx.shadowColor = "#00FFE5";
 ctx.shadowBlur = 40;
 ctx.lineWidth = 15;
 ctx.strokeStyle = "#00FFE5";
 ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

 ctx.shadowBlur = 0;

 // TIME
 ctx.font = "110px Arial Black";
 ctx.fillStyle = "#FFFFFF";
 ctx.textAlign = "center";
 ctx.fillText(time, WIDTH / 2, 220);

 // DAY
 ctx.font = "80px Arial Black";
 ctx.fillStyle = "#FF33F7";
 ctx.fillText(day.toUpperCase(), WIDTH / 2, 330);

 // DATE
 ctx.font = "45px Arial";
 ctx.fillStyle = "#CFCFCF";
 ctx.fillText(date, WIDTH / 2, 400);

 // Calendar
 ctx.font = "38px Arial";
 const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
 ctx.fillStyle = "#00FFC8";
 let x = 120;
 let y = 500;

 days.forEach(d => {
   ctx.fillText(d, x, y);
   x += 110;
 });

 // Dates
 let firstDay = moment().startOf("month").day();
 let totalDays = moment().daysInMonth();

 x = 120;
 y = 570;
 for (let i = 0; i < firstDay; i++) x += 110;

 for (let d = 1; d <= totalDays; d++) {
   if (d === moment().date()) {
     // Highlight circle
     ctx.beginPath();
     ctx.arc(x, y - 30, 42, 0, Math.PI * 2);
     ctx.fillStyle = "#FFF200";
     ctx.fill();

     ctx.font = "45px Arial Black";
     ctx.fillStyle = "#000";
     ctx.fillText(d, x, y - 15);
   } else {
     ctx.font = "42px Arial";
     ctx.fillStyle = "#D0D0D0";
     ctx.fillText(d, x, y - 15);
   }

   x += 110;
   if (x > 800) {
     x = 120;
     y += 100;
   }
 }

 
 ctx.font = "40px Arial Black";
 ctx.fillStyle = "#00FFE5";
 ctx.shadowColor = "#00FFE5";
 ctx.shadowBlur = 25;
 ctx.fillText("Rahat Bot", WIDTH / 2, HEIGHT - 70);

 ctx.shadowBlur = 0;

 // Save
 const output = __dirname + "/cache/rahat_time.jpg";
 fs.writeFileSync(output, canvas.toBuffer("image/jpeg"));

 // Send image + current date & time
 api.sendMessage(
   { 
     body: `⏱️ সময় ${time} \n🗓️ তারিখ ${date} `,
     attachment: fs.createReadStream(output) 
   },
   event.threadID,
   () => fs.unlinkSync(output)
 );
};
