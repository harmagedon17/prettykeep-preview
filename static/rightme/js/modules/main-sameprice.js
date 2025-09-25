// /static/rightme/js/modules/main-sameprice.js
(() => {
  const API_URL = '/api/sameprice';
  console.debug('[sameprice] boot');

  /* ---------- 언어 유틸 ---------- */
  function getLang() {
    const u = new URL(location.href);
    const fromQuery = u.searchParams.get('lang');
    const fromStorage = localStorage.getItem('pk_lang');
    return (fromQuery || fromStorage || 'zh-hans').toLowerCase();
  }
  function pickLang(row, base) {
    const lang = getLang();
    if (lang.startsWith('zh')) return row[`${base}_cn`] || row[`${base}_zh`] || row[base] || '';
    if (lang.startsWith('en')) return row[`${base}_en`] || row[base] || '';
    return row[base] || row[`${base}_en`] || row[`${base}_cn`] || '';
  }
  const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));

  /* ---------- 이미지 선택 ---------- */
  function pickImage(row) {
    if (row.thumb) return row.thumb;
    if (row.event_img_url) return row.event_img_url;
    if (row.hospital_logo_url) return row.hospital_logo_url;
    if (row.hospital_id && row.hospital_logo) {
      return `/static/upload/hospital/${encodeURIComponent(row.hospital_id)}/img/${encodeURIComponent(row.hospital_logo)}`;
    }
    return '/static/assets/placeholder.jpg';
  }

  /* ---------- 점수/리뷰 ---------- */
  function fmtScore(v) {
    if (v === null || v === undefined || v === '') return '0.00';
    const num = Number(v);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  }
  function fmtCount(v) {
    const n = parseInt(v || 0, 10);
    return isNaN(n) ? 0 : n;
  }

  /* ---------- 잘하는 항목(카테고리) 파싱 ---------- */
  function parseCategories(row, limit = 5) {
    const raw = pickLang(row, 'category_info') || '';
    // 쉼표(,)와 중국어 쉼표(，) 모두 분리
    const arr = raw.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    if (!arr.length) return '';
    const tags = arr.slice(0, limit)
      .map(t => `<span class="tag">${esc(t)}</span>`)
      .join('');
    return `<div class="treat-tags">${tags}</div>`;
  }

  /* ---------- 카드 템플릿 (병원명만) + 찜버튼 + 중한동가 + 카테고리 ---------- */
  function cardTpl(row) {
    const title   = pickLang(row, 'hospital_name') || '';
    const address = pickLang(row, 'address') || '';
    const img     = pickImage(row);
    const href    = `/hospital/${encodeURIComponent(row.hospital_id)}`;
    const score   = fmtScore(row.review_point);
    const count   = fmtCount(row.review_count);
    const sameTag = row.same_price ? `<span class="tag tag--same">中韩同价</span>` : '';
    const categoriesHtml = parseCategories(row, 5);

    return `
      <article class="card">
        <header class="card-head">
          <a href="${href}">
            <img src="${esc(img)}" alt="${esc(title)}" loading="lazy" />
          </a>

          <!-- 찜하기 버튼 (이벤트 위임으로 동작) -->
          <button class="fav-btn" aria-label="즐겨찾기" type="button">
            <svg viewBox="0 0 24 24" class="heart" aria-hidden="true">
              <path d="M12 20.3
                C10.4 19 5 14.2 5 9.8
                C5 7.2 7.2 5 9.8 5
                C11.3 5 12.7 5.9 13.5 7.2
                C14.3 5.9 15.7 5 17.2 5
                C19.8 5 22 7.2 22 9.8
                C22 14.2 16.6 19 15 20.3
                C13.9 21.1 12.1 21.1 12 20.3
                Z"/>
            </svg>
          </button>
        </header>

        <div class="card-body">
          <a href="${href}"><h4>${esc(title)}</h4></a>
          <p class="desc">${esc(address)}</p>

          <ul class="meta">
            <li class="rating">
              <img src="/static/assets/star.jpg" alt="rating" class="star-icon" />
              <span class="score">${score}</span>
              <span class="count">(${count})</span>
            </li>
          </ul>

          ${categoriesHtml}

          <div class="clinic-tags">
            ${sameTag}
          </div>
        </div>
      </article>
    `;
  }

  /* ---------- 스켈레톤 ---------- */
  function renderSkeleton($grid, n = 8) {
    const sk = `
      <article class="card card--skeleton">
        <header class="card-head"><div class="sk-img"></div></header>
        <div class="card-body">
          <div class="sk-line w-70"></div>
          <div class="sk-line w-50"></div>
          <div class="sk-line w-40"></div>
        </div>
      </article>
    `;
    $grid.innerHTML = new Array(n).fill(sk).join('');
  }

  /* ---------- 그리드 탐색 ---------- */
  function resolveGrid() {
    const byId = document.getElementById('samepriceGrid');
    if (byId) return byId;

    const byData = document.querySelector('[data-grid="sameprice"]');
    if (byData) return byData;

    const sections = Array.from(document.querySelectorAll('.section'));
    const sec = sections.find(s => {
      const t = (s.querySelector('.section-head h3')?.textContent || '').trim();
      return /중한동가|中韩同价|same price/i.test(t);
    });
    return sec?.querySelector('.card-grid') || null;
  }

  /* ---------- 렌더 ---------- */
  async function loadSameprice() {
    const $grid = resolveGrid();
    if (!$grid) {
      console.warn('[sameprice] grid not found. (id="samepriceGrid" 권장)');
      return;
    }

    renderSkeleton($grid, 8);

    const params = new URLSearchParams({ page: '1', per_page: '8' });

    try {
      const res = await fetch(`${API_URL}?${params.toString()}`, { credentials: 'same-origin' });
      console.debug('[sameprice] fetch', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.debug('[sameprice] data', data);

      const html = (data.items || []).map(cardTpl).join('') ||
        `<p style="color:var(--muted)">표시할 항목이 없습니다.</p>`;

      $grid.innerHTML = html;
    } catch (err) {
      console.error('sameprice load error:', err);
      $grid.innerHTML = `<p style="color:#d00">중한동가 목록을 불러오는 중 오류가 발생했습니다.</p>`;
    }
  }

  // 초기 로드 및 언어 변경 시 재로드
  const ready = () => loadSameprice();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
  window.addEventListener('lang:changed', loadSameprice);
  window.addEventListener('pk:lang-changed', loadSameprice);  
  window.addEventListener('data:refresh', loadSameprice);

  // 콘솔 수동 호출용
  window.PK_loadSameprice = loadSameprice;
})();
