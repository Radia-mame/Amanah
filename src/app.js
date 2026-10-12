'use strict';
/* Amanah: track money you lend and borrow. Everything is saved on this phone. */
var KEY='amanah.v1',DAY=86400000,storageOK=true,db=null;
var uid=function(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3);};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(n){return Math.round(Number(n)||0).toLocaleString('en-US');};
var num=function(v){var n=parseFloat(String(v==null?'':v).replace(/,/g,''));return isFinite(n)&&n>0?n:0;};
var $=function(s){return document.querySelector(s);};
var find=function(a,id){for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;};
var sum=function(a,f){return a.reduce(function(t,x){return t+(f(x)||0);},0);};
var T=function(k,v){var s=String(k);if(v)s=s.replace(/\{(\w+)\}/g,function(m,n){return v[n]!=null?v[n]:m;});return s;};
var pad=function(n){return n<10?'0'+n:''+n;};
var startOfDay=function(t){var d=new Date(t);d.setHours(0,0,0,0);return d.getTime();};
var addDays=function(t,n){var d=new Date(t);d.setDate(d.getDate()+n);return d.getTime();};
var ymd=function(t){var d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
var fromYmd=function(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]).getTime():0;};
var fmtDate=function(t){return new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});};
var fmtTime=function(t){return new Date(t).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};
var extend=function(a,b){for(var k in b)if(Object.prototype.hasOwnProperty.call(b,k))a[k]=b[k];return a;};
var getPath=function(o,p){p=p.split('.');for(var i=0;i<p.length&&o!=null;i++)o=o[p[i]];return o;};

/* ---------- data ---------- */
function defaults(){return {lang:'en',mode:'dark',palette:'mono',ui:2,textSize:'normal',pin:'',backupAt:0,remindLang:'en'};}
function emptyDb(){return {v:1,demo:false,settings:defaults(),people:[],loans:[],activity:[]};}
function load(){try{var s=localStorage.getItem(KEY);if(s){var o=JSON.parse(s);if(o&&Array.isArray(o.loans)&&Array.isArray(o.people)){o.settings=Object.assign(defaults(),o.settings||{});if(o.settings.ui!==2){o.settings.ui=2;o.settings.palette='mono';o.settings.mode='dark';}o.activity=o.activity||[];return o;}}}catch(e){storageOK=false;}return null;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){storageOK=false;toast(T('Could not save. Storage may be full (photos use a lot).'));}}
function log(k,v){db.activity.push({id:uid(),ts:Date.now(),k:k,v:v||{}});if(db.activity.length>3000)db.activity.splice(0,db.activity.length-3000);}
function seed(){
  var t=Date.now(),ago=function(d){return t-d*DAY;},fut=function(d){return startOfDay(t)+d*DAY;},o=emptyDb();o.demo=true;
  o.people=[['p1','Abebe','0911223344'],['p2','Hana','0922334455'],['p3','Dawit','0933445566'],['p4','Sara',''],['p5','Ahmed','0944556677'],['p6','Tigist','0955667788'],['p7','Yonas','']].map(function(x){return {id:x[0],name:x[1],phone:x[2],demo:true};});
  var L=function(id,dir,pid,amt,age,due,note,pays,status){return {id:id,dir:dir,pid:pid,amount:amt,ts:ago(age),due:due,note:note,photo:'',status:status||'open',payments:(pays||[]).map(function(p,i){return {id:id+'p'+i,ts:ago(p[0]),amount:p[1],note:''};}),demo:true};};
  o.loans=[
    L('l1','lent','p1',20000,30,fut(-5),'For his shop rent',[[12,5000]]),
    L('l2','lent','p2',3000,10,fut(2),'School fees',[]),
    L('l3','lent','p3',50000,60,fut(20),'Car repair',[[40,10000],[15,10000]]),
    L('l4','lent','p4',1500,5,0,'',[]),
    L('l5','borrowed','p5',8000,12,fut(0),'Stock money',[]),
    L('l6','borrowed','p6',25000,20,fut(10),'',[[8,5000]]),
    L('l7','lent','p7',2000,40,fut(-20),'',[[30,2000]]),
    L('l8','lent','p2',700,50,0,'Forgiven',[],'forgiven'),
    L('l9','borrowed','p5',1200,15,fut(-3),'',[]),
    L('l10','lent','p4',500,25,0,'Wedding gift',[],'gift')
  ];
  o.activity=[{id:'a1',ts:ago(5),k:'Loan added: {n} {a} Birr ({d})',v:{n:'Sara',a:'1,500',d:'lent'},demo:true},{id:'a2',ts:ago(12),k:'Payment of {a} Birr: {n}',v:{a:'5,000',n:'Abebe'},demo:true}];
  return o;
}

/* ---------- loan maths ---------- */
var paidOf=function(l){return sum(l.payments,function(p){return p.amount;});};
var balOf=function(l){return Math.max(0,l.amount-paidOf(l));};
var active=function(l){return l.status==='open'&&balOf(l)>0;};
var person=function(id){return find(db.people,id)||{name:'?',phone:''};};
function dueIn(l){if(!active(l)||!l.due)return null;return Math.round((startOfDay(l.due)-startOfDay(Date.now()))/DAY);}
function totals(){var a=0,b=0;db.loans.forEach(function(l){if(!active(l))return;if(l.dir==='lent')a+=balOf(l);else b+=balOf(l);});return {lent:a,owe:b};}
function loanTag(l){
  if(l.status==='forgiven')return {t:T('Forgiven'),k:'gray'};if(l.status==='gift')return {t:T('Gift'),k:'gray'};
  if(balOf(l)<=0)return {t:T('Settled'),k:'good'};
  var d=dueIn(l);if(d==null)return null;
  if(d<0)return {t:T('Overdue {n} days',{n:-d}),k:'bad'};if(d===0)return {t:T('Due today'),k:'warn'};if(d<=3)return {t:T('Due in {n} days',{n:d}),k:'warn'};
  return {t:T('Due {d}',{d:fmtDate(l.due)}),k:'gray'};
}
function alerts(){
  var out=[];
  db.loans.forEach(function(l){
    var d=dueIn(l);if(d==null||d>3)return;var nm=person(l.pid).name,a=fmt(balOf(l));
    out.push({id:l.id,d:d,sev:d<0?'bad':'warn',t:l.dir==='lent'?T('{n} owes you {a} Birr',{n:nm,a:a}):T('You owe {n} {a} Birr',{n:nm,a:a}),s:d<0?T('Overdue by {n} days',{n:-d}):d===0?T('Due today'):T('Due in {n} days',{n:d})});
  });
  return out.sort(function(a,b){return a.d-b.d;});
}
function personNet(pid){var n=0;db.loans.forEach(function(l){if(l.pid===pid&&active(l))n+=l.dir==='lent'?balOf(l):-balOf(l);});return n;}

