const db = require('../config/database');

const createTask = (task) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)`;
        db.run(sql, [task.title, task.description, task.userId], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...task });
        });
    });
};

const findAllByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tasks WHERE user_id = ?`;
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const findById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tasks WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const deleteTask = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM tasks WHERE id = ?`;
        db.run(sql, [id], function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = { createTask, findAllByUserId, findById, deleteTask };