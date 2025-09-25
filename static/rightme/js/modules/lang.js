// /static/rightme/js/modules/lang.js
// Language Selector (popover/modal) - 새로고침 없이 언어 변경 + 데이터 재호출 브로드캐스트
//
// - UI 코드는 'zh-hans' | 'ko' | 'en'
// - i18n.js 코드는 'cn' | 'ko' | 'en' (매핑 필요)
// - 버튼 라벨은 항상 "Language"

import {
  initI18n,
  currentLang as i18nCurrent,
  setLang      as i18nSetLang,
} from "/static/rightme/js/modules/i18n.js";

/* 호환 저장키들(예전 코드 대비) */
const STORAGE_KEYS = ["pk.lang", "pk_lang", "lang", "langCode", "appLang"];

/* UI <-> i18n 코드 매핑 */
const UI2I18N = { "zh-hans": "cn", ko: "ko", en: "en" };
const I18N2UI = { cn: "zh-hans", ko: "ko", en: "en" };

/* <html lang> 매핑 */
const HTML_LANG = { "zh-hans": "zh-CN", ko: "ko", en: "en" };

/* 라벨 */
const BUTTON_LABEL = "Language";
const LABELS = { "zh-hans": "中文（简体）", ko: "한국어", en: "English" };

/* ---------- 유틸 ---------- */
function readStoredUI() {
  for (const k of STORAGE_KEYS) {
    const v = localStorage.getItem(k);
    if (!v) continue;
    if (v in I18N2UI) return I18N2UI[v];               // i18n 코드가 저장돼 있었던 경우
    if (v === "zh-hans" || v === "ko" || v === "en") return v;
  }
  const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  if (htmlLang.startsWith("zh")) return "zh-hans";
  if (htmlLang.startsWith("ko")) return "ko";
  if (htmlLang.startsWith("en")) return "en";
  return "zh-hans";
}

function writeStoredAll(uiCode) {
  const i18nCode = UI2I18N[uiCode] || "cn";
  for (const k of STORAGE_KEYS) {
    if (k === "pk_lang") localStorage.setItem(k, uiCode);   // UI 코드
    else                 localStorage.setItem(k, i18nCode); // i18n 코드
  }
}

function currentUICode() {
  const fromI18n = i18nCurrent?.();
  if (fromI18n && I18N2UI[fromI18n]) return I18N2UI[fromI18n];
  return readStoredUI();
}

function fixButtonMinWidth(btn) {
  const probe = document.createElement("span");
  const st = getComputedStyle(btn);
  Object.assign(probe.style, {
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "nowrap",
    font: st.font, padding: st.padding, border: 0, margin: 0
  });
  probe.textContent = BUTTON_LABEL;
  document.body.appendChild(probe);
  const needed = Math.ceil(probe.offsetWidth + 20); // 16px 아이콘 + 여백 근사
  document.body.removeChild(probe);

  btn.style.whiteSpace = "nowrap";
  btn.style.textAlign  = "center";
  const cssMin = parseFloat(st.minWidth) || 0;
  btn.style.minWidth = Math.max(cssMin, needed) + "px";
}

function placePopover(btn, pop) {
  const isMobile = matchMedia("(max-width: 640px)").matches;
  const isTablet = matchMedia("(min-width: 641px) and (max-width: 1023px)").matches;
  if (isMobile) return;

  const r = btn.getBoundingClientRect();
  const gap = 10;

  const wasHidden = pop.style.visibility !== "";
  if (wasHidden) { pop.style.visibility = "hidden"; document.body.appendChild(pop); }

  let top, left;
  if (isTablet) {
    const header = document.querySelector(".site-header") || document.body;
    const hr = header.getBoundingClientRect();
    const desiredWidth = Math.max(320, pop.offsetWidth);
    const centerX = hr.left + (hr.width / 2);

    top  = r.bottom + gap + window.scrollY;
    left = centerX - (desiredWidth / 2) + window.scrollX;
    pop.style.minWidth = desiredWidth + "px";
  } else {
    top  = r.bottom + gap + window.scrollY;
    left = Math.min(
      r.right - pop.offsetWidth + window.scrollX,
      window.scrollX + document.documentElement.clientWidth - 12 - pop.offsetWidth
    );
    pop.style.minWidth = "";
  }

  left = Math.max(window.scrollX + 12, left);
  pop.style.top  = `${top}px`;
  pop.style.left = `${left}px`;
  if (wasHidden) pop.style.visibility = "";
}

function reflectCurrent(pop) {
  const cur = currentUICode();
  pop.querySelectorAll(".lang-item").forEach(b => {
    b.setAttribute("aria-checked", b.dataset.lang === cur ? "true" : "false");
  });
}

function setButtonLabel(btn) {
  const label = btn.querySelector(".langbtn-label");
  if (label) label.textContent = BUTTON_LABEL;
}

/* URL 파라미터 lang 1회 반영(있으면 저장만, 리로드 없음) */
function applyQueryLangOnce() {
  const q = (new URL(location.href)).searchParams.get("lang");
  if (!q) return;
  const ui = q.toLowerCase();
  if (!["zh-hans", "ko", "en"].includes(ui)) return;
  writeStoredAll(ui);
  document.documentElement.setAttribute("lang", HTML_LANG[ui] || "zh-CN");
  i18nSetLang?.(UI2I18N[ui] || "cn");
}

