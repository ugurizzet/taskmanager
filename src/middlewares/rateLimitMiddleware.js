const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'You have sent too many requests, please try again in 15 minutes.'},
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = limiter;