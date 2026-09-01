// tests/unit/exportService.test.js
const assert = require('assert');
const { describe, it } = require('node:test');
const exp = require('../../src/services/exportService');

describe('exportService', () => {
  it('toCSV genera cabecera y filas', () => {
    const csv = exp.toCSV([{a:1,b:'hola'},{a:2,b:'mundo'}], ['a','b']);
    const lines = csv.split('\n');
    assert.strictEqual(lines[0], 'a,b');
    assert.strictEqual(lines.length, 3);
  });
  it('toCSV escapa comas y comillas', () => {
    const csv = exp.toCSV([{a:'hola, mundo', b:'dice "ok"'}], ['a','b']);
    assert.ok(csv.includes('"hola, mundo"'));
    assert.ok(csv.includes('""ok""'));
  });
  it('exportarGastosCSV genera contenido', () => {
    const csv = exp.exportarGastosCSV([{id:'1', monto:100, fecha:'2026-03-15', categoria:'Alimentación', descripcion:'test'}]);
    assert.ok(csv.includes('monto'));
    assert.ok(csv.includes('Alimentación'));
  });
});
