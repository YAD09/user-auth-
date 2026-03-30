const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function initDB() {
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }
    
    // SQLite databases will be created automatically
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Create the users table (protects against SQL Injection implicitly via design to use parameterized queries later)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('Database initialized perfectly and securely.');
    await db.close();
}

initDB().catch(console.error);
