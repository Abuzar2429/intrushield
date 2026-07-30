# 🛡️ IntruShield NIDS Backend Server

The Node.js + Express backend service for **IntruShield Network Intrusion Detection System**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Health Check
curl http://localhost:5000/api/health
```

## 🔑 Features & Architecture
- **SQLite WebAssembly Engine (`sql.js`)**: Persistent database snapshots stored in `intrushield.sqlite`.
- **JWT Authentication**: `node:crypto` password hashing via `scrypt` and 24-hour signed JWT tokens.
- **REST Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`, `/api/auth/reset-password`, `/api/health`.
- **Audit Logging**: Request duration and status tracking middleware.
