# 🛡️ IntruShield — Enterprise AI Network Intrusion Detection System (NIDS)

![IntruShield Security Hardened](https://img.shields.io/badge/Security-Hardened-emerald?style=for-the-badge&logo=shield)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github)
![Test Coverage](https://img.shields.io/badge/Tests-34%2F34%20Passed-blue?style=for-the-badge&logo=vitest)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

### 🌐 Live Online Demo (No Download Required)
Click the link below to access and test the live application directly in your web browser:

👉 **[https://intrushield.onrender.com](https://intrushield.onrender.com)**

#### 🔑 Demo Login Credentials
- **Lead Administrator Email:** `admin@intrushield.io`
- **Password:** `Admin@12345`
*(Or click **Register** on the login page to create your own account)*

---

## 💡 What is IntruShield? (In Simple Terms)

Imagine **IntruShield** as an **AI-powered digital security guard** for computer networks.

Just like a home security system monitors who enters a building and alerts you if someone tries to break a window or pick a lock, **IntruShield constantly watches internet traffic entering a company's computers**:

- 🚨 **Catches Hackers Automatically:** Smart Artificial Intelligence (AI) instantly detects cybercriminals trying to crash servers, guess passwords, or steal data.
- 🗣️ **Explains Threats Simply:** Instead of displaying confusing technical jargon, it explains *why* an alert was triggered in plain, easy-to-understand English.
- 🛑 **Blocks Attacks Instantly:** It can automatically block malicious attackers and suspicious IP addresses before they cause any harm.
- 📱 **Zero Setup Needed:** Anyone can access the full system live from their phone, tablet, or laptop without downloading or installing any software!

---

## 📸 Interface Screenshots

<img width="1910" height="942" alt="IntruShield Dashboard Preview 1" src="https://github.com/user-attachments/assets/c2578adc-9a62-4606-b743-173f5281b875" />

<img width="1919" height="934" alt="IntruShield Dashboard Preview 2" src="https://github.com/user-attachments/assets/64496c01-0517-47c4-840d-7f587346158b" />

---

## ⚡ Key Technical Features

- **🧠 ML Anomaly & Attack Classification:** Real-time Random Forest ensemble models evaluating SYN floods, SSH brute-force probes, DNS tunneling, and SQL injection payloads.
- **📊 SHAP Explainable AI (XAI):** Natural language reasoning and feature importance vectors for SOC analysts.
- **👥 SOC Team Governance:** Dedicated user administration portal (`/users`) to manage security analyst permissions and roles (`Administrator`, `Analyst`, `Auditor`).
- **🔔 Real-Time Webhook Alert Dispatch:** Automated notification pipeline dispatching critical threat payloads to external Slack, Discord, or PagerDuty webhooks.
- **🔒 Hardened Enterprise Security Architecture:**
  - **Cryptographic JWT Authentication:** Secure token validation for all operational API endpoints and live WebSocket streams.
  - **Role-Based Access Control (RBAC):** Strict role enforcement protecting sensitive actions such as user governance and firewall mitigation enforcement.
  - **Rate Limiting & DoS Protection:** Sliding window IP rate limiters on authentication endpoints to stop brute-force login attempts.
  - **Helmet & CORS Security:** CSP headers, restricted origins, and body size limits.
- **📡 Real-Time Telemetry Stream:** Low-latency WebSocket broadcasting (`/ws`) delivering authenticated packet logs and instant critical alert popups.
- **💾 SQLite WASM Database:** Persistent database snapshot engine powered by `sql.js`.

---

## 📁 Repository Structure

```
intrushield/
├── .github/workflows/         # Automated GitHub Actions CI pipeline (ci.yml)
├── server/                    # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/                # SQLite WASM database initialization & snapshotting
│   │   ├── middleware/        # JWT Auth, RBAC & Rate Limiter (requireAuth, rateLimiter)
│   │   ├── routes/            # REST API endpoints (auth, incidents, threatIntel, pcap, mitigation, users)
│   │   ├── services/          # Real-time Webhook alert dispatch & threat enrichment
│   │   ├── websocket/         # Authenticated live telemetry streaming (/ws)
│   │   └── __tests__/         # Vitest test suites (34 passed tests)
├── src/                       # React 19 + TypeScript + Vite Frontend
│   ├── components/            # Reusable UI components & SOC layout
│   ├── context/               # MonitoringContext & ThemeContext
│   ├── pages/                 # SOC views (Dashboard, Incident Details, Users Governance, PCAP)
│   └── services/              # API client & JWT token management
├── Dockerfile                 # Unified fullstack production container build
├── docker-compose.yml         # Container orchestrator with volume mounts
├── package.json               # Root dependencies & test scripts
└── README.md                  # Project documentation
```

---

## 🔐 Security Architecture & Hardening

| Component | Protection Mechanism | Status |
| :--- | :--- | :--- |
| **Authentication** | 24-hour signed JWT tokens with scrypt/bcrypt password hashing | ✅ Enforced |
| **Authorization** | `requireRole('Administrator')` for administrative actions (user roles, IP blocks) | ✅ Enforced |
| **Rate Limiting** | 10 attempts / 15 min on auth routes, 100 req / min on general APIs | ✅ Enforced |
| **Input Validation** | Zod `z.string().ip()` validation on firewall & auth endpoints | ✅ Enforced |
| **WebSocket Security** | Authenticated token handshake on `/ws?token=<jwt>` | ✅ Enforced |
| **Server Security** | Helmet HTTP security headers, CORS origin restrictions, body limits | ✅ Enforced |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Running Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Abuzar2429/intrushield.git
   cd intrushield
   ```

2. **Install Dependencies:**
   ```bash
   npm install && npm --prefix server install
   ```

3. **Start Development Application:**
   ```bash
   npm run dev
   ```

4. **Build & Start Unified Production Server Locally:**
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Running Tests & Quality Verification

Run the comprehensive unit and security test suites:

```bash
# Run all test suites across frontend and backend
npm run test:all

# Run linter
npm run lint
```

### Test Suite Output Verification
```
 Test Files  9 passed (9)
      Tests  34 passed (34)
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