/* ---------- state ---------- */
var state={tab:'home',side:'lent',filter:'all',q:'',pages:[],sheet:null,f:{},conf:null,locked:false,pin:''};
var tag=function(t,k){return '<span class="tag '+k+'">'+esc(t)+'</span>';};
var btn=function(a,label,cls,o){o=o||{};return '<button type="button" class="btn'+(cls?' '+cls:'')+' wide" data-a="'+a+'"'+(o.id?' data-id="'+esc(o.id)+'"':'')+(o.v!=null?' data-v="'+esc(o.v)+'"':'')+'>'+(o.icon?ic(o.icon,18,2):'')+esc(label)+'</button>';};
var btns=function(a,b){return '<div class="btns">'+a+b+'</div>';};
var kv=function(k,v){return '<div class="kv"><span>'+esc(k)+'</span><span>'+v+'</span></div>';};
var errBox=function(){return '<p class="err" id="sheetErr" role="alert" hidden></p>';};
function F(id,d){var v=state.f[id];return v==null?(d==null?'':d):v;}
function fInput(id,label,o){o=o||{};return '<label class="field" for="'+id+'">'+esc(label)+'<input id="'+id+'" data-f'+(o.type?' type="'+o.type+'"':'')+(o.im?' inputmode="'+o.im+'"':'')+(o.list?' list="'+o.list+'"':'')+(o.max?' max="'+o.max+'"':'')+(o.ml?' maxlength="'+o.ml+'"':'')+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+' autocomplete="off" value="'+esc(F(id,o.def))+'"></label>';}
function fArea(id,label,o){o=o||{};return '<label class="field" for="'+id+'">'+esc(label)+'<textarea id="'+id+'" data-f>'+esc(F(id,o.def))+'</textarea></label>';}
function seg(opts,cur,a){return '<div class="seg" role="group">'+opts.map(function(o){return '<button type="button" data-a="'+a+'" data-v="'+esc(o.v)+'" aria-pressed="'+(String(cur)===String(o.v))+'">'+esc(o.t)+'</button>';}).join('')+'</div>';}
function chips(opts,cur,a){return '<div class="chips" role="group">'+opts.map(function(o){return '<button type="button" class="chip" data-a="'+a+'" data-v="'+esc(o.v)+'" aria-pressed="'+(String(cur)===String(o.v))+'">'+esc(o.t)+'</button>';}).join('')+'</div>';}
function pagehead(t,right){return '<header class="pagehead"><button class="iconbtn" data-a="back" aria-label="'+esc(T('Back'))+'">'+ic(I.back,22,2)+'</button><h1>'+esc(t)+'</h1>'+(right||'')+'</header>';}
function topbar(t,sub,right){return '<header class="top"><div><h1>'+esc(t)+'</h1>'+(sub?'<p class="sub">'+esc(sub)+'</p>':'')+'</div>'+(right?'<div class="acts">'+right+'</div>':'')+'</header>';}
function avatar(n){return '<span class="grade gB" style="border-radius:50%">'+esc((n||'?').trim().charAt(0).toUpperCase())+'</span>';}
function empty(t){return '<p class="empty">'+esc(t)+'</p>';}

