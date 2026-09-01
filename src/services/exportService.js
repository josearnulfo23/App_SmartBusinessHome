// src/services/exportService.js - Exportación de datos v2.1 (CSV, XLSX, PDF)
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

// Combinado CSV (ingresos + gastos)
function exportarCombinadoCSV(ingresos, gastos, presupuestos) {
  let out = '=== INGRESOS ===\n';
  out += exportarIngresosCSV(ingresos) + '\n\n';
  out += '=== GASTOS ===\n';
  out += exportarGastosCSV(gastos) + '\n\n';
  out += '=== PRESUPUESTOS ===\n';
  out += exportarPresupuestoCSV(presupuestos) + '\n';
  return out;
}

// XLSX — requiere exceljs si está instalado, fallback a CSV con mime XLSX
async function exportarXLSX(ingresos, gastos, presupuestos) {
  try {
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SmartBusinessHome';
    wb.created = new Date();

    const ws1 = wb.addWorksheet('Ingresos');
    ws1.columns = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Monto', key: 'monto', width: 14 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Categoría', key: 'categoria', width: 16 },
      { header: 'Fuente', key: 'fuente', width: 16 },
      { header: 'Descripción', key: 'descripcion', width: 30 }
    ];
    ingresos.forEach(r => ws1.addRow(r));
    ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A73E8' } };
    ws1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    const ws2 = wb.addWorksheet('Gastos');
    ws2.columns = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Monto', key: 'monto', width: 14 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Categoría', key: 'categoria', width: 16 },
      { header: 'Descripción', key: 'descripcion', width: 30 }
    ];
    ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };
    gastos.forEach(r => ws2.addRow(r));

    const ws3 = wb.addWorksheet('Presupuestos');
    ws3.columns = [
      { header: 'Periodo', key: 'periodo', width: 12 },
      { header: 'Categoría', key: 'categoria', width: 16 },
      { header: 'Monto', key: 'monto', width: 14 },
      { header: 'Total', key: 'total', width: 14 }
    ];
    ws3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
    const flat = [];
    presupuestos.forEach(p => {
      for (const cat in (p.categoriasAsignadas || {})) {
        flat.push({ periodo: p.periodo, categoria: cat, monto: p.categoriasAsignadas[cat], total: p.presupuestoTotal });
      }
    });
    flat.forEach(r => ws3.addRow(r));
    if (flat.length === 0) ws3.addRow({ periodo: '-', categoria: 'Sin datos', monto: 0, total: 0 });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (e) {
    // Fallback sin exceljs: devolver CSV como buffer para no romper
    if (e.code === 'MODULE_NOT_FOUND') {
      const csv = exportarCombinadoCSV(ingresos, gastos, presupuestos);
      return Buffer.from(csv, 'utf-8');
    }
    throw e;
  }
}

// PDF — requiere pdfkit si está instalado
function exportarPDF(ingresos, gastos, presupuestos) {
  return new Promise((resolve, reject) => {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Título
      doc.fontSize(18).fillColor('#0d47a1').text('SmartBusinessHome — Reporte Financiero', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#5f6368').text(`Generado: ${new Date().toLocaleString('es-CO')}  |  Ingresos: ${ingresos.length}  |  Gastos: ${gastos.length}`, { align: 'center' });
      doc.moveDown(1);

      function addTable(title, headers, rows, color) {
        doc.fontSize(12).fillColor(color || '#1a73e8').text(title);
        doc.moveDown(0.3);
        // Cabecera
        const colWidths = headers.map(() => 90);
        const startX = 40;
        let y = doc.y;
        // Fondo cabecera
        doc.rect(startX, y, 515, 18).fill(color || '#1a73e8');
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
        let x = startX + 4;
        headers.forEach((h, i) => {
          doc.text(h, x, y + 5, { width: colWidths[i], continued: false });
          x += colWidths[i];
        });
        y += 18;
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(7).fillColor('#202124');
        rows.slice(0, 80).forEach(row => {
          if (y > 720) { doc.addPage(); y = 40; }
          x = startX + 4;
          // fila alternada
          if (rows.indexOf(row) % 2 === 0) {
            doc.rect(startX, y, 515, 12).fill('#f5f7fa');
            doc.fillColor('#202124');
          }
          row.forEach((cell, i) => {
            const txt = String(cell ?? '').slice(0, 28);
            doc.text(txt, x, y + 3, { width: colWidths[i] });
            x += colWidths[i];
          });
          y += 12;
        });
        doc.y = y + 8;
        if (rows.length > 80) {
          doc.fontSize(7).fillColor('#5f6368').text(`... y ${rows.length - 80} filas más (ver CSV/XLSX completo)`);
        }
        doc.moveDown(0.8);
      }

      const totalIng = ingresos.reduce((s, r) => s + Number(r.monto || 0), 0);
      const totalGas = gastos.reduce((s, r) => s + Number(r.monto || 0), 0);
      doc.fontSize(10).fillColor('#202124').text(`Resumen:  Ingresos $${totalIng.toLocaleString('es-CO')}  |  Gastos $${totalGas.toLocaleString('es-CO')}  |  Saldo $${(totalIng-totalGas).toLocaleString('es-CO')}`, { align: 'left' });
      doc.moveDown(0.8);

      addTable('Ingresos', ['ID', 'Monto', 'Fecha', 'Categoría', 'Fuente'], ingresos.map(r => [r.id, r.monto, r.fecha, r.categoria, r.fuente || '-']), '#2e7d32');
      addTable('Gastos', ['ID', 'Monto', 'Fecha', 'Categoría', 'Descripción'], gastos.map(r => [r.id, r.monto, r.fecha, r.categoria, (r.descripcion || '-').slice(0, 22)]), '#c62828');
      const flatPres = [];
      presupuestos.forEach(p => {
        for (const cat in (p.categoriasAsignadas || {})) flatPres.push([p.periodo, cat, p.categoriasAsignadas[cat], p.presupuestoTotal]);
      });
      addTable('Presupuestos', ['Periodo', 'Categoría', 'Monto', 'Total'], flatPres.length ? flatPres : [['-', 'Sin datos', 0, 0]], '#1a73e8');

      doc.fontSize(7).fillColor('#9aa0a6').text('SmartBusinessHome v2.1 — OSL-3.0 — José Arnulfo Céspedes Albornoz', 40, doc.page.height - 30, { align: 'center' });
      doc.end();
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        // Fallback: crear txt como pdf-like
        const txt = `SmartBusinessHome Reporte\n\nIngresos: ${ingresos.length}\nGastos: ${gastos.length}\n\nInstale pdfkit para PDF real: npm install pdfkit\n`;
        // Devolver buffer de texto con cabecera PDF mínima
        const fallback = Buffer.from(txt, 'utf-8');
        // Intentar crear PDF vacío mínimo
        const header = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 72 720 Td (Reporte ver CSV) Tj ET\nendstream endobj\nxref\n0 5\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF');
        // Por ahora devolver fallback texto con extensión pdf (el navegador lo descargará)
        // Para no romper, resolvemos con el texto
        resolve(fallback);
        return;
      }
      reject(e);
    }
  });
}

module.exports = { toCSV, exportarIngresosCSV, exportarGastosCSV, exportarPresupuestoCSV, exportarCombinadoCSV, exportarXLSX, exportarPDF };
