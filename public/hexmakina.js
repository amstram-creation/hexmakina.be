const DARK_MODE_CLASS = 'dark-mode';
const FONT_SIZE_VAR = '--ox-font-size';
const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 5;
const FONT_SIZE_DELTA = 0.1;

const announcer = document.createElement('div');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');
announcer.classList.add('sr-only');
document.body.appendChild(announcer);

document.addEventListener('DOMContentLoaded', () => {
  initializeDarkMode();
  setupAccessibilityMenu();
  applyTagStyles();
  announce('Page loaded');
});

function initializeDarkMode() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedDarkMode = localStorage.getItem('darkMode');
  if (
    storedDarkMode !== 'false' &&
    (storedDarkMode === 'true' || prefersDark)
  ) {
    document.body.classList.add(DARK_MODE_CLASS);
  }
}

function setupAccessibilityMenu() {
  const accessibilityMenu = document.createElement('nav');
  accessibilityMenu.setAttribute('aria-label', 'Accessibility Controls');
  accessibilityMenu.setAttribute('data-not-exposed', '');
  accessibilityMenu.innerHTML = `
    <button data-fx="font-size font-larger" aria-label="Increase font size">A</button>
    <button data-fx="font-size font-smaller" aria-label="Decrease font size">a</button>
    <button data-fx="dark-mode" aria-label="Toggle dark mode"><span></span></button>
  `;

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
  const currentSize =
    parseFloat(getComputedStyle(root).getPropertyValue(FONT_SIZE_VAR)) || 1;
  const newSize = Math.max(
    MIN_FONT_SIZE,
    Math.min(MAX_FONT_SIZE, currentSize + delta)
  );
  root.style.setProperty(FONT_SIZE_VAR, `${newSize.toFixed(2)}rem`);
  announce(`Font size changed to ${newSize}rem`);
}

function toggleDarkModeWithAnnouncement() {
  document.body.classList.toggle(DARK_MODE_CLASS);
  const isEnabled = document.body.classList.contains(DARK_MODE_CLASS);
  localStorage.setItem('darkMode', isEnabled);
  announce(`Dark mode ${isEnabled ? 'enabled' : 'disabled'}`);
}

function announce(message, priority = 'polite') {
  announcer.setAttribute('aria-live', priority);
  setTimeout(() => {
    announcer.textContent = message;
    setTimeout(() => (announcer.textContent = ''), 1000);
  }, 100);
}

function applyTagStyles() {
  document.querySelectorAll('*').forEach((element) => {
    if (!element.closest('[data-not-exposed]')) {
      element.setAttribute('data-tag', element.tagName.toLowerCase());
    }
  });
}
