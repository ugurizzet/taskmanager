const API_URL = 'http://localhost:3000/api';

const redirectError = (msg) => {
    localStorage.setItem('errorMsg', msg);
    window.location.href = 'error.html';
};

function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    if (loginSec && regSec) {
        loginSec.classList.toggle('hidden');
        regSec.classList.toggle('hidden');
    }
}


async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/users/profile`);
        if (res.ok) {
            const data = await res.json();
            const welcomeMsg = document.getElementById('welcome-msg');
            if (welcomeMsg) welcomeMsg.innerText = `Tasks for ${data.username}`;
            loadTasks();
        } else {
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error("Auth check failed", err);
        window.location.href = 'index.html';
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/users/logout`, { method: 'POST' });
        window.location.href = 'index.html';
    } catch (err) {
        console.error("Logout failed", err);
        window.location.href = 'index.html';
    }
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`);

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'index.html';
            return;
        }

        const tasks = await res.json();
        const list = document.getElementById('task-list');
        if (list) {
            list.innerHTML = ''; 

            if (tasks.length === 0) {
                list.innerHTML = '<p style="text-align:center; color:#6c7086;">No tasks found. Add one!</p>';
            }

            tasks.forEach(task => {
                const div = document.createElement('div');
                div.className = 'task-item';
                div.innerHTML = `
                    <strong>${task.title}</strong>
                    <p>${task.description || ''}</p>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                `;
                list.appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert('Error: ' + (data.error || 'Login failed'));
            }
        } catch (err) {
            alert('Server error occurred.');
        }
    });
}
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Registration successful! Please login.');
                toggleAuth();
            } else {
                const msg = data.errors ? data.errors.map(e => e.msg).join('\n') : data.error;
                alert('Error:\n' + msg);
            }
        } catch (err) {
            alert('An error occurred.');
        }
    });
}

const taskForm = document.getElementById('task-form');
if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;

        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });

            if (res.ok) {
                document.getElementById('task-title').value = '';
                document.getElementById('task-desc').value = '';
                loadTasks();
            } else {
                alert('Failed to add task.');
            }
        } catch (err) {
            alert('An error occurred.');
        }
    });
}

async function deleteTask(id) {
    if (!confirm('Are you sure?')) return;
    
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            loadTasks();
        } else {
            alert('Failed to delete.');
        }
    } catch (err) {
        alert('An error occurred.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth();
    }
});