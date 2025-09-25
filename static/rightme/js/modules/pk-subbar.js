(function () {
  var KEY = {
    'icon.sameprice':  'parity',
    'icon.byPrice':    'price',
    'icon.byHospital': 'clinic',
    'icon.byProcedure':'treatment',
    'icon.byDoctor':   'doctor',
    'icon.byRegion':   'area',
    'icon.beauty':     'beauty',
    'icon.community':  'community'
  };

  var ROUTES = {
    price: { '活动':'/promo', '按价格':'/price' },
    clinic: {
      '皮肤科':'/clinics/dermatology','整形外科':'/clinics/plastic','牙科':'/clinics/dental','眼科':'/clinics/eye',
      '痘痘':'/clinics/tag/acne','疤痕':'/clinics/tag/scar','毛孔':'/clinics/tag/pores','斑点/色素':'/clinics/tag/pigment'
    },
    treatment: {
      '皮秒':'/treatments/pico','美白调色':'/treatments/toning','飞梭':'/treatments/fraxel','IPL':'/treatments/ipl',
      '下颌肉毒':'/treatments/botox-jaw','额头肉毒':'/treatments/botox-forehead','嘴唇填充':'/treatments/filler-lip','法令纹填充':'/treatments/filler-nasolabial'
    },
    doctor: {
      '专科医生':'/doctors/specialist','10年以上':'/doctors/10y','学会活动':'/doctors/academic','论文/发表':'/doctors/papers',
      '自然风格':'/doctors/style/natural','立体风格':'/doctors/style/defined','细腻风格':'/doctors/style/soft','速度快':'/doctors/style/fast'
    },
    area: {
      '首尔':'/area/kr/seoul','釜山':'/area/kr/busan','大邱':'/area/kr/daegu','仁川':'/area/kr/incheon','大田':'/area/kr/daejeon',
      '弘大入口':'/area/metro/hongdae','江南':'/area/metro/gangnam','明洞':'/area/metro/myeongdong','狎鸥亭':'/area/metro/apgujeong','乙支路入口':'/area/metro/euljiro'
    },
    beauty: { '高端水疗':'/beauty/luxury-spa','美发':'/beauty/hair','化妆':'/beauty/makeup' }
  };

  var TAX = {
    price:   [{ mid:'快速筛选', subs:['活动','按价格'] }],
    clinic:  [{ mid:'诊疗科目', subs:['皮肤科','整形外科','牙科','眼科'] },{ mid:'专长', subs:['痘痘','疤痕','毛孔','斑点/色素'] }],
    treatment:[{ mid:'激光', subs:['皮秒','美白调色','飞梭','IPL'] },{ mid:'肉毒/填充', subs:['下颌肉毒','额头肉毒','嘴唇填充','法令纹填充'] }],
    doctor:  [{ mid:'经历', subs:['专科医生','10年以上','学会活动','论文/发表'] },{ mid:'风格', subs:['自然风格','立体风格','细腟风格','速度快'] }],
    area:    [{ mid:'地区', subs:['首尔','釜山','大邱','仁川','大田'] },{ mid:'地铁站', subs:['弘大入口','江南','明洞','狎鸥亭','乙支路入口'] }],
    beauty:  [{ mid:'服务类别', subs:['高端水疗','美发','化妆'] }]
  };

  var DIRECT = { parity:'/promo/kr-cn-parity', community:'/community' };

  function esc(s){
    return String(s).replace(/[&<>"']/g,function(m){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

  var subbar = document.getElementById('pk-subbar');
  if (!subbar) return;
  subbar.setAttribute('aria-hidden','true');

  function setActiveIcon(el){
    document.querySelectorAll('.icons .icon-grid .icon-btn').forEach(function(b){ b.classList.remove('is-active'); });
    if (el) el.classList.add('is-active');
  }

  // 클릭 순간: 팝 + 펄스 (펄스 중심을 이미지 정중앙으로 고정)
  function popOnce(el){
    var img = el.querySelector('img');
    if (img) {
      var br = el.getBoundingClientRect();
      var ir = img.getBoundingClientRect();
      var cx = (ir.left - br.left) + ir.width / 2;
      var cy = (ir.top  - br.top)  + ir.height / 2;

      el.style.setProperty('--cx',  cx + 'px');     // 중심 X
      el.style.setProperty('--cy',  cy + 'px');     // 중심 Y
      el.style.setProperty('--ico', ir.width + 'px'); // 링 지름(이미지 폭)
    }

    // 연타 애니메이션 재시작
    el.classList.remove('pop');
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth; // reflow
    el.classList.add('pop');

    setTimeout(function(){ el.classList.remove('pop'); }, 320);
  }

  function renderChips(groupKey, mid){
    var mids = TAX[groupKey] || [];
    var target = null;
    for (var i=0;i<mids.length;i++){ if(mids[i].mid===mid){ target=mids[i]; break; } }
    if(!target) target = mids[0] || {subs:[]};

    var wrap = subbar.querySelector('.pk-chips');
    var out = [];
    for (var j=0;j<target.subs.length;j++){
      var sub = target.subs[j];
      out.push('<button type="button" class="pk-chip" data-group="'+esc(groupKey)+'" data-sub="'+esc(sub)+'">'+esc(sub)+'</button>');
    }
    wrap.innerHTML = out.join('');

    wrap.querySelectorAll('.pk-chip').forEach(function(ch){
      ch.addEventListener('click', function(){
        var g = this.getAttribute('data-group');
        var s = this.getAttribute('data-sub');
        var to = ROUTES[g] && ROUTES[g][s];
        if (to) window.location.assign(to);
      });
    });
  }

  function renderSubbar(groupKey){
    var mids = TAX[groupKey] || [];
    if(!mids.length){ closeSubbar(); return; }

    var activeMid = mids[0].mid;
    var tabHtml = '';
    for (var i=0;i<mids.length;i++){
      var m = mids[i].mid;
      tabHtml += '<button type="button" class="pk-midbtn'+(m===activeMid?' active':'')+'" data-mid="'+esc(m)+'">'+esc(m)+'</button>';
    }

    subbar.innerHTML =
      '<div class="row">'+
        '<div class="pk-midtabs">'+ tabHtml +'</div>'+
        '<div class="pk-chips"></div>'+
      '</div>';

    renderChips(groupKey, activeMid);

    subbar.querySelectorAll('.pk-midbtn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var mid = this.getAttribute('data-mid');
        subbar.querySelectorAll('.pk-midbtn').forEach(function(b){ b.classList.remove('active'); });
        this.classList.add('active');
        renderChips(groupKey, mid);
      });
    });
  }

  function openSubbar(groupKey, clickedIcon){
    renderSubbar(groupKey);
    subbar.dataset.open = groupKey;
    subbar.setAttribute('aria-hidden','false');
    setActiveIcon(clickedIcon);

    // 섹션 "안"에 고정
    var iconsSection = document.querySelector('.icons');
    if (iconsSection && !iconsSection.contains(subbar)) {
      iconsSection.appendChild(subbar);
    }
    try { subbar.scrollIntoView({behavior:'smooth', block:'nearest'}); } catch(_) {}
  }

  function closeSubbar(){
    subbar.setAttribute('aria-hidden','true');
    subbar.dataset.open = '';
    subbar.innerHTML = '';
    document.querySelectorAll('.icons .icon-grid .icon-btn').forEach(function(b){ b.classList.remove('is-active'); });
  }

  // 아이콘 클릭 바인딩
  document.querySelectorAll('.icons .icon-grid .icon-btn').forEach(function(a){
    var span = a.querySelector('span[data-i18n]');
    var i18n = span ? span.getAttribute('data-i18n') : null;
    var groupKey = i18n && KEY[i18n];

    a.addEventListener('click', function(e){
      if (!groupKey) return;

      // ⓐ 즉시 팝 + 링 (이미지 중심에서)
      popOnce(a);

      // ⓑ 기본 이동/서브바 처리
      if (TAX[groupKey]) e.preventDefault();
      if (DIRECT[groupKey]) { window.location.assign(DIRECT[groupKey]); return; }

      if (subbar.dataset.open === groupKey){ closeSubbar(); return; }
      openSubbar(groupKey, a);
    });
  });
})();
