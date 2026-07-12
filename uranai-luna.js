
'use strict';
/* ================================================================
   uranai-luna.js ─ 開運相談室ルナ 会話文脈機能
   uranai-data.js の botReply / chatAdd をラップして
   「話題の記憶・深掘り・繰り返し検出・履歴の永続化」を追加する。
   (data.js / plus.js は編集せず、この読み込み順で差し込む)
================================================================ */
const LUNA_CHAT_KEY='kaiun-compass-chat';
const LUNA_CTX={lastTopic:null,counts:{},deep:0};

/* --- 話題判定(data.js botReply と同じ判定順序・同じパターンを再現) --- */
function lunaTopicOf(q){
  if(/おはよう|こんにちは|こんばんは|はじめまして|やっほ|ハロー|hello/i.test(q))return null;
  if(/ありがとう|感謝|助かっ/.test(q))return null;
  if(/大殺界|殺界/.test(q))return 'daisakkai';
  if(/相性/.test(q))return 'aishou';
  if(/旅行|旅先|お出かけ|おでかけ|温泉|どこ.*行/.test(q))return 'travel';
  if(/方位|方角|引っ越し|引越/.test(q))return 'houi';
  if(/恋愛|恋|結婚|出会い|片思い|パートナー/.test(q))return 'love';
  if(/仕事|転職|勉強|試験|資格|昇進|キャリア/.test(q))return 'work';
  if(/金運|お金|宝くじ|貯金|投資|臨時収入/.test(q))return 'money';
  if(/健康|体調|疲れ|睡眠/.test(q))return 'health';
  if(/パワースポット|神社|属性|参拝|お参り|お寺/.test(q))return 'spot';
  if(/マヤ|kin|紋章|ツォルキン/i.test(q))return 'maya';
  if(/数秘|ライフパス|ナンバー/.test(q))return 'suuhi';
  if(/性格|タイプ|MBTI|診断/i.test(q))return 'mbti';
  if(/今日|運勢|占って|ラッキー/.test(q))return 'daily';
  return null;
}
/* 短い追撃(深掘り要求)かどうか */
function lunaIsDig(q){
  if(q.length>14)return false;
  if(lunaTopicOf(q))return false;
  return /もっと|詳しく|くわしく|深く|続き|他には|ほかには|それで|なんで|なぜ|どうして|例えば/.test(q);
}
/* --- 決定論ピック(同じ人・同じ日なら同じものを返す) --- */
function lunaDayKey(){const t=new Date();return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate();}
function lunaSeedPick(arr,tag,p){return arr[hashStr(tag+'|'+lunaDayKey()+'|'+p.y+'-'+p.m+'-'+p.d)%arr.length];}

/* --- 深掘り用アクションプール --- */
const LUNA_ACTS={
 love:[
  '気になる人に「おはよう」か「おつかれさま」を一言だけ送ってみて。',
  '鏡の前で口角を上げてから出かけると、ご縁のアンテナが立ちます。',
  '今週ひとつ、初めての場所でお茶をしてみて。出会いの風が動きます。',
  '爪や靴先など「先端」を整えると、恋の運気が磨かれますよ。',
  '今日は聞き役に徹してみて。距離がすっと縮まります。'],
 work:[
  '最重要タスクをひとつだけ決めて、朝いちばんに着手してみて。',
  '机の右上を片づけると、仕事運の風通しが良くなりますよ。',
  '尊敬する人の仕事ぶりをひとつだけ真似してみて。学びが実ります。',
  '終業前の五分で明日の段取りを書くと、流れが整います。',
  '今日は誰かの仕事をひとつ褒めてみて。巡り巡って評価が返ります。'],
 money:[
  'お財布からレシートを出して、お札の向きを揃えて入れ直してみて。',
  '玄関のたたきを拭くと、金運の通り道がきれいになりますよ。',
  '今日使ったお金にひとつ「ありがとう」と思い返してみて。',
  '小銭をひとつ募金箱へ。手放した分だけ巡りが良くなります。',
  '欲しいものは一晩寝かせてから。良いお金の流れが育ちます。']
};

