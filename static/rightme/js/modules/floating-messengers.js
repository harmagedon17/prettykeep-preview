// /static/rightme/js/modules/floating-messengers.js
// 모든 페이지 공용 Floating Messengers 주입

const DEFAULTS = {
  wechatImg:  "/static/assets/wechat.jpg",      // 버튼 아이콘
  wechatQR:   "/static/assets/wechat-qr.png",   // QR 이미지 (있으면 오버레이로 표시)
  lineHref:   "https://line.me/R/ti/p/@YOUR_ID",
  whatsappHref: "https://wa.me/821012345678?text=Hello",
  // 필요하다면 chatbotHref 등도 추가 가능
};

function createOverlay(qrSrc) {
  const overlay = document.createElement("div");
  overlay.className = "fm-qr-overlay";
  overlay.innerHTML = `
    <div class="fm-qr" role="dialog" aria-modal="true" aria-label="WeChat QR">
      <button class="fm-qr-close" aria-label="Close">×</button>
      <img src="${qrSrc}" alt="WeChat QR" />
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("fm-qr-close")) {
      overlay.classList.remove("is-open");
    }
  });
  document.body.appendChild(overlay);
  return overlay;
}

function mountFloatingMessengers(opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  // 이미 존재하면 중복 주입 방지
  if (document.querySelector(".floating-messengers")) return;

  // 컨테이너 생성
  const wrap = document.createElement("div");
  wrap.className = "floating-messengers";
  wrap.setAttribute("role", "navigation");
  wrap.setAttribute("aria-label", "Messenger quick actions");

  wrap.innerHTML = `
    <!-- WeChat -->
    <a class="fm-btn fm-wechat" href="javascript:void(0)" aria-label="WeChat" title="WeChat">
      <img src="${cfg.wechatImg}" alt="WeChat" />
    </a>
    <!-- LINE -->
    <a class="fm-btn fm-line" href="${cfg.lineHref}" aria-label="LINE" title="LINE" target="_blank" rel="noopener">
      <img src="/static/assets/line.jpg" alt="LINE" />
    </a>
    <!-- WhatsApp -->
    <a class="fm-btn fm-whatsapp" href="${cfg.whatsappHref}" aria-label="WhatsApp" title="WhatsApp" target="_blank" rel="noopener">
      <img src="/static/assets/whatsapp.jpg" alt="WhatsApp" />
    </a>
  `;

  document.body.appendChild(wrap);

  // (선택) WeChat QR 오버레이
  let overlay = null;
  if (cfg.wechatQR) {
    overlay = createOverlay(cfg.wechatQR);
    wrap.querySelector(".fm-wechat")?.addEventListener("click", () => {
      overlay.classList.add("is-open");
    });
  }
}

// DOM 준비 후 자동 장착
document.addEventListener("DOMContentLoaded", () => {
  // 필요하면 페이지별로 파라미터 전달 가능
  mountFloatingMessengers({
    // wechatQR: "/static/assets/wechat-qr.png",
    // lineHref: "https://line.me/...",
    // whatsappHref: "https://wa.me/..."
  });
});

export { mountFloatingMessengers };
