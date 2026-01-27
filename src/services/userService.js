const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const db = require('../config/database')
require('dotenv').config();

const saveRefreshToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);

        db.run("INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
            [token, userId, expiresAt.toISOString()],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};



const registerUser = async (userData) => {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
        throw new Error('This email address is already in use.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user'
    };

    return await userRepository.createUser(newUser);
};


const loginUser = async (email, password) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    const accessToken = jwt.sign(
        {id: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,             
        { expiresIn: '1d' }                 
    );

    await saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken , user: { id: user.id, username: user.username, email: user.email } };
};

const refreshAccessToken = async (oldRefreshToken) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM refresh_tokens WHERE token = ?",
            [oldRefreshToken],
            (err, row) => {

                if (err || !row) return reject (new Error("Invalid Refresh Token"))
                
                if (new Date(row.expires_at) < new Date()) {
                    db.run("DELETE FROM refresh_tokens WHERE token = ?",
                        [oldRefreshToken]
                    );
                    return reject(new Error("Refresh Token has expired."))
                }

                jwt.verify(oldRefreshToken, process.env.JWT_SECRET, async (err, decoded) => {
                    if (err) return reject(new Error('Token could not be verified.'));

                    db.run("DELETE FROM refresh_tokens WHERE token = ?", [oldRefreshToken]);

                    const newAccessToken = jwt.sign({id: decoded.id}, process.env.JWT_SECRET, {expiresIn: '15m'});
                    const newRefreshToken = jwt.sign({id: decoded.id}, process.env.JWT_SECRET, {expiresIn: '15m'});

                    await saveRefreshToken(decoded.id, newRefreshToken);

                    resolve({ newAccessToken, newRefreshToken})
                })
            }
        )
    })
}

const logoutUser = async (refreshToken) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken], (err) => {
            if (err){
                reject(err)
            } else{
                resolve();
            }
        })
    })
}
module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
