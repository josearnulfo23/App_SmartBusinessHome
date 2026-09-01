// src/controllers/categoriaController.js
const dataService = require('../services/dataService');
const { validarCategoria } = require('../services/validacionService');
const { generarId } = require('../utils/helpers');
const { CATEGORIAS_INGRESO_PREDEFINIDAS, CATEGORIAS_GASTO_PREDEFINIDAS } = require('../config/constants');

function listar(req, res) {
  const categorias = dataService.getCollection('categorias');
  const predefinidas = [
    ...CATEGORIAS_INGRESO_PREDEFINIDAS.map(n => ({ id: 'pre-'+n, nombre: n, tipo: 'ingreso', predefinida: true })),
    ...CATEGORIAS_GASTO_PREDEFINIDAS.map(n => ({ id: 'pre-'+n, nombre: n, tipo: 'gasto', predefinida: true }))
  ];
  let todas = [...predefinidas, ...categorias.map(c => ({ ...c, predefinida: false }))];
  if (req.query.tipo) todas = todas.filter(c => c.tipo === req.query.tipo);
  res.json(todas);
}
function crear(req, res) {
  const errores = validarCategoria(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  const existe = data.categorias.find(c => c.nombre.toLowerCase() === req.body.nombre.toLowerCase() && c.tipo === req.body.tipo);
  if (existe) return res.status(400).json({ errores: ['La categoría ya existe.'] });
  const nueva = { id: generarId(), nombre: req.body.nombre.trim(), tipo: req.body.tipo, descripcion: req.body.descripcion || '' };
  data.categorias.push(nueva);
  dataService.saveData(data);
  res.status(201).json(nueva);
}
function actualizar(req, res) {
  const errores = validarCategoria(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  const idx = data.categorias.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Categoría no encontrada o es predefinida' });
  data.categorias[idx] = { ...data.categorias[idx], nombre: req.body.nombre.trim(), tipo: req.body.tipo, descripcion: req.body.descripcion || '' };
  dataService.saveData(data);
  res.json(data.categorias[idx]);
}
function eliminar(req, res) {
  const data = dataService.loadData();
  const idx = data.categorias.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Categoría no encontrada o es predefinida' });
  const removed = data.categorias.splice(idx, 1)[0];
  dataService.saveData(data);
  res.json(removed);
}
module.exports = { listar, crear, actualizar, eliminar };
