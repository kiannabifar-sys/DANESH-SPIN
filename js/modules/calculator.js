/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · BLADE CALCULATOR
   ═══════════════════════════════════════════════════════════ */

Router.register('calculator', () => {
  const { el } = Utils;
  const state = Store.get('calc') || { style: 'offense', grip: 'shake', exp: 'inter', priority: 'spin' };

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Equipment Intelligence'),
      el('h1', { class: 'page-title' }, 'Find your ideal blade'),
      el('p', { class: 'page-sub' }, 'Four quick answers. We match you with the ideal setup.')
    )
  ));

  const grid = el('div', { class: 'calc-grid' });
  const form = el('div', { class: 'card calc-form' });

  const FIELDS = [
    { key: 'style', label: 'Playing style', options: [{ v: 'offense', l: 'Offensive' }, { v: 'allround', l: 'All-Round' }, { v: 'defense', l: 'Defensive' }] },
    { key: 'grip', label: 'Grip', options: [{ v: 'shake', l: 'Shakehand' }, { v: 'pen', l: 'Penhold' }] },
    { key: 'exp', label: 'Experience', options: [{ v: 'beginner', l: 'Beginner' }, { v: 'inter', l: 'Intermediate' }, { v: 'adv', l: 'Advanced' }] },
    { key: 'priority', label: 'Priority', options: [{ v: 'spin', l: 'Spin' }, { v: 'speed', l: 'Speed' }, { v: 'control', l: 'Control' }] }
  ];

  FIELDS.forEach(f => {
    const group = el('div', { class: 'field' },
      el('label', { class: 'field-label' }, f.label),
      el('div', { class: 'chip-row' },
        ...f.options.map(o => el('button', {
          class: `chip ${state[f.key] === o.v ? 'active' : ''}`,
          'data-field': f.key,
          'data-val': o.v,
          onclick: (e) => {
            state[f.key] = o.v;
            Store.set('calc', { ...state });
            form.querySelectorAll(`[data-field="${f.key}"]`).forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            update();
          }
        }, o.l))
      )
    );
    form.appendChild(group);
  });
  grid.appendChild(form);

  /* Result */
  const resultName = el('div', { class: 'calc-result-name' }, '—');
  const resultDesc = el('div', { class: 'calc-result-desc' }, '');
  const bars = {};
  const vals = {};

  const result = el('div', { class: 'calc-result' },
    el('div', { class: 't-eyebrow', style: { color: 'var(--accent)' } }, 'Recommended setup'),
    resultName,
    resultDesc,
    el('div', { class: 'calc-specs' },
      ...['speed', 'spin', 'control'].map(k => {
        bars[k] = el('div', { class: 'calc-spec-fill', style: { width: '0%' } });
        vals[k] = el('span', { class: 'calc-spec-val' }, '0');
        return el('div', { class: 'calc-spec' },
          el('span', { class: 'calc-spec-label' }, k),
          el('div', { class: 'calc-spec-bar' }, bars[k]),
          vals[k]
        );
      })
    ),
    el('button', {
      class: 'btn btn-primary',
      onclick: () => toast('Setup saved to your profile.', 'success')
    }, 'Save setup →')
  );
  grid.appendChild(result);
  root.appendChild(grid);

  function update() {
    const s = state;
    let name = 'DANESH Apex Carbon';
    let desc = 'Carbon-inner offensive blade tuned for power and spin.';
    let speed = 75, spin = 75, control = 75;

    if (s.style === 'offense') { name = 'DANESH Apex Carbon'; desc = 'Carbon-inner offensive blade tuned for power and spin.'; speed = 88; spin = 84; control = 68; }
    else if (s.style === 'allround') { name = 'DANESH Equilibrium 5'; desc = '5-ply all-wood all-round blade. Balanced and predictable.'; speed = 72; spin = 78; control = 88; }
    else { name = 'DANESH Guard Pro'; desc = 'Defensive blade with enlarged sweet spot and vibration damping.'; speed = 55; spin = 70; control = 95; }

    if (s.grip === 'pen') { name += ' · Pen'; desc += ' Optimized for penhold grip.'; }
    if (s.exp === 'beginner') { control += 6; speed -= 6; }
    if (s.exp === 'adv') { speed += 6; control -= 4; }
    if (s.priority === 'spin') { spin += 10; speed -= 4; }
    else if (s.priority === 'speed') { speed += 10; control -= 6; }
    else { control += 10; speed -= 4; }

    speed = Math.max(40, Math.min(99, speed));
    spin = Math.max(40, Math.min(99, spin));
    control = Math.max(40, Math.min(99, control));

    resultName.textContent = name;
    resultDesc.textContent = desc;
    Object.entries({ speed, spin, control }).forEach(([k, v]) => {
      bars[k].style.width = v + '%';
      vals[k].textContent = v;
    });
  }
  update();

  return root;
}, { title: 'Blade Calculator' });
