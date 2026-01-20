const express = require('express');
const dotenv = require('dotenv');
const authenticateToken = require('./middlewares/authMiddleware'); 
const { validateRegistration } = require('./middlewares/validation');
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const path = require('path');
const cookieParser = require('cookie-parser');
const isAdmin = require('./middlewares/adminMiddleware');

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));



// userController
app.post('/api/users/register', validateRegistration, userController.register); 
app.post('/api/users/login', userController.login);
app.post('/api/users/logout', userController.logout);
app.get('/api/users/profile', authenticateToken, userController.getProfile);
// admin routes
app.get('/api/admin/users', authenticateToken, isAdmin, userController.getAllUsers);
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, userController.deleteUser);






// taskController
app.get('/api/tasks', authenticateToken, taskController.list);
app.post('/api/tasks', authenticateToken, taskController.create);
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