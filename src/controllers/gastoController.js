// src/controllers/gastoController.js
const dataService = require('../services/dataService');
const { validarGasto } = require('../services/validacionService');
const { generarId, filtrarPorPeriodo } = require('../utils/helpers');

function listar(req, res) {
  let gastos = dataService.getCollection('gastos');
  if (req.query.periodo) gastos = filtrarPorPeriodo(gastos, req.query.periodo);
  if (req.query.categoria) gastos = gastos.filter(g => g.categoria === req.query.categoria);
  if (req.query.q) { const q = req.query.q.toLowerCase(); gastos = gastos.filter(g => (g.descripcion||'').toLowerCase().includes(q)); }
  gastos = [...gastos].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(gastos);
}
function obtener(req, res) {
  const gastos = dataService.getCollection('gastos');
  const item = gastos.find(g => g.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Gasto no encontrado' });
  res.json(item);
}
function crear(req, res) {
  const errores = validarGasto(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  const nuevo = {
    id: generarId(),
    monto: parseFloat(req.body.monto),
    fecha: req.body.fecha,
    categoria: req.body.categoria || 'Alimentación',
    descripcion: req.body.descripcion || '',
    createdAt: new Date().toISOString()
  };
  data.gastos.push(nuevo);
  dataService.saveData(data);
  res.status(201).json(nuevo);
}
function actualizar(req, res) {
  const errores = validarGasto(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  const idx = data.gastos.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Gasto no encontrado' });
  data.gastos[idx] = { ...data.gastos[idx], monto: parseFloat(req.body.monto), fecha: req.body.fecha, categoria: req.body.categoria, descripcion: req.body.descripcion };
  dataService.saveData(data);
  res.json(data.gastos[idx]);
}
function eliminar(req, res) {
  const data = dataService.loadData();
  const idx = data.gastos.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Gasto no encontrado' });
  const removed = data.gastos.splice(idx, 1)[0];
  dataService.saveData(data);
  res.json(removed);
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