/* ---------- screens ---------- */
function loanRow(l){
  var p=person(l.pid),tg=loanTag(l),b=balOf(l),pc=paidOf(l);
  return '<button class="row" data-a="loan" data-id="'+l.id+'">'+avatar(p.name)+'<span class="grow"><b>'+esc(p.name)+'</b><small>'+esc(l.note||fmtDate(l.ts))+'</small>'+(tg?'<span class="tags">'+tag(tg.t,tg.k)+'</span>':'')+
    (pc>0&&b>0?'<span class="progress" style="margin-top:6px"><i style="width:'+Math.min(100,Math.round(pc/l.amount*100))+'%"></i></span>':'')+'</span><span class="end"><b class="num">'+fmt(b>0&&l.status==='open'?b:l.amount)+'</b><small>'+(pc>0&&b>0?esc(T('of {n}',{n:fmt(l.amount)})):esc(T('Birr')))+'</small></span></button>';
}
function loanList(){
  var q=state.q.trim().toLowerCase(),f=state.filter;
  var list=db.loans.filter(function(l){
    if(l.dir!==state.side)return false;var d=dueIn(l);
    if(f==='all'&&!active(l))return false;
    if(f==='overdue'&&!(d!=null&&d<0))return false;
    if(f==='soon'&&!(d!=null&&d>=0&&d<=7))return false;
    if(f==='done'&&active(l))return false;
    if(q&&(person(l.pid).name+' '+(l.note||'')).toLowerCase().indexOf(q)<0)return false;
    return true;
  }).sort(function(a,b){var da=dueIn(a),db_=dueIn(b);if(da==null&&db_==null)return b.ts-a.ts;if(da==null)return 1;if(db_==null)return -1;return da-db_;});
  return list.length?list.map(loanRow).join(''):empty(f==='done'?T('Nothing settled yet.'):T('Nothing here. Tap + to add a loan.'));
}
function viewHome(){
  var t=totals(),al=alerts(),n=al.length;
  return topbar(db.demo?T('Amanah (example data)'):'Amanah',new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),'<button class="iconbtn" data-a="tab" data-v="alerts" aria-label="'+esc(T('Notifications'))+'">'+ic(I.bell,22)+(n?'<span class="badge">'+n+'</span>':'')+'</button>')+
  '<section class="hero"><div class="stats" style="border:none;padding:0;grid-template-columns:1fr 1fr"><div><div class="label">'+esc(T('People owe you'))+'</div><b class="num" style="font-size:26px">'+fmt(t.lent)+'</b></div><div><div class="label">'+esc(T('You owe'))+'</div><b class="num" style="font-size:26px">'+fmt(t.owe)+'</b></div></div><div class="stats" style="grid-template-columns:1fr"><div><div class="label">'+esc(T('Net position'))+'</div><b class="num">'+(t.lent-t.owe>=0?'+':'-')+fmt(Math.abs(t.lent-t.owe))+' '+esc(T('Birr'))+'</b></div></div></section>'+
  (n?'<button class="banner" data-a="tab" data-v="alerts" style="width:100%;text-align:left;border:none"><span>'+esc(T('{n} repayments need attention',{n:n}))+'</span>'+ic(I.chev,18)+'</button>':'')+
  seg([{v:'lent',t:T('I lent')},{v:'borrowed',t:T('I borrowed')}],state.side,'side')+
  '<label class="search">'+ic(I.search,20)+'<input id="q" type="search" placeholder="'+esc(T('Search name or note'))+'" aria-label="'+esc(T('Search'))+'" value="'+esc(state.q)+'" data-live="list" autocomplete="off"></label>'+
  chips([{v:'all',t:T('Open')},{v:'overdue',t:T('Overdue')},{v:'soon',t:T('Due in 7 days')},{v:'done',t:T('Settled')}],state.filter,'filter')+
  '<section class="card flush" id="list">'+loanList()+'</section>';
}
function viewPeople(){
  var rows=db.people.slice().sort(function(a,b){return Math.abs(personNet(b.id))-Math.abs(personNet(a.id));}).map(function(p){
    var n=personNet(p.id);
    return '<button class="row" data-a="person" data-id="'+p.id+'">'+avatar(p.name)+'<span class="grow"><b>'+esc(p.name)+'</b><small>'+esc(p.phone||T('No phone'))+'</small></span><span class="end"><b class="num" style="color:'+(n>0?'var(--good)':n<0?'var(--bad)':'var(--ink)')+'">'+fmt(Math.abs(n))+'</b><small>'+esc(n>0?T('owes you'):n<0?T('you owe'):T('settled'))+'</small></span></button>';
  }).join('');
  return topbar(T('People'),T('{n} people',{n:db.people.length}))+'<section class="card flush">'+(rows||empty(T('No people yet.')))+'</section>';
}
function viewAlerts(){
  var al=alerts();
  return topbar(T('Notifications'),T('Repayments due soon or late'))+'<section class="card flush">'+(al.length?al.map(function(a){return '<button class="row" data-a="loan" data-id="'+a.id+'"><span style="width:10px;height:10px;border-radius:50%;flex:none;background:'+(a.sev==='bad'?'var(--bad)':'#D98A00')+'"></span><span class="grow"><b>'+esc(a.t)+'</b><small>'+esc(a.s)+'</small></span>'+ic(I.chev,18)+'</button>';}).join(''):empty(T('Nothing is due soon. Good.')))+'</section>'+'<p class="sub">'+esc(T('Alerts show inside the app when you open it. Phone notifications need a server and will come in a later version.'))+'</p>';
}
function viewSettings(){
  var s=db.settings,sw=Object.keys(PALETTES).map(function(k){var p=PALETTES[k],c=p[isDark()?'dark':'light'];return '<button type="button" class="swatch" data-a="palette" data-v="'+k+'" aria-pressed="'+(s.palette===k)+'"><span class="dots"><i style="background:'+c.hero+'"></i><i style="background:'+c.accent+'"></i><i style="background:'+c['accent-soft']+'"></i></span><span>'+esc(p.name)+'</span></button>';}).join('');
  return topbar(T('Settings'))+
  '<section class="card form"><h3 style="margin:0">'+esc(T('Appearance'))+'</h3>'+seg([{v:'auto',t:T('Automatic')},{v:'light',t:T('Light')},{v:'dark',t:T('Dark')}],s.mode,'mode')+'<div class="swatches">'+sw+'</div>'+seg([{v:'normal',t:T('Normal text')},{v:'large',t:T('Large text')}],s.textSize,'size')+'</section>'+
  '<section class="card form"><h3 style="margin:0">'+esc(T('Reminder message language'))+'</h3>'+seg([{v:'en',t:'English'},{v:'am',t:'አማርኛ'},{v:'om',t:'Afaan Oromoo'}],s.remindLang,'rlang')+'<small>'+esc(T('The app screens are in English for now. Reminder messages can be sent in the language you choose. Translations are a first draft.'))+'</small></section>'+
  '<section class="card form"><h3 style="margin:0">'+esc(T('App lock'))+'</h3><small>'+esc(T('A 4-digit PIN hides your loans when someone else holds your phone. It is a screen lock, not encryption.'))+'</small>'+(s.pin?btns(btn('pinSet',T('Change PIN'),''),btn('pinOff',T('Turn off'),'danger')):btn('pinSet',T('Set a PIN'),''))+'</section>'+
  '<section class="card form"><h3 style="margin:0">'+esc(T('Backup'))+'</h3><small>'+esc(s.backupAt?T('Last backup: {d}',{d:fmtDate(s.backupAt)}):T('No backup yet. Your data lives only on this phone.'))+'</small>'+
  btn('backup',T('Download backup file'),'',{icon:I.download})+btn('copyBackup',T('Copy backup text'),'')+btn('csv',T('Export loans to Excel'),'')+
  '<label class="field" for="bk_in"><span>'+esc(T('Restore: paste backup text'))+'</span><textarea id="bk_in" data-f>'+esc(F('bk_in'))+'</textarea></label>'+errBox()+btn('restore',T('Restore from text'),'')+'<input type="file" id="bk_file" accept=".json,text/plain" hidden>'+btn('pickBackup',T('Restore from file'),'')+'</section>'+
  '<section class="card form">'+btn('activity',T('Activity history'),'')+(db.demo?btn('clearDemo',T('Remove example data'),''):'')+btn('resetAll',T('Erase everything'),'danger')+'</section>';
}
function viewActivity(){
  var l=db.activity.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,300);
  return pagehead(T('Activity history'))+'<section class="card flush">'+(l.length?l.map(function(a){return '<div class="row" style="min-height:52px"><span class="grow"><b style="font-weight:600">'+esc(T(a.k,a.v))+'</b><small>'+esc(fmtDate(a.ts)+', '+fmtTime(a.ts))+'</small></span></div>';}).join(''):empty(T('Nothing recorded yet.')))+'</section>';
}
function viewLock(){
  var d='';for(var i=0;i<4;i++)d+='<i class="'+(i<state.pin.length?'on':'')+'"></i>';
  var keys=['1','2','3','4','5','6','7','8','9','','0','del'].map(function(k){return k===''?'<span></span>':'<button type="button" data-a="pinKey" data-v="'+k+'" aria-label="'+(k==='del'?esc(T('Delete')):k)+'">'+(k==='del'?'&#9003;':k)+'</button>';}).join('');
  return '<div class="lockbox"><h1 style="text-align:center">Amanah</h1><p class="sub" style="text-align:center">'+esc(T('Enter your PIN'))+'</p><div class="dots">'+d+'</div><p class="err" id="lockErr" role="alert" hidden>'+esc(T('Wrong PIN'))+'</p><div class="pad">'+keys+'</div></div>';
}

