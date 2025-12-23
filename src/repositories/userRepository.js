const db = require('../config/database');

const createUser = (user) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [user.username, user.email, user.password], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...user });
        });
    });
};

const findByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.get(sql, [email], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

module.exports = { createUser, findByEmail };