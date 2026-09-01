// src/controllers/gastoController.js v2.0 - SQLite + usuario aislado
const { getDb } = require('../services/db');
const { validarGasto } = require('../services/validacionService');

function listar(req, res) {
  const db = getDb();
  let sql = 'SELECT * FROM gastos WHERE usuario_id = ?';
  const params = [req.user.id];
  if (req.query.periodo) { sql += ' AND fecha LIKE ?'; params.push(req.query.periodo + '%'); }
  if (req.query.categoria) { sql += ' AND categoria = ?'; params.push(req.query.categoria); }
  sql += ' ORDER BY fecha DESC, id DESC';
  let rows = db.prepare(sql).all(...params);
  if (req.query.q) { const q = req.query.q.toLowerCase(); rows = rows.filter(r => (r.descripcion||'').toLowerCase().includes(q)); }
  res.json(rows.map(r => ({ id: String(r.id), monto: r.monto, fecha: r.fecha, categoria: r.categoria, descripcion: r.descripcion, createdAt: r.created_at })));
}
function obtener(req, res) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM gastos WHERE id=? AND usuario_id=?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Gasto no encontrado' });
  res.json({ id: String(row.id), monto: row.monto, fecha: row.fecha, categoria: row.categoria, descripcion: row.descripcion, createdAt: row.created_at });
}
function crear(req, res) {
  const errores = validarGasto(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const db = getDb();
  const r = db.prepare('INSERT INTO gastos (monto, fecha, categoria, descripcion, usuario_id) VALUES (?,?,?,?,?)')
    .run(parseFloat(req.body.monto), req.body.fecha, req.body.categoria || 'Alimentación', req.body.descripcion || '', req.user.id);
  const row = db.prepare('SELECT * FROM gastos WHERE id=?').get(r.lastInsertRowid);
  res.status(201).json({ id: String(row.id), monto: row.monto, fecha: row.fecha, categoria: row.categoria, descripcion: row.descripcion, createdAt: row.created_at });
}
function actualizar(req, res) {
  const errores = validarGasto(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const db = getDb();
  const exists = db.prepare('SELECT id FROM gastos WHERE id=? AND usuario_id=?').get(req.params.id, req.user.id);
  if (!exists) return res.status(404).json({ error: 'Gasto no encontrado' });
  db.prepare('UPDATE gastos SET monto=?, fecha=?, categoria=?, descripcion=? WHERE id=? AND usuario_id=?')
    .run(parseFloat(req.body.monto), req.body.fecha, req.body.categoria, req.body.descripcion || '', req.params.id, req.user.id);
  const row = db.prepare('SELECT * FROM gastos WHERE id=?').get(req.params.id);
  res.json({ id: String(row.id), monto: row.monto, fecha: row.fecha, categoria: row.categoria, descripcion: row.descripcion, createdAt: row.created_at });
}
function eliminar(req, res) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM gastos WHERE id=? AND usuario_id=?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Gasto no encontrado' });
  db.prepare('DELETE FROM gastos WHERE id=? AND usuario_id=?').run(req.params.id, req.user.id);
  res.json({ id: String(row.id), monto: row.monto, fecha: row.fecha, categoria: row.categoria });
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
