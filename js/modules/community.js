/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · COMMUNITY
   ═══════════════════════════════════════════════════════════ */

Router.register('community', () => {
  const { el } = Utils;

  const POSTS = [
    { author: 'Hana Aoki', initials: 'HA', time: '12m', body: 'Just landed a new personal best: 11-2 against my practice partner. The counter-loop drill from the Academy finally clicked!', likes: 24, replies: 6 },
    { author: 'Marco Silva', initials: 'MS', time: '1h', body: 'Anyone else testing the new Dignics 09C? The grip feels completely different from Tenergy. Curious what you all think.', likes: 18, replies: 12 },
    { author: 'Kian Danesh', initials: 'KD', time: '3h', body: 'Climbed to #340 in global ranking today. Small step, but the grind continues. Consistency > intensity.', likes: 47, replies: 8 },
    { author: 'Sofia Rossi', initials: 'SR', time: '5h', body: 'Video of my footwork session this morning — the cross-step is finally becoming automatic. Link in bio.', likes: 31, replies: 4 }
  ];

  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Community'),
      el('h1', { class: 'page-title' }, 'The players\' feed'),
      el('p', { class: 'page-sub' }, 'Share, learn, and grow with the global DANESH SPIN community.')
    ),
    el('div', { class: 'page-head-actions' },
      el('button', {
        class: 'btn btn-primary',
        onclick: () => openPostModal()
      }, '+ Post')
    )
  ));

  const feed = el('div', { class: 'feed' });

  function renderFeed() {
    Utils.clear(feed);
    POSTS.forEach(p => {
      feed.appendChild(el('div', { class: 'post' },
        el('div', { class: 'post-head' },
          el('div', { class: 'avatar' }, p.initials),
          el('div', {},
            el('div', { class: 'post-author' }, p.author),
            el('div', { class: 'post-time' }, p.time + ' ago')
          )
        ),
        el('div', { class: 'post-body' }, p.body),
        el('div', { class: 'post-actions' },
          el('span', { class: 'post-action', onclick: () => toast('Liked.') }, `♥ ${p.likes}`),
          el('span', { class: 'post-action' }, `◯ ${p.replies} replies`),
          el('span', { class: 'post-action' }, '↗ Share')
        )
      ));
    });
  }
  renderFeed();
  root.appendChild(feed);

  function openPostModal() {
    const bodyInput = el('textarea', { class: 'textarea', placeholder: 'Share something with the community…' });

    Modal.open({
      title: 'New post',
      sub: 'Keep it respectful and constructive.',
      content: [bodyInput],
      actions: [
        { label: 'Cancel', class: 'btn-ghost' },
        {
          label: 'Post',
          class: 'btn-primary',
          onClick: () => {
            if (!bodyInput.value.trim()) return;
            POSTS.unshift({
              author: Store.get('user').name,
              initials: Store.get('user').avatar,
              time: 'now',
              body: bodyInput.value.trim(),
              likes: 0,
              replies: 0
            });
            renderFeed();
            toast('Posted.', 'success');
          }
        }
      ]
    });
  }

  return root;
}, { title: 'Community' });
