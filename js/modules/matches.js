/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · MATCHES
   ═══════════════════════════════════════════════════════════ */

Router.register('matches', () => {
  const { el, fmtDate } = Utils;

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Match Log'),
      el('h1', { class: 'page-title' }, 'Match history'),
      el('p', { class: 'page-sub' }, 'Every match, every score. Filter and analyze.')
    ),
    el('div', { class: 'page-head-actions' },
      el('button', {
        class: 'btn btn-primary',
        onclick: () => openNewMatchModal()
      }, '+ Log match')
    )
  ));

  function renderList() {
    const matches = Store.get('matches');
    const list = el('div', { id: 'matchList' });

    const stats = {
      won: matches.filter(m => m.result === 'win').length,
      lost: matches.filter(m => m.result === 'loss').length
    };

    list.appendChild(el('div', { class: 'stat-grid', style: { marginBottom: '20px' } },
      el('div', { class: 'card' },
        el('div', { class: 'stat' },
          el('div', { class: 'stat-label' }, 'Total matches'),
          el('div', { class: 'stat-value', style: { fontSize: '26px' } }, matches.length)
        )
      ),
      el('div', { class: 'card' },
        el('div', { class: 'stat' },
          el('div', { class: 'stat-label' }, 'Won'),
          el('div', { class: 'stat-value', style: { fontSize: '26px', color: 'var(--success)' } }, stats.won)
        )
      ),
      el('div', { class: 'card' },
        el('div', { class: 'stat' },
          el('div', { class: 'stat-label' }, 'Lost'),
          el('div', { class: 'stat-value', style: { fontSize: '26px', color: 'var(--danger)' } }, stats.lost)
        )
      ),
      el('div', { class: 'card' },
        el('div', { class: 'stat' },
          el('div', { class: 'stat-label' }, 'Win rate'),
          el('div', { class: 'stat-value', style: { fontSize: '26px' } }, `${Math.round(stats.won / matches.length * 100)}%`)
        )
      )
    ));

    matches.forEach(m => {
      list.appendChild(el('div', { class: 'match-card' },
        el('div', { class: `match-result ${m.result}` }, m.score),
        el('div', {},
          el('div', { class: 'match-opponent' }, `vs. ${m.opponent}`),
          el('div', { class: 'match-meta' }, `${m.event} · ${fmtDate(m.date)} · Rating ${m.rating}`)
        ),
        el('span', { class: `badge badge-${m.result === 'win' ? 'success' : 'danger'}` }, m.result),
        el('button', {
          class: 'btn btn-ghost btn-sm',
          onclick: () => {
            Utils.confirmDialog(`Delete match vs. ${m.opponent}?`, { danger: true, confirmLabel: 'Delete' }).then(ok => {
              if (ok) {
                Store.remove('matches', x => x.id === m.id);
                toast('Match deleted.');
                refresh();
              }
            });
          }
        }, '⋯')
      ));
    });

    return list;
  }

  function refresh() {
    const old = document.getElementById('matchList');
    if (old) old.replaceWith(renderList());
  }

  root.appendChild(renderList());

  function openNewMatchModal() {
    const opponentInput = el('input', { class: 'input', placeholder: 'Opponent name', required: 'true' });
    const eventInput = el('input', { class: 'input', placeholder: 'Event (e.g. Club League)' });
    const scoreInput = el('input', { class: 'input', placeholder: 'Score (e.g. 3-1)' });
    const resultSelect = el('select', { class: 'select' },
      el('option', { value: 'win' }, 'Win'),
      el('option', { value: 'loss' }, 'Loss')
    );

    Modal.open({
      title: 'Log a match',
      sub: 'Record a recent match to keep your stats up to date.',
      content: [
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Opponent'),
          opponentInput
        ),
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Event'),
          eventInput
        ),
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Score'),
          scoreInput
        ),
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Result'),
          resultSelect
        )
      ],
      actions: [
        { label: 'Cancel', class: 'btn-ghost' },
        {
          label: 'Save match',
          class: 'btn-primary',
          onClick: () => {
            if (!opponentInput.value.trim()) {
              toast('Opponent name required.', 'danger');
              return;
            }
            Store.push('matches', {
              id: 'm-' + Date.now(),
              date: new Date().toISOString().slice(0, 10),
              opponent: opponentInput.value.trim(),
              result: resultSelect.value,
              score: scoreInput.value.trim() || '—',
              event: eventInput.value.trim() || 'Friendly',
              rating: Math.floor(1500 + Math.random() * 300)
            });
            Store.update('stats', s => ({
              ...s,
              matchesPlayed: s.matchesPlayed + 1,
              matchesWon: s.matchesWon + (resultSelect.value === 'win' ? 1 : 0)
            }));
            toast('Match saved.', 'success');
            refresh();
          }
        }
      ]
    });
  }

  return root;
}, { title: 'Matches' });
