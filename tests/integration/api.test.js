// tests/integration/api.test.js - Pruebas de integración API
const assert = require('assert');
const { describe, it, before, after } = require('node:test');
const fs = require('fs');
const path = require('path');

const TEST_DB = path.join(__dirname, '../../data/database/financiero.json');
let backup = null;
let app, server;
let baseUrl;

describe('API integración', () => {
  before(async () => {
    if (fs.existsSync(TEST_DB)) backup = fs.readFileSync(TEST_DB, 'utf-8');
    // reset DB limpio
    fs.writeFileSync(TEST_DB, JSON.stringify({ ingresos: [], gastos: [], presupuestos: [], categorias: [] }, null, 2));
    app = require('../../src/main/app');
    server = app.listen(0);
    await new Promise(r => server.on('listening', r));
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise(r => server.close(r));
    if (backup !== null) fs.writeFileSync(TEST_DB, backup);
  });

  async function fetchJSON(url, opts) {
    const res = await fetch(baseUrl + url, opts);
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  it('health check', async () => {
    const { status, body } = await fetchJSON('/api/health');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.status, 'ok');
  });

  it('CRUD ingresos', async () => {
    let r = await fetchJSON('/api/ingresos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ monto: 1500000, fecha: '2026-03-15', categoria: 'Salario', fuente: 'Empresa', descripcion: 'Sueldo marzo' }) });
    assert.strictEqual(r.status, 201);
    const id = r.body.id;
    assert.ok(id);
    r = await fetchJSON('/api/ingresos?periodo=2026-03');
    assert.strictEqual(r.body.length, 1);
    r = await fetchJSON('/api/ingresos/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ monto: 1600000, fecha: '2026-03-15', categoria: 'Salario', fuente: 'Empresa', descripcion: 'Sueldo actualizado' }) });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.monto, 1600000);
    r = await fetchJSON('/api/ingresos/' + id, { method: 'DELETE' });
    assert.strictEqual(r.status, 200);
    r = await fetchJSON('/api/ingresos?periodo=2026-03');
    assert.strictEqual(r.body.length, 0);
  });

  it('validación ingreso rechaza monto inválido', async () => {
    const { status, body } = await fetchJSON('/api/ingresos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ monto: -100, fecha: '2026-03-15', categoria: 'Salario' }) });
    assert.strictEqual(status, 400);
    assert.ok(body.errores);
  });

  it('CRUD gastos y alertas', async () => {
    // crear presupuesto
    await fetchJSON('/api/presupuestos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ periodo: '2026-03', presupuestoTotal: 1000000, categoriasAsignadas: { 'Alimentación': 300000, 'Transporte': 200000 } }) });
    // gasto que dispara advertencia (80% = 240k)
    let r = await fetchJSON('/api/gastos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ monto: 260000, fecha: '2026-03-10', categoria: 'Alimentación', descripcion: 'Mercado' }) });
    assert.strictEqual(r.status, 201);
    r = await fetchJSON('/api/alertas?periodo=2026-03');
    assert.ok(r.body.length >= 1);
    assert.ok(r.body.some(a => a.categoria === 'Alimentación'));
    // balance
    await fetchJSON('/api/ingresos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ monto: 2000000, fecha: '2026-03-01', categoria: 'Salario', fuente: 'Empresa', descripcion: 'Sueldo' }) });
    r = await fetchJSON('/api/balance?periodo=2026-03');
    assert.ok(r.body.totalIngresos > 0);
    assert.ok(r.body.totalGastos > 0);
    assert.strictEqual(typeof r.body.saldo, 'number');
  });

  it('categorías CRUD', async () => {
    let r = await fetchJSON('/api/categorias');
    assert.ok(r.body.length >= 8);
    r = await fetchJSON('/api/categorias', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nombre: 'Mascotas', tipo: 'gasto' }) });
    assert.strictEqual(r.status, 201);
    const id = r.body.id;
    r = await fetchJSON('/api/categorias/' + id, { method: 'DELETE' });
    assert.strictEqual(r.status, 200);
  });

  it('reportes categorías y transacciones', async () => {
    let r = await fetchJSON('/api/reportes/categorias?periodo=2026-03');
    assert.ok(r.body.porCategoria);
    r = await fetchJSON('/api/reportes/transacciones?periodo=2026-03');
    assert.ok(Array.isArray(r.body));
  });

  it('histórico', async () => {
    const r = await fetchJSON('/api/reportes/historico?periodo=2026-03');
    assert.strictEqual(r.body.periodo, '2026-03');
  });

  it('export CSV', async () => {
    const res = await fetch(baseUrl + '/api/export/gastos');
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/csv'));
  });
});
