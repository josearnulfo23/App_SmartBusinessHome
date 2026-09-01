// tests/integration/api.test.js v2.0 - Con autenticación
const assert = require('assert');
const { describe, it, before, after } = require('node:test');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../data/database/financiero.db');

describe('API integración v2.0 (con auth)', () => {
  let app, server, baseUrl;
  let adminToken, userToken, userId;

  function authFetch(url, opts = {}, token = adminToken) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(baseUrl + url, { ...opts, headers });
  }
  async function json(url, opts, token) {
    const res = await authFetch(url, opts, token);
    const body = await res.json().catch(()=>({}));
    return { status: res.status, body };
  }

  before(async () => {
    // Clean DB: close and delete file then reinit
    try {
      const { closeDb } = require('../../src/services/db');
      closeDb();
    } catch(e){}
    if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);
    // remove wal/shm if exist
    [DB_FILE+'-wal', DB_FILE+'-shm'].forEach(f=>{ try{ if(fs.existsSync(f)) fs.unlinkSync(f);}catch(e){} });
    app = require('../../src/main/app');
    server = app.listen(0);
    await new Promise(r => server.on('listening', r));
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;

    // Login admin
    const r = await json('/api/auth/login', { method:'POST', body: JSON.stringify({ username:'admin', password:'Admin123!' }) }, null);
    assert.strictEqual(r.status, 200, 'Login admin debe funcionar: ' + JSON.stringify(r.body));
    adminToken = r.body.token;
    assert.ok(adminToken);
  });

  after(async () => {
    await new Promise(r => server.close(r));
    try { const { closeDb } = require('../../src/services/db'); closeDb(); } catch(e){}
  });

  it('health check sin auth', async () => {
    const res = await fetch(baseUrl + '/api/health');
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
  });

  it('endpoints protegidos sin token dan 401', async () => {
    const res = await fetch(baseUrl + '/api/ingresos?periodo=2026-03');
    assert.strictEqual(res.status, 401);
  });

  it('login con credenciales inválidas da 401', async () => {
    const r = await json('/api/auth/login', { method:'POST', body: JSON.stringify({ username:'admin', password:'wrong' }) }, null);
    assert.strictEqual(r.status, 401);
  });

  it('registro de usuario nuevo', async () => {
    const r = await json('/api/auth/register', { method:'POST', body: JSON.stringify({ username:'testuser', password:'Test1234', displayName:'Test User' }) }, null);
    assert.strictEqual(r.status, 201);
    userId = r.body.id;
    // Login como testuser
    const r2 = await json('/api/auth/login', { method:'POST', body: JSON.stringify({ username:'testuser', password:'Test1234' }) }, null);
    assert.strictEqual(r2.status, 200);
    userToken = r2.body.token;
    assert.ok(userToken);
  });

  it('política de clave débil es rechazada', async () => {
    const r = await json('/api/auth/register', { method:'POST', body: JSON.stringify({ username:'weakuser', password:'123' }) }, null);
    assert.strictEqual(r.status, 400);
  });

  it('CRUD ingresos con auth', async () => {
    let r = await json('/api/ingresos', { method:'POST', body: JSON.stringify({ monto:1500000, fecha:'2026-03-15', categoria:'Salario', fuente:'Empresa', descripcion:'Sueldo marzo' }) });
    assert.strictEqual(r.status, 201);
    const id = r.body.id;
    assert.ok(id);
    r = await json('/api/ingresos?periodo=2026-03');
    assert.strictEqual(r.body.length, 1);
    r = await json('/api/ingresos/'+id, { method:'PUT', body: JSON.stringify({ monto:1600000, fecha:'2026-03-15', categoria:'Salario', fuente:'Empresa', descripcion:'Actualizado' }) });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.monto, 1600000);
    r = await json('/api/ingresos/'+id, { method:'DELETE' });
    assert.strictEqual(r.status, 200);
    r = await json('/api/ingresos?periodo=2026-03');
    assert.strictEqual(r.body.length, 0);
  });

  it('validación ingreso monto inválido', async () => {
    const r = await json('/api/ingresos', { method:'POST', body: JSON.stringify({ monto:-100, fecha:'2026-03-15', categoria:'Salario' }) });
    assert.strictEqual(r.status, 400);
  });

  it('CRUD gastos, presupuesto y alertas', async () => {
    await json('/api/presupuestos', { method:'POST', body: JSON.stringify({ periodo:'2026-03', presupuestoTotal:1000000, categoriasAsignadas:{ 'Alimentación':300000, 'Transporte':200000 } }) });
    let r = await json('/api/gastos', { method:'POST', body: JSON.stringify({ monto:260000, fecha:'2026-03-10', categoria:'Alimentación', descripcion:'Mercado' }) });
    assert.strictEqual(r.status, 201);
    r = await json('/api/alertas?periodo=2026-03');
    assert.ok(r.body.length >= 1);
    assert.ok(r.body.some(a=> a.categoria==='Alimentación'));
    await json('/api/ingresos', { method:'POST', body: JSON.stringify({ monto:2000000, fecha:'2026-03-01', categoria:'Salario', fuente:'Empresa', descripcion:'Sueldo' }) });
    r = await json('/api/balance?periodo=2026-03');
    assert.ok(r.body.totalIngresos > 0);
    assert.ok(r.body.totalGastos > 0);
  });

  it('categorías CRUD', async () => {
    let r = await json('/api/categorias');
    assert.ok(r.body.length >= 8);
    r = await json('/api/categorias', { method:'POST', body: JSON.stringify({ nombre:'Mascotas', tipo:'gasto' }) });
    assert.strictEqual(r.status, 201);
    const id = r.body.id;
    r = await json('/api/categorias/'+id, { method:'DELETE' });
    assert.strictEqual(r.status, 200);
  });

  it('reportes y análisis', async () => {
    let r = await json('/api/reportes/categorias?periodo=2026-03');
    assert.ok(r.body.porCategoria);
    r = await json('/api/reportes/transacciones?periodo=2026-03');
    assert.ok(Array.isArray(r.body));
    r = await json('/api/reportes/historico?periodo=2026-03');
    assert.strictEqual(r.body.periodo, '2026-03');
    r = await json('/api/analisis?desde=2026-01&hasta=2026-12');
    assert.ok('totalIngresos' in r.body);
    assert.ok('serieMensual' in r.body);
    assert.ok('porCatGastos' in r.body);
    assert.ok(Array.isArray(r.body.serieMensual));
  });

  it('aislamiento por usuario: testuser no ve datos de admin', async () => {
    // admin ya tiene datos en 2026-03, testuser no
    const r = await json('/api/ingresos?periodo=2026-03', {}, userToken);
    // testuser tiene 0 ingresos en ese periodo (los de admin no se ven)
    assert.strictEqual(r.body.length, 0);
    // testuser crea uno propio
    await json('/api/ingresos', { method:'POST', body: JSON.stringify({ monto:500000, fecha:'2026-05-01', categoria:'Extra', descripcion:'Freelance' }) }, userToken);
    const r2 = await json('/api/ingresos?periodo=2026-05', {}, userToken);
    assert.strictEqual(r2.body.length, 1);
    const r3 = await json('/api/ingresos?periodo=2026-05');
    assert.strictEqual(r3.body.length, 0, 'Admin no debe ver ingresos de testuser en mayo si no los creó');
  });

  it('admin endpoints solo para admin', async () => {
    let r = await json('/api/admin/usuarios', {}, userToken);
    assert.strictEqual(r.status, 403);
    r = await json('/api/admin/usuarios');
    assert.ok(r.body.length >= 2);
  });

  it('admin crear/listar/eliminar usuario', async () => {
    let r = await json('/api/admin/usuarios', { method:'POST', body: JSON.stringify({ username:'tempuser', password:'Temp1234', displayName:'Temp' }) });
    assert.strictEqual(r.status, 201);
    const id = r.body.id;
    r = await json('/api/admin/usuarios/'+id, { method:'DELETE' });
    assert.strictEqual(r.status, 200);
  });

  it('export CSV', async () => {
    const res = await authFetch('/api/export/gastos', {}, adminToken);
    assert.strictEqual(res.status, 200);
    assert.ok((res.headers.get('content-type')||'').includes('text/csv'));
  });

  it('cambio de clave', async () => {
    const r = await json('/api/auth/change-password', { method:'POST', body: JSON.stringify({ currentPassword:'Admin123!', newPassword:'NewAdmin123!' }) });
    assert.strictEqual(r.status, 200);
    // revertir
    const r2 = await json('/api/auth/change-password', { method:'POST', body: JSON.stringify({ currentPassword:'NewAdmin123!', newPassword:'Admin123!' }) });
    assert.strictEqual(r2.status, 200);
  });
});
