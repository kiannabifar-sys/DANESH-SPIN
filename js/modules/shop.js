/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · SHOP
   ═══════════════════════════════════════════════════════════ */

const PRODUCTS = [
  { id: 'p-01', name: 'Apex Carbon Blade', brand: 'DANESH', price: 189, rating: 4.9, icon: '🏓', badge: 'NEW' },
  { id: 'p-02', name: 'Tenergy 05 Rubber', brand: 'Butterfly', price: 79, rating: 4.8, icon: '🔴' },
  { id: 'p-03', name: 'Dignics 09C Rubber', brand: 'Butterfly', price: 89, rating: 4.7, icon: '🔴' },
  { id: 'p-04', name: 'Pro Shoes Elite', brand: 'DANESH', price: 129, rating: 4.6, icon: '👟' },
  { id: 'p-05', name: 'Training Balls (100pk)', brand: 'DANESH', price: 49, rating: 4.5, icon: '🟠' },
  { id: 'p-06', name: 'Edge Tape (10pk)', brand: 'DANESH', price: 12, rating: 4.4, icon: '📏' },
  { id: 'p-07', name: 'Racket Case Pro', brand: 'DANESH', price: 39, rating: 4.8, icon: '🧳', badge: 'HOT' },
  { id: 'p-08', name: 'Table Tennis Net Set', brand: 'DANESH', price: 24, rating: 4.3, icon: '🕸' }
];

Router.register('shop', () => {
  const { el } = Utils;
  const root = el('div', {});

  root.appendChild(el('div', { class: 'page-head' },
    el('div', { class: 'page-head-left' },
      el('div', { class: 'page-eyebrow' }, 'Shop'),
      el('h1', { class: 'page-title' }, 'Pro equipment'),
      el('p', { class: 'page-sub' }, 'Gear trusted by professional players.')
    ),
    el('div', { class: 'page-head-actions' },
      el('button', {
        class: 'btn btn-secondary',
        onclick: () => {
          const cart = Store.get('cart');
          if (!cart.length) return toast('Cart is empty.', 'warn');
          Modal.open({
            title: 'Your cart',
            sub: `${cart.length} item${cart.length > 1 ? 's' : ''}`,
            content: [
              el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' } },
                ...cart.map(item => el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-subtle)' } },
                  el('span', { style: { fontSize: '13px' } }, item.name),
                  el('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)' } }, `$${item.price}`)
                ))
              ),
              el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', paddingTop: '8px' } },
                el('span', {}, 'Total'),
                el('span', { style: { color: 'var(--accent)', fontFamily: 'var(--font-mono)' } }, `$${cart.reduce((s, i) => s + i.price, 0)}`)
              )
            ],
            actions: [
              { label: 'Clear cart', class: 'btn-ghost', onClick: () => { Store.set('cart', []); toast('Cart cleared.'); } },
              { label: 'Checkout', class: 'btn-primary', onClick: () => { Store.set('cart', []); toast('Order placed! 🎉', 'success'); } }
            ]
          });
        }
      }, `Cart (${Store.get('cart').length})`)
    )
  ));

  const grid = el('div', { class: 'shop-grid' });
  PRODUCTS.forEach(p => {
    grid.appendChild(el('div', { class: 'product' },
      el('div', { class: 'product-thumb' },
        p.badge ? el('span', { class: 'product-badge' }, p.badge) : null,
        el('span', {}, p.icon)
      ),
      el('div', { class: 'product-body' },
        el('div', { class: 'product-brand' }, p.brand),
        el('div', { class: 'product-name' }, p.name),
        el('div', { class: 'product-rating' }, '★'.repeat(Math.floor(p.rating)) + ` ${p.rating}`),
        el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' } },
          el('div', { class: 'product-price' }, `$${p.price}`),
          el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              Store.push('cart', p);
              toast(`${p.name} added to cart.`, 'success');
            }
          }, 'Add')
        )
      )
    ));
  });
  root.appendChild(grid);

  return root;
}, { title: 'Shop' });
