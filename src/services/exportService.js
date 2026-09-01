// src/services/exportService.js - Exportación de datos
function toCSV(items, columns) {
  const header = columns.join(',');
  const rows = items.map(item => columns.map(col => {
    let val = item[col] != null ? String(item[col]) : '';
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      val = '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }).join(','));
  return [header, ...rows].join('\n');
}

function exportarIngresosCSV(ingresos) {
  return toCSV(ingresos, ['id', 'monto', 'fecha', 'categoria', 'fuente', 'descripcion']);
}
function exportarGastosCSV(gastos) {
  return toCSV(gastos, ['id', 'monto', 'fecha', 'categoria', 'descripcion']);
}
function exportarPresupuestoCSV(presupuestos) {
  const flat = [];
  presupuestos.forEach(p => {
    for (const cat in (p.categoriasAsignadas || {})) {
      flat.push({ periodo: p.periodo, categoria: cat, monto: p.categoriasAsignadas[cat], total: p.presupuestoTotal });
    }
  });
  return toCSV(flat, ['periodo', 'categoria', 'monto', 'total']);
}

module.exports = { toCSV, exportarIngresosCSV, exportarGastosCSV, exportarPresupuestoCSV };
