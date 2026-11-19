/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · PROFILE
   ═══════════════════════════════════════════════════════════ */

Router.register('profile', () => {
  const { el, fmtDate, fmtNum, fmtPct } = Utils;
  const user = Store.get('user');
  const stats = Store.get('stats');
  const matches = Store.get('matches');

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Profile'),
      el('h1', { class: 'page-title' }, 'Your athlete page'),
      el('p', { class: 'page-sub' }, 'Everything about your game, in one place.')
    ),
    el('div', { class: 'page-head-actions' },
      el('button', {
        class: 'btn btn-secondary',
        onclick: () => openEditModal()
      }, 'Edit profile')
    )
  ));

  /* Hero */
  root.appendChild(el('div', { class: 'profile-hero' },
    el('div', { class: 'profile-avatar' }, user.avatar),
    el('div', { class: 'profile-info' },
      el('div', { class: 'profile-name' }, user.name),
      el('div', { class: 'profile-title' }, `${user.handle} · ${user.role} · ${user.country}`),
      el('div', { style: { fontSize: '13px', color: 'var(--ink-mid)', marginBottom: '12px', lineHeight: '1.6' } }, user.bio),
      el('div', { class: 'profile-stats' },
        el('div', { class: 'profile-stat' },
          el('div', { class: 'profile-stat-val' }, fmtNum(stats.rankPoints)),
          el('div', { class: 'profile-stat-label' }, 'Points')
        ),
        el('div', { class: 'profile-stat' },
          el('div', { class: 'profile-stat-val' }, `#${stats.globalRank}`),
          el('div', { class: 'profile-stat-label' }, 'Global rank')
        ),
        el('div', { class: 'profile-stat' },
          el('div', { class: 'profile-stat-val' }, fmtPct(stats.winRate)),
          el('div', { class: 'profile-stat-label' }, 'Win rate')
        ),
        el('div', { class: 'profile-stat' },
          el('div', { class: 'profile-stat-val' }, fmtNum(stats.hoursTrained)),
          el('div', { class: 'profile-stat-label' }, 'Hours trained')
        )
      )
    ),
    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      el('span', { class: 'badge badge-accent' }, user.tier),
      el('span', { class: 'badge badge-gold' }, stats.rankTier)
    )
  ));

  /* Equipment card */
  root.appendChild(el('div', { class: 'dash-grid' },
    el('div', { class: 'card dash-col-6' },
      el('div', { class: 'card-head' },
        el('div', { class: 'card-head-title' },
          el('div', { class: 'card-title' }, 'Equipment')
        )
      ),
      el('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' } },
        ...[
          ['Blade', user.blade],
          ['Forehand rubber', user.rubberFH],
          ['Backhand rubber', user.rubberBH],
          ['Grip', user.grip],
          ['Playing style', user.style]
        ].map(([k, v]) => el('div', { style: { display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--line-subtle)' } },
          el('span', { style: { color: 'var(--ink-mid)' } }, k),
          el('span', { style: { color: 'var(--ink-hi)', fontWeight: '500', fontFamily: 'var(--font-mono)', fontSize: '12px' } }, v)
        ))
      )
    ),
    el('div', { class: 'card dash-col-6' },
      el('div', { class: 'card-head' },
        el('div', { class: 'card-head-title' },
          el('div', { class: 'card-title' }, 'Recent activity')
        )
      ),
      ...matches.slice(0, 4).map(m => el('div', { class: 'row' },
        el('div', { class: `match-result ${m.result}`, style: { fontSize: '11px', minWidth: '46px' } }, m.score),
        el('div', { class: 'row-flex' },
          el('div', { class: 'row-title' }, m.opponent),
          el('div', { class: 'row-sub' }, fmtDate(m.date))
        )
      ))
    )
  ));

  function openEditModal() {
    const nameInput = el('input', { class: 'input', value: user.name });
    const bioInput = el('textarea', { class: 'textarea' }, user.bio);
    const bladeInput = el('input', { class: 'input', value: user.blade });

    Modal.open({
      title: 'Edit profile',
      sub: 'Update your personal details.',
      content: [
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Name'),
          nameInput
        ),
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Bio'),
          bioInput
        ),
        el('div', { class: 'field' },
          el('label', { class: 'field-label' }, 'Blade'),
          bladeInput
        )
      ],
      actions: [
        { label: 'Cancel', class: 'btn-ghost' },
        {
          label: 'Save',
          class: 'btn-primary',
          onClick: () => {
            Store.update('user', u => ({
              ...u,
              name: nameInput.value,
              bio: bioInput.value,
              blade: bladeInput.value,
              avatar: Utils.initials(nameInput.value)
            }));
            toast('Profile updated.', 'success');
            Router.navigate('profile', { replace: true });
          }
        }
      ]
    });
  }

  return root;
}, { title: 'Profile' });
