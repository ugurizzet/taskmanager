const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const { validateRegistration } = require('../middlewares/validation');

router.post('/register',validateRegistration, userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh-token', userController.refreshToken);
router.get('/profile', authenticateToken, userController.getProfile);

module.exports = router;