// src/controllers/presupuestoController.js v2.0 - SQLite
const { getDb } = require('../services/db');
const { validarPresupuesto } = require('../services/validacionService');

function listar(req, res) {
  const db = getDb();
  let rows;
  if (req.query.periodo) {
    rows = db.prepare('SELECT * FROM presupuestos WHERE usuario_id=? AND periodo=?').all(req.user.id, req.query.periodo);
  } else {
    rows = db.prepare('SELECT * FROM presupuestos WHERE usuario_id=? ORDER BY periodo DESC').all(req.user.id);
  }
  const mapped = rows.map(r => {
    const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(r.id);
    const map = {}; cats.forEach(c => map[c.categoria]=c.monto);
    return { id: String(r.id), periodo: r.periodo, presupuestoTotal: r.presupuesto_total, categoriasAsignadas: map, updatedAt: r.updated_at };
  });
  res.json(mapped);
}
function obtener(req, res) {
  const db = getDb();
  let row = db.prepare('SELECT * FROM presupuestos WHERE (id=? OR periodo=?) AND usuario_id=?').get(req.params.id, req.params.id, req.user.id);
  if (!row && /^\d{4}-\d{2}$/.test(req.params.id)) {
    row = db.prepare('SELECT * FROM presupuestos WHERE periodo=? AND usuario_id=?').get(req.params.id, req.user.id);
  }
  if (!row) return res.status(404).json({ error: 'Presupuesto no encontrado' });
  const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(row.id);
  const map = {}; cats.forEach(c=> map[c.categoria]=c.monto);
  res.json({ id: String(row.id), periodo: row.periodo, presupuestoTotal: row.presupuesto_total, categoriasAsignadas: map, updatedAt: row.updated_at });
}
function crearOActualizar(req, res) {
  const errores = validarPresupuesto(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const db = getDb();
  const existing = db.prepare('SELECT id FROM presupuestos WHERE periodo=? AND usuario_id=?').get(req.body.periodo, req.user.id);
  if (existing) {
    db.prepare("UPDATE presupuestos SET presupuesto_total=?, updated_at=datetime('now') WHERE id=?").run(parseFloat(req.body.presupuestoTotal)||0, existing.id);
    db.prepare('DELETE FROM presupuesto_categorias WHERE presupuesto_id=?').run(existing.id);
    for (const cat in (req.body.categoriasAsignadas||{})) {
      const v = parseFloat(req.body.categoriasAsignadas[cat])||0;
      if (v>0) db.prepare('INSERT INTO presupuesto_categorias (presupuesto_id, categoria, monto) VALUES (?,?,?)').run(existing.id, cat, v);
    }
    return obtener({ params:{id: String(existing.id)}, user: req.user }, res);
  }
  const r = db.prepare('INSERT INTO presupuestos (periodo, presupuesto_total, usuario_id) VALUES (?,?,?)').run(req.body.periodo, parseFloat(req.body.presupuestoTotal)||0, req.user.id);
  for (const cat in (req.body.categoriasAsignadas||{})) {
    const v = parseFloat(req.body.categoriasAsignadas[cat])||0;
    if (v>0) db.prepare('INSERT INTO presupuesto_categorias (presupuesto_id, categoria, monto) VALUES (?,?,?)').run(r.lastInsertRowid, cat, v);
  }
  const row = db.prepare('SELECT * FROM presupuestos WHERE id=?').get(r.lastInsertRowid);
  const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(row.id);
  const map={}; cats.forEach(c=> map[c.categoria]=c.monto);
  res.status(201).json({ id: String(row.id), periodo: row.periodo, presupuestoTotal: row.presupuesto_total, categoriasAsignadas: map, updatedAt: row.updated_at });
}
function eliminar(req, res) {
  const db = getDb();
  let row = db.prepare('SELECT id FROM presupuestos WHERE (id=? OR periodo=?) AND usuario_id=?').get(req.params.id, req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Presupuesto no encontrado' });
  db.prepare('DELETE FROM presupuestos WHERE id=?').run(row.id);
  res.json({ message: 'Presupuesto eliminado' });
}
module.exports = { listar, obtener, crearOActualizar, eliminar };
