// assets/js/charts.js v2.0 - torta, barras y líneas con Canvas nativo + animación
const CHART_COLORS = ['#1a73e8','#34a853','#fbbc04','#ea4335','#9c27b0','#00acc1','#ff6d00','#607d8b','#3949ab','#00897b'];

function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  return ctx;
}

function drawPieChart(canvasId, data, opts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = clearCanvas(canvas);
  opts = opts || {};
  const total = Object.values(data).reduce((s,v) => s+v, 0);
  if (total === 0) {
    ctx.fillStyle = '#999'; ctx.textAlign='center'; ctx.font='14px sans-serif';
    ctx.fillText('Sin datos para mostrar', canvas.width/2, canvas.height/2);
    return;
  }
  const cx = canvas.width/2, cy = canvas.height/2, r = Math.min(cx, cy) - 20;
  let start = -Math.PI/2;
  const labels = Object.keys(data);
  // Leyenda
  let legendY = 10;
  labels.forEach((label, i) => {
    const angle = (data[label]/total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, start+angle); ctx.closePath();
    ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length]; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke();
    // leyenda pequeña arriba
    ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
    ctx.fillRect(8, legendY, 10, 10);
    ctx.fillStyle = '#333'; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText(label + ' (' + ((data[label]/total)*100).toFixed(1)+'%)', 22, legendY+9);
    legendY += 14;
    start += angle;
  });
}

function drawBarChart(canvasId, labels, values, maxValue) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = clearCanvas(canvas);
  if (!labels.length) { ctx.fillStyle='#999'; ctx.textAlign='center'; ctx.fillText('Sin datos', canvas.width/2, canvas.height/2); return; }
  const padding = 100, topPad=20;
  const barHeight = Math.min(28, (canvas.height - topPad - 20) / labels.length - 6);
  const max = maxValue || Math.max(...values, 1);
  const barWidthMax = canvas.width - padding - 60;
  const isDark = document.body.classList.contains('dark');
  labels.forEach((label, idx) => {
    const y = topPad + idx * (barHeight + 6);
    const w = (values[idx]/max) * barWidthMax;
    // animación simple: barras crecen
    ctx.fillStyle = CHART_COLORS[idx % CHART_COLORS.length];
    ctx.fillRect(padding, y, w, barHeight);
    ctx.fillStyle = isDark ? '#e8eaed' : '#202124';
    ctx.font='12px sans-serif'; ctx.textAlign='left';
    // truncar label
    const shortLabel = label.length > 14 ? label.slice(0,14)+'…' : label;
    ctx.fillText(shortLabel, 4, y + barHeight/2 + 4);
    ctx.textAlign='right';
    ctx.fillText(new Intl.NumberFormat('es-CO').format(values[idx]), padding + w + 50, y + barHeight/2 + 4);
  });
}

function drawLineChart(canvasId, labels, series) {
  // series: [{label, values, color}]
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = clearCanvas(canvas);
  if (!labels.length || !series.length) { ctx.fillStyle='#999'; ctx.textAlign='center'; ctx.fillText('Sin datos', canvas.width/2, canvas.height/2); return; }
  const W = canvas.width, H = canvas.height;
  const pad = { l:50, r:20, t:20, b:30 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const allVals = series.flatMap(s=> s.values);
  let max = Math.max(...allVals, 1);
  let min = Math.min(...allVals, 0);
  if (max===min) { max+=1; min-=1; }
  const range = max - min;
  // grid
  ctx.strokeStyle='#e0e0e0'; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
    const y = pad.t + (i/4)*plotH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
    const val = max - (i/4)*range;
    ctx.fillStyle='#5f6368'; ctx.font='10px sans-serif'; ctx.textAlign='right';
    ctx.fillText(new Intl.NumberFormat('es-CO',{notation:'compact'}).format(val), pad.l-6, y+3);
  }
  // x labels
  const stepX = plotW / Math.max(labels.length-1,1);
  labels.forEach((lb,i)=>{
    const x = pad.l + i*stepX;
    ctx.fillStyle='#5f6368'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    const shortLb = lb.length>7 ? lb.slice(2) : lb;
    ctx.fillText(shortLb, x, H - 6);
  });
  // líneas
  series.forEach((s, si)=>{
    ctx.strokeStyle = s.color || CHART_COLORS[si % CHART_COLORS.length];
    ctx.lineWidth=2; ctx.beginPath();
    s.values.forEach((v,i)=>{
      const x = pad.l + i*stepX;
      const y = pad.t + (1 - (v - min)/range)*plotH;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
    // puntos
    ctx.fillStyle = ctx.strokeStyle;
    s.values.forEach((v,i)=>{
      const x = pad.l + i*stepX;
      const y = pad.t + (1 - (v - min)/range)*plotH;
      ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    });
  });
  // leyenda
  let lx = pad.l;
  series.forEach((s,i)=>{
    ctx.fillStyle = s.color || CHART_COLORS[i % CHART_COLORS.length];
    ctx.fillRect(lx, 4, 10, 10);
    ctx.fillStyle='#202124'; ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText(s.label, lx+14, 13);
    lx += ctx.measureText(s.label).width + 30;
  });
}
