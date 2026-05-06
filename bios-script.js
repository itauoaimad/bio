// ==========================================
// FF Bio Codes v2.0 - Main Script
// ==========================================

// تحويل كود اللون إلى HTML
function renderCode(code) {
    let r = String(code);
    r = r.replace(/\[b\]/gi,'').replace(/\[i\]/gi,'').replace(/\[u\]/gi,'').replace(/\[c\]/gi,'');
    r = r.replace(/\\n/g,'<br>').replace(/\n/g,'<br>');
    r = r.replace(/\[([0-9A-Fa-f]{6})\]/g,'</span><span style="color:#$1">');
    return '<span style="color:#ffffff">' + r + '</span>';
}

// تحجيم تلقائي
function autoScale(code) {
    const clean = code.replace(/\[[^\]]+\]/g,'').replace(/\\n|\n/g,'⏎');
    const lines = clean.split('⏎');
    const maxLen = Math.max(...lines.map(l=>l.length));
    if (maxLen > 35) return 0.62;
    if (maxLen > 25) return 0.78;
    if (maxLen > 18) return 0.9;
    return 1;
}

// إنشاء بطاقة
function mkCard(bio, idx, backPg) {
    const card = document.createElement('div');
    card.className = 'bio-card';
    card.style.animationDelay = Math.min(idx*0.03,0.4)+'s';
    const sc = autoScale(bio.code);
    card.innerHTML = `
        <div class="bio-prev">
        ${bio.premium ? '<div style="position:absolute;top:6px;left:6px;background:#ffd700;color:#000;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;z-index:2;">⭐</div>' : ''}
            <div class="bio-prev-inner" style="transform:scale(${sc})">${renderCode(bio.code)}</div>
        </div>
        <div class="bio-foot">
            <span class="bio-nm">${bio.name||''}</span>
            <span class="bio-cp">📋</span>
        </div>`;
    card.onclick = () => openDetail(bio, backPg||'pg-home');
    return card;
}

function renderIn(el, list, backPg) {
    el.innerHTML='';
    list.forEach((b,i)=>el.appendChild(mkCard(b,i,backPg)));
}

// Toast
function toast(msg) {
    const t=document.getElementById('toast');
    t.textContent=msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),3000);
}


// ========== AD SYSTEM ==========
let adPendingCode = '';
let adTimer = null;

function showAdVideo(code) {
    adPendingCode = code;
    const modal = document.getElementById('ad-modal');
    const timerEl = document.getElementById('ad-timer');
    const copyBtn = document.getElementById('ad-copy-btn');

    modal.style.display = 'flex';
    copyBtn.style.display = 'none';
    timerEl.textContent = '⏳ انتظر 5 ثوان...';
    timerEl.style.display = 'block';

    // ✅ تشغيل Social Bar مع المودال
    const socialScript = document.createElement('script');
    socialScript.src = 'https://pl29348799.profitablecpmratenetwork.com/1a/41/b4/1a41b44b67233fd170cbe9a61e33a3f0.js';
    document.body.appendChild(socialScript);

    let sec = 5;
    adTimer = setInterval(() => {
        sec--;
        timerEl.textContent = '⏳ انتظر ' + sec + ' ثوان...';
        if (sec <= 0) {
            clearInterval(adTimer);
            timerEl.style.display = 'none';
            copyBtn.style.display = 'block';
        }
    }, 1000);
}
function skipAd() {
    clearInterval(adTimer);
    document.getElementById('ad-timer').style.display = 'none';
    document.getElementById('ad-skip-btn').style.display = 'none';
    document.getElementById('ad-copy-btn').style.display = 'block';
}

function adCopyBio() {
    navigator.clipboard.writeText(adPendingCode).then(() => {
        document.getElementById('ad-modal').style.display = 'none';
        toast('✅ Bio Copied!');
    });
}
// ---- PAGES ----
function showPg(id) {
    document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
    if(id==='pg-all'){
        renderIn(document.getElementById('all-grid'),allBios,'pg-all');
        document.getElementById('all-count').textContent=allBios.length;
    }
    if(id==='pg-editor') initEd();
    if(id==='pg-search'){
        document.getElementById('srch-empty').style.display='block';
        document.getElementById('srch-grid').innerHTML='';
        setTimeout(()=>document.getElementById('srch-inp').focus(),100);
    }
}