/* --- 深掘りビルダー(主要7話題) --- */
const LUNA_DEEP={
 love:function(c){
  const z=c.z,pairEl={'火':'風','風':'火','地':'水','水':'地'}[z.el];
  const mates=ZODIAC.filter(o=>(o.el===z.el&&o.name!==z.name)||o.el===pairEl).map(o=>o.name).join('・');
  let s='もっと知りたいんですね✦ 恋の星を、さらに深く読んでみます。';
  s+='\n◆ 好相性の星座:'+z.name+'のあなたは、同じ'+z.el+'のエレメントと支え合う'+pairEl+'のエレメント ─ '+mates+'と自然に波長が合います。';
  if(!c.maya.special&&typeof SEALS!=='undefined'&&SEALS[c.maya.seal])
    s+='\n◆ 愛し方のかたち:太陽の紋章「'+SEALS[c.maya.seal].n+'」のあなたは、「'+SEALS[c.maya.seal].kw+'」の心で愛を育む人です。';
  s+='\n◆ 今週の恋愛アクション:'+lunaSeedPick(LUNA_ACTS.love,'deep-love',c.p);
  return s;
 },
 work:function(c){
  const my=c.houi.my;
  let s='いいですね、その向上心✦ 仕事の星を深く読んでみます。';
  s+='\n◆ あなたの強み:本命星'+KYUSEI[my-1]+'は、'+KYUSEI_DESC[my];
  s+='\n◆ 今年の攻め方:'+c.num.pyYear+'年のあなたはパーソナルイヤー'+c.num.py+'。'+PERSONAL_YEAR[c.num.py];
  s+='\n◆ 今日の実践:'+lunaSeedPick(LUNA_ACTS.work,'deep-work',c.p);
  return s;
 },
 money:function(c){
  const idx=c.roku.phaseIdx,now=c.roku.nowYear,zaiY=now+((7-idx)+12)%12,rest=zaiY-now;
  let s='金運のお話、さらに深くお伝えしますね✦';
  s+='\n◆ 財成イヤー:'+(rest===0?'なんと今年('+now+'年)がまさに「財成」。実利を固める絶好期です。':zaiY+'年('+(rest===1?'来年':'あと'+rest+'年')+')が金運上昇の「財成」イヤー。それまでは土台づくりが吉です。');
  if(typeof LUNA_EXT!=='undefined'&&LUNA_EXT.moneyByLp&&LUNA_EXT.moneyByLp[c.num.lp])
    s+='\n◆ ライフパス'+c.num.lp+'の貯め方:'+LUNA_EXT.moneyByLp[c.num.lp];
  s+='\n◆ 今日の金運アクション:'+lunaSeedPick(LUNA_ACTS.money,'deep-money',c.p);
  return s;
 },
 health:function(c){
  const idx=c.roku.phaseIdx,now=c.roku.nowYear,kenY=now+((3-idx)+12)%12;
  let s='お体のこと、大切に思っているんですね✦ もう少し深く読んでみます。';
  if(!c.zoku.unknown&&typeof LUNA_EXT!=='undefined'&&LUNA_EXT.healthByAttr&&LUNA_EXT.healthByAttr[c.zoku.attr])
    s+='\n◆ '+c.zoku.attr+'属性のリフレッシュ法:'+LUNA_EXT.healthByAttr[c.zoku.attr];
  s+='\n◆ 六星の「健弱」:'+(kenY===now?'今年('+now+'年)がちょうど「健弱」の年。健康診断と休息をいつもより丁寧に。':'次の「健弱」は'+kenY+'年。その年は予定を詰め込みすぎないよう、心に留めておいてくださいね。');
  if(typeof pickOmamori==='function'){const o=pickOmamori(c.p);s+='\n◆ こころのお守り:'+o.n+' ─ '+o.s;}
  return s;
 },
 houi:function(c){
  const yb=c.houi.yearRes.filter(r=>r.isBad).map(r=>r.dir+'('+r.reasons.join('・')+')');
  const mg=c.houi.monthRes.filter(r=>r.isGood).map(r=>r.dir);
  let s='方位のこと、さらに詳しくお伝えしますね✦';
  s+='\n◆ 今年注意したい方角:'+(yb.length?yb.join('、')+'。引っ越しなど長期の移動では避けるのが無難です。':'今年は大きな凶方位が目立ちません。のびのび動ける年です。');
  s+='\n◆ 今月の吉方位:'+(mg.length?mg.join('・')+'。近場のお出かけならこちらへ。':'今月はお休み。来月の巡りに期待しましょう。');
  s+='\n◆ 祐気取りのコツ:吉方位では「その土地の水を飲む・温泉に入る・旬のものを食べる」の三つが基本。ゆっくり滞在するほど良いとされていますよ。';
  return s;
 },
 daisakkai:function(c){
  const idx=c.roku.phaseIdx,now=c.roku.nowYear,to=k=>now+((k-idx)+12)%12;
  const rikka=to(2),tassei=to(4);
  let s='大殺界のこと、もう少し深くお話ししますね✦';
  s+='\n◆ 12年の流れ:今年の'+c.roku.star+'は「'+PHASES[idx][0]+'」。絶好調期は、立花が'+(rikka===now?'今年('+now+'年)':rikka+'年')+'、達成が'+(tassei===now?'今年('+now+'年)':tassei+'年')+'。ここに向けて計画を立てるのが六星の知恵です。';
  s+='\n◆ 大殺界の過ごし方三箇条:一、新しい大勝負(転職・起業・大きな買い物)は控えめに。二、学び・整理・体調管理など「守りの充実」に徹する。三、焦らないこと。明けた年の追い風が、その分大きくなります。';
  return s;
 },
 daily:function(c){
  const d=c.daily;
  const cats=[['恋愛・対人',d.love],['仕事・学び',d.work],['金運',d.money],['健康',d.health]];
  cats.sort((a,b)=>b[1]-a[1]);
  let s='今日という日を、もう一歩深く読んでみますね✦';
  s+='\n◆ いちばん輝いている星:今日は「'+cats[0][0]+'」('+starBar(cats[0][1])+')が主役。ここに力を注ぐと一日がうまく回ります。';
  s+='\n◆ 今日の開運アクション:「'+d.item+'」。小さなことですが、運の呼び水になりますよ。';
  if(typeof pickOmamori==='function'){const o=pickOmamori(c.p);s+='\n◆ こころのお守り:'+o.n+' ─ '+o.s;}
  return s;
 }
};

