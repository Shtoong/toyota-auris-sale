/* Toyota Auris Sale — Main JS */

(function () {
  // --- Language Switcher ---
  const SUPPORTED_LANGS = ['en', 'fi'];
  const DEFAULT_LANG = 'fi';

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    document.body.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    try { localStorage.setItem('auris-lang', lang); } catch (e) {}
    document.documentElement.lang = lang;
  }

  function initLang() {
    let saved = null;
    try { saved = localStorage.getItem('auris-lang'); } catch (e) {}
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      setLang(saved);
      return;
    }
    // Auto-detect from browser
    const bl = (navigator.language || '').slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(bl)) {
      setLang(bl);
    } else {
      setLang(DEFAULT_LANG);
    }
  }

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('lang-btn')) {
      setLang(e.target.dataset.lang);
    }
  });

  // --- Gallery Tabs ---
  function initGallery() {
    const tabs = document.querySelectorAll('.gallery-tab');
    const items = document.querySelectorAll('.gallery-item');

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const cat = this.dataset.category;
        tabs.forEach(t => t.classList.toggle('active', t === this));
        items.forEach(item => {
          item.style.display = (cat === 'all' || item.dataset.category === cat) ? '' : 'none';
        });
      });
    });
  }

  // --- Lightbox ---
  let currentItems = [];
  let currentIndex = 0;

  function openLightbox(index, items) {
    currentItems = items;
    currentIndex = index;
    const lb = document.getElementById('lightbox');
    lb.classList.add('open');
    updateLightbox();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = currentItems[currentIndex];
    if (!item) return;
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const counter = document.getElementById('lightbox-counter');
    const origLink = document.getElementById('lightbox-original');

    img.src = item.src;
    img.alt = item.alt;
    caption.textContent = item.alt;
    counter.textContent = (currentIndex + 1) + ' / ' + currentItems.length;
    origLink.href = item.original;
  }

  function navLightbox(dir) {
    currentIndex = (currentIndex + dir + currentItems.length) % currentItems.length;
    updateLightbox();
  }

  document.addEventListener('click', function (e) {
    const item = e.target.closest('.gallery-item');
    if (item) {
      const lang = document.body.getAttribute('data-lang') || 'fi';
      const visibleItems = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(el => el.style.display !== 'none')
        .map(el => {
          const labelEl = el.querySelector('.photo-label .lang-' + lang);
          const label = labelEl ? labelEl.textContent : el.querySelector('img').alt;
          return {
            src: el.querySelector('img').dataset.full || el.querySelector('img').src,
            alt: label,
            original: el.dataset.original
          };
        });
      const idx = visibleItems.findIndex(v =>
        v.original === item.dataset.original
      );
      openLightbox(idx >= 0 ? idx : 0, visibleItems);
      return;
    }

    if (e.target.classList.contains('lightbox-close') || e.target.id === 'lightbox') {
      closeLightbox();
    }
    if (e.target.closest('.lightbox-prev')) navLightbox(-1);
    if (e.target.closest('.lightbox-next')) navLightbox(1);
  });

  document.addEventListener('keydown', function (e) {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  // Touch swipe for lightbox
  let touchStartX = 0;
  document.addEventListener('touchstart', function (e) {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        navLightbox(diff > 0 ? 1 : -1);
      }
    }
  }, { passive: true });

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    initLang();
    initGallery();
  });
})();
