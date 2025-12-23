const express = require('express');
const dotenv = require('dotenv');
const authenticateToken = require('./middlewares/authMiddleware'); 
const { validateRegistration } = require('./middlewares/validation');
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const path = require('path');

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

app.post('/api/users', validateRegistration, userController.register);
app.post('/api/tasks', authenticateToken, taskController.create);
app.post('/api/users/register', validateRegistration, userController.register); 
app.post('/api/users/login', userController.login);



app.get('/api/users/profile', authenticateToken, userController.getProfile);
app.get('/api/tasks', authenticateToken, taskController.list);



app.delete('/api/tasks/:id', authenticateToken, taskController.remove);



app.get('/', (req, res) => {
    res.send("Node.js sunucusu çalışıyor!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Sunucu tarafında bir hata oluştu.'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor: http://localhost:${PORT}`);
});