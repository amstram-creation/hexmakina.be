document.addEventListener('DOMContentLoaded', () => {
  // Initialize based on user preference
  if (
    localStorage.getItem('darkMode') != 'false' &&
    (localStorage.getItem('darkMode') == 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.body.classList.add('dark-mode');
  }

  accessibilityMenu = document.createElement('nav');
  accessibilityMenu.setAttribute('aria-label', 'Accessibility');
  accessibilityMenu.innerHTML = `
      <button data-fx="font-size font-larger">A</button>
      <button data-fx="font-size font-smaller">a</button>
      <button data-fx="dark-mode"><span></span></button>
    `;
  accessibilityMenu.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      console.log(button.dataset.fx);
      switch (button.dataset.fx) {
        case 'font-size font-larger':
        case 'font-size font-smaller':
          const root = document.documentElement;
          let delta =
            0.1 * (button.dataset.fx.includes('font-larger') ? 1 : -1);
          changeFontSize(root, delta);
          break;

        case 'dark-mode':
          toggleDarkMode();
          announce(
            'Dark mode ' +
              (document.body.classList.contains('dark-mode')
                ? 'enabled'
                : 'disabled')
          );
          break;
      }
    });
  });
  document.body.appendChild(accessibilityMenu);
  announce('Page loaded');
});

function announce(message, priority = 'polite') {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.classList.add('sr-only');
  document.body.appendChild(announcer);

  // Delay needed for screen readers to detect the change
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);

  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}
const changeFontSize = (root, delta) => {
  console.log(delta);
  const currentSize = getComputedStyle(root).getPropertyValue('--ox-font-size');
  let newSize = parseFloat(currentSize) + delta;
  // Add bounds checking (e.g., between 0.8 and 5 rem)
  newSize = Math.max(0.8, Math.min(5, newSize));
  console.log(currentSize, delta, newSize);

  root.style.setProperty('--ox-font-size', `${newSize}rem`);
  announce('Font size changed to' + newSize + 'rem');
};

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem(
    'darkMode',
    document.body.classList.contains('dark-mode')
  );
}
