/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · UTILS
   ═══════════════════════════════════════════════════════════ */

/* ── DOM ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') node.innerHTML = v;
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function html(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ''), '');
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

function mount(parent, ...children) {
  clear(parent);
  for (const c of children.flat()) {
    if (c == null) continue;
    parent.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return parent;
}

/* ── Formatting ── */
function fmtNum(n, opts = {}) {
  if (n == null || isNaN(n)) return '—';
  const { decimals = 0, compact = false } = opts;
  if (compact && Math.abs(n) >= 1000) {
    return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  }
  return Intl.NumberFormat('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

function fmtPct(n, decimals = 1) {
  return `${Number(n).toFixed(decimals)}%`;
}

function fmtDate(dateStr, style = 'short') {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const opts = style === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', opts);
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '—';
}

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ── Timing ── */
function debounce(fn, wait = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, wait = 100) {
  let last = 0, timer = null;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, wait - (now - last));
    }
  };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ── Event bus ── */
const Bus = (() => {
  const map = new Map();
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => map.get(evt)?.delete(fn);
    },
    off(evt, fn) {
      map.get(evt)?.delete(fn);
    },
    emit(evt, ...args) {
      map.get(evt)?.forEach(fn => {
        try { fn(...args); } catch (e) { console.warn(e); }
      });
    }
  };
})();

/* ── Toast ── */
function toast(message, kind = 'default', duration = 3200) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const node = el('div', { class: `toast ${kind}` },
    el('span', { class: 'toast-dot' }),
    el('span', { class: 'toast-msg' }, message)
  );
  stack.appendChild(node);
  setTimeout(() => {
    node.classList.add('removing');
    setTimeout(() => node.remove(), 300);
  }, duration);
}

/* ── Modal ── */
const Modal = (() => {
  let backdrop, body, closeBtn;
  function init() {
    backdrop = document.getElementById('modalBackdrop');
    body = document.getElementById('modalBody');
    closeBtn = document.getElementById('modalClose');
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
    });
  }
  function open({ title, sub, content, actions, size = '' }) {
    if (!backdrop) init();
    backdrop.querySelector('.modal').className = 'modal ' + size;
    mount(body,
      title ? el('div', { class: 'modal-title' }, title) : null,
      sub ? el('div', { class: 'modal-sub' }, sub) : null,
      ...(Array.isArray(content) ? content : [content]),
      actions ? el('div', { class: 'modal-actions' },
        ...actions.map(a => el('button', {
          class: `btn ${a.class || 'btn-secondary'}`,
          onclick: () => { a.onClick?.(); if (a.close !== false) close(); }
        }, a.label))
      ) : null
    );
    backdrop.classList.add('open');
  }
  function close() {
    backdrop?.classList.remove('open');
  }
  return { open, close };
})();

/* ── Confirm ── */
function confirmDialog(message, { title = 'Confirm', confirmLabel = 'Confirm', danger = false } = {}) {
  return new Promise(resolve => {
    Modal.open({
      title,
      sub: message,
      content: [],
      actions: [
        { label: 'Cancel', class: 'btn-ghost', onClick: () => resolve(false) },
        { label: confirmLabel, class: danger ? 'btn-danger' : 'btn-primary', onClick: () => resolve(true) }
      ]
    });
  });
}

/* ── Tooltip (uses data-tip attribute already in CSS) ── */
// Automatic via [data-tip] attribute — no JS needed

/* ── Random ── */
function rnd(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}
function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}
function pick(arr) {
  return arr[rndInt(0, arr.length - 1)];
}

/* ── Storage (light) ── */
const local = {
  get(k, def = null) {
    try { const v = localStorage.getItem('ds:' + k); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set(k, v) {
    try { localStorage.setItem('ds:' + k, JSON.stringify(v)); } catch {}
  },
  del(k) {
    try { localStorage.removeItem('ds:' + k); } catch {}
  }
};

/* ── Colors ── */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── Scroll helper ── */
function scrollTop(smooth = true) {
  const view = document.getElementById('view');
  if (view) view.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

/* ── Icon set (inline SVG strings) ── */
const Icons = {
  dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>',
  analytics: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M7 15l4-6 4 4 5-8"/></svg>',
  tactics: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M12 5v14"/><circle cx="8" cy="11" r="1.5"/><circle cx="16" cy="14" r="1.5"/></svg>',
  academy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7l10-4 10 4-10 4L2 7z"/><path d="M6 9v6c0 1.5 3 3 6 3s6-1.5 6-3V9"/><path d="M22 7v6"/></svg>',
  calculator: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>',
  ranking: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21V11M16 21V3M12 21V15"/></svg>',
  matches: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 4h4M16 4h4"/><path d="M12 16v4M9 20h6"/></svg>',
  training: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  profile: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  shop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18l-2 12H5L3 7z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></svg>',
  community: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21c0-3.5 3.5-6 7-6s7 2.5 7 6"/><path d="M22 21c0-2.5-2-4.5-5-4.5"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  admin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
};

window.Utils = {
  $, $$, el, html, clear, mount,
  fmtNum, fmtPct, fmtDate, fmtTime, timeAgo, initials, slugify,
  debounce, throttle, sleep,
  Bus, toast, Modal, confirmDialog,
  rnd, rndInt, pick,
  local, cssVar, scrollTop,
  Icons
};
