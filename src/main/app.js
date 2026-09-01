// src/main/app.js - Punto de entrada principal SmartBusinessHome
const express = require('express');
const path = require('path');
const fs = require('fs');

const ingresoController = require('../controllers/ingresoController');
const gastoController = require('../controllers/gastoController');
const presupuestoController = require('../controllers/presupuestoController');
const categoriaController = require('../controllers/categoriaController');
const balanceController = require('../controllers/balanceController');
const reporteController = require('../controllers/reporteController');
const alertaController = require('../controllers/alertaController');
const exportService = require('../services/exportService');
const dataService = require('../services/dataService');
const settings = require('../config/settings');

const app = express();
const PORT = settings.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir assets y views como estáticos
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/src/views', express.static(path.join(__dirname, '../views')));
app.use(express.static(path.join(__dirname, '../views/layouts')));
app.use(express.static(path.join(__dirname, '../../assets')));

// API - Ingresos
app.get('/api/ingresos', ingresoController.listar);
app.get('/api/ingresos/:id', ingresoController.obtener);
app.post('/api/ingresos', ingresoController.crear);
app.put('/api/ingresos/:id', ingresoController.actualizar);
app.delete('/api/ingresos/:id', ingresoController.eliminar);

// API - Gastos
app.get('/api/gastos', gastoController.listar);
app.get('/api/gastos/:id', gastoController.obtener);
app.post('/api/gastos', gastoController.crear);
app.put('/api/gastos/:id', gastoController.actualizar);
app.delete('/api/gastos/:id', gastoController.eliminar);

// API - Presupuestos
app.get('/api/presupuestos', presupuestoController.listar);
app.get('/api/presupuestos/:id', presupuestoController.obtener);
app.post('/api/presupuestos', presupuestoController.crearOActualizar);
app.delete('/api/presupuestos/:id', presupuestoController.eliminar);

// API - Categorías
app.get('/api/categorias', categoriaController.listar);
app.post('/api/categorias', categoriaController.crear);
app.put('/api/categorias/:id', categoriaController.actualizar);
app.delete('/api/categorias/:id', categoriaController.eliminar);

// API - Balance
app.get('/api/balance', balanceController.obtenerBalance);

// API - Reportes
app.get('/api/reportes/categorias', reporteController.reporteCategorias);
app.get('/api/reportes/historico', reporteController.reporteHistorico);
app.get('/api/reportes/transacciones', reporteController.listarTransacciones);

// API - Alertas
app.get('/api/alertas', alertaController.listarAlertas);

// API - Export
app.get('/api/export/ingresos', (req, res) => {
  const ingresos = dataService.getCollection('ingresos');
  const csv = exportService.exportarIngresosCSV(ingresos);
  res.header('Content-Type', 'text/csv');
  res.attachment('ingresos.csv');
  res.send(csv);
});
app.get('/api/export/gastos', (req, res) => {
  const gastos = dataService.getCollection('gastos');
  const csv = exportService.exportarGastosCSV(gastos);
  res.header('Content-Type', 'text/csv');
  res.attachment('gastos.csv');
  res.send(csv);
});
app.get('/api/export/presupuestos', (req, res) => {
  const presupuestos = dataService.getCollection('presupuestos');
  const csv = exportService.exportarPresupuestoCSV(presupuestos);
  res.header('Content-Type', 'text/csv');
  res.attachment('presupuestos.csv');
  res.send(csv);
});
app.post('/api/backup', (req, res) => {
  const file = dataService.backupData();
  res.json({ message: 'Respaldo creado', file });
});

// Servir SPA principal - cualquier ruta no API devuelve main.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/layouts/main.html'));
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: settings.appName, version: settings.version }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SmartBusinessHome v${settings.version} escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
