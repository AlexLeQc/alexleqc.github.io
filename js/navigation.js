document.addEventListener('DOMContentLoaded', function() {
  const viewButtons = document.querySelectorAll('.view-btn, [data-view]');
  const views = document.querySelectorAll('.view');
  const langToggle = document.getElementById('lang-toggle');
  const aboutSection = document.getElementById('about-section');

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

  function triggerInitialAnimation() {
    setTimeout(() => {
      aboutSection.classList.add('visible');
    }, 500);
  }

  function handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    if (scrollPosition > windowHeight * 0.20) {
      aboutSection.classList.add('visible');
    }
  }

  window.addEventListener('scroll', handleScroll);

  triggerInitialAnimation();

  const aboutTabButtons = document.querySelectorAll('.about-tab-btn');
  const aboutContent = document.getElementById('about-content');
  const experienceContent = document.getElementById('experience-content');

  aboutTabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tab = this.getAttribute('data-tab');

      aboutTabButtons.forEach(btn => btn.classList.remove('active'));

      this.classList.add('active');

      if (tab === 'about') {
        aboutContent.style.display = 'block';
        experienceContent.style.display = 'none';
      } else if (tab === 'experience') {
        aboutContent.style.display = 'none';
        experienceContent.style.display = 'block';
      }
    });
  });
});
