const DARK_MODE_CLASS = 'dark-mode';
const FONT_SIZE_VAR = '--ox-font-size';
const FONT_RATIO_VAR = '--ox-font-ratio';
const MIN_FONT_RATIO = 0.5;
const MAX_FONT_RATIO = 5;
const FONT_SIZE_DELTA = 0.1;

let announcer;

document.addEventListener('DOMContentLoaded', () => {
  detectDarkModePreference();
  setupAccessibilityMenu();
  
  observeSectionTOC();
  HTMLExposed();
  setupEmailJs();
  announce('Page loaded');
});

function setupEmailJs() {
  const touchForm = document.getElementById('touch');

  if (touchForm == null) return;

  touchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function () {
      emailjs.init({
        publicKey: 'vaeVbxIew0k4eAJZc',
      });

      emailjs
        .sendForm(
          'emailjs_hexmakina_be',
          'touch_hexmakina',
          document.getElementById('touch')
        )
        .then(
          () => announce('Your message has been sent successfully!', 'polite'),
          (error) => {
            console.error('FAILED...', error);
            announce(
              'There was an error sending your message. Please try again later.',
              'assertive'
            );
          }
        );
    };
    document.head.appendChild(script);
  });
}

function observeSectionTOC() {
  // Get all section elements on the page
  const headers = document.querySelectorAll('section');

  // IntersectionObserver to highlight the nav link for the visible section
  const navLinks = document.querySelectorAll('nav a');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.6, // 60% of the header should be visible
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log(entry.target.id);

        navLinks.forEach((link) => {
          // Toggle 'active' class based on matching the header's id
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  headers.forEach((header) => observer.observe(header));
}

function detectDarkModePreference() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedDarkMode = localStorage.getItem('darkMode');
  if (
    storedDarkMode !== 'false' &&
    (storedDarkMode === 'true' || prefersDark)
  ) {
    document.body.classList.add(DARK_MODE_CLASS);
  }
}

function setupAnnouncer() {
  const template = document.getElementById('announcer_template');
  announcer = template.content.firstElementChild.cloneNode(true);
  document.body.appendChild(announcer);
}

function setupAccessibilityMenu() {
  const template = document.getElementById('accessibility_controls');
  const accessibilityMenu = template.content.firstElementChild.cloneNode(true);
  const actions = {
    'font-size font-larger': () =>
      changeFontSize(document.documentElement, FONT_SIZE_DELTA),
    'font-size font-smaller': () =>
      changeFontSize(document.documentElement, -FONT_SIZE_DELTA),
    'dark-mode': () => toggleDarkModeWithAnnouncement(),
  };

  accessibilityMenu.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => actions[button.dataset.fx]?.());
  });

  document.body.appendChild(accessibilityMenu);
}

function changeFontSize(root, delta) {
  const currentRatio =
    parseFloat(getComputedStyle(root).getPropertyValue(FONT_RATIO_VAR)) || 1;
  const newSize = Math.max(
    MIN_FONT_RATIO,
    Math.min(MAX_FONT_RATIO, currentRatio + delta)
  );
  root.style.setProperty(FONT_RATIO_VAR, `${newSize.toFixed(2)}`);
  announce(`Font size changed to ${newSize}rem`);
}

function toggleDarkModeWithAnnouncement() {
  let html = document.querySelector('html');
  if (html.getAttribute('data-theme') === 'dark') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', 'dark');
  }
  const isEnabled = html.hasAttribute('data-theme');
  localStorage.setItem('darkMode', isEnabled);
  announce(`Dark mode ${isEnabled ? 'enabled' : 'disabled'}`);
}

function announce(message, priority = 'polite') {
  if(!announcer) setupAnnouncer();

  announcer.setAttribute('aria-live', priority);
  setTimeout(() => {
    announcer.textContent = message;
    setTimeout(() => (announcer.textContent = ''), 1000);
  }, 100);
}

function HTMLExposed() {
  document.querySelectorAll('*').forEach((element) => {
    if (!element.closest('[data-not-exposed]')) {
      element.setAttribute('data-tag', element.tagName.toLowerCase());
    }
  });
}
