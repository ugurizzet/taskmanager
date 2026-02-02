const request = require('supertest');
const app = require('../../src/app');

describe('Full System Flow Integration Tests', () => {
    let userCookie;
    let userId;
    let taskId;
    const userEmail = `flow_${Date.now()}@test.com`;
    const adminEmail = `admin_${Date.now()}@test.com`;
    const password = 'Password123!';

    // 0. PRE-SETUP: Admin Secret
    process.env.ADMIN_SECRET = 'TestSecret123';

    // 1. SETUP: Register and Login a Standard User
    test('Setup: Register and Login User', async () => {
        // Register
        await request(app).post('/api/users/register').send({
            username: 'FlowUser',
            email: userEmail,
            password: password,
            role: 'user'
        });

        // Login
        const res = await request(app).post('/api/users/login').send({
            email: userEmail,
            password: password
        });

        expect(res.statusCode).toBe(200);
        userCookie = res.headers['set-cookie'];

        // --- BONUS: AUTOMATED SECURITY HEADERS CHECK ---
        expect(res.headers).toHaveProperty('content-security-policy');
        expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
        expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
    });

    // 2. TASK CRUD OPERATIONS
    test('Task Flow: Create, Update, Delete', async () => {
        // A. CREATE Task
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Cookie', userCookie)
            .send({ title: 'New Task', description: 'Test Desc' });
        
        expect(createRes.statusCode).toBe(201);
        taskId = createRes.body.id;

        // B. GET Tasks
        const getRes = await request(app)
            .get('/api/tasks')
            .set('Cookie', userCookie);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.length).toBeGreaterThan(0);


        // C. DELETE Task
        const delRes = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Cookie', userCookie);
        expect(delRes.statusCode).toBe(200);
    });

    // 3. REFRESH TOKEN FLOW
    test('Security: Refresh Token Rotation', async () => {
        const res = await request(app)
            .post('/api/users/refresh-token')
            .set('Cookie', userCookie);

        expect(res.statusCode).toBe(200);
        const newCookies = res.headers['set-cookie'];
        expect(newCookies).toBeDefined();
        userCookie = newCookies; // Update cookie
    });

    // 4. ADMIN ACCESS CHECK (Secret Key)
    test('Security: Role Based Access Control (Admin via Secret)', async () => {
        const adminEndpoint = '/api/admin/users'; 

        // A. Regular User -> 403
        const failRes = await request(app)
            .get(adminEndpoint) 
            .set('Cookie', userCookie);
        expect(failRes.statusCode).toBe(403);

        // B. Admin Register & Login
        await request(app).post('/api/users/register').send({
            username: 'AdminUser',
            email: adminEmail,
            password: password,
            adminKey: 'TestSecret123' 
        });

        const loginRes = await request(app).post('/api/users/login').send({
            email: adminEmail,
            password: password
        });
        const adminCookie = loginRes.headers['set-cookie'];

        // C. Admin Access -> 200
        const successRes = await request(app)
            .get(adminEndpoint)
            .set('Cookie', adminCookie);
        expect(successRes.statusCode).toBe(200);
    });

    // 5. LOGOUT FLOW
    test('Security: Logout invalidates session', async () => {
        // Logout
        const logoutRes = await request(app)
            .post('/api/users/logout')
            .set('Cookie', userCookie);
        expect(logoutRes.statusCode).toBe(200);

        // Try Refresh (Should Fail because DB record is gone)
        const refreshRes = await request(app)
            .post('/api/users/refresh-token')
            .set('Cookie', userCookie);

        expect([401, 403]).toContain(refreshRes.statusCode); 
    });
});