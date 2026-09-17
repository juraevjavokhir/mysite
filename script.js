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

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.theme-toggle');

  function updateLabel() {
    const isDark = root.classList.contains('dark');
    toggle.setAttribute('aria-label', isDark ? 'Kunduzgi rejimni yoqish' : 'Tungi rejimni yoqish');
    toggle.title = isDark ? 'Kunduzgi rejim' : 'Tungi rejim';
  }

  if (toggle) {
    updateLabel();
    toggle.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateLabel();
    });
    // Foydalanuvchi o'zi tanlamagan bo'lsa, tizim rejimi o'zgarganda sahifa ham o'zgaradi
    systemDark.addEventListener('change', () => {
      if (!savedTheme()) { applyTheme(null); updateLabel(); }
    });
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
