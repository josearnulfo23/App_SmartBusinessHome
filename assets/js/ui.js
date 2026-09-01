// assets/js/ui.js - Interacciones UI generales
function showTab(id) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`[data-tab="${id}"]`);
  if (tab) tab.classList.add('active');
  // cargar datos según vista
  if (id === 'view-balance') cargarBalance();
  if (id === 'view-ingresos') cargarIngresos();
  if (id === 'view-gastos') cargarGastos();
  if (id === 'view-presupuesto') cargarPresupuesto();
  if (id === 'view-categorias-reporte') cargarReporteCategorias();
  if (id === 'view-historico') cargarHistorico();
  if (id === 'view-alertas') cargarAlertas();
}

function formatearCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

async function apiFetch(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.errores?.join(', ') || 'Error en la solicitud');
  }
  // CSV returns text
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/csv')) return res.text();
  return res.json();
}
