// src/services/db.js - Motor SQLite v2.0 con modelo relacional completo
// Tablas: usuarios, categorias, ingresos, gastos, presupuestos, presupuesto_categorias, app_config
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const { DB_FILE, JSON_LEGACY, ensureDataDirs } = require('../config/database');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');

let db = null;

function getDb() {
  if (db) return db;
  ensureDataDirs();
  db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  initSchema(db);
  ensureAdminUser(db);
  migrateFromJsonIfNeeded(db);
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','user')) DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('ingreso','gasto')),
      descripcion TEXT DEFAULT '',
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(nombre, tipo, usuario_id)
    );
    CREATE TABLE IF NOT EXISTS ingresos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monto REAL NOT NULL CHECK(monto > 0 AND monto <= 999999999),
      fecha TEXT NOT NULL,
      categoria TEXT NOT NULL,
      fuente TEXT DEFAULT '',
      descripcion TEXT DEFAULT '',
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monto REAL NOT NULL CHECK(monto > 0 AND monto <= 999999999),
      fecha TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      periodo TEXT NOT NULL,
      presupuesto_total REAL NOT NULL CHECK(presupuesto_total >= 0),
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(periodo, usuario_id)
    );
    CREATE TABLE IF NOT EXISTS presupuesto_categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      presupuesto_id INTEGER NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
      categoria TEXT NOT NULL,
      monto REAL NOT NULL CHECK(monto >= 0),
      UNIQUE(presupuesto_id, categoria)
    );
    CREATE TABLE IF NOT EXISTS app_config (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL,
      descripcion TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha);
    CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha ON gastos(usuario_id, fecha);
    CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
    CREATE INDEX IF NOT EXISTS idx_presupuestos_periodo ON presupuestos(periodo);
  `);
  const count = database.prepare('SELECT COUNT(*) as c FROM app_config').get().c;
  if (count === 0) {
    database.prepare("INSERT INTO app_config (clave, valor, descripcion) VALUES ('tema','claro','Tema visual')").run();
    database.prepare("INSERT INTO app_config (clave, valor, descripcion) VALUES ('colorPrimario','#1a73e8','Color primario')").run();
    database.prepare("INSERT INTO app_config (clave, valor, descripcion) VALUES ('colorFondo','#f5f7fa','Color fondo')").run();
  }
}

function ensureAdminUser(database) {
  const existing = database.prepare('SELECT id FROM usuarios WHERE username = ? COLLATE NOCASE').get(authConfig.adminDefault.username);
  if (existing) return;
  const hash = bcrypt.hashSync(authConfig.adminDefault.password, authConfig.bcryptRounds);
  database.prepare('INSERT INTO usuarios (username, password_hash, display_name, role) VALUES (?,?,?,?)')
    .run(authConfig.adminDefault.username, hash, authConfig.adminDefault.displayName, 'admin');
}

function migrateFromJsonIfNeeded(database) {
  if (!fs.existsSync(JSON_LEGACY)) return;
  try {
    const raw = fs.readFileSync(JSON_LEGACY, 'utf-8');
    const data = JSON.parse(raw);
    const hasData = (data.ingresos && data.ingresos.length) || (data.gastos && data.gastos.length) || (data.presupuestos && data.presupuestos.length);
    if (!hasData) return;
    const userCount = database.prepare('SELECT COUNT(*) as c FROM ingresos').get().c + database.prepare('SELECT COUNT(*) as c FROM gastos').get().c;
    if (userCount > 0) return;
    console.log('[DB] Migrando desde financiero.json...');
    const admin = database.prepare('SELECT id FROM usuarios WHERE role = ? LIMIT 1').get('admin');
    const uid = admin ? admin.id : 1;
    const insIng = database.prepare('INSERT INTO ingresos (monto, fecha, categoria, fuente, descripcion, usuario_id, created_at) VALUES (?,?,?,?,?,?,?)');
    (data.ingresos || []).forEach(r => {
      try { insIng.run(parseFloat(r.monto)||0, r.fecha||'2026-01-01', r.categoria||'Otros', r.fuente||'', r.descripcion||'', uid, r.createdAt||new Date().toISOString()); } catch(e){}
    });
    const insGas = database.prepare('INSERT INTO gastos (monto, fecha, categoria, descripcion, usuario_id, created_at) VALUES (?,?,?,?,?,?)');
    (data.gastos || []).forEach(r => {
      try { insGas.run(parseFloat(r.monto)||0, r.fecha||'2026-01-01', r.categoria||'Otros', r.descripcion||'', uid, r.createdAt||new Date().toISOString()); } catch(e){}
    });
    (data.presupuestos || []).forEach(p => {
      try {
        const res = database.prepare('INSERT INTO presupuestos (periodo, presupuesto_total, usuario_id) VALUES (?,?,?)').run(p.periodo||'2026-01', parseFloat(p.presupuestoTotal)||0, uid);
        const pid = res.lastInsertRowid;
        for (const cat in (p.categoriasAsignadas||{})) {
          database.prepare('INSERT INTO presupuesto_categorias (presupuesto_id, categoria, monto) VALUES (?,?,?)').run(pid, cat, parseFloat(p.categoriasAsignadas[cat])||0);
        }
      } catch(e){}
    });
    (data.categorias || []).forEach(c => {
      try { database.prepare('INSERT INTO categorias (nombre, tipo, descripcion, usuario_id) VALUES (?,?,?,?)').run(c.nombre, c.tipo, c.descripcion||'', uid); } catch(e){}
    });
    try { fs.renameSync(JSON_LEGACY, JSON_LEGACY + '.migrated-' + Date.now()); } catch(e){}
    console.log('[DB] Migracion completada.');
  } catch(e) { console.warn('[DB] Migracion omitida:', e.message); }
}

function closeDb() { if (db) { try{ db.close(); }catch(e){} db=null; } }

module.exports = { getDb, initSchema, closeDb };
