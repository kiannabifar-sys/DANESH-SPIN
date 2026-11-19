/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · RANKING
   ═══════════════════════════════════════════════════════════ */

const RANKING = [
  { pos: 1, name: 'Fan Chen', country: 'CHN', points: 18420, win: 91.2, events: 24, trend: 2, initials: 'FC' },
  { pos: 2, name: 'Liam Møller', country: 'DEN', points: 17880, win: 88.7, events: 22, trend: -1, initials: 'LM' },
  { pos: 3, name: 'Hana Aoki', country: 'JPN', points: 17210, win: 89.4, events: 21, trend: 3, initials: 'HA' },
  { pos: 4, name: 'Marco Silva', country: 'BRA', points: 16740, win: 86.1, events: 20, trend: 1, initials: 'MS' },
  { pos: 5, name: 'Elias Kohl', country: 'GER', points: 16220, win: 85.8, events: 19, trend: -2, initials: 'EK' },
  { pos: 6, name: 'Yuki Tanaka', country: 'JPN', points: 15890, win: 84.3, events: 22, trend: 4, initials: 'YT' },
  { pos: 7, name: 'Sofia Rossi', country: 'ITA', points: 15430, win: 83.6, events: 18, trend: 0, initials: 'SR' },
  { pos: 8, name: 'Omar Farouk', country: 'EGY', points: 14980, win: 82.4, events: 20, trend: 1, initials: 'OF' },
  { pos: 9, name: 'Nils Berg', country: 'SWE', points: 14560, win: 81.9, events: 17, trend: -3, initials: 'NB' },
  { pos: 10, name: 'Mei Lin', country: 'CHN', points: 14120, win: 81.2, events: 19, trend: 2, initials: 'ML' }
];

Router.register('ranking', () => {
  const { el, fmtNum, fmtPct } = Utils;

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Global Ranking'),
      el('h1', { class: 'page-title' }, 'Top of the ladder'),
      el('p', { class: 'page-sub' }, 'Live ranking from verified ITTF-sanctioned events.')
    ),
    el('div', { class: 'page-head-actions' },
      el('div', { class: 'seg' },
        el('button', { class: 'seg-btn active' }, 'Global'),
        el('button', { class: 'seg-btn' }, 'Region'),
        el('button', { class: 'seg-btn' }, 'Club')
      )
    )
  ));

  const table = el('div', { class: 'card', style: { padding: '0', overflow: 'hidden' } });

  const head = el('div', { class: 'rank-row head' },
    el('div', {}, '#'),
    el('div', {}, 'Player'),
    el('div', { style: { textAlign: 'right' } }, 'Points'),
    el('div', { style: { textAlign: 'right' } }, 'Win %'),
    el('div', { style: { textAlign: 'right' } }, 'Events'),
    el('div', { style: { textAlign: 'right' } }, 'Trend')
  );
  table.appendChild(head);

  RANKING.forEach(r => {
    const posClass = r.pos === 1 ? 'top1' : r.pos === 2 ? 'top2' : r.pos === 3 ? 'top3' : '';
    const trendClass = r.trend > 0 ? 'up' : r.trend < 0 ? 'down' : 'flat';
    const trendIcon = r.trend > 0 ? '▲' : r.trend < 0 ? '▼' : '·';

    table.appendChild(el('div', { class: 'rank-row' },
      el('div', { class: `rank-pos ${posClass}` }, String(r.pos).padStart(2, '0')),
      el('div', { class: 'rank-player' },
        el('div', { class: 'avatar' }, r.initials),
        el('div', {},
          el('div', { class: 'rank-name' }, r.name),
          el('div', { class: 'rank-country' }, r.country)
        )
      ),
      el('div', { class: 'rank-val strong', style: { textAlign: 'right' } }, fmtNum(r.points)),
      el('div', { class: 'rank-val', style: { textAlign: 'right' } }, fmtPct(r.win)),
      el('div', { class: 'rank-val', style: { textAlign: 'right' } }, r.events),
      el('div', {
        class: `rank-val`,
        style: { textAlign: 'right', color: r.trend > 0 ? 'var(--success)' : r.trend < 0 ? 'var(--danger)' : 'var(--ink-mid)' }
      }, `${trendIcon} ${Math.abs(r.trend) || ''}`)
    ));
  });

  root.appendChild(table);

  /* User's position card */
  root.appendChild(el('div', { class: 'card', style: { marginTop: '16px', borderColor: 'var(--accent-wash)' } },
    el('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' } },
      el('div', { class: 'rank-pos', style: { fontSize: '22px', color: 'var(--accent)' } }, '#340'),
      el('div', { class: 'avatar avatar-lg' }, Store.get('user').avatar),
      el('div', { style: { flex: 1, minWidth: '160px' } },
        el('div', { style: { fontSize: '14px', fontWeight: '600', color: 'var(--ink-hi)' } }, Store.get('user').name),
        el('div', { style: { fontSize: '12px', color: 'var(--ink-mid)' } }, `${fmtNum(Store.get('stats.rankPoints'))} points · ${Store.get('stats.rankTier')}`)
      ),
      el('div', { class: 'badge badge-accent' }, 'YOUR RANK')
    )
  ));

  return root;
}, { title: 'Ranking' });
