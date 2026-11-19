/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · TRAINING
   ═══════════════════════════════════════════════════════════ */

Router.register('training', () => {
  const { el } = Utils;

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Training'),
      el('h1', { class: 'page-title' }, 'Practice with purpose'),
      el('p', { class: 'page-sub' }, 'Structured drills, timers, and tracking.')
    )
  ));

  /* Timer section */
  let timerSeconds = 300;
  let timerInterval = null;

  const timerDisplay = el('div', { class: 'timer-big' }, '05:00');

  function renderTimer() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const startBtn = el('button', {
    class: 'btn btn-primary',
    onclick: () => {
      if (timerInterval) return;
      timerInterval = setInterval(() => {
        timerSeconds--;
        renderTimer();
        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerSeconds = 300;
          renderTimer();
          toast('Drill complete! 🎉', 'success');
        }
      }, 1000);
    }
  }, '▶ Start');

  const timerCard = el('div', { class: 'card', style: { marginBottom: '20px' } },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Drill timer'),
        el('div', { class: 'card-sub' }, 'Track your training blocks')
      )
    ),
    timerDisplay,
    el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
      startBtn,
      el('button', {
        class: 'btn btn-secondary',
        onclick: () => { clearInterval(timerInterval); timerInterval = null; }
      }, '⏸ Pause'),
      el('button', {
        class: 'btn btn-ghost',
        onclick: () => { clearInterval(timerInterval); timerInterval = null; timerSeconds = 300; renderTimer(); }
      }, 'Reset')
    )
  );
  root.appendChild(timerCard);

  /* Drills */
  root.appendChild(el('h2', { class: 't-h3', style: { marginBottom: '12px' } }, 'Drills'));

  const grid = el('div', { class: 'dash-grid' });
  const DRILL_ICONS = { attack: '⚔', defense: '🛡', serve: '◎', movement: '↔', match: '◆' };

  function refreshDrills() {
    Utils.clear(grid);
    Store.get('drills').forEach(d => {
      grid.appendChild(el('div', { class: 'drill-card dash-col-4' },
        el('div', { class: 'drill-icon' }, DRILL_ICONS[d.cat] || '◇'),
        el('div', { class: 'drill-title' }, d.name),
        el('div', { class: 'drill-desc' }, `${d.duration} min · ${d.reps} reps · ${d.cat.toUpperCase()}`),
        el('div', { class: 'drill-meta' },
          el('span', {}, d.done ? '✓ DONE' : 'PENDING')
        ),
        el('button', {
          class: `btn ${d.done ? 'btn-ghost' : 'btn-primary'} btn-sm`,
          onclick: () => {
            Store.update('drills', arr => arr.map(x => x.id === d.id ? { ...x, done: !x.done } : x));
            refreshDrills();
            toast(d.done ? 'Marked as pending.' : 'Drill completed!', 'success');
          }
        }, d.done ? 'Mark pending' : 'Mark done')
      ));
    });
  }
  refreshDrills();
  root.appendChild(grid);

  return root;
}, { title: 'Training' });
