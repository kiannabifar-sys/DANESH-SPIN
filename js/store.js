/* ═══════════════════════════════════════════════════════════
   DANESH SPIN · STORE
   Reactive state with localStorage persistence.
   ═══════════════════════════════════════════════════════════ */

const Store = (() => {
  const KEY = 'danesh-spin.v2';
  const listeners = new Set();

  const defaults = {
    /* ── Session ── */
    user: {
      id: 'u-1',
      name: 'Kian Danesh',
      handle: '@kiandanesh',
      role: 'Pro Player',
      tier: 'Pro',
      avatar: 'KD',
      country: 'IRN',
      joinedAt: '2024-03-12',
      bio: 'Attacking left-hander. Forehand-dominant. Chasing the national ladder.',
      style: 'Offensive',
      grip: 'Shakehand',
      blade: 'DANESH Apex Carbon',
      rubberFH: 'Tenergy 05 · 2.1mm',
      rubberBH: 'Dignics 09C · 2.0mm'
    },

    /* ── Preferences ── */
    prefs: {
      theme: 'dark',
      lang: 'en',
      contrast: 'normal',
      sidebarCollapsed: false,
      density: 'comfortable',
      motion: 'full',
      notifications: true,
      sounds: false
    },

    /* ── Dashboard / stats ── */
    stats: {
      winRate: 78.4,
      winRateDelta: 6.2,
      matchesPlayed: 142,
      matchesWon: 111,
      hoursTrained: 486,
      currentStreak: 7,
      bestStreak: 14,
      rankPoints: 8940,
      rankTier: 'Diamond II',
      globalRank: 340,
      weeklyVolume: [2.4, 3.1, 4.2, 2.8, 3.6, 4.5, 2.1]
    },

    /* ── Matches ── */
    matches: [
      { id: 'm-1', date: '2025-11-16', opponent: 'Reza Ahmadi', result: 'win', score: '3-1', event: 'Tehran Open', rating: 1820 },
      { id: 'm-2', date: '2025-11-14', opponent: 'Sara Khosravi', result: 'win', score: '3-0', event: 'Club League', rating: 1755 },
      { id: 'm-3', date: '2025-11-11', opponent: 'Mehdi Rahimi', result: 'loss', score: '2-3', event: 'Regional Qualifier', rating: 1690 },
      { id: 'm-4', date: '2025-11-09', opponent: 'Ali Karimi', result: 'win', score: '3-2', event: 'Tehran Open', rating: 1810 },
      { id: 'm-5', date: '2025-11-05', opponent: 'Nima Farhadi', result: 'win', score: '3-0', event: 'Club League', rating: 1720 },
      { id: 'm-6', date: '2025-11-02', opponent: 'Parisa Tehrani', result: 'loss', score: '1-3', event: 'National Cup', rating: 1860 }
    ],

    /* ── Training ── */
    drills: [
      { id: 'd-1', name: 'Forehand Loop Cascade', cat: 'attack', duration: 12, reps: 200, done: true },
      { id: 'd-2', name: 'Backhand Flick Ladder', cat: 'attack', duration: 8, reps: 120, done: true },
      { id: 'd-3', name: 'Service Placement Grid', cat: 'serve', duration: 15, reps: 80, done: false },
      { id: 'd-4', name: 'Footwork Shuffle Intervals', cat: 'movement', duration: 10, reps: 6, done: false },
      { id: 'd-5', name: 'Chopper Endurance Block', cat: 'defense', duration: 20, reps: 300, done: false },
      { id: 'd-6', name: 'Match Simulation · Bo7', cat: 'match', duration: 45, reps: 1, done: false }
    ],

    /* ── Tactical shots ── */
    tactics: {
      shots: [],
      type: 'attack'
    },

    /* ── Calculator ── */
    calc: {
      style: 'offense',
      grip: 'shake',
      exp: 'inter',
      priority: 'spin'
    },

    /* ── Notifications ── */
    notifications: [
      { id: 'n-1', title: 'New lesson unlocked', body: 'Counter-loop mastery is now available in the Academy.', time: '2m', unread: true },
      { id: 'n-2', title: 'Match result', body: 'Your win vs. Reza Ahmadi was verified.', time: '1h', unread: true },
      { id: 'n-3', title: 'Weekly report', body: 'You trained 22.7h this week — up 18% vs. last week.', time: '4h', unread: false },
      { id: 'n-4', title: 'Rank updated', body: 'You climbed 12 places to #340 globally.', time: '1d', unread: false }
    ],

    /* ── Goals ── */
    goals: [
      { id: 'g-1', title: 'Reach Diamond I by Q1', progress: 68, target: 100 },
      { id: 'g-2', title: 'Train 20h/week for 4 weeks', progress: 74, target: 100 },
      { id: 'g-3', title: 'Win a regional event', progress: 40, target: 100 }
    ],

    /* ── Shop cart ── */
    cart: []
  };

  let state = deepMerge(structuredClone(defaults), loadFromStorage());

  /* ── Persistence ── */
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
  function saveToStorage() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { console.warn('Store persist failed', e); }
  }

  /* ── Deep merge ── */
  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const k in source) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        target[k] = deepMerge(target[k] || {}, source[k]);
      } else {
        target[k] = source[k];
      }
    }
    return target;
  }

  /* ── Subscribe ── */
  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function notify(path) {
    saveToStorage();
    listeners.forEach(fn => {
      try { fn(state, path); } catch (e) { console.warn('Listener error', e); }
    });
  }

  /* ── Path helpers ── */
  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => {
      if (!o[k] || typeof o[k] !== 'object') o[k] = {};
      return o[k];
    }, obj);
    target[last] = value;
  }

  /* ── API ── */
  function get(path) {
    return path ? getPath(state, path) : state;
  }
  function set(path, value) {
    setPath(state, path, value);
    notify(path);
  }
  function update(path, fn) {
    const current = getPath(state, path);
    setPath(state, path, fn(current));
    notify(path);
  }
  function push(path, item) {
    const arr = getPath(state, path);
    if (Array.isArray(arr)) {
      arr.push(item);
      notify(path);
    }
  }
  function remove(path, predicate) {
    const arr = getPath(state, path);
    if (Array.isArray(arr)) {
      const next = arr.filter((x, i) => typeof predicate === 'function' ? !predicate(x, i) : i !== predicate);
      setPath(state, path, next);
      notify(path);
    }
  }
  function reset() {
    state = structuredClone(defaults);
    saveToStorage();
    notify('*');
  }

  return {
    get, set, update, push, remove, reset,
    subscribe,
    export: () => JSON.stringify(state, null, 2),
    import: (json) => {
      try {
        const data = JSON.parse(json);
        state = deepMerge(structuredClone(defaults), data);
        notify('*');
        return true;
      } catch { return false; }
    }
  };
})();

window.Store = Store;
