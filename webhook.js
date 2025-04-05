// webhook.js

const express = require('express');
const router = express.Router();
const { bot, vipLinks } = require('./bot');
const db = require('./database');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Make sure this is defined in .env or Render

// Telegram Webhook (connects to Telegram bot API)
router.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Paystack Webhook (charge.success, charge.failed)
router.post('/webhook', (req, res) => {
    const event = req.body;

    if (event.event === "charge.success") {
        const chatId = event.data.metadata.chat_id;
        const vipLevel = event.data.metadata.vip;
        const groupLink = vipLinks[vipLevel];

        // Save subscription to DB
        db.run(
            `INSERT OR REPLACE INTO subscriptions (chat_id, vip_level) VALUES (?, ?)`,
            [chatId, vipLevel]
        );

        const successMessage = `
🎉 *Congratulations!* 🎉

Your payment for *${vipLevel.toUpperCase()}* was successful. 🥳  
You're now officially a VIP member! 🔐💎

👇 Tap the link below to join your exclusive VIP group:
${groupLink}

_⚠️ Note: This link will disappear in 3 seconds for security._
        `;

        bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' })
            .then((sentMessage) => {
                setTimeout(() => {
                    bot.deleteMessage(chatId, sentMessage.message_id);
                }, 3000);
            });
    } else if (event.event === "charge.failed") {
        const chatId = event.data.metadata.chat_id;
        bot.sendMessage(chatId, "❌ Payment failed. Please try again.");
    }

    res.sendStatus(200);
});

module.exports = router;
