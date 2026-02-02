const request = require('supertest');
const app = require('../../src/app'); 

describe('Authentication API Integration Tests', () => {
    let accessCookie;
    const randomEmail = `testuser_${Date.now()}@test.com`;
    const password = 'SecurePassword123!';

    // 1. REGISTER TEST
    test('POST /api/users/register - should create a new user', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({
                username: 'IntegrationUser',
                email: randomEmail, 
                password: password
            });
        
        if (res.statusCode !== 201) {
            console.error("Register Error Response:", res.body);
        }

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message'); 
    });

    // 2. LOGIN TEST
    test('POST /api/users/login - should return cookies on success', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: randomEmail, 
                password: password
            });

        expect(res.statusCode).toBe(200);
        
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        
        accessCookie = cookies;
    });

    // 3. PROTECTED ROUTE TEST (Authorized)
    test('GET /api/tasks - should allow access with valid cookie', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Cookie', accessCookie); 

        expect(res.statusCode).toBe(200);
    });

    // 4. PROTECTED ROUTE TEST (Unauthorized)
    test('GET /api/tasks - should deny access without cookie', async () => {
        const res = await request(app)
            .get('/api/tasks'); 

        expect(res.statusCode).toBe(401);
    });
});