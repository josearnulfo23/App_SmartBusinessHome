// src/controllers/categoriaController.js v2.0 - SQLite + usuario aislado
const { getDb } = require('../services/db');
const { validarCategoria } = require('../services/validacionService');
const { CATEGORIAS_INGRESO_PREDEFINIDAS, CATEGORIAS_GASTO_PREDEFINIDAS } = require('../config/constants');

function listar(req, res) {
  const db = getDb();
  const custom = db.prepare('SELECT * FROM categorias WHERE usuario_id = ?').all(req.user.id);
  const predefinidas = [
    ...CATEGORIAS_INGRESO_PREDEFINIDAS.map(n => ({ id: 'pre-'+n, nombre: n, tipo: 'ingreso', predefinida: true })),
    ...CATEGORIAS_GASTO_PREDEFINIDAS.map(n => ({ id: 'pre-'+n, nombre: n, tipo: 'gasto', predefinida: true }))
  ];
  let todas = [...predefinidas, ...custom.map(c => ({ id: String(c.id), nombre: c.nombre, tipo: c.tipo, descripcion: c.descripcion, predefinida: false }))];
  if (req.query.tipo) todas = todas.filter(c => c.tipo === req.query.tipo);
  res.json(todas);
}
function crear(req, res) {
  const errores = validarCategoria(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const db = getDb();
  const exists = db.prepare('SELECT id FROM categorias WHERE nombre=? COLLATE NOCASE AND tipo=? AND usuario_id=?').get(req.body.nombre.trim(), req.body.tipo, req.user.id);
  if (exists) return res.status(400).json({ errores: ['La categoría ya existe.'] });
  // también verificar predefinidas
  const preExists = [...CATEGORIAS_INGRESO_PREDEFINIDAS, ...CATEGORIAS_GASTO_PREDEFINIDAS].some(n => n.toLowerCase() === req.body.nombre.trim().toLowerCase());
  if (preExists) return res.status(400).json({ errores: ['La categoría ya existe como predefinida.'] });
  const r = db.prepare('INSERT INTO categorias (nombre, tipo, descripcion, usuario_id) VALUES (?,?,?,?)').run(req.body.nombre.trim(), req.body.tipo, req.body.descripcion||'', req.user.id);
  const row = db.prepare('SELECT * FROM categorias WHERE id=?').get(r.lastInsertRowid);
  res.status(201).json({ id: String(row.id), nombre: row.nombre, tipo: row.tipo, descripcion: row.descripcion, predefinida:false });
}
function actualizar(req, res) {
  const errores = validarCategoria(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const db = getDb();
  const row = db.prepare('SELECT * FROM categorias WHERE id=? AND usuario_id=?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Categoría no encontrada o es predefinida' });
  db.prepare('UPDATE categorias SET nombre=?, tipo=?, descripcion=? WHERE id=?').run(req.body.nombre.trim(), req.body.tipo, req.body.descripcion||'', req.params.id);
  const updated = db.prepare('SELECT * FROM categorias WHERE id=?').get(req.params.id);
  res.json({ id: String(updated.id), nombre: updated.nombre, tipo: updated.tipo, descripcion: updated.descripcion, predefinida:false });
}
function eliminar(req, res) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categorias WHERE id=? AND usuario_id=?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Categoría no encontrada o es predefinida' });
  db.prepare('DELETE FROM categorias WHERE id=?').run(req.params.id);
  res.json({ id: String(row.id), nombre: row.nombre });
}
module.exports = { listar, crear, actualizar, eliminar };
