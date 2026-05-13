(function () {
  var storageKey = 'theme';
  var colors = { light: '#f8f6f1', dark: '#151515' };
  var icons = { light: '/favicon-light.svg', dark: '/favicon-dark.svg' };
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var themeIcon = document.querySelector('[data-theme-icon]');
  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function hasStoredTheme() {
    var storedTheme = getStoredTheme();

    return storedTheme === 'light' || storedTheme === 'dark';
  }

  function getActiveTheme() {
    var storedTheme = getStoredTheme();

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return systemTheme.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, shouldPersist) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    if (themeColor) {
      themeColor.setAttribute('content', colors[theme]);
    }

    if (themeIcon) {
      themeIcon.setAttribute('href', icons[theme]);
    }

    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Disable dark mode' : 'Enable dark mode');
    }

    if (shouldPersist) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        return;
      }
    }
  }

  if (!toggle) {
    return;
  }

  applyTheme(getActiveTheme(), false);

  toggle.addEventListener('click', function () {
    applyTheme(getActiveTheme() === 'dark' ? 'light' : 'dark', true);
  });

  if (systemTheme.addEventListener) {
    systemTheme.addEventListener('change', function () {
      if (!hasStoredTheme()) {
        applyTheme(getActiveTheme(), false);
      }
    });
  } else if (systemTheme.addListener) {
    systemTheme.addListener(function () {
      if (!hasStoredTheme()) {
        applyTheme(getActiveTheme(), false);
      }
    });
  }
})();
