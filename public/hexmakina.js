// Constants
const CONFIG = {
  DARK_MODE: {
    CLASS: 'dark-mode',
    STORAGE_KEY: 'darkMode',
    DATA_ATTR: 'data-theme',
    THEME_VALUE: 'dark',
  },
  FONT: {
    SIZE_VAR: '--ox-font-size',
    RATIO_VAR: '--ox-font-ratio',
    MIN_RATIO: 0.5,
    MAX_RATIO: 5,
    DELTA: 0.1,
  },
  SELECTORS: {
    ANNOUNCER_TPL: 'announcer_template',
    ACCESSIBILITY_TPL: 'accessibility_controls',
    CONTACT_FORM: 'touch',
    SECTIONS: 'section',
    NAV_LINKS: 'nav a',
  },
  EMAIL: {
    SERVICE_ID: 'emailjs_hexmakina_be',
    TEMPLATE_ID: 'touch_hexmakina',
    SCRIPT_SRC:
      'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
    PUBLIC_KEY: 'vaeVbxIew0k4eAJZc', // Consider moving to environment variable
  },
};

// Core application
const Kortex = {
  announcer: null,

  init() {
    this.accessibility.detectDarkModePreference();
    this.accessibility.setupControls();
    this.accessibility.setupAnnouncer();

    this.navigation.observeSectionTOC();
    this.setupEmailJs();
    this.exposeHTMLTags();

    this.announce('Page loaded');
  },

  announce(message, priority = 'polite') {
    if (Kortex.announcer) Kortex.announcer.announce(message, priority);
  },

  accessibility: {
    setupAnnouncer() {
      const template = document.getElementById(CONFIG.SELECTORS.ANNOUNCER_TPL);
      if (!template) return;

      Kortex.announcer = {
        element: template.content.firstElementChild.cloneNode(true),

        announce(message, priority = 'polite') {
          this.element.setAttribute('aria-live', priority);

          // Use clean timeouts to prevent race conditions
          setTimeout(() => {
            this.element.textContent = message;
            setTimeout(() => (this.element.textContent = ''), 1000);
          }, 100);
        },
      };

      document.body.appendChild(Kortex.announcer.element);
    },

    setupControls() {
      const template = document.getElementById(
        CONFIG.SELECTORS.ACCESSIBILITY_TPL
      );
      if (!template) return;

      const menu = template.content.firstElementChild.cloneNode(true);

      const actions = {
        'font-size font-larger': () =>
          this.changeFontSize(document.documentElement, CONFIG.FONT.DELTA),
        'font-size font-smaller': () =>
          this.changeFontSize(document.documentElement, -CONFIG.FONT.DELTA),
        'dark-mode': () => this.toggleDarkMode(),
      };

      menu.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          const action = actions[button.dataset.fx];
          if (action) action();
        });
      });

      document.body.appendChild(menu);
    },

    changeFontSize(root, delta) {
      const currentRatio =
        parseFloat(
          getComputedStyle(root).getPropertyValue(CONFIG.FONT.RATIO_VAR)
        ) || 1;

      const newSize = Math.max(
        CONFIG.FONT.MIN_RATIO,
        Math.min(CONFIG.FONT.MAX_RATIO, currentRatio + delta)
      );

      root.style.setProperty(CONFIG.FONT.RATIO_VAR, `${newSize.toFixed(2)}`);

      Kortex.announce(`Font size changed to ${newSize}rem`);
    },

    toggleDarkMode() {
      const html = document.querySelector('html');
      const isDark =
        html.getAttribute(CONFIG.DARK_MODE.DATA_ATTR) ===
        CONFIG.DARK_MODE.THEME_VALUE;

      if (isDark) {
        html.removeAttribute(CONFIG.DARK_MODE.DATA_ATTR);
      } else {
        html.setAttribute(
          CONFIG.DARK_MODE.DATA_ATTR,
          CONFIG.DARK_MODE.THEME_VALUE
        );
      }

      const isEnabled = html.hasAttribute(CONFIG.DARK_MODE.DATA_ATTR);
      localStorage.setItem(CONFIG.DARK_MODE.STORAGE_KEY, isEnabled);

      Kortex.announce(`Dark mode ${isEnabled ? 'enabled' : 'disabled'}`);
    },

    detectDarkModePreference() {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const storedDarkMode = localStorage.getItem(CONFIG.DARK_MODE.STORAGE_KEY);

      if (
        storedDarkMode !== 'false' &&
        (storedDarkMode === 'true' || prefersDark)
      ) {
        document.body.classList.add(CONFIG.DARK_MODE.CLASS);
      }
    },
  },

  navigation: {
    observeSectionTOC() {
      const sections = document.querySelectorAll(CONFIG.SELECTORS.SECTIONS);
      const navLinks = document.querySelectorAll(CONFIG.SELECTORS.NAV_LINKS);

      if (!sections.length || !navLinks.length) return;

      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.6,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === '#' + entry.target.id
              );
            });
          }
        });
      }, observerOptions);

      sections.forEach((section) => observer.observe(section));
    },
  },

  setupEmailJs() {
    const form = document.getElementById(CONFIG.SELECTORS.CONTACT_FORM);
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const script = document.createElement('script');
      script.src = CONFIG.EMAIL.SCRIPT_SRC;

      script.onload = () => {
        emailjs.init({
          publicKey: CONFIG.EMAIL.PUBLIC_KEY,
        });

        emailjs
          .sendForm(CONFIG.EMAIL.SERVICE_ID, CONFIG.EMAIL.TEMPLATE_ID, form)
          .then(
            () => {
              Kortex.announce(
                'Your message has been sent successfully!',
                'polite'
              );
            },
            (error) => {
              console.error('Email submission failed:', error);
              Kortex.announce(
                'There was an error sending your message. Please try again later.',
                'assertive'
              );
            }
          );
      };

      document.head.appendChild(script);
    });
  },

  exposeHTMLTags() {
    // Consider making this conditional based on a debug flag
    document.querySelectorAll('*').forEach((element) => {
      if (!element.closest('[data-not-exposed]')) {
        element.setAttribute('data-tag', element.tagName.toLowerCase());
      }
    });
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Kortex.init());
