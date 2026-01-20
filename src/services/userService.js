const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');


require('dotenv').config();

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

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, // Payload
        process.env.JWT_SECRET,             
        { expiresIn: '1h' }                 
    );

    return { token, user: { id: user.id, username: user.username, email: user.email } };
};

module.exports = { registerUser, loginUser };
