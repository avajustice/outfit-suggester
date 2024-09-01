/*
    kvpdb.js
    A Simple Key-Value Pair Database

    The user parameter allows per-user storage. The intent is that any time
    a user is specified, only that user's data can be accessed. If no user
    is specified, then all data is available..
*/

// Define the TodoClient class
class KvpDatabase {
    // Constructor
    constructor(filename) {
        this.filename = filename;
        this.db = null;
    }

    async init() {
        const sqlite3 = require('sqlite3').verbose();
        const { open } = require('sqlite');
        this.db = await open({filename: this.filename, driver: sqlite3.Database});
        await this.db.exec(`CREATE TABLE IF NOT EXISTS key_value_store (
            key TEXT PRIMARY KEY,
            value TEXT,
            user TEXT
          )`);
    }

    async get(key, user=null) {
        // Handle optional user parameter
        let row = null;
        if(user) {
            row = await this.db.get('SELECT value FROM key_value_store WHERE key = ? AND user = ?', key, user);
        } else {
            row = await this.db.get('SELECT value FROM key_value_store WHERE key = ?', key);
        }

        if(row) {
            // convert value from JSON string
            return JSON.parse(row.value);
        } else {
            return null;
        }
    }

    async set(key, value, user=null) {
        // If user is specified, check if key exists for another user,
        // and don't allow it to be overwritten if it exists.
        if(user) {
            const existingUser = await this.get('SELECT user FROM key_value_store WHERE key = ?', key);
            if(existingUser && existingUser !== user) {
                throw new Error('Key exists for another user');
            }
        }

        // convert value to JSON string
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }
        await this.db.run('INSERT OR REPLACE INTO key_value_store (key, value, user) VALUES (?, ?, ?)', key, value, user);
    }

    async delete(key, user=null) {
        if(user) {
            await this.db.run('DELETE FROM key_value_store WHERE key = ? AND user = ?', key, user);
        } else {
            await this.db.run('DELETE FROM key_value_store WHERE key = ?', key);
        }
    }

    async list(prefix, user=null) {
        let rows = null;
        if(user) {
            rows = await this.db.all('SELECT key FROM key_value_store WHERE key LIKE ? AND user = ?', prefix + '%', user);
        } else {
            rows = await this.db.all('SELECT key FROM key_value_store WHERE key LIKE ?', prefix + '%');
        }
        return rows.map(row => row.key);
    }

    async empty(user=null) {
        if(user) {
            await this.db.run('DELETE FROM key_value_store WHERE user = ?', user);
        } else {
            await this.db.run('DELETE FROM key_value_store');
        }
    }
}

module.exports = KvpDatabase;
