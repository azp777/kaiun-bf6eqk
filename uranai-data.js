
'use strict';
/* ================================================================
   共通ユーティリティ
================================================================ */
function jdn(y,m,d){
  const a=Math.floor((14-m)/12), y2=y+4800-a, m2=m+12*a-3;
  return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;
}
function digitSum(n){return String(n).split('').reduce((a,c)=>a+ +c,0);}
function reduceNum(n,keepMasters){
  while(n>9){
    if(keepMasters&&(n===11||n===22||n===33))return n;
    n=digitSum(n);
  }
  return n;
}
function reduceAll(n){while(n>9)n=digitSum(n);return n;}
function wrap9(v){return ((v-1)%9+9)%9+1;}
function isLeap(y){return (y%4===0&&y%100!==0)||y%400===0;}
function leapDaysUpTo(y,m,d){ // 西暦1年からその日までの2/29の個数
  const n=y-1;
  let c=Math.floor(n/4)-Math.floor(n/100)+Math.floor(n/400);
  if(isLeap(y)&&(m>2||(m===2&&d===29)))c++;
  return c;
}
function hashStr(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function starBar(n){return '★'.repeat(n)+'☆'.repeat(5-n);}
const ETO=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

/* ================================================================
   1. 数秘術
================================================================ */
const LIFEPATH={
 1:{kw:'開拓者・リーダー',d:'自分の道を切り拓くパイオニア。決断力と行動力に優れ、周囲を引っ張る力があります。',adv:'人に頼ることも強さのうち。独走しすぎず仲間の声にも耳を傾けて。'},
 2:{kw:'調和・サポーター',d:'繊細な感受性で人と人をつなぐ調停役。協調性と気配りの才能に恵まれています。',adv:'人に尽くしすぎて自分を後回しにしないこと。NOと言う練習を。'},
 3:{kw:'創造・表現者',d:'明るさと遊び心で場を華やがせるエンターテイナー。創作や発信で輝きます。',adv:'楽しさ優先で飽きっぽくなりがち。ひとつを深掘りすると大成します。'},
 4:{kw:'安定・建設者',d:'コツコツと土台を築く努力家。誠実さと継続力で確かな信頼を得るタイプです。',adv:'完璧主義になりすぎず、時には変化や遊びも受け入れて。'},
 5:{kw:'自由・冒険者',d:'変化と刺激を愛する自由人。行動範囲が広く、多彩な経験が人生の財産になります。',adv:'自由と無責任は紙一重。約束事だけは丁寧に守ると運気が安定します。'},
 6:{kw:'愛情・奉仕',d:'家族や仲間を守る愛情深い人。美的センスと責任感を併せ持ちます。',adv:'世話を焼きすぎて相手の成長機会を奪わないように。見守る愛も大切。'},
 7:{kw:'探求・職人',d:'本質を見抜く分析家。専門性を磨き、ひとりの時間から知恵を生み出します。',adv:'孤高になりすぎず、得た知恵を人に分かち合うと運が巡ります。'},
 8:{kw:'豊かさ・実現力',d:'目標を現実にするパワフルな実務家。組織やお金を動かす器の大きさがあります。',adv:'成果や地位だけでなく、過程で出会う人とのご縁を大事に。'},
 9:{kw:'博愛・賢者',d:'広い視野と共感力で人を癒やす成熟した魂。国際的な活動にも縁があります。',adv:'理想が高いぶん現実に失望しやすい面も。小さな一歩を評価して。'},
 11:{kw:'直感・メッセンジャー',d:'鋭いインスピレーションで人々に気づきを届けるスピリチュアルな資質。感受性が非常に豊かです。',adv:'感じ取りすぎて疲れたら休息を。直感は磨けば最強の武器になります。'},
 22:{kw:'ビジョン・大建築家',d:'大きな理想を現実の形にできる稀有な実現力の持ち主。スケールの大きな人生を歩みます。',adv:'力が大きいぶん焦りは禁物。長期戦で構えると偉業を成せます。'},
 33:{kw:'無償の愛・導師',d:'見返りを求めない愛で周囲を照らす、最も稀なマスターナンバー。存在そのものが癒やしになります。',adv:'背負いすぎないこと。自分自身を愛することが最初の使命です。'}
};
const PERSONAL_YEAR={
 1:'種まきとスタートの年。新しい挑戦を始めるのに最適です。',
 2:'協力と充電の年。焦らず人間関係とご縁を育てましょう。',
 3:'発展と表現の年。楽しむこと・発信することが幸運の鍵。',
 4:'基盤づくりの年。地道な努力と健康管理が将来の実を結びます。',
 5:'変化の年。転機・移動・新しい出会いを恐れず流れに乗って。',
 6:'愛と責任の年。家族・パートナー・仲間との絆を深める時。',
 7:'内省と学びの年。スキルアップや資格取得に最高のタイミング。',
 8:'収穫の年。仕事・お金で成果が出やすく、勝負をかける好機。',
 9:'完結と手放しの年。不要なものを整理し、次のサイクルへ備えて。'
};
function calcNumerology(p){
  const total=digitSum(p.y)+digitSum(p.m)+digitSum(p.d);
  const lp=reduceNum(total,true);
  const bd=reduceNum(p.d,true);
  const now=new Date();
  const py=reduceAll(digitSum(now.getFullYear())+digitSum(p.m)+digitSum(p.d));
  return {lp,bd,py,pyYear:now.getFullYear()};
}

/* ================================================================
   2. 九星気学(吉方位)
================================================================ */
const KYUSEI=['一白水星','二黒土星','三碧木星','四緑木星','五黄土星','六白金星','七赤金星','八白土星','九紫火星'];
const KYUSEI_DESC={
 1:'柔軟で聡明、水のようにどんな環境にも適応する苦労人の星。人知れず努力を重ね、大器晩成します。',
 2:'大地のような包容力を持つ育成の星。真面目にコツコツ支える力が信頼を生みます。',
 3:'雷のような瞬発力と若々しさの星。行動が早く、新しいことへの挑戦で運が開けます。',
 4:'風のように爽やかで社交的な星。人とのご縁・信用が最大の財産になります。',
 5:'帝王の星。強い運と存在感を持ち、良くも悪くも周囲に大きな影響を与えます。',
 6:'天のように気高く、責任感とプライドの星。リーダーや専門職で輝きます。',
 7:'湖のような愛嬌と弁舌の星。楽しませる才能と金運に恵まれます。',
 8:'山のように動じない継承と変革の星。貯蓄・不動産・家業に縁があります。',
 9:'太陽のような華やかさと先見性の星。美的センスと直感で頭角を現します。'
};
// 本命星ごとの吉方位に使える星(相生+比和、自星・五黄除く)
const LUCKY_STARS={1:[3,4,6,7],2:[6,7,8,9],3:[1,4,9],4:[1,3,9],5:[2,6,7,8,9],6:[1,2,7,8],7:[1,2,6,8],8:[2,6,7,9],9:[2,3,4,8]};
const DIRS=['北','北東','東','南東','南','南西','西','北西'];
const DEFAULT_PLATE=[1,8,3,4,9,2,7,6]; // 後天定位盤(北から時計回り)
const BRANCH_DIR=[0,1,1,2,3,3,4,5,5,6,7,7]; // 子→北(0) 丑寅→北東(1) 卯→東(2)…
const SETSU_DAY=[4,6,5,6,6,7,8,8,8,7,7,6]; // 2月〜翌1月の節入り日(略)

function starFromYear(y){let v=11-reduceAll(digitSum(y));while(v>9)v-=9;return v;}
function effectiveYear(y,m,d){return (m<2||(m===2&&d<SETSU_DAY[0]))?y-1:y;}
function honmeiStar(p){return starFromYear(effectiveYear(p.y,p.m,p.d));}
function chartStars(center){return DEFAULT_PLATE.map(s=>wrap9(s+center-5));}
function setsuMonthIdx(y,m,d){ // 0=寅月(2月節)〜11=丑月(1月節)
  const ey=effectiveYear(y,m,d);
  const j=jdn(y,m,d);
  let idx=0;
  for(let i=0;i<12;i++){
    const bm=i+2, by=bm>12?ey+1:ey, bmm=bm>12?bm-12:bm;
    if(j>=jdn(by,bmm,SETSU_DAY[i]))idx=i;
  }
  return {idx,effYear:ey};
}
function monthCenter(effYear,mIdx){
  const b=((effYear-4)%12+12)%12;
  const start=[8,5,2][b%3]; // 子卯午酉→八白/丑辰未戌→五黄/寅巳申亥→二黒
  return wrap9(start-mIdx);
}
function analyzeChart(center,myStar,haDir){
  const stars=chartStars(center);
  const lucky=LUCKY_STARS[myStar];
  return DIRS.map((dir,i)=>{
    const s=stars[i];
    const reasons=[];
    if(s===5)reasons.push('五黄殺');
    if(stars[(i+4)%8]===5)reasons.push('暗剣殺');
    if(s===myStar)reasons.push('本命殺');
    if(stars[(i+4)%8]===myStar)reasons.push('本命的殺');
    if(i===haDir)reasons.push(center===undefined?'':'破');
    const isBad=reasons.length>0;
    const isGood=!isBad&&lucky.includes(s);
    return {dir,star:s,isGood,isBad,reasons};
  });
}
function calcHoui(p){
  const my=honmeiStar(p);
  const now=new Date();
  const ny=now.getFullYear(), nm=now.getMonth()+1, nd=now.getDate();
  const effY=effectiveYear(ny,nm,nd);
  const yCenter=starFromYear(effY);
  const yBranch=((effY-4)%12+12)%12;
  const saihaDir=BRANCH_DIR[(yBranch+6)%12];
  const yearRes=analyzeChart(yCenter,my,saihaDir);
  const {idx:mIdx}=setsuMonthIdx(ny,nm,nd);
  const mCenter=monthCenter(effY,mIdx);
  const mBranch=(2+mIdx)%12; // 寅=2
  const geppaDir=BRANCH_DIR[(mBranch+6)%12];
  const monthRes=analyzeChart(mCenter,my,geppaDir);
  const bothGood=DIRS.filter((d,i)=>yearRes[i].isGood&&monthRes[i].isGood);
  return {my,effY,yCenter,yBranch,yearRes,mIdx,mCenter,mBranch,monthRes,bothGood,
          saihaDir,geppaDir};
}

/* ================================================================
   3. 西洋占星術(太陽星座)
================================================================ */
const ZODIAC=[
 {name:'山羊座',en:'Capricorn',from:[12,22],to:[1,19],el:'地',ruler:'土星',kw:'努力・達成・責任',d:'目標に向かって着実に登り続ける登山家。忍耐と実務能力は12星座随一で、年齢とともに運が強まります。'},
 {name:'水瓶座',en:'Aquarius',from:[1,20],to:[2,18],el:'風',ruler:'天王星',kw:'独創・革新・友愛',d:'常識にとらわれない自由な発想の持ち主。時代の一歩先を行き、仲間との横のつながりを大切にします。'},
 {name:'魚座',en:'Pisces',from:[2,19],to:[3,20],el:'水',ruler:'海王星',kw:'共感・想像力・癒やし',d:'豊かな感受性と優しさで人の痛みに寄り添える人。芸術やスピリチュアルな分野に強い縁があります。'},
 {name:'牡羊座',en:'Aries',from:[3,21],to:[4,19],el:'火',ruler:'火星',kw:'情熱・開拓・スピード',d:'思い立ったら即行動の先駆者。困難に立ち向かう勇気があり、新しい道を切り拓くほど輝きます。'},
 {name:'牡牛座',en:'Taurus',from:[4,20],to:[5,20],el:'地',ruler:'金星',kw:'安定・五感・豊かさ',d:'美しいもの・心地よいものを見極める審美眼の持ち主。一度決めたら揺るがない粘り強さが武器です。'},
 {name:'双子座',en:'Gemini',from:[5,21],to:[6,21],el:'風',ruler:'水星',kw:'知性・情報・コミュニケーション',d:'好奇心のアンテナを常に張り巡らせる情報通。軽やかな会話力と多才さで、どこでも人気者になれます。'},
 {name:'蟹座',en:'Cancer',from:[6,22],to:[7,22],el:'水',ruler:'月',kw:'家族・共感・守る力',d:'身内と認めた人をとことん守る愛情の人。記憶力と生活力に優れ、安心できる居場所づくりの名人です。'},
 {name:'獅子座',en:'Leo',from:[7,23],to:[8,22],el:'火',ruler:'太陽',kw:'自己表現・誇り・華やかさ',d:'生まれながらの主役気質。堂々とした存在感と面倒見の良さで、自然と人が集まってきます。'},
 {name:'乙女座',en:'Virgo',from:[8,23],to:[9,22],el:'地',ruler:'水星',kw:'分析・完璧・献身',d:'細部まで見逃さない観察眼と実務能力の持ち主。人の役に立つことに喜びを感じる縁の下の実力者です。'},
 {name:'天秤座',en:'Libra',from:[9,23],to:[10,23],el:'風',ruler:'金星',kw:'調和・美意識・社交',d:'バランス感覚と洗練されたセンスの持ち主。対人関係の橋渡し役として信頼を集めます。'},
 {name:'蠍座',en:'Scorpio',from:[10,24],to:[11,22],el:'水',ruler:'冥王星',kw:'深さ・集中・再生',d:'一点集中の深い情熱を秘めた人。本物だけを見抜く洞察力があり、逆境から何度でも甦ります。'},
 {name:'射手座',en:'Sagittarius',from:[11,23],to:[12,21],el:'火',ruler:'木星',kw:'冒険・哲学・楽観',d:'遠くの理想に向かって矢を放つ冒険家。海外・学問・旅に縁が深く、おおらかな楽観性が幸運を呼びます。'}
];
function calcZodiac(p){
  for(const z of ZODIAC){
    const [fm,fd]=z.from,[tm,td]=z.to;
    if(fm===12){ if((p.m===12&&p.d>=fd)||(p.m===1&&p.d<=td))return z; }
    else if((p.m===fm&&p.d>=fd)||(p.m===tm&&p.d<=td))return z;
  }
  return ZODIAC[0];
}

/* ================================================================
   4. マヤ暦(ドリームスペル準拠)
================================================================ */
const SEALS=[
 {n:'赤い龍',kw:'誕生・母性・生命力',d:'新しい命を生み育てるエネルギー。面倒見がよく、始まりを司ります。'},
 {n:'白い風',kw:'伝える・共感・スピリット',d:'言葉と呼吸で心を伝えるメッセンジャー。繊細な感性の持ち主です。'},
 {n:'青い夜',kw:'夢・直感・豊かさ',d:'自分の世界を大切にする夢見る人。夢を語ることで豊かさを引き寄せます。'},
 {n:'黄色い種',kw:'気づき・開花・探求',d:'納得するまで掘り下げる探求者。気づきの種を蒔き、開花させます。'},
 {n:'赤い蛇',kw:'情熱・生命力・本能',d:'鋭い感覚と集中力の持ち主。心を許した相手にはとことん尽くします。'},
 {n:'白い世界の橋渡し',kw:'橋渡し・おもてなし・死と再生',d:'人と人、世界と世界をつなぐ架け橋。交渉やおもてなしの才能があります。'},
 {n:'青い手',kw:'癒やし・遂行・体験',d:'手を使って癒やし、生み出す人。体験から学び、最後までやり遂げる力があります。'},
 {n:'黄色い星',kw:'美・調和・プロ意識',d:'美意識が高く、仕上がりにこだわる職人気質。星のように輝き周囲を照らします。'},
 {n:'赤い月',kw:'浄化・新しい流れ・使命感',d:'古いものを洗い流し、新しい流れを起こす改革者。強い使命感を持ちます。'},
 {n:'白い犬',kw:'忠実・愛・家族',d:'仲間や家族に誠実に尽くす愛の人。信頼関係の中でこそ力を発揮します。'},
 {n:'青い猿',kw:'遊び心・ひらめき・楽しむ',d:'人生を楽しむ天才。ユーモアとひらめきで場を明るくします。'},
 {n:'黄色い人',kw:'自由意志・感化・道',d:'自分の道を自由に歩む人。こだわりを持ち、生き様で周囲を感化します。'},
 {n:'赤い空歩く人',kw:'橋渡し・成長・奉仕',d:'天と地をつなぐ社会派。人の成長を助け、現場に立って行動します。'},
 {n:'白い魔法使い',kw:'魅了・受容・誠実',d:'ありのままを受け入れる魔法の使い手。誠実さと不思議な魅力で人を惹きつけます。'},
 {n:'青い鷲',kw:'先見性・視野・戦略',d:'高い空から全体を見渡す戦略家。クールな観察眼で未来を読みます。'},
 {n:'黄色い戦士',kw:'挑戦・知性・自問自答',d:'困難に立ち向かう知的な戦士。問い続けることで道を切り拓きます。'},
 {n:'赤い地球',kw:'絆・シンクロ・リズム',d:'心の絆とご縁を大切にする人。シンクロニシティを感じ取る力があります。'},
 {n:'白い鏡',kw:'映し出す・秩序・永遠',d:'ありのままを映す鏡のような人。曖昧さを嫌い、美しい秩序を愛します。'},
 {n:'青い嵐',kw:'変容・エネルギー・巻き込む',d:'周囲を巻き込む嵐のようなエネルギー。変化の中でこそ本領を発揮します。'},
 {n:'黄色い太陽',kw:'公平・存在感・完成',d:'太陽のように分け隔てなく照らす人。存在するだけで周囲に力を与えます。'}
];
const TONES=['磁気(目的)','月(挑戦)','電気(奉仕)','自己存在(形)','倍音(輝き)','律動(平等)','共振(調律)','銀河(調和)','太陽(意図)','惑星(表明)','スペクトル(解放)','水晶(協力)','宇宙(存在)'];
function calcMaya(p){
  if(p.m===2&&p.d===29)return {special:true};
  const anchor=jdn(2012,12,21); // KIN207
  const diff=(jdn(p.y,p.m,p.d)-anchor)-(leapDaysUpTo(p.y,p.m,p.d)-leapDaysUpTo(2012,12,21));
  const kin=((207-1+diff)%260+260)%260+1;
  const tone=(kin-1)%13+1;
  const seal=(kin-1)%20;
  let ws=kin-(tone-1); if(ws<1)ws+=260;
  const wsSeal=(ws-1)%20;
  const opp=261-kin;
  return {kin,tone,seal,wsSeal,opp,oppSeal:(opp-1)%20};
}

/* ================================================================
   5. 六星占術(簡易版)
================================================================ */
const ROKUSEI_STARS=['土星人','金星人','火星人','天王星人','木星人','水星人'];
const ROKUSEI_DESC={
 '土星人':'理想を追う努力家。誠実で忍耐強く、信念を曲げない生き方が周囲の尊敬を集めます。',
 '金星人':'感性で生きる自由人。楽しいこと・美しいものに敏感で、天性の華やかさがあります。',
 '火星人':'独自の世界を持つ個性派。直感と集中力に優れ、ここぞという場面で勝負強さを発揮します。',
 '天王星人':'人懐こい人情家。誰とでも打ち解ける柔らかさがあり、人に恵まれる星です。',
 '木星人':'品格と正義感の人。曲がったことが嫌いで、コツコツ積み上げた信用が財産になります。',
 '水星人':'頭の回転が速い合理主義者。時代の流れを読む才覚があり、お金や情報に強い星です。'
};
const ROKUSEI_SEED={'土星人':0,'金星人':2,'火星人':4,'天王星人':6,'木星人':8,'水星人':10};
const PHASES=[
 ['種子','新しいサイクルの始まり。種まきに最適',3],
 ['緑生','蒔いた種が芽吹く成長期。学びが実る',3],
 ['立花','花開く絶好調期。積極的な行動が吉',3],
 ['健弱','小休止。健康第一で無理をしない',2],
 ['達成','最高の収穫期。勝負をかける年',3],
 ['乱気','心が揺れやすい小殺界。現状維持が吉',1],
 ['再会','運気回復。過去の縁や経験が活きる',3],
 ['財成','金運上昇期。実利を固める好機',3],
 ['安定','安定した充実期。将来の計画を立てる',3],
 ['陰影','大殺界1年目。新規のことは控えめに',0],
 ['停止','大殺界2年目。守りに徹し、内面を磨く',0],
 ['減退','大殺界3年目。出口は近い。整理と充電を',0]
];
function calcRokusei(p){
  const n=((jdn(p.y,p.m,p.d)+49)%60+60)%60+1; // 日干支番号=星数
  const star=ROKUSEI_STARS[Math.floor((n-1)/10)];
  const yb=((p.y-4)%12+12)%12;
  const sign=yb%2===0?'＋(陽)':'－(陰)';
  const now=new Date().getFullYear();
  const nb=((now-4)%12+12)%12;
  const phaseIdx=(nb-ROKUSEI_SEED[star]+12)%12;
  return {n,star,sign,phaseIdx,nowYear:now,nb};
}

/* ================================================================
   6. 神社属性(繭気属性)
================================================================ */
const BLOOD_NUM={A:1,B:2,AB:3,O:4};
const ZOKUSEI_MAP={1:'地',2:'水',3:'火',4:'風',5:'空',6:'地',7:'水',8:'火',9:'風'};
const ZOKUSEI_INFO={
 '地':{kw:'安定・堅実・育む力',good:['火','風'],bad:['水','空'],
   d:'大地のようにどっしりと構えた属性。土・山・森など、大地の気が強い場所でエネルギーを充電できます。',
   spots:'山岳系の神社、巨木・ご神木、磐座(いわくら)、森に囲まれた古社など'},
 '水':{kw:'流れ・浄化・柔軟性',good:['風','空'],bad:['地','火'],
   d:'水のように形を変えて流れる属性。水辺の聖地で心身が浄化され、運気の流れが良くなります。',
   spots:'滝、湖・池のほとりの神社、海辺の神社、湧き水・御神水のある聖地など'},
 '火':{kw:'情熱・活力・変革',good:['空','地'],bad:['水','風'],
   d:'燃え上がる炎のようにエネルギッシュな属性。太陽や火に縁のある場所でパワーが高まります。',
   spots:'火山・温泉地の神社、太陽信仰の聖地、朱塗りの社殿が印象的な神社など'},
 '風':{kw:'自由・情報・ご縁',good:['地','水'],bad:['火','空'],
   d:'風のように軽やかに動き回る属性。風通しの良い高台や、風の通り道にある聖地と相性抜群です。',
   spots:'高台・峠の神社、海風の吹く岬の神社、龍神・風神を祀る聖地など'},
 '空':{kw:'天とつながる・直感・超越',good:['水','火'],bad:['地','風'],
   d:'五属性で最も稀な、天空とつながる属性。空に近い場所や星・宇宙に縁のある聖地で感性が冴えます。',
   spots:'山頂の奥宮、星や月を祀る神社、標高の高い寺社、天空の聖地など'}
};
function calcZokusei(p,blood){
  const base=reduceAll(digitSum(p.y)+digitSum(p.m)+digitSum(p.d));
  if(!blood)return {base,unknown:true};
  const n=reduceAll(base+BLOOD_NUM[blood]);
  return {base,n,attr:ZOKUSEI_MAP[n]};
}

/* ================================================================
   今日の運勢(誕生日×今日の日付でシード固定)
================================================================ */
const LUCKY_COLORS=['ゴールド','ラベンダー','ターコイズ','コーラルピンク','エメラルドグリーン','ロイヤルブルー','パールホワイト','サンセットオレンジ','ワインレッド','シルバー','レモンイエロー','モスグリーン'];
const LUCKY_ITEMS=['お気に入りのペン','ハンカチ','香りの良いハンドクリーム','小さなお守り','温かい飲み物','観葉植物','イヤホンで好きな音楽','ノートとメモ','柑橘系の香り','腕時計','新しい靴下','窓辺の換気'];
const DAILY_ADVICE=[
 '直感を信じて即決すると流れが良くなる日。',
 '聞き役に回ると大切な情報が舞い込みます。',
 '朝のうちに大事な用事を済ませると吉。',
 '懐かしい人への連絡が幸運の扉を開きます。',
 '整理整頓が開運アクション。机の上から。',
 '少し遠回りした道に新しい発見があります。',
 '感謝を言葉にすると人間関係運が急上昇。',
 '学びに投資すると未来の自分が喜ぶ日。',
 '無理は禁物。休むことも立派な開運行動。',
 '笑顔が最強の魔除けになる一日です。'
];
function calcDaily(p){
  const t=new Date();
  const key=`${t.getFullYear()}${t.getMonth()+1}${t.getDate()}|${p.y}-${p.m}-${p.d}`;
  const rnd=mulberry32(hashStr(key));
  const r5=()=>Math.floor(rnd()*5)+1;
  const cP=(typeof LUNA_EXT!=='undefined'&&LUNA_EXT.colors)?LUNA_EXT.colors:LUCKY_COLORS;
  const iP=(typeof LUNA_EXT!=='undefined'&&LUNA_EXT.items)?LUNA_EXT.items:LUCKY_ITEMS;
  const aP=(typeof LUNA_EXT!=='undefined'&&LUNA_EXT.advice)?LUNA_EXT.advice:DAILY_ADVICE;
  return {
    total:Math.max(2,r5()),love:r5(),work:r5(),money:r5(),health:r5(),
    color:cP[Math.floor(rnd()*cP.length)],
    item:iP[Math.floor(rnd()*iP.length)],
    num:Math.floor(rnd()*9)+1,
    advice:aP[Math.floor(rnd()*aP.length)]
  };
}

/* ================================================================
   7. 16タイプ性格診断
================================================================ */
const MBTI_TYPES={
 INTJ:{label:'静かなる戦略家',kw:'構想・独立・先読み',d:'頭の中に壮大な設計図を描き、長期的な視点で着実に実現していく建築家気質。ひとり時間から最高の戦略が生まれます。',luck:'完璧な計画に「余白」を残すと運が流れ込みます。何も決めない散歩が開運習慣。',match:['ENFP','ENTP']},
 INTP:{label:'好奇心の探究者',kw:'分析・理論・自由',d:'「なぜ?」を追いかける知の冒険家。独自の視点で本質を見抜き、複雑な問題ほど心が燃えます。',luck:'頭の中の宝物をひとつ形にして外に出すと、運気が大きく動き出します。',match:['ENTJ','ENFJ']},
 ENTJ:{label:'生まれながらの統率者',kw:'指揮・決断・成長',d:'目標を定めたら最短距離で突き進むリーダー。人と組織を成長させる推進力は16タイプ随一です。',luck:'弱みを見せられる相手を持つと運の器が広がります。休むのも戦略のうち。',match:['INTP','INFP']},
 ENTP:{label:'ひらめきの発明家',kw:'発想・挑戦・討論',d:'常識を疑い、新しい可能性を見つける天才。話しているうちにアイデアが次々と湧いてきます。',luck:'飽きたら潔く手放してOK。その身軽さこそあなた最大の開運体質です。',match:['INFJ','INTJ']},
 INFJ:{label:'深き洞察の予見者',kw:'洞察・理想・静かな情熱',d:'人の心の奥を感じ取る稀有な感受性の持ち主。信念のためなら静かに、粘り強く動き続けます。',luck:'ひとり時間の充電が最優先。直感が冴えた日は、迷わずその声に従って。',match:['ENTP','ENFP']},
 INFP:{label:'心優しき理想家',kw:'想像・共感・信念',d:'内面に豊かな物語の世界を持つ人。自分の価値観に響くものに出会うと、驚くほどの力を発揮します。',luck:'感じたことを書き残す習慣が、あなただけの幸運の地図になります。',match:['ENTJ','ENFJ']},
 ENFJ:{label:'人を導く太陽',kw:'育成・共感・カリスマ',d:'人の可能性を見つけて伸ばす天性の導き手。あなたの励ましで人生が変わった人が、きっといます。',luck:'人に与えた分は必ず巡ってきます。月に一度は自分を最優先にする日を。',match:['INFP','ISFP']},
 ENFP:{label:'自由な情熱家',kw:'好奇心・共感・人望',d:'出会いと可能性にときめく自由な魂。持ち前の明るさで、どこへ行っても人の輪の中心になります。',luck:'「やりたい!」と思った瞬間が吉日。迷いは動きながら消していくタイプです。',match:['INTJ','INFJ']},
 ISTJ:{label:'誠実な堅実家',kw:'責任・正確・継続',d:'約束を必ず守る信頼の人。コツコツ積み上げる力に関しては、右に出る者がいません。',luck:'たまの「予定にない寄り道」が、新しい運を運んできます。',match:['ESFP','ESTP']},
 ISFJ:{label:'献身的な守護者',kw:'支える・気配り・誠実',d:'大切な人を静かに守る縁の下のヒーロー。細やかな気配りと記憶力は誰にも真似できません。',luck:'「ありがとう」を素直に受け取る練習を。遠慮のしすぎは運気を止めます。',match:['ESTP','ESFP']},
 ESTJ:{label:'頼れる実務家',kw:'管理・実行・公正',d:'物事を仕組み化して確実に回す管理の達人。決断が早く、周囲からの「頼れる人」筆頭です。',luck:'月に一度「正しさ」より「楽しさ」で選ぶ日を作ると、運の風通しが良くなります。',match:['ISFP','ISTP']},
 ESFJ:{label:'温かな世話役',kw:'おもてなし・調和・世話好き',d:'場の空気を温めるおもてなしの達人。人と人をつなぐことで、自分自身も輝きます。',luck:'あなたの善意はもう十分伝わっています。人の評価より自分の心地よさを。',match:['ISFP','ISTP']},
 ISTP:{label:'クールな職人',kw:'技巧・冷静・自立',d:'手を動かして問題を解決する職人肌。危機のときほど冷静で、少ない言葉に説得力が宿ります。',luck:'新しい道具や技術との出会いが運気のスイッチ。気になったら触ってみて。',match:['ESFJ','ESTJ']},
 ISFP:{label:'感性の芸術家',kw:'美意識・優しさ・マイペース',d:'五感で世界を味わう静かなアーティスト。自分のペースで、美しいものを生み出します。',luck:'好きなものに囲まれた部屋づくりが、そのまま開運術になります。',match:['ESTJ','ESFJ']},
 ESTP:{label:'度胸の挑戦者',kw:'行動・機転・スリル',d:'考えるより先に体が動く行動派。ピンチをチャンスに変える機転と度胸は天下一品です。',luck:'勝負運が強い星。ただし「引き際」を先に決めてから挑むと、さらに強運に。',match:['ISFJ','ISTJ']},
 ESFP:{label:'天性のムードメーカー',kw:'楽しむ・輝く・今この瞬間',d:'いるだけで場が明るくなるスター気質。「今」を全力で楽しむ姿が、周りの元気の源です。',luck:'楽しい予定を先に入れるほど運が回り出します。笑顔が最強のお守り。',match:['ISTJ','ISFJ']}
};
const MBTI_Q=[
 ['大人数の集まりでは…','自分から話しかけに行く','話しかけられるのを待つことが多い','E','I'],
 ['元気をチャージする方法は…','人と会っておしゃべりする','ひとりの時間を過ごす','E','I'],
 ['考えごとは…','話しながら整理するタイプ','頭の中でまとめてから話すタイプ','E','I'],
 ['物事を見るときは…','事実や細かい部分に目が行く','全体像や可能性に目が行く','S','N'],
 ['説明するなら…','具体例と手順で順番に','たとえ話とイメージで一気に','S','N'],
 ['心を惹かれるのは…','実績のある確実な方法','試したことのない新しいアイデア','S','N'],
 ['決断のよりどころは…','筋が通っているかどうか','関わる人の気持ちがどうなるか','T','F'],
 ['相談されたら…','まず解決策を一緒に考える','まず気持ちに寄り添って聞く','T','F'],
 ['意見が違うときは…','率直に指摘し合いたい','角が立たない言い方を探す','T','F'],
 ['旅行のスタイルは…','事前にしっかり計画を立てる','現地の気分と流れで決める','J','P'],
 ['締め切りがあると…','余裕を持って早めに終わらせる','直前に集中して一気に仕上げる','J','P'],
 ['落ち着くのは…','整理整頓された空間と決まった予定','自由に変えられる余白のある状態','J','P']
];
const MBTI_SEL={};
function renderMbtiTab(p){
  const el=$('tab-mbti');
  if(p.mbti&&MBTI_TYPES[p.mbti]){
    const t=MBTI_TYPES[p.mbti];
    el.innerHTML=`
     <div class="card">
      <h2>16タイプ性格診断</h2>
      <div class="big-result">${p.mbti} <span style="font-size:.9rem">${esc(t.label)}</span></div>
      <div class="kw">${esc(t.kw)}</div>
      <p class="desc">${esc(t.d)}</p>
      <h3>開運アドバイス</h3>
      <p class="desc">${esc(t.luck)}</p>
      <h3>相性の良いタイプ</h3>
      <p class="desc">${t.match.map(m=>'<b>'+m+'</b>('+esc(MBTI_TYPES[m].label)+')').join('・')} と好相性とされます。価値観の軸が近いタイプとも自然に馴染めます。</p>
      <button class="btn btn-ghost" onclick="resetMbti()">診断をやり直す</button>
      <p class="note">MBTI®はThe Myers-Briggs Companyの登録商標です。本診断は当アプリ独自の簡易16タイプ診断であり、公式のMBTI®検査とは関係ありません。</p>
     </div>`;
  }else{
    el.innerHTML=`
     <div class="card">
      <h2>16タイプ性格診断</h2>
      <p class="section-lead">直感で近い方を選んでください(全12問・約1分)。タイプをすでにご存じの場合は「変更」からプロフィールで選択できます。</p>
      ${MBTI_Q.map((q,i)=>`
        <div class="q-block">
          <div class="q">Q${i+1}. ${esc(q[0])}</div>
          <div class="q-opts">
            <button class="q-opt" id="q${i}a" onclick="pickQ(${i},'${q[3]}','a')">${esc(q[1])}</button>
            <button class="q-opt" id="q${i}b" onclick="pickQ(${i},'${q[4]}','b')">${esc(q[2])}</button>
          </div>
        </div>`).join('')}
      <button class="btn" onclick="judgeMbti()">タイプを判定する ✦</button>
      <p class="note">MBTI®はThe Myers-Briggs Companyの登録商標です。本診断は当アプリ独自の簡易診断です。</p>
     </div>`;
  }
}
function pickQ(i,pole,side){
  MBTI_SEL[i]=pole;
  $('q'+i+'a').classList.toggle('sel',side==='a');
  $('q'+i+'b').classList.toggle('sel',side==='b');
}
function judgeMbti(){
  const remain=MBTI_Q.length-Object.keys(MBTI_SEL).length;
  if(remain>0){alert('未回答の質問が'+remain+'問あります。すべて選んでください。');return;}
  const cnt={};Object.values(MBTI_SEL).forEach(v=>cnt[v]=(cnt[v]||0)+1);
  const type=((cnt.E||0)>(cnt.I||0)?'E':'I')+((cnt.S||0)>(cnt.N||0)?'S':'N')+((cnt.T||0)>(cnt.F||0)?'T':'F')+((cnt.J||0)>(cnt.P||0)?'J':'P');
  const p=JSON.parse(localStorage.getItem(STORAGE_KEY));
  p.mbti=type;localStorage.setItem(STORAGE_KEY,JSON.stringify(p));
  Object.keys(MBTI_SEL).forEach(k=>delete MBTI_SEL[k]);
  renderAll(p);
  window.scrollTo(0,0);
}
function resetMbti(){
  const p=JSON.parse(localStorage.getItem(STORAGE_KEY));
  p.mbti='';localStorage.setItem(STORAGE_KEY,JSON.stringify(p));
  renderAll(p);
  window.scrollTo(0,0);
}

/* ================================================================
   8. 開運相談室(星詠みコンシェルジュ ルナ)
================================================================ */
let CURRENT=null,chatStarted=false;
const CHAT_CHIPS=['今日の運勢は?','今月の吉方位は?','おすすめの旅行先は?','恋愛運は?','仕事運は?','金運アップの方法は?','大殺界はいつ?','私に合うパワースポットは?','相性を教えて'];
function initChat(){
  $('chat-chips').innerHTML=CHAT_CHIPS.map(c=>`<button class="chip" onclick="chipSend('${c}')">${c}</button>`).join('');
  $('chat-text').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendChat();}});
}
function chatAdd(text,who){
  const log=$('chat-log');
  const div=document.createElement('div');
  div.className='msg '+who;
  div.innerHTML=esc(text).replace(/\n/g,'<br>');
  log.appendChild(div);
  log.scrollTop=log.scrollHeight;
}
function chatWelcome(){
  if(chatStarted||!CURRENT)return;
  chatStarted=true;
  const c=CURRENT,name=c.p.name?c.p.name+'さん':'あなた';
  const gl=(typeof lunaGreetLine==='function')?lunaGreetLine(c):'';
  chatAdd(`こんにちは、${name}✦ 星詠みコンシェルジュのルナです。\n${gl?gl+'\n':''}運勢のこと、吉方位や旅行先のこと、なんでも聞いてくださいね。下のボタンからも質問できます。`,'bot');
}
function chipSend(t){$('chat-text').value=t;sendChat();}
function sendChat(){
  const inp=$('chat-text');const q=inp.value.trim();if(!q)return;
  inp.value='';chatAdd(q,'user');
  setTimeout(()=>chatAdd(botReply(q),'bot'),450);
}
function botReply(q){
  const c=CURRENT;if(!c)return 'まずはプロフィールを登録してくださいね。';
  const p=c.p,d=c.daily;
  const name=p.name?p.name+'さん':'あなた';
  if(/おはよう|こんにちは|こんばんは|はじめまして|やっほ|ハロー|hello/i.test(q)){
    const gl=(typeof lunaGreetLine==='function')?lunaGreetLine(c):'';
    return `${name}、ようこそ開運相談室へ✦ 今日の総合運は${starBar(d.total)}。${gl?gl+' ':''}「今日の運勢は?」「吉方位は?」など、気軽に聞いてくださいね。`;
  }
  if(/ありがとう|感謝|助かっ/.test(q))
    return `どういたしまして✦ ${name}の毎日に良い風が吹きますように。またいつでも呼んでくださいね。`;
  if(/大殺界|殺界/.test(q)){
    const idx=c.roku.phaseIdx,y=c.roku.nowYear;
    const start=y+((9-idx)+12)%12;
    if(idx>=9)return `${c.roku.star}の${name}は、実は今(${y}年)「${PHASES[idx][0]}」で大殺界の${idx-8}年目です。でも怖がりすぎないで。新しい大勝負を避けて「学び・整理・体調管理」に徹すれば、${y+(12-idx)}年からの上昇気流にきれいに乗れますよ✦`;
    if(idx===5)return `${y}年は「乱気」という小殺界。心が揺れやすい年なので、大きな決断はいつもより慎重に。次の大殺界は${start}年〜${start+2}年です。それまでに攻めの種まきを✦`;
    return `${c.roku.star}の${name}の次の大殺界は${start}年〜${start+2}年の3年間。今年は「${PHASES[idx][0]}」(${PHASES[idx][1]})なので、${start}年が来る前にしっかり動いておくのが吉です✦`;
  }
  if(/相性/.test(q)){
    const z=c.z;const pair={'火':'風','風':'火','地':'水','水':'地'}[z.el];
    let s=`星座で見ると、${z.name}の${name}は同じ${z.el}のエレメントの${ZODIAC.filter(o=>o.el===z.el&&o.name!==z.name).map(o=>o.name).join('・')}と、${pair}のエレメントの星座が好相性✦`;
    if(p.mbti&&MBTI_TYPES[p.mbti])s+=`\n性格タイプでは、${p.mbti}のあなたは${MBTI_TYPES[p.mbti].match.join('や')}と相性が良い組み合わせとされています。`;
    if(!c.zoku.unknown)s+=`\n神社属性では、${c.zoku.attr}属性のあなたは${ZOKUSEI_INFO[c.zoku.attr].good.join('属性・')}属性の人と気が合いやすいですよ。`;
    s+='\n特定のお相手との縁を深く知りたいときは、「💞相性診断」タブでお相手の生年月日を入れてみてください✦';
    return s;
  }
  if(/旅行|旅先|お出かけ|おでかけ|温泉|どこ.*行/.test(q)){
    const both=c.houi.bothGood;
    const yg=c.houi.yearRes.filter(r=>r.isGood).map(r=>r.dir);
    let s=both.length?`今なら自宅から見て${both.join('・')}の方角が、年盤・月盤どちらも吉のゴールデンルート✦ 50km以上離れた場所で、温泉に入って地のものを食べるのが最高の祐気取りです。`:
      `今月は年盤・月盤ダブル吉の方位がないので、遠出は来月以降が狙い目。今年の年盤では${yg.length?yg.join('・'):'…実は吉方位がありません'}が吉なので、方角はそちらを意識してみて。`;
    if(!c.zoku.unknown)s+=`\n行き先選びは、${c.zoku.attr}属性の${name}と相性の良い「${ZOKUSEI_INFO[c.zoku.attr].spots}」がおすすめです✦`;
    return s;
  }
  if(/方位|方角|引っ越し|引越/.test(q)){
    const both=c.houi.bothGood;
    const yg=c.houi.yearRes.filter(r=>r.isGood).map(r=>r.dir);
    const mg=c.houi.monthRes.filter(r=>r.isGood).map(r=>r.dir);
    return `本命星${KYUSEI[c.houi.my-1]}の${name}の${c.houi.effY}年の吉方位は「${yg.join('・')||'なし'}」、今月の吉方位は「${mg.join('・')||'なし'}」。${both.length?`特に${both.join('・')}はダブル吉です✦`:'ダブル吉は来月以降に期待しましょう。'}\n引っ越しなど長期の移動は、年盤・月盤の両方が吉の方位が理想。詳しくは「吉方位」タブのコンパスをどうぞ。`;
  }
  if(/恋愛|恋|結婚|出会い|片思い|パートナー/.test(q)){
    let s=`今日の${name}の恋愛・対人運は${starBar(d.love)}。\n${d.love>=4?'グングン来てます!気になる人には今日のうちに連絡を✦':d.love>=3?'穏やかな追い風。焦らず自然体でいるのが、いちばん魅力的に見える日です。':'今日は攻めるより自分磨きの日。'+d.color+'を身につけると恋愛運が底上げされますよ。'}\n${c.z.name}のあなたは「${c.z.kw}」が魅力の武器。それをわかってくれる相手こそご縁の人です。`;
    if(typeof lunaLove==='function'){const x=lunaLove(c);if(x)s+='\n'+x;}
    return s;
  }
  if(/仕事|転職|勉強|試験|資格|昇進|キャリア/.test(q)){
    let s=`今日の仕事・学び運は${starBar(d.work)}。\n数秘術では${c.num.pyYear}年のあなたはパーソナルイヤー「${c.num.py}」。${PERSONAL_YEAR[c.num.py]}\n${PHASES[c.roku.phaseIdx][2]===0?'六星占術では大殺界中なので、転職などの大きな決断は情報収集をいつもより丁寧に。実力を磨く時期と割り切ると最強です。':'六星占術の今年の運気は「'+PHASES[c.roku.phaseIdx][0]+'」。'+PHASES[c.roku.phaseIdx][1]+'。'}`;
    if(typeof lunaWork==='function'){const x=lunaWork(c);if(x)s+='\n'+KYUSEI[c.houi.my-1]+'のあなたは、'+x;}
    return s;
  }
  if(/金運|お金|宝くじ|貯金|投資|臨時収入/.test(q)){
    const idx=c.roku.phaseIdx,zaiY=c.roku.nowYear+((7-idx)+12)%12;
    let s=`今日の金運は${starBar(d.money)}。ラッキーナンバーは「${d.num}」です✦\n六星占術では${zaiY===c.roku.nowYear?'なんと今年が金運の「財成」イヤー!実利を固める行動が吉です。':zaiY+'年が金運の「財成」イヤー。'}\nお財布の整理と玄関の掃除は、どの占術でも共通する金運アップの基本ですよ。`;
    if(typeof lunaMoney==='function'){const x=lunaMoney(c);if(x)s+='\nライフパス'+c.num.lp+'の'+name+'は、'+x;}
    return s;
  }
  if(/健康|体調|疲れ|睡眠/.test(q)){
    let s=`今日の健康運は${starBar(d.health)}。\n${d.health<=2?'今日は無理は禁物。睡眠を最優先して、温かいものを食べてくださいね。':'調子は悪くありません。良い習慣をひとつ足すのに向いた日です。'}${PHASES[c.roku.phaseIdx][0]==='健弱'?'\n六星占術では今年は「健弱」の年。健康診断と休息をいつもより大切に。':''}`;
    if(typeof lunaHealth==='function'){const x=lunaHealth(c);if(x)s+='\n'+c.zoku.attr+'属性のあなたには、'+x;}
    s+=`\n今日の開運アクションは「${d.item}」です✦`;
    return s;
  }
  if(/パワースポット|神社|属性|参拝|お参り|お寺/.test(q)){
    if(c.zoku.unknown)return `神社属性(繭気属性)を占うには血液型が必要です。上の「変更」ボタンから設定してくださいね。ちなみに生年月日だけで出せる基本数は「${c.zoku.base}」です。`;
    const zi=ZOKUSEI_INFO[c.zoku.attr];
    return `${name}は「${c.zoku.attr}属性」。相性が良いのは、${zi.spots}✦\n${c.zoku.attr}属性のほか、${zi.good.join('属性・')}属性の聖地でもエネルギーチャージできます。伊勢神宮や出雲大社のような別格の聖地は、属性を問わないとされていますよ。`;
  }
  if(/マヤ|kin|紋章|ツォルキン/i.test(q)){
    if(c.maya.special)return `${name}は2月29日生まれ。マヤ暦(ドリームスペル)では「フナブ・クの日」という、KINを持たない特別な存在です✦`;
    return `${name}はKIN${c.maya.kin}。太陽の紋章は「${SEALS[c.maya.seal].n}」、銀河の音は${c.maya.tone}です。\n${SEALS[c.maya.seal].d}\n詳しくは「マヤ暦」タブをどうぞ✦`;
  }
  if(/数秘|ライフパス|ナンバー/.test(q)){
    return `${name}のライフパスナンバーは「${c.num.lp}」(${LIFEPATH[c.num.lp].kw})。\n${LIFEPATH[c.num.lp].d}\n開運のヒント:${LIFEPATH[c.num.lp].adv}`;
  }
  if(/性格|タイプ|MBTI|診断/i.test(q)){
    if(p.mbti&&MBTI_TYPES[p.mbti])return `${name}は${p.mbti}「${MBTI_TYPES[p.mbti].label}」タイプ。${MBTI_TYPES[p.mbti].d}\n開運アドバイス:${MBTI_TYPES[p.mbti].luck}`;
    return `まだ性格タイプが未診断です。「性格タイプ」タブで12問の診断ができますよ(約1分)✦`;
  }
  if(/今日|運勢|占って|ラッキー/.test(q)){
    return `今日の${name}の運勢です✦\n総合 ${starBar(d.total)}\n恋愛・対人 ${starBar(d.love)}\n仕事・学び ${starBar(d.work)}\n金運 ${starBar(d.money)}\n健康 ${starBar(d.health)}\nラッキーカラーは${d.color}、ラッキーナンバーは「${d.num}」。\n${d.advice}`;
  }
  if(/使い方|何ができる|ヘルプ|help/i.test(q))
    return `私に聞けるのは…「今日の運勢」「吉方位・旅行先・引っ越し」「恋愛運・仕事運・金運・健康運」「大殺界はいつ?」「パワースポット」「相性」「マヤ暦・数秘術・性格タイプの解説」など✦ 下のボタンからもどうぞ。`;
  const oracle=[
   '星々のささやきによると…焦らなくて大丈夫。あなたのペースが正解です。',
   '月からのメッセージ:手放すと決めた瞬間、新しいものが入るスペースが生まれます。',
   '風のカードが出ました。小さな変化を起こすと、想像以上の追い風が吹きそう。',
   '太陽のカードが出ました。堂々としているだけで、今日は物事がうまく運びます。',
   '水のカードが出ました。感情は溜め込まず、信頼できる人に話してみて。',
   '星回りは穏やかです。日常の「ちょっと嬉しい」を数えると運気が育ちます。'
  ];
  if(typeof lunaOracle==='function'){const lo=lunaOracle(c,q);if(lo)return lo;}
  const t=new Date();
  const r=mulberry32(hashStr(q+'|'+t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate()+'|'+p.y+'-'+p.m+'-'+p.d))();
  return `${oracle[Math.floor(r*oracle.length)]}\n(参考までに、今日のラッキーカラーは${d.color}です✦)`;
}

