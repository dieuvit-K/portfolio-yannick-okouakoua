/**
 * Portfolio Scientifique & Académique — Dr. Yannick Frédéric OKOUAKOUA
 * Interaction, accessibilité, filtrage des publications et presse-papier
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitch();
  initMobileNav();
  initScrollSpy();
  initPublicationsFiltering();
  initCitationClipboard();
  initContactFormSubmit();
});

/* --------------------------------------------------------------------------
   1. Gestion du Thème (Clair / Sombre avec Persistance)
   -------------------------------------------------------------------------- */
function initThemeSwitch() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('okouakoua-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('okouakoua-theme', target);
  });
}

/* --------------------------------------------------------------------------
   2. Tiroir Mobile Accessible (Drawer Nav)
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!toggle || !drawer) return;

  function setDrawerOpen(isOpen) {
    drawer.classList.toggle('open', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setDrawerOpen(!drawer.classList.contains('open'));
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setDrawerOpen(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.querySelector('.mobile-drawer-inner').contains(e.target) && !toggle.contains(e.target)) {
      setDrawerOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      setDrawerOpen(false);
      toggle.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Indicateur de Section Active (ScrollSpy)
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

/* --------------------------------------------------------------------------
   4. Filtrage et Recherche Instantanée des Publications
   -------------------------------------------------------------------------- */
function initPublicationsFiltering() {
  const filterBtns = document.querySelectorAll('.pub-filter-pill');
  const searchInput = document.getElementById('pubSearchInput');
  const pubCards = document.querySelectorAll('.pub-card');
  if (!pubCards.length) return;

  let currentCategory = 'all';
  let searchKeyword = '';

  function executeFilter() {
    pubCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const text = card.innerText.toLowerCase();

      const matchCategory = (currentCategory === 'all') || (cardCategory === currentCategory);
      const matchSearch = !searchKeyword || text.includes(searchKeyword);

      if (matchCategory && matchSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      executeFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchKeyword = e.target.value.trim().toLowerCase();
      executeFilter();
    });
  }
}

/* --------------------------------------------------------------------------
   5. Copie des Références Scientifiques (BibTeX & APA)
   -------------------------------------------------------------------------- */
function copyToClipboardFallback(text) {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) resolve();
      else reject(new Error('execCommand copy failed'));
    } catch (err) {
      document.body.removeChild(textarea);
      reject(err);
    }
  });
}

function initCitationClipboard() {
  document.querySelectorAll('[data-copy-ref]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const format = btn.getAttribute('data-copy-ref');
      const card = btn.closest('.pub-card');
      if (!card) return;

      const citation = card.getAttribute(`data-citation-${format}`);
      if (!citation) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(citation);
        } else {
          await copyToClipboardFallback(citation);
        }
        showNotificationToast(`Référence ${format.toUpperCase()} copiée dans le presse-papier.`);
      } catch {
        // En cas de restriction navigateur (sandbox), copier par invite
        prompt(`Copier la référence ${format.toUpperCase()} ci-dessous :`, citation);
      }
    });
  });
}

function showNotificationToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}
