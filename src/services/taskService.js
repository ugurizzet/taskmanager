const taskRepository = require('../repositories/taskRepository');

const createTask = async (taskData, userId) => {
    return await taskRepository.createTask({
        title: taskData.title,
        description: taskData.description,
        userId: userId
    });
};

const getMyTasks = async (userId) => {
    return await taskRepository.findAllByUserId(userId);
};

const deleteTask = async (taskId, currentUserId) => {
    const task = await taskRepository.findById(taskId);
    
    if (!task) {
        throw new Error('Task not found.');
    }

    if (task.user_id !== currentUserId) {
        throw new Error('Access Denied: You do not have permission to delete this task.');
    }

    await taskRepository.deleteTask(taskId);
};

module.exports = { createTask, getMyTasks, deleteTask };