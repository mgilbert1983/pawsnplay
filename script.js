document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const logo = document.getElementById("splash-logo");
  const main = document.getElementById("mainContent");

  logo.addEventListener("click", () => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      main.classList.remove("hidden");
      main.style.opacity = "1";
    }, 1000);
  });
});

window.addEventListener("scroll", () => {
  document.querySelectorAll(".section").forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 150) {
      section.classList.add("visible");
    }
  });
});