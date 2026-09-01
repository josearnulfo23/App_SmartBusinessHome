// src/controllers/ingresoController.js
const dataService = require('../services/dataService');
const { validarIngreso } = require('../services/validacionService');
const { generarId, filtrarPorPeriodo } = require('../utils/helpers');

function listar(req, res) {
  let ingresos = dataService.getCollection('ingresos');
  if (req.query.periodo) ingresos = filtrarPorPeriodo(ingresos, req.query.periodo);
  if (req.query.categoria) ingresos = ingresos.filter(i => i.categoria === req.query.categoria);
  if (req.query.q) { const q = req.query.q.toLowerCase(); ingresos = ingresos.filter(i => (i.descripcion||'').toLowerCase().includes(q) || (i.fuente||'').toLowerCase().includes(q)); }
  // ordenar por fecha desc
  ingresos = [...ingresos].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(ingresos);
}

function obtener(req, res) {
  const ingresos = dataService.getCollection('ingresos');
  const item = ingresos.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Ingreso no encontrado' });
  res.json(item);
}

function crear(req, res) {
  const errores = validarIngreso(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  const nuevo = {
    id: generarId(),
    monto: parseFloat(req.body.monto),
    fecha: req.body.fecha,
    categoria: req.body.categoria || 'Salario',
    fuente: req.body.fuente || req.body.categoria || '',
    descripcion: req.body.descripcion || '',
    createdAt: new Date().toISOString()
  };
  data.ingresos.push(nuevo);
  dataService.saveData(data);
  res.status(201).json(nuevo);
}

function actualizar(req, res) {
  const errores = validarIngreso(req.body);
  if (errores.length) return res.status(400).json({ errores });
  const data = dataService.loadData();
  const idx = data.ingresos.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ingreso no encontrado' });
  data.ingresos[idx] = { ...data.ingresos[idx], monto: parseFloat(req.body.monto), fecha: req.body.fecha, categoria: req.body.categoria, fuente: req.body.fuente || req.body.categoria, descripcion: req.body.descripcion };
  dataService.saveData(data);
  res.json(data.ingresos[idx]);
}

function eliminar(req, res) {
  const data = dataService.loadData();
  const idx = data.ingresos.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ingreso no encontrado' });
  const removed = data.ingresos.splice(idx, 1)[0];
  dataService.saveData(data);
  res.json(removed);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
