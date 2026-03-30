const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { getDB } = require('../utils/db');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Stricter rate limiting for auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Max 10 attempts per IP per 15 minutes
    message: { error: 'Too many authentication attempts. Please try again later.' }
});

router.use(authLimiter);

// ---------------------------------
// Sign-up Route
// ---------------------------------
router.post('/signup', [
    // Input validation & sanitization
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers')
        .escape(),
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .withMessage('Password must include one lowercase character, one uppercase character, a number, and a special character')
], async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        const db = await getDB();

        // Check for existing user (Parameterised query protects against SQL injection)
        const existingUser = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(12); // Strong Work Factor
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user into database (Parameterised query)
        const result = await db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Session creation
        req.session.userId = result.lastID;
        req.session.username = username;

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ---------------------------------
// Login Route
// ---------------------------------
router.post('/login', [
    // Validation
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .escape(),
    body('password')
        .notEmpty().withMessage('Password is required')
], async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const db = await getDB();

        // Fetch user from DB (Parameterised query)
        const user = await db.get('SELECT id, username, password FROM users WHERE username = ?', [username]);

        if (!user) {
            // Generic error message to prevent exposure of what failed (OWASP recommendation)
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password safely
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Session fixation protection: regenerate session ID on login
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            req.session.userId = user.id;
            req.session.username = user.username;

            res.status(200).json({ message: 'Logged in successfully' });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ---------------------------------
// Route to check authentication status
// ---------------------------------
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Echo back only safe user details inside session
    res.status(200).json({
        id: req.session.userId,
        username: req.session.username
    });
});

// ---------------------------------
// Logout Route
// ---------------------------------
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
             return res.status(500).json({ error: 'Could not log out!' });
        } else {
             res.clearCookie('connect.sid'); // Cleanly remove cookie
             return res.status(200).json({ message: 'Logout successful' });
        }
    });
});

module.exports = router;
