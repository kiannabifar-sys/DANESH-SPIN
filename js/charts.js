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
        const x = pad.l + i * gap + (gap - bw) /
