(function () {
  // These pages are single documents with in-page anchor links (nav
  // sections, table of contents), not separate pages. A reload should
  // start fresh, not jump to whatever anchor was last clicked before you
  // scrolled further on your own — so always land at the top on load.
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.addEventListener('load', function () {
    window.scrollTo(0, 0);
  });
}());

(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function syncIcon() {
    btn.innerHTML = isDark()
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon"></i>';
  }

  syncIcon();

  btn.addEventListener('click', function () {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    syncIcon();
  });
}());
