const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token not found.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'The token is invalid or has expired.' });
        }

        req.user = user;
        next(); 
    });
};

module.exports = authenticateToken;