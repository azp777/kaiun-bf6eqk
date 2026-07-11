'use strict';
/* ================================================================
   描画
================================================================ */
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function compassSVG(res,title){
  const cx=110,cy=110,r1=44,r2=104;
  let paths='';
  res.forEach((r,i)=>{
    const a1=(-90+i*45-22.5)*Math.PI/180, a2=(-90+i*45+22.5)*Math.PI/180;
    const fill=r.isGood?'rgba(126,226,168,.30)':r.isBad?'rgba(255,110,110,.28)':'rgba(255,255,255,.04)';
    const p=`M${cx+r1*Math.cos(a1)},${cy+r1*Math.sin(a1)} L${cx+r2*Math.cos(a1)},${cy+r2*Math.sin(a1)} A${r2},${r2} 0 0 1 ${cx+r2*Math.cos(a2)},${cy+r2*Math.sin(a2)} L${cx+r1*Math.cos(a2)},${cy+r1*Math.sin(a2)} A${r1},${r1} 0 0 0 ${cx+r1*Math.cos(a1)},${cy+r1*Math.sin(a1)} Z`;
    paths+=`<path d="${p}" fill="${fill}" stroke="rgba(255,255,255,.18)" stroke-width="1"/>`;
    const am=(-90+i*45)*Math.PI/180, rl=(r1+r2)/2;
    const col=r.isGood?'#7ee2a8':r.isBad?'#ff8f8f':'#b9aed6';
    paths+=`<text x="${cx+rl*Math.cos(am)}" y="${cy+rl*Math.sin(am)-6}" text-anchor="middle" font-size="11" fill="${col}" font-weight="bold">${r.dir}</text>`;
    paths+=`<text x="${cx+rl*Math.cos(am)}" y="${cy+rl*Math.sin(am)+8}" text-anchor="middle" font-size="9" fill="${col}">${KYUSEI[r.star-1].slice(0,2)}</text>`;
  });
  return `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="${esc(title)}">
    <circle cx="${cx}" cy="${cy}" r="${r2}" fill="rgba(0,0,0,.2)"/>${paths}
    <circle cx="${cx}" cy="${cy}" r="${r1-2}" fill="rgba(0,0,0,.35)" stroke="rgba(240,199,94,.5)"/>
    <text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="11" fill="#f0c75e">${esc(title)}</text>
  </svg>`;
}