/* --- 繰り返し検出・深掘り打ち切り・タブ案内 --- */
const LUNA_REPEAT=[
 'さっきもお伝えしましたが…とても気になるんですね✦ 大切なことなので、もう一度。',
 'ふふ、二度目のご質問ですね。それだけ心に掛かっている証拠…改めてお伝えします✦',
 '同じ質問をいただくのは、真剣に向き合っている証。もう一度、星に聞いてみますね✦'
];
const LUNA_TABHINT={travel:'吉方位',aishou:'💞相性診断',spot:'神社属性',maya:'マヤ暦',suuhi:'数秘術',mbti:'性格タイプ'};
const LUNA_CUTOFF='ふふ、素敵な探究心です✦ でも今日はここまでにしましょう。星は毎日巡るので、明日になるとまた新しい顔を見せてくれます。また聞いてくださいね。';

/* --- botReply ラップ(初回回答は変えず、深掘り・繰り返しのみ追加) --- */
const lunaCore=botReply;
botReply=function(q){
  const c=CURRENT;
  if(!c)return lunaCore(q);
  const topic=lunaTopicOf(q);
  if(!topic&&LUNA_CTX.lastTopic&&lunaIsDig(q)){
    LUNA_CTX.deep++;
    if(LUNA_CTX.deep>=2)return LUNA_CUTOFF;
    const t=LUNA_CTX.lastTopic;
    if(LUNA_DEEP[t]){const s=LUNA_DEEP[t](c);if(s)return s;}
    if(LUNA_TABHINT[t])return 'その話題は奥が深いんです✦ 「'+LUNA_TABHINT[t]+'」タブにさらに詳しい読み解きを載せているので、じっくり眺めてみてくださいね。';
    return lunaCore(q);
  }
  let ans=lunaCore(q);
  if(topic){
    LUNA_CTX.counts[topic]=(LUNA_CTX.counts[topic]||0)+1;
    LUNA_CTX.lastTopic=topic;
    LUNA_CTX.deep=0;
    if(LUNA_CTX.counts[topic]>=2){
      const i=hashStr('rep|'+topic+'|'+LUNA_CTX.counts[topic]+'|'+c.p.y+'-'+c.p.m+'-'+c.p.d)%LUNA_REPEAT.length;
      ans=LUNA_REPEAT[i]+'\n'+ans;
    }
  }
  return ans;
};

