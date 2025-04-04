// webhook.js

const express = require('express');
const router = express.Router();
const { bot, vipLinks } = require('./bot');
const db = require('./database');
require('dotenv').config();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Make sure this is defined in .env or Render

// Telegram Webhook (connects to Telegram bot API)
router.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Paystack Webhook (charge.success, charge.failed)
router.post('/webhook', (req, res) => {
    const event = req.body;
    console.log("Paystack Webhook Event:", JSON.stringify(event, null, 2)); // temporary


    if (event.event === "charge.success") {
        const chatId = event.data.metadata.chat_id;
        const vipLevel = event.data.metadata.vip;
        const groupLink = vipLinks[vipLevel];

        // Save or add subscription to DB
        db.get(`SELECT * FROM subscriptions WHERE chat_id = ?`, [chatId], (err, row) => {
            if (err) {
                console.error("Error checking for existing subscription:", err);
            } else if (row) {
                console.log("Subscription already exists for chat_id:", chatId);
        
                // Add the new vip_level to the existing one (combine them if they're different)
                const existingVipLevels = row.vip_level.split(', ');  // Assuming vip_levels are stored as comma-separated values
                if (!existingVipLevels.includes(vipLevel)) {
                    // If the new vip_level is not already included, add it
                    existingVipLevels.push(vipLevel);
        
                    // Update the subscription with the new combined vip_levels
                    const updatedVipLevels = existingVipLevels.join(', ');  // Join the levels back as a string
                    db.run(
                        `UPDATE subscriptions SET vip_level = ? WHERE chat_id = ?`,
                        [updatedVipLevels, chatId],
                        (err) => {
                            if (err) {
                                console.error("Error updating subscription to add new vip_level:", err);
                            } else {
                                console.log(`Subscription updated for chat_id: ${chatId} with new vip_levels: ${updatedVipLevels}`);
                            }
                        }
                    );
                } else {
                    console.log(`The user already has the ${vipLevel} VIP level.`);
                }
            } else {
                // If no existing subscription, insert the new subscription
                db.run(
                    `INSERT INTO subscriptions (chat_id, vip_level) VALUES (?, ?)`,
                    [chatId, vipLevel],
                    (err) => {
                        if (err) {
                            console.error("Error saving subscription to database:", err);
                        } else {
                            console.log(`Subscription saved for chat_id: ${chatId}, vip_level: ${vipLevel}`);
                        }
                    }
                );
            }
        });


        const successMessage = `
🎉 *Congratulations!* 🎉

Your payment for *${vipLevel.toUpperCase()}* was successful. 🥳  
You're now officially a VIP member! 🔐💎

👇 Tap the link below to join your exclusive VIP group:
${groupLink}

_⚠️ Note: This link will disappear in 20 seconds for security._
        `;

        bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' })
            .then((sentMessage) => {
                setTimeout(() => {
                    bot.deleteMessage(chatId, sentMessage.message_id);
                }, 15000); // 15000 ms = 0.15 minute
            });
    } else if (event.event === "charge.failed") {
        const chatId = event.data.metadata.chat_id;
        bot.sendMessage(chatId, "❌ Payment failed. Please try again.");
    }

    res.sendStatus(200);
});

// Handle GET request when user is redirected from Paystack
router.get('/webhook', (req, res) => {
    res.sendFile(require('path').join(__dirname, 'public/success.html'));
});


module.exports = router;
