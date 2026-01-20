const userService = require('../services/userService');
const db = require("../config/database");

const register = async (req, res, next) => {
    try {
        const {username, email, password, adminKey} = req.body;

        const role =(adminKey === process.env.ADMIN_SECRET) ? 'admin' : 'user';

        await userService.registerUser({ username, email, password, role });
        res.status(201).json({
            message: 'User created successfully.',
            role: role
        });
    } catch (error) {
        if (error.message === 'This email address is already in use.') {
            return res.status(400).json({ error: error.message });
        }
        next(error); // 500
    }
};





const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const result = await userService.loginUser(email, password);
        const { password: passwordHash, ...userSafeData } = result.user;

        res.cookie('token', result.token, {
            httpOnly: true, //xss
            secure: false, //localhost
            sameSite: 'strict', //csrf
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({
            message: 'Login successful',
            user: userSafeData,
        });
    } catch (error) {
        res.status(401).json({ error: error.message }); // 401 Unauthorized
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}

const getProfile = async (req, res) => {
    res.json({
        message: 'This is protected data.',
        user: req.user 
    });
};

const getAllUsers = (req, res) => {
    console.log("getalluser basladi")
    const sql = "SELECT id, username, email, role FROM users";

    db.all(sql, [], (err, rows) => {
        res.json(rows);
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log("2. asama tamamlandi", rows.length)
    });
};

const deleteUser = (req, res) => {
    const db = require("../config/database");
    const id = req.params.id;

    if(parseInt(id) === req.user.id){
        return res.status(400).json({ error: "You cannot delete your own account." });
    }

    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted successfully.' });
    });
};

module.exports = { register, login, getProfile, logout, getAllUsers, deleteUser };
