document.addEventListener('DOMContentLoaded', function() {
  const viewButtons = document.querySelectorAll('.view-btn, [data-view]');
  const views = document.querySelectorAll('.view');
  const langToggle = document.getElementById('lang-toggle');

  langToggle.addEventListener('click', function() {
    const newLang = this.getAttribute('data-lang');
    i18n.switchLanguage(newLang);
  });

  viewButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const targetView = this.dataset.view;

      views.forEach(view => view.classList.remove('active'));
      viewButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === targetView) {
          btn.classList.add('active');
        }
      });

      document.getElementById(targetView + '-view').classList.add('active');
    });
  });
});
