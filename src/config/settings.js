// src/config/settings.js v2.1
module.exports = {
  appName: 'SmartBusinessHome',
  version: '2.1.0',
  port: process.env.PORT || 3000,
  dataFile: 'financiero.db',
  backupEnabled: true,
  backupIntervalMs: 24*60*60*1000,
  maxTransacciones: 10000
};
