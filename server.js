// server.js
const express = require('express');
const path = require('path');
const webhookRoutes = require('./webhook');

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const app = express();
app.use(express.json());

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', webhookRoutes);

// Add this route to handle callback
app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/success.html'));
});

app.listen(3000, () => console.log("Webhook server running on port 3000"));
