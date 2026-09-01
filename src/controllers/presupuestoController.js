// src/controllers/presupuestoController.js
const dataService = require('../services/dataService');
const { validarPresupuesto } = require('../services/validacionService');
const { generarId } = require('../utils/helpers');

function listar(req, res) {
  const presupuestos = dataService.getCollection('presupuestos');
  if (req.query.periodo) return res.json(presupuestos.filter(p => p.periodo === req.query.periodo));
  res.json(presupuestos);
}
function obtener(req, res) {
  const presupuestos = dataService.getCollection('presupuestos');
  const item = presupuestos.find(p => p.id === req.params.id || p.periodo === req.params.id);
  if (!item) return res.status(404).json({ error: 'Presupuesto no encontrado' });
  res.json(item);
}
function crearOActualizar(req, res) {
  const errores = validarPresupuesto(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  let idx = data.presupuestos.findIndex(p => p.periodo === req.body.periodo);
  if (idx !== -1) {
    data.presupuestos[idx] = { ...data.presupuestos[idx], presupuestoTotal: parseFloat(req.body.presupuestoTotal), categoriasAsignadas: req.body.categoriasAsignadas || {}, updatedAt: new Date().toISOString() };
    dataService.saveData(data);
    return res.json(data.presupuestos[idx]);
  }
  const nuevo = {
    id: generarId(),
    periodo: req.body.periodo,
    presupuestoTotal: parseFloat(req.body.presupuestoTotal) || 0,
    categoriasAsignadas: req.body.categoriasAsignadas || {},
    updatedAt: new Date().toISOString()
  };
  data.presupuestos.push(nuevo);
  dataService.saveData(data);
  res.status(201).json(nuevo);
}
function eliminar(req, res) {
  const data = dataService.loadData();
  const idx = data.presupuestos.findIndex(p => p.id === req.params.id || p.periodo === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Presupuesto no encontrado' });
  const removed = data.presupuestos.splice(idx, 1)[0];
  dataService.saveData(data);
  res.json(removed);
}
module.exports = { listar, obtener, crearOActualizar, eliminar };