/* ---------- sheets ---------- */
var REMIND={
  en:{polite:'Hello {name}, I hope you are well. A kind reminder about the {amt} Birr I lent you{due}. Thank you.',firm:'Hello {name}, your payment of {amt} Birr was due{due}. Please pay today, or tell me when you will.'},
  am:{polite:'ሰላም {name}፣ ደህና ነዎት? ያበደርኩዎትን {amt} ብር{due} ለማስታወስ ያህል ነው። እናመሰግናለን።',firm:'ሰላም {name}፣ የ{amt} ብር ክፍያዎ የሚገባበት ቀን{due} ነበር። እባክዎ ዛሬ ይክፈሉ ወይም መቼ እንደሚከፍሉ ያሳውቁኝ።'},
  om:{polite:'Akkam {name}, nagaan jirtuu? Qarshii {amt} Birrii isiniif liqeessee{due} yaadachiisuuf barreesse. Galatoomaa.',firm:'Akkam {name}, kaffaltiin Birrii {amt}{due} kaffalamuu qaba ture. Maaloo har\'a kaffalaa, yookaan yeroo kaffaltan natti himaa.'}
};
function remindText(l,tone,lang){
  var due=l.due?{en:' (due '+fmtDate(l.due)+')',am:' (የሚገባበት '+fmtDate(l.due)+')',om:' (guyyaa '+fmtDate(l.due)+')'}[lang]:'';
  return REMIND[lang][tone].replace('{name}',person(l.pid).name).replace('{amt}',fmt(balOf(l))).replace('{due}',due);
}
function waNumber(ph){var d=String(ph||'').replace(/\D/g,'');if(d.charAt(0)==='0')d='251'+d.slice(1);return d;}
function personLoans(pid){return db.loans.filter(function(l){return l.pid===pid;}).sort(function(a,b){return b.ts-a.ts;});}
var SHEETS={
  quick:function(){var q=function(a,ic_,t,v){return '<button type="button" data-a="'+a+'"'+(v?' data-v="'+v+'"':'')+'><span class="ci">'+ic(ic_,24)+'</span>'+esc(t)+'</button>';};return {title:T('Add a loan'),body:'<div class="qa">'+q('addLoan',I.wallet,T('I lent money'),'lent')+q('addLoan',I.download,T('I borrowed money'),'borrowed')+'</div>'};},
  loanForm:function(s){
    var l=s.id?find(db.loans,s.id):null;if(s.id&&!l)return null;var dir=F('f_dir','lent');
    var names=db.people.map(function(p){return '<option value="'+esc(p.name)+'">';}).join('');
    var body='<div class="form">'+(l?'':seg([{v:'lent',t:T('I lent')},{v:'borrowed',t:T('I borrowed')}],dir,'fDir'))+'<datalist id="ppl">'+names+'</datalist>'+
      fInput('f_name',dir==='lent'?T('Who did you lend to?'):T('Who lent you?'),{list:'ppl'})+fInput('f_phone',T('Phone (optional, for reminders)'),{type:'tel',im:'tel'})+
      '<div class="grid2">'+fInput('f_amt',T('Amount (Birr)'),{im:'numeric'})+fInput('f_date',T('Date'),{type:'date',max:ymd(Date.now())})+'</div>'+
      fInput('f_due',T('Repayment date (optional)'),{type:'date'})+
      '<div class="chips">'+[7,14,30,60].map(function(d){return '<button type="button" class="chip" data-a="dueIn" data-v="'+d+'">'+esc(T('In {n} days',{n:d}))+'</button>';}).join('')+'<button type="button" class="chip" data-a="dueIn" data-v="0">'+esc(T('No date'))+'</button></div>'+
      fInput('f_note',T('Note (optional)'),{ph:T('What was it for?')});
    if(!l){body+='<div class="field">'+esc(T('Proof photo (optional)'))+'</div>'+(F('f_photo')?'<img src="'+F('f_photo')+'" alt="" style="max-width:100%;border-radius:14px">'+btn('photoClear',T('Remove photo'),''):btn('photoPick',T('Take or choose a photo'),'',{icon:I.camera}));}
    return {title:l?T('Edit loan'):T('Add a loan'),body:body+errBox()+btn('loanSave',T('Save'),'primary')+'</div>'};
  },
  loan:function(s){
    var l=find(db.loans,s.id);if(!l)return null;var p=person(l.pid),tg=loanTag(l),b=balOf(l),lent=l.dir==='lent';
    var body=(tg?'<div class="tags">'+tag(tg.t,tg.k)+'</div>':'')+'<div>'+kv(T('Person'),'<button class="link" data-a="person" data-id="'+l.pid+'" style="min-height:0">'+esc(p.name)+'</button>')+kv(lent?T('You lent'):T('You borrowed'),'<b class="num">'+fmt(l.amount)+' '+esc(T('Birr'))+'</b>')+kv(T('Paid back'),'<span class="num">'+fmt(paidOf(l))+'</span>')+kv(T('Balance'),'<b class="num">'+fmt(l.status==='open'?b:0)+'</b>')+kv(T('Date'),esc(fmtDate(l.ts)))+kv(T('Repayment date'),l.due?esc(fmtDate(l.due)):esc(T('Not set')))+(l.note?kv(T('Note'),esc(l.note)):'')+'</div>';
    if(paidOf(l)>0)body+='<div class="progress"><i style="width:'+Math.min(100,Math.round(paidOf(l)/l.amount*100))+'%"></i></div>';
    if(l.payments.length)body+='<div class="field">'+esc(T('Payments'))+'</div><section class="card flush" style="padding-inline:12px">'+l.payments.map(function(x){return '<div class="kv" style="align-items:center"><span style="color:var(--ink)"><b class="num">'+fmt(x.amount)+'</b><br><small>'+esc(fmtDate(x.ts)+(x.note?' - '+x.note:''))+'</small></span><button type="button" class="btn sm" data-a="payUndo" data-id="'+l.id+'" data-v="'+x.id+'">'+esc(T('Undo'))+'</button></div>';}).join('')+'</section>';
    if(l.photo)body+='<div class="field">'+esc(T('Proof'))+'</div><img src="'+l.photo+'" alt="'+esc(T('Proof photo'))+'" style="max-width:100%;border-radius:14px">';
    body+='<div class="form">';
    if(active(l))body+=btn('payOpen',lent?T('Record a payment received'):T('Record a payment I made'),'primary',{id:l.id,icon:I.check})+(lent?btn('remind',T('Send reminder'),'',{id:l.id,icon:I.share}):'');
    body+=btns(btn('photoAdd',l.photo?T('Replace photo'):T('Add proof photo'),'',{id:l.id,icon:I.camera}),btn('loanEdit',T('Edit'),'',{id:l.id}));
    if(l.photo)body+=btn('photoRm',T('Remove photo'),'',{id:l.id});
    if(active(l)&&lent)body+=btns(btn('forgive',T('Forgive the debt'),'',{id:l.id}),btn('gift',T('Mark as a gift'),'',{id:l.id}));
    if(l.status!=='open')body+=btn('reopen',T('Reopen this loan'),'',{id:l.id});
    return {title:p.name,body:body+btn('loanDel',T('Delete this loan'),'danger',{id:l.id})+'</div>'};
  },
  pay:function(s){
    var l=find(db.loans,s.id);if(!l||!active(l))return null;
    return {title:T('Record a payment'),body:'<div class="form"><p class="sub">'+esc(person(l.pid).name)+' - '+esc(T('Balance'))+': <b class="num">'+fmt(balOf(l))+'</b></p>'+fInput('f_pay',T('Amount (Birr)'),{im:'numeric',def:String(balOf(l))})+fInput('f_pdate',T('Date'),{type:'date',max:ymd(Date.now()),def:ymd(Date.now())})+fInput('f_pnote',T('Note (optional)'),{})+errBox()+btn('paySave',T('Save payment'),'primary',{id:l.id})+'</div>'};
  },
  remind:function(s){
    var l=find(db.loans,s.id);if(!l)return null;var lang=F('f_rl',db.settings.remindLang),tone=F('f_tone','polite');
    return {title:T('Send reminder'),body:'<div class="form">'+seg([{v:'polite',t:T('Polite')},{v:'firm',t:T('Firm')}],tone,'rtone')+seg([{v:'en',t:'English'},{v:'am',t:'አማርኛ'},{v:'om',t:'Oromoo'}],lang,'rlangSel')+
      fArea('f_msg',T('Message (you can edit it)'),{def:remindText(l,tone,lang)})+'<div class="grid2">'+btn('send',T('WhatsApp'),'',{id:l.id,v:'wa'})+btn('send',T('Telegram'),'',{id:l.id,v:'tg'})+btn('send',T('SMS'),'',{id:l.id,v:'sms'})+btn('send',T('Copy'),'',{id:l.id,v:'copy'})+'</div><small>'+esc(person(l.pid).phone?T('Sends to {p}.',{p:person(l.pid).phone}):T('No phone saved. WhatsApp and SMS will ask you to choose the contact.'))+'</small></div>'};
  },
  person:function(s){
    var p=find(db.people,s.id);if(!p)return null;var n=personNet(p.id),ls=personLoans(p.id);
    return {title:p.name,body:'<div class="sum"><div class="total"><span style="font-weight:700">'+esc(n>0?T('Owes you'):n<0?T('You owe'):T('All settled'))+'</span><b class="num'+(n<0?' out':'')+'">'+fmt(Math.abs(n))+' <small style="font-size:14px">'+esc(T('Birr'))+'</small></b></div></div>'+(p.phone?kv(T('Phone'),'<span class="num">'+esc(p.phone)+'</span>'):'')+
      '<section class="card flush" style="padding-inline:0">'+(ls.length?ls.map(function(l){var tg=loanTag(l);return '<button class="row" data-a="loan" data-id="'+l.id+'"><span class="grow"><b>'+esc(l.dir==='lent'?T('Lent'):T('Borrowed'))+' '+fmt(l.amount)+'</b><small>'+esc(fmtDate(l.ts))+(l.note?' - '+esc(l.note):'')+'</small>'+(tg?'<span class="tags">'+tag(tg.t,tg.k)+'</span>':'')+'</span><span class="end"><b class="num">'+fmt(active(l)?balOf(l):0)+'</b></span></button>';}).join(''):empty(T('No loans.')))+'</section>'+
      '<div class="form">'+btns(btn('addLoanFor',T('Add loan'),'primary',{id:p.id}),btn('personEdit',T('Edit'),'',{id:p.id}))+'</div>'};
  },
  personForm:function(s){var p=find(db.people,s.id);if(!p)return null;return {title:T('Edit person'),body:'<div class="form">'+fInput('f_name',T('Name'),{})+fInput('f_phone',T('Phone'),{type:'tel',im:'tel'})+errBox()+btn('personSave',T('Save'),'primary',{id:p.id})+'</div>'};},
  pin:function(){return {title:T('Set a PIN'),body:'<div class="form">'+fInput('f_p1',T('New 4-digit PIN'),{im:'numeric',ml:4,type:'password'})+fInput('f_p2',T('Repeat the PIN'),{im:'numeric',ml:4,type:'password'})+errBox()+btn('pinSave',T('Save PIN'),'primary')+'</div>'};}
};
function renderSheet(){
  var root=$('#sheetRoot'),s=state.sheet;if(!s){root.innerHTML='';return;}
  var r=SHEETS[s.t]?SHEETS[s.t](s):null;if(!r){state.sheet=null;root.innerHTML='';return;}
  var old=root.querySelector('.panel'),st=old&&s===renderSheet.last?old.scrollTop:0;
  root.innerHTML='<div class="scrim" data-scrim="1"><div class="panel" role="dialog" aria-modal="true" aria-label="'+esc(r.title)+'" tabindex="-1"><div class="head"><h2>'+esc(r.title)+'</h2><button type="button" class="iconbtn" data-a="closeSheet" aria-label="'+esc(T('Close'))+'">'+ic(I.x,22,2)+'</button></div>'+r.body+'</div></div>';
  var p=root.querySelector('.panel');p.scrollTop=st;if(s!==renderSheet.last)p.focus();renderSheet.last=s;
}
function renderConf(){
  var root=$('#confRoot'),c=state.conf;if(!c){root.innerHTML='';return;}
  root.innerHTML='<div class="scrim center" data-scrim="1"><div class="panel" role="alertdialog" aria-modal="true" tabindex="-1"><h2>'+esc(c.title)+'</h2>'+(c.msg?'<p class="sub" style="font-size:14px">'+esc(c.msg)+'</p>':'')+'<div class="btns"><button type="button" class="btn" data-a="confNo">'+esc(T('Cancel'))+'</button><button type="button" class="btn '+(c.danger?'dangerfill':'primary')+'" data-a="confYes">'+esc(c.ok)+'</button></div></div></div>';
  if(c!==renderConf.last)root.querySelector('.panel').focus();renderConf.last=c;
}
var lastKey='';
function navHtml(){
  var b=function(t,icon,label,badge){return '<button type="button" data-a="tab" data-v="'+t+'"'+(state.tab===t?' aria-current="page"':'')+'>'+ic(icon,24)+esc(label)+'</button>';};
  return b('home',I.home,T('Home'))+b('people',I.users,T('People'))+'<button type="button" class="mid" data-a="quick" aria-label="'+esc(T('Add a loan'))+'"><span class="disc">'+ic(I.plus,28,2.4)+'</span><span>'+esc(T('Add'))+'</span></button>'+b('alerts',I.bell,T('Alerts'))+b('settings',I.gear,T('Settings'));
}
function render(){
  var y=window.scrollY,key=state.tab+'|'+state.pages.length+'|'+state.locked,ae=document.activeElement,fid=ae&&ae.id?ae.id:'',a0=0,a1=0;
  try{if(fid&&ae.selectionStart!=null){a0=ae.selectionStart;a1=ae.selectionEnd;}}catch(e){}
  var top=state.pages[state.pages.length-1];
  var html=state.locked?viewLock():top==='activity'?viewActivity():state.tab==='home'?viewHome():state.tab==='people'?viewPeople():state.tab==='alerts'?viewAlerts():viewSettings();
  $('#app').innerHTML=html;
  $('#nav').hidden=state.locked||!!top;document.body.classList.toggle('nonav',state.locked||!!top);if(!state.locked&&!top)$('#navIn').innerHTML=navHtml();
  renderSheet();renderConf();
  if(fid){var n=document.getElementById(fid);if(n&&n!==document.activeElement){n.focus();try{n.setSelectionRange(a0,a1);}catch(e){}}}
  document.documentElement.style.overflow=(state.sheet||state.conf)?'hidden':'';
  window.scrollTo(0,key===lastKey?y:0);lastKey=key;syncHist();
}
function toast(m){var t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true;},2600);}
function showErr(m){var e=document.querySelector(state.sheet?'#sheetRoot #sheetErr':'#sheetErr');if(!e){toast(m);return false;}e.textContent=m;e.hidden=false;return false;}
function ask(o){state.conf=o;render();}
function openSheet(s,f){state.sheet=s;state.f=f||{};render();}

