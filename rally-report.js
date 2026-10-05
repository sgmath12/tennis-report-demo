(() => {
  'use strict';
  const data = window.RALLY_REVIEW;
  if (!data) return;
  const target = document.getElementById('match');
  const players = {
    'pink': {name:'핑크', color:'#D26787'},
    'dark(pink)': {name:'블랙 · 핑크 팀', color:'#7971C6'},
    'white': {name:'화이트', color:'#93A9B5'},
    'dark(white)': {name:'블랙 · 화이트 팀', color:'#3D9DAF'}
  };
  const strokes = {serve:'서브',forehand:'포핸드',backhand:'백핸드',overhead:'스매시','forehand volley':'포핸드 발리','backhand volley':'백핸드 발리'};
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time = n => `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
  const confirmed = data.shots.filter(s=>s.status==='confirmed');
  const excluded = data.shots.filter(s=>s.status!=='confirmed');
  const errors = confirmed.filter(s=>s.result!=='IN' && s.stroke!=='serve');
  const faults = confirmed.filter(s=>s.result!=='IN' && s.stroke==='serve');
  const resultLabel = s => s.status!=='confirmed'?'판정 제외':s.result==='IN'?'정상 진행':s.stroke==='serve'?'서브 폴트':'확인된 범실';
  const badgeClass = s => s.status!=='confirmed'?'':s.result==='IN'?'in':s.stroke==='serve'?'fault':'error';
  const playerName = p => players[p]?.name || '선수 미확인';
  target.innerHTML = `
    <div class="rally-hero"><div><div class="rally-label">실제 경기 · 검수 메모 반영</div><h1>경기를 다시 보면,<br>다음 연습이 보입니다.</h1><p class="rally-sub">확인된 범실 <b>${errors.length}개</b>, 서브 폴트 <b>${faults.length}개</b>.<br>장면을 누르면 영상에서 바로 확인할 수 있습니다.</p></div><aside class="rally-score"><span>복식 · 1세트 / 편집 영상 11:42</span><div><b>핑크 / 블랙</b><strong>4</strong></div><div><b>화이트 / 블랙</b><strong>6</strong></div></aside></div>
    <div class="rally-kpis"><div class="rally-kpi confirmed"><span>집계에 반영한 샷</span><b>${confirmed.length}</b><small>검수 기록으로 확인된 샷</small></div><div class="rally-kpi error"><span>확인된 범실</span><b>${errors.length}</b><small>서브 폴트를 제외한 랠리 범실</small></div><div class="rally-kpi"><span>서브 폴트</span><b>${faults.length}</b><small>네트 / 아웃이 확인된 서브</small></div><div class="rally-kpi"><span>판정 제외</span><b>${excluded.length}</b><small>불확실하거나 추가 검토가 필요한 후보</small></div></div>
    <div class="rally-coverage"><span>검수 범위</span><div class="rally-bar" aria-hidden="true"><i style="width:${confirmed.length/data.shots.length*100}%"></i></div><span>${data.shots.length}개 후보 중 ${confirmed.length}개 반영</span></div>
    <div class="rally-grid"><div class="rally-card"><div class="rally-card-head"><h2>장면으로 확인하기</h2><span>클립 검토</span></div><video id="rally-video" class="rally-video" src="rally-source.mp4" controls playsinline preload="metadata" poster="rally-poster.jpg"></video><div class="rally-caption"><span id="rally-now" aria-live="polite">오른쪽 목록에서 장면을 선택하세요.</span><button id="rally-replay" hidden>다시 보기 ↺</button></div></div><div class="rally-card"><div class="rally-card-head"><h2>확인된 장면</h2><span>타구 전후 10초</span></div><div class="rally-toolbar" id="rally-filters"><button class="rally-filter" data-filter="errors" aria-pressed="true">범실 ${errors.length}</button><button class="rally-filter" data-filter="faults" aria-pressed="false">서브 폴트 ${faults.length}</button><button class="rally-filter" data-filter="all" aria-pressed="false">전체 ${confirmed.length}</button></div><div class="rally-detail-list" id="rally-events"></div></div></div>
    <div class="rally-section"><h2>선수별 기록</h2><p>가까운 쪽에서 확인된 샷만 집계했습니다. 전체 타구 수나 범실률을 뜻하지 않습니다.</p><div class="rally-card rally-table-wrap"><table class="rally-table"><thead><tr><th>선수</th><th><button data-sort="count">반영한 샷 ↓</button></th><th><button data-sort="errors">확인된 범실</button></th><th><button data-sort="faults">서브 폴트</button></th><th><button data-sort="excluded">판정 제외</button></th></tr></thead><tbody id="rally-players"></tbody></table></div></div>
    <div class="rally-notes"><article class="rally-note"><span>01 / RALLY</span><h3>범실은 세 장면부터</h3><p>백핸드 아웃, 포핸드 아웃, 발리 아웃이 각각 확인됐습니다. 횟수가 적어 특정 샷이 약점이라고 단정하기는 어렵습니다.</p></article><article class="rally-note"><span>02 / SERVE</span><h3>폴트는 따로 보기</h3><p>서브 폴트와 랠리 범실을 나눴습니다. 폴트 장면을 모아 네트에 걸렸는지, 길게 나갔는지 확인해보세요.</p></article><article class="rally-note"><span>03 / NEXT SESSION</span><h3>같은 장면을 반복 확인</h3><p>범실 전후 움직임을 영상으로 살펴보세요. 이번 경기만으로 타이밍이나 자세의 원인을 확정하지 않습니다.</p></article></div>
    <details class="rally-details"><summary>판정 제외 ${excluded.length}개 · 이유와 영상 보기</summary><div class="rally-detail-list" id="rally-excluded"></div></details>
    <p class="rally-foot">${escape(data.basis)}<br>미검수 샷과 중복 후보는 통계에 반영하지 않았습니다. 서브 성공률·에러율은 전체 타구 검수가 끝난 뒤 제공됩니다. 영상 탐색은 편집본 시점 기준입니다.</p>`;
  const video = document.getElementById('rally-video');
  let selected = null, clipEnd = null, filter = 'errors', sort = 'count', ascending = false;
  const eventRow = s => `<button class="rally-event ${selected===s.id?'active':''}" data-shot="${s.id}"><time>${time(s.time)}</time><div><b>${escape(playerName(s.player))} · ${escape(strokes[s.stroke]||'타구 미확인')}</b><small>${escape(s.reason.replace(/^검수 메모: /,''))}</small></div><span class="rally-badge ${badgeClass(s)}">${resultLabel(s)}</span></button>`;
  function renderEvents(){const list=filter==='errors'?errors:filter==='faults'?faults:confirmed;document.getElementById('rally-events').innerHTML=list.map(eventRow).join('')||'<p class="rally-empty">이 항목에는 확인된 장면이 없습니다.</p>';document.getElementById('rally-excluded').innerHTML=excluded.map(eventRow).join('');}
  function renderPlayers(){const rows=Object.entries(players).map(([id,p])=>({id,...p,count:confirmed.filter(s=>s.player===id).length,errors:errors.filter(s=>s.player===id).length,faults:faults.filter(s=>s.player===id).length,excluded:excluded.filter(s=>s.player===id).length}));rows.sort((a,b)=>(ascending?1:-1)*(a[sort]-b[sort]));document.getElementById('rally-players').innerHTML=rows.map(p=>`<tr><td><span class="rally-player"><i class="rally-dot" style="background:${p.color}"></i>${p.name}</span></td><td>${p.count}</td><td>${p.errors}</td><td>${p.faults}</td><td>${p.excluded}</td></tr>`).join('');target.querySelectorAll('[data-sort]').forEach(b=>b.textContent=({count:'반영한 샷',errors:'확인된 범실',faults:'서브 폴트',excluded:'판정 제외'}[b.dataset.sort])+(b.dataset.sort===sort?(ascending?' ↑':' ↓'):''));}
  function seek(s){selected=s.id;clipEnd=s.time+7;const begin=Math.max(0,s.time-3);const play=()=>{video.currentTime=begin;video.play().catch(()=>{});};if(video.readyState>=1)play();else video.addEventListener('loadedmetadata',play,{once:true});document.getElementById('rally-now').textContent=`${time(s.time)} · ${playerName(s.player)} · ${strokes[s.stroke]} · ${resultLabel(s)}`;document.getElementById('rally-replay').hidden=false;renderEvents();video.scrollIntoView({behavior:'smooth',block:'center'});}
  target.addEventListener('click',e=>{const shot=e.target.closest('[data-shot]'),f=e.target.closest('[data-filter]'),b=e.target.closest('[data-sort]');if(shot)seek(data.shots.find(s=>s.id===Number(shot.dataset.shot)));if(f){filter=f.dataset.filter;target.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===f)));renderEvents();}if(b){ascending=sort===b.dataset.sort?!ascending:false;sort=b.dataset.sort;renderPlayers();}});
  document.getElementById('rally-replay').addEventListener('click',()=>{if(selected!==null)seek(data.shots.find(s=>s.id===selected));});
  video.addEventListener('timeupdate',()=>{if(clipEnd!==null&&video.currentTime>=clipEnd){video.pause();clipEnd=null;}});
  video.addEventListener('error',()=>{document.getElementById('rally-now').textContent='영상을 불러오지 못했습니다. 새로고침 후 다시 확인해주세요.';document.getElementById('rally-now').classList.add('rally-flash');});
  document.querySelectorAll('nav.tabs button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.screen!=='match')video.pause();}));
  renderEvents();renderPlayers();
  document.querySelector('#stats .league-note').textContent='이 탭의 이름과 수치는 가상 비교 예시입니다. 실제 경기 리포트의 검수 통계와 별도로 표시합니다.';
})();
