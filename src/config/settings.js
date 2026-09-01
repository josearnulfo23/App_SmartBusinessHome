// src/config/settings.js v2.2 DEPLOYED
module.exports = {
  appName: 'SmartBusinessHome',
  version: '2.2.0',
  port: process.env.PORT || 3000,
  dataFile: 'financiero.db',
  backupEnabled: true,
  backupIntervalMs: 24*60*60*1000,
  maxTransacciones: 10000
};
