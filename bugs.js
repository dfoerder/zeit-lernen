/* Bug-Melder (Testwerkzeug) — eigenständig, ohne Framework. Gleiche Datei in mehreren Apps.
   Einbinden im <head> (nicht defer, damit JS-Fehler früh mitgeschrieben werden):
     <script src="bugs.js" data-repo="dfoerder/<repo>" data-app="<kurzname>"></script>
   Einschalten: URL mit ?bugs=1 (?bugs=0 aus) oder fünfmal auf ein Element mit
   [data-bug-tap] tippen (nötig in der Homescreen-App, die ?bugs=1 aus Safari nicht sieht).
   Senden: öffnet ein vorausgefülltes GitHub-Issue; dort „Submit new issue" tippen.
   Kein Token im Code (App ist öffentlich). Issues sind öffentlich: keine privaten Daten
   mitschicken — erfasst werden nur Seite, Version, Gerät und die letzten JS-Fehler.
   Kontext ergänzen kann die App über window.__bugCtx = {…} (nur Unkritisches!). */
(function(){
  var me=document.currentScript||{};
  var REPO=(me.getAttribute&&me.getAttribute('data-repo'))||'';
  var APP=(me.getAttribute&&me.getAttribute('data-app'))||REPO.split('/')[1]||'app';
  var K_MODE=APP+'-bugmode',K_BUGS=APP+'-bugs';
  var log=window.__bugLog=window.__bugLog||[];
  function push(kind,msg){log.push({t:new Date().toISOString(),kind:kind,msg:String(msg).slice(0,300)});if(log.length>20)log.shift()}
  window.addEventListener('error',function(e){push('error',(e.message||'Fehler')+(e.filename?' @ '+e.filename.split('/').pop()+':'+e.lineno:''))});
  window.addEventListener('unhandledrejection',function(e){push('promise',e.reason&&(e.reason.message||e.reason))});

  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}
  try{var p=new URLSearchParams(location.search).get('bugs');if(p==='1')ls(K_MODE,'1');if(p==='0')ls(K_MODE,null)}catch(e){}
  function on(){return ls(K_MODE)==='1'}
  function load(){try{return JSON.parse(ls(K_BUGS)||'[]')}catch(e){return[]}}
  function save(l){ls(K_BUGS,JSON.stringify(l))}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var SEVS=[['blocker','🔴 Blockiert'],['major','🟠 Stört'],['minor','🟡 Kosmetik']];
  function sevLabel(id){for(var i=0;i<SEVS.length;i++)if(SEVS[i][0]===id)return SEVS[i][1];return SEVS[1][1]}
  function version(){var c=window.__bugCtx||{};if(c.version)return c.version;var v=document.querySelector('[data-bug-tap]');return v?v.textContent.trim().slice(0,40):''}
  function snapshot(){
    var c=window.__bugCtx||{},o={};for(var k in c)o[k]=c[k];
    o.page=location.pathname.split('/').pop()+location.hash;o.title=document.title;o.version=version();
    o.viewport=innerWidth+'×'+innerHeight;
    o.standalone=!!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone);
    o.ua=navigator.userAgent;o.errors=log.slice(-8);return o}

  function issueUrl(bugs){
    var body=bugs.map(function(b,i){var c=b.ctx||{},extra=[];
      for(var k in c)if(['page','title','version','viewport','standalone','ua','errors'].indexOf(k)<0)extra.push(k+': '+c[k]);
      return '### '+(bugs.length>1?(i+1)+'. ':'')+(b.kind==='feature'?'💡 Neues Feature':sevLabel(b.sev))+'\n\n'+b.text+'\n\n'
        +'- Seite: '+(c.page||'')+(extra.length?' · '+extra.join(' · '):'')+'\n- Version: '+(c.version||'?')
        +'\n- Gerät: '+(c.viewport||'')+(c.standalone?' · Homescreen-App':' · Browser')+' · '+(c.ua||'')
        +'\n- Gemeldet: '+new Date(b.ts).toLocaleString('de-CH')
        +(c.errors&&c.errors.length?'\n- Letzte JS-Fehler:\n```\n'+c.errors.map(function(e){return e.t.slice(11,19)+' '+e.kind+': '+e.msg}).join('\n')+'\n```':'');
    }).join('\n\n---\n\n');
    if(body.length>6000)body=body.slice(0,6000)+'\n\n… (gekürzt)';
    var title=bugs.length===1?(bugs[0].kind==='feature'?'Feature: ':'Bug: ')+bugs[0].text.split('\n')[0].slice(0,70):bugs.length+' Meldungen';
    var labels=bugs.every(function(b){return b.kind==='feature'})?'enhancement':'bug';
    return 'https://github.com/'+REPO+'/issues/new?labels='+labels+'&title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body)}

  // fünf Tipps auf [data-bug-tap] schalten den Melder an/aus
  var taps=0,tapT=0;
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-bug-tap]');if(!t)return;
    var now=Date.now();taps=(now-tapT<1500)?taps+1:1;tapT=now;
    if(taps>=5){ls(K_MODE,on()?null:'1');location.reload()}
  },true);

  var CSS='.bgr-fab{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:2147483000;width:48px;height:48px;border-radius:24px;border:1px solid #0002;background:#fff;box-shadow:0 2px 8px #0003;font-size:22px;cursor:pointer}'
   +'.bgr-fab b{position:absolute;top:-4px;right:-4px;background:#d33;color:#fff;font:600 11px system-ui;border-radius:9px;padding:1px 5px}'
   +'.bgr-ov{position:fixed;inset:0;z-index:2147483001;background:#0006;display:flex;align-items:flex-end;justify-content:center;font:15px/1.4 system-ui,-apple-system,sans-serif;color:#222}'
   +'.bgr-sh{background:#fff;width:100%;max-width:520px;max-height:90vh;overflow:auto;border-radius:14px 14px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}'
   +'.bgr-sh h3{margin:0 0 4px;font-size:18px}.bgr-ctx{font-size:12px;color:#777;margin-bottom:8px}'
   +'.bgr-row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.bgr-b{min-height:40px;padding:6px 12px;border-radius:9px;border:1px solid #ccc;background:#f5f5f5;font:inherit;color:#222;cursor:pointer;touch-action:manipulation}'
   +'.bgr-b.on{background:#222;color:#fff;border-color:#222}.bgr-b.pri{background:#1a6;color:#fff;border-color:#1a6}'
   +'.bgr-sh textarea{width:100%;box-sizing:border-box;min-height:90px;font:16px system-ui;padding:8px;border:1px solid #ccc;border-radius:9px}'
   +'.bgr-msg{margin:8px 0;font-size:13px;color:#155}.bgr-it{display:flex;gap:8px;align-items:flex-start;border-top:1px solid #eee;padding:8px 0;font-size:14px}'
   +'.bgr-it div{flex:1}.bgr-it small{display:block;color:#888;font-size:11px}.bgr-it button{background:none;border:0;font-size:16px;cursor:pointer;color:#888}';

  var st={open:false,kind:'bug',sev:'major',text:'',msg:'',list:false,confirm:null,ctx:null},root;
  function render(){
    if(!root)return;var l=load(),open=l.filter(function(b){return!b.sent}).length;
    if(!st.open){root.innerHTML='<button class="bgr-fab" data-a="open" aria-label="Bug melden">🐞'+(open?'<b>'+open+'</b>':'')+'</button>';return}
    var h='<div class="bgr-ov" data-a="close"><div class="bgr-sh">'
      +'<h3>'+(st.kind==='feature'?'Neues Feature wünschen':'Bug melden')+'</h3>'
      +'<div class="bgr-ctx">'+esc((st.ctx.page||'')+(st.ctx.version?' · '+st.ctx.version:''))+'</div>'
      +'<div class="bgr-row"><button class="bgr-b'+(st.kind==='bug'?' on':'')+'" data-a="kind" data-v="bug">🐞 Fehler</button><button class="bgr-b'+(st.kind==='feature'?' on':'')+'" data-a="kind" data-v="feature">💡 Neues Feature</button></div>'
      +(st.kind==='bug'?'<div class="bgr-row">'+SEVS.map(function(s){return'<button class="bgr-b'+(st.sev===s[0]?' on':'')+'" data-a="sev" data-v="'+s[0]+'">'+s[1]+'</button>'}).join('')+'</div>':'')
      +'<textarea id="bgr-t" placeholder="'+(st.kind==='feature'?'Was soll die App können?':'Was ist passiert?')+'">'+esc(st.text)+'</textarea>'
      +'<div class="bgr-row"><button class="bgr-b" data-a="save">Nur speichern</button><button class="bgr-b pri" data-a="send">Als GitHub-Issue senden</button></div>'
      +(st.msg?'<div class="bgr-msg">'+esc(st.msg)+'</div>':'')
      +'<button class="bgr-b" style="width:100%;margin-top:6px" data-a="list">'+(st.list?'▾':'▸')+' Gemeldete ('+l.length+(open?', '+open+' nicht gesendet':'')+')</button>';
    if(st.list){
      h+=l.map(function(b){return'<div class="bgr-it"><span>'+(b.kind==='feature'?'💡':sevLabel(b.sev).split(' ')[0])+'</span><div>'+esc(b.text)
        +'<small>'+new Date(b.ts).toLocaleString('de-CH')+' · '+(b.sent?'✓ gesendet':'nicht gesendet')+'</small></div>'
        +(st.confirm==='del:'+b.id?'<button data-a="del" data-v="'+b.id+'">Löschen</button><button data-a="nc">Nein</button>':'<button data-a="askdel" data-v="'+b.id+'">✕</button>')+'</div>'}).join('');
      h+='<div class="bgr-row">'+(open?'<button class="bgr-b" data-a="sendall">Alle nicht gesendeten senden</button>':'')
        +(st.confirm==='clear'?'<span>Gesendete löschen? <button class="bgr-b" data-a="clear">Ja</button> <button class="bgr-b" data-a="nc">Nein</button></span>':(l.some(function(b){return b.sent})?'<button class="bgr-b" data-a="askclear">Gesendete löschen</button>':''))
        +(st.confirm==='hide'?'<span>Melder ausblenden? <button class="bgr-b" data-a="hide">Ja</button> <button class="bgr-b" data-a="nc">Nein</button></span>':'<button class="bgr-b" data-a="askhide">Melder ausblenden</button>')+'</div>';
    }
    h+='<div class="bgr-row" style="margin-top:12px"><button class="bgr-b" data-a="close">Schliessen</button></div></div></div>';
    root.innerHTML=h;
  }
  function send(bugs){
    if(!bugs.length){st.msg='Alles schon gesendet.';return}
    window.open(issueUrl(bugs),'_blank');
    var ids={};bugs.forEach(function(b){ids[b.id]=1});
    save(load().map(function(b){if(ids[b.id])b.sent=new Date().toISOString();return b}));
    st.msg='GitHub-Issue geöffnet – dort nur noch „Submit new issue" tippen.'}
  function add(){
    var t=(st.text||'').trim();if(!t){st.msg='Bitte kurz beschreiben, was passiert ist.';return null}
    var b={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),ts:new Date().toISOString(),kind:st.kind,sev:st.kind==='feature'?'':st.sev,text:t,ctx:st.ctx||snapshot()};
    var l=load();l.unshift(b);save(l);st.text='';return b}
  function act(a,v,ev){
    if(a==='close'&&ev.target!==ev.currentTarget&&ev.target.getAttribute('data-a')!=='close')return;
    switch(a){
      case'open':st.open=true;st.msg='';st.confirm=null;st.ctx=snapshot();break;
      case'close':st.open=false;st.list=false;st.confirm=null;break;
      case'kind':st.kind=v;break;case'sev':st.sev=v;break;
      case'save':if(add())st.msg='✓ Gespeichert ('+load().filter(function(b){return!b.sent}).length+' nicht gesendet)';break;
      case'send':var b=add();if(b)send([b]);break;
      case'sendall':send(load().filter(function(b){return!b.sent}));break;
      case'list':st.list=!st.list;st.confirm=null;break;
      case'askdel':st.confirm='del:'+v;break;case'del':save(load().filter(function(b){return b.id!==v}));st.confirm=null;break;
      case'askclear':st.confirm='clear';break;case'clear':save(load().filter(function(b){return!b.sent}));st.confirm=null;break;
      case'askhide':st.confirm='hide';break;case'hide':ls(K_MODE,null);location.reload();return;
      case'nc':st.confirm=null;break;default:return}
    render()}
  function mount(){
    if(!on()||!REPO)return;
    var s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
    root=document.createElement('div');root.className='no-print';document.body.appendChild(root);
    root.addEventListener('input',function(e){if(e.target.id==='bgr-t')st.text=e.target.value});
    root.addEventListener('click',function(e){var el=e.target.closest('[data-a]');if(!el)return;
      if(el.getAttribute('data-a')==='close'&&el.classList.contains('bgr-ov')&&e.target!==el)return;
      act(el.getAttribute('data-a'),el.getAttribute('data-v'),{target:e.target,currentTarget:el})});
    render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
