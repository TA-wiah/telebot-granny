require('dotenv').config();

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET
};