function renderAll(p){
  const num=calcNumerology(p);
  const houi=calcHoui(p);
  const z=calcZodiac(p);
  const maya=calcMaya(p);
  const roku=calcRokusei(p);
  const zoku=calcZokusei(p,p.blood);
  const daily=calcDaily(p);
  const name=p.name?`${esc(p.name)}さん`:'あなた';

  $('profile-summary').textContent=`${p.name?p.name+'さん ':''}${p.y}年${p.m}月${p.d}日生まれ${p.blood?' / '+p.blood+'型':''}`;

  /* --- 総合 --- */
  const goodDirs=houi.bothGood.length?houi.bothGood.join('・'):'なし(移動は近場でリフレッシュを)';
  const phase=PHASES[roku.phaseIdx];
  $('tab-sougou').innerHTML=`
   <div class="card">
    <h2>✦ ${name}の運命プロフィール</h2>
    <div class="grid2">
      <div class="mini" data-jump="suuhi"><div class="t">数秘術 ライフパス</div><div class="v">${num.lp}</div><div class="s">${esc(LIFEPATH[num.lp].kw)}</div></div>
      <div class="mini" data-jump="seiza"><div class="t">太陽星座</div><div class="v">${z.name}</div><div class="s">${esc(z.kw)}</div></div>
      <div class="mini" data-jump="houi"><div class="t">九星気学 本命星</div><div class="v">${KYUSEI[houi.my-1]}</div><div class="s">吉方位の基準になる星</div></div>
      <div class="mini" data-jump="maya"><div class="t">マヤ暦</div><div class="v">${maya.special?'特別な日':'KIN '+maya.kin}</div><div class="s">${maya.special?'2/29生まれ':esc(SEALS[maya.seal].n)}</div></div>
      <div class="mini" data-jump="rokusei"><div class="t">六星占術</div><div class="v">${roku.star}${roku.sign.slice(0,1)}</div><div class="s">${roku.nowYear}年は「${phase[0]}」</div></div>
      <div class="mini" data-jump="zokusei"><div class="t">神社属性</div><div class="v">${zoku.unknown?'血液型未設定':zoku.attr+'属性'}</div><div class="s">${zoku.unknown?'プロフィールで設定できます':esc(ZOKUSEI_INFO[zoku.attr].kw)}</div></div>
      <div class="mini" data-jump="mbti"><div class="t">性格タイプ</div><div class="v">${p.mbti&&MBTI_TYPES[p.mbti]?p.mbti:'未診断'}</div><div class="s">${p.mbti&&MBTI_TYPES[p.mbti]?esc(MBTI_TYPES[p.mbti].label):'「性格タイプ」タブで診断できます'}</div></div>
      <div class="mini" data-jump="suuhi"><div class="t">${num.pyYear}年のテーマ</div><div class="v">パーソナルイヤー${num.py}</div><div class="s">${esc(PERSONAL_YEAR[num.py].split('。')[0])}</div></div>
    </div>
   </div>
   <div class="card">
    <h2>☀ 今日の運勢 <span style="font-size:.72rem;color:var(--sub)">${new Date().getMonth()+1}/${new Date().getDate()}</span></h2>
    <div class="fortune-row"><span>総合運</span><span class="stars5">${starBar(daily.total)}</span></div>
    <div class="fortune-row"><span>恋愛・対人運</span><span class="stars5">${starBar(daily.love)}</span></div>
    <div class="fortune-row"><span>仕事・学び運</span><span class="stars5">${starBar(daily.work)}</span></div>
    <div class="fortune-row"><span>金運</span><span class="stars5">${starBar(daily.money)}</span></div>
    <div class="fortune-row"><span>健康運</span><span class="stars5">${starBar(daily.health)}</span></div>
    <h3>今日のひとことアドバイス</h3>
    <p class="desc">${esc(daily.advice)}</p>
    <div class="spot-tags">
      <span class="badge">ラッキーカラー:${esc(daily.color)}</span>
      <span class="badge">ラッキーナンバー:${daily.num}</span>
      <span class="badge">開運アクション:${esc(daily.item)}</span>
    </div>
    ${omamoriHTML(p)}
   </div>
   <div class="card">
    <h2>🧭 今月のパワーチャージ方位</h2>
    <p class="desc">年盤・月盤ともに吉となる方位:<span class="good">${esc(goodDirs)}</span></p>
    <p class="note">自宅を起点に、吉方位への旅行・参拝・食事で「祐気取り」を。詳しくは「吉方位」タブへ。</p>
   </div>`;

  /* --- 数秘術 --- */
  const lp=LIFEPATH[num.lp], bd=LIFEPATH[num.bd]||LIFEPATH[reduceAll(num.bd)];
  $('tab-suuhi').innerHTML=`
   <div class="card">
    <h2>数秘術 ─ ライフパスナンバー</h2>
    <div class="big-result">${num.lp}${num.lp>9?' <span style="font-size:.8rem">(マスターナンバー)</span>':''}</div>
    <div class="kw">${esc(lp.kw)}</div>
    <p class="desc">${esc(lp.d)}</p>
    <h3>開運アドバイス</h3>
    <p class="desc">${esc(lp.adv)}</p>
   </div>
   <div class="card">
    <h2>バースデーナンバー</h2>
    <div class="big-result">${num.bd}</div>
    <div class="kw">${esc(bd.kw)}</div>
    <p class="desc">生まれた「日」が示す、あなたの才能・強みの数字です。${esc(bd.d)}</p>
   </div>
   <div class="card">
    <h2>${num.pyYear}年のパーソナルイヤー</h2>
    <div class="big-result">${num.py}</div>
    <p class="desc">${esc(PERSONAL_YEAR[num.py])}</p>
    <p class="note">パーソナルイヤーは9年周期で巡る「その年のテーマ」。1が始まり、9が締めくくりの年です。</p>
   </div>`;

  /* --- 吉方位 --- */
  const dirRow=(res)=>res.map(r=>{
    const mark=r.isGood?'<span class="good">吉方位 ◎</span>':r.isBad?`<span class="bad">凶方位 ✕</span> <span class="note">(${r.reasons.join('・')})</span>`:'<span class="flat">平(普通)</span>';
    return `<tr><td>${r.dir}</td><td>${KYUSEI[r.star-1]}</td><td>${mark}</td></tr>`;
  }).join('');
  const monthName=['2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','1月'][houi.mIdx];
  $('tab-houi').innerHTML=`
   <div class="card">
    <h2>九星気学 ─ あなたの本命星</h2>
    <div class="big-result">${KYUSEI[houi.my-1]}</div>
    <p class="desc">${esc(KYUSEI_DESC[houi.my])}</p>
    <p class="note">吉方位に使える星:${LUCKY_STARS[houi.my].map(s=>KYUSEI[s-1]).join('・')}</p>
   </div>
   <div class="card">
    <h2>🧭 ${houi.effY}年(${ETO[houi.yBranch]}年)の方位盤</h2>
    <div class="compass-box">
      <figure>${compassSVG(houi.yearRes,houi.effY+'年 年盤')}<figcaption>年盤(中宮:${KYUSEI[houi.yCenter-1]})</figcaption></figure>
      <figure>${compassSVG(houi.monthRes,monthName+' 月盤')}<figcaption>今月の月盤(中宮:${KYUSEI[houi.mCenter-1]})</figcaption></figure>
    </div>
    <h3>今年の年盤(引越し・長期滞在に影響)</h3>
    <table class="dir-list">${dirRow(houi.yearRes)}</table>
    <h3>今月の月盤(旅行・お出かけに影響)</h3>
    <table class="dir-list">${dirRow(houi.monthRes)}</table>
    <h3>今月ダブルで吉の方位</h3>
    <p class="desc"><span class="good">${houi.bothGood.length?houi.bothGood.join('・'):'今月はありません。凶方位を避けるだけでも十分な開運になります。'}</span></p>
   </div>
   <div class="card">
    <h2>祐気取りのコツ</h2>
    <p class="desc">吉方位へ出かけて良い気を取り込むことを「祐気取り」といいます。</p>
    <p class="desc">・日帰りなら自宅から<b>50km以上</b>、宿泊を伴うとさらに効果的とされます<br>
    ・現地では<b>温泉に入る・地のものを食べる・神社に参拝する</b>のが定番<br>
    ・引越しなど長期の移動は<b>年盤・月盤の両方が吉</b>の方位が理想です</p>
    <p class="note">方位は自宅(生活の本拠)を中心に測ります。凶方位(五黄殺・暗剣殺・本命殺・本命的殺・歳破/月破)への大きな移動は避けるのが吉とされます。節入り日は略算のため実際と±1日ずれる場合があります。</p>
   </div>`;

  /* --- 星占い --- */
  $('tab-seiza').innerHTML=`
   <div class="card">
    <h2>西洋占星術 ─ 太陽星座</h2>
    <div class="big-result">${z.name} <span style="font-size:.85rem;color:var(--sub)">${z.en}</span></div>
    <div class="kw">${esc(z.kw)}</div>
    <p class="desc">${esc(z.d)}</p>
    <div class="spot-tags">
      <span class="badge">エレメント:${z.el}</span>
      <span class="badge">守護星:${z.ruler}</span>
    </div>
    <h3>エレメント「${z.el}」の性質</h3>
    <p class="desc">${{'火':'情熱と行動のエレメント。直感的に動き、周囲を鼓舞する炎の力を持ちます。','地':'現実と安定のエレメント。五感と実務能力に優れ、形あるものを築きます。','風':'知性と交流のエレメント。情報とコミュニケーションで世界を広げます。','水':'感情と共感のエレメント。人の心に寄り添い、深い絆を育みます。'}[z.el]}</p>
    <h3>相性の良い星座</h3>
    <p class="desc">${ZODIAC.filter(o=>o.el===z.el&&o.name!==z.name).map(o=>o.name).join('・')}(同じエレメント)、および${{'火':'風','風':'火','地':'水','水':'地'}[z.el]}のエレメントの星座と好相性です。</p>
    <p class="note">太陽星座は「人生の目的・基本性格」を表します。本格的なホロスコープでは月星座やアセンダントも重要です(今後のアップデートで対応予定)。</p>
   </div>`;

  /* --- マヤ暦 --- */
  if(maya.special){
    $('tab-maya').innerHTML=`<div class="card"><h2>マヤ暦(ツォルキン)</h2>
      <div class="big-result">フナブ・クの日</div>
      <p class="desc">2月29日生まれのあなたは、ドリームスペルでは「時間をはずした特別な日」に相当し、KINを持たない稀有な存在とされます。260のエネルギーすべてと自由につながれる、枠を超えた魂の持ち主です。</p></div>`;
  }else{
    const s=SEALS[maya.seal], ws=SEALS[maya.wsSeal], op=SEALS[maya.oppSeal];
    $('tab-maya').innerHTML=`
     <div class="card">
      <h2>マヤ暦(ツォルキン) ─ あなたのKIN</h2>
      <div class="big-result">KIN ${maya.kin}</div>
      <div class="kw">${esc(s.n)} × 音${maya.tone}</div>
      <p class="desc">マヤの聖なる暦ツォルキンは260日周期。あなたは260通りのエネルギーのうち「KIN${maya.kin}」の日に生まれました。</p>
     </div>
     <div class="card">
      <h2>太陽の紋章「${esc(s.n)}」</h2>
      <div class="kw">${esc(s.kw)}</div>
      <p class="desc">${esc(s.d)}</p>
      <h3>銀河の音「${maya.tone}」 ─ ${esc(TONES[maya.tone-1])}</h3>
      <p class="desc">${['明確な目的を掲げてまっすぐ進む、始まりのエネルギー。','あえて課題に向き合い、二極の間で学ぶエネルギー。','人と人をつなぎ、奉仕することで輝くエネルギー。','形を定め、土台を整える職人のエネルギー。','中心で輝き、周囲に力を与えるエネルギー。','等身大のリズムで着実に整えるエネルギー。','調律のアンテナで場を整えるミスティックなエネルギー。','調和とバランスの中で人望を集めるエネルギー。','強い意図で物事を実らせる脈動のエネルギー。','思いを形にして表明する仕上げのエネルギー。','古いものを解放し、風通しを良くするエネルギー。','人と協力し、まとめ上げる知恵のエネルギー。','存在そのもので場を変える、超越のエネルギー。'][maya.tone-1]}</p>
      <h3>ウェイブスペル「${esc(ws.n)}」</h3>
      <p class="desc">潜在意識のテーマは「${esc(ws.kw)}」。${esc(ws.d)}</p>
      <h3>反対KIN「${esc(op.n)}」(KIN${maya.opp})</h3>
      <p class="desc">あなたに無い視点を教えてくれる学びの相手。「${esc(op.kw)}」のエネルギーを持つ人から気づきをもらえます。</p>
      <p class="note">本アプリのKINはドリームスペル(アグエイアス版)の計算法に準拠しています。</p>
     </div>`;
  }

  /* --- 六星占術 --- */
  const phaseRows=PHASES.map((ph,i)=>{
    const y=roku.nowYear+((i-roku.phaseIdx)+12)%12;
    const mark=['<span class="bad">✕</span>','<span class="flat">△</span>','<span class="flat">○</span>','<span class="good">◎</span>'][ph[2]];
    return `<tr class="${i===roku.phaseIdx?'phase-now':''}"><td>${y}年</td><td><b>${ph[0]}</b> ${mark}</td><td>${ph[1]}</td></tr>`;
  }).join('');
  $('tab-rokusei').innerHTML=`
   <div class="card">
    <h2>六星占術 ─ あなたの運命星</h2>
    <div class="big-result">${roku.star} ${roku.sign}</div>
    <p class="desc">${esc(ROKUSEI_DESC[roku.star])}</p>
    <p class="note">星数:${roku.n}(生年月日の干支から算出した簡易計算です)</p>
   </div>
   <div class="card">
    <h2>${roku.nowYear}年(${ETO[roku.nb]}年)の運気:「${PHASES[roku.phaseIdx][0]}」</h2>
    <p class="desc">${esc(PHASES[roku.phaseIdx][1])}。${PHASES[roku.phaseIdx][2]===0?'大殺界の期間は新規スタートより「守り・整理・学び」に力を注ぐと、明けてから大きく飛躍できます。':PHASES[roku.phaseIdx][2]===3?'運気の追い風が吹いています。チャレンジするなら今です。':'足元を固めながら、次の好機に備えましょう。'}</p>
    <h3>これから12年の運気カレンダー</h3>
    <table class="phase-table">${phaseRows}</table>
    <p class="note">「陰影・停止・減退」の3年間が大殺界、「乱気」は小殺界とされます。運気表は年単位の簡易版です(本来は月運も加味します)。</p>
   </div>`;

  /* --- 神社属性 --- */
  if(zoku.unknown){
    const cand=['A','B','AB','O'].map(b=>{
      const r=calcZokusei(p,b);
      return `<tr><td>${b}型</td><td><b>${r.attr}属性</b></td><td>${esc(ZOKUSEI_INFO[r.attr].kw)}</td></tr>`;
    }).join('');
    $('tab-zokusei').innerHTML=`
     <div class="card">
      <h2>神社属性(繭気属性)診断</h2>
      <p class="desc">生年月日の数字を合計した基本数はあなたの場合「<b>${zoku.base}</b>」。ここに血液型の数(A=1/B=2/AB=3/O=4)を足して属性を出します。血液型を設定すると確定します。</p>
      <table class="dir-list">${cand}</table>
      <button class="btn btn-ghost" onclick="editProfile()">血液型を設定する</button>
     </div>`;
  }else{
    const zi=ZOKUSEI_INFO[zoku.attr];
    $('tab-zokusei').innerHTML=`
     <div class="card">
      <h2>神社属性(繭気属性)診断</h2>
      <div class="big-result">${zoku.attr}属性</div>
      <div class="kw">${esc(zi.kw)}</div>
      <p class="desc">${esc(zi.d)}</p>
      <h3>相性の良いパワースポットのタイプ</h3>
      <p class="desc">${esc(zi.spots)}</p>
      <h3>属性の相性</h3>
      <p class="desc">
        <span class="good">◎ 相性が良い属性:</span>${zoku.attr}(同属性)・${zi.good.join('・')}<br>
        <span class="bad">△ 気が合いにくい属性:</span>${zi.bad.join('・')}
      </p>
      <p class="note">計算方法:生年月日の全数字の合計を一桁にした「${zoku.base}」+血液型(${p.blood}型=${BLOOD_NUM[p.blood]})=「${zoku.n}」→ ${zoku.attr}属性。<br>伊勢神宮・出雲大社などの別格の聖地は、属性を問わず誰が訪れても良いとされています。属性はあくまで楽しむための目安で、惹かれた場所こそがあなたのパワースポットです。</p>
     </div>`;
  }

  renderMbtiTab(p);
  CURRENT={p,num,houi,z,maya,roku,zoku,daily};
}

