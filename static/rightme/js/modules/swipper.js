/* =======================================
   Main page - Hero Swiper only
   라이브러리 /static/vendor/swiper/swiper-bundle.min.js 선로드 필수
   ======================================= */
(function () {
  if (typeof window.Swiper === 'undefined') return; 

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('.hero-swiper');
    if (!root) return;

    var hero = new Swiper(root, {
      loop: true,
      speed: 600,
      autoplay: { delay: 4000, disableOnInteraction: false },

      // 접근성 & 조작
      keyboard: { enabled: true },
      a11y: { enabled: true },

      // 네비/도트
      navigation: {
        nextEl: root.querySelector('.swiper-button-next'),
        prevEl: root.querySelector('.swiper-button-prev'),
      },
      pagination: {
        el: root.querySelector('.swiper-pagination'),
        clickable: true,
      },

      // 이미지 퍼포먼스
      preloadImages: false,
      lazy: true,

      // 터치 민감도
      threshold: 4,

      // 레이아웃 변화에 강하게
      observer: true,
      observeParents: true,
    });

    // 폰트/이미지 로딩 후 높이 재계산(안전)
    window.addEventListener('load', function () {
      hero.update();
    });
  });
})();
