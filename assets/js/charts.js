// assets/js/charts.js - Gráficos con Canvas nativo (sin dependencias externas)
// Dibuja gráfico de torta simple
function drawPieChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const total = Object.values(data).reduce((s,v) => s+v, 0);
  if (total === 0) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos para mostrar', canvas.width/2, canvas.height/2);
    return;
  }
  const colors = ['#1a73e8','#34a853','#fbbc04','#ea4335','#9c27b0','#00acc1','#ff6d00','#607d8b'];
  let start = -Math.PI/2;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2, cy = canvas.height/2, r = Math.min(cx, cy) - 10;
  let i = 0;
  for (const label in data) {
    const angle = (data[label]/total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start+angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
    i++;
  }
}

// Gráfico de barras horizontal comparativo
function drawBarChart(canvasId, labels, values, maxValue) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!labels.length) {
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos', canvas.width/2, canvas.height/2);
    return;
  }
  const padding = 40;
  const barHeight = Math.min(28, (canvas.height - 40) / labels.length - 8);
  const max = maxValue || Math.max(...values, 1);
  const barWidthMax = canvas.width - padding - 80;
  labels.forEach((label, idx) => {
    const y = 20 + idx * (barHeight + 8);
    const w = (values[idx]/max) * barWidthMax;
    ctx.fillStyle = '#1a73e8';
    ctx.fillRect(padding, y, w, barHeight);
    ctx.fillStyle = '#202124';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 2, y + barHeight/2 + 4);
    ctx.textAlign = 'right';
    ctx.fillText(String(values[idx]), padding + w + 30, y + barHeight/2 + 4);
  });
}
