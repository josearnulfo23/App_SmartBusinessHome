// src/config/auth.js
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'smartbusinesshome-dev-secret-cambiar-en-produccion-2026',
  jwtExpiresIn: '12h',
  bcryptRounds: 10,
  adminDefault: {
    username: 'admin',
    password: 'Admin123!',
    displayName: 'Administrador',
    role: 'admin'
  }
};
