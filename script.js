// script.js

document.addEventListener("DOMContentLoaded", () => {
  const enterBtn = document.getElementById("enterBtn");
  const landing = document.getElementById("landing");
  const mainContent = document.getElementById("mainContent");

  enterBtn.addEventListener("click", () => {
    landing.classList.add("hidden");       // Hide landing
    mainContent.classList.remove("hidden"); // Show main content
  });
});
