'use strict';
/* ================================================================
   uranai-detail.js ─ 「🔮 さらに深く読む」カードの描画
   renderAll を関数再代入でラップ(luna.js と同じ方式)。
   コア描画のあとで各タブ末尾に深読みカードを追記する。
   DETAIL_A / DETAIL_B が未定義でも壊れないよう typeof でガード。
================================================================ */
function detailCard(e){
  if(!e)return '';
  const p=t=>'<p class="desc">'+(typeof esc==='function'?esc(t):t)+'</p>';
  return '<div class="card"><h2>🔮 さらに深く読む</h2>'
    +'<h3>性格の深層</h3>'+p(e.shin)
    +'<h3>恋愛・人間関係</h3>'+p(e.ai)
    +'<h3>仕事・お金</h3>'+p(e.shigoto)
    +'<h3>開運のヒント</h3>'+p(e.hint)
    +'</div>';
}
function detailAppend(id,e){
  if(!e)return;
  const el=document.getElementById(id);
  if(el)el.insertAdjacentHTML('beforeend',detailCard(e));
}
function detailRender(){
  const c=(typeof CURRENT!=='undefined')?CURRENT:null;
  if(!c)return;
  const A=(typeof DETAIL_A!=='undefined')?DETAIL_A:null;
  const B=(typeof DETAIL_B!=='undefined')?DETAIL_B:null;
  if(A&&A.suuhi&&c.num)      detailAppend('tab-suuhi',A.suuhi[c.num.lp]);
  if(A&&A.seiza&&c.z)        detailAppend('tab-seiza',A.seiza[c.z.name]);
  if(B&&B.kyusei&&c.houi)    detailAppend('tab-houi',B.kyusei[c.houi.my]);
  if(B&&B.rokusei&&c.roku)   detailAppend('tab-rokusei',B.rokusei[c.roku.star]);
  if(B&&B.zokusei&&c.zoku&&!c.zoku.unknown) detailAppend('tab-zokusei',B.zokusei[c.zoku.attr]);
  if(B&&B.maya&&c.maya&&!c.maya.special)    detailAppend('tab-maya',B.maya[c.maya.seal]);
}
/* renderAll をラップ:コア実行後に深読みカードを追記 */
if(typeof renderAll==='function'){
  const detailCore=renderAll;
  renderAll=function(p){
    detailCore(p);
    try{detailRender();}catch(e){}
  };
}
/* 初回描画対応:main.js 末尾の即時 showResult で既に CURRENT がある場合、
   ラップ前に一度描画済みなので、ここで一度だけ追記する。 */
if(typeof CURRENT!=='undefined'&&CURRENT){
  try{detailRender();}catch(e){}
}
