const API_URL = 'https://localhost:3000/api';

async function authFetch(url, options = {}) {
    try {
        let response = await fetch(url, options);

        if (response.status === 401 || response.status === 403) {
            console.log("Your Access Token has expired. It's being renewed... 🔄");

            const refreshRes = await fetch(`${API_URL}/users/refresh-token`, {
                method: 'POST'
            });

            if (refreshRes.ok) {
                console.log("The token has been successfully renewed! ✅");
                response = await fetch(url, options);
            } else {
                console.warn("Refresh Token is also invalid. Logging out. 🚪");
                window.location.href = 'index.html';
                return null;
            }
        }

        return response;
    } catch (err) {
        console.error("Network Error:", err);
        throw err;
    }
}

async function checkAuth() {
    try {
        const res = await authFetch(`${API_URL}/users/profile`);
        
        if (res && res.ok) {
            const data = await res.json();
            
            const welcomeMsg = document.getElementById('welcome-msg');
            if (welcomeMsg) welcomeMsg.innerText = `Tasks for ${data.username || 'User'}`;

            if (data.role === 'admin') {
                const adminBtn = document.getElementById('admin-btn');
                if (adminBtn) adminBtn.style.display = 'inline-block';
            }
            
            loadTasks();
        } else {
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error("Auth Check Failed:", err);
        window.location.href = 'index.html';
    }
}

async function loadTasks() {
    try {
        const res = await authFetch(`${API_URL}/tasks`);
        if (!res || !res.ok) return;

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
                    <button class="btn-delete-task" data-id="${task.id}">Delete</button>
                `;
                list.appendChild(div);
            });
        }
    } catch (err) {
        console.error("Load Tasks Error:", err);
    }
}

async function loadAdminData() {
    try {
        const res = await authFetch(`${API_URL}/admin/users`);
        
        if (!res || res.status === 403) {
            alert("⛔ Access Denied! You do not have admin privileges.");
            window.location.href = 'dashboard.html';
            return;
        }

        const users = await res.json();
        const tbody = document.getElementById('users-body');
        const table = document.getElementById('users-table');
        const loading = document.getElementById('loading-msg');

        if(tbody) tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            
            const deleteBtn = user.role === 'admin' 
                ? '<span style="color:#a6da95; font-weight:bold;">System Admin</span>' 
                : `<button class="btn-delete-user" data-id="${user.id}">Delete</button>`;

            tr.innerHTML = `
                <td>#${user.id}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">${user.role}</span></td>
                <td>${deleteBtn}</td>
            `;
            if(tbody) tbody.appendChild(tr);
        });

        if (loading) loading.style.display = 'none';
        if (table) table.style.display = 'table';

    } catch (err) {
        console.error("Admin Load Error:", err);
        window.location.href = 'dashboard.html';
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

function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    if (loginSec && regSec) {
        loginSec.classList.toggle('hidden');
        regSec.classList.toggle('hidden');
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure?')) return;
    try {
        const res = await authFetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadTasks();
    } catch (err) {
        alert('An error occurred.');
    }
}

async function adminDeleteUser(id) {
    if(!confirm('WARNING! You are about to delete the user and all their data. Are you sure?')) return;
    try {
        const res = await authFetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadAdminData();
        else alert('Deletion failed.');
    } catch (err) {
        alert('Error occurred.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    const path = window.location.pathname;

    if (path.includes('dashboard.html')) {
        checkAuth(); 
    } else if (path.includes('admin.html')) {
        loadAdminData(); 
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
                alert('A server error occurred.');
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
            const adminKey = document.getElementById('reg-admin-key').value;

            try {
                const res = await fetch(`${API_URL}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, adminKey })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Registration successful! Please log in.');
                    toggleAuth();
                } else {
                    const msg = data.errors ? data.errors.map(e => e.msg).join('\n') : data.error;
                    alert('Error:\n' + msg);
                }
            } catch (err) {
                alert('An error has occurred.');
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
                const res = await authFetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description })
                });

                if (res && res.ok) {
                    document.getElementById('task-title').value = '';
                    document.getElementById('task-desc').value = '';
                    loadTasks();
                } else {
                    alert('The task could not be added.');
                }
            } catch (err) {
                alert('Error occurred.');
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    const btnShowRegister = document.getElementById('btn-show-register');
    if (btnShowRegister) {
        btnShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuth();
        });
    }

    const btnShowLogin = document.getElementById('btn-show-login');
    if (btnShowLogin) {
        btnShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuth();
        });
    }

    const taskList = document.getElementById('task-list');
    if (taskList) {
        taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-task')) {
                const id = e.target.getAttribute('data-id');
                deleteTask(id);
            }
        });
    }

    const usersTableBody = document.getElementById('users-body');
    if (usersTableBody) {
        usersTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-user')) {
                const id = e.target.getAttribute('data-id');
                adminDeleteUser(id);
            }
        });
    }
});