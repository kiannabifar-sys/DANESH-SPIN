/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · ACADEMY
   ═══════════════════════════════════════════════════════════ */

const LESSONS = [
  { id: 'l-01', title: 'Forehand Loop', desc: 'The foundation of modern offensive play. Generate heavy topspin with a compact, whip-like motion.', level: 'advanced', levelLabel: 'ADVANCED', duration: '12 min', cat: 'attack' },
  { id: 'l-02', title: 'Backhand Flick', desc: 'Turn a short serve into immediate offense. Master the wrist snap and body rotation.', level: 'inter', levelLabel: 'INTERMEDIATE', duration: '9 min', cat: 'attack' },
  { id: 'l-03', title: 'Chop Defense', desc: 'The classic defensive shot. Learn to absorb pace and impart heavy backspin from distance.', level: 'advanced', levelLabel: 'ADVANCED', duration: '15 min', cat: 'defense' },
  { id: 'l-04', title: 'Pendulum Serve', desc: 'A deceptive serve with sidespin and backspin variations. Master the wrist motion for maximum disguise.', level: 'inter', levelLabel: 'INTERMEDIATE', duration: '11 min', cat: 'serve' },
  { id: 'l-05', title: 'Footwork Patterns', desc: 'Side-shuffle, pivot, and cross-step. The invisible technique behind every great shot.', level: 'foundation', levelLabel: 'FOUNDATION', duration: '8 min', cat: 'movement' },
  { id: 'l-06', title: 'Counter Loop', desc: 'Meet topspin with topspin. The most electrifying exchange in modern table tennis.', level: 'advanced', levelLabel: 'ADVANCED', duration: '14 min', cat: 'attack' },
  { id: 'l-07', title: 'Service Receive', desc: 'Reading spin and neutralizing the serve. The most overlooked skill in amateur play.', level: 'inter', levelLabel: 'INTERMEDIATE', duration: '13 min', cat: 'serve' },
  { id: 'l-08', title: 'Close-to-Table Play', desc: 'The modern game favors quick, short strokes near the table. Master it.', level: 'advanced', levelLabel: 'ADVANCED', duration: '16 min', cat: 'attack' },
  { id: 'l-09', title: 'Mental Reset Ritual', desc: 'Build a repeatable routine between points to stay composed under pressure.', level: 'foundation', levelLabel: 'FOUNDATION', duration: '6 min', cat: 'mental' }
];

Router.register('academy', () => {
  const { el } = Utils;
  let filter = 'all';
  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Academy'),
      el('h1', { class: 'page-title' }, 'Master the craft'),
      el('p', { class: 'page-sub' }, `${LESSONS.length} curated lessons from coaches and pros.`)
    )
  ));

  const filters = el('div', { class: 'academy-filters' });
  ['all', 'attack', 'defense', 'serve', 'movement', 'mental'].forEach(f => {
    filters.appendChild(el('button', {
      class: `chip ${f === filter ? 'active' : ''}`,
      'data-filter': f,
      onclick: () => {
        filter = f;
        filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        filters.querySelector(`[data-filter="${f}"]`).classList.add('active');
        renderGrid();
      }
    }, f.charAt(0).toUpperCase() + f.slice(1)));
  });
  root.appendChild(filters);

  const grid = el('div', { class: 'academy-grid' });
  root.appendChild(grid);

  function renderGrid() {
    Utils.clear(grid);
    const items = filter === 'all' ? LESSONS : LESSONS.filter(l => l.cat === filter);
    items.forEach((l, i) => {
      const card = el('div', {
        class: 'lesson',
        onclick: () => openLesson(l)
      },
        el('div', { class: 'lesson-thumb' },
          el('div', { class: 'lesson-level' }, l.levelLabel),
          el('div', { class: 'lesson-num' }, String(i + 1).padStart(2, '0'))
        ),
        el('div', { class: 'lesson-body' },
          el('div', { class: 'lesson-title' }, l.title),
          el('div', { class: 'lesson-desc' }, l.desc),
          el('div', { class: 'lesson-meta' },
            el('span', {}, l.duration),
            el('span', {}, '·'),
            el('span', {}, l.cat.toUpperCase())
          )
        )
      );
      grid.appendChild(card);
    });
  }
  renderGrid();

  function openLesson(lesson) {
    Modal.open({
      title: lesson.title,
      sub: `${lesson.duration} · ${lesson.levelLabel}`,
      content: [
        el('p', { style: { fontSize: '14px', lineHeight: '1.7', color: 'var(--ink-mid)', marginBottom: '16px' } }, lesson.desc),
        el('div', { style: { padding: '16px', background: 'var(--bg-raised)', borderRadius: 'var(--r-sm)', marginBottom: '16px' } },
          el('div', { class: 't-label', style: { marginBottom: '8px' } }, 'Key points'),
          el('ul', { style: { fontSize: '13px', lineHeight: '1.9', color: 'var(--ink)', paddingLeft: '20px' } },
            el('li', {}, 'Establish a stable base before initiating the stroke'),
            el('li', {}, 'Lead with the hips, then the shoulder, then the wrist'),
            el('li', {}, 'Contact point should be in front of the body'),
            el('li', {}, 'Follow-through is critical for spin generation')
          )
        )
      ],
      actions: [
        { label: 'Bookmark', class: 'btn-ghost', onClick: () => toast('Bookmarked.', 'success') },
        { label: 'Start lesson', class: 'btn-primary', onClick: () => toast('Lesson started.', 'success') }
      ]
    });
  }

  return root;
}, { title: 'Academy' });
