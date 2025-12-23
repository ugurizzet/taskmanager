const userService = require('../services/userService');

const register = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-agent'];
        console.log(`The registration request came from here: ${userAgent}`);

        const user = await userService.registerUser(req.body);

        res.status(201).json({
            message: 'User created successfully.',
            userId: user.id
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

        res.status(200).json({
            message: 'Login successful',
            token: result.token, 
            user: result.user
        });
    } catch (error) {
        res.status(401).json({ error: error.message }); // 401 Unauthorized
    }
};

const getProfile = async (req, res) => {
    res.json({
        message: 'This is protected data.',
        user: req.user 
    });
};

module.exports = { register, login, getProfile };
