/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · ADMIN
   ═══════════════════════════════════════════════════════════ */

Router.register('admin', () => {
  const { el, fmtNum } = Utils;
  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Admin'),
      el('h1', { class: 'page-title' }, 'System overview'),
      el('p', { class: 'page-sub' }, 'Platform health, users, and content.')
    )
  ));

  /* KPIs */
  const grid = el('div', { class: 'admin-grid' });
  [
    { label: 'Total users', value: '12,480', delta: '+8.2%' },
    { label: 'Active today', value: '1,204', delta: '+2.1%' },
    { label: 'Lessons viewed', value: '48.2K', delta: '+14%' },
    { label: 'Avg. session', value: '22m', delta: '+1m' },
    { label: 'Matches logged', value: '9,840', delta: '+6%' },
    { label: 'Uptime', value: '99.98%', delta: 'stable' }
  ].forEach(k => {
    grid.appendChild(el('div', { class: 'kpi' },
      el('div', { class: 'kpi-label' }, k.label),
      el('div', { class: 'kpi-val' }, k.value),
      el('div', { class: 'kpi-delta' }, k.delta)
    ));
  });
  root.appendChild(grid);

  /* Table */
  const table = el('div', { class: 'card', style: { padding: '0', overflow: 'hidden' } });
  table.appendChild(el('div', { class: 'card-head', style: { padding: '16px 20px', borderBottom: '1px solid var(--line-subtle)', margin: 0 } },
    el('div', { class: 'card-head-title' },
      el('div', { class: 'card-title' }, 'Recent sign-ups')
    )
  ));

  const tbody = el('table', { class: 'table' },
    el('thead', {},
      el('tr', {},
        el('th', {}, 'User'),
        el('th', {}, 'Country'),
        el('th', {}, 'Tier'),
        el('th', {}, 'Joined'),
        el('th', {}, 'Status')
      )
    ),
    el('tbody', {},
      ...[
        { name: 'Ali Rezaei', country: 'IRN', tier: 'Free', joined: '2m ago', status: 'active' },
        { name: 'Sara Kim', country: 'KOR', tier: 'Pro', joined: '1h ago', status: 'active' },
        { name: 'Tom Becker', country: 'GER', tier: 'Free', joined: '3h ago', status: 'pending' },
        { name: 'Lina Chen', country: 'CHN', tier: 'Pro', joined: '6h ago', status: 'active' },
        { name: 'Marc Dubois', country: 'FRA', tier: 'Free', joined: '1d ago', status: 'active' }
      ].map(u => el('tr', {},
        el('td', {}, u.name),
        el('td', {}, u.country),
        el('td', {}, el('span', { class: `badge badge-${u.tier === 'Pro' ? 'accent' : 'neutral'}` }, u.tier)),
        el('td', { style: { color: 'var(--ink-mid)', fontSize: '12px' } }, u.joined),
        el('td', {}, el('span', { class: `badge badge-${u.status === 'active' ? 'success' : 'warn'}` }, u.status))
      ))
    )
  );
  table.appendChild(tbody);
  root.appendChild(table);

  return root;
}, { title: 'Admin' });
