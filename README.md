# 🛡️ Secure Task Manager API

**A production-ready Node.js REST API developed progressively through Labs 10-14, demonstrating advanced backend architecture, security hardening, and automated testing strategies.**

![CI Status](https://github.com/ugurizzet/taskmanager/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-82%25-brightgreen)
![Security](https://img.shields.io/badge/OWASP-Verified-blue)

---


## 🚀 Key Features

### 🔒 Advanced Security
- **Token Rotation:** Prevents token theft by detecting reuse of refresh tokens.
- **Secure Cookies:** Tokens stored in `HttpOnly`, `Secure`, `SameSite` cookies to prevent XSS.
- **Data Isolation:** Users can only access/modify their own tasks.
- **Dependency Security:** Automated `npm audit` checks and overrides for vulnerable packages.

### 🏗️ Robust Architecture
- **Layered Design:** `Routes` -> `Controllers` -> `Services` -> `Repositories` -> `Database`.
- **Modularity:** Separate route files for Users, Tasks, and Admin operations.

### 🧪 Automated Quality Assurance
- **CI/CD Pipeline:** Tests run automatically on every push to the `main` branch.
- **High Coverage:** >80% test coverage across the application.
- **Security Artifacts:** Passive security scanning reports included.

---



---

## 🛠️ Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* npm

### 1. Clone the Repository
```bash
git clone https://github.com/ugurizzet/taskmanager.git
cd task-manager
```

### 2.Install Dependencies
```bash
npm install
```

### 3.Environment Configuration
Create a .env file in the root directory:
```bash
PORT=3000
NODE_ENV=development
# Security Keys (Use strong random strings in production)
JWT_SECRET=super_secret_jwt_key_123
REFRESH_SECRET=super_secret_refresh_key_456
ADMIN_SECRET=TestSecret123
# Database
DB_PATH=./taskmanager.db
```

### 4. Run the Application
```bash
# Development Mode (with nodemon)
npm run dev

# Production Mode
npm start
```

### 🧪 Running Tests
This project employs a robust 3-layer testing strategy to ensure reliability, security, and maintainability.

### 1. Unit Tests (Business Logic)
Located in `tests/unit/`, these tests verify the core logic of the application in isolation using **Jest**.
* **Scope:** `UserService`
* **What we tested:**
    * **Password Hashing:** Verified that passwords are never stored in plain text.
    * **Duplicate Prevention:** Ensured users cannot register with an existing email.
    * **Isolation:** Used **Mocking** to decouple the service from the database layer.

### 2. Integration Tests (End-to-End API)
Located in `tests/integration/`, these tests simulate real HTTP requests using **Supertest** against an in-memory SQLite database.
* **Scope:** Full API Lifecycle (`full_flow.test.js`)
* **What we tested:**
    * **Authentication Flow:** Register -> Login (Cookie set) -> Access Protected Route -> Logout.
    * **Task Management:** Full CRUD operations (Create, Read, Update, Delete) for tasks.
    * **Security Mechanisms:**
        * **RBAC:** Verified that regular users cannot access Admin routes (403 Forbidden).
        * **Session Validation:** Verified that logout invalidates the refresh token in the database.
        * **Token Rotation:** Tested the `/refresh-token` endpoint for secure session renewal.
        * **Security Headers:** Automated checks for `Content-Security-Policy` and `X-Frame-Options`.

### 3. Security Scanning
* **Dependency Audit:** Automated `npm audit` runs to detect vulnerabilities in third-party packages.
* **DAST (Dynamic Application Security Testing):** Performed using **OWASP ZAP** to scan for runtime security misconfigurations and common web vulnerabilities.
```bash
# Run all tests (Unit + Integration)
npm test

# Run tests with Coverage Report
npm run test:coverage

# Run Security Audit (Dependency Check)
npm run audit
```
### 🌐 Application Pages (Frontend Endpoints)
|Page|URL Path|Description|Access
| :--- | :--- | :--- | :---
|Landing|/ or /index.html|Welcome page, logging in and creating an account |Public
|Dashboard|/dashboard.html|Manage your tasks (CRUD)|Private (User)
|Admin Panel|/admin.html|View registered users|Private (Admin)



### 📡 API Endpoints
#### 👤 User Operations
|Method|Endpoint|Description|Auth
| :--- | :--- | :--- | :---
|POST|/api/users/register|Register a new user|Public
|POST|/api/users/login|Login & receive cookies|Public
|POST|/api/users/logout|Invalidate session (Server-side)|Private
|POST|/api/users/refresh-token|Rotate Access/Refresh tokens|Private

#### 📝 Task Operations
|Method|Endpoint|Description|Auth
| :--- | :--- | :--- | :---
|GET|/api/tasks|Get logged-in user's tasks|Private
|POST|/api/tasks|Create a new task|Private
|DELETE|/api/tasks/:id|Delete a task|Private

#### 🛡️ Admin Operations
|Method|Endpoint|Description|Auth
| :--- | :--- | :--- | :---
|GET|/api/admin/users|List all registered users|Admin
|DELETE|/api/admin/users/:id|Deletes the selected user.|Admin


### 📂 Project Structure
```plaintext
task-manager/
├── public/             # 🌐 FRONTEND: Static Assets
│   ├── css/            # Stylesheets (styles.css)
│   ├── js/             # Frontend Logic (Fetch API, DOM)
│   ├── index.html      # Landing Page,Login Interface,User Registration Interface
│   ├── dashboard.html  # User Dashboard (Task Management)
│   ├── error.html      # Error page
│   └── admin.html      # Admin Dashboard (User Management)
│
├── src/                # ⚙️ BACKEND: Source Code
│   ├── config/         # Database & Env setup
│   ├── controllers/    # Request Handling
│   ├── middlewares/    # Auth, Validation, Security
│   ├── repositories/   # SQL Database Interactions
│   ├── routes/         # API Endpoint Definitions
│   ├── services/       # Business Logic
│   ├── utils/          # Logger
│   ├── app.js          # Express App Configuration (Middleware & Routes)
│   └── server.js       # HTTP Server Entry Point (Port Listening)
│
├── tests/              # 🧪 TESTING
│   ├── integration/    # End-to-End API Tests
│   └── unit/           # Logic Unit Tests
│
├── reports/            # 📊 REPORTS (Security Scan)
├── .github/            # 🤖 CI/CD Workflows
└── package.json
```


## 📅 Development Roadmap (Labs 10-14)

This project was built in stages, evolving from a simple server to a secure, enterprise-grade API.

| Lab | Module | Key Achievements & Implementations |
| :--- | :--- | :--- |
| **Lab 10** | **Foundations** | • Initialized Node.js & Express server.<br>• Created basic project structure.<br>• Implemented in-memory GET/POST endpoints. |
| **Lab 11** | **Database Integration** | • Integrated **SQLite** for persistent data storage.<br>• Implemented the **Repository Pattern** to separate SQL logic.<br>• Converted CRUD operations to async/await architecture. |
| **Lab 12** | **Validation & Error Handling** | • Added **express-validator** for strict input validation.<br>• Created a centralized Error Handling Middleware.<br>• Implemented proper HTTP status codes (400, 404, 500). |
| **Lab 13** | **Security Hardening** | • **JWT Authentication:** Access (15m) & Refresh (1d) Tokens.<br>• **RBAC:** Admin vs. User roles.<br>• **Helmet:** Secure HTTP headers (CSP, HSTS).<br>• **Rate Limiting:** DDoS protection.<br>• **Secure Logging:** Winston implementation. |
| **Lab 14** | **Testing & CI/CD** | • **Unit Tests:** Jest with Mocking.<br>• **Integration Tests:** Supertest (End-to-End).<br>• **CI Pipeline:** GitHub Actions.<br>• **Security Scan:** OWASP ZAP Audit. |

---
## 📊 Security Audit Report (Lab 14 - Task 4)

This project has undergone a passive security scan using **OWASP ZAP (Zed Attack Proxy)**.

* **Scan Tool:** OWASP ZAP 2.14
* **Target:** Local Development Environment
* **Results:** Zero High-Risk Vulnerabilities found.
* **View Report:** [📄 Click here to view the full Security Report](./reports/TaskManagerSecurityScanReport.pdf)
