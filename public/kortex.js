// Constants
const CONFIG = {
  EMAIL: {
    CONTACT_FORM: '#touch',
    SERVICE_ID: 'emailjs_hexmakina_be',
    TEMPLATE_ID: 'touch_hexmakina',
    SCRIPT_SRC:
      'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
    PUBLIC_KEY: 'vaeVbxIew0k4eAJZc', // Consider moving to environment variable
  },
};

export default class Kortex {
  constructor() {
    this.announcer = null;

    // Initialize submodules - fixed order to prevent dependency issues
    this.ui = new UI(this);
    this.email = new Email(this);

    // Add Cicero bridge
    this.cicero = {
      read: (sectionId) =>
        window.cicero ? window.cicero.start(sectionId) : null,
      stop: () => (window.cicero ? window.cicero.stop() : null),
      getStatus: () => ({
        supported: window.cicero ? window.cicero.isSupported : false,
        reading: window.cicero ? window.cicero.isReading() : false,
      }),
    };
  }

  init() {
    try {
      this.ui.observeNavigation();
      this.ui.exposeHTMLTags();

      setInterval(() => this.ui.cycleAddbadListItems(), 1618);

      this.email.setupContactForm();
    } catch (error) {
      console.error('Initialization error:', error);
      if (this.ally) {
        this.ally.announce('An error occurred during initialization', 'error');
      }
    }
  }
}

class UI {
  constructor(kortex) {
    this.kortex = kortex;
  }

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
  }

  observeNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const observer = this.__activationObserver(navLinks);

    document
      .querySelectorAll('section')
      .forEach((section) => observer.observe(section));
  }

  exposeHTMLTags() {
    // Consider making this conditional based on a debug flag
    document.querySelectorAll(':not(template)').forEach((element) => {
      if (!element.closest('[data-not-exposed]')) {
        element.setAttribute('data-tag', element.tagName.toLowerCase());
      }
    });
  }

  cycleAddbadListItems() {
    const ol = document.querySelector('#how ol');
    if (!ol) return;

    const firstItem = ol.firstElementChild;
    if (!firstItem) return;

    firstItem.classList.add('fade');

    firstItem.addEventListener('transitionend', function handler() {
      ol.appendChild(firstItem);
      firstItem.classList.remove('fade');
      firstItem.removeEventListener('transitionend', handler);
    });
  }
}

class Email {
  constructor(kortex) {
    this.kortex = kortex;
  }

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

        if (this.kortex.ally) {
          this.kortex.ally.announce(
            'Your message has been sent successfully!',
            'polite'
          );
        }
      } catch (error) {
        console.error('Email submission error:', error);
        if (this.kortex.ally) {
          this.kortex.ally.announce(
            error.message || 'An error occurred during form submission.',
            'assertive'
          );
        }
      }
    });
  }

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
  }
}
