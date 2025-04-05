// bot.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { PAYSTACK_SECRET_KEY, TELEGRAM_BOT_TOKEN } = require('./config');
require('dotenv').config(); // Make sure to load your environment variables

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`https://telebot-granny.onrender.com/bot${TELEGRAM_BOT_TOKEN}`);

// const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const vipPrices = {
    vip1: 50,
    vip2: 100,
    vip3: 200,
    vip4: 350,
    vip5: 500
};

const vipLinks = {
    vip1: "https://t.me/+Dg396UTpdbc1OTVk",
    vip2: "https://t.me/+Dg396UTpdbc1OTVk",
    vip3: "https://t.me/+Dg396UTpdbc1OTVk",
    vip4: "https://t.me/+Dg396UTpdbc1OTVk",
    vip5: "https://t.me/+Dg396UTpdbc1OTVk"
};

const ADMIN_CHAT_ID = 5713039213; // Replace with your actual numeric Telegram chat ID
const ADMIN_PASSWORD = "your_password";
const pendingAuth = {};

// to print your Chat_ID
// bot.on('message', (msg) => {
//     console.log("Chat ID:", msg.chat.id);
// });


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const welcomeMessage = `
👋 *Welcome to the VIP Subscription Bot!*

With this bot, you can unlock access to our _exclusive_ VIP Telegram groups. Each tier offers increasing value, benefits, and private content. 💎

🧾 *How It Works:*
1. Use the /subscribe command to choose your VIP level
2. Complete payment securely via Paystack 💳
3. Instantly receive a link to join your VIP group 🚪
4. Link disappears after 3 seconds for your security 🔐

📦 *Available Commands:*
- /subscribe — View all VIP packages and prices
- /mysubscription — View all VIP subscription
- /help — How the bot works
- /contact — Need assistance?


⚙️ *Support:* Our team is always here to help.
`;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Handle /subscribe command
bot.onText(/\/subscribe/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "📦 Please choose a VIP package to subscribe:", {
        reply_markup: {
            inline_keyboard: Object.keys(vipPrices).map(vip => [
                { text: `${vip.toUpperCase()} - $${vipPrices[vip]}`, callback_data: vip }
            ])
        }
    });
});

// Handle button click (VIP package selection)
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const selectedVip = query.data;

    if (!vipPrices[selectedVip]) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Invalid selection." });
    }

    const amount = vipPrices[selectedVip];

    try {
        const response = await initiatePayment(chatId, selectedVip, amount);

        if (response.status && response.data && response.data.authorization_url) {
            bot.sendMessage(chatId, "✅ Please click the button below to complete your payment:", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "💳 Pay with Paystack", url: response.data.authorization_url }
                        ]
                    ]
                }
            });
        } else {
            bot.sendMessage(chatId, "❌ Error processing payment. Please try again later.");
        }
    } catch (error) {
        console.error("Payment initiation failed:", error);
        bot.sendMessage(chatId, "⚠️ Something went wrong while initiating payment.");
    }
});


// API key should be stored in the .env file for security
const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY; // Use this key from the environment variable

