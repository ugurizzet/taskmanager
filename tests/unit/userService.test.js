const userService = require('../../src/services/userService');
const userRepository = require('../../src/repositories/userRepository');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('../../src/repositories/userRepository', () => ({
    findByEmail: jest.fn(),
    createUser: jest.fn()
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

describe('UserService Unit Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE 1: Successful Registration
    test('registerUser - should register a new user successfully', async () => {
        // Arrange
        const mockUser = { id: 1, username: 'TestUser', email: 'test@example.com', role: 'user' };
        
        userRepository.findByEmail.mockResolvedValue(null); 
        bcrypt.hash.mockResolvedValue('hashed_password'); 
        userRepository.createUser.mockResolvedValue(mockUser); 

        // Act
        // FIX: Pass arguments as a SINGLE OBJECT to match your service signature
        const result = await userService.registerUser({
            username: 'TestUser', 
            email: 'test@example.com', 
            password: 'password123', 
            role: 'user'
        });

        // Assert
        expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(userRepository.createUser).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
    });

    // TEST CASE 2: Duplicate Email
    test('registerUser - should throw error if email already exists', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

        // Act & Assert
        // FIX: Pass arguments as a SINGLE OBJECT here too
        await expect(userService.registerUser({
            username: 'TestUser', 
            email: 'test@example.com', 
            password: 'password123', 
            role: 'user'
        }))
        .rejects
        .toThrow('This email address is already in use.'); 
    });

    // TEST CASE 3: Login Failure (Wrong Password)
    test('loginUser - should throw error for invalid credentials', async () => {
        // Arrange
        const mockUser = { id: 1, email: 'test@example.com', password: 'hashed_password' };
        userRepository.findByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false); 

        // Act & Assert
        await expect(userService.loginUser('test@example.com', 'wrong_password'))
            .rejects
            .toThrow(); 
    });
});