/**
 * SQLite Database Handler
 * Central database connection for both bot and dashboard
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the SQLite database file
const dbPath = path.join(process.cwd(), 'data', 'bot.db');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

/**
 * Initialize the database with required tables
 */
function initDatabase() {
  // Create tables if they don't exist
  db.serialize(() => {
    // Guild settings table
    db.run(`CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      modlog_channel TEXT,
      enabled_features TEXT
    )`);

    // Warnings table
    db.run(`CREATE TABLE IF NOT EXISTS warnings (
      id TEXT PRIMARY KEY,
      guild_id TEXT,
      user_id TEXT,
      moderator_id TEXT,
      reason TEXT,
      timestamp INTEGER,
      FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
    )`);

    // Tickets table
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      guild_id TEXT,
      user_id TEXT,
      channel_id TEXT,
      topic TEXT,
      status TEXT,
      created_at INTEGER,
      FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
    )`);

    // Reaction roles table
    db.run(`CREATE TABLE IF NOT EXISTS reaction_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      message_id TEXT,
      role_id TEXT,
      emoji TEXT,
      exclusive INTEGER DEFAULT 0,
      FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
    )`);

    // Sticky messages table
    db.run(`CREATE TABLE IF NOT EXISTS sticky_messages (
      channel_id TEXT PRIMARY KEY,
      message_id TEXT,
      content TEXT,
      title TEXT,
      color INTEGER,
      guild_id TEXT,
      FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
    )`);

    console.log('Database tables initialized');
  });
}

/**
 * Run a query with parameters and return a promise
 * @param {String} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Promise object representing the query result
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error running SQL:', sql);
        console.error(err);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Get a single row from a query
 * @param {String} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Promise object representing the query result
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) {
        console.error('Error running SQL:', sql);
        console.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Get all rows from a query
 * @param {String} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Promise object representing the query result
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error running SQL:', sql);
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all
};