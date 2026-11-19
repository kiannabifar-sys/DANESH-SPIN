/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · TACTICS BOARD
   ═══════════════════════════════════════════════════════════ */

Router.register('tactics', () => {
  const { el } = Utils;
  let currentType = Store.get('tactics.type') || 'attack';
  const shots = [];

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Tactical Designer'),
      el('h1', { class: 'page-title' }, 'Design your next point'),
      el('p', { class: 'page-sub' }, 'Plot shots on a live court. Select a type, click anywhere to place.')
    ),
    el('div', { class: 'page-head-actions' },
      el('button', { class: 'btn btn-ghost btn-sm', onclick: () => { shots.forEach(s => { s.dot.remove(); s.path.remove(); }); shots.length = 0; } }, 'Clear'),
      el('button', { class: 'btn btn-secondary btn-sm', onclick: () => toast('Saved to notebook.') }, 'Save pattern')
    )
  ));

  const grid = el('div', { class: 'tactics-grid' });

  /* Court */
  const court = el('div', { class: 'court', id: 'court' },
    el('div', { class: 'court-inner' },
      el('div', { class: 'court-net' }),
      el('div', { class: 'court-mid' })
    ),
    el('div', { class: 'court-hint' }, 'Click to place shots')
  );
  grid.appendChild(court);

  /* Side panel */
  const side = el('div', { class: 'tactics-side' });
  [
    { type: 'attack', label: 'Forehand Attack', cls: 'attack' },
    { type: 'defense', label: 'Backhand Block', cls: 'defense' },
    { type: 'serve', label: 'Serve / Receive', cls: 'serve' }
  ].forEach(t => {
    const btn = el('button', {
      class: `shot-type ${t.type === currentType ? 'active' : ''}`,
      onclick: () => {
        currentType = t.type;
        Store.set('tactics.type', t.type);
        side.querySelectorAll('.shot-type').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    },
      el('span', { class: `shot-type-dot ${t.cls}` }),
      el('span', {}, t.label)
    );
    side.appendChild(btn);
  });

  side.appendChild(el('div', { style: { flex: 1 } }));
  side.appendChild(el('div', { style: { padding: '12px', background: 'var(--bg-raised)', borderRadius: 'var(--r-sm)', fontSize: '11px', color: 'var(--ink-lo)', lineHeight: '1.6' } },
    'Tip: place shots to see how a pattern develops. Use Save to keep it for later analysis.'
  ));
  grid.appendChild(side);
  root.appendChild(grid);

  /* Click handler */
  setTimeout(() => {
    const courtEl = document.getElementById('court');
    if (!courtEl) return;
    courtEl.addEventListener('click', (e) => {
      const rect = courtEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 8 || x > rect.width - 8 || y < 8 || y > rect.height - 8) return;

      const dot = el('div', { class: `shot ${currentType}` });
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      courtEl.appendChild(dot);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx, dy = y - cy;
      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const path = el('div', { class: `shot-path ${currentType}` });
      path.style.left = cx + 'px';
      path.style.top = cy + 'px';
      path.style.width = len + 'px';
      path.style.transform = `rotate(${angle}deg)`;
      courtEl.appendChild(path);

      shots.push({ dot, path });
      if (shots.length > 30) {
        const old = shots.shift();
        old.dot.remove();
        old.path.remove();
      }
    });
  }, 100);

  return root;
}, { title: 'Tactics' });