/* ================================================================
   画面制御
================================================================ */
const STORAGE_KEY='kaiun-compass-profile';
function initSelects(){
  const ys=$('in-year'),ms=$('in-month'),ds=$('in-day');
  const thisYear=new Date().getFullYear();
  for(let y=thisYear;y>=1920;y--)ys.insertAdjacentHTML('beforeend',`<option value="${y}">${y}年</option>`);
  for(let m=1;m<=12;m++)ms.insertAdjacentHTML('beforeend',`<option value="${m}">${m}月</option>`);
  for(let d=1;d<=31;d++)ds.insertAdjacentHTML('beforeend',`<option value="${d}">${d}日</option>`);
  ys.value=1990;ms.value=1;ds.value=1;
}
function saveProfile(){
  const p={
    name:$('in-name').value.trim(),
    y:+$('in-year').value,m:+$('in-month').value,d:+$('in-day').value,
    blood:$('in-blood').value||'',
    mbti:$('in-mbti').value||''
  };
  const dim=new Date(p.y,p.m,0).getDate();
  if(p.d>dim){alert(`${p.y}年${p.m}月は${dim}日までです。日付を確認してください。`);return;}
  localStorage.setItem(STORAGE_KEY,JSON.stringify(p));
  ritualOverlay('星々に、あなたの運命を問いかけています…',1400,()=>showResult(p));
}
function editProfile(){
  const p=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
  if(p){$('in-name').value=p.name||'';$('in-year').value=p.y;$('in-month').value=p.m;$('in-day').value=p.d;$('in-blood').value=p.blood||'';$('in-mbti').value=p.mbti&&MBTI_TYPES[p.mbti]?p.mbti:'';}
  $('screen-result').classList.add('hidden');
  $('screen-input').classList.remove('hidden');
  window.scrollTo(0,0);
}
function showResult(p){
  $('screen-input').classList.add('hidden');
  $('screen-result').classList.remove('hidden');
  renderAll(p);
  applyTabPrefs();
  window.scrollTo(0,0);
}
document.getElementById('tabbar').addEventListener('click',e=>{
  const btn=e.target.closest('.tab');if(!btn)return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===btn));
  document.querySelectorAll('.tabpane').forEach(s=>s.classList.toggle('hidden',s.id!=='tab-'+btn.dataset.tab));
  if(btn.dataset.tab==='chat')chatWelcome();
  window.scrollTo(0,0);
});
/* ================================================================
   相性診断(描画)
================================================================ */
const PARTNER_KEY='kaiun-compass-partner';
const REL_ADVICE={
 love:['恋愛・夫婦','恋の縁は、点数では決まりません。違いを「直したいもの」ではなく「愛でたいもの」として眺められた時、二人の物語は深まっていきます。'],
 friend:['友情','友の縁は、会う頻度より心の濃度。会わない時間も含めて育つのが、本物の友情です。'],
 work:['仕事','仕事の縁は、違いこそが戦力。占いが示した凸凹を役割分担に変えられれば、二人の成果は一人の何倍にもなります。'],
 family:['家族','家族の縁は、選べないからこそ尊いもの。近い関係だからこそ、一歩ぶんの敬意と「ありがとう」を。'],
 nigate:['苦手な相手','無理に好きになる必要はありません。大切なのは、あなたが消耗しない距離感と境界線。合わない部分は「そういう人」と知っておくだけで、心はずっと楽になります。']
};
function ritualOverlay(msg,ms,cb){
  const ov=document.createElement('div');
  ov.className='ritual-overlay';
  ov.innerHTML=`<div class="ritual-star">✦</div><p>${esc(msg)}</p>`;
  document.body.appendChild(ov);
  setTimeout(()=>{
    if(cb)cb();
    ov.classList.add('fade');
    setTimeout(()=>ov.remove(),480);
  },ms);
}
function ringGauge(pct){
  const r=62,c=+(2*Math.PI*r).toFixed(1);
  const filled=+(c*pct/100).toFixed(1);
  return `<svg viewBox="0 0 160 160" width="170" height="170" style="margin:8px auto;display:block" role="img" aria-label="縁の強さ${pct}">
   <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#f0c75e"/>
   </linearGradient></defs>
   <circle cx="80" cy="80" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="10"/>
   <circle cx="80" cy="80" r="${r}" fill="none" stroke="url(#gg)" stroke-width="10" stroke-linecap="round"
     stroke-dasharray="${filled} ${c}" transform="rotate(-90 80 80)"/>
   <text x="80" y="78" text-anchor="middle" font-size="32" fill="#f0c75e" font-weight="bold">${pct}</text>
   <text x="80" y="100" text-anchor="middle" font-size="11" fill="#b9aed6">縁の強さ</text>
  </svg>`;
}
function initAishou(){
  $('pt-year').innerHTML=$('in-year').innerHTML;
  $('pt-month').innerHTML=$('in-month').innerHTML;
  $('pt-day').innerHTML=$('in-day').innerHTML;
  $('pt-blood').innerHTML=$('in-blood').innerHTML;
  $('pt-mbti').innerHTML=$('in-mbti').innerHTML;
  $('pt-mbti').options[0].text='わからない・未選択';
  $('pt-year').value=1990;$('pt-month').value=1;$('pt-day').value=1;
  const sv=JSON.parse(localStorage.getItem(PARTNER_KEY)||'null');
  if(sv&&sv.y){
    $('pt-name').value=sv.name||'';$('pt-year').value=sv.y;$('pt-month').value=sv.m;$('pt-day').value=sv.d;
    $('pt-blood').value=sv.blood||'';$('pt-mbti').value=sv.mbti&&MBTI_TYPES[sv.mbti]?sv.mbti:'';$('pt-rel').value=sv.rel||'love';
  }
}
function runAishou(){
  const pt={
    name:$('pt-name').value.trim(),
    y:+$('pt-year').value,m:+$('pt-month').value,d:+$('pt-day').value,
    blood:$('pt-blood').value||'',mbti:$('pt-mbti').value||'',rel:$('pt-rel').value
  };
  const dim=new Date(pt.y,pt.m,0).getDate();
  if(pt.d>dim){alert(`${pt.y}年${pt.m}月は${dim}日までです。日付を確認してください。`);return;}
  localStorage.setItem(PARTNER_KEY,JSON.stringify(pt));
  const me=JSON.parse(localStorage.getItem(STORAGE_KEY));
  ritualOverlay('星々に、二人の縁を問いかけています…',1700,()=>{
    renderAishou(me,pt);
    $('aishou-result').scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function renderAishou(me,pt){
  const r=calcAishou(me,pt);
  const nameA=me.name?esc(me.name)+'さん':'あなた';
  const nameB=pt.name?esc(pt.name)+'さん':'お相手';
  const rel=REL_ADVICE[pt.rel]||REL_ADVICE.love;
  const max=r.items.reduce((a,b)=>b.score>a.score?b:a);
  const min=r.items.reduce((a,b)=>b.score<a.score?b:a);
  $('aishou-result').innerHTML=`
   <div class="card" style="text-align:center">
    <h2>✦ 縁の総合鑑定 ✦</h2>
    <p class="section-lead">${nameA} × ${nameB}(${rel[0]}の縁)</p>
    ${ringGauge(r.total)}
    <div class="big-result" style="font-size:1.25rem">${r.verdict}</div>
    <p class="note">${r.items.length}つの占術による総合鑑定です</p>
   </div>
   <div class="card">
    <h2>占術ごとの縁</h2>
    ${r.items.map(it=>`
     <div class="aishou-item">
      <div class="ai-head"><span>${it.icon} ${it.sys}</span><span class="ai-score">${it.score}</span></div>
      <div class="ai-bar"><div style="width:${it.score}%"></div></div>
      <div class="ai-title">${esc(it.title)}</div>
      <p class="desc">${esc(it.text)}</p>
     </div>`).join('')}
    ${(!me.blood||!pt.blood)?'<p class="note">※二人の血液型が分かると「神社属性」の相性も加わります。</p>':''}
    ${(!me.mbti||!pt.mbti)?'<p class="note">※二人の性格タイプが分かると「16タイプ」の相性も加わります。</p>':''}
   </div>
   <div class="card">
    <h2>二人への縁のことば</h2>
    <p class="desc" style="font-family:'Yu Mincho','Hiragino Mincho ProN',serif;font-size:1rem;color:var(--gold-dim)">『${esc(r.en)}』</p>
    <h3>この縁の活かし方</h3>
    <p class="desc">二人のいちばんの強みは、「${max.sys}」が示す${esc(max.title)}。いっぽう「${min.sys}」のテーマは、二人の伸びしろです。${esc(rel[1])}</p>
    <p class="note">相性は「決まった答え」ではなく「二人の取扱説明書」。低い数字は悪い印ではなく、伸びしろの在り処です。</p>
   </div>
   ${buildCaptureGuide(me,pt,pt.rel)}`;
}

initSelects();
initChat();
initAishou();
(function(){
  const p=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
  if(p&&p.y)showResult(p);
})();
