/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · ROUTER
   Hash-based SPA router with history.
   ═══════════════════════════════════════════════════════════ */

const Router = (() => {
  const routes = new Map();
  const history = [];
  let current = null;
  let beforeLeave = null;

  const NAV_CONFIG = [
    { section: 'Core' },
    { path: 'dashboard',  label: 'Dashboard',  icon: 'dashboard',  section: null },
    { path: 'analytics',  label: 'Analytics',  icon: 'analytics',  section: null },
    { path: 'tactics',    label: 'Tactics',    icon: 'tactics',    section: null },
    { section: 'Practice' },
    { path: 'academy',    label: 'Academy',    icon: 'academy',    section: null },
    { path: 'training',   label: 'Training',   icon: 'training',   section: null, badge: '3' },
    { path: 'calculator', label: 'Blade Calc', icon: 'calculator', section: null },
    { section: 'Compete' },
    { path: 'matches',    label: 'Matches',    icon: 'matches',    section: null },
    { path: 'ranking',    label: 'Ranking',    icon: 'ranking',    section: null },
    { section: 'Lifestyle' },
    { path: 'profile',    label: 'Profile',    icon: 'profile',    section: null },
    { path: 'shop',       label: 'Shop',       icon: 'shop',       section: null },
    { path: 'community',  label: 'Community',  icon: 'community',  section: null },
    { section: 'System' },
    { path: 'settings',   label: 'Settings',   icon: 'settings',   section: null },
    { path: 'admin',      label: 'Admin',      icon: 'admin',      section: null }
  ];

  function register(path, renderFn, meta = {}) {
    routes.set(path, { render: renderFn, meta });
  }

  function buildNav() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    clear(nav);
    NAV_CONFIG.forEach(item => {
      if (item.section) {
        nav.appendChild(el('div', { class: 'nav-section' }, item.section));
      } else {
        const btn = el('button', {
          class: 'nav-item',
          'data-path': item.path,
          onclick: () => navigate(item.path)
        },
          el('span', { class: 'nav-icon', html: Icons[item.icon] || '' }),
          el('span', { class: 'nav-label' }, item.label),
          item.badge ? el('span', { class: 'nav-badge' }, item.badge) : null
        );
        nav.appendChild(btn);
      }
    });
  }

  function updateActive(path) {
    $$('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.path === path);
    });
    const meta = routes.get(path)?.meta || {};
    const crumbs = document.getElementById('crumbs');
    if (crumbs) {
      clear(crumbs);
      crumbs.appendChild(el('span', { class: 'crumb' }, meta.title || 'Dashboard'));
    }
  }

  function navigate(path, { replace = false } = {}) {
    if (!routes.has(path)) path = 'dashboard';
    if (beforeLeave && current && beforeLeave(current, path) === false) return;

    if (current && current !== path) history.push(current);
    current = path;

    if (!replace) {
      const hash = '#' + path;
      if (location.hash !== hash) history_push(hash);
    }

    updateActive(path);
    const view = document.getElementById('view');
    if (!view) return;

    // Fade transition
    view.style.opacity = '0';
    view.style.transform = 'translateY(6px)';

    setTimeout(() => {
      clear(view);
      const route = routes.get(path);
      const content = route.render();
      if (Array.isArray(content)) content.forEach(c => c && view.appendChild(c));
      else if (content) view.appendChild(content);

      view.style.transition = 'opacity 0.25s var(--ease-out), transform 0.25s var(--ease-out)';
      requestAnimationFrame(() => {
        view.style.opacity = '1';
        view.style.transform = 'translateY(0)';
      });

      scrollTop(false);
      Bus.emit('route:change', path);
    }, 120);
  }

  function history_push(hash) {
    try { history.pushState(null, '', hash); } catch { location.hash = hash; }
  }

  function init() {
    buildNav();
    const startPath = (location.hash || '#dashboard').slice(1);
    navigate(startPath || 'dashboard', { replace: true });

    window.addEventListener('popstate', () => {
      const p = (location.hash || '#dashboard').slice(1);
      if (p !== current) navigate(p, { replace: true });
    });
    window.addEventListener('hashchange', () => {
      const p = (location.hash || '#dashboard').slice(1);
      if (p !== current) navigate(p, { replace: true });
    });
  }

  return {
    register, navigate, init, buildNav,
    current: () => current,
    onBeforeLeave: (fn) => { beforeLeave = fn; },
    routes: () => Array.from(routes.keys()),
    config: NAV_CONFIG
  };
})();

window.Router = Router;
