const DARK_MODE_CLASS = 'dark-mode';
const FONT_SIZE_VAR = '--ox-font-size';
const FONT_RATIO_VAR = '--ox-font-ratio';
const MIN_FONT_RATIO = 0.5;
const MAX_FONT_RATIO = 5;
const FONT_SIZE_DELTA = 0.1;

const announcer = document.createElement('div');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');
announcer.classList.add('sr-only');
document.body.appendChild(announcer);

document.addEventListener('DOMContentLoaded', () => {
  initializeDarkMode();
  setupAccessibilityMenu();
  HTMLExposed();
  TOC();
  announce('Page loaded');
});

function TOC() {
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');

  // Get all h3 elements on the page
  const headers = document.querySelectorAll('section h3');

  headers.forEach((header) => {
    // If the header doesn't have an id, generate one from its text content
    if (!header.id) {
      header.id = header.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    }

    // Create a nav item with a link to the header
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + header.id;
    a.textContent = header.textContent;
    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  // Insert the nav at the top of the body
  document.body.insertBefore(nav, document.body.firstChild);

  // IntersectionObserver to highlight the nav link for the visible h3
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

  // EmailJS
  emailjs.init({
    publicKey: 'vaeVbxIew0k4eAJZc',
  });
  document.getElementById('touch').addEventListener('submit', function (event) {
    event.preventDefault();
    // Sending the form using your service and template IDs
    emailjs.sendForm('emailjs_hexmakina_be', 'touch_hexmakina', this).then(
      () => {
        console.log('SUCCESS!');
        // Optionally, provide user feedback on success
      },
      (error) => {
        console.log('FAILED...', error);
        // Optionally, provide user feedback on error
      }
    );
  });
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
