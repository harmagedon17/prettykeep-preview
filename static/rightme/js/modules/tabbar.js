// /static/rightme/js/modules/tabbar.js
// 하단 탭바 렌더러 (i18n 지원, 페이지별 활성 탭 표시)

import { initI18n, t } from "./i18n.js";

const ACTIVE = (document.body.dataset.tab || "home").toLowerCase();

function view() {
  // 활성 클래스 헬퍼
  const is = k => (ACTIVE === k ? "active" : "");

  return `
  <nav class="pk-tabbar" role="navigation" aria-label="Bottom Tabs">
    <div class="pk-tablist">
      <a href="/" class="pk-tab ${is("home")}" data-key="home" aria-current="${is("home") ? "page" : "false"}">
        <img src="/static/assets/home.png" class="icon" alt="" aria-hidden="true" />
        <span class="label">${t("tab.home")}</span>
      </a>

      <a href="/sameprice" class="pk-tab ${is("sameprice")}" data-key="sameprice" aria-current="${is("sameprice") ? "page" : "false"}">
        <img src="/static/assets/price.png" class="icon" alt="" aria-hidden="true" />
        <span class="label">${t("tab.sameprice")}</span>
      </a>

      <a href="/reserve" class="pk-tab pk-tab--reserve ${is("reserve")}" data-key="reserve" aria-current="${is("reserve") ? "page" : "false"}">
        <div class="pk-fab">
          <img src="/static/assets/reserve.png" class="icon" alt="" aria-hidden="true" />
        </div>
        <span class="label">${t("tab.reserve")}</span>
      </a>

      <a href="/community" class="pk-tab ${is("community")}" data-key="community" aria-current="${is("community") ? "page" : "false"}">
        <img src="/static/assets/community.png" class="icon" alt="" aria-hidden="true" />
        <span class="label">${t("tab.community")}</span>
      </a>

      <a href="/my" class="pk-tab ${is("my")}" data-key="my" aria-current="${is("my") ? "page" : "false"}">
        <img src="/static/assets/mine.png" class="icon" alt="" aria-hidden="true" />
        <span class="label">${t("tab.my")}</span>
      </a>
    </div>
  </nav>`;
}

function render() {
  const html = view();
  const exist = document.querySelector(".pk-tabbar");
  if (exist) {
    exist.outerHTML = html; // 번역/활성 상태 변경 시 전체 교체
  } else {
    document.body.insertAdjacentHTML("beforeend", html);
  }
}

function init() {
  initI18n();   // 번역 시스템 초기화
  render();     // 최초 렌더
  // 언어가 바뀌면 다시 렌더
  window.addEventListener("lang:change", render);
}

// DOM 준비되면 실행(ESM에서는 보통 즉시 실행해도 되나 안전하게)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

export default {};
