const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./subscriptions.db');

// Create table if not exists
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
        chat_id TEXT PRIMARY KEY,
        vip_level TEXT
    )`);
});

module.exports = db;
