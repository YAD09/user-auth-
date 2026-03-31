# Secure User Authentication System 🛡️

A production-ready, highly secure web application implementing robust sign-up and login functionality with a heavy emphasis on mitigating common architectural vulnerabilities. Designed according to modern OWASP security principles.

## 🌟 Features & Design
- **Premium User Interface:** Features a stunning "Glassmorphism" design aesthetic mapped onto a sleek dark mode. Smooth CSS transitions and focus states provide a premium application feel.
- **RESTful API:** Clean Node.js and Express backend handling the application layer logic.
- **Persistent Secure Storage:** File-based SQLite datastore abstracted safely to store user data and sessions.

## 🔐 Security Implementations

This system enforces multi-layered defense mechanisms, including:

1. **SQL Injection Protection:**
   - Complete adoption of **SQLite Parameterised Queries**. Direct data interpolation in database strings is strictly forbidden. Database connections are handled abstractly over drivers to strictly separate SQL logic from payload data.
2. **Cross-Site Scripting (XSS) Mitigation:**
   - Client-side DOM injection is prevented by strictly mutating tree data via `textContent` rather than parsed logic execution (like `innerHTML`).
   - Server-side response payload validation prevents script injection paths explicitly.
3. **Session Management & CSRF Defense:**
   - Leverages `express-session` with `.sqlite` local database pooling so that sessions persist securely.
   - Session identification uses opaque tokens rather than exploitable JSON Web Tokens (JWT). Cookies map out `HttpOnly=true` (stopping JavaScript API access to session IDs) and `SameSite='strict'` (neutralizing Cross-Site Request Forgery payloads).
4. **Endpoint Rate Limiting:**
   - Implements `express-rate-limit` strictly scoped on sensitive Authentication Endpoints `/login` and `/signup` restricting the possibility of mass Dictionary/Brute Force attacks.
5. **Cryptographic Storage:**
   - User passwords are obfuscated through the industry standard **bcrypt** algorithm wrapped securely inside a robust `salt = 12` factor.
6. **Input Validation:**
   - Express backend endpoints parse, sanitize, format, and reject erroneous data schemas immediately via `express-validator`.
7. **Security Headers:**
   - HTTP Request configurations strictly leverage **Helmet.js** to lock down Content Security Policies (CSP) isolating acceptable script and styling origins to the application itself.

---

## 🚀 Installation & Setup

### Prerequisites
Make sure you have Node.js (v16+) installed on your machine.

**1. Clone the repository:**
```bash
git clone https://github.com/YAD09/user-auth-.git
cd user-auth-
```

**2. Install dependencies:**
```bash
npm install
```

**3. Initialize Database:**
Run the initializer to construct the basic SQLite database architectures locally:
```bash
npm run init-db
```

**4. Start the Application:**
```bash
npm start
```
*The Secure platform runs flawlessly at `http://localhost:3000`*

## 📁 Project Structure

```text
├── db/
│   ├── init.js               # SQLite Database struct builder
│   ├── database.sqlite       # Local database mapping (Generated)
│   └── sessions.sqlite       # Local session pool (Generated)
├── public/                   # Static Frontend Files
│   ├── css/
│   │   └── style.css         # Custom beautiful UI design schema
│   ├── js/
│   │   ├── dashboard.js      # Core Dashboard JS
│   │   ├── login.js          # Authentication handler
│   │   └── signup.js         # Registration handler
│   ├── dashboard.html
│   ├── login.html
│   └── signup.html
├── routes/
│   └── auth.js               # API Authentication REST controls
├── utils/
│   └── db.js                 # Global abstract db connector
├── server.js                 # Primary Express Application
└── package.json
```

## 🔐 Environment Variables

Create a `.env` file in the root of the project to configure your environment variables:

```env
PORT=3000
SESSION_SECRET=your_super_secure_secret_key_here
NODE_ENV=development
```

- `PORT`: The port on which the server will run (default is `3000`).
- `SESSION_SECRET`: A long, random string used for signing the session ID cookie. Replace the default in production.
- `NODE_ENV`: Set to `production` when deploying to strict secure cookie settings.

## 📡 API Endpoints

The application exposes the following REST API endpoints:

### Authentication Endpoints

These endpoints are strictly rate-limited and secured:

| Method | Endpoint | Description | Payload Constraints |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Registers a new user. | `username` (3-30 chars, alphanumeric), `email`, `password` (min 8 chars, mixed case, special char) |
| `POST` | `/api/auth/login` | Authenticates a user and starts session. | `username`, `password` |
| `GET` | `/api/auth/me` | Fetches active session state. | Requires active session cookie. |
| `POST` | `/api/auth/logout` | Destroys current session cookie. | N/A |

## 🛠️ Error Handling & Troubleshooting

- **`Too many requests` / `Rate Limited`**: The application restricts excessive calls to authentication endpoints. Wait 15 minutes if you hit a limit.
- **SQLite Database Errors**: Ensure the `db/` directory exists and has write permissions. Initialize the databases properly using `npm run init-db` before running `npm start`.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
