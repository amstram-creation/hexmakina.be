// Constants remain the same
const CONFIG = {
  DARK_MODE: 'data-dark-mode',
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
  },
  EMAIL: {
    CONTACT_FORM: '#touch',
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
    try {
      this.accessibility.detectDarkModePreference();
      this.accessibility.setupControls();
      this.accessibility.setupAnnouncer();

      this.ui.observeNavigation();
      this.ui.exposeHTMLTags();

      setInterval(this.ui.cycleAddbadListItems, 1618); // adjust interval as desired

      this.email.setupContactForm();

      this.announce('Page loaded');
    } catch (error) {
      console.error('Initialization error:', error);
      this.announce('An error occurred during initialization', 'assertive');
    }
  },

  announce(message, priority = 'polite') {
    if (Kortex.announcer) {
      Kortex.announcer.announce(message, priority);
    }
  },

  accessibility: {
    setupAnnouncer() {
      const template = document.getElementById(CONFIG.SELECTORS.ANNOUNCER_TPL);
      if (!template) return;

      Kortex.announcer = {
        element: template.content.firstElementChild.cloneNode(true),
        announce(message, priority = 'polite') {
          console.log(`[${priority}] ${message}`);
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
      const isDark = html.hasAttribute(CONFIG.DARK_MODE);

      if (isDark) {
        html.removeAttribute(CONFIG.DARK_MODE);
      } else {
        html.setAttribute(CONFIG.DARK_MODE, '');
      }

      localStorage.setItem(CONFIG.DARK_MODE, !isDark);

      Kortex.announce(`Dark mode ${!isDark ? 'enabled' : 'disabled'}`);
    },

    detectDarkModePreference() {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const storedDarkMode = localStorage.getItem(CONFIG.DARK_MODE);

      if (
        storedDarkMode !== 'false' &&
        (storedDarkMode === 'true' || prefersDark)
      ) {
        document.querySelector('html').setAttribute(CONFIG.DARK_MODE, '');
      }
    },
  },

  email: {
    setupContactForm() {
      const form = document.querySelector(CONFIG.EMAIL.CONTACT_FORM);
      if (!form) return;

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
          // Form validation
          const messageField = form.querySelector('#message');
          if (!messageField.value.trim()) {
            throw new Error('Please enter a message before submitting.');
          }

          // Load EmailJS script
          await this.loadEmailJsScript();

          // Initialize and send email
          emailjs.init({ publicKey: CONFIG.EMAIL.PUBLIC_KEY });

          await emailjs.sendForm(
            CONFIG.EMAIL.SERVICE_ID,
            CONFIG.EMAIL.TEMPLATE_ID,
            form
          );

          Kortex.announce('Your message has been sent successfully!', 'polite');
        } catch (error) {
          console.error('Email submission error:', error);
          Kortex.announce(
            error.message || 'An error occurred during form submission.',
            'assertive'
          );
        }
      });
    },

    // Helper function to load EmailJS script
    async loadEmailJsScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CONFIG.EMAIL.SCRIPT_SRC;
        script.async = true;
        script.onload = resolve;
        script.onerror = () =>
          reject(
            new Error('Failed to load email service. Please try again later.')
          );
        document.head.appendChild(script);
      });
    },
  },

  ui: {
    __activationObserver(navLinks) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2,
      };

      return new IntersectionObserver((entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + visibleEntry.target.id
            );
          });
        }
      }, observerOptions);
    },

    observeNavigation() {
      const navLinks = document.querySelectorAll('nav a');
      const observer = Kortex.ui.__activationObserver(navLinks);

      document
        .querySelectorAll('section')
        .forEach((section) => observer.observe(section));
    },

    exposeHTMLTags() {
      // Consider making this conditional based on a debug flag
      document.querySelectorAll(':not(template)').forEach((element) => {
        if (!element.closest('[data-not-exposed]')) {
          element.setAttribute('data-tag', element.tagName.toLowerCase());
        }
      });
    },
    cycleAddbadListItems() {
      const ol = document.querySelector('#how ol');
      const firstItem = ol.firstElementChild;

      firstItem.classList.add('fade');

      firstItem.addEventListener('transitionend', function handler() {
        ol.appendChild(firstItem);
        firstItem.classList.remove('fade');
        firstItem.removeEventListener('transitionend', handler);
      });
    },
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Kortex.init();
});
