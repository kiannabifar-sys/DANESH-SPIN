/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · APP BOOTSTRAP
   Wires up the shell, boots the router, handles globals.
   ═══════════════════════════════════════════════════════════ */

(function boot() {

  /* ── Apply saved preferences before first paint ── */
  const prefs = Store.get('prefs') || {};
  if (prefs.theme)            document.body.setAttribute('data-theme', prefs.theme);
  if (prefs.contrast)         document.body.setAttribute('data-contrast', prefs.contrast);
  if (prefs.sidebarCollapsed) document.getElementById('app').classList.add('collapsed');

  /* ── Boot sequence ── */
  const bootLogs = [
    'initializing kernel…',
    'loading modules…',
    'restoring session…',
    'syncing state…',
    'ready'
  ];
  const bootBar = document.getElementById('bootBar');
  const bootLog = document.getElementById('bootLog');
  let bootStep = 0;

  function bootTick() {
    if (bootStep >= bootLogs.length) {
      setTimeout(() => {
        document.getElementById('boot').classList.add('done');
        document.getElementById('app').classList.remove('hidden');
        Router.init();
        setupGlobalHandlers();
      }, 300);
      return;
    }
    bootLog.textContent = bootLogs[bootStep];
    bootBar.style.width = ((bootStep + 1) / bootLogs.length * 100) + '%';
    bootStep++;
    setTimeout(bootTick, 180);
  }
  bootTick();


  /* ═══════════════════════════════════════════════════════
     GLOBAL HANDLERS
     ═══════════════════════════════════════════════════════ */
  function setupGlobalHandlers() {
    const { $, el, clear, toast } = Utils;
    const app = document.getElementById('app');

    /* ── User chip in sidebar ── */
    const userName   = document.getElementById('userName');
    const userRole   = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const userChip   = document.getElementById('userChip');
    const u = Store.get('user');
    if (userName)   userName.textContent   = u.name;
    if (userRole)   userRole.textContent   = u.role;
    if (userAvatar) userAvatar.textContent = u.avatar;

    userChip?.addEventListener('click', (e) => {
      e.stopPropagation();
      openUserMenu(userChip);
    });

    function openUserMenu(anchor) {
      const existing = document.getElementById('userMenu');
      if (existing) { existing.remove(); return; }

      const menu = el('div', {
        id: 'userMenu',
        style: {
          position: 'fixed',
          bottom: '70px',
          left: '12px',
          width: '220px',
          background: 'var(--bg-overlay)',
          border: '1px solid var(--line-default)',
          borderRadius: 'var(--r-md)',
          padding: '6px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000
        }
      },
        menuItem('Profile',    () => Router.navigate('profile')),
        menuItem('Settings',   () => Router.navigate('settings')),
        menuItem('Admin',      () => Router.navigate('admin')),
        el('div', { style: { height: '1px', background: 'var(--line-subtle)', margin: '4px 0' } }),
        menuItem('Sign out',   () => toast('Signed out.'))
      );
      document.body.appendChild(menu);

      setTimeout(() => {
        document.addEventListener('click', function cleanup(ev) {
          if (!menu.contains(ev.target) && !anchor.contains(ev.target)) {
            menu.remove();
            document.removeEventListener('click', cleanup);
          }
        });
      }, 10);
    }

    function menuItem(label, fn) {
      const item = el('div', {
        style: {
          padding: '7px 12px',
          fontSize: '13px',
          color: 'var(--ink)',
          borderRadius: '4px',
          cursor: 'pointer'
        },
        onclick: () => {
          fn();
          document.getElementById('userMenu')?.remove();
        }
      }, label);
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--bg-raised)'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      return item;
    }

    /* ── Sidebar collapse toggle ── */
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      app.classList.toggle('collapsed');
      Store.update('prefs', p => ({ ...p, sidebarCollapsed: app.classList.contains('collapsed') }));
    });

    /* ── Theme toggle ── */
    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const cur  = document.body.getAttribute('data-theme') || 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', next);
      Store.update('prefs', p => ({ ...p, theme: next }));
      toast(`Theme: ${next}`, 'success');
    });

    /* ── Language / direction toggle ── */
    document.getElementById('langBtn')?.addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      html.setAttribute('dir',  next);
      html.setAttribute('lang', next === 'rtl' ? 'fa' : 'en');
      document.getElementById('langBtn').textContent = next === 'rtl' ? 'FA' : 'EN';
      toast(next === 'rtl' ? 'زبان فارسی فعال شد' : 'English activated', 'success');
    });


    /* ═══════════════════════════════════════════════════
       COMMAND PALETTE  (⌘K / Ctrl+K)
       ═══════════════════════════════════════════════════ */
    const cmdkBackdrop = document.getElementById('cmdkBackdrop');
    const cmdkInput    = document.getElementById('cmdkInput');
    const cmdkResults  = document.getElementById('cmdkResults');
    let   cmdkSelected = 0;
    let   cmdkFiltered = [];

    const CMDS = [
      {
        section: 'Navigate',
        items: Router.config
          .filter(c => c.path)
          .map(c => ({
            label: c.label,
            icon:  c.icon,
            action: () => Router.navigate(c.path)
          }))
      },
      {
        section: 'Create',
        items: [
          { label: 'Log a match',   icon: 'matches',  action: () => Router.navigate('matches') },
          { label: 'Start a drill', icon: 'training', action: () => Router.navigate('training') },
          { label: 'Set a goal',    icon: 'dashboard', action: () => Router.navigate('dashboard') }
        ]
      },
      {
        section: 'System',
        items: [
          { label: 'Toggle theme',    icon: 'settings',  action: () => document.getElementById('themeBtn').click() },
          { label: 'Toggle language', icon: 'community', action: () => document.getElementById('langBtn').click() },
          { label: 'Open settings',   icon: 'settings',  action: () => Router.navigate('settings') }
        ]
      }
    ];

    function openCmdk() {
      cmdkBackdrop.classList.add('open');
      cmdkInput.value = '';
      cmdkSelected = 0;
      renderCmdk('');
      setTimeout(() => cmdkInput.focus(), 60);
    }
    function closeCmdk() {
      cmdkBackdrop.classList.remove('open');
    }

    function renderCmdk(query) {
      clear(cmdkResults);
      cmdkFiltered = [];
      const q = query.toLowerCase();

      CMDS.forEach(sec => {
        const items = sec.items.filter(it => !q || it.label.toLowerCase().includes(q));
        if (!items.length) return;

        cmdkResults.appendChild(el('div', { class: 'cmdk-section' }, sec.section));

        items.forEach(it => {
          const idx = cmdkFiltered.length;
          cmdkFiltered.push(it);

          cmdkResults.appendChild(el('div', {
            class: `cmdk-item ${idx === cmdkSelected ? 'selected' : ''}`,
            onclick: () => { closeCmdk(); it.action(); }
          },
            el('span', { class: 'cmdk-item-icon', html: Icons[it.icon] || '·' }),
            el('span', { class: 'cmdk-item-label' }, it.label)
          ));
        });
      });

      if (!cmdkFiltered.length) {
        cmdkResults.appendChild(el('div', {
          style: { padding: '24px', textAlign: 'center', color: 'var(--ink-lo)', fontSize: '12px' }
        }, 'No results'));
      }
    }

    cmdkInput?.addEventListener('input', (e) => {
      cmdkSelected = 0;
      renderCmdk(e.target.value);
    });

    cmdkInput?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdkSelected = Math.min(cmdkFiltered.length - 1, cmdkSelected + 1);
        renderCmdk(cmdkInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdkSelected = Math.max(0, cmdkSelected - 1);
        renderCmdk(cmdkInput.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = cmdkFiltered[cmdkSelected];
        if (it) { closeCmdk(); it.action(); }
      } else if (e.key === 'Escape') {
        closeCmdk();
      }
    });

    cmdkBackdrop?.addEventListener('click', (e) => {
      if (e.target === cmdkBackdrop) closeCmdk();
    });

    document.getElementById('searchOpen')?.addEventListener('click', openCmdk);

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmdk();
      }
      if (e.key === 'Escape') closeCmdk();
    });


    /* ═══════════════════════════════════════════════════
       NOTIFICATIONS
       ═══════════════════════════════════════════════════ */
    const notifBtn   = document.getElementById('notifBtn');
    const notifPanel = document.getElementById('notifPanel');
    const notifList  = document.getElementById('notifList');

    function renderNotifs() {
      clear(notifList);
      Store.get('notifications').forEach(n => {
        notifList.appendChild(el('div', { class: `notif-item ${n.unread ? 'unread' : 'read'}` },
          el('div', { class: 'notif-body' },
            el('div', { class: 'notif-title' }, n.title),
            el('div', { style: { fontSize: '11px', color: 'var(--ink-mid)', marginTop: '2px' } }, n.body),
            el('div', { class: 'notif-time' }, n.time)
          )
        ));
      });
    }
    renderNotifs();

    notifBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
      document.getElementById('quickPanel').classList.remove('open');
    });

    document.getElementById('notifClear')?.addEventListener('click', () => {
      Store.update('notifications', arr => arr.map(n => ({ ...n, unread: false })));
      renderNotifs();
      document.querySelector('.notif-dot')?.remove();
    });


    /* ═══════════════════════════════════════════════════
       QUICK ACTIONS
       ═══════════════════════════════════════════════════ */
    const quickBtn   = document.getElementById('quickBtn');
    const quickPanel = document.getElementById('quickPanel');

    quickBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      quickPanel.classList.toggle('open');
      notifPanel.classList.remove('open');
    });

    quickPanel?.querySelectorAll('.quick-item').forEach(item => {
      item.addEventListener('click', () => {
        quickPanel.classList.remove('open');
        const a = item.dataset.action;
        if (a === 'new-match')  Router.navigate('matches');
        else if (a === 'new-drill') Router.navigate('training');
        else if (a === 'new-note')  toast('Note saved.');
        else if (a === 'new-goal')  Router.navigate('dashboard');
      });
    });


    /* ═══════════════════════════════════════════════════
       OUTSIDE-CLICK CLOSE
       ═══════════════════════════════════════════════════ */
    document.addEventListener('click', (e) => {
      if (notifPanel && !notifPanel.contains(e.target) && !notifBtn?.contains(e.target)) {
        notifPanel.classList.remove('open');
      }
      if (quickPanel && !quickPanel.contains(e.target) && !quickBtn?.contains(e.target)) {
        quickPanel.classList.remove('open');
      }
    });


    /* ═══════════════════════════════════════════════════
       STATUS CLOCK
       ═══════════════════════════════════════════════════ */
    function updateClock() {
      const c = document.getElementById('statusClock');
      if (c) c.textContent = new Date().toLocaleTimeString('en-GB');
    }
    updateClock();
    setInterval(updateClock, 1000);


    /* ═══════════════════════════════════════════════════
       RESIZE → redraw charts inside current view
       ═══════════════════════════════════════════════════ */
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const path = Router.current();
        if (path) Router.navigate(path, { replace: true });
      }, 250);
    });


    /* ═══════════════════════════════════════════════════
       GLOBAL KEYBOARD SHORTCUTS
       ═══════════════════════════════════════════════════ */
    document.addEventListener('keydown', (e) => {
      // Ignore when typing in inputs
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // g + d → dashboard, g + a → analytics, etc.
      if (e.key === 'g') {
        const handler = (ev) => {
          const map = {
            d: 'dashboard', a: 'analytics', t: 'tactics',
            m: 'matches', r: 'ranking', s: 'settings'
          };
          if (map[ev.key]) Router.navigate(map[ev.key]);
          document.removeEventListener('keydown', handler, true);
        };
        document.addEventListener('keydown', handler, { once: true, capture: true });
        setTimeout(() => document.removeEventListener('keydown', handler, true), 800);
      }

      // / → focus search (opens palette)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openCmdk();
      }
    });


    /* ═══════════════════════════════════════════════════
       SESSION RESTORE
       ═══════════════════════════════════════════════════ */
    const lastPath = Utils.local.get('lastRoute', null);
    if (lastPath && Router.routes().includes(lastPath) && location.hash === '') {
      Router.navigate(lastPath, { replace: true });
    }
    Bus.on('route:change', (p) => Utils.local.set('lastRoute', p));


    /* ═══════════════════════════════════════════════════
       CONSOLE SIGNATURE
       ═══════════════════════════════════════════════════ */
    console.log(
      '%cDANESH SPIN%c  Performance OS · v2.0',
      'background:#FF4D00;color:#fff;padding:4px 10px;border-radius:4px;font-weight:700;font-family:Geist,sans-serif;',
      'color:#8A8781;font-family:Geist,sans-serif;font-size:12px;'
    );
    console.log(
      '%cTip:%c Press ⌘K / Ctrl+K to open the command palette. Press g+d for dashboard, g+a for analytics.',
      'color:#FF4D00;font-weight:600;',
      'color:#8A8781;'
    );
  }
})();
