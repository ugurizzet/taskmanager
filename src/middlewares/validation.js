const { body, validationResult } = require('express-validator');

const noSpaces = (value) => {
    if (value.includes(' ')) {
        throw new Error('Username cannot contain spaces.');
    }
    return true;
};

const validateRegistration = [
    body('username')
        .notEmpty().withMessage('The username cannot be empty.')
        .isLength({ min: 3 }).withMessage('The username must be at least 3 characters long.')
        .custom(noSpaces),

    body('email')
        .isEmail().withMessage('Please enter a valid email address.'),

    body('password')
        .isLength({ min: 6 }).withMessage('The password must be at least 6 characters long.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                status: 'error',
                errors: errors.array() 
            });
        }
        next();
    }
];

module.exports = { validateRegistration };