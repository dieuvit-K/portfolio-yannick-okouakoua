/**
 * Portfolio Dr. Yannick Frédéric OKOUAKOUA
 * Interaction, filtrage des publications et accessibilité
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
   1. Gestion du Thème (Clair / Sombre)
   -------------------------------------------------------------------------- */
function initThemeSwitch() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('site-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  renderThemeIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('site-theme', target);
    renderThemeIcon(target);
  });
}

function renderThemeIcon(theme) {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  if (theme === 'dark') {
    toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
    toggleBtn.setAttribute('title', 'Activer le mode clair');
  } else {
    toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
    toggleBtn.setAttribute('title', 'Activer le mode sombre');
  }
}

/* --------------------------------------------------------------------------
   2. Menu Mobile (Tiroir)
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!toggle || !drawer) return;

  function setDrawerOpen(isOpen) {
    drawer.classList.toggle('open', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation');
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
    if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
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
   3. Défilement & Indicateur de Section Active
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link-item a');

  function updateActiveLink() {
    const scrollPos = window.pageYOffset + 110;

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
  const filterBtns = document.querySelectorAll('.pub-filter-btn');
  const searchInput = document.getElementById('pubSearchInput');
  const pubCards = document.querySelectorAll('.pub-card');

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
          const textarea = document.createElement('textarea');
          textarea.value = citation;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const copied = document.execCommand('copy');
          textarea.remove();
          if (!copied) throw new Error('La copie n’est pas disponible dans ce navigateur.');
        }
        showNotificationToast(`Référence ${format.toUpperCase()} copiée dans le presse-papier.`);
      } catch {
        showNotificationToast('Copie impossible dans ce navigateur. Sélectionnez la référence pour la copier.');
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
  setTimeout(() => toast.classList.add('show'), 15);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

/* --------------------------------------------------------------------------
   6. Formulaire de Contact Direct (mailto pré-rempli)
   -------------------------------------------------------------------------- */
function initContactFormSubmit() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const subject = document.getElementById('formSubject').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !email || !message) {
      showNotificationToast('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const mailRecipient = 'fryokouakoua@gmail.com';
    const mailSubject = encodeURIComponent(subject ? `[Portfolio] ${subject}` : `[Portfolio] Contact de ${name}`);
    const mailBody = encodeURIComponent(
      `Nom: ${name}\nAdresse email: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${mailRecipient}?subject=${mailSubject}&body=${mailBody}`;
    showNotificationToast('Votre application de messagerie doit s’ouvrir pour envoyer le message.');
  });
}