/* --- 会話履歴の永続化(localStorage) --- */
function lunaProfileKey(){
  try{const p=JSON.parse(localStorage.getItem('kaiun-compass-profile')||'null');return (p&&p.y)?p.y+'-'+p.m+'-'+p.d:'';}catch(e){return '';}
}
function lunaLoadStore(){
  try{const st=JSON.parse(localStorage.getItem(LUNA_CHAT_KEY)||'null');return (st&&Array.isArray(st.log))?st:null;}catch(e){return null;}
}
let lunaRestoring=false;
const lunaChatAddCore=chatAdd;
chatAdd=function(text,who){
  lunaChatAddCore(text,who);
  if(lunaRestoring)return;
  try{
    const st=lunaLoadStore()||{pk:'',log:[]};
    st.pk=lunaProfileKey();
    st.log.push({w:who,x:text});
    while(st.log.length>40)st.log.shift();
    localStorage.setItem(LUNA_CHAT_KEY,JSON.stringify(st));
  }catch(e){}
};
function lunaClearChat(){
  try{localStorage.removeItem(LUNA_CHAT_KEY);}catch(e){}
  LUNA_CTX.lastTopic=null;LUNA_CTX.counts={};LUNA_CTX.deep=0;
  const log=document.getElementById('chat-log');
  if(log)log.innerHTML='';
  chatStarted=false;
}
/* 「履歴を消す」ボタン用:消去してすぐ初期挨拶からやり直す */
function lunaClearHistory(){
  lunaClearChat();
  if(typeof chatWelcome==='function')chatWelcome();
}
/* ページ読み込み時:履歴があれば復元して再訪挨拶(プロフィール不一致なら破棄) */
function lunaRestore(){
  const st=lunaLoadStore();
  if(!st||!st.log.length)return;
  if(st.pk!==lunaProfileKey()){try{localStorage.removeItem(LUNA_CHAT_KEY);}catch(e){}return;}
  lunaRestoring=true;
  try{
    st.log.forEach(m=>lunaChatAddCore(m.x,m.w));
    lunaChatAddCore('おかえりなさい✦ 前回の続きから、なんでも聞いてくださいね。','bot');
  }finally{lunaRestoring=false;}
  chatStarted=true;
}
document.addEventListener('DOMContentLoaded',function(){
  lunaRestore();
  /* プロフィール(生年月日)が変わったら履歴を破棄する */
  if(typeof saveProfile==='function'){
    const spCore=saveProfile;
    saveProfile=function(){
      const before=lunaProfileKey();
      spCore();
      const after=lunaProfileKey();
      if(after&&before!==after)lunaClearChat();
    };
  }
});
