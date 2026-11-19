/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · SETTINGS
   ═══════════════════════════════════════════════════════════ */

Router.register('settings', () => {
  const { el } = Utils;
  const prefs = Store.get('prefs');
  let tab = 'appearance';

  const root = el('div', {});
  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Settings'),
      el('h1', { class: 'page-title' }, 'Preferences'),
      el('p', { class: 'page-sub' }, 'Customize your DANESH SPIN experience.')
    )
  ));

  const grid = el('div', { class: 'settings-grid' });

  const nav = el('div', { class: 'settings-nav' });
  const TABS = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'data', label: 'Data' },
    { id: 'about', label: 'About' }
  ];

  function renderPanel() {
    const panel = el('div', { class: 'card', style: { flex: 1 } });
    if (tab === 'appearance') {
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Theme'),
          el('div', { class: 'setting-desc' }, 'Switch between light and dark.')
        ),
        el('div', { class: 'seg', id: 'themeSeg' },
          el('button', { class: `seg-btn ${prefs.theme === 'dark' ? 'active' : ''}`, onclick: () => setPref('theme', 'dark') }, 'Dark'),
          el('button', { class: `seg-btn ${prefs.theme === 'light' ? 'active' : ''}`, onclick: () => setPref('theme', 'light') }, 'Light')
        )
      ));
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Sidebar collapsed'),
          el('div', { class: 'setting-desc' }, 'Minimize sidebar to icon mode.')
        ),
        toggle('sidebarCollapsed', prefs.sidebarCollapsed)
      ));
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Reduced motion'),
          el('div', { class: 'setting-desc' }, 'Disable non-essential animations.')
        ),
        toggle('motion', prefs.motion === 'full')
      ));
    } else if (tab === 'account') {
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'User'),
          el('div', { class: 'setting-desc' }, Store.get('user').name)
        ),
        el('button', { class: 'btn btn-secondary btn-sm', onclick: () => Router.navigate('profile') }, 'Edit')
      ));
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Sign out'),
          el('div', { class: 'setting-desc' }, 'Log out of this device.')
        ),
        el('button', { class: 'btn btn-danger btn-sm', onclick: () => toast('Signed out.') }, 'Sign out')
      ));
    } else if (tab === 'notifications') {
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Push notifications'),
          el('div', { class: 'setting-desc' }, 'Match results, rank changes, and updates.')
        ),
        toggle('notifications', prefs.notifications)
      ));
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Sound effects'),
          el('div', { class: 'setting-desc' }, 'Play subtle sounds on interactions.')
        ),
        toggle('sounds', prefs.sounds)
      ));
    } else if (tab === 'data') {
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Export data'),
          el('div', { class: 'setting-desc' }, 'Download all your data as JSON.')
        ),
        el('button', { class: 'btn btn-secondary btn-sm', onclick: exportData }, 'Export')
      ));
      panel.appendChild(el('div', { class: 'setting-row' },
        el('div', {},
          el('div', { class: 'setting-label' }, 'Reset app'),
          el('div', { class: 'setting-desc' }, 'Erase all local data. Cannot be undone.')
        ),
        el('button', { class: 'btn btn-danger btn-sm', onclick: resetData }, 'Reset')
      ));
    } else if (tab === 'about') {
      panel.appendChild(el('div', { style: { padding: '12px 0', fontSize: '13px', lineHeight: '1.8', color: 'var(--ink-mid)' } },
        el('div', { style: { fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', color: 'var(--ink-hi)', marginBottom: '12px' } }, 'DANESH SPIN · Performance OS'),
        el('p', {}, 'Version 2.0.0 · Built with vanilla HTML, CSS, and JavaScript.'),
        el('p', { style: { marginTop: '12px' } }, '© 2026 DANESH SPIN. All rights reserved.')
      ));
    }
    return panel;
  }

  function toggle(key, initial) {
    const t = el('div', { class: `toggle ${initial ? 'on' : ''}` });
    t.addEventListener('click', () => {
      const next = !t.classList.contains('on');
      t.classList.toggle('on', next);
      setPref(key, next);
    });
    return t;
  }

  function setPref(key, value) {
    Store.update('prefs', p => ({ ...p, [key]: value }));
    if (key === 'theme') {
      document.body.setAttribute('data-theme', value);
    }
    if (key === 'sidebarCollapsed') {
      document.getElementById('app').classList.toggle('collapsed', value);
    }
    toast('Preference updated.', 'success');
  }

  function exportData() {
    const blob = new Blob([Store.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danesh-spin-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported.', 'success');
  }

  async function resetData() {
    if (await Utils.confirmDialog('Reset all data? This cannot be undone.', { danger: true, confirmLabel: 'Reset everything' })) {
      Store.reset();
      toast('Data reset.', 'success');
      setTimeout(() => location.reload(), 600);
    }
  }

  function refresh() {
    Utils.clear(nav);
    TABS.forEach(t => {
      nav.appendChild(el('div', {
        class: `settings-nav-item ${t.id === tab ? 'active' : ''}`,
        onclick: () => { tab = t.id; refresh(); }
      }, t.label));
    });
    const oldPanel = grid.querySelector('.card');
    if (oldPanel) oldPanel.replaceWith(renderPanel());
    else grid.appendChild(renderPanel());
  }

  grid.appendChild(nav);
  refresh();
  root.appendChild(grid);

  return root;
}, { title: 'Settings' });
