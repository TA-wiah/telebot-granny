### 💎 Telegram VIP Subscription Bot
This is a Node.js Telegram bot integrated with Paystack to handle VIP subscription payments. After successful payment, users are automatically granted access to a specific Telegram VIP group. It is designed to automate subscription and access control without manual checking.

## ✨ Key Features

- 🔘 Telegram Inline Buttons for VIP Plans
- 💳 Integrated Paystack Payments
- 🔁 Webhook Handling for Payment Confirmation
- 🔒 Secure Invite Link Delivery (auto-deletes after 3 seconds)
- 🛠️ Modular Code Structure (bot logic, server, and webhook separated)
- 🧾 Metadata tagging for each transaction
- 🛠️ Modular and easy-to-read code structure

## 📁 Project Structure

📦 telegram-vip-bot/ 
        ├── bot.js # Handles the Telegram bot logic 
        ├── webhook.js # Webhook endpoint to receive Paystack responses 
        ├── server.js # Starts Express and ties it all together 
        ├── index.js # Entry point to launch the server 
        │── database.js # Handles data collection
        ├── config.js # Store sensitive credentials 
        ├── package.json 
        └── README.md


## 🧩 Requirements

- Node.js
- Telegram Bot Token
- Paystack Secret Key

## 🔧 Setup Instructions

1. **Clone this repo**

   git clone https://github.com/TA-wiah/telebot-granny.git
   cd telegram-vip-bot

Install dependencies
- npm install

Create a .env file in the root folder:

// .env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PAYSTACK_SECRET_KEY=your_paystack_secret_key
WEBHOOK_SECRET=your_webhook_secret


Run the bot

Deploy webhook

Ensure your webhook endpoint (https://yourserver.com/webhook) is publicly accessible.

Use services like Render, Railway, or Glitch for quick deployment.

## 🤝 Contributing

Want to help improve the bot? Feel free to fork and contribute:
git clone https://github.com/yourusername/telegram-vip-bot.git

Create a new branch
Make your changes
Submit a pull request

## 🛠️ Deployment Notes
Ensure your /webhook endpoint is accessible from Paystack (use Ngrok during development).

Recommended cloud platforms:
- Render
- Railway
- Vercel (API-only)
- Glitch



## ❗ Troubleshooting
Payment do not trigger bot?
Ensure metadata includes chat_id and vip in initiatePayment()
Check if Paystack webhook is correctly set in your Paystack dashboard
Invite link not sent?
Make sure Telegram bot has permission to send messages and group links
Check the bot is not blocked or muted by user


## 💬 VIP Plans
Plan	 Price (USD)	 Telegram Group Invite
VIP 1	  $50	           ✅

VIP 2	  $100		   ✅

VIP 3	  $200	           ✅

VIP 4	  $350	           ✅

VIP 5	  $500	           ✅

- Links are only shown after successful payment and auto-deleted after 3 seconds.

## 📜 License
- This project is licensed under the MIT License.

Developed by Cyber_Jay with ❤️ for easy Telegram monetization — Automate access. Save time. Go VIP.
---
