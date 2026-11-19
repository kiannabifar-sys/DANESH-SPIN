/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · DASHBOARD
   ═══════════════════════════════════════════════════════════ */

Router.register('dashboard', () => {
  const { el, fmtNum, fmtPct } = Utils;
  const user = Store.get('user');
  const stats = Store.get('stats');
  const goals = Store.get('goals');
  const matches = Store.get('matches').slice(0, 3);
  const drills = Store.get('drills').filter(d => !d.done).slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name.split(' ')[0];

  const root = el('div', {});

  /* ── Hero ── */
  root.appendChild(el('div', { class: 'dash-hero' },
    el('div', { class: 'dash-hero-greet' }, `${greeting}, ${firstName}.`),
    el('div', { class: 'dash-hero-name' }, `${stats.currentStreak}-day streak. Keep it alive.`),
    el('div', { class: 'dash-hero-note' },
      `You're ranked #${stats.globalRank} globally in ${stats.rankTier}. ${stats.winRateDelta > 0 ? `Win rate up ${fmtPct(stats.winRateDelta)}` : `Win rate down ${fmtPct(Math.abs(stats.winRateDelta))}`} this month.`
    ),
    el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      el('button', {
        class: 'btn btn-primary',
        onclick: () => Router.navigate('matches')
      }, 'Log a match'),
      el('button', {
        class: 'btn btn-secondary',
        onclick: () => Router.navigate('training')
      }, 'Start a drill'),
      el('button', {
        class: 'btn btn-ghost',
        onclick: () => Router.navigate('analytics')
      }, 'View analytics →')
    )
  ));

  /* ── KPI grid ── */
  const kpis = el('div', { class: 'stat-grid', style: { marginTop: '20px' } });
  const kpiData = [
    { label: 'Win rate', value: fmtPct(stats.winRate), delta: stats.winRateDelta, unit: '' },
    { label: 'Matches played', value: fmtNum(stats.matchesPlayed), delta: null, unit: '' },
    { label: 'Hours trained', value: fmtNum(stats.hoursTrained), delta: 12.4, unit: 'h' },
    { label: 'Rank points', value: fmtNum(stats.rankPoints), delta: 340, unit: 'pts' }
  ];

  kpiData.forEach(k => {
    const deltaEl = k.delta != null ? el('span', {
      class: `stat-delta ${k.delta > 0 ? 'up' : k.delta < 0 ? 'down' : 'flat'}`
    }, `${k.delta > 0 ? '▲' : k.delta < 0 ? '▼' : '·'} ${Math.abs(k.delta)}${k.delta === stats.winRateDelta ? '%' : ''}`) : null;

    kpis.appendChild(el('div', { class: 'card' },
      el('div', { class: 'stat' },
        el('div', { class: 'stat-label' }, k.label),
        el('div', { class: 'stat-value' }, k.value, k.unit ? el('span', { class: 'unit' }, k.unit) : null),
        deltaEl
      )
    ));
  });
  root.appendChild(kpis);

  /* ── Main charts row ── */
  const chartsRow = el('div', { class: 'dash-grid', style: { marginTop: '20px' } });

  const winrateCard = el('div', { class: 'card dash-col-8' },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Win rate · last 30 days'),
        el('div', { class: 'card-sub' }, 'Rolling average across match types')
      ),
      el('div', { class: 'stat-value', style: { fontSize: '28px' } }, fmtPct(stats.winRate))
    ),
    el('div', { class: 'chart chart-tall' },
      el('canvas', { id: 'dashWinrateChart' })
    )
  );
  chartsRow.appendChild(winrateCard);

  const distCard = el('div', { class: 'card dash-col-4' },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Shot composition')
      )
    ),
    el('div', { class: 'chart', style: { height: '200px' } },
      el('canvas', { id: 'dashDistChart' })
    ),
    el('div', { class: 'chart-legend' },
      el('div', { class: 'legend-item' },
        el('span', { class: 'legend-dot', style: { background: 'var(--data-1)' } }),
        el('span', {}, 'Attack · 45%')
      ),
      el('div', { class: 'legend-item' },
        el('span', { class: 'legend-dot', style: { background: 'var(--data-2)' } }),
        el('span', {}, 'Defense · 30%')
      ),
      el('div', { class: 'legend-item' },
        el('span', { class: 'legend-dot', style: { background: 'var(--data-3)' } }),
        el('span', {}, 'Serve · 25%')
      )
    )
  );
  chartsRow.appendChild(distCard);

  const volumeCard = el('div', { class: 'card dash-col-12' },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Weekly training volume'),
        el('div', { class: 'card-sub' }, 'Hours per session · last 7 days')
      ),
      el('div', { class: 'stat-value', style: { fontSize: '20px' } },
        fmtNum(stats.weeklyVolume.reduce((a, b) => a + b, 0), { decimals: 1 }),
        el('span', { class: 'unit' }, 'h')
      )
    ),
    el('div', { class: 'chart chart-med' },
      el('canvas', { id: 'dashVolumeChart' })
    )
  );
  chartsRow.appendChild(volumeCard);

  root.appendChild(chartsRow);

  /* ── Bottom row: goals, matches, drills ── */
  const bottom = el('div', { class: 'dash-grid', style: { marginTop: '20px' } });

  // Goals
  const goalsCard = el('div', { class: 'card dash-col-4' },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Active goals')
      ),
      el('button', {
        class: 'btn btn-ghost btn-sm',
        onclick: () => {
          const title = prompt('New goal:');
          if (title) {
            Store.push('goals', {
              id: 'g-' + Date.now(),
              title,
              progress: 0,
              target: 100
            });
            toast('Goal created.', 'success');
            Router.navigate('dashboard', { replace: true });
          }
        }
      }, '+ Add')
    )
  );
  goals.forEach(g => {
    goalsCard.appendChild(el('div', { style: { marginBottom: '14px' } },
      el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
        el('div', { style: { fontSize: '12px', color: 'var(--ink-hi)' } }, g.title),
        el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-mid)' } }, `${g.progress}%`)
      ),
      el('div', { class: 'progress' },
        el('div', { class: 'progress-fill', style: { width: g.progress + '%' } })
      )
    ));
  });
  bottom.appendChild(goalsCard);

  // Recent matches
  const matchesCard = el('div', { class: 'card dash-col-4' },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Recent matches')
      ),
      el('button', {
        class: 'btn btn-ghost btn-sm',
        onclick: () => Router.navigate('matches')
      }, 'All →')
    )
  );
  matches.forEach(m => {
    matchesCard.appendChild(el('div', { class: 'row' },
      el('div', {
        class: `match-result ${m.result}`,
        style: { fontSize: '12px', minWidth: '46px' }
      }, m.score),
      el('div', { class: 'row-flex' },
        el('div', { class: 'row-title' }, m.opponent),
        el('div', { class: 'row-sub' }, `${m.event} · ${fmtDate(m.date)}`)
      ),
      el('span', { class: `badge badge-${m.result === 'win' ? 'success' : 'danger'}` }, m.result)
    ));
  });
  bottom.appendChild(matchesCard);

  // Upcoming drills
  const drillsCard = el('div', { class: 'card dash-col-4' },
    el('div', { class: 'card-head' },
      el('div', { class: 'card-head-title' },
        el('div', { class: 'card-title' }, 'Next drills')
      ),
      el('button', {
        class: 'btn btn-ghost btn-sm',
        onclick: () => Router.navigate('training')
      }, 'All →')
    )
  );
  drills.forEach(d => {
    drillsCard.appendChild(el('div', { class: 'row' },
      el('div', { class: 'row-flex' },
        el('div', { class: 'row-title' }, d.name),
        el('div', { class: 'row-sub' }, `${d.duration} min · ${d.reps} reps`)
      ),
      el('button', {
        class: 'btn btn-ghost btn-sm',
        onclick: () => {
          Store.update('drills', arr => arr.map(x => x.id === d.id ? { ...x, done: true } : x));
          toast('Drill completed!', 'success');
          Router.navigate('dashboard', { replace: true });
        }
      }, '✓')
    ));
  });
  bottom.appendChild(drillsCard);

  root.appendChild(bottom);

  /* ── Charts init (after mount) ── */
  setTimeout(() => {
    const winCanvas = document.getElementById('dashWinrateChart');
    if (winCanvas) {
      Charts.line(winCanvas, {
        data: [62, 65, 63, 68, 71, 69, 74, 76, 75, 78, 76, 80, 82, 79, 83, 85, 82, 84, 87, 88, 86, 89, 91, 88, 90, 92, 94, 91, 93, 95],
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        height: 280,
        color: Utils.cssVar('--accent'),
        fill: true,
        grid: true
      });
    }
    const distCanvas = document.getElementById('dashDistChart');
    if (distCanvas) {
      Charts.donut(distCanvas, {
        data: [45, 30, 25],
        colors: [Utils.cssVar('--data-1'), Utils.cssVar('--data-2'), Utils.cssVar('--data-3')],
        height: 200,
        centerText: '1,420',
        centerSub: 'SHOTS'
      });
    }
    const volCanvas = document.getElementById('dashVolumeChart');
    if (volCanvas) {
      Charts.bar(volCanvas, {
        data: stats.weeklyVolume,
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        height: 200,
        color: Utils.cssVar('--accent')
      });
    }
  }, 180);

  return root;
}, { title: 'Dashboard' });
