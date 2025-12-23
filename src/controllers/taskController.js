const taskService = require('../services/taskService');

const create = async (req, res, next) => {
    try {
        const task = await taskService.createTask(req.body, req.user.id);
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

const list = async (req, res, next) => {
    try {
        const tasks = await taskService.getMyTasks(req.user.id);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        
        const userId = req.user.id;

        await taskService.deleteTask(taskId, userId);
        res.status(200).json({ message: 'The task was successfully deleted.' });
    } catch (error) {
        if (error.message.includes('Access Denied')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Task not found.') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

module.exports = { create, list, remove };