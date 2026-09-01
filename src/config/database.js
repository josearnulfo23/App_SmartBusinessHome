// src/config/database.js - SQLite via node:sqlite DatabaseSync
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '../../data/database');
const DB_FILE = path.join(DATA_DIR, 'financiero.db');
const JSON_LEGACY = path.join(DATA_DIR, 'financiero.json');
const BACKUP_DIR = path.join(__dirname, '../../data/backups');
function ensureDataDirs() {
  [DATA_DIR, BACKUP_DIR].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });
}
module.exports = { DATA_DIR, DB_FILE, JSON_LEGACY, BACKUP_DIR, ensureDataDirs };
