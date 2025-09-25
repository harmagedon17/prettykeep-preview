// /static/rightme/js/modules/main3-doctors.js

(() => {
  const API_URL = '/api/doctors';

  /* ========== 언어 유틸 ========== */
  function getLang() {
    const u = new URL(location.href);
    const q = (u.searchParams.get('lang') || '').toLowerCase();
    const s = (localStorage.getItem('pk_lang') || '').toLowerCase();
    return q || s || 'zh-hans';
  }
  function pickLang(row, base) {
    const lang = getLang();
    if (lang.startsWith('zh')) return row[`${base}_cn`] ?? row[`${base}_zh`] ?? row[base] ?? '';
    if (lang.startsWith('en')) return row[`${base}_en`] ?? row[base] ?? '';
    return row[base] ?? row[`${base}_en`] ?? row[`${base}_cn`] ?? '';
  }
  const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ========== items 코드 → 언어 라벨(프론트에서 처리) ========== */
  // 서버는 items를 "filler,botox,..." CSV 코드로 내려줌
  const ITEM_LABELS = {
    ko: {
      filler: '필러', botox: '보톡스', lifting: '리프팅', skin: '피부',
      Other_Petit: '기타쁘띠/피부', woman: '여성',
      Fat_decomposition: '지방분해/윤곽주사', hair_loss: '탈모',
    },
    cn: {
      filler: '填充', botox: '肉毒素', lifting: '提升', skin: '皮肤',
      Other_Petit: '其他微整/皮肤', woman: '女性',
      Fat_decomposition: '脂肪分解/塑形注射', hair_loss: '脱发',
    },
    en: {
      filler: 'Filler', botox: 'Botox', lifting: 'Lifting', skin: 'Skin',
      Other_Petit: 'Other Petite/Skin', woman: 'Women',
      Fat_decomposition: 'Fat decomposition', hair_loss: 'Hair loss',
    },
  };
  function labelsFromItemsCSV(csv) {
    const lang = getLang().startsWith('zh') ? 'cn' : (getLang().startsWith('en') ? 'en' : 'ko');
    if (!csv) return [];
    const codes = csv.split(',').map(s => s.trim()).filter(Boolean);
    const map = ITEM_LABELS[lang] || ITEM_LABELS.cn;
    return codes
      .map(c => map[c] || null)
      .filter(Boolean)
      .slice(0, 8);
  }

  /* ========== 프로필 텍스트 → 줄 단위 목록 ========== */
  function splitProfile(textRaw) {
    const text = (textRaw || '').replace(/\r\n/g, '\n').trim();
    if (!text) return [];
    // ·, 줄바꿈을 기준으로 분리
    let parts = text
      .split('\n')
      .flatMap(line => line.split('·'))
      .map(s => s.trim())
      .filter(Boolean);
    // 너무 길면 앞쪽 3~4개만
    if (parts.length > 4) parts = parts.slice(0, 4);
    return parts;
  }

  /* ========== 카드 템플릿 ========== */
  function cardTpl(row) {
    const name = pickLang(row, 'doctor_name') || '';
    const cat  = pickLang(row, 'doctor_category') || '';
    const hosp = pickLang(row, 'hospital_name') || '';
    const img  = row.doctor_img_url
              || (row.hospital_id ? `/static/upload/hospital/${encodeURIComponent(row.hospital_id)}/1/img/1_img2.png` : '/static/assets/placeholder.jpg');

    const items = labelsFromItemsCSV(row.items);
    const profileLines = splitProfile(
      pickLang(row, 'doctor_profile') || pickLang(row, 'doctor_introduction')
    );

    // 평점(있으면) + 리뷰 수
    const rp = (typeof row.review_point === 'number' ? row.review_point : parseFloat(row.review_point || 0)) || 0;
    const rc = parseInt(row.review_count || 0, 10) || 0;

    // 상세 페이지 링크(있으면 바꾸세요)
    const href = `/hospital/${encodeURIComponent(row.hospital_id || '')}?doctor=${encodeURIComponent(row.doctor_id || '')}`;

    return `
      <article class="doctor-card">
        <img src="${esc(img)}" alt="${esc(name)}" />
        <h4 class="doc-name">${esc(name)}</h4>
        <p class="doc-title"><strong>${esc(cat)}</strong></p>

        <ul class="doc-meta">
          <li>${esc(hosp)}</li>
        </ul>

        ${items.length ? `
          <div class="doc-tags">
            ${items.map(lbl => `<span><strong>${esc(lbl)}</strong></span>`).join('')}
          </div>
        ` : ''}

        ${profileLines.length ? `
          <ul class="doc-meta">
            ${profileLines.map(line => `<li>· ${esc(line)}</li>`).join('')}
          </ul>
        ` : ''}

        <div class="doc-footer">
          <a href="${href}" class="doc-arrow" aria-label="detail">→</a>
        </div>
      </article>
    `;
  }

  /* ========== 스켈레톤 ========== */
  function renderSkeleton($grid, n = 4) {
    const sk = `
      <article class="doctor-card" aria-hidden="true" style="opacity:.65">
        <div style="margin:0 auto;width:110px;aspect-ratio:1/1;border-radius:50%;background:#eee"></div>
        <div style="height:10px;background:#eee;border-radius:6px;margin:.8rem auto .4rem; width:60%"></div>
        <div style="height:10px;background:#eee;border-radius:6px;margin:.4rem auto; width:40%"></div>
        <div style="height:10px;background:#eee;border-radius:6px;margin:.6rem auto; width:70%"></div>
      </article>
    `;
    $grid.innerHTML = new Array(n).fill(sk).join('');
  }

  /* ========== 로드/렌더 ========== */
  async function loadDoctors() {
    const $grid = document.querySelector('#doctorGrid') || document.querySelector('.doctor-grid');
    if (!$grid) return;

    renderSkeleton($grid, 4);

    const params = new URLSearchParams({ page: '1', per_page: '4' });
    try {
      const res = await fetch(`${API_URL}?${params.toString()}`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const html = (data.items || []).map(cardTpl).join('');
      $grid.innerHTML = html || `<p style="color:var(--muted)">표시할 의사 정보가 없습니다.</p>`;
    } catch (err) {
      console.error('doctors load error:', err);
      $grid.innerHTML = `<p style="color:#d00">의사 정보를 불러오는 중 오류가 발생했습니다.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', loadDoctors);
  window.addEventListener('data:refresh', loadDoctors);

})();
