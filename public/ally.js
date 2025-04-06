// Import CONFIG from kortex.js or define it here
const CONFIG = {
  DARK_MODE: 'data-dark-mode',
  FONT: {
    SIZE_VAR: '--ox-font-size',
    RATIO_VAR: '--ox-font-ratio',
    MIN_RATIO: 0.5,
    MAX_RATIO: 5,
    DELTA: 0.1,
  },
  TEMPLATES: {
    ANNOUNCER_TPL: 'announcer_template',
    ACCESSIBILITY_TPL: 'accessibility_controls',
  },
};

export default class Ally {
  constructor(kortex) {
    this.kortex = kortex;
    this.detectDarkModePreference();
    this.setupAccessibilityControls();
    this.setupAnnouncer();
    this.setupFocusManagement();
  }

  setupAnnouncer() {
    const template = document.getElementById(CONFIG.TEMPLATES.ANNOUNCER_TPL);
    if (!template) return;

    this.kortex.announcer = {
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

    document.body.appendChild(this.kortex.announcer.element);
  }

  setupAccessibilityControls() {
    const template = document.getElementById(
      CONFIG.TEMPLATES.ACCESSIBILITY_TPL
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

    // After creating buttons
    const shortcuts = {
      'font-size font-larger': 'Ctrl+Plus',
      'font-size font-smaller': 'Ctrl+Minus',
      'dark-mode': 'Alt+Shift+D',
    };

    menu.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const action = actions[button.dataset.fx];
        if (action) action();
      });

      const shortcut = shortcuts[button.dataset.fx];
      if (shortcut) {
        button.setAttribute(
          'title',
          `${button.getAttribute('aria-label')} (${shortcut})`
        );
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.altKey && e.key === 'D') {
        this.toggleDarkMode();
        e.preventDefault(); // Prevent any default browser action
      }
    });
    document.body.appendChild(menu);
  }

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
  }

  setupFocusManagement() {
    // Start with keyboard navigation disabled
    let usingKeyboard = false;

    // Detect keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only set keyboard navigation mode on Tab key press
      if (e.key === 'Tab') {
        usingKeyboard = true;
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Detect mouse use to disable keyboard navigation styles
    document.addEventListener('mousedown', () => {
      usingKeyboard = false;
      document.body.classList.remove('keyboard-navigation');
    });

    // Optionally, you can restore keyboard navigation on window blur/focus
    window.addEventListener('blur', () => {
      if (usingKeyboard) {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Initialize keyboard navigation state if URL has #keyboard-nav
    if (window.location.hash === '#keyboard-nav') {
      document.body.classList.add('keyboard-navigation');
      usingKeyboard = true;
    }
  }

  // Moved from UI class in kortex.js
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

    this.announce(`Font size changed to ${newSize}rem`);
  }

  // Moved from UI class in kortex.js
  toggleDarkMode() {
    const html = document.querySelector('html');
    const isDark = html.hasAttribute(CONFIG.DARK_MODE);
    const darkModeButton = document.querySelector('[data-fx="dark-mode"]');

    if (isDark) {
      html.removeAttribute(CONFIG.DARK_MODE);
      darkModeButton.setAttribute('aria-pressed', 'false');
      darkModeButton.setAttribute('aria-label', 'Enable dark mode');
    } else {
      html.setAttribute(CONFIG.DARK_MODE, '');
      darkModeButton.setAttribute('aria-pressed', 'true');
      darkModeButton.setAttribute('aria-label', 'Disable dark mode');
    }

    localStorage.setItem(CONFIG.DARK_MODE, !isDark);

    this.announce(`Dark mode ${!isDark ? 'enabled' : 'disabled'}`);
  }

  // Added from kortex.js
  announce(message, type = 'info') {
    this.showVisibleNotification(message, type);
    this.whisper(message, type);
  }

  whisper(message, type = 'info') {
    if (this.kortex.announcer) {
      const priority = type === 'error' ? 'assertive' : 'polite';
      this.kortex.announcer.announce(message, priority);
    }
  }

  showVisibleNotification(message, type = 'info') {
    const isError = type === 'error';
    let feedbackEl = document.getElementById('cicero-feedback');

    if (!feedbackEl) {
      feedbackEl = this.createFeedbackElement();
      if (!feedbackEl) return;
    }

    feedbackEl.textContent = message;
    feedbackEl.classList.add('cicero-visible');

    if (isError) {
      feedbackEl.classList.add('cicero-error');
    } else {
      feedbackEl.classList.remove('cicero-error');
    }

    setTimeout(() => {
      feedbackEl.classList.remove('cicero-visible');
    }, 3000);
  }

  createFeedbackElement() {
    const template = document.getElementById('cicero-templates');
    if (!template) {
      console.error('Cicero templates not found');
      return null;
    }

    const feedbackTemplate = template.content.querySelector('#cicero-feedback');
    if (!feedbackTemplate) {
      console.error('Cicero feedback template not found');
      return null;
    }

    const clone = feedbackTemplate.cloneNode(true);
    document.body.appendChild(clone);
    return clone;
  }
}
