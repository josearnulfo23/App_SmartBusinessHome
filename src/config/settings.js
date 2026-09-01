// src/config/settings.js - Configuraciones generales
module.exports = {
  appName: 'SmartBusinessHome',
  version: '1.0.0',
  port: process.env.PORT || 3000,
  dataFile: 'financiero.json',
  backupEnabled: true,
  backupIntervalMs: 24 * 60 * 60 * 1000,
  maxTransacciones: 10000
};
