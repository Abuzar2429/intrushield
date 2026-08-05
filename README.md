# 🛡️ IntruShield — Enterprise AI Network Intrusion Detection System (NIDS)

![IntruShield Security Architecture](https://img.shields.io/badge/Security-Hardened-emerald?style=for-the-badge&logo=shield)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github)
![Test Coverage](https://img.shields.io/badge/Tests-24%2F24%20Passed-blue?style=for-the-badge&logo=vitest)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

**IntruShield** is a state-of-the-art Next-Generation Network Intrusion Detection System (NIDS) and Security Operations Center (SOC) dashboard. It combines real-time packet stream telemetry, machine learning anomaly detection models, SHAP explainable AI vectors, and automated BGP Flowspec & `iptables` firewall mitigation.

---

## 📸 Interface Screenshots

<img width="1910" height="942" alt="IntruShield Dashboard Preview 1" src="https://github.com/user-attachments/assets/c2578adc-9a62-4606-b743-173f5281b875" />

<img width="1919" height="934" alt="IntruShield Dashboard Preview 2" src="https://github.com/user-attachments/assets/64496c01-0517-47c4-840d-7f587346158b" />

---

## ⚡ Key Features

- **🧠 ML Anomaly & Attack Classification:** Real-time Random Forest ensemble models evaluating SYN floods, SSH brute-force probes, DNS tunneling, and SQL injection payloads.
- **📊 SHAP Explainable AI (XAI):** Natural language reasoning and feature importance vectors for SOC analysts.
- **🔒 Hardened Enterprise Security Architecture:**
  - **Cryptographic JWT Authentication:** Secure token validation for all operational API endpoints and live WebSocket streams.
  - **Role-Based Access Control (RBAC):** Strict role enforcement (`Administrator`, `Analyst`) protecting sensitive actions such as IOC deletion and firewall mitigation enforcement.
  - **Input Sanitization & Injection Defense:** Zod-validated IPv4/IPv6 address schemas preventing command injection in firewall rule generators.
  - **Helmet & CORS Security:** CSP headers, restricted origins, and request body size limits to prevent DoS attacks.
- **📡 Real-Time Telemetry Stream:** Low-latency WebSocket broadcasting (`ws://.../ws`) delivering authenticated packet logs and instant critical alert popups.
- **💾 SQLite WASM Database:** Persistent zero-dependency database snapshot engine powered by `sql.js`.

---

## 📁 Repository Structure

```
intrushield/
├── server/                    # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/                # SQLite WASM database initialization & snapshotting
│   │   ├── middleware/        # JWT Auth & RBAC (requireAuth, requireRole, auditLogger)
│   │   ├── ml/                # Network flow inference engine & feature extractions
│   │   ├── routes/            # REST API endpoints (auth, incidents, threatIntel, pcap, mitigation)
│   │   ├── websocket/         # Authenticated live telemetry streaming (/ws)
│   │   └── __tests__/         # Vitest test suite for Express endpoints & security
├── src/                       # React 19 + TypeScript + Vite Frontend
│   ├── components/            # Reusable UI components & SOC layout
│   ├── context/               # MonitoringContext & ThemeContext
│   ├── pages/                 # SOC views (Dashboard, Incident Details, Threat Intel, PCAP)
│   └── services/              # API client & JWT token management
├── package.json               # Root dependencies & test scripts
└── README.md                  # System documentation
```

---

## 🔐 Security Architecture & Hardening

| Component | Protection Mechanism | Status |
| :--- | :--- | :--- |
| **Authentication** | 24-hour signed JWT tokens with scrypt/bcrypt password hashing | ✅ Enforced |
| **Authorization** | `requireRole('Administrator')` for destructive actions (IOC delete, block IP) | ✅ Enforced |
| **Input Validation** | Zod `z.string().ip()` validation on firewall endpoints | ✅ Enforced |
| **WebSocket Security** | Authenticated token handshake on `/ws?token=<jwt>` | ✅ Enforced |
| **Server Security** | Helmet HTTP security headers, CORS origin restrictions, 1MB body limits | ✅ Enforced |
| **Password Reset** | Authenticated or current password validated password updates | ✅ Enforced |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Abuzar2429/intrushield.git
   cd intrushield
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. **Start the Backend Server (Port 5000):**
   ```bash
   npm --prefix server run dev
   ```

2. **Start the Frontend Dev Server (Port 5173):**
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

---

## 🧪 Running Tests & Quality Verification

Run the comprehensive unit and security test suites:

```bash
# Run backend Express test suite (Vitest)
npm --prefix server test

# Run frontend React test suite (Vitest)
npm test

# Run all test suites
npm run test:all

# Run code linter
npm run lint
```

### Test Output Verification
```
 RUN  v4.1.10 C:/Users/Ashraf/.gemini/antigravity-ide/scratch/intrushield/server

 ✓ src/__tests__/health.test.ts (1 test)
 ✓ src/__tests__/threatIntel.test.ts (3 tests)
 ✓ src/__tests__/pcap.test.ts (2 tests)
 ✓ src/__tests__/incidents.test.ts (6 tests)
 ✓ src/__tests__/mitigation.test.ts (6 tests)
 ✓ src/__tests__/auth.test.ts (6 tests)

 Test Files  6 passed (6)
      Tests  24 passed (24)
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
