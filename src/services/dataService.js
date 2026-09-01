// src/services/dataService.js - Gestión de persistencia (JSON local)
const fs = require('fs');
const path = require('path');
const { DB_FILE, ensureDataDirs } = require('../config/database');

function loadData() {
  ensureDataDirs();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      ingresos: data.ingresos || [],
      gastos: data.gastos || [],
      presupuestos: data.presupuestos || [],
      categorias: data.categorias || []
    };
  } catch (e) {
    return { ingresos: [], gastos: [], presupuestos: [], categorias: [] };
  }
}

function saveData(data) {
  ensureDataDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function backupData() {
  const data = loadData();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(path.dirname(DB_FILE), '../backups', `backup-${timestamp}.json`);
  const dir = path.dirname(backupFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');
  return backupFile;
}

function getCollection(name) {
  return loadData()[name] || [];
}

function setCollection(name, items) {
  const data = loadData();
  data[name] = items;
  saveData(data);
}

module.exports = { loadData, saveData, backupData, getCollection, setCollection, DB_FILE };