/* ---------- back button ---------- */
var histN=0,histIgnore=0;
function depth(){return (state.conf?1:0)+(state.sheet?1:0)+state.pages.length+(state.tab!=='home'?1:0);}
function backOnce(){if(state.conf)state.conf=null;else if(state.sheet)state.sheet=null;else if(state.pages.length)state.pages.pop();else if(state.tab!=='home')state.tab='home';}
function syncHist(){
  if(histIgnore>0||state.locked)return;var d=depth();
  try{if(d>histN){while(histN<d){histN++;history.pushState({d:histN},'');}}else if(d<histN){var n=histN-d;histN=d;histIgnore++;history.go(-n);}}catch(e){}
}
window.addEventListener('popstate',function(e){
  if(histIgnore>0){histIgnore--;if(!histIgnore)syncHist();return;}
  histN=(e.state&&e.state.d)||0;var g=10;while(depth()>histN&&g-->0)backOnce();render();
});

/* ---------- photos ---------- */
function readPhoto(file,cb){
  var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=900,s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',0.6));};im.onerror=function(){toast(T('Could not read that photo.'));};im.src=r.result;};r.readAsDataURL(file);
}
function pickPhoto(cb){var i=$('#photoIn');i.value='';i.onchange=function(){if(i.files&&i.files[0])readPhoto(i.files[0],cb);};i.click();}