async function initiatePayment(chatId, vip, usdAmount) {
    try {
        // Validate USD amount
        if (isNaN(usdAmount) || usdAmount <= 0) {
            throw new Error('Invalid USD Amount');
        }

        // Convert USD to GHS using exchangerate.host API
        const exchangeRes = await axios.get('https://api.exchangerate.host/convert', {
            params: {
                from: 'USD',
                to: 'GHS',
                amount: usdAmount,
                api_key: EXCHANGE_API_KEY // Make sure to pass the API key securely
            }
        });

        // Log the full API response to debug
        console.log('Exchange API Response:', exchangeRes.data);

        // Check if the exchange response is valid
        if (!exchangeRes.data.result) {
            throw new Error('Invalid response from the exchange API.');
        }

        // Parse the GHS amount and convert it to kobo (Pesewas)
        const ghsAmount = parseFloat(exchangeRes.data.result);
        const amountInKobo = Math.round(ghsAmount * 100); // Convert GHS to kobo (1 GHS = 100 kobo)

        console.log(`USD: $${usdAmount} → GHS: ₵${ghsAmount} → Pesewas: ${amountInKobo}`);

        // Ensure that the amount is valid and greater than 0
        if (amountInKobo <= 0 || isNaN(amountInKobo)) {
            throw new Error("Invalid converted amount.");
        }

        // Call Paystack API to initialize the payment
        const response = await axios.post("https://api.paystack.co/transaction/initialize", {
            email: `${chatId}@telegram.com`,
            amount: amountInKobo,
            metadata: { chat_id: chatId, vip },
            callback_url: `https://telebot-granny.onrender.com/webhook`
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` // Ensure your Paystack secret key is set correctly in your environment variables
            }
        });

        // Return the Paystack response data
        return response.data;
    } catch (error) {
        console.error("Payment Error:", error.response?.data || error.message);
        if (error.response) {
            console.log('API Response:', error.response.data); // Log the full error response from the Paystack API
        }
        return { status: false };
    }
}


// bot.onText(/\/mysubscription/, (msg) => {
//     const chatId = msg.chat.id;

//     if (userSubscriptions[chatId]) {
//         const vip = userSubscriptions[chatId].toUpperCase();
//         bot.sendMessage(chatId, `📄 *Your Subscription:*\n\nYou are currently subscribed to *${vip}*.\n\nThank you for being a VIP! 💎`, { parse_mode: 'Markdown' });
//     } else {
//         bot.sendMessage(chatId, "❌ You don't have an active VIP subscription.\nUse /subscribe to join a plan.", { parse_mode: 'Markdown' });
//     }
// });

bot.onText(/\/mysubscription/, (msg) => {
    const chatId = msg.chat.id;

    db.get(`SELECT vip_level FROM subscriptions WHERE chat_id = ?`, [chatId], (err, row) => {
        if (err) {
            console.error(err);
            bot.sendMessage(chatId, "⚠️ Error retrieving your subscription. Please try again.");
            return;
        }

        if (row) {
            const vip = row.vip_level.toUpperCase();
            bot.sendMessage(chatId, `📄 *Your Subscription:*\n\n\nYou are currently subscribed to *${vip}*.\n\nThank you for being a VIP! 💎`, { parse_mode: 'Markdown' });
        } else {
            bot.sendMessage(chatId, "❌ You don't have an active VIP subscription.\nUse /subscribe to join a plan.", { parse_mode: 'Markdown' });
        }
    });
});


bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `
❓ *Need Help?*

1. Use /subscribe to view and select your VIP level
2. Tap on a plan to generate a payment link
3. After payment, you'll receive a private group invite
4. The invite link will self-destruct in 3 seconds 🕒

If your payment was successful but you didn’t receive the link, please use /contact to reach us.
`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/contact/, (msg) => {
    const chatId = msg.chat.id;

    const contactMessage = `
📬 *Need to Talk to Us?*

You can reach support through:

- Telegram: [@junior_billyhills](https://t.me/junior_billyhills)
- Email: [support@forexforge.com](tottimehtawiah@gmail)

We're happy to help you!
`;

    bot.sendMessage(chatId, contactMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/subscribers/, (msg) => {
    const chatId = msg.chat.id;
    if (chatId !== ADMIN_CHAT_ID) {
        bot.sendMessage(chatId, "🚫 You are not authorized to use this command.");
        return;
    }

    pendingAuth[chatId] = true;
    bot.sendMessage(chatId, "🔐 Please enter the admin password to view the subscribers:");
});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!pendingAuth[chatId]) return;

    if (text === ADMIN_PASSWORD) {
        delete pendingAuth[chatId];
        db.all(`SELECT chat_id, vip_level FROM subscriptions`, [], (err, rows) => {
            if (err) {
                bot.sendMessage(chatId, "⚠️ Error retrieving subscribers.");
                return;
            }

            if (rows.length === 0) {
                bot.sendMessage(chatId, "📭 No subscribers found.");
                return;
            }

            let message = `📋 *List of Subscribers (${rows.length}):*\n\n`;
            rows.forEach((row, index) => {
                message += `${index + 1}. Chat ID: \`${row.chat_id}\` — *${row.vip_level.toUpperCase()}*\n`;
            });

            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        });
    } else {
        delete pendingAuth[chatId];
        bot.sendMessage(chatId, "❌ Incorrect password. Access denied.");
    }
});

console.log("Bot is running...");

module.exports = { bot, vipLinks };
