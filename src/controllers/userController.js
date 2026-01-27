const userService = require('../services/userService');
const db = require("../config/database");
const logger = require('../utils/logger')

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
}

const refreshCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
}

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
        logger.info(`New user registration: ${req.body.username}`)
    }
};





const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        
        res.cookie('token', result.accessToken, cookieOptions);
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)

        logger.info(`Successful login: ${email}`);
        const { password: pw, ...userSafe } = result.user;
        res.status(200).json({ message: 'Login successful', user: userSafe});
        } catch (error) {
            logger.warn(`Failed login attempt: ${req.body.email} - ${error.message}`)
            res.status(401).json({ error: error.message })
        }
};

const refreshToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) return res.status(401).json({error: 'Refresh token not found.'});

        const tokens = await userService.refreshAccessToken(oldRefreshToken);

        res.cookie('token', tokens.newAccessToken, cookieOptions);
        res.cookie('refreshToken', tokens.newRefreshToken, refreshCookieOptions);

        logger.info('Token has been renewed (Rotation applied)');
        res.json({message:'The token has been updated.'});
        } catch (error) {
            logger.error(`Token refresh error: ${error.message}`);
            res.status(403).json({error: 'Invalid token'})
        };
}


const logout = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await userService.logoutUser(refreshToken);
        } 
        
        res.clearCookie('token');
        res.clearCookie('refreshToken');

        logger.info('User logged out.');
        res.status(200).json({message: 'logged out'});
        } catch (error) {
            logger.error(`Logout error: ${error.message}`)
            res.status(500).json({error: error.mesaage })
        }
};


const getProfile = async (req, res) => {
    const db = require('../config/database')
    const sql = "SELECT id, username, email, role FROM users WHERE id = ?";
    db.get(sql,[req.user.id], (err, row)=>{
        res.json(row);
        if (err) {
            return res.status(500).json({error:err.message});
        }
        if (!row) {
            return res.status(404).json({error:"User not found."})
        }
    })
};

const getAllUsers = (req, res) => {
    const sql = "SELECT id, username, email, role FROM users";

    db.all(sql, [], (err, rows) => {
        res.json(rows);
        if (err) {
            return res.status(500).json({ error: err.message });
        }
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

module.exports = { register, login, getProfile, logout, getAllUsers, deleteUser, refreshToken };
