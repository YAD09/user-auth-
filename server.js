const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security: Set HTTP Response headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            upgradeInsecureRequests: [],
        },
    },
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Session Management
app.use(session({
    store: new SQLiteStore({ dir: './db', db: 'sessions.sqlite' }),
    secret: process.env.SESSION_SECRET || 'super-secure-fallback-secret-key!@#',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true, // Prevent client-side JS from accessing the session cookie (XSS protection)
        secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS in prod
        sameSite: 'strict' // Prevent CSRF attacks
    }
}));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Redirect root to dashboard or login
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login.html');
    }
});

app.listen(port, () => {
    console.log(`Secure application running at http://localhost:${port}`);
});