/* ---------- actions ---------- */
function pinHash(p){var h=5381,s='amanah|'+p;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h);}
function getPerson(name,phone){
  var n=name.trim(),p=null;db.people.forEach(function(x){if(x.name.toLowerCase()===n.toLowerCase())p=x;});
  if(!p){p={id:uid(),name:n,phone:phone||''};db.people.push(p);}else if(phone&&!p.phone)p.phone=phone;
  return p;
}
function loanSave(){
  var s=state.sheet,l=s.id?find(db.loans,s.id):null,f=state.f,name=(f.f_name||'').trim(),amt=num(f.f_amt),date=fromYmd(f.f_date)||startOfDay(Date.now()),due=fromYmd(f.f_due)||0;
  if(!name)return showErr(T('Enter the name.'));if(!amt)return showErr(T('Enter the amount.'));if(due&&due<startOfDay(date))return showErr(T('The repayment date is before the loan date.'));
  var ts=startOfDay(date)===startOfDay(Date.now())?Date.now():date+43200000,phone=(f.f_phone||'').trim();
  if(l){
    var p=getPerson(name,phone);if(phone)p.phone=phone;l.pid=p.id;l.amount=Math.max(amt,0);l.ts=(l.ts&&startOfDay(l.ts)===startOfDay(date))?l.ts:ts;l.due=due;l.note=(f.f_note||'').trim();
    log('Loan edited: {n} {a} Birr',{n:name,a:fmt(amt)});save();toast(T('Saved'));openSheet({t:'loan',id:l.id});return false;
  }
  var pe=getPerson(name,phone),dir=f.f_dir||'lent';
  var nl={id:uid(),dir:dir,pid:pe.id,amount:amt,ts:ts,due:due,note:(f.f_note||'').trim(),photo:f.f_photo||'',status:'open',payments:[]};
  db.loans.push(nl);log('Loan added: {n} {a} Birr ({d})',{n:name,a:fmt(amt),d:dir==='lent'?T('lent'):T('borrowed')});save();
  state.side=dir;state.filter='all';state.q='';state.sheet=null;state.tab='home';state.pages=[];toast(T('Loan saved'));
}
function act(a,el){
  var id=el.getAttribute('data-id'),v=el.getAttribute('data-v'),l=id?find(db.loans,id):null;
  switch(a){
    case 'tab':state.tab=v;state.pages=[];state.sheet=null;state.conf=null;state.f={};break;
    case 'quick':openSheet({t:'quick'});return false;
    case 'back':if(histN>0){history.back();return false;}backOnce();break;
    case 'closeSheet':state.sheet=null;break;
    case 'confNo':state.conf=null;break;
    case 'confYes':var fn=state.conf&&state.conf.fn;state.conf=null;if(fn)fn();break;
    case 'side':state.side=v;break;
    case 'filter':state.filter=v;break;
    case 'loan':openSheet({t:'loan',id:id});return false;
    case 'person':openSheet({t:'person',id:id});return false;
    case 'addLoan':openSheet({t:'loanForm'},{f_dir:v,f_date:ymd(Date.now())});return false;
    case 'addLoanFor':var pp=find(db.people,id);openSheet({t:'loanForm'},{f_dir:'lent',f_name:pp.name,f_phone:pp.phone,f_date:ymd(Date.now())});return false;
    case 'loanEdit':var pe=person(l.pid);openSheet({t:'loanForm',id:id},{f_dir:l.dir,f_name:pe.name,f_phone:pe.phone,f_amt:String(l.amount),f_date:ymd(l.ts),f_due:l.due?ymd(l.due):'',f_note:l.note||''});return false;
    case 'fDir':state.f.f_dir=v;break;
    case 'dueIn':var base=fromYmd(state.f.f_date)||startOfDay(Date.now());state.f.f_due=Number(v)?ymd(addDays(base,Number(v))):'';break;
    case 'loanSave':return loanSave();
    case 'photoPick':pickPhoto(function(d){state.f.f_photo=d;render();});return false;
    case 'photoClear':state.f.f_photo='';break;
    case 'photoAdd':pickPhoto(function(d){l.photo=d;log('Proof photo added: {n}',{n:person(l.pid).name});save();render();});return false;
    case 'photoRm':l.photo='';save();break;
    case 'payOpen':openSheet({t:'pay',id:id},{});return false;
    case 'paySave':
      var amt=num(state.f.f_pay);if(!amt)return showErr(T('Enter the amount.'));if(amt>balOf(l))return showErr(T('That is more than the balance ({n}).',{n:fmt(balOf(l))}));
      var pd=fromYmd(state.f.f_pdate)||startOfDay(Date.now());l.payments.push({id:uid(),ts:startOfDay(pd)===startOfDay(Date.now())?Date.now():pd+43200000,amount:amt,note:(state.f.f_pnote||'').trim()});
      log('Payment of {a} Birr: {n}',{a:fmt(amt),n:person(l.pid).name});save();toast(balOf(l)<=0?T('Fully paid. Mashallah!'):T('Payment saved'));openSheet({t:'loan',id:id});return false;
    case 'payUndo':ask({title:T('Undo this payment?'),ok:T('Undo'),danger:true,fn:function(){l.payments=l.payments.filter(function(x){return x.id!==v;});log('Payment undone: {n}',{n:person(l.pid).name});save();}});return false;
    case 'forgive':ask({title:T('Forgive this debt?'),msg:T('{n} will not owe you {a} Birr any more. The history stays.',{n:person(l.pid).name,a:fmt(balOf(l))}),ok:T('Forgive'),fn:function(){l.status='forgiven';log('Debt forgiven: {n} {a} Birr',{n:person(l.pid).name,a:fmt(balOf(l))});save();}});return false;
    case 'gift':ask({title:T('Mark as a gift?'),msg:T('It will not count as debt.'),ok:T('Yes'),fn:function(){l.status='gift';log('Marked as a gift: {n}',{n:person(l.pid).name});save();}});return false;
    case 'reopen':l.status='open';log('Loan reopened: {n}',{n:person(l.pid).name});save();break;
    case 'loanDel':ask({title:T('Delete this loan?'),msg:T('This removes the loan and its payments.'),ok:T('Delete'),danger:true,fn:function(){db.loans=db.loans.filter(function(x){return x.id!==id;});log('Loan deleted: {n} {a} Birr',{n:person(l.pid).name,a:fmt(l.amount)});save();state.sheet=null;toast(T('Deleted'));}});return false;
    case 'remind':openSheet({t:'remind',id:id},{f_rl:db.settings.remindLang,f_tone:'polite',f_msg:remindText(l,'polite',db.settings.remindLang)});return false;
    case 'rtone':state.f.f_tone=v;state.f.f_msg=remindText(find(db.loans,state.sheet.id),v,F('f_rl',db.settings.remindLang));break;
    case 'rlangSel':state.f.f_rl=v;state.f.f_msg=remindText(find(db.loans,state.sheet.id),F('f_tone','polite'),v);break;
    case 'send':
      var msg=encodeURIComponent(state.f.f_msg||''),ph=waNumber(person(l.pid).phone),url;
      if(v==='copy'){copyText(state.f.f_msg||'');return false;}
      url=v==='wa'?'https://wa.me/'+ph+'?text='+msg:v==='tg'?'https://t.me/share/url?url=%20&text='+msg:'sms:'+(person(l.pid).phone||'')+'?body='+msg;
      log('Reminder sent: {n}',{n:person(l.pid).name});save();window.open(url,'_blank');return false;
    case 'personEdit':var ep=find(db.people,id);openSheet({t:'personForm',id:id},{f_name:ep.name,f_phone:ep.phone});return false;
    case 'personSave':var sp=find(db.people,id),nm=(state.f.f_name||'').trim();if(!nm)return showErr(T('Enter the name.'));sp.name=nm;sp.phone=(state.f.f_phone||'').trim();save();toast(T('Saved'));openSheet({t:'person',id:id});return false;
    case 'activity':state.pages.push('activity');break;
    case 'mode':db.settings.mode=v;save();applyTheme();break;
    case 'palette':db.settings.palette=v;save();applyTheme();break;
    case 'size':db.settings.textSize=v;save();applyTheme();break;
    case 'rlang':db.settings.remindLang=v;save();break;
    case 'pinSet':openSheet({t:'pin'},{});return false;
    case 'pinSave':var p1=state.f.f_p1||'',p2=state.f.f_p2||'';if(!/^\d{4}$/.test(p1))return showErr(T('Use exactly 4 digits.'));if(p1!==p2)return showErr(T('The two PINs are different.'));db.settings.pin=pinHash(p1);save();state.sheet=null;toast(T('PIN saved'));break;
    case 'pinOff':ask({title:T('Turn off the PIN?'),ok:T('Turn off'),danger:true,fn:function(){db.settings.pin='';save();}});return false;
    case 'pinKey':
      if(v==='del')state.pin=state.pin.slice(0,-1);else if(state.pin.length<4)state.pin+=v;
      if(state.pin.length===4){if(pinHash(state.pin)===db.settings.pin){state.locked=false;state.pin='';}else{state.pin='';render();var le=$('#lockErr');if(le)le.hidden=false;return false;}}
      break;
    case 'backup':if(download('amanah-backup-'+ymd(Date.now())+'.json',JSON.stringify(db),'application/json')){db.settings.backupAt=Date.now();save();toast(T('Backup file saved'));}return false;
    case 'copyBackup':copyText(JSON.stringify(db),T('Backup copied'));db.settings.backupAt=Date.now();save();return false;
    case 'csv':download('amanah-loans-'+ymd(Date.now())+'.csv',loansCsv(),'text/csv;charset=utf-8');return false;
    case 'restore':return restoreFrom(String(state.f.bk_in||'').trim());
    case 'pickBackup':$('#bk_file').click();return false;
    case 'clearDemo':ask({title:T('Remove the example data?'),msg:T('Your own entries stay.'),ok:T('Remove'),danger:true,fn:function(){var k=function(x){return !x.demo;};db.people=db.people.filter(k);db.loans=db.loans.filter(k);db.activity=db.activity.filter(k);db.demo=false;save();toast(T('Example data removed'));}});return false;
    case 'resetAll':ask({title:T('Erase everything?'),msg:T('All loans and people on this phone will be deleted. Make a backup first.'),ok:T('Erase'),danger:true,fn:function(){var s=db.settings;db=emptyDb();db.settings=s;save();state.tab='home';state.pages=[];toast(T('Everything erased'));}});return false;
    default:return false;
  }
}
function copyText(t,m){var ok=function(){toast(m||T('Copied'));},fb=function(){var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok();}catch(e){toast(T('Could not copy'));}document.body.removeChild(a);};try{navigator.clipboard.writeText(t).then(ok,fb);}catch(e){fb();}}
function download(name,text,mime){try{var b=new Blob([text],{type:mime}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(u);},4000);return true;}catch(e){toast(T('Could not save the file.'));return false;}}
function loansCsv(){
  var q=function(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;},rows=[['Date','Type','Person','Phone','Amount','Paid','Balance','Repayment date','Status','Note']];
  db.loans.slice().sort(function(a,b){return a.ts-b.ts;}).forEach(function(l){var p=person(l.pid);rows.push([ymd(l.ts),l.dir==='lent'?'Lent':'Borrowed',p.name,p.phone,l.amount,paidOf(l),balOf(l),l.due?ymd(l.due):'',l.status,l.note]);});
  return '﻿'+rows.map(function(r){return r.map(q).join(',');}).join('\r\n');
}
function restoreFrom(text){
  var o=null;try{o=JSON.parse(text);}catch(e){}
  if(!o||!Array.isArray(o.loans)||!Array.isArray(o.people))return showErr(T('That is not a valid backup.'));
  ask({title:T('Restore this backup?'),msg:T('This replaces everything on this phone: {n} loans.',{n:o.loans.length}),ok:T('Yes, restore'),danger:true,fn:function(){o.settings=Object.assign(defaults(),o.settings||{});if(o.settings.ui!==2){o.settings.ui=2;o.settings.palette='mono';o.settings.mode='dark';}o.activity=o.activity||[];db=o;save();applyTheme();toast(T('Backup restored'));}});
}
document.addEventListener('click',function(e){
  var t=e.target;if(t.hasAttribute&&t.hasAttribute('data-scrim')){if(state.conf)state.conf=null;else state.sheet=null;render();return;}
  var el=t.closest?t.closest('[data-a]'):null;if(!el||el.disabled)return;var r;
  try{r=act(el.getAttribute('data-a'),el);}catch(err){console.error(err);toast(T('Something went wrong. Please try again.'));return;}
  if(r!==false)render();
});
document.addEventListener('input',function(e){
  var el=e.target;if(el.hasAttribute('data-f'))state.f[el.id]=el.value;
  if(el.getAttribute('data-live')==='list'){state.q=el.value;$('#list').innerHTML=loanList();}
});
document.addEventListener('change',function(e){
  var el=e.target;if(el.id==='bk_file'){var f=el.files&&el.files[0];if(!f)return;var r=new FileReader();r.onload=function(){restoreFrom(String(r.result||''));el.value='';};r.readAsText(f);}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(state.conf)state.conf=null;else if(state.sheet)state.sheet=null;else return;render();}});
var hiddenAt=0;
document.addEventListener('visibilitychange',function(){
  if(document.hidden){hiddenAt=Date.now();return;}
  if(db.settings.pin&&hiddenAt&&Date.now()-hiddenAt>60000&&!state.locked){state.locked=true;state.pin='';state.sheet=null;state.conf=null;render();}
});

/* ---------- start ---------- */
db=load();if(!db){db=seed();save();}
state.locked=!!db.settings.pin;
applyTheme();
try{history.replaceState({d:0},'');}catch(e){}
try{var mq=matchMedia('(prefers-color-scheme: dark)');if(mq.addEventListener)mq.addEventListener('change',function(){if(db.settings.mode==='auto'){applyTheme();render();}});}catch(e){}
render();
addEventListener('beforeinstallprompt',function(e){e.preventDefault();});
if(window.__SW__){try{if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){});});}catch(e){}}
