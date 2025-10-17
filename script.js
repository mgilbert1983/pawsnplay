// Simple JS placeholder
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash');
  const main = document.getElementById('mainContent');
  const logo = splash.querySelector('img');
  logo.addEventListener('click', () => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      main.classList.remove('hidden');
      main.style.transition = 'opacity 1.2s ease-in-out';
      main.style.opacity = '1';
    }, 900);
  });
});