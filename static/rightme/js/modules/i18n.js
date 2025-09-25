// /static/rightme/js/modules/i18n.js
// 간단 i18n 유틸: 페이지 전체 번역 + lang 상태 보관/브로드캐스트 (기본 중국어)

const STORE_KEYS = ["pk.lang", "pk_lang", "lang", "langCode", "appLang"];
const FALLBACK = "cn"; // 기본 중국어

const DICT = {
  // 헤더
  "auth.register": { ko: "회원가입", cn: "注册", en: "Sign up" },
  "auth.login":    { ko: "로그인",   cn: "登录", en: "Log in" },
  "header.language": { ko: "언어", cn: "Language", en: "Language" },

  // 검색
  "search.placeholder": {
    ko: "검색어를 입력하세요…",
    cn: "输入您的搜索词…",
    en: "Type your search…"
  },

  // 아이콘 8개
  "icon.sameprice":   { ko: "중한동가",   cn: "中韩同价", en: "KR-CN Same Price" },
  "icon.byPrice":     { ko: "가격별",     cn: "按价格",   en: "By Price" },
  "icon.byHospital":  { ko: "병원별",     cn: "按医院",   en: "By Hospital" },
  "icon.byProcedure": { ko: "시술별",     cn: "按项目",   en: "By Procedure" },
  "icon.byDoctor":    { ko: "의사별",     cn: "按医生",   en: "By Doctor" },
  "icon.byRegion":    { ko: "지역별",     cn: "按地区",   en: "By Region" },
  "icon.beauty":      { ko: "뷰티",       cn: "美妆",     en: "Beauty" },
  "icon.community":   { ko: "정보/커뮤니티", cn: "资讯社区", en: "Community" },

  // 섹션 제목 & more
  "section.deals":     { ko: "특별이벤트", cn: "特别优惠", en: "Deals" },
  "section.sameprice": { ko: "중한동가",   cn: "中韩同价", en: "KR-CN Same Price" },
  "section.doctors":   { ko: "의사",       cn: "医生",     en: "Doctors" },
  "common.more":       { ko: "more >",    cn: "more >",   en: "more >" },

  // 탭바
  "tab.home":      { ko: "HOME", cn: "HOME", en: "HOME" },
  "tab.sameprice": { ko: "중한동가", cn: "中韩同价", en: "Same Price" },
  "tab.reserve":   { ko: "예약",   cn: "预约",     en: "Reserve" },
  "tab.community": { ko: "정보커뮤니티", cn: "资讯社区", en: "Community" },
  "tab.my":        { ko: "나의",   cn: "我的",     en: "My" },
};

/* ---------- 내부 헬퍼 ---------- */
function readStoredLang() {
  for (const k of STORE_KEYS) {
    const v = (localStorage.getItem(k) || "").toLowerCase();
    if (v && /^(ko|cn|en)$/.test(v)) return v;
  }
  return null;
}
function writeStoredLang(lang) {
  STORE_KEYS.forEach(k => localStorage.setItem(k, lang));
}
function normalize(lang) {
  if (!lang) return FALLBACK;
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("en")) return "en";
  return "cn";
}

/* ---------- 공개 API ---------- */
export function currentLang() {
  // 1) 저장된 값 우선
  const stored = readStoredLang();
  if (stored) return stored;

  // 2) 저장이 없다면 기본값(중국어)
  return FALLBACK;
}

export function setLang(lang) {
  const L = normalize(lang);
  writeStoredLang(L);
  document.documentElement.setAttribute("lang", L);
  document.documentElement.dataset.lang = L;
  window.dispatchEvent(new CustomEvent("lang:change", { detail: { lang: L } }));
  translatePage(); // 즉시 반영
}

export function t(key, lang = currentLang()) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] || entry[FALLBACK] || key;
}

export function translatePage(root = document) {
  const L = currentLang();

  // 일반 텍스트
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const txt = t(key, L);
    if (txt != null) el.textContent = txt;
  });

  // placeholder
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const txt = t(key, L);
    if (txt != null) el.setAttribute("placeholder", txt);
  });

  // aria-label (옵션)
  root.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria-label");
    const txt = t(key, L);
    if (txt != null) el.setAttribute("aria-label", txt);
  });
}

export function initI18n() {
  // 저장된 값 없으면 기본 언어를 강제로 설정(= 중국어)
  if (!readStoredLang()) {
    writeStoredLang(FALLBACK);
  }
  document.documentElement.setAttribute("lang", currentLang());
  translatePage();

  // 변경 이벤트 대응
  window.addEventListener("lang:change", () => translatePage());
  window.addEventListener("storage", (e) => {
    if (STORE_KEYS.includes(e.key)) translatePage();
  });
}

// API: fetch URL에 lang 파라미터 붙이기
export function withLang(url) {
  const L = currentLang();
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}lang=${encodeURIComponent(L)}`;
}