// Home tab selection
function selTab(btn,cat){
    document.querySelectorAll('.tpill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderIn(document.getElementById('home-grid'),allBios.filter(b=>b.category===cat).slice(0,8),'pg-home');
}

// Show category
function showCat(cat){
    const list=allBios.filter(b=>b.category===cat);
    document.getElementById('cat-ttl').textContent=cat.toUpperCase()+' BIOS';
    document.getElementById('cat-cnt').textContent=list.length;
    renderIn(document.getElementById('cat-grid'),list,'pg-cat');
    showPg('pg-cat');
    document.getElementById('cat-grid').closest('.pg').querySelector('.bk').onclick=()=>showPg('pg-home');
}

// Filter all
function filterAll(cat,btn){
    document.querySelectorAll('.fc').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const list=cat==='all'?allBios:allBios.filter(b=>b.category===cat);
    renderIn(document.getElementById('all-grid'),list,'pg-all');
    document.getElementById('all-count').textContent=list.length;
}

// Search
function doSearch(){
    const q=document.getElementById('srch-inp').value.trim().toLowerCase();
    const grid=document.getElementById('srch-grid');
    const empty=document.getElementById('srch-empty');
    if(!q){grid.innerHTML='';empty.style.display='block';empty.innerHTML='🔍<br><small>Start typing...</small>';return;}
    const found=allBios.filter(b=>(b.name&&b.name.toLowerCase().includes(q))||b.code.toLowerCase().includes(q)||(b.category&&b.category.includes(q)));
    empty.style.display=found.length?'none':'block';
    if(!found.length){empty.innerHTML='😔<br><small>No results for "'+q+'"</small>';grid.innerHTML='';}
    else renderIn(grid,found,'pg-search');
}

// ==========================================
// DETAIL PAGE
// ==========================================
let curBio=null, detBk='pg-home', detColors=[], detTexts=[];

function openDetail(bio, backPg){
    curBio=bio; detBk=backPg;
    showPg('pg-detail');
    document.getElementById('det-bk').onclick=()=>showPg(backPg);

    // استخراج الألوان
    const cm=bio.code.match(/\[([0-9A-Fa-f]{6})\]/gi)||[];
    detColors=[...new Set(cm.map(c=>'#'+c.replace(/[\[\]]/g,'').toLowerCase()))].slice(0,5);

    // استخراج النصوص القابلة للتعديل - كل سطر
    detTexts=[];
    const fullCode=bio.code.replace(/\\n/g,'\n');
    fullCode.split('\n').forEach(line=>{
        const txt=line.replace(/\[[0-9A-Fa-f]{6}\]/gi,'').replace(/\[b\]|\[i\]|\[c\]|\[u\]/gi,'').trim();
        if(txt && txt.length>=1 && /[a-zA-Z0-9\u0600-\u06FF]/.test(txt) && !detTexts.includes(txt)){
            detTexts.push(txt);
        }
    });

    setTimeout(()=>{
        renderDetInputs();
        renderDetColors();
        updDet();
    },60);
}

function renderDetInputs(){
    const wrap=document.getElementById('det-inputs');
    if(!wrap) return;
    wrap.innerHTML='';
    if(!detTexts.length){
        wrap.innerHTML='<p style="color:#777;font-size:12px;text-align:center;padding:8px">لا يوجد نص قابل للتعديل</p>';
        return;
    }
    detTexts.forEach((txt,i)=>{
        const inp=document.createElement('input');
        inp.type='text'; inp.className='det-inp';
        inp.value=txt; inp.placeholder=txt;
        inp.dir='ltr'; inp.oninput=updDet;
        inp.id='di-'+i;
        wrap.appendChild(inp);
    });
}

function renderDetColors(){
    const wrap=document.getElementById('det-colors');
    if(!wrap) return;
    wrap.innerHTML='';
    detColors.forEach((c,i)=>{
        const item=document.createElement('div');
        item.className='dc-item';
        item.innerHTML=`<input type="color" class="dc-sw" value="${c}" id="dc-${i}"><span class="dc-lb">Color ${i+1}</span>`;
        item.querySelector('input').addEventListener('input',e=>{detColors[i]=e.target.value;updDet();});
        wrap.appendChild(item);
    });
}

function getDetCode(){
    if(!curBio) return '';
    let code=curBio.code.replace(/\\n/g,'\n');
    // استبدال النصوص
    detTexts.forEach((orig,i)=>{
        const el=document.getElementById('di-'+i);
        if(el && el.value && el.value!==orig) code=code.replaceAll(orig,el.value);
    });
    // استبدال الألوان
    const origCols=[...new Set((curBio.code.match(/\[([0-9A-Fa-f]{6})\]/gi)||[]).map(c=>c.toLowerCase()))];
    origCols.forEach((oc,i)=>{
        if(detColors[i]) code=code.replace(new RegExp(oc.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'['+detColors[i].replace('#','')+']');
    });
    return code;
}

function updDet(){
    const prev=document.getElementById('det-preview');
    if(prev && curBio) prev.innerHTML=renderCode(getDetCode());
}

function copyDet(){
    const code = getDetCode();
    if(curBio && curBio.premium){
        showAdVideo(code);
    } else {
        // ✅ SmartLink يفتح كل مرة
        window.open('https://www.profitablecpmratenetwork.com/k62ytna8c?key=893628396662fcc931588e140d2c0fb8', '_blank');
        navigator.clipboard.writeText(code).then(()=>toast('✅ Bio Copied!'));
    }
}

// ==========================================
// EDITOR
// ==========================================
const edTpls=[
    {name:'Plain',sub:'plain',tpl:'[NAME]'},
    {name:'UPPER',sub:'UP',tpl:'[NAME_U]'},
    {name:'lower',sub:'lo',tpl:'[NAME_L]'},
    {name:'Viral',sub:'viral',tpl:'[FF0000]VIRAL MODE ON\n[ffd700][NAME]'},
    {name:'Pro',sub:'pro',tpl:'[00ffcc]── PRO ──\n[ffffff][NAME]'},
    {name:'King',sub:'king',tpl:'[ffd700]♛ KING ♛\n[ffffff][NAME]'},
    {name:'Fire',sub:'fire',tpl:'[ff4400]■デ━━━\n[ffffff][ [ff0000][NAME] [ffffff]]\n[ff4400]■デ━━━'},
    {name:'Hype',sub:'hype',tpl:'[ff00ff]HYPE MODE\n[00ffff][NAME]'},
    {name:'Elite',sub:'elite',tpl:'[ffd700]◆ ELITE ◆\n[ffffff][NAME]'},
    {name:'Alert',sub:'alert',tpl:'[ff00ff]╔═══════╗\n[ffffff]VIRAL ALERT\n[ffd700][NAME]\n[ff00ff]╚═══════╝'},
    {name:'Boss',sub:'boss',tpl:'[ff0000]━[ [ffd700]BOSS [ff0000]]━\n[ffffff][NAME]'},
    {name:'Legend',sub:'lgnd',tpl:'[ffd700]✦ LEGEND ✦\n[ffffff][NAME]\n[ffd700]─────────'},
    {name:'Shadow',sub:'shdw',tpl:'[808080]░░[ [ffffff][NAME] [808080]]░░'},
    {name:'Matrix',sub:'mtrx',tpl:'[00ff00]01001 10110\n[ffffff][NAME]\n[00ff00]10110 01001'},
];
let curTpl=edTpls[0], edCols=['#FF0000','#FFFF00','#00FFCC'];

function initEd(){
    renderEdChips(); renderEdCols(); updEd();
}
function renderEdChips(){
    const c=document.getElementById('ed-chips'); c.innerHTML='';
    edTpls.forEach((t,i)=>{
        const ch=document.createElement('button');
        ch.className='ed-chip'+(i===0?' active':'');
        ch.innerHTML=`${t.name}<span>${t.sub}</span>`;
        ch.onclick=()=>{document.querySelectorAll('.ed-chip').forEach(x=>x.classList.remove('active'));ch.classList.add('active');curTpl=t;updEd();};
        c.appendChild(ch);
    });
}
function renderEdCols(){
    const g=document.getElementById('ec-grid'); g.innerHTML='';
    edCols.forEach((c,i)=>{
        const item=document.createElement('div'); item.className='ec-item';
        item.innerHTML=`<input type="color" class="ec-sw" value="${c}"><span class="ec-lb">Color ${i+1}</span><span class="ec-rm">Remove</span>`;
        item.querySelector('input').addEventListener('input',e=>{edCols[i]=e.target.value;updEd();});
        item.querySelector('.ec-rm').onclick=()=>{edCols.splice(i,1);renderEdCols();updEd();};
        g.appendChild(item);
    });
}
function getEdCode(){
    const n=document.getElementById('ed-name').value||'PRO Player';
    let c=curTpl.tpl;
    c=c.replace(/\[NAME_U\]/g,n.toUpperCase()).replace(/\[NAME_L\]/g,n.toLowerCase()).replace(/\[NAME\]/g,n);
    return c;
}
function updEd(){
    const c=getEdCode();
    document.getElementById('ep-box').innerHTML=renderCode(c);
    const clean=c.replace(/\[[^\]]+\]/g,'').replace(/\\n|\n/g,'');
    const cnt=document.getElementById('ep-cnt');
    cnt.textContent=clean.length+'/50';
    cnt.style.color=clean.length>50?'#ff3c3c':'#ffd700';
}
function copyEd(){navigator.clipboard.writeText(getEdCode()).then(()=>toast('✅ Bio Copied!'));}
function shareEd(){const c=getEdCode();if(navigator.share)navigator.share({text:c});else navigator.clipboard.writeText(c).then(()=>toast('✅ Copied!'));}

// ==========================================
// SETTINGS
// ==========================================
let isDark=true;

function togDark(){
    isDark=!isDark;
    document.body.classList.toggle('dark',isDark);
    document.body.classList.toggle('light',!isDark);
    document.getElementById('dark-tg').classList.toggle('on',isDark);
    localStorage.setItem('darkMode',isDark);
}

// Language
const langs={
    ar:{name:'العربية 🇸🇦',dir:'rtl',lang:'ar'},
    en:{name:'English 🇺🇸',dir:'ltr',lang:'en'},
    fr:{name:'Français 🇫🇷',dir:'ltr',lang:'fr'},
    tr:{name:'Türkçe 🇹🇷',dir:'ltr',lang:'tr'},
};
let curLang='ar';

function togLangPicker(){
    const p=document.getElementById('lang-picker');
    p.classList.toggle('open');
    document.getElementById('lang-arr').textContent=p.classList.contains('open')?'▼':'›';
}

function setLang(code,btn){
    curLang=code;
    const l=langs[code];
    document.getElementById('lang-cur').textContent=l.name;
    document.documentElement.setAttribute('lang',l.lang);
    document.documentElement.setAttribute('dir',l.dir);
    document.querySelectorAll('.lang-opt').forEach(o=>o.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('lang-picker').classList.remove('open');
    document.getElementById('lang-arr').textContent='›';
    localStorage.setItem('lang',code);
    toast('✅ '+l.name);
}

function shareApp(){
    if(navigator.share) navigator.share({title:'FF Bio Codes',url:window.location.href});
    else {navigator.clipboard.writeText(window.location.href);toast('✅ Link Copied!');}
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded',()=>{
    // إخفاء اللودر
    const hideLd=()=>{const l=document.getElementById('loader');if(l){l.classList.add('hidden');setTimeout(()=>l.remove(),500);}};
    window.addEventListener('load',hideLd);
    setTimeout(hideLd,2500);

    // استرجاع الإعدادات
    const savedDark=localStorage.getItem('darkMode');
    if(savedDark==='false'){isDark=false;document.body.classList.remove('dark');document.body.classList.add('light');}
    else document.getElementById('dark-tg').classList.add('on');

    const savedLang=localStorage.getItem('lang');
    if(savedLang && langs[savedLang]){
        curLang=savedLang;
        document.getElementById('lang-cur').textContent=langs[savedLang].name;
        document.documentElement.setAttribute('lang',langs[savedLang].lang);
        document.documentElement.setAttribute('dir',langs[savedLang].dir);
        document.querySelectorAll('.lang-opt').forEach(o=>{
            if(o.onclick.toString().includes("'"+savedLang+"'")) o.classList.add('active');
            else o.classList.remove('active');
        });
    }

    // عرض أول تصنيف
    const list=allBios.filter(b=>b.category==='ألعاب').slice(0,8);
    renderIn(document.getElementById('home-grid'),list,'pg-home');
});