/* ================================================================
   9. 相性診断
================================================================ */
const GOGYO={1:'水',2:'土',3:'木',4:'木',5:'土',6:'金',7:'金',8:'土',9:'火'};
const SHENG={'木':'火','火':'土','土':'金','金':'水','水':'木'};
const NUM_GROUPS=[[1,5,7],[2,4,8],[3,6,9]];
const NUM_GROUP_NAMES=['知性と探求のグループ(1・5・7)','堅実と信頼のグループ(2・4・8)','創造と愛のグループ(3・6・9)'];
const ASPECT_DATA={
 0:[86,'コンジャンクション(0度)','同じ星座に太陽を持つ二人。価値観の根っこが同じで、多くを語らずとも通じ合える安心の縁です。'],
 1:[64,'セミセクスタイル(30度)','隣り合う星座。似ているようで実は別世界の住人。ほんの少しの歩み寄りが、心地よい距離感を生みます。'],
 2:[85,'セクスタイル(60度)','自然に好意が芽生える調和の角度。肩肘張らずに付き合える、風通しの良い縁です。'],
 3:[60,'スクエア(90度)','緊張と刺激の角度。ぶつかることもありますが、乗り越えた二人の絆は、どの組み合わせよりも強くなります。'],
 4:[94,'トライン(120度)','同じエレメントを分かち合う、占星術で最高の調和角。一緒にいるだけで互いの運気が巡り出します。'],
 5:[62,'クインカンクス(150度)','共通点の見えにくい不思議な角度。だからこそ惹かれ、飽きることのない謎めいた縁です。'],
 6:[80,'オポジション(180度)','真向かいの星座は、磁石のように惹かれ合う配置。相手はあなたの「もう半分」を映す存在です。']
};
const EN_WORDS=[
 '出会いは偶然、続く縁は選択。今日も選び合えることが、何よりの奇跡です。',
 '違うふたつの星だからこそ、同じ夜空を美しく灯せるのです。',
 '相手はあなたの鏡。相手の中に見えるものは、あなたの中にも眠っています。',
 '縁は結ぶものではなく、育てるもの。水をやるのは、日々の言葉です。',
 'ぶつかるのは、本気で向き合っている証。無関心に、角度は生まれません。',
 'あなたの弱さを見せられる相手こそ、星が用意した止まり木です。',
 '急がなくていい。良い縁ほど、ゆっくりと根を張ります。',
 '感謝を言葉にした日、二人の星は少しだけ近づきます。'
];
function aishouItems(me,pt){
  const items=[];
  const nameB=pt.name?pt.name+'さん':'お相手';
  /* 数秘術 */
  const lpA=calcNumerology(me).lp,lpB=calcNumerology(pt).lp;
  const ra=reduceAll(lpA),rb=reduceAll(lpB);
  let nu;
  if(ra===rb)nu={score:78,title:'同じ波動を持つ数字',text:`二人のライフパスはどちらも「${ra}」の波動。長所も弱点も分かち合える、鏡のような組み合わせです。似ているからこそ、同じ場所でつまずくことも。労わり合いを忘れずに。`};
  else{
    const gi=NUM_GROUPS.findIndex(g=>g.includes(ra)&&g.includes(rb));
    if(gi>=0)nu={score:90,title:'同じ魂のグループ',text:`「${lpA}」と「${lpB}」は、数秘術でいう${NUM_GROUP_NAMES[gi]}に属する好相性。目指す方向が似ていて、自然と歩幅が揃います。`};
    else if(ra+rb===10)nu={score:84,title:'十を成す補完の数',text:`「${ra}」と「${rb}」は、足すと10になる補完の関係。あなたに無いものを相手が、相手に無いものをあなたが持っています。`};
    else nu={score:66,title:'学び合う数字',text:`波動の異なる「${lpA}」と「${lpB}」。すぐに分かり合えなくても、その違いこそが、お互いの世界を広げる扉になります。`};
  }
  if(lpA>9||lpB>9){nu.score=Math.min(100,nu.score+3);nu.text+='マスターナンバーを持つ縁は、出会いそのものに意味があるといわれます。';}
  items.push(Object.assign({sys:'数秘術',icon:'🔢'},nu));
  /* 西洋占星術(アスペクト) */
  const za=calcZodiac(me),zb=calcZodiac(pt);
  const ia=ZODIAC.indexOf(za),ib=ZODIAC.indexOf(zb);
  const dist=Math.min((ib-ia+12)%12,(ia-ib+12)%12);
  const ad=ASPECT_DATA[dist];
  items.push({sys:'西洋占星術',icon:'🌙',score:ad[0],title:ad[1],text:`${za.name}と${zb.name}。${ad[2]}`});
  /* 九星気学(五行) */
  const ha=honmeiStar(me),hb=honmeiStar(pt);
  const ea=GOGYO[ha],eb=GOGYO[hb];
  let ki;
  if(ea===eb)ki={score:80,title:'比和 ─ 同じ気を持つ二人',text:`${KYUSEI[ha-1]}と${KYUSEI[hb-1]}は、どちらも「${ea}」の気。肩の力を抜いて長く付き合える、安定の組み合わせです。`};
  else if(SHENG[ea]===eb)ki={score:84,title:'相生 ─ あなたが相手を育てる',text:`あなた(${KYUSEI[ha-1]})の「${ea}」の気は、${nameB}(${KYUSEI[hb-1]})の「${eb}」の気を生み育てます。自然と与える側になりやすい関係。尽くしすぎず、受け取ることも覚えて。`};
  else if(SHENG[eb]===ea)ki={score:84,title:'相生 ─ 相手があなたを育てる',text:`${nameB}(${KYUSEI[hb-1]})の「${eb}」の気が、あなた(${KYUSEI[ha-1]})の「${ea}」の気を養います。そばにいるだけで力をもらえる相手。感謝を言葉にすると縁が深まります。`};
  else ki={score:58,title:'相剋 ─ 磨き合う気',text:`「${ea}」と「${eb}」はぶつかり合う気ですが、相剋は「磨き合い」でもあります。適度な距離感と役割分担が、長続きの秘訣です。`};
  items.push(Object.assign({sys:'九星気学',icon:'🧭'},ki));
  /* マヤ暦 */
  const ma=calcMaya(me),mb=calcMaya(pt);
  if(ma.special||mb.special){
    items.push({sys:'マヤ暦',icon:'🌞',score:77,title:'枠を超えた特別な縁',text:'どちらかが2月29日生まれ。ツォルキンの枠の外にある魂との縁は、それ自体が特別な巡り合わせです。'});
  }else{
    const sa=ma.seal+1,sb=mb.seal+1;
    const rels=[];
    if(ma.kin+mb.kin===261)rels.push([96,'神秘KIN','二人のKINを足すと261。言葉を超えて惹かれ合う、マヤ暦で最も神秘的とされる運命の縁です。']);
    if(sa+sb===21)rels.push([86,'紋章の神秘ペア','太陽の紋章同士が神秘の関係。お互いの背中をそっと押し合う、不思議な引力があります。']);
    if(sa+sb===19)rels.push([88,'類似KIN','本質のよく似た魂。初対面でもどこか懐かしい、居心地の良い縁です。']);
    if(Math.abs(sa-sb)===10)rels.push([68,'反対KIN','正反対の視点を持つ相手。すれ違いも起きますが、理解し合えた時は、誰よりも世界を広げてくれる存在です。']);
    if(sa===sb)rels.push([84,'同じ太陽の紋章','同じ紋章を持つ魂の同志。人生で果たしたい使命の方向が重なっています。']);
    if(ma.tone===mb.tone)rels.push([80,'同じ銀河の音','人生を刻むリズムが同じ二人。物事を進めるテンポが合い、共同作業が心地よい縁です。']);
    if(rels.length===0)rels.push([62,'自由な学びの縁','特別な型に縛られない組み合わせ。だからこそ、二人だけの関係を自由に育てていけます。']);
    rels.sort((x,y)=>y[0]-x[0]);
    items.push({sys:'マヤ暦',icon:'🌞',score:rels[0][0],title:rels.map(r=>r[1]).join('・'),text:`あなたはKIN${ma.kin}(${SEALS[ma.seal].n})、${nameB}はKIN${mb.kin}(${SEALS[mb.seal].n})。`+rels.map(r=>r[2]).join('')});
  }
  /* 六星占術(運気周期) */
  const rka=calcRokusei(me),rkb=calcRokusei(pt);
  const dxa=ROKUSEI_STARS.indexOf(rka.star),dxb=ROKUSEI_STARS.indexOf(rkb.star);
  const dd=Math.min(Math.abs(dxa-dxb),6-Math.abs(dxa-dxb));
  const rk={
   0:[78,'同じ運命星','運気の波が同じリズムで巡る二人。良い時は共に飛躍し、低迷期は共に休む。「今は充電の時期だね」と言い合える強さがあります。'],
   1:[76,'隣り合う星','運気の波が2年違いで巡ります。相手の経験があなたの予習に、あなたの経験が相手の道しるべになります。'],
   2:[68,'四年差のリズム','運気の波が程よくずれた組み合わせ。相手の好調期に引っ張ってもらい、自分の好調期に恩返しを。'],
   3:[64,'正反対の運気周期','あなたの大殺界の時期に相手は絶頂期、その逆もまた然り。どちらかが沈む時、必ずどちらかが支えられる——実はとても心強い縁です。']
  }[dd];
  items.push({sys:'六星占術',icon:'⭐',score:rk[0],title:rk[1],text:`あなたは${rka.star}${rka.sign.slice(0,1)}、${nameB}は${rkb.star}${rkb.sign.slice(0,1)}。${rk[2]}`});
  /* 神社属性 */
  if(me.blood&&pt.blood){
    const zka=calcZokusei(me,me.blood),zkb=calcZokusei(pt,pt.blood);
    let zk;
    if(zka.attr===zkb.attr)zk={score:84,title:'同じ気脈を持つ二人',text:`どちらも「${zka.attr}属性」。相性の良い聖地も同じなので、二人でのパワースポット巡りは、効果も楽しさも倍増します。`};
    else if(ZOKUSEI_INFO[zka.attr].good.includes(zkb.attr))zk={score:90,title:'引き立て合う属性',text:`「${zka.attr}」と「${zkb.attr}」は、五芒星で結ばれた好相性。一緒にいるだけで互いの気が高まります。二人での神社参拝が最高の開運行動です。`};
    else zk={score:58,title:'異なる気質の二人',text:`「${zka.attr}」と「${zkb.attr}」は気の質が異なる組み合わせ。パワースポットはそれぞれの属性に合う場所へ。日常では、この違いがむしろ互いを補います。`};
    items.push(Object.assign({sys:'神社属性',icon:'⛩️'},zk));
  }
  /* 性格タイプ */
  if(me.mbti&&MBTI_TYPES[me.mbti]&&pt.mbti&&MBTI_TYPES[pt.mbti]){
    const A=me.mbti,B=pt.mbti;
    const shared=[0,1,2,3].filter(i=>A[i]===B[i]).length;
    let mb2;
    if(MBTI_TYPES[A].match.includes(B)||MBTI_TYPES[B].match.includes(A))mb2={score:92,title:'黄金の組み合わせ',text:`${A}と${B}は、互いの足りない部分を美しく埋め合う定番の好相性。安心と刺激のバランスが絶妙です。`};
    else if(A===B)mb2={score:78,title:'鏡のような二人',text:`同じ${A}同士。考え方の癖まで似ているので楽ですが、二人とも苦手なことは誰も拾いません。そこだけ意識を。`};
    else if(shared>=2)mb2={score:72,title:'近い価値観',text:`${A}と${B}は、4つの軸のうち${shared}つが同じ。世界の見方が近く、すれ違いの少ない組み合わせです。`};
    else mb2={score:66,title:'補完し合う二人',text:`${A}と${B}は、ほとんどの軸が正反対。最初は驚くことばかりでも、チームとしては死角のない最強の布陣です。`};
    const axes=[];
    if(A[0]!==B[0])axes.push('「にぎやかさ」と「静けさ」、互いの充電方法を尊重すること');
    if(A[1]!==B[1])axes.push('「現実の話」と「可能性の話」、どちらも大切に聞くこと');
    if(A[2]!==B[2])axes.push('「正しさ」と「気持ち」、結論の前に相手の判断軸に触れること');
    if(A[3]!==B[3])axes.push('「計画」と「ゆとり」、予定の立て方に幅を持たせること');
    if(axes.length)mb2.text+=`長続きの鍵は、${axes[0]}。`;
    items.push(Object.assign({sys:'性格タイプ',icon:'💠'},mb2));
  }
  return items;
}
function calcAishou(me,pt){
  const items=aishouItems(me,pt);
  const total=Math.round(items.reduce((a,x)=>a+x.score,0)/items.length);
  const verdict=total>=90?'星々が祝福する運命の縁':total>=82?'強く結ばれた良縁':total>=72?'育てるほどに輝く縁':total>=62?'学びと成長をもたらす縁':'魂を磨き合う挑戦の縁';
  const en=EN_WORDS[hashStr(`${me.y}-${me.m}-${me.d}|${pt.y}-${pt.m}-${pt.d}`)%EN_WORDS.length];
  return {items,total,verdict,en};
}

