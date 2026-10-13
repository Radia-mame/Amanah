'use strict';
/* ---------- icons ---------- */
var ic=function(d,s,w){s=s||24;w=w||1.8;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';};
var I={
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  box:'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  swap:'<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  tv:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  laptop:'<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  check:'<path d="M5 13l4 4L19 7"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  receipt:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  chart:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wallet:'<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l2-3h12"/><circle cx="16.5" cy="13.5" r="1"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  chev:'<path d="M9 6l6 6-6 6"/>',
  activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  users:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
  camera:'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'
};

/* ---------- themes: a mode (light or dark) plus a color palette ---------- */
var MODES={
  light:{'bg':'#F6F6F7','surface':'#FFFFFF','ink':'#0F1B2D','muted':'#566275','line':'#E1E6EC','field-line':'#8793A6','seg':'#E3E8EE','scrim':'rgba(15,27,45,.5)',
    'bad':'#B42318','bad-bg':'#FDE7E5','warn':'#7A4100','warn-bg':'#FFEBCF','good':'#0B6150','good-bg':'#E2F3EE',
    'gA-bg':'#0B6150','gA-fg':'#FFFFFF','gB-bg':'#BFE6DA','gB-fg':'#0B3D33','gC-bg':'#FFE3A3','gC-fg':'#5C3B00','gD-bg':'#F4B58A','gD-fg':'#4A2000','gE-bg':'#D5DAE1','gE-fg':'#243044',
    'hero-ink':'#FFFFFF','hero-muted':'#C3CCDA','hero-line':'rgba(255,255,255,.2)'},
  dark:{'bg':'#0B0E17','surface':'#141927','ink':'#F1F3FA','muted':'#8E97B0','line':'#222A3F','field-line':'#5B6585','seg':'#1B2236','scrim':'rgba(0,0,0,.65)',
    'bad':'#FF9A90','bad-bg':'#3A1C1C','warn':'#FFC46B','warn-bg':'#3A2A10','good':'#7FD6C0','good-bg':'#12342C',
    'gA-bg':'#3CC5A3','gA-fg':'#04231B','gB-bg':'#1F4A40','gB-fg':'#BFE6DA','gC-bg':'#4A3A12','gC-fg':'#FFE3A3','gD-bg':'#55301A','gD-fg':'#F4B58A','gE-bg':'#2A3547','gE-fg':'#C5CEDB',
    'hero-ink':'#FFFFFF','hero-muted':'#C3CCDA','hero-line':'rgba(255,255,255,.2)'}
};
var PALETTES={
  mono:{name:'Mono',light:{'accent':'#4F5FE8','accent-ink':'#FFFFFF','accent-soft':'#E9ECFF','hero':'#FFFFFF'},dark:{'accent':'#8B9CFF','accent-ink':'#0B0E17','accent-soft':'#1E2547','hero':'#141927'}},
  teal:{name:'Teal',light:{'accent':'#0E7C66','accent-ink':'#FFFFFF','accent-soft':'#E2F3EE','hero':'#0F1B2D'},dark:{'accent':'#3CC5A3','accent-ink':'#04231B','accent-soft':'#12342C','hero':'#1B2A40'}},
  ocean:{name:'Ocean',light:{'accent':'#1D5FD1','accent-ink':'#FFFFFF','accent-soft':'#E4EDFC','hero':'#0E2347'},dark:{'accent':'#6AA5FF','accent-ink':'#061631','accent-soft':'#15294D','hero':'#16305C'}},
  sunset:{name:'Sunset',light:{'accent':'#B4470C','accent-ink':'#FFFFFF','accent-soft':'#FCEBDD','hero':'#3A1A0A'},dark:{'accent':'#FFA05A','accent-ink':'#2A1100','accent-soft':'#43260F','hero':'#47260F'}},
  forest:{name:'Forest',light:{'accent':'#2E7D32','accent-ink':'#FFFFFF','accent-soft':'#E5F2E5','hero':'#12281A'},dark:{'accent':'#7ED47F','accent-ink':'#0A2A0B','accent-soft':'#173522','hero':'#1B3A26'}},
  royal:{name:'Royal',light:{'accent':'#6A3FC9','accent-ink':'#FFFFFF','accent-soft':'#EEE8FB','hero':'#1D1240'},dark:{'accent':'#B79BFF','accent-ink':'#1C0B45','accent-soft':'#2A1F55','hero':'#2A1E5C'}},
  graphite:{name:'Graphite',light:{'accent':'#2B3544','accent-ink':'#FFFFFF','accent-soft':'#E6E9EE','hero':'#11151B'},dark:{'accent':'#D5DBE5','accent-ink':'#0D1117','accent-soft':'#252E3B','hero':'#222A36'}}
};
function isDark(){var m=db.settings.mode;return m==='dark'||(m==='auto'&&!!window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);}
function applyTheme(){
  var s=db.settings,dk=isDark(),root=document.documentElement,p=PALETTES[s.palette]||PALETTES.teal,vars=extend(extend({},dk?MODES.dark:MODES.light),p[dk?'dark':'light']);
  for(var k in vars)root.style.setProperty('--'+k,vars[k]);
  root.setAttribute('data-mode',dk?'dark':'light');
  root.setAttribute('data-size',s.textSize==='large'?'large':'normal');
  root.setAttribute('lang',s.lang==='am'?'am':s.lang==='om'?'om':'en');
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',vars['bg']);
}

