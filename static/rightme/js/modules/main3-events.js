// /static/rightme/js/pages/main3-events.js
(() => {
  const API_URL = '/api/events';

  // --- 언어 유틸 ---
  function getLang() {
    const u = new URL(location.href);
    const fromQuery = u.searchParams.get('lang');
    const fromStorage = localStorage.getItem('pk_lang');
    return (fromQuery || fromStorage || 'zh-hans').toLowerCase();
  }
  function pickLang(row, base) {
    const lang = getLang();
    if (lang.startsWith('zh')) return row[`${base}_cn`] || row[base + '_zh'] || row[base] || '';
    if (lang.startsWith('en')) return row[`${base}_en`] || row[base] || '';
    return row[base] || row[`${base}_en`] || row[`${base}_cn`] || '';
  }
  const esc = (s='') => String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

  // --- 이미지 경로 폴백 ---
  function eventImg(row) {
    if (row.thumb) return row.thumb;
    if (row.event_img_url) return row.event_img_url;
    if (row.hospital_id && row.event_id && row.event_img) {
      return `/static/upload/event/${encodeURIComponent(row.hospital_id)}/${encodeURIComponent(row.event_id)}/${encodeURIComponent(row.event_img)}`;
    }
    if (row.hospital_id && row.hospital_logo) {
      return `/static/upload/hospital/${encodeURIComponent(row.hospital_id)}/img/${encodeURIComponent(row.hospital_logo)}`;
    }
    return '/static/assets/placeholder.jpg';
  }

  // --- 中韩同价 여부 ---
  function isSamePrice(row) {
    const raw = (row.same_price_YN ?? row.etc1 ?? '').toString().trim().toUpperCase();
    return raw === 'Y' || raw === 'TRUE' || raw === '1';
  }

  // --- 카드 템플릿 (병원명만 표기) ---
  function cardTpl(row) {
    // ✅ 이벤트 이름 제거, 병원 이름만 사용
    const title   = pickLang(row, 'hospital_name') || '';
    const address = pickLang(row, 'address') || '';
    const img     = eventImg(row);

    // 링크도 병원 상세로 이동 (원하면 이벤트로 바꿔도 됩니다)
    const href    = `/hospital/${encodeURIComponent(row.hospital_id)}`;

    const sameTag = isSamePrice(row) ? `<span class="tag tag--same">中韩同价</span>` : '';

    // 평점/리뷰수(없으면 0/0)
    const score = (row.review_point ?? 0).toString();
    const cnt   = (row.review_count ?? 0).toString();

    return `
      <article class="card">
        <header class="card-head">
          <a href="${href}">
            <img src="${esc(img)}" alt="${esc(title)}" loading="lazy" />
          </a>
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
              <span class="score">${esc(score)}</span>
              <span class="count">(${esc(cnt)})</span>
            </li>
          </ul>
          <div class="clinic-tags">
            ${sameTag}
          </div>
        </div>
      </article>
    `;
  }

  // --- 스켈레톤 표시 ---
  function renderSkeleton($grid, n=4) {
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

  // --- 로드 & 렌더 ---
  async function loadEvents() {
    const $grid = document.getElementById('eventsGrid') || document.querySelector('.section .card-grid');
    if (!$grid) return;

    renderSkeleton($grid, 4);

    const params = new URLSearchParams({ page:'1', per_page:'8' });
    try {
      const res = await fetch(`${API_URL}?${params.toString()}`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("이벤트 진행병원 : ", data);

      const html = (data.items || []).map(cardTpl).join('') || `<p style="color:var(--muted)">표시할 이벤트가 없습니다.</p>`;
      $grid.innerHTML = html;
    } catch (err) {
      console.error('events load error:', err);
      $grid.innerHTML = `<p style="color:#d00">이벤트를 불러오는 중 오류가 발생했습니다.</p>`;
    }
  }

  //
  // window.addEventListener('pk:lang-changed', loadEvents);  
  document.addEventListener('DOMContentLoaded', loadEvents);
  window.addEventListener('data:refresh', loadEvents);
  
})();
