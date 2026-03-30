const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbPromise = null;

async function getDB() {
    if (!dbPromise) {
        dbPromise = open({
            filename: path.join(__dirname, '../db/database.sqlite'),
            driver: sqlite3.Database
        });
    }
    return dbPromise;
}

module.exports = { getDB };
