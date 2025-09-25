// ===============================
// Pretty Keep - Global script
// (No custom carousel here; Swiper is used instead.)
// ===============================
(() => {
  // ----- Theme Toggle -----
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('pk-theme');

  if (saved) {
    root.setAttribute('data-theme', saved);
    if (btn) btn.textContent = saved === 'dark' ? 'Light' : 'Dark';
  }

  btn?.addEventListener('click', () => {
    const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', now);
    localStorage.setItem('pk-theme', now);
    btn.textContent = now === 'dark' ? 'Light' : 'Dark';
  });

  // ----- Favorite Heart Toggle (card) -----
  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.fav-btn');
    if (!favBtn) return;

    favBtn.classList.toggle('active');

    // Pop animation
    const heart = favBtn.querySelector('.heart');
    if (!heart) return;

    heart.classList.remove('animate'); // reset
    void heart.offsetWidth;            // reflow to restart animation
    heart.classList.add('animate');
  });

  // ----- Floating Messengers -----
  const $messengers = document.querySelector('.floating-messengers');
  $messengers?.addEventListener('click', (e) => {
    const actBtn = e.target.closest('[data-action]');
    if (!actBtn) return;

    const action = actBtn.dataset.action;
    if (action === 'chat') {
      // Tawk.to 스니펫 연결 후 사용:
      // window.Tawk_API?.maximize();
      console.log('Chatbot placeholder clicked');
    }
    if (action === 'wechat') {
      alert('WeChat QR 또는 연결 기능 추가 예정');
    }
  });

})();
