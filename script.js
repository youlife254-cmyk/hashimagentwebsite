// Hero animation
const mainContent = document.getElementById('main-content');
window.addEventListener('DOMContentLoaded', () => {
  const tl = gsap.timeline();
  tl.from(mainContent, { duration: 0.8, opacity: 0, ease: "power2.out" });
  tl.from("header h2, header p", { duration: 0.8, y: 20, opacity: 0, stagger: 0.15, ease: "power2.out" }, "-=0.4");
});

// Calculator stuff
const openBtn = document.getElementById('open-calc');
const calcModal = document.getElementById('calc-modal');
const calcCard = document.getElementById('calc-card');
const calcBackdrop = document.getElementById('calc-backdrop');
const closeBtn = document.getElementById('close-calc');
const calcDisplay = document.getElementById('calc-display');
const calcResult = document.getElementById('calc-result');
const clearBtn = document.getElementById('calc-clear');
const evalBtn = document.getElementById('calc-eval');

let currentInput = "";

// Open modal with animation
openBtn.addEventListener('click', () => {
  calcModal.classList.remove('hidden');
  calcModal.style.display = 'flex';
  gsap.set(calcCard, { scale: 0.9, opacity: 0, y: 20 });
  gsap.timeline()
  .to(calcBackdrop, { duration: 0.25, opacity: 1, ease: "power2.out" }, 0)
  .to(calcCard, { duration: 0.45, scale: 1, opacity: 1, y: 0, ease: "back.out(1.2)" }, "-=0.05");
});

// Close modal
function closeCalculator() {
  gsap.timeline({
    onComplete: () => {
      calcModal.style.display = 'none';
      calcModal.classList.add('hidden');
      currentInput = "";
      calcDisplay.textContent = "0";
      calcResult.textContent = "";
    }
  })
  .to(calcCard, { duration: 0.28, scale: 0.95, opacity: 0, y: 12, ease: "power2.in" })
  .to(calcBackdrop, { duration: 0.22, opacity: 0, ease: "power2.in" }, "-=0.2");
}
closeBtn.addEventListener('click', closeCalculator);
calcBackdrop.addEventListener('click', closeCalculator);

// Button clicks
document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentInput += btn.textContent;
    calcDisplay.textContent = currentInput;
  });
});

// Clear
clearBtn.addEventListener('click', () => {
  currentInput = "";
  calcDisplay.textContent = "0";
  calcResult.textContent = "";
});

// Eval (fake)
evalBtn.addEventListener('click', () => {
  if (currentInput === "") return;
  gsap.to(calcResult, {
    duration: 0.12,
    opacity: 0,
    onComplete: () => {
      calcResult.textContent = "Ans = Hello World";
      gsap.to(calcResult, { duration: 0.28, opacity: 1, ease: "power2.out" });
    }
  });
});
// your old script.js code here...

// === Custom Fade In + Ripple ===
document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-in");

  const appearOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  fadeElements.forEach(el => {
    appearOnScroll.observe(el);
  });
});

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    this.appendChild(ripple);

    const rect = this.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});


