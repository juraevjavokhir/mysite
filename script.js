// --- Kunduzgi / tungi rejim ---
// Sahifa oqarib-qorayib ketmasligi uchun bu qism sahifa chizilishidan oldin ishlaydi
const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function savedTheme() {
  try { return localStorage.getItem('theme'); } catch (e) { return null; }
}

function applyTheme(theme) {
  // theme: "light", "dark" yoki null (tizim sozlamasiga ergashadi)
  if (theme) root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
  const isDark = theme ? theme === 'dark' : systemDark.matches;
  root.classList.toggle('dark', isDark);
  return isDark;
}

applyTheme(savedTheme());

// JavaScript ishlayotganini CSS'ga bildiradi (jonlanishlar faqat shunda yoqiladi)
root.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // Rejim tugmasi ikki joyda bor: hero menyusida va yopishqoq menyuda
  const toggles = document.querySelectorAll('.theme-toggle');

  function updateLabel() {
    const isDark = root.classList.contains('dark');
    toggles.forEach((toggle) => {
      toggle.setAttribute('aria-label', isDark ? 'Kunduzgi rejimni yoqish' : 'Tungi rejimni yoqish');
      toggle.title = isDark ? 'Kunduzgi rejim' : 'Tungi rejim';
    });
  }

  updateLabel();
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateLabel();
    });
  });
  // Foydalanuvchi o'zi tanlamagan bo'lsa, tizim rejimi o'zgarganda sahifa ham o'zgaradi
  systemDark.addEventListener('change', () => {
    if (!savedTheme()) { applyTheme(null); updateLabel(); }
  });

  // --- Yopishqoq menyu: hero ko'rinmay qolganda paydo bo'ladi ---
  const stickybar = document.querySelector('.stickybar');
  const hero = document.querySelector('.hero');
  if (stickybar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      stickybar.classList.toggle('show', !entry.isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  // --- Menyuda hozirgi bo'limni ajratib ko'rsatish ---
  const links = document.querySelectorAll('.sticky-nav a');
  const sections = [...links]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter((section) => section && !section.hidden);
  if (sections.length && 'IntersectionObserver' in window) {
    // Ekran o'rtasidagi bo'lim "hozirgi" hisoblanadi
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  // --- Scroll qilganda bo'limlar yumshoq paydo bo'ladi ---
  const revealItems = document.querySelectorAll(
    'main .tag, main h2, main .card, main .faq-item, .contact .note, .contact .buttons'
  );
  revealItems.forEach((el) => {
    el.classList.add('reveal');
    // Bir qatordagi kartalar va savollar ketma-ket chiqadi
    const group = el.closest('.grid, .faq');
    if (group) {
      const index = [...group.children].indexOf(el);
      el.style.setProperty('--delay', (index * 0.08) + 's');
    }
  });

  function finishReveal(el) {
    // Animatsiyadan keyin klasslar olib tashlanadi — karta hover effekti odatdagidek tez ishlaydi
    el.addEventListener('transitionend', () => {
      el.classList.remove('reveal', 'in');
      el.style.removeProperty('--delay');
    }, { once: true });
    el.classList.add('in');
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Ekranda ko'rinsa yoki sakrab o'tib ketilgan bo'lsa (ekrandan yuqorida qolgan) — ko'rsatamiz
        const passed = entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !passed) return;
        finishReveal(entry.target);
        revealObserver.unobserve(entry.target); // faqat bir marta
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((el) => revealObserver.observe(el));

    // Sakrab o'tilganda kuzatuvchi xabar bermaydi — shuning uchun scrolldan keyin tekshiramiz
    window.addEventListener('scroll', () => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          finishReveal(el);
          revealObserver.unobserve(el);
        }
      });
    }, { passive: true });
  } else {
    revealItems.forEach((el) => el.classList.remove('reveal'));
  }

  // --- Rasm topilmasa, hero fonida gradient qoladi ---
  const photo = document.querySelector('.hero-person');
  if (photo) {
    const showPlaceholder = () => photo.closest('.hero-frame').classList.add('no-photo');
    if (photo.complete && photo.naturalWidth === 0) showPlaceholder();
    photo.addEventListener('error', showPlaceholder);
  }

  // --- Footerdagi yil avtomatik yangilanadi ---
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
