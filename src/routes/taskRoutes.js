const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const taskController = require('../controllers/taskController')

router.get('/tasks', authenticateToken, taskController.list);
router.post('/tasks', authenticateToken, taskController.create);
router.delete('/tasks/:id', authenticateToken, taskController.remove);

module.exports = router;