/* 데이터 리로드 브로드캐스트(모듈들이 이 이벤트를 듣고 재호출) */
function broadcastDataRefresh(uiCode) {
  const i18n = UI2I18N[uiCode] || "cn";
  const detail = { ui: uiCode, i18n };
  // ✅ 표준 이벤트 하나만 발행
  window.dispatchEvent(new CustomEvent("data:refresh", { detail }));
}

/* 저장 + html + i18n + URL 갱신 + 데이터 리로드 */
function setUnifiedLang(uiCode) {
  const safe = ["zh-hans", "ko", "en"].includes(uiCode) ? uiCode : "zh-hans";
  const i18nCode = UI2I18N[safe] || "cn";

  writeStoredAll(safe);
  document.documentElement.setAttribute("lang", HTML_LANG[safe] || "zh-CN");

  // i18n.js에 반영(페이지 내 텍스트 즉시 번역)
  i18nSetLang?.(i18nCode);

  // URL ?lang= 갱신(새로고침 없이)
  const url = new URL(location.href);
  url.searchParams.set("lang", safe);
  history.replaceState(null, "", url.toString());

  // ✅ 데이터 모듈들에게 재호출 신호
  broadcastDataRefresh(safe);
}

/* ---------- 초기화 ---------- */
export function initLang() {
  // i18n 초기화(번역 적용 + 이벤트 연결)
  initI18n?.();

  const btn = document.getElementById("langBtn");
  if (!btn) return;

  // 최초 동기화
  setButtonLabel(btn);
  document.documentElement.setAttribute("lang", HTML_LANG[currentUICode()] || "zh-CN");
  if (document.fonts?.ready) document.fonts.ready.then(() => fixButtonMinWidth(btn));
  else window.addEventListener("load", () => fixButtonMinWidth(btn));

  // 쿼리 우선 반영(있을 때 1회)
  applyQueryLangOnce();

  // 오버레이 + 팝오버 DOM
  const overlay = document.createElement("div");
  overlay.className = "lang-overlay";
  overlay.innerHTML = `
    <div class="lang-popover" role="menu" aria-label="Language menu">
      <div class="lang-header">
        <strong class="title">Language</strong>
        <button type="button" class="close" aria-label="Close">✕</button>
      </div>
      <ul class="lang-list">
        <li><button type="button" class="lang-item" role="menuitemradio" data-lang="zh-hans" aria-checked="false">
          <span class="lang-flag" aria-hidden="true">🇨🇳</span><span>${LABELS["zh-hans"]}</span>
        </button></li>
        <li><button type="button" class="lang-item" role="menuitemradio" data-lang="ko" aria-checked="false">
          <span class="lang-flag" aria-hidden="true">🇰🇷</span><span>${LABELS["ko"]}</span>
        </button></li>
        <li><button type="button" class="lang-item" role="menuitemradio" data-lang="en" aria-checked="false">
          <span class="lang-flag" aria-hidden="true">🇺🇸</span><span>${LABELS["en"]}</span>
        </button></li>
      </ul>
    </div>`;
  document.body.appendChild(overlay);

  const pop = overlay.querySelector(".lang-popover");
  const closeBtn = overlay.querySelector(".lang-header .close");

  function open() {
    overlay.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    reflectCurrent(pop);
    placePopover(btn, pop);
    (pop.querySelector('.lang-item[aria-checked="true"]') || pop.querySelector('.lang-item'))?.focus();
    window.addEventListener("resize", onViewport);
    window.addEventListener("scroll", onViewport, { passive: true });
  }
  function close() {
    overlay.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    window.removeEventListener("resize", onViewport);
    window.removeEventListener("scroll", onViewport);
  }
  function onViewport() { placePopover(btn, pop); }

  // 열기/닫기
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    overlay.classList.contains("is-open") ? close() : open();
  });
  overlay.addEventListener("click", (e) => {
    if (!e.target.closest(".lang-popover")) close();
  });
  closeBtn?.addEventListener("click", close);

  // 키보드 접근성
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(pop.querySelectorAll(".lang-item"));
      const idx = items.indexOf(document.activeElement);
      const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items[next].focus();
    }
    if (e.key === "Enter" && document.activeElement?.classList.contains("lang-item")) {
      document.activeElement.click();
    }
  });

  // 언어 선택 → 저장 + 번역 + URL 갱신 + 데이터 리로드(새로고침 없음)
  pop.addEventListener("click", (e) => {
    const it = e.target.closest(".lang-item"); if (!it) return;
    const ui = it.dataset.lang;
    setUnifiedLang(ui);
    close();
  });

  // 다른 탭이나 컴포넌트에서 변경될 때 동기화
  window.addEventListener("lang:change", () => reflectCurrent(pop));
  window.addEventListener("lang:ui-change", () => reflectCurrent(pop));
  window.addEventListener("storage", (e) => {
    if (STORAGE_KEYS.includes(e.key)) {
      document.documentElement.setAttribute("lang", HTML_LANG[currentUICode()] || "zh-CN");
      reflectCurrent(pop);
      // 다른 탭에서 언어 바꿨을 때도 데이터 다시 로드
      broadcastDataRefresh(currentUICode());
    }
  });
}
