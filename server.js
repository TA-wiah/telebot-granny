// server.js
const express = require('express');
const webhookRoutes = require('./webhook');

const app = express();
app.use(express.json());
app.use('/', webhookRoutes);

app.listen(3000, () => console.log("Webhook server running on port 3000"));
