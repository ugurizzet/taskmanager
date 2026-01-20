const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
require('dotenv').config();

const db = new sqlite3.Database(process.env.DB_PATH , (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('✅ A connection was established to the SQLite database.');
        db.serialize(() => {    
            db.run(`PRAGMA foreign_keys = ON;`);
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )`);
        });
    }
});
module.exports = db;