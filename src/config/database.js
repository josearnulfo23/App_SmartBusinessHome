// src/config/database.js - Configuración de persistencia local
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data/database');
const DB_FILE = path.join(DATA_DIR, 'financiero.json');
const BACKUP_DIR = path.join(__dirname, '../../data/backups');

function ensureDataDirs() {
  [DATA_DIR, BACKUP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  if (!fs.existsSync(DB_FILE)) {
    const initial = { ingresos: [], gastos: [], presupuestos: [], categorias: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

module.exports = { DATA_DIR, DB_FILE, BACKUP_DIR, ensureDataDirs };
