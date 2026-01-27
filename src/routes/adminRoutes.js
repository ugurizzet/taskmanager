const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/adminMiddleware');
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');




router.get('/users', authenticateToken, isAdmin, userController.getAllUsers);
router.delete('/users/:id', authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;