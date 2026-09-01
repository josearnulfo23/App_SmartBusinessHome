// src/services/dataService.js - Capa de compatibilidad SQLite v2.0
// Mantiene la API loadData/saveData/getCollection para retrocompatibilidad de tests
// pero ahora opera sobre SQLite y está aislada por usuario
const { getDb } = require('./db');
const fs = require('fs');
const path = require('path');
const { BACKUP_DIR } = require('../config/database');

function loadData(usuarioId) {
  const db = getDb();
  // Si se llama sin usuarioId (tests legacy, backup global), retorna todo agregado
  if (!usuarioId) {
    return {
      ingresos: db.prepare('SELECT * FROM ingresos ORDER BY fecha DESC').all().map(mapIngreso),
      gastos: db.prepare('SELECT * FROM gastos ORDER BY fecha DESC').all().map(mapGasto),
      presupuestos: loadPresupuestosAll(db),
      categorias: db.prepare('SELECT * FROM categorias').all().map(mapCategoria)
    };
  }
  return {
    ingresos: db.prepare('SELECT * FROM ingresos WHERE usuario_id = ? ORDER BY fecha DESC').all(usuarioId).map(mapIngreso),
    gastos: db.prepare('SELECT * FROM gastos WHERE usuario_id = ? ORDER BY fecha DESC').all(usuarioId).map(mapGasto),
    presupuestos: loadPresupuestosByUser(db, usuarioId),
    categorias: db.prepare('SELECT * FROM categorias WHERE usuario_id = ?').all(usuarioId).map(mapCategoria)
  };
}

function loadPresupuestosAll(db) {
  const rows = db.prepare('SELECT * FROM presupuestos').all();
  return rows.map(r => attachCategorias(db, r));
}
function loadPresupuestosByUser(db, uid) {
  const rows = db.prepare('SELECT * FROM presupuestos WHERE usuario_id = ?').all(uid);
  return rows.map(r => attachCategorias(db, r));
}
function attachCategorias(db, pres) {
  const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id = ?').all(pres.id);
  const map = {};
  cats.forEach(c => map[c.categoria] = c.monto);
  return {
    id: String(pres.id),
    periodo: pres.periodo,
    presupuestoTotal: pres.presupuesto_total,
    categoriasAsignadas: map,
    updatedAt: pres.updated_at,
    usuario_id: pres.usuario_id
  };
}

function mapIngreso(r) { return { id: String(r.id), monto: r.monto, fecha: r.fecha, categoria: r.categoria, fuente: r.fuente, descripcion: r.descripcion, createdAt: r.created_at, usuario_id: r.usuario_id }; }
function mapGasto(r) { return { id: String(r.id), monto: r.monto, fecha: r.fecha, categoria: r.categoria, descripcion: r.descripcion, createdAt: r.created_at, usuario_id: r.usuario_id }; }
function mapCategoria(r) { return { id: String(r.id), nombre: r.nombre, tipo: r.tipo, descripcion: r.descripcion, usuario_id: r.usuario_id }; }

function saveData(data) {
  // No-op para compatibilidad: los controllers v2 escriben directo a SQLite
  // Se mantiene para tests que usaban saveData con JSON legacy (no se usa en prod)
  return;
}

function getCollection(name, usuarioId) {
  return loadData(usuarioId)[name] || [];
}

function setCollection(name, items) {
  // compat no-op
  return;
}

function backupData() {
  const db = getDb();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  // Backup SQLite file + JSON dump
  const dump = {
    meta: { version: '2.0', fecha: new Date().toISOString() },
    usuarios: db.prepare('SELECT id, username, display_name, role, created_at FROM usuarios').all(),
    categorias: db.prepare('SELECT * FROM categorias').all(),
    ingresos: db.prepare('SELECT * FROM ingresos').all(),
    gastos: db.prepare('SELECT * FROM gastos').all(),
    presupuestos: db.prepare('SELECT * FROM presupuestos').all(),
    presupuesto_categorias: db.prepare('SELECT * FROM presupuesto_categorias').all(),
    app_config: db.prepare('SELECT * FROM app_config').all()
  };
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(dump, null, 2), 'utf-8');
  // También copia binaria del .db
  try {
    const { DB_FILE } = require('../config/database');
    if (fs.existsSync(DB_FILE)) {
      const binBackup = path.join(BACKUP_DIR, `financiero-${timestamp}.db`);
      fs.copyFileSync(DB_FILE, binBackup);
    }
  } catch(e) {}
  return backupFile;
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-')).sort().reverse().map(f => ({ file: f, path: path.join(BACKUP_DIR, f), date: fs.statSync(path.join(BACKUP_DIR, f)).mtime }));
}

module.exports = { loadData, saveData, backupData, getCollection, setCollection, listBackups, mapIngreso, mapGasto, mapCategoria, attachCategorias };
