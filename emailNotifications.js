// --------------------------------------------------
// emailNotifications.js
// --------------------------------------------------
// Purpose: Send match result emails
// --------------------------------------------------

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "firebase/firestore";

dotenv.config();

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function getRepEmail(country) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("country", "==", country));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].data().email;
  }
  return null;
}

export async function sendMatchResultEmail(match, score1, score2, scorers, winner) {
  const email1 = await getRepEmail(match.team1.country);
  const email2 = await getRepEmail(match.team2.country);
  
  const emails = [email1, email2].filter(e => e);
  
  if (emails.length === 0) {
    console.log("   📧 No representative emails found");
    return;
  }
  
  const scorersHTML = scorers.map(s => 
    `<li>⚽ ${s.player} (${s.team}) - ${s.minute}'</li>`
  ).join("");
  
  const mailOptions = {
    from: `"African Nations League" <${process.env.EMAIL_USER}>`,
    to: emails.join(", "),
    subject: `Match Result: ${match.team1.country} vs ${match.team2.country}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">🏆 African Nations League</h2>
        <h3>${match.round}</h3>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="text-align: center; margin: 0;">
            ${match.team1.country} <span style="color: #27ae60;">${score1} - ${score2}</span> ${match.team2.country}
          </h2>
          ${winner.wonBy === "penalties" ? 
            `<p style="text-align: center; color: #e74c3c; font-weight: bold;">🎯 ${winner.country} wins on penalties!</p>` 
            : ""}
        </div>
        
        <h4>Goal Scorers:</h4>
        <ul>${scorersHTML || "<li>No goals scored</li>"}</ul>
        
        <p><strong>Winner:</strong> ${winner.country}</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          This match was ${match.simulationType === "simulated" ? "simulated" : "played with AI commentary"}
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`   📧 Email sent to: ${emails.join(", ")}`);
  } catch (error) {
    console.log(`   📧 Email failed: ${error.message}`);
  }
}