// Elements
const passwordScreen = document.getElementById('password-screen');
const passwordInput  = document.getElementById('password-input');
const okBtn          = document.getElementById('ok-btn');
const errorMsg       = document.getElementById('error-msg');
const mainContent    = document.getElementById('main-content');

const CORRECT = "Apple";

// --- PRANK: if empty input, OK button dodges the mouse ---
okBtn.addEventListener('mouseover', () => {
  if (passwordInput.value.trim() === "") {
    const dx = (Math.random() * 260 - 130);   // -130px to +130px
    const dy = (Math.random() * 160 - 80);    // -80px to +80px
    okBtn.style.transform = `translate(${dx}px, ${dy}px)`;
  }
});
passwordInput.addEventListener('input', () => {
  if (passwordInput.value.trim() !== "") {
    okBtn.style.transform = 'translate(0,0)';
  }
});

// --- ENTER key also submits ---
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') okBtn.click();
});

// --- Unlock flow ---
okBtn.addEventListener('click', () => {
  if (passwordInput.value === CORRECT) {
    errorMsg.classList.add('hidden');

    // Fade out password screen
    gsap.to(passwordScreen, {
      duration: 0.6,
      opacity: 0,
      scale: 0.98,
      ease: "power2.out",
      onComplete: () => {
        passwordScreen.style.display = 'none';
        // Ensure we are at top
        window.scrollTo({ top: 0, behavior: 'auto' });

        // Show & animate main content (no scrolling needed)
        mainContent.classList.remove('hidden');

        const tl = gsap.timeline();
        // 1) Fade in whole section
        tl.to(mainContent, { duration: 0.8, opacity: 1, ease: "power2.out" });

        // 2) Animate hero heading/subtext
        tl.from("header h2, header p", {
          duration: 0.8,
          y: 20,
          opacity: 0,
          stagger: 0.15,
          ease: "power2.out"
        }, "-=0.4");

        // 3) Stagger in the cards
        tl.from(".product-card", {
          duration: 0.6,
          y: 30,
          opacity: 0,
          stagger: 0.1,
          ease: "power2.out"
        }, "-=0.2");
      }
    });
  } else {
    errorMsg.classList.remove('hidden');
  }
});
