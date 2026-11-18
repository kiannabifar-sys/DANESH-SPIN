/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · CHARTS
   Hand-rolled Canvas charts. No dependencies.
   ═══════════════════════════════════════════════════════════ */

const Charts = (() => {
  const DPR = window.devicePixelRatio || 1;

  function setup(canvas, height) {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * DPR;
    canvas.height = (height || rect.height) * DPR;
    canvas.style.height = (height || rect.height) + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    return { ctx, w: rect.width, h: height || rect.height };
  }

  function getColor(varName, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
  }

  /* ── Line chart with smooth curve + area ── */
  function line(canvas, opts = {}) {
    const {
      data = [],
      labels = [],
      height = 200,
      color = getColor('--accent', '#FF4D00'),
      fill = true,
      grid = true,
      animate = true
    } = opts;

    const { ctx, w, h } = setup(canvas, height);
    const pad = { t: 12, r: 12, b: 24, l: 32 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;

    const min = Math.min(...data, 0);
    const max = Math.max(...data, 1) * 1.1;
    const range = max - min || 1;

    const px = (i) => pad.l + (i / (data.length - 1 || 1)) * cw;
    const py = (v) => pad.t + ch - ((v - min) / range) * ch;

    // Grid
    if (grid) {
      ctx.strokeStyle = getColor('--line-subtle', 'rgba(255,255,255,0.06)');
      ctx.lineWidth = 1;
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const y = pad.t + (i / steps) * ch;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(w - pad.r, y);
        ctx.stroke();
      }
    }

    // Animate
    let progress = animate ? 0 : 1;
    const startTime = performance.now();
    const duration = 700;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Grid redraw (since we cleared)
      if (grid) {
        ctx.strokeStyle = getColor('--line-subtle', 'rgba(255,255,255,0.06)');
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = pad.t + (i / 4) * ch;
          ctx.beginPath();
          ctx.moveTo(pad.l, y);
          ctx.lineTo(w - pad.r, y);
          ctx.stroke();
        }
      }

      // Y labels
      ctx.fillStyle = getColor('--ink-lo', '#55524D');
      ctx.font = '10px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const v = min + (range * (4 - i) / 4);
        const y = pad.t + (i / 4) * ch;
        ctx.fillText(Math.round(v), pad.l - 6, y + 3);
      }

      // X labels
      if (labels.length) {
        ctx.textAlign = 'center';
        labels.forEach((lbl, i) => {
          if (labels.length > 8 && i % 2 !== 0) return;
          ctx.fillText(lbl, px(i), h - 6);
        });
      }

      // Area fill
      if (fill) {
        const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
        grad.addColorStop(0, color + '40');
        grad.addColorStop(1, color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(px(0), pad.t + ch);
        for (let i = 0; i < data.length * progress; i++) {
          ctx.lineTo(px(i), py(data[i]));
        }
        ctx.lineTo(px(Math.ceil(data.length * progress) - 1), pad.t + ch);
        ctx.closePath();
        ctx.fill();
      }

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      const total = Math.min(data.length, Math.ceil(data.length * progress));
      for (let i = 0; i < total; i++) {
        const x = px(i);
        const y = py(data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else {
          const px0 = px(i - 1);
          const py0 = py(data[i - 1]);
          const cx = (px0 + x) / 2;
          ctx.bezierCurveTo(cx, py0, cx, y, x, y);
        }
      }
      ctx.stroke();

      // Points
      ctx.fillStyle = color;
      for (let i = 0; i < total; i++) {
        ctx.beginPath();
        ctx.arc(px(i), py(data[i]), 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (progress < 1) {
        progress = Math.min(1, (performance.now() - startTime) / duration);
        requestAnimationFrame(draw);
      }
    }
    draw();
    return { redraw: () => draw() };
  }

  /* ── Bar chart ── */
  function bar(canvas, opts = {}) {
    const {
      data = [],
      labels = [],
      height = 200,
      color = getColor('--accent', '#FF4D00'),
      grid = true
    } = opts;

    const { ctx, w, h } = setup(canvas, height);
    const pad = { t: 16, r: 12, b: 24, l: 32 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;
    const max = Math.max(...data, 1) * 1.15;
    const bw = (cw / data.length) * 0.6;
    const gap = cw / data.length;

    let progress = 0;
    const startTime = performance.now();

    function draw() {
      ctx.clearRect(0, 0, w, h);

      if (grid) {
        ctx.strokeStyle = getColor('--line-subtle', 'rgba(255,255,255,0.06)');
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = pad.t + (i / 4) * ch;
          ctx.beginPath();
          ctx.moveTo(pad.l, y);
          ctx.lineTo(w - pad.r, y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = getColor('--ink-lo', '#55524D');
      ctx.font = '10px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const v = (max * (4 - i) / 4);
        const y = pad.t + (i / 4) * ch;
        ctx.fillText(Math.round(v), pad.l - 6, y + 3);
      }

      ctx.textAlign = 'center';
      data.forEach((v, i) => {
        const bh = (v / max) * ch * progress;
        const x = pad.l + i * gap + (gap - bw) / 2;
        const y = pad.t + ch - bh;
        const grad = ctx.createLinearGradient(0, y, 0, pad.t + ch);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '60');
        ctx.fillStyle = grad;
        ctx.beginPath();
        const r = Math.min(4, bw / 2);
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + bw - r, y);
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
        ctx.lineTo(x + bw, pad.t + ch);
        ctx.lineTo(x, pad.t + ch);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();

        if (labels[i]) {
          ctx.fillStyle = getColor('--ink-lo', '#55524D');
          ctx.fillText(labels[i], x + bw / 2, h - 6);
        }
      });

      if (progress < 1) {
        progress = Math.min(1, (performance.now() - startTime) / 600);
        requestAnimationFrame(draw);
      }
    }
    draw();
  }

  /* ── Donut chart ── */
  function donut(canvas, opts = {}) {
    const {
      data = [],
      colors = ['#FF4D00', '#3B82F6', '#D4AF37', '#22C55E', '#A855F7'],
      height = 200,
      centerText = '',
      centerSub = ''
    } = opts;

    const { ctx, w, h } = setup(canvas, height);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 20;
    const innerR = radius * 0.62;
    const total = data.reduce((s, v) => s + v, 0) || 1;

    let progress = 0;
    const startTime = performance.now();

    function draw() {
      ctx.clearRect(0, 0, w, h);
      let angle = -Math.PI / 2;

      data.forEach((v, i) => {
        const slice = (v / total) * Math.PI * 2 * progress;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, angle, angle + slice);
        ctx.arc(cx, cy, innerR, angle + slice, angle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        angle += slice;
      });

      if (progress >= 1) {
        ctx.fillStyle = getColor('--ink-hi', '#F5F2ED');
        ctx.font = '600 20px "Geist", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerText, cx, cy - 4);
        if (centerSub) {
          ctx.fillStyle = getColor('--ink-lo', '#55524D');
          ctx.font = '500 9px "Geist Mono", monospace';
          ctx.fillText(centerSub, cx, cy + 14);
        }
      }

      if (progress < 1) {
        progress = Math.min(1, (performance.now() - startTime) / 700);
        requestAnimationFrame(draw);
      }
    }
    draw();
  }

  /* ── Sparkline (mini) ── */
  function spark(canvas, opts = {}) {
    const { data = [], height = 40, color = getColor('--accent', '#FF4D00') } = opts;
    const { ctx, w, h } = setup(canvas, height);
    if (!data.length) return;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const px = (i) => (i / (data.length - 1)) * w;
    const py = (v) => h - ((v - min) / range) * (h - 4) - 2;

    ctx.beginPath();
    data.forEach((v, i) => {
      if (i === 0) ctx.moveTo(px(i), py(v));
      else ctx.lineTo(px(i), py(v));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ── Radar chart ── */
  function radar(canvas, opts = {}) {
    const {
      values = [],
      labels = [],
      height = 260,
      color = getColor('--accent', '#FF4D00')
    } = opts;

    const { ctx, w, h } = setup(canvas, height);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 40;
    const n = values.length;

    let progress = 0;
    const startTime = performance.now();

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Rings
      ctx.strokeStyle = getColor('--line-subtle', 'rgba(255,255,255,0.06)');
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius * (r / 4);
          const y = cy + Math.sin(angle) * radius * (r / 4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Axes
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.stroke();
      }

      // Data polygon
      ctx.beginPath();
      values.forEach((v, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = radius * (v / 100) * progress;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = color + '30';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = getColor('--ink-mid', '#8A8781');
      ctx.font = '10px "Geist Mono", monospace';
      ctx.textAlign = 'center';
      labels.forEach((lbl, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * (radius + 18);
        const y = cy + Math.sin(angle) * (radius + 18) + 3;
        ctx.fillText(lbl, x, y);
      });

      if (progress < 1) {
        progress = Math.min(1, (performance.now() - startTime) / 700);
        requestAnimationFrame(draw);
      }
    }
    draw();
  }

  return { line, bar, donut, spark, radar };
})();

window.Charts = Charts;
