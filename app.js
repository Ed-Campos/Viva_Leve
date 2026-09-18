
function escapeHtml(s){
  if(s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function escapeHTML(s){ return escapeHtml(s); }

"use strict";

/* ============ Storage ============ */
const STORAGE_KEY = "leve_db_v1";
function defaultDB(){
  return {
    createdAt: todayKeySafe(),
    profile: {
      name: null, sex: null, age: null, height: null,
      bodyType: null, objective: null, activityLevel: null,
      weightGoal: null, waterGoalMl: 2000, calorieGoal: null
    },
    weights: [],
    measurements: [],
    water: {},
    sleep: {},
    mood: {},
    meals: {},
    habits: [],
    habitLogs: {},
    badgesSeen: [],
    badgeDates: {},
    lastBackupAt: null,
    lastOpenedAt: null,
    notifEnabled: false,
    challenges: [],
    cravings: [],
    appointments: [],
    medications: [],
    medLogs: {},
    mealPlan: null,
    shoppingChecked: {},
    favMeals: [],
    travelMode: false,
    fasting: { protocol: '16:8', active: null, history: [] },
    settings: { theme: "light" }
  };
}
function todayKeySafe(){
  const d=new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1<10?'0':'')+(d.getMonth()+1)+'-'+(d.getDate()<10?'0':'')+d.getDate();
}
function loadDB(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const p = JSON.parse(raw);
            if(!p.settings) p.settings = {theme:"light"};
      if(!localStorage.getItem('vl_theme_v2')){
        p.settings.theme = 'light';
        localStorage.setItem('vl_theme_v2', '1');
      }
      if(!p.settings.theme || !['light','dark','red','green','pink','blue'].includes(p.settings.theme)) p.settings.theme = 'light';
      if(!p.profile) p.profile = {weightGoal:null, waterGoalMl:2000, calorieGoal:null};
      if(p.profile.name===undefined) p.profile.name = null;
      if(p.profile.sex===undefined) p.profile.sex = null;
      if(p.profile.age===undefined) p.profile.age = null;
      if(p.profile.height===undefined) p.profile.height = null;
      if(p.profile.bodyType===undefined) p.profile.bodyType = null;
      if(p.profile.objective===undefined) p.profile.objective = null;
      if(p.profile.activityLevel===undefined) p.profile.activityLevel = null;
      if(!p.weights) p.weights = [];
      if(!p.measurements) p.measurements = [];
      if(!p.water) p.water = {};
      if(!p.sleep) p.sleep = {};
      if(!p.mood) p.mood = {};
      if(!p.meals) p.meals = {};
      if(!p.habits) p.habits = [];
      if(!p.habitLogs) p.habitLogs = {};
      if(!p.badgesSeen) p.badgesSeen = [];
      if(!p.badgeDates) p.badgeDates = {};
      if(p.lastBackupAt===undefined) p.lastBackupAt = null;
      if(p.lastOpenedAt===undefined) p.lastOpenedAt = null;
      if(p.notifEnabled===undefined) p.notifEnabled = false;
      if(!p.challenges) p.challenges = [];
      if(!p.cravings) p.cravings = [];
      if(!p.appointments) p.appointments = [];
      if(!p.medications) p.medications = [];
      if(!p.medLogs) p.medLogs = {};
      if(p.mealPlan===undefined) p.mealPlan = null;
      if(!p.shoppingChecked) p.shoppingChecked = {};
      if(!p.favMeals) p.favMeals = [];
      if(p.travelMode===undefined) p.travelMode = false;
      if(!p.fasting) p.fasting = { protocol:'16:8', active:null, history:[] };
      if(!p.fasting.history) p.fasting.history = [];
      if(p.fasting.active===undefined) p.fasting.active = null;
      if(!p.fasting.protocol) p.fasting.protocol = '16:8';
      if(!p.createdAt) p.createdAt = (p.weights[0] && p.weights[0].date) || todayKeySafe();
      return p;
    }
  }catch(e){}
  return defaultDB();
}
function saveDB(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }catch(e){ toast("Não foi possível salvar."); }
}
let db = loadDB();

const THEME_COLORS = {
  light: '#7C3AED',
  dark: '#0B0A12',
  red: '#DC2626',
  green: '#16A34A',
  pink: '#DB2777',
  blue: '#2563EB'
};
const THEME_LABELS = {
  light: 'Claro (Roxo & Lilás)',
  dark: 'Escuro',
  red: 'Vermelho',
  green: 'Verde',
  pink: 'Rosa',
  blue: 'Azul'
};
const THEME_SWATCH_COLORS = {
  light: {bg:'#F7F5FC', primary:'#7C3AED'},
  dark:  {bg:'#151226', primary:'#8B5CF6'},
  red:   {bg:'#FFFFFF', primary:'#DC2626'},
  green: {bg:'#FFFFFF', primary:'#16A34A'},
  pink:  {bg:'#FFFFFF', primary:'#DB2777'},
  blue:  {bg:'#FFFFFF', primary:'#2563EB'}
};
function themeSwatchStyle(t){
  const c = THEME_SWATCH_COLORS[t] || THEME_SWATCH_COLORS.light;
  return `background:linear-gradient(135deg, ${c.bg} 50%, ${c.primary} 50%);`;
}
function applyTheme(){
  const t = THEME_COLORS[db.settings.theme] ? db.settings.theme : 'light';
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', THEME_COLORS[t]);
}
applyTheme();

/* ============ Perfil: opções ============ */
const OBJECTIVES = {
  perder_gordura: {label:'Perder gordura', icon:'🔥'},
  ganhar_massa: {label:'Ganhar massa', icon:'💪'},
  controlar_diabetes: {label:'Controlar diabetes', icon:'🩸'},
  controlar_pressao: {label:'Controlar pressão', icon:'❤️'},
  habitos_saudaveis: {label:'Hábitos saudáveis', icon:'🌱'}
};
const BODY_TYPES = {
  magro: 'Magro',
  medio: 'Médio',
  cheio: 'Cheio'
};
const SEX_OPTIONS = {
  m: 'Masculino',
  f: 'Feminino',
  outro: 'Prefiro não dizer'
};
const ACTIVITY_LEVELS = {
  sedentario: {label:'Sedentário', factor:1.2, desc:'Pouco ou nenhum exercício'},
  leve: {label:'Viva Leve', factor:1.375, desc:'Exercício leve 1-3x/semana'},
  moderado: {label:'Moderado', factor:1.55, desc:'Exercício moderado 3-5x/semana'},
  intenso: {label:'Intenso', factor:1.725, desc:'Exercício pesado 6-7x/semana'},
  muito_intenso: {label:'Muito intenso', factor:1.9, desc:'Exercício muito pesado ou trabalho físico'}
};
function objectiveLabel(){
  const o = db.profile.objective;
  return o && OBJECTIVES[o] ? OBJECTIVES[o].label : 'Não definido';
}
function firstName(){
  const n = (db.profile.name||'').trim();
  return n ? n.split(' ')[0] : '';
}

/* ============ Helpers ============ */
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function pad2(n){ return n<10 ? '0'+n : ''+n; }
function toKey(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function todayKey(){ return toKey(new Date()); }
function keyToDate(key){ const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); }
function addDaysKey(key,n){ const dt=keyToDate(key); dt.setDate(dt.getDate()+n); return toKey(dt); }
function formatShort(key){ const d=keyToDate(key); return pad2(d.getDate())+'/'+pad2(d.getMonth()+1); }
function formatLabelRelative(key){
  const t=todayKey(), y=addDaysKey(t,-1);
  if(key===t) return 'Hoje';
  if(key===y) return 'Ontem';
  return formatShort(key);
}
function weekdayLetter(key){
  const names=['D','S','T','Q','Q','S','S'];
  return names[keyToDate(key).getDay()];
}
function fmtNum(v, decimals){
  v = Number(v)||0;
  return v.toLocaleString('pt-BR', {minimumFractionDigits:decimals||0, maximumFractionDigits:decimals||0});
}
function norm(s){ return String(s==null?"":s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function last7Keys(){
  const arr=[]; const t = todayKey();
  for(let i=6;i>=0;i--) arr.push(addDaysKey(t,-i));
  return arr;
}

/* ============ Toast ============ */
let toastTimer=null;
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'), 1900);
}

/* ============ Modal ============ */
function closeModal(){
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('modalBody').innerHTML="";
}
function openModal(html, onOpen){
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('overlay').classList.remove('hidden');
  if(onOpen) onOpen();
}
document.getElementById('overlay').addEventListener('click', function(e){
  if(e.target.id==='overlay') closeModal();
});
function confirmModal(title, text, confirmLabel, onConfirm){
  openModal(`
    <h2>${title}</h2>
    <p style="color:var(--muted); font-size:14px; margin-top:-6px;">${text}</p>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Cancelar</button>
      <button class="btn danger" id="mOk">${confirmLabel}</button>
    </div>
  `, ()=>{
    document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('mOk').onclick = ()=>{ onConfirm(); closeModal(); };
  });
}
function escapeHtml(s){
function escapeHtml(s){ return escapeHtml(s); }
window.escapeHTML = escapeHtml;
  return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s){ return escapeHtml(s); }

/* ============ PWA install ============ */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredInstallPrompt = e; });
window.addEventListener('appinstalled', ()=>{ deferredInstallPrompt = null; toast("App instalado!"); });
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{ navigator.serviceWorker.register('/sw.js').catch(()=>{}); });
}
function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function triggerInstall(){
  if(isStandalone()){ toast("O Leve já está instalado neste aparelho."); return; }
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(()=>{ deferredInstallPrompt = null; });
    return;
  }
  if(isIOS()){
    openModal(`
      <h2>Instalar no iPhone</h2>
      <p style="color:var(--muted); font-size:14px; line-height:1.6;">
        1. Toque no botão <b>Compartilhar</b> (□ com seta para cima) na barra do Safari.<br><br>
        2. Escolha <b>"Adicionar à Tela de Início"</b>.<br><br>
        3. Toque em <b>Adicionar</b>.
      </p>
      <div class="modal-actions"><button class="btn" id="mOk2">Entendi</button></div>
    `, ()=>{ document.getElementById('mOk2').onclick = closeModal; });
    return;
  }
  openModal(`
    <h2>Instalar app</h2>
    <p style="color:var(--muted); font-size:14px; line-height:1.6;">
      Toque no menu (⋮) do navegador e escolha <b>"Instalar app"</b> ou <b>"Adicionar à tela inicial"</b>.
    </p>
    <div class="modal-actions"><button class="btn" id="mOk2">Entendi</button></div>
  `, ()=>{ document.getElementById('mOk2').onclick = closeModal; });
}

/* ============ Backup ============ */
function exportBackup(){
  try{
    const blob = new Blob([JSON.stringify(db, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leve-backup-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
    db.lastBackupAt = todayKey();
    saveDB();
    toast("Backup exportado.");
  }catch(e){ toast("Não foi possível exportar."); }
}
document.getElementById('importFile').addEventListener('change', function(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const parsed = JSON.parse(ev.target.result);
      if(!parsed || !Array.isArray(parsed.weights)){ toast("Arquivo inválido."); return; }
      confirmModal("Importar backup", "Isso vai substituir todos os dados atuais do app. Continuar?", "Importar", ()=>{
        db = parsed;
        if(!db.settings) db.settings = {theme:'light'};
        if(!db.profile) db.profile = {weightGoal:null, waterGoalMl:2000, calorieGoal:null};
        if(!db.water) db.water = {};
        if(!db.sleep) db.sleep = {};
        if(!db.mood) db.mood = {};
        if(!db.meals) db.meals = {};
        if(!db.habits) db.habits = [];
        if(!db.habitLogs) db.habitLogs = {};
        if(!db.measurements) db.measurements = [];
        if(!db.badgesSeen) db.badgesSeen = [];
        if(!db.badgeDates) db.badgeDates = {};
        if(!db.challenges) db.challenges = [];
        if(!db.cravings) db.cravings = [];
        if(!db.appointments) db.appointments = [];
        if(!db.medications) db.medications = [];
        if(!db.medLogs) db.medLogs = {};
        if(db.mealPlan===undefined) db.mealPlan = null;
        if(!db.shoppingChecked) db.shoppingChecked = {};
        if(!db.favMeals) db.favMeals = [];
        if(db.travelMode===undefined) db.travelMode = false;
        if(!db.fasting) db.fasting = { protocol:'16:8', active:null, history:[] };
        if(!db.createdAt) db.createdAt = todayKeySafe();
        applyTheme(); saveDB();
        toast("Backup importado.");
        go('home');
      });
    }catch(err){ toast("Não foi possível ler o arquivo."); }
    e.target.value = "";
  };
  reader.readAsText(file);
});

/* ============ Charts ============ */
function ringSvg(pct, size, stroke, color){
  size=size||100; stroke=stroke||10; color=color||'var(--primary)';
  const r=(size-stroke)/2, c=2*Math.PI*r, off=c-(Math.min(100,Math.max(0,pct))/100)*c;
  const cx=size/2, cy=size/2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round"/>
  </svg>`;
}

function lineChartSvg(points, opts){
  opts = opts || {};
  const W = opts.width||320, H = opts.height||140, pad=28;
  if(points.length===0){
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="12" fill="var(--muted)">Sem dados ainda</text></svg>`;
  }
  const values = points.map(p=>p.value);
  let min = Math.min(...values), max = Math.max(...values);
  if(min===max){ min -= 1; max += 1; }
  const range = max-min;
  const padY = range*0.15;
  min -= padY; max += padY;
  const stepX = points.length>1 ? (W-2*pad)/(points.length-1) : 0;
  const xy = points.map((p,i)=>{
    const x = pad + i*stepX;
    const y = H-pad - ((p.value-min)/(max-min))*(H-2*pad);
    return [x,y];
  });
  const linePath = xy.map((pt,i)=> (i===0?'M':'L')+pt[0].toFixed(1)+','+pt[1].toFixed(1)).join(' ');
  const areaPath = linePath + ` L${xy[xy.length-1][0].toFixed(1)},${H-pad} L${xy[0][0].toFixed(1)},${H-pad} Z`;
  const dots = xy.map((pt,i)=>`<circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="${i===xy.length-1?4:2.5}" fill="var(--primary)"/>`).join('');
  const firstLabel = points[0].label||'';
  const lastLabel = points[points.length-1].label||'';
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <path d="${areaPath}" fill="var(--primary)" opacity="0.10"/>
    <path d="${linePath}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    <text x="${pad}" y="${H-8}" font-size="9.5" fill="var(--muted)">${firstLabel}</text>
    <text x="${W-pad}" y="${H-8}" font-size="9.5" fill="var(--muted)" text-anchor="end">${lastLabel}</text>
  </svg>`;
}

function weekBarChartHtml(days, opts){
  // days: [{label, value, goalReached(optional bool), key}]
  opts = opts || {};
  const max = Math.max(1, ...days.map(d=>d.value), opts.refLine||0);
  return `<div class="week-chart" style="display:flex; align-items:flex-end; gap:6px; height:60px; margin-top:6px;">
    ${days.map(d=>{
      const h = Math.max(3, Math.round((d.value/max)*48));
      const color = d.goalReached===true ? 'var(--green)' : (d.goalReached===false ? 'var(--orange)' : 'var(--primary)');
      return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
        <div style="width:100%; max-width:20px; height:48px; display:flex; align-items:flex-end;">
          <div style="width:100%; height:${h}px; background:${color}; border-radius:4px 4px 0 0;"></div>
        </div>
        <div style="font-size:9px; color:var(--muted); font-weight:700;">${d.label}</div>
      </div>`;
    }).join("")}
  </div>`;
}

/* ============ Navigation ============ */
let route = { tab: "home" };
function go(tab){ route = { tab }; render(); }

const TABS = [
  {key:'home', icon:'🏠', label:'Início'},
  {key:'peso', icon:'⚖️', label:'Peso'},
  {key:'agua', icon:'💧', label:'Água'},
  {key:'comida', icon:'🍽️', label:'Comida'},
  {key:'treino', icon:'🏋️', label:'Treino'},
  {key:'mais', icon:'☰', label:'Mais'}
];
const TAB_TITLES = {home:'Viva Leve', peso:'Peso', agua:'Água', comida:'Refeições', jejum:'Jejum intermitente', treino:'Treino', evolucao:'Evolução', habitos:'Hábitos', saude:'Agenda & Saúde', relatorio:'Relatório mensal', mais:'Mais'};
const SUBPAGES = ['saude','relatorio','jejum','evolucao','habitos'];
const MAIS_ROUTES = ['jejum','evolucao','habitos','saude','relatorio'];

function renderChrome(){
  const tb = document.getElementById('topbar');
  const isSub = SUBPAGES.indexOf(route.tab)!==-1;
  const dot = backupOverdue() ? `<span class="notif-dot"></span>` : '';
  tb.innerHTML = isSub
    ? `<button class="action" id="btnBack" title="Voltar" style="margin-right:2px;">←</button><h1>${TAB_TITLES[route.tab]}</h1><button class="action" id="btnSettings" title="Ajustes" style="position:relative;">⚙${dot}</button>`
    : `<h1>${TAB_TITLES[route.tab]}</h1><button class="action" id="btnSettings" title="Ajustes" style="position:relative;">⚙${dot}</button>`;
  document.getElementById('btnSettings').onclick = openSettingsModal;
  const backBtn = document.getElementById('btnBack');
  if(backBtn) backBtn.onclick = ()=>go('mais');

  const activeTabKey = MAIS_ROUTES.indexOf(route.tab)!==-1 ? 'mais' : route.tab;
  const tab = document.getElementById('tabbar');
  tab.innerHTML = TABS.map(t=>`
    <button class="${activeTabKey===t.key?'active':''}" data-tab="${t.key}">
      <span class="ticon">${t.icon}</span><span>${t.label}</span>
    </button>
  `).join("");
  tab.querySelectorAll('button').forEach(b=>{ b.onclick = ()=>go(b.dataset.tab); });
}

function render(){
  closeModal();
  window.scrollTo(0,0);
  stopFastingTimerLoop();
  renderChrome();
  switch(route.tab){
    case 'home': return renderHome();
    case 'peso': return renderPeso();
    case 'agua': return renderAgua();
    case 'comida': return renderComida();
    case 'jejum': return renderJejum();
    case 'treino': return renderTreino();
    case 'evolucao': return renderEvolucao();
    case 'habitos': return renderHabitos();
    case 'saude': return renderSaude();
    case 'relatorio': return renderRelatorio();
    case 'mais': return renderMais();
    default: return renderHome();
  }
}

/* ============ Settings modal ============ */
function openSettingsModal(){
  const p = db.profile;
  openModal(`
    <h2>Ajustes</h2>
    <div class="warn-box">As metas abaixo devem ser definidas por você — o ideal é buscar orientação de um nutricionista ou médico para números seguros e adequados ao seu caso.</div>
    <div class="field"><label>Meta de peso (kg)</label><input type="text" inputmode="decimal" id="goalWeight" placeholder="Ex: 70" value="${p.weightGoal!=null?fmtNum(p.weightGoal,1):''}"></div>
    <div class="field"><label>Meta de água (ml/dia)</label><input type="text" inputmode="numeric" id="goalWater" placeholder="Ex: 2000" value="${p.waterGoalMl!=null?p.waterGoalMl:''}"></div>
    <div class="field"><label>Meta de calorias (kcal/dia) — opcional</label><input type="text" inputmode="numeric" id="goalCalorie" placeholder="Deixe em branco se não quiser definir" value="${p.calorieGoal!=null?p.calorieGoal:''}"></div>
    <div class="modal-actions" style="margin-bottom:16px;">
      <button class="btn" id="saveGoals">Salvar metas</button>
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Instalar app</div><div class="srow-sub">${isStandalone() ? 'Já instalado neste aparelho ✓' : 'Adicionar o Leve à tela inicial'}</div></div>
      <button class="btn small" id="installBtn" ${isStandalone()?'disabled style="opacity:.4"':''}>Instalar</button>
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Meu perfil</div><div class="srow-sub">${db.profile.name ? escapeHtml(db.profile.name)+' · '+objectiveLabel() : 'Complete seu cadastro'}</div></div>
      <button class="btn small secondary" id="editProfileBtn">Editar</button>
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Agenda & Medicamentos</div><div class="srow-sub">Consultas, exames e lembretes de remédios</div></div>
      <button class="btn small secondary" id="openSaudeBtn">Abrir</button>
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Relatório mensal</div><div class="srow-sub">Resumo do mês para salvar ou imprimir</div></div>
      <button class="btn small secondary" id="openRelatorioBtn">Abrir</button>
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Modo viagem</div><div class="srow-sub">Prioriza receitas e treinos rápidos</div></div>
      <button class="switch ${db.travelMode?'on':''}" id="travelSwitch"></button>
    </div>
    <div class="section-label" style="margin-top:14px;">Tema</div>
    <div class="theme-grid">
      ${Object.keys(THEME_LABELS).map(t=>`
        <button class="theme-swatch ${db.settings.theme===t?'active':''}" data-theme-opt="${t}">
          <span class="ts-dot" style="${themeSwatchStyle(t)}"></span>
          <span class="ts-label">${THEME_LABELS[t]}</span>
        </button>
      `).join('')}
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Exportar backup</div><div class="srow-sub">${backupStatusText()}</div></div>
      <button class="btn small ${backupOverdue()?'':'secondary'}" id="exportBtn">Exportar</button>
    </div>
    <div class="settings-row">
      <div><div class="srow-label">Lembretes locais</div><div class="srow-sub">${notifPermissionLabel()}</div></div>
      <button class="switch ${db.notifEnabled&&canUseNotifications()&&Notification.permission==='granted'?'on':''}" id="notifSwitch"></button>
    </div>
    <div class="hint" style="margin:-4px 0 14px 0; line-height:1.5;">Isso avisa você enquanto o app estiver aberto ou pouco tempo em segundo plano no seu navegador. Não é uma notificação push de verdade (isso exigiria um servidor) — se você ficar dias sem abrir o Leve, o app não consegue te avisar sozinho. Quando você voltar, ele te recebe com uma mensagem.</div>
    <div class="settings-row">
      <div><div class="srow-label">Importar backup</div><div class="srow-sub">Restaura dados de um arquivo .json</div></div>
      <button class="btn small secondary" id="importBtn">Importar</button>
    </div>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn secondary" id="mClose">Fechar</button>
    </div>
  `, ()=>{
    document.getElementById('mClose').onclick = closeModal;
    document.getElementById('saveGoals').onclick = ()=>{
      const gw = document.getElementById('goalWeight').value.replace(',','.');
      const gwa = document.getElementById('goalWater').value;
      const gc = document.getElementById('goalCalorie').value;
      const newGoal = gw ? parseFloat(gw) : null;
      const applyGoals = ()=>{
        db.profile.weightGoal = newGoal;
        db.profile.waterGoalMl = gwa ? parseInt(gwa,10) : 2000;
        db.profile.calorieGoal = gc ? parseInt(gc,10) : null;
        saveDB(); toast("Metas salvas."); closeModal(); render();
      };
      if(newGoal!=null && db.profile.height){
        const idealRange = idealWeightRange(db.profile.height);
        if(idealRange && newGoal < idealRange.min - 1){
          confirmModal("Meta abaixo do peso saudável", `Para sua altura, o peso saudável mínimo é de aproximadamente ${fmtNum(idealRange.min,1)} kg. A meta que você definiu está abaixo disso. Deseja continuar mesmo assim? Considere conversar com um profissional de saúde sobre sua meta.`, "Continuar mesmo assim", applyGoals);
          return;
        }
      }
      applyGoals();
    };
    const installBtn = document.getElementById('installBtn');
    if(installBtn) installBtn.onclick = ()=>{ closeModal(); triggerInstall(); };
    document.getElementById('editProfileBtn').onclick = ()=>{ closeModal(); openProfileModal(false); };
    document.getElementById('openSaudeBtn').onclick = ()=>{ closeModal(); route={tab:'saude'}; render(); };
    document.getElementById('openRelatorioBtn').onclick = ()=>{ closeModal(); route={tab:'relatorio'}; render(); };
    document.getElementById('travelSwitch').onclick = (e)=>{
      db.travelMode = !db.travelMode;
      saveDB();
      e.target.classList.toggle('on');
      toast(db.travelMode ? "Modo viagem ativado ✈️" : "Modo viagem desativado");
    };
    document.getElementById('notifSwitch').onclick = async ()=>{
      await toggleNotifications();
      openSettingsModal();
    };
    document.querySelectorAll('[data-theme-opt]').forEach(btn=>{
      btn.onclick = ()=>{
        db.settings.theme = btn.getAttribute('data-theme-opt');
        applyTheme(); saveDB();
        document.querySelectorAll('[data-theme-opt]').forEach(b=>b.classList.toggle('active', b===btn));
      };
    });
    document.getElementById('exportBtn').onclick = exportBackup;
    document.getElementById('importBtn').onclick = ()=>document.getElementById('importFile').click();
  });
}

/* ============ Perfil / Cadastro ============ */
function segField(label, id, options, current){
  return `<div class="field"><label>${label}</label>
    <div class="seg" id="${id}">
      ${Object.keys(options).map(k=>`<button type="button" data-v="${k}" class="${current===k?'active':''}">${options[k].icon?options[k].icon+' ':''}${options[k].label||options[k]}</button>`).join('')}
    </div>
  </div>`;
}
function segGetValue(id){
  const el = document.getElementById(id);
  const active = el.querySelector('button.active');
  return active ? active.dataset.v : null;
}
function segWire(id){
  document.getElementById(id).querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{
      document.getElementById(id).querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
    };
  });
}
function openProfileModal(isOnboarding){
  const p = db.profile;
  openModal(`
    <h2>${isOnboarding ? 'Vamos te conhecer 👋' : 'Editar perfil'}</h2>
    ${isOnboarding ? `<p style="color:var(--muted); font-size:13.5px; margin-top:-8px; line-height:1.5;">Essas informações ajudam o Leve a personalizar suas metas e dicas. Você pode editar tudo depois em Ajustes.</p>` : ''}
    <div class="field"><label>Nome</label><input type="text" id="pName" placeholder="Como podemos te chamar?" value="${p.name?escapeAttr(p.name):''}" autofocus></div>
    ${segField('Sexo', 'pSex', SEX_OPTIONS, p.sex)}
    <div class="dt-row">
      <div class="field"><label>Idade</label><input type="text" inputmode="numeric" id="pAge" placeholder="Ex: 34" value="${p.age!=null?p.age:''}"></div>
      <div class="field"><label>Altura (cm)</label><input type="text" inputmode="numeric" id="pHeight" placeholder="Ex: 170" value="${p.height!=null?p.height:''}"></div>
    </div>
    ${isOnboarding ? `
    <div class="dt-row">
      <div class="field"><label>Peso atual (kg)</label><input type="text" inputmode="decimal" id="pWeightNow" placeholder="Ex: 90,5"></div>
      <div class="field"><label>Peso desejado (kg)</label><input type="text" inputmode="decimal" id="pWeightGoal" placeholder="Ex: 75" value="${p.weightGoal!=null?fmtNum(p.weightGoal,1):''}"></div>
    </div>
    <div class="field"><label>Circunferência abdominal (cm) — opcional</label><input type="text" inputmode="decimal" id="pAbdomen" placeholder="Ex: 98"></div>
    ` : ''}
    ${segField('Tipo físico', 'pBodyType', BODY_TYPES, p.bodyType)}
    ${segField('Nível de atividade física', 'pActivity', ACTIVITY_LEVELS, p.activityLevel)}
    ${segField('Objetivo principal', 'pObjective', OBJECTIVES, p.objective)}
    <div class="modal-actions" style="margin-top:6px;">
      ${isOnboarding ? '' : '<button class="btn secondary" id="mCancel">Cancelar</button>'}
      <button class="btn" id="mSaveProfile">${isOnboarding ? 'Começar' : 'Salvar'}</button>
    </div>
  `, ()=>{
    segWire('pSex'); segWire('pBodyType'); segWire('pActivity'); segWire('pObjective');
    if(!isOnboarding) document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('mSaveProfile').onclick = ()=>{
      const name = document.getElementById('pName').value.trim();
      if(isOnboarding && !name){ toast("Digite seu nome para continuar."); return; }
      p.name = name || p.name;
      p.sex = segGetValue('pSex');
      const age = parseInt(document.getElementById('pAge').value,10);
      p.age = isNaN(age) ? p.age : age;
      const height = parseInt(document.getElementById('pHeight').value,10);
      p.height = isNaN(height) ? p.height : height;
      p.bodyType = segGetValue('pBodyType');
      p.activityLevel = segGetValue('pActivity');
      p.objective = segGetValue('pObjective');

      function finishSave(){
        if(isOnboarding){
          const wNow = parseFloat((document.getElementById('pWeightNow').value||'').replace(',','.'));
          const abdomen = parseFloat((document.getElementById('pAbdomen').value||'').replace(',','.'));
          const t = todayKey();
          if(!isNaN(wNow) && wNow>0){
            const idx = db.weights.findIndex(w=>w.date===t);
            if(idx>=0) db.weights[idx].value = wNow; else db.weights.push({id:uid(), date:t, value:wNow});
          }
          if(!isNaN(abdomen) && abdomen>0){
            db.measurements.push({id:uid(), date:t, abdomen:abdomen});
          }
        }
        saveDB(); closeModal();
        toast(isOnboarding ? `Bem-vindo(a) ao Leve, ${firstName()||''}! 🌱` : "Perfil atualizado.");
        go('home');
      }

      if(isOnboarding){
        const wGoal = parseFloat((document.getElementById('pWeightGoal').value||'').replace(',','.'));
        if(!isNaN(wGoal)) p.weightGoal = wGoal;
        const idealRange = idealWeightRange(p.height);
        if(!isNaN(wGoal) && idealRange && wGoal < idealRange.min - 1){
          confirmModal("Meta abaixo do peso saudável", `Para a altura informada, o peso saudável mínimo é de aproximadamente ${fmtNum(idealRange.min,1)} kg. Sua meta está abaixo disso. Deseja continuar mesmo assim? Considere conversar com um profissional de saúde sobre sua meta.`, "Continuar mesmo assim", finishSave);
          return;
        }
      }
      finishSave();
    };
  });
}


/* ============ HOME ============ */
function greetingText(){
  const h = new Date().getHours();
  if(h < 12) return 'Bom dia';
  if(h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function dayCompletionPct(){
  const tKey = todayKey();
  const dayWater = (db.water && typeof db.water[tKey] === 'number') ? db.water[tKey] : (Array.isArray(db.water) ? (db.water.filter(w=>w.date===tKey).reduce((a,b)=>a+(Number(b.amount)||0),0)) : 0);
  const waterMeta = Number(db.profile?.waterGoalMl) || 2000;
  
  const todayMeals = (db.meals && Array.isArray(db.meals[tKey])) ? db.meals[tKey] : (Array.isArray(db.meals) ? db.meals.filter(m=>m.date===tKey) : []);
  const dayCals = todayMeals.reduce((acc, m) => acc + (Number(m.kcal || m.calories) || 0), 0);
  const calMeta = Number(db.profile?.calorieGoal) || 2000;
  
  return Math.min(100, Math.round(((dayWater / waterMeta) * 0.5 + (Math.min(dayCals, calMeta) / calMeta) * 0.5) * 100)) || 0;
}

function renderHome(){
  const top = document.getElementById('topbar');
  const main = document.getElementById('main');
  const tKey = todayKey();
  const dObj = keyToDate(tKey);
  const user = db.profile || {};
  const userName = user.name ? user.name.split(' ')[0] : 'Você';
  
  top.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
      <div>
        <div style="font-size:12px;color:rgba(255,255,255,0.85);font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Viva Leve</div>
        <div style="font-size:20px;font-weight:800;color:#FFFFFF;margin-top:2px;">${greetingText()}, ${escapeHtml(userName)} 👋</div>
      </div>
      <button onclick="openSettingsModal()" style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;">
        <span style="font-size:16px;">⚙️</span>
      </button>
    </div>
  `;
  
  // Água
  const dayWater = (db.water && typeof db.water[tKey] === 'number') ? db.water[tKey] : 0;
  const waterMeta = Number(db.profile?.waterGoalMl) || 2000;
  
  // Calorias
  const todayMeals = (db.meals && Array.isArray(db.meals[tKey])) ? db.meals[tKey] : [];
  const dayCals = todayMeals.reduce((acc, m) => acc + (Number(m.kcal || m.calories) || 0), 0);
  const calMeta = Number(db.profile?.calorieGoal) || 2000;
  
  // Treino
  let workoutDone = false;
  if(Array.isArray(db.workouts)){
    workoutDone = db.workouts.some(w => w.date === tKey && w.completed);
  } else if(db.workouts && typeof db.workouts === 'object'){
    workoutDone = !!db.workouts[tKey];
  }
  
  // Peso
  const weights = Array.isArray(db.weights) ? db.weights.slice().sort((a,b) => (b.date||'').localeCompare(a.date||'')) : [];
  const latestWeight = weights.length > 0 ? Number(weights[0].weight).toFixed(1) : (user.initialWeight || '--');
  
  const pct = dayCompletionPct();

  let fastBanner = '';
  if(db.fasting && db.fasting.active){
    const start = new Date(db.fasting.startTime);
    const hrs = ((Date.now() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
    fastBanner = `
      <div onclick="go('corpo')" style="background:rgba(245,158,11,0.12);border:1px solid var(--gold);border-radius:var(--radius);padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:18px;">⏳</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--gold);">Jejum em andamento</div>
            <div style="font-size:11px;color:var(--muted);">${hrs}h decorridas (meta ${db.fasting.targetHours || 16}h)</div>
          </div>
        </div>
        <span style="color:var(--gold);font-weight:700;font-size:12px;">Ver →</span>
      </div>
    `;
  }

  main.innerHTML = `
    ${fastBanner}

    <!-- Card de Boas-vindas e Resumo do Dia -->
    <div class="day-summary-card">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:12px;color:var(--lilac);font-weight:600;">RESUMO DE HOJE</div>
          <div style="font-size:16px;font-weight:700;color:var(--text);margin-top:2px;">${dObj.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'short' })}</div>
        </div>
        <div style="text-align:right;">
          <span style="background:var(--primary-soft);color:var(--lilac);border:1px solid var(--primary);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;">${pct}% concluído</span>
        </div>
      </div>

      <div class="summary-mini-grid">
        <div class="summary-mini-item">
          <span class="summary-mini-label">💧 Água</span>
          <span class="summary-mini-val">${dayWater} <span style="font-size:11px;color:var(--muted);font-weight:400;">/ ${waterMeta} ml</span></span>
        </div>
        <div class="summary-mini-item">
          <span class="summary-mini-label">🔥 Calorias</span>
          <span class="summary-mini-val">${dayCals} <span style="font-size:11px;color:var(--muted);font-weight:400;">/ ${calMeta} kcal</span></span>
        </div>
        <div class="summary-mini-item">
          <span class="summary-mini-label">🏋️ Treino</span>
          <span class="summary-mini-val" style="color:${workoutDone ? 'var(--green)' : 'var(--muted)'};">${workoutDone ? 'Realizado ✓' : 'Pendente'}</span>
        </div>
        <div class="summary-mini-item">
          <span class="summary-mini-label">⚖️ Peso Atual</span>
          <span class="summary-mini-val">${latestWeight} <span style="font-size:11px;color:var(--muted);font-weight:400;">kg</span></span>
        </div>
      </div>
    </div>

    <!-- Ações Rápidas -->
    <div style="font-size:13px;font-weight:700;color:var(--lilac);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Ações Rápidas</div>
    <div class="quick-actions-grid">
      <button class="quick-action-btn" onclick="quickAddWater()">
        <div class="qa-icon" style="background:rgba(96,165,250,0.15);color:#60A5FA;">💧</div>
        <div class="qa-info">
          <span class="qa-title">+250ml Água</span>
          <span class="qa-sub">Registro rápido</span>
        </div>
      </button>

      <button class="quick-action-btn" onclick="openMealModal()">
        <div class="qa-icon" style="background:rgba(245,158,11,0.15);color:var(--gold);">🍽️</div>
        <div class="qa-info">
          <span class="qa-title">Refeição</span>
          <span class="qa-sub">Adicionar comida</span>
        </div>
      </button>

      <button class="quick-action-btn" onclick="toggleTodayWorkout()">
        <div class="qa-icon" style="background:rgba(139,92,246,0.15);color:var(--primary);">🏋️</div>
        <div class="qa-info">
          <span class="qa-title">Treino</span>
          <span class="qa-sub">${workoutDone ? 'Concluído ✓' : 'Marcar treino'}</span>
        </div>
      </button>

      <button class="quick-action-btn" onclick="openWeightModal()">
        <div class="qa-icon" style="background:rgba(196,181,253,0.15);color:var(--lilac);">⚖️</div>
        <div class="qa-info">
          <span class="qa-title">Pesagem</span>
          <span class="qa-sub">Atualizar peso</span>
        </div>
      </button>
    </div>
  `;
}

function quickAddWater(){
  const tKey = todayKey();
  if(!db.water) db.water = {};
  db.water[tKey] = (Number(db.water[tKey]) || 0) + 250;
  saveDB();
  toast('+250ml de água registrado!');
  renderHome();
}

function toggleTodayWorkout(){
  const tKey = todayKey();
  if(!db.workouts) db.workouts = [];
  if(Array.isArray(db.workouts)){
    const idx = db.workouts.findIndex(w => w.date === tKey);
    if(idx >= 0){
      db.workouts.splice(idx, 1);
      toast('Treino de hoje removido.');
    } else {
      db.workouts.push({ id: uid(), date: tKey, title: 'Treino do Dia', completed: true });
      toast('Treino de hoje concluído! 🏋️');
    }
  } else {
    db.workouts[tKey] = !db.workouts[tKey];
    toast(db.workouts[tKey] ? 'Treino de hoje concluído! 🏋️' : 'Treino de hoje removido.');
  }
  saveDB();
  renderHome();
}


/* ============ MAIS (menu) ============ */
function renderMais(){
  const main = document.getElementById('main');
  const items = [
    {route:'jejum', icon:'⏳', title:'Jejum intermitente', sub:'Cronômetro, guia, receitas e progresso'},
    {route:'evolucao', icon:'📊', title:'Evolução', sub:'Calendário, linha do tempo, desafios e ranking'},
    {route:'habitos', icon:'✅', title:'Hábitos', sub:'Seus hábitos e controle de compulsão'},
    {route:'saude', icon:'🩺', title:'Agenda & Saúde', sub:'Consultas, exames e medicamentos'},
    {route:'relatorio', icon:'📄', title:'Relatório mensal', sub:'Resumo do mês para salvar ou imprimir'}
  ];
  let html = `<div class="hint" style="margin-bottom:12px;">Tudo que você usa com menos frequência, num só lugar.</div>`;
  html += items.map(it=>`
    <div class="card mais-item" data-goto="${it.route}">
      <div style="font-size:24px;">${it.icon}</div>
      <div style="flex:1;">
        <div style="font-weight:800; color:var(--text); font-size:14.5px;">${it.title}</div>
        <div class="hint" style="margin-top:1px;">${it.sub}</div>
      </div>
      <div style="color:var(--muted); font-size:16px;">›</div>
    </div>
  `).join("");
  html += `<div class="card mais-item" id="maisSettingsRow">
    <div style="font-size:24px;">⚙️</div>
    <div style="flex:1;">
      <div style="font-weight:800; color:var(--text); font-size:14.5px;">Ajustes</div>
      <div class="hint" style="margin-top:1px;">Perfil, tema, metas e backup</div>
    </div>
    <div style="color:var(--muted); font-size:16px;">›</div>
  </div>`;
  main.innerHTML = html;
  main.querySelectorAll('[data-goto]').forEach(el=>{ el.onclick = ()=>go(el.dataset.goto); });
  document.getElementById('maisSettingsRow').onclick = openSettingsModal;
}

/* ============ SONO & HUMOR ============ */
const MOOD_OPTIONS = [
  {key:'pessimo', icon:'😔', label:'Péssimo'},
  {key:'ruim', icon:'😕', label:'Ruim'},
  {key:'ok', icon:'🙂', label:'Bom'},
  {key:'otimo', icon:'😃', label:'Ótimo'}
];
function moodInfo(key){ return MOOD_OPTIONS.find(m=>m.key===key); }
function openSleepModal(){
  const t = todayKey();
  const cur = db.sleep[t] || {};
  openModal(`
    <h2>😴 Sono</h2>
    <div class="field"><label>Quantas horas você dormiu?</label><input type="text" inputmode="decimal" id="sleepHours" placeholder="Ex: 7,5" value="${cur.hours!=null?fmtNum(cur.hours,1):''}" autofocus></div>
    <div class="field"><label>Como foi a qualidade?</label>
      <div class="seg" id="sleepQuality">
        ${['Ruim','Regular','Boa','Ótima'].map(q=>`<button type="button" data-v="${q}" class="${cur.quality===q?'active':''}">${q}</button>`).join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Cancelar</button>
      <button class="btn" id="mSave">Salvar</button>
    </div>
  `, ()=>{
    segWire('sleepQuality');
    document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('mSave').onclick = ()=>{
      const raw = document.getElementById('sleepHours').value.replace(',','.');
      const hours = parseFloat(raw);
      if(isNaN(hours) || hours<0 || hours>24){ toast("Informe um número de horas válido."); return; }
      db.sleep[t] = { hours, quality: segGetValue('sleepQuality') };
      saveDB(); closeModal(); render();
      toast("Sono registrado.");
    };
  });
}
function openMoodModal(){
  const t = todayKey();
  openModal(`
    <h2>😊 Como você está se sentindo hoje?</h2>
    <div class="mood-grid">
      ${MOOD_OPTIONS.map(m=>`<button class="mood-btn ${db.mood[t]===m.key?'active':''}" data-mood="${m.key}">
        <span class="mood-emoji">${m.icon}</span><span class="mood-label">${m.label}</span>
      </button>`).join('')}
    </div>
  `, ()=>{
    document.querySelectorAll('[data-mood]').forEach(b=>{
      b.onclick = ()=>{
        db.mood[t] = b.dataset.mood;
        saveDB(); closeModal(); render();
        toast("Humor registrado.");
      };
    });
  });
}

/* ============ HOME ============ */

let pesoRange = '30d'; // '7d' | '30d' | 'tudo'
let pesoSubtab = 'peso'; // 'peso' | 'medidas' | 'calc'
function renderPeso(){
  const main = document.getElementById('main');
  const subtabsHtml = `<div class="subtabs" id="pesoSubtabs">
    <button data-s="peso" class="${pesoSubtab==='peso'?'active':''}">Peso</button>
    <button data-s="medidas" class="${pesoSubtab==='medidas'?'active':''}">Medidas</button>
    <button data-s="calc" class="${pesoSubtab==='calc'?'active':''}">Calculadora</button>
  </div>`;
  let bodyHtml;
  if(pesoSubtab==='medidas') bodyHtml = renderMedidasBody();
  else if(pesoSubtab==='calc') bodyHtml = buildCalculadoraHtml();
  else bodyHtml = renderPesoBody();
  main.innerHTML = subtabsHtml + bodyHtml;
  main.querySelectorAll('#pesoSubtabs button').forEach(b=>{
    b.onclick = ()=>{ pesoSubtab = b.dataset.s; renderPeso(); };
  });
  if(pesoSubtab==='medidas') wireMedidasBody();
  else if(pesoSubtab==='calc') wireCalculadoraBody();
  else wirePesoBody();
}
function renderPesoBody(){
  const goal = db.profile.weightGoal;
  const sorted = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);

  let filtered = sorted;
  if(pesoRange==='7d') filtered = sorted.filter(w=> w.date >= addDaysKey(todayKey(),-6));
  else if(pesoRange==='30d') filtered = sorted.filter(w=> w.date >= addDaysKey(todayKey(),-29));

  const tip = coachTipForTab('peso');
  let html = tip ? `<div class="coach-card"><div class="coach-head"><span class="ci">🤖</span><span class="ct">Coach</span></div><div class="coach-msg"><span class="cm-dot"></span><span>${tip}</span></div></div>` : '';

  html += `
    <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div>
        <div class="hint" style="margin:0; font-weight:700; color:var(--text); font-size:13px;">Meta de peso</div>
        <div style="font-size:18px; font-weight:800; color:var(--primary);">${goal!=null?fmtNum(goal,1)+' kg':'Não definida'}</div>
      </div>
      <button class="btn chip" id="editGoalBtn">Editar meta</button>
    </div>
    <button class="btn" id="addWeightBtn" style="margin-bottom:14px;">+ Registrar peso</button>
  `;

  html += `<div class="range-tabs" id="rangeTabs">
    <button data-r="7d" class="${pesoRange==='7d'?'active':''}">7 dias</button>
    <button data-r="30d" class="${pesoRange==='30d'?'active':''}">30 dias</button>
    <button data-r="tudo" class="${pesoRange==='tudo'?'active':''}">Tudo</button>
  </div>`;

  const pts = filtered.map(w=>({value:w.value, label:formatShort(w.date)}));
  html += `<div class="card"><div class="chart-wrap">${lineChartSvg(pts)}</div></div>`;

  html += `<div class="section-label">Histórico</div>`;
  if(sorted.length===0){
    html += `<div class="empty-state"><div class="e-emoji">⚖️</div><div class="e-text">Nenhum peso registrado ainda.</div></div>`;
  } else {
    const desc = sorted.slice().reverse();
    html += desc.map((w,i)=>{
      const prev = desc[i+1];
      let diffHtml = '';
      if(prev){
        const d = w.value - prev.value;
        const cls = d<0?'down':(d>0?'up':'same');
        diffHtml = `<span class="er-diff ${cls}">${d===0?'—':(d>0?'+':'')+fmtNum(d,1)}</span>`;
      }
      return `<div class="entry-row" data-id="${w.id}">
        <div class="er-date">${formatLabelRelative(w.date)}</div>
        <div class="er-val">${fmtNum(w.value,1)} kg</div>
        ${diffHtml}
        <button class="er-del" data-del="${w.id}">🗑</button>
      </div>`;
    }).join("");
  }
  return html;
}
function wirePesoBody(){
  const main = document.getElementById('main');
  document.getElementById('editGoalBtn').onclick = openSettingsModal;
  document.getElementById('addWeightBtn').onclick = ()=>openWeightModal();
  document.getElementById('rangeTabs').querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{ pesoRange = b.dataset.r; renderPeso(); };
  });
  main.querySelectorAll('[data-del]').forEach(b=>{
    b.onclick = (e)=>{
      e.stopPropagation();
      confirmModal("Excluir registro", "Remover este registro de peso?", "Excluir", ()=>{
        db.weights = db.weights.filter(w=>w.id!==b.dataset.del);
        saveDB(); renderPeso();
      });
    };
  });
}
function openWeightModal(){
  openModal(`
    <h2>Registrar peso</h2>
    <div class="field"><label>Data</label><input type="date" id="wDate" value="${todayKey()}"></div>
    <div class="field"><label>Peso (kg)</label><input type="text" inputmode="decimal" id="wValue" placeholder="Ex: 78,5" autofocus></div>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Cancelar</button>
      <button class="btn" id="mSave">Salvar</button>
    </div>
  `, ()=>{
    document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('wValue').focus();
    document.getElementById('mSave').onclick = ()=>{
      const dateVal = document.getElementById('wDate').value || todayKey();
      const raw = document.getElementById('wValue').value.replace(',','.');
      const val = parseFloat(raw);
      if(isNaN(val) || val<=0){ toast("Informe um peso válido."); return; }
      const existingIdx = db.weights.findIndex(w=>w.date===dateVal);
      if(existingIdx>=0){ db.weights[existingIdx].value = val; }
      else { db.weights.push({id:uid(), date:dateVal, value:val}); }
      saveDB(); closeModal(); renderPeso();
      toast("Peso registrado.");
      checkNewBadges();
    };
  });
}

/* ============ CALCULADORA (IMC, TMB, TDEE, previsão) ============ */
function lastWeightValue(){
  return db.weights.length ? db.weights[db.weights.length-1].value : null;
}
function calcIMC(weight, heightCm){
  if(!weight || !heightCm) return null;
  const h = heightCm/100;
  return weight/(h*h);
}
function imcClassification(imc){
  if(imc==null) return '—';
  if(imc<18.5) return 'Abaixo do peso';
  if(imc<25) return 'Peso normal';
  if(imc<30) return 'Sobrepeso';
  if(imc<35) return 'Obesidade grau I';
  if(imc<40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}
function idealWeightRange(heightCm){
  if(!heightCm) return null;
  const h = heightCm/100;
  return {min: 18.5*h*h, max: 24.9*h*h};
}
function estimateTDEE(){
  const bmr = estimateBMR();
  const lvl = ACTIVITY_LEVELS[db.profile.activityLevel] || ACTIVITY_LEVELS.sedentario;
  return bmr * lvl.factor;
}
function idealWaterMl(weight){
  if(!weight) return null;
  return Math.round(weight*35);
}
function estimateBodyFatPct(){
  const p = db.profile;
  const last = db.measurements.slice().sort((a,b)=> a.date<b.date?-1:1).pop();
  if(!last || last.neck==null || last.waist==null || !p.height) return null;
  const h = p.height;
  if(p.sex==='f'){
    if(last.hip==null) return null;
    const val = 495/(1.29579 - 0.35004*Math.log10(last.waist+last.hip-last.neck) + 0.22100*Math.log10(h)) - 450;
    return val>0 && val<70 ? val : null;
  }
  const val = 495/(1.0324 - 0.19077*Math.log10(last.waist-last.neck) + 0.15456*Math.log10(h)) - 450;
  return val>0 && val<70 ? val : null;
}
function weeklyTrendKg(){
  const w = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);
  const recent = w.filter(x=> x.date >= addDaysKey(todayKey(),-29));
  if(recent.length<2) return null;
  const days = (keyToDate(recent[recent.length-1].date) - keyToDate(recent[0].date))/86400000;
  if(days<7) return null;
  const totalChange = recent[recent.length-1].value - recent[0].value;
  const rate = (totalChange/days)*7;
  // Sanidade: ignora tendências implausíveis (provavelmente ruído/erro de digitação)
  if(Math.abs(rate) > 2) return null;
  return rate;
}
function buildProjection(){
  const cur = lastWeightValue();
  if(!cur) return null;
  let weeklyRate = weeklyTrendKg();
  let source = 'tendência recente';
  if(weeklyRate==null){
    const tdee = estimateTDEE();
    const goal = db.profile.calorieGoal;
    if(goal){
      const dailyDeficit = tdee - goal;
      weeklyRate = -(dailyDeficit*7)/7700;
      source = 'meta de calorias';
    } else {
      return null;
    }
  }
  // Limite de segurança: nunca projetar abaixo do IMC 18,5 (ou acima de um ganho extremo)
  const idealRange = idealWeightRange(db.profile.height);
  const floor = idealRange ? idealRange.min : cur*0.7;
  const ceiling = cur*1.6;
  const horizons = [30,60,90,180,365];
  return {
    weeklyRate, source,
    points: horizons.map(days=>{
      let w = cur + weeklyRate*(days/7);
      w = Math.max(floor, Math.min(ceiling, w));
      return {days, weight: w};
    })
  };
}
function daysToGoal(){
  const cur = lastWeightValue();
  const goal = db.profile.weightGoal;
  if(!cur || goal==null) return null;
  const diff = cur - goal; // positivo = precisa perder, negativo = precisa ganhar
  if(Math.abs(diff) < 0.3) return {days:0, reached:true};
  const proj = buildProjection();
  if(!proj) return null;
  const rate = proj.weeklyRate; // kg/semana, negativo = perdendo peso
  if(diff>0 && rate>=0) return null; // não está indo na direção da meta
  if(diff<0 && rate<=0) return null;
  const weeksNeeded = diff/(-rate);
  const daysNeeded = Math.round(weeksNeeded*7);
  if(daysNeeded<=0 || daysNeeded>1825) return null; // limite de sanidade (~5 anos é longe demais pra ser útil)
  return {days:daysNeeded, reached:false};
}
function buildCalculadoraHtml(){
  const p = db.profile;
  const weight = lastWeightValue();
  const height = p.height;
  let html = '';

  if(!weight || !height){
    html += `<div class="empty-state"><div class="e-emoji">🧮</div><div class="e-text">Para calcular, preciso do seu peso e altura.<br>Registre seu peso na aba Peso e complete sua altura no perfil.</div></div>`;
    html += `<button class="btn" id="goProfileBtn" style="margin-top:6px;">Completar perfil</button>`;
    return html;
  }

  const imc = calcIMC(weight, height);
  const idealRange = idealWeightRange(height);
  const bmr = estimateBMR();
  const tdee = estimateTDEE();
  const water = idealWaterMl(weight);
  const bodyFat = estimateBodyFatPct();
  const deficit = p.calorieGoal ? (tdee - p.calorieGoal) : null;

  html += `<div class="section-label">Seus números</div>`;
  html += `<div class="card">
    <div class="rp-row"><span>IMC</span><b>${fmtNum(imc,1)} · ${imcClassification(imc)}</b></div>
    <div class="rp-row"><span>Faixa de peso saudável</span><b>${idealRange?fmtNum(idealRange.min,1)+' – '+fmtNum(idealRange.max,1)+' kg':'—'}</b></div>
    <div class="rp-row"><span>Gasto calórico basal (TMB)</span><b>${fmtNum(Math.round(bmr))} kcal</b></div>
    <div class="rp-row"><span>Gasto calórico diário (TDEE)</span><b>${fmtNum(Math.round(tdee))} kcal</b></div>
    <div class="rp-row"><span>Água ideal por dia</span><b>${fmtNum(water)} ml</b></div>
    ${deficit!=null?`<div class="rp-row"><span>Déficit/superávit calórico da sua meta</span><b>${deficit>0?'-':'+'}${fmtNum(Math.abs(Math.round(deficit)))} kcal/dia</b></div>`:''}
    ${bodyFat!=null?`<div class="rp-row"><span>% de gordura estimado</span><b>${fmtNum(bodyFat,1)}%</b></div>`:''}
  </div>`;
  if(bodyFat!=null){
    const fatMass = weight*(bodyFat/100);
    const leanMass = weight - fatMass;
    html += `<div class="card">
      <div class="rp-row"><span>Massa gorda estimada</span><b>${fmtNum(fatMass,1)} kg</b></div>
      <div class="rp-row"><span>Massa magra estimada</span><b>${fmtNum(leanMass,1)} kg</b></div>
    </div>`;
  } else {
    html += `<div class="hint" style="margin-bottom:12px;">Adicione as medidas de pescoço, cintura${p.sex==='f'?' e quadril':''} para estimar sua composição corporal (% de gordura, massa magra e massa gorda).</div>`;
  }
  if(!p.activityLevel){
    html += `<div class="hint" style="margin-bottom:12px;">Defina seu nível de atividade física no perfil para um TDEE mais preciso — hoje está usando "sedentário" como padrão.</div>`;
  }

  const proj = buildProjection();
  html += `<div class="section-label">Projeção de peso</div>`;
  if(!proj){
    html += `<div class="card"><div class="hint">Para projetar sua evolução, registre pelo menos 2 pesos em datas diferentes (últimos 30 dias), ou defina uma meta de calorias em Ajustes.</div></div>`;
  } else {
    const hitFloor = proj.points.some(pt=> idealRange && Math.abs(pt.weight-idealRange.min)<0.05);
    html += `<div class="card">
      <div class="hint" style="margin-bottom:8px;">Com base na sua ${proj.source}, mantendo o ritmo atual:</div>
      ${proj.points.map(pt=>`<div class="rp-row"><span>Em ${pt.days} dias</span><b>${fmtNum(pt.weight,1)} kg</b></div>`).join('')}
      <div class="hint" style="margin-top:8px;">Isso é uma estimativa que assume que seus hábitos continuam parecidos. Sua evolução real pode variar bastante${Math.abs(proj.weeklyRate)>1?' — perder mais de 1kg por semana de forma sustentada raramente é saudável a longo prazo':''}.</div>
      ${hitFloor?`<div class="hint" style="margin-top:6px; color:var(--orange); font-weight:700;">⚠️ Alguns pontos foram limitados à faixa de peso saudável — perder peso continuamente abaixo dela não é recomendado nem realista.</div>`:''}
    </div>`;
    const pts = [{value:weight, label:'Hoje'}].concat(proj.points.map(pt=>({value:Math.round(pt.weight*10)/10, label:pt.days+'d'})));
    html += `<div class="card"><div class="chart-wrap">${lineChartSvg(pts)}</div></div>`;
  }

  if(p.weightGoal!=null){
    const dtg = daysToGoal();
    html += `<div class="section-label">Estimativa para sua meta</div><div class="card">`;
    if(!dtg){
      html += `<div class="hint">Ainda não consigo estimar quando você atinge sua meta — preciso de uma tendência de peso (ou meta de calorias) caminhando na direção certa.</div>`;
    } else if(dtg.reached){
      html += `<div class="hint" style="font-weight:700; color:var(--primary);">🎉 Você já está na sua meta (ou muito perto dela)!</div>`;
    } else {
      const targetDate = new Date(Date.now()+dtg.days*86400000);
      const dateLabel = targetDate.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
      html += `<div class="rp-row"><span>Nesse ritmo, você atinge sua meta em</span><b>~${fmtNum(dtg.days)} dias</b></div>
      <div class="rp-row"><span>Data aproximada</span><b>${dateLabel}</b></div>
      <div class="hint" style="margin-top:8px;">Estimativa baseada no seu ritmo atual — pode mudar bastante conforme sua rotina continua.</div>`;
    }
    html += `</div>`;
  }

  return html;
}
function wireCalculadoraBody(){
  const btn = document.getElementById('goProfileBtn');
  if(btn) btn.onclick = ()=>openProfileModal(false);
}

/* ============ MEDIDAS CORPORAIS ============ */
const MEASURE_FIELDS = [
  {key:'neck', label:'Pescoço', icon:'📐'},
  {key:'arm', label:'Braço', icon:'💪'},
  {key:'chest', label:'Peito', icon:'📐'},
  {key:'waist', label:'Cintura', icon:'📏'},
  {key:'abdomen', label:'Abdômen', icon:'⭕'},
  {key:'hip', label:'Quadril', icon:'📐'},
  {key:'thigh', label:'Coxa', icon:'🦵'},
  {key:'calf', label:'Panturrilha', icon:'🦶'}
];
let medidaChartField = 'waist';
function renderMedidasBody(){
  const sorted = db.measurements.slice().sort((a,b)=> a.date<b.date?-1:1);
  const last = sorted.length ? sorted[sorted.length-1] : null;

  let html = `<div class="hint" style="margin-bottom:12px;">Peso sozinho engana — acompanhar as medidas ajuda a ver a evolução real, mesmo quando a balança parece parada.</div>`;
  html += `<button class="btn" id="addMeasureBtn" style="margin-bottom:14px;">+ Registrar medidas</button>`;

  if(last){
    html += `<div class="stat-grid">`;
    MEASURE_FIELDS.forEach(f=>{
      const val = last[f.key];
      html += `<div class="stat-card">
        <div class="sc-top"><span class="sc-icon">${f.icon}</span></div>
        <div class="sc-label">${f.label}</div>
        <div class="sc-val">${val!=null?fmtNum(val,1)+' cm':'—'}</div>
      </div>`;
    });
    html += `</div>`;

    html += `<div class="section-label">Evolução</div>`;
    html += `<div class="filter-chips" id="measureFieldChips">
      ${MEASURE_FIELDS.map(f=>`<button data-f="${f.key}" class="${medidaChartField===f.key?'active':''}">${f.label}</button>`).join('')}
    </div>`;
    const pts = sorted.filter(m=>m[medidaChartField]!=null).map(m=>({value:m[medidaChartField], label:formatShort(m.date)}));
    html += `<div class="card"><div class="chart-wrap">${lineChartSvg(pts)}</div></div>`;
  } else {
    html += `<div class="empty-state"><div class="e-emoji">📏</div><div class="e-text">Nenhuma medida registrada ainda.<br>Adicione braço, cintura, quadril e outras medidas para acompanhar sua evolução real.</div></div>`;
  }

  html += `<div class="section-label">Histórico</div>`;
  if(sorted.length===0){
    html += `<div class="empty-state"><div class="e-emoji">📋</div><div class="e-text">Sem registros ainda.</div></div>`;
  } else {
    const desc = sorted.slice().reverse();
    html += desc.map(m=>{
      const parts = MEASURE_FIELDS.filter(f=>m[f.key]!=null).map(f=>`${f.label.slice(0,3)}: ${fmtNum(m[f.key],1)}cm`).join(' · ');
      return `<div class="entry-row" style="align-items:flex-start;" data-id="${m.id}">
        <div class="er-date">${formatLabelRelative(m.date)}</div>
        <div class="er-val" style="font-size:12.5px; font-weight:600; line-height:1.5;">${parts||'—'}</div>
        <button class="er-del" data-del="${m.id}">🗑</button>
      </div>`;
    }).join("");
  }
  return html;
}
function wireMedidasBody(){
  const main = document.getElementById('main');
  document.getElementById('addMeasureBtn').onclick = openMeasureModal;
  const chips = document.getElementById('measureFieldChips');
  if(chips) chips.querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{ medidaChartField = b.dataset.f; renderPeso(); };
  });
  main.querySelectorAll('[data-del]').forEach(b=>{
    b.onclick = (e)=>{
      e.stopPropagation();
      confirmModal("Excluir registro", "Remover este registro de medidas?", "Excluir", ()=>{
        db.measurements = db.measurements.filter(m=>m.id!==b.dataset.del);
        saveDB(); renderPeso();
      });
    };
  });
}
function openMeasureModal(){
  const last = db.measurements.slice().sort((a,b)=> a.date<b.date?-1:1).pop();
  openModal(`
    <h2>Registrar medidas</h2>
    <div class="field"><label>Data</label><input type="date" id="mDate" value="${todayKey()}"></div>
    ${MEASURE_FIELDS.map(f=>`<div class="field"><label>${f.icon} ${f.label} (cm)</label><input type="text" inputmode="decimal" id="mf_${f.key}" placeholder="Ex: 90" value="${last&&last[f.key]!=null?fmtNum(last[f.key],1):''}"></div>`).join('')}
    <div class="hint" style="margin-bottom:10px;">Preencha só o que quiser medir hoje — os campos vazios não serão salvos.</div>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Cancelar</button>
      <button class="btn" id="mSave">Salvar</button>
    </div>
  `, ()=>{
    document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('mSave').onclick = ()=>{
      const dateVal = document.getElementById('mDate').value || todayKey();
      const entry = {id:uid(), date:dateVal};
      let any = false;
      MEASURE_FIELDS.forEach(f=>{
        const raw = document.getElementById('mf_'+f.key).value.replace(',','.');
        const val = parseFloat(raw);
        if(!isNaN(val) && val>0){ entry[f.key] = val; any = true; }
      });
      if(!any){ toast("Preencha ao menos uma medida."); return; }
      const idx = db.measurements.findIndex(m=>m.date===dateVal);
      if(idx>=0){ db.measurements[idx] = Object.assign({}, db.measurements[idx], entry); }
      else { db.measurements.push(entry); }
      saveDB(); closeModal(); renderPeso();
      toast("Medidas registradas.");
    };
  });
}

/* ============ ÁGUA ============ */
function coachBoxHtml(tab){
  const tip = coachTipForTab(tab);
  if(!tip) return '';
  return `<div class="coach-card"><div class="coach-head"><span class="ci">🤖</span><span class="ct">Coach</span></div><div class="coach-msg"><span class="cm-dot"></span><span>${tip}</span></div></div>`;
}
function renderAgua(){
  const main = document.getElementById('main');
  const t = todayKey();
  const goal = db.profile.waterGoalMl || 2000;
  const today = db.water[t] || 0;
  const pct = Math.min(100, Math.round((today/goal)*100));

  let html = coachBoxHtml('agua');
  html += `<div class="card">
    <div class="water-hero">
      <div class="ring-wrap">${ringSvg(pct, 100, 10, 'var(--blue)')}
        <div class="ring-label"><div class="rval">${pct}%</div><div class="rsub">da meta</div></div>
      </div>
      <div style="flex:1;">
        <div style="font-size:22px; font-weight:800; color:var(--text);">${fmtNum(today)} ml</div>
        <div class="hint" style="margin-top:2px;">Meta diária: ${fmtNum(goal)} ml</div>
        <button class="btn chip" id="editGoalBtn" style="margin-top:10px;">Editar meta</button>
      </div>
    </div>
    <div class="water-quick">
      <button class="btn secondary" data-add="200">+200 ml</button>
      <button class="btn secondary" data-add="300">+300 ml</button>
      <button class="btn secondary" data-add="500">+500 ml</button>
      <button class="btn secondary" id="customAdd">+ Outro</button>
    </div>
    <button class="btn ghost" id="resetWater" style="margin-top:10px;">Zerar hoje</button>
  </div>`;

  const days = last7Keys().map(k=>({
    label: weekdayLetter(k),
    value: db.water[k]||0,
    goalReached: (db.water[k]||0) >= goal ? true : ((db.water[k]||0)>0 ? false : null)
  }));
  html += `<div class="section-label">Últimos 7 dias</div>
  <div class="card">${weekBarChartHtml(days)}</div>`;

  main.innerHTML = html;
  document.getElementById('editGoalBtn').onclick = openSettingsModal;
  main.querySelectorAll('[data-add]').forEach(b=>{
    b.onclick = ()=>{
      db.water[t] = (db.water[t]||0) + parseInt(b.dataset.add,10);
      saveDB(); renderAgua();
      checkNewBadges();
    };
  });
  document.getElementById('customAdd').onclick = ()=>{
    openModal(`
      <h2>Adicionar água</h2>
      <div class="field"><label>Quantidade (ml)</label><input type="text" inputmode="numeric" id="customMl" placeholder="Ex: 350" autofocus></div>
      <div class="modal-actions">
        <button class="btn secondary" id="mCancel">Cancelar</button>
        <button class="btn" id="mSave">Adicionar</button>
      </div>
    `, ()=>{
      document.getElementById('mCancel').onclick = closeModal;
      document.getElementById('customMl').focus();
      document.getElementById('mSave').onclick = ()=>{
        const val = parseInt(document.getElementById('customMl').value,10);
        if(isNaN(val) || val<=0){ toast("Informe uma quantidade válida."); return; }
        db.water[t] = (db.water[t]||0) + val;
        saveDB(); closeModal(); renderAgua();
      };
    });
  };
  document.getElementById('resetWater').onclick = ()=>{
    confirmModal("Zerar água de hoje", "Isso vai zerar o total de água registrado hoje.", "Zerar", ()=>{
      db.water[t] = 0; saveDB(); renderAgua();
    });
  };
}

/* ============ COMIDA ============ */
const MEAL_TYPES = [
  {key:'cafe', label:'Café da manhã', icon:'☕'},
  {key:'almoco', label:'Almoço', icon:'🍛'},
  {key:'lanche', label:'Lanche', icon:'🍎'},
  {key:'jantar', label:'Jantar', icon:'🍲'}
];
function mealTypeInfo(key){ return MEAL_TYPES.find(m=>m.key===key) || MEAL_TYPES[2]; }

let comidaSubtab = 'hoje';
let receitaFilter = 'todos';
const DAYS_ORDER = ['seg','ter','qua','qui','sex','sab','dom'];
const DAYS_LABEL = {seg:'Segunda',ter:'Terça',qua:'Quarta',qui:'Quinta',sex:'Sexta',sab:'Sábado',dom:'Domingo'};
const PLAN_SLOTS = ['cafe','lanche1','almoco','lanche2','janta'];
const PLAN_SLOT_LABEL = {cafe:'Café', lanche1:'Lanche', almoco:'Almoço', lanche2:'Lanche', janta:'Janta'};
const PLAN_SLOT_RECIPE_TYPE = {cafe:'cafe', lanche1:'lanche', almoco:'almoco', lanche2:'lanche', janta:'jantar'};

function renderComida(){
  const main = document.getElementById('main');
  const subtabHtml = `<div class="subtabs" id="comidaSubtabs">
    <button data-s="hoje" class="${comidaSubtab==='hoje'?'active':''}">Meu registro</button>
    <button data-s="receitas" class="${comidaSubtab==='receitas'?'active':''}">Receitas</button>
    <button data-s="plano" class="${comidaSubtab==='plano'?'active':''}">Cardápio</button>
  </div>`;
  let contentHtml;
  if(comidaSubtab==='hoje') contentHtml = buildComidaHojeHtml();
  else if(comidaSubtab==='receitas') contentHtml = buildComidaReceitasHtml();
  else contentHtml = buildComidaPlanoHtml();
  main.innerHTML = subtabHtml + contentHtml;

  main.querySelectorAll('#comidaSubtabs button').forEach(b=>{
    b.onclick = ()=>{ comidaSubtab = b.dataset.s; renderComida(); };
  });
  if(comidaSubtab==='hoje') bindComidaHojeEvents(main);
  else if(comidaSubtab==='receitas') bindComidaReceitasEvents(main);
  else bindComidaPlanoEvents(main);
}

/* ---- Planejamento alimentar semanal ---- */
function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function generateWeeklyPlan(){
  const usedByType = {cafe:[], almoco:[], jantar:[], lanche:[]};
  const days = {};
  DAYS_ORDER.forEach(d=>{
    const daySlots = {};
    PLAN_SLOTS.forEach(slot=>{
      const rtype = PLAN_SLOT_RECIPE_TYPE[slot];
      let pool = RECIPES.filter(r=>r.type===rtype);
      if(db.travelMode) pool = pool.filter(r=>r.prep<=15).concat(pool.filter(r=>r.prep<=15).length?[]:pool);
      let notUsed = pool.filter(r=>usedByType[rtype].indexOf(r.id)===-1);
      const chosen = pickRandom(notUsed.length?notUsed:pool);
      daySlots[slot] = chosen.id;
      usedByType[rtype].push(chosen.id);
      if(usedByType[rtype].length>=pool.length) usedByType[rtype]=[];
    });
    days[d] = daySlots;
  });
  db.mealPlan = { weekStart: todayKey(), days };
  db.shoppingChecked = {};
  saveDB();
}
function weekPlanCoachTip(){
  const o = db.profile.objective;
  if(o==='controlar_diabetes') return "Montei o cardápio priorizando refeições regulares — evite pular horários, isso ajuda a manter a glicemia estável ao longo da semana.";
  if(o==='controlar_pressao') return "Fique de olho no sal ao temperar — o cardápio evita frituras e embutidos, mas o tempero é por sua conta.";
  if(o==='ganhar_massa') return "Semana montada com boas fontes de proteína no almoço e na janta, para apoiar o ganho de massa.";
  return "Semana montada com variedade entre as refeições — sinta-se à vontade para trocar qualquer prato na aba Receitas.";
}
function todayPlanDayKey(){
  const map = ['dom','seg','ter','qua','qui','sex','sab'];
  return map[new Date().getDay()];
}
function buildComidaPlanoHtml(){
  let html = '';
  if(!db.mealPlan){
    html += `<div class="empty-state"><div class="e-emoji">🗓️</div><div class="e-text">Você ainda não tem um cardápio da semana.<br>Gere um cardápio completo, de segunda a domingo, com café, lanches, almoço e janta.</div></div>`;
    html += `<button class="btn" id="genPlanBtn" style="margin-top:6px;">Gerar cardápio da semana</button>`;
    return html;
  }
  if(!db.mealPlan.loggedDates) db.mealPlan.loggedDates = {};
  const loggedToday = db.mealPlan.loggedDates[todayKey()] || [];
  const todayD = todayPlanDayKey();

  html += `<div class="coach-card"><div class="coach-head"><span class="ci">🤖</span><span class="ct">Coach</span></div><div class="coach-msg"><span class="cm-dot"></span><span>${weekPlanCoachTip()}</span></div></div>`;
  html += `<div class="modal-actions" style="margin-bottom:14px;">
    <button class="btn secondary" id="genPlanBtn">🔄 Novo cardápio</button>
    <button class="btn" id="viewShoppingBtn">🛒 Lista de compras</button>
  </div>`;
  DAYS_ORDER.forEach(d=>{
    const daySlots = db.mealPlan.days[d];
    const isToday = d===todayD;
    html += `<div class="card" style="${isToday?'border-color:var(--primary);':''}">
      <div style="font-weight:800; color:var(--text); font-size:14px; margin-bottom:8px;">${DAYS_LABEL[d]}${isToday?' <span class="proto-tag">Hoje</span>':''}</div>
      ${PLAN_SLOTS.map(slot=>{
        const r = RECIPES.find(x=>x.id===daySlots[slot]);
        if(!r) return '';
        const alreadyLogged = isToday && loggedToday.indexOf(d+':'+slot)!==-1;
        return `<div class="plan-row-wrap">
          <div class="plan-row" data-planrecipe="${r.id}" style="flex:1;">
            <span class="plan-slot">${PLAN_SLOT_LABEL[slot]}</span>
            <span class="plan-name">${r.name}</span>
            <span class="plan-kcal">${fmtNum(r.kcal)} kcal</span>
          </div>
          ${isToday?`<button class="plan-log-btn ${alreadyLogged?'done':''}" data-planlog="${d}:${slot}" data-planlogrecipe="${r.id}" ${alreadyLogged?'disabled':''}>${alreadyLogged?'✓ Registrado':'Registrei isso'}</button>`:''}
        </div>`;
      }).join("")}
    </div>`;
  });
  return html;
}
function bindComidaPlanoEvents(main){
  const genBtn = document.getElementById('genPlanBtn');
  if(genBtn) genBtn.onclick = ()=>{
    const doIt = ()=>{ generateWeeklyPlan(); renderComida(); toast("Novo cardápio gerado! 🍽️"); };
    if(db.mealPlan) confirmModal("Gerar novo cardápio", "Isso vai substituir o cardápio atual da semana. Continuar?", "Gerar", doIt);
    else doIt();
  };
  const shopBtn = document.getElementById('viewShoppingBtn');
  if(shopBtn) shopBtn.onclick = openShoppingListModal;
  main.querySelectorAll('[data-planrecipe]').forEach(row=>{
    row.onclick = ()=>openRecipeModal(RECIPES.find(r=>r.id===row.dataset.planrecipe));
  });
  main.querySelectorAll('[data-planlog]').forEach(btn=>{
    btn.onclick = (e)=>{
      e.stopPropagation();
      const r = RECIPES.find(x=>x.id===btn.dataset.planlogrecipe);
      if(!r) return;
      const t = todayKey();
      const slotType = PLAN_SLOT_RECIPE_TYPE[btn.dataset.planlog.split(':')[1]];
      if(!db.meals[t]) db.meals[t] = [];
      db.meals[t].push({id:uid(), name:r.name, kcal:r.kcal, type:slotType});
      if(!db.mealPlan.loggedDates) db.mealPlan.loggedDates = {};
      if(!db.mealPlan.loggedDates[t]) db.mealPlan.loggedDates[t] = [];
      db.mealPlan.loggedDates[t].push(btn.dataset.planlog);
      saveDB(); renderComida();
      toast("Refeição registrada. ✓");
      checkNewBadges();
    };
  });
}
function buildShoppingList(){
  if(!db.mealPlan) return [];
  const items = new Set();
  DAYS_ORDER.forEach(d=>{
    PLAN_SLOTS.forEach(slot=>{
      const r = RECIPES.find(x=>x.id===db.mealPlan.days[d][slot]);
      if(r) r.ingredients.forEach(i=>items.add(i));
    });
  });
  return Array.from(items).sort((a,b)=>a.localeCompare(b,'pt-BR'));
}
function openShoppingListModal(){
  const items = buildShoppingList();
  openModal(`
    <h2>🛒 Lista de compras</h2>
    <p style="color:var(--muted); font-size:12.5px; margin-top:-6px; margin-bottom:12px; line-height:1.5;">Gerada automaticamente a partir do seu cardápio da semana.</p>
    <div id="shopList">
      ${items.map((item,i)=>`<div class="shop-item">
        <div class="check ${db.shoppingChecked[item]?'checked':''}" data-shop="${i}">${db.shoppingChecked[item]?'✓':''}</div>
        <div class="${db.shoppingChecked[item]?'shop-done':''}">${escapeHtml(item)}</div>
      </div>`).join("")}
    </div>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn secondary" id="mClose">Fechar</button>
    </div>
  `, ()=>{
    document.getElementById('mClose').onclick = closeModal;
    document.querySelectorAll('#shopList [data-shop]').forEach((el,i)=>{
      el.onclick = ()=>{
        const item = items[i];
        db.shoppingChecked[item] = !db.shoppingChecked[item];
        saveDB();
        el.classList.toggle('checked');
        el.innerHTML = db.shoppingChecked[item] ? '✓' : '';
        el.nextElementSibling.classList.toggle('shop-done');
      };
    });
  });
}

function buildComidaHojeHtml(){
  const t = todayKey();
  const meals = db.meals[t] || [];
  const total = meals.reduce((s,m)=>s+(Number(m.kcal)||0),0);
  const goal = db.profile.calorieGoal;

  let html = coachBoxHtml('comida');
  html += `<div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
    <div>
      <div class="hint" style="margin:0; font-weight:700; color:var(--text); font-size:13px;">Total de hoje</div>
      <div style="font-size:22px; font-weight:800; color:var(--primary);">${fmtNum(total)} kcal</div>
      <div class="hint">${goal!=null?'Meta: '+fmtNum(goal)+' kcal':'Nenhuma meta definida'}</div>
    </div>
    <button class="btn chip" id="editGoalBtn">Editar meta</button>
  </div>`;
  if(goal!=null){
    const pct = Math.min(100, Math.round((total/goal)*100));
    html = html.replace('</div>\n  </div>', `</div>\n    <div class="sc-track" style="margin-top:8px;"><div class="sc-fill" style="width:${pct}%; background:${total>goal?'var(--orange)':'var(--green)'};"></div></div>\n  </div>`);
  }

  html += `<button class="btn" id="addMealBtn" style="margin:14px 0;">+ Adicionar refeição</button>`;

  html += `<div class="section-label">Hoje</div>`;
  if(meals.length===0){
    html += `<div class="empty-state"><div class="e-emoji">🍽️</div><div class="e-text">Nenhuma refeição registrada hoje.</div></div>`;
  } else {
    MEAL_TYPES.forEach(mt=>{
      const items = meals.filter(m=>m.type===mt.key);
      if(items.length===0) return;
      const subtotal = items.reduce((s,m)=>s+(Number(m.kcal)||0),0);
      html += `<div class="meal-group">
        <div class="mg-title"><span>${mt.icon} ${mt.label}</span><span>${fmtNum(subtotal)} kcal</span></div>
        ${items.map(m=>`
          <div class="meal-row" data-id="${m.id}">
            <div class="mr-name">${escapeHtml(m.name)}</div>
            <div class="mr-kcal">${fmtNum(m.kcal)} kcal</div>
            <button class="mr-del" data-del="${m.id}">🗑</button>
          </div>
        `).join("")}
      </div>`;
    });
  }

  const days = last7Keys().map(k=>{
    const dayMeals = db.meals[k] || [];
    const val = dayMeals.reduce((s,m)=>s+(Number(m.kcal)||0),0);
    return { label: weekdayLetter(k), value: val, goalReached: goal!=null ? (val<=goal && val>0 ? true : (val>0?false:null)) : null };
  });
  html += `<div class="section-label">Últimos 7 dias</div>
  <div class="card">${weekBarChartHtml(days)}</div>`;

  return html;
}
function bindComidaHojeEvents(main){
  const t = todayKey();
  const editBtn = document.getElementById('editGoalBtn');
  if(editBtn) editBtn.onclick = openSettingsModal;
  const addBtn = document.getElementById('addMealBtn');
  if(addBtn) addBtn.onclick = ()=>openMealModal();
  main.querySelectorAll('[data-del]').forEach(b=>{
    b.onclick = ()=>{
      db.meals[t] = (db.meals[t]||[]).filter(m=>m.id!==b.dataset.del);
      saveDB(); renderComida();
    };
  });
}

function buildComidaReceitasHtml(){
  const types = ['todos', ...MEAL_TYPES.map(m=>m.key)];
  let html = '';
  if(db.travelMode){
    html += `<div class="card craving-card" style="border-color:var(--blue); margin-bottom:12px;">
      <div style="font-weight:800; color:var(--text); font-size:13.5px;">🧳 Modo viagem ativo</div>
      <div class="hint" style="margin-top:2px;">Mostrando só receitas rápidas (até 15 min de preparo).</div>
    </div>`;
  }
  html += `<div class="filter-chips" id="receitaFilters">
    ${types.map(k=>`<button data-k="${k}" class="${receitaFilter===k?'active':''}">${k==='todos'?'Todas':MEAL_TYPE_LABELS[k]}</button>`).join("")}
  </div>`;
  let list = receitaFilter==='todos' ? RECIPES : RECIPES.filter(r=>r.type===receitaFilter);
  if(db.travelMode) list = list.filter(r=>r.prep<=15);
  html += list.length===0 ? `<div class="empty-state"><div class="e-emoji">🍽️</div><div class="e-text">Nenhuma receita rápida nessa categoria.</div></div>` : list.map(r=>`
    <div class="recipe-card" data-r="${r.id}">
      <div class="rc-top">
        <div class="rc-name">${r.name}</div>
        <div class="rc-badge">${fmtNum(r.kcal)} kcal</div>
      </div>
      <div class="rc-meta">${MEAL_TYPE_LABELS[r.type]} · ${r.prep} min de preparo</div>
    </div>
  `).join("");
  return html;
}
function bindComidaReceitasEvents(main){
  main.querySelectorAll('#receitaFilters button').forEach(b=>{
    b.onclick = ()=>{ receitaFilter = b.dataset.k; renderComida(); };
  });
  main.querySelectorAll('[data-r]').forEach(card=>{
    card.onclick = ()=>openRecipeModal(RECIPES.find(r=>r.id===card.dataset.r));
  });
}


function openRecipeModal(r){
  openModal(`
    <h2>${r.name}</h2>
    <div class="hint" style="margin-bottom:12px;">${MEAL_TYPE_LABELS[r.type]} · ${fmtNum(r.kcal)} kcal (estimado) · ${r.prep} min</div>
    <div class="section-label" style="margin-top:0;">Ingredientes</div>
    <ul class="ingredient-list">${r.ingredients.map(i=>`<li>${escapeHtml(i)}</li>`).join("")}</ul>
    <div class="section-label">Modo de preparo</div>
    <ol class="detail-steps">${r.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <div class="modal-actions">
      <button class="btn secondary" id="mClose">Fechar</button>
      <button class="btn" id="mAdd">+ Adicionar em hoje</button>
    </div>
  `, ()=>{
    document.getElementById('mClose').onclick = closeModal;
    document.getElementById('mAdd').onclick = ()=>{
      const t = todayKey();
      if(!db.meals[t]) db.meals[t] = [];
      db.meals[t].push({id:uid(), name:r.name, kcal:r.kcal, type:r.type});
      saveDB(); closeModal();
      toast("Adicionado ao seu registro de hoje.");
      comidaSubtab = 'hoje'; renderComida();
    };
  });
}
function openMealModal(){
  let chosenType = 'almoco';
  let mealSearchQuery = '';

  function favoritesHtml(){
    if(db.favMeals.length===0) return '';
    return `<div class="field"><label>⭐ Favoritos — toque para adicionar</label>
      <div id="favMealsList">
        ${db.favMeals.map(f=>`<div class="fav-meal-row" data-fav="${f.id}">
          <span class="fav-meal-icon">${(MEAL_TYPES.find(t=>t.key===f.type)||{}).icon||'🍽️'}</span>
          <span class="fav-meal-name">${escapeHtml(f.name)}</span>
          <span class="fav-meal-kcal">${fmtNum(f.kcal)} kcal</span>
          <button class="fav-meal-del" data-favdel="${f.id}">🗑</button>
        </div>`).join('')}
      </div>
    </div>`;
  }

  function bodyHtml(){
    const results = searchFoods(mealSearchQuery);
    return `
    <h2>Adicionar refeição</h2>
    <div class="field">
      <label>Tipo</label>
      <div class="seg" id="mealSeg">
        ${MEAL_TYPES.map(t=>`<button data-t="${t.key}" class="${t.key===chosenType?'active':''}">${t.icon} ${t.label}</button>`).join("")}
      </div>
    </div>
    ${favoritesHtml()}
    <div class="field">
      <label>Buscar alimento</label>
      <input type="text" id="foodSearch" placeholder="Ex: arroz, banana, frango..." value="${escapeAttr(mealSearchQuery)}" autofocus>
    </div>
    <div id="foodResults">
      ${mealSearchQuery.trim()==='' ? `<div class="hint">Digite o nome de um alimento para eu calcular as calorias automaticamente.</div>` :
        results.length===0 ? `<div class="hint">Nenhum alimento encontrado.</div>` :
        results.map(f=>`<div class="recipe-card" data-food="${f.id}" style="padding:11px 14px; margin-bottom:8px;">
          <div class="rc-name" style="font-size:14px;">${f.name}</div>
        </div>`).join("")
      }
    </div>
    <button class="btn ghost" id="notFoundBtn" style="margin-top:6px;">Não encontrei — adicionar manualmente</button>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Fechar</button>
    </div>`;
  }

  function wireFavorites(){
    document.querySelectorAll('[data-fav]').forEach(row=>{
      row.onclick = (e)=>{
        if(e.target.closest('[data-favdel]')) return;
        const f = db.favMeals.find(x=>x.id===row.dataset.fav);
        if(!f) return;
        const t = todayKey();
        if(!db.meals[t]) db.meals[t] = [];
        db.meals[t].push({id:uid(), name:f.name, kcal:f.kcal, type:f.type});
        saveDB(); closeModal(); renderComida();
        toast("Refeição adicionada.");
        checkNewBadges();
      };
    });
    document.querySelectorAll('[data-favdel]').forEach(b=>{
      b.onclick = (e)=>{
        e.stopPropagation();
        db.favMeals = db.favMeals.filter(x=>x.id!==b.dataset.favdel);
        saveDB();
        openModal(bodyHtml(), bind);
      };
    });
  }

  function bind(){
    document.querySelectorAll('#mealSeg button').forEach(b=>{
      b.onclick = ()=>{ chosenType=b.dataset.t; document.querySelectorAll('#mealSeg button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); };
    });
    document.getElementById('mCancel').onclick = closeModal;
    wireFavorites();
    const searchInput = document.getElementById('foodSearch');
    searchInput.focus();
    searchInput.addEventListener('input', ()=>{
      mealSearchQuery = searchInput.value;
      document.getElementById('foodResults').innerHTML = (()=>{
        const results = searchFoods(mealSearchQuery);
        if(mealSearchQuery.trim()==='') return `<div class="hint">Digite o nome de um alimento para eu calcular as calorias automaticamente.</div>`;
        if(results.length===0) return `<div class="hint">Nenhum alimento encontrado.</div>`;
        return results.map(f=>`<div class="recipe-card" data-food="${f.id}" style="padding:11px 14px; margin-bottom:8px;">
          <div class="rc-name" style="font-size:14px;">${f.name}</div>
        </div>`).join("");
      })();
      document.querySelectorAll('[data-food]').forEach(card=>{
        card.onclick = ()=>openFoodQuantityModal(FOOD_DB.find(f=>f.id===card.dataset.food), chosenType);
      });
    });
    document.querySelectorAll('[data-food]').forEach(card=>{
      card.onclick = ()=>openFoodQuantityModal(FOOD_DB.find(f=>f.id===card.dataset.food), chosenType);
    });
    document.getElementById('notFoundBtn').onclick = ()=>openManualMealModal(chosenType);
  }

  openModal(bodyHtml(), bind);
}

function openFoodQuantityModal(food, mealType){
  const unitKeys = Object.keys(food.units);
  let chosenUnit = unitKeys[0];

  function calcText(){
    const qtyInput = document.getElementById('foodQty');
    const qty = qtyInput ? parseFloat(qtyInput.value.replace(',','.')) || 0 : 1;
    return calcFoodKcal(food, chosenUnit, qty);
  }

  openModal(`
    <h2>${food.name}</h2>
    <div class="field">
      <label>Unidade de medida</label>
      <div class="seg" id="unitSeg">
        ${unitKeys.map(u=>`<button data-u="${u}" class="${u===chosenUnit?'active':''}">${UNIT_LABELS[u]}</button>`).join("")}
      </div>
    </div>
    <div class="field"><label>Quantidade</label><input type="text" inputmode="decimal" id="foodQty" value="1"></div>
    <div class="card" style="text-align:center;">
      <div class="hint" style="margin:0;">Calorias calculadas</div>
      <div id="kcalPreview" style="font-size:26px; font-weight:800; color:var(--primary); margin-top:4px;">${calcFoodKcal(food, chosenUnit, 1)} kcal</div>
    </div>
    <label class="fav-checkbox"><input type="checkbox" id="saveFav"> ⭐ Salvar como favorito, pra adicionar rápido depois</label>
    <div class="modal-actions">
      <button class="btn secondary" id="mBack">Voltar</button>
      <button class="btn" id="mSave">Adicionar</button>
    </div>
  `, ()=>{
    function refreshPreview(){
      document.getElementById('kcalPreview').textContent = calcText() + ' kcal';
    }
    document.querySelectorAll('#unitSeg button').forEach(b=>{
      b.onclick = ()=>{
        chosenUnit = b.dataset.u;
        document.querySelectorAll('#unitSeg button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        refreshPreview();
      };
    });
    const qtyInput = document.getElementById('foodQty');
    qtyInput.addEventListener('input', refreshPreview);
    qtyInput.focus();
    qtyInput.select();
    document.getElementById('mBack').onclick = ()=>openMealModal();
    document.getElementById('mSave').onclick = ()=>{
      const qty = parseFloat(qtyInput.value.replace(',','.'));
      if(isNaN(qty) || qty<=0){ toast("Informe uma quantidade válida."); return; }
      const kcal = calcFoodKcal(food, chosenUnit, qty);
      const t = todayKey();
      if(!db.meals[t]) db.meals[t] = [];
      const qtyLabel = fmtNum(qty, qty%1===0?0:1);
      const name = `${qtyLabel} ${UNIT_LABELS[chosenUnit]} de ${food.name}`;
      db.meals[t].push({id:uid(), name, kcal, type:mealType});
      if(document.getElementById('saveFav').checked){
        db.favMeals.push({id:uid(), name, kcal, type:mealType});
      }
      saveDB(); closeModal(); renderComida();
      toast("Refeição adicionada.");
      checkNewBadges();
    };
  });
}

function openManualMealModal(mealType){
  openModal(`
    <h2>Adicionar manualmente</h2>
    <div class="hint" style="margin-bottom:12px;">Use esta opção se não souber as calorias exatas — pode deixar em branco (conta como 0 kcal) e ajustar depois.</div>
    <div class="field"><label>O que você comeu</label><input type="text" id="mealName" placeholder="Ex: Arroz, feijão e frango" autofocus></div>
    <div class="field"><label>Calorias (kcal) — opcional</label><input type="text" inputmode="numeric" id="mealKcal" placeholder="Ex: 450"></div>
    <label class="fav-checkbox"><input type="checkbox" id="saveFav"> ⭐ Salvar como favorito, pra adicionar rápido depois</label>
    <div class="modal-actions">
      <button class="btn secondary" id="mBack">Voltar</button>
      <button class="btn" id="mSave">Adicionar</button>
    </div>
  `, ()=>{
    document.getElementById('mealName').focus();
    document.getElementById('mBack').onclick = ()=>openMealModal();
    document.getElementById('mSave').onclick = ()=>{
      const name = document.getElementById('mealName').value.trim();
      const kcalRaw = document.getElementById('mealKcal').value;
      const kcal = kcalRaw ? parseInt(kcalRaw,10) : 0;
      if(!name){ toast("Descreva o que você comeu."); return; }
      if(isNaN(kcal) || kcal<0){ toast("Informe um valor de calorias válido."); return; }
      const t = todayKey();
      if(!db.meals[t]) db.meals[t] = [];
      db.meals[t].push({id:uid(), name, kcal, type:mealType});
      if(document.getElementById('saveFav').checked){
        db.favMeals.push({id:uid(), name, kcal, type:mealType});
      }
      saveDB(); closeModal(); renderComida();
      toast("Refeição adicionada.");
      checkNewBadges();
    };
  });
}

/* ============ EVOLUÇÃO (Calendário, Linha do tempo, Desafios, Ranking) ============ */
const CHALLENGES = [
  {id:'no_soda_7', title:'7 dias sem refrigerante', days:7, icon:'🥤', desc:'Evite refrigerantes por uma semana inteira.'},
  {id:'no_sugar_15', title:'15 dias sem açúcar', days:15, icon:'🍬', desc:'Corte o açúcar refinado por 15 dias.'},
  {id:'walk_30', title:'30 dias caminhando', days:30, icon:'🚶', desc:'Caminhe (ou treine) todos os dias durante 30 dias.'},
  {id:'water_7', title:'7 dias batendo a meta de água', days:7, icon:'💧', desc:'Beba sua meta de água todos os dias por uma semana.'},
  {id:'no_alcohol_15', title:'15 dias sem álcool', days:15, icon:'🍷', desc:'Fique sem bebida alcoólica por 15 dias.'},
  {id:'sleep_7', title:'7 noites bem dormidas', days:7, icon:'😴', desc:'Durma bem por 7 dias seguidos.'}
];
let evolucaoSubtab = 'calendario'; // calendario | linha | desafios | ranking
let calMonthOffset = 0;

function renderEvolucao(){
  const main = document.getElementById('main');
  const subtabsHtml = `<div class="subtabs" id="evoSubtabs">
    <button data-s="calendario" class="${evolucaoSubtab==='calendario'?'active':''}">Calendário</button>
    <button data-s="linha" class="${evolucaoSubtab==='linha'?'active':''}">Linha do tempo</button>
    <button data-s="desafios" class="${evolucaoSubtab==='desafios'?'active':''}">Desafios</button>
    <button data-s="ranking" class="${evolucaoSubtab==='ranking'?'active':''}">Ranking</button>
  </div>`;
  let bodyHtml;
  if(evolucaoSubtab==='calendario') bodyHtml = buildCalendarioHtml();
  else if(evolucaoSubtab==='linha') bodyHtml = buildLinhaTempoHtml();
  else if(evolucaoSubtab==='desafios') bodyHtml = buildDesafiosHtml();
  else bodyHtml = buildRankingHtml();

  main.innerHTML = subtabsHtml + bodyHtml;
  main.querySelectorAll('#evoSubtabs button').forEach(b=>{
    b.onclick = ()=>{ evolucaoSubtab = b.dataset.s; renderEvolucao(); };
  });
  if(evolucaoSubtab==='calendario') wireCalendarioBody();
  else if(evolucaoSubtab==='desafios') wireDesafiosBody();
}

/* ---- Calendário de evolução ---- */
function dayScore(k){
  if(!hasAnyActivity(k)) return null;
  const metrics = [];
  const waterGoal = db.profile.waterGoalMl || 2000;
  if(db.water[k]!=null) metrics.push(Math.min(100, Math.round((db.water[k]/waterGoal)*100)));
  if((db.habitLogs[k]||{}).__workout!==undefined) metrics.push((db.habitLogs[k]||{}).__workout?100:0);
  if(db.habits.length>0){
    const done = db.habits.filter(h=>(db.habitLogs[k]||{})[h.id]).length;
    metrics.push(Math.round((done/db.habits.length)*100));
  }
  if(db.meals[k] && db.meals[k].length>0 && db.profile.calorieGoal){
    const kcal = db.meals[k].reduce((s,m)=>s+(Number(m.kcal)||0),0);
    metrics.push(Math.min(100, Math.round((kcal/db.profile.calorieGoal)*100)));
  }
  if(db.sleep[k]){
    metrics.push(Math.min(100, Math.round((db.sleep[k].hours/7.5)*100)));
  }
  if(metrics.length===0) return 50; // teve atividade mas sem métricas comparáveis (ex: só pesou)
  return Math.round(avg(metrics));
}
function dayScoreColor(score){
  if(score===null) return 'var(--border)';
  if(score>=80) return 'var(--green)';
  if(score>=55) return '#F5C518';
  if(score>=25) return 'var(--orange)';
  return 'var(--red)';
}
function buildCalendarioHtml(){
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth()+calMonthOffset);
  const year = base.getFullYear(), month = base.getMonth();
  const monthLabel = base.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  let cells = '';
  for(let i=0;i<firstWeekday;i++) cells += `<div class="cal-cell empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const k = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const score = dayScore(k);
    const isToday = k===todayKey();
    const isFuture = k>todayKey();
    cells += `<div class="cal-cell ${isToday?'today':''}" style="${isFuture?'opacity:.25;':''}">
      <div class="cal-dot" style="background:${isFuture?'var(--border)':dayScoreColor(score)};"></div>
      <div class="cal-daynum">${d}</div>
    </div>`;
  }

  let html = `<div class="card">
    <div class="cal-header">
      <button class="cal-nav" id="calPrev">←</button>
      <div class="cal-month-label">${monthLabel}</div>
      <button class="cal-nav" id="calNext" ${calMonthOffset>=0?'disabled style="opacity:.3"':''}>→</button>
    </div>
    <div class="cal-weekdays">
      <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
    </div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-legend">
      <span><i style="background:var(--green);"></i> Excelente</span>
      <span><i style="background:#F5C518;"></i> Bom</span>
      <span><i style="background:var(--orange);"></i> Regular</span>
      <span><i style="background:var(--red);"></i> Ruim</span>
      <span><i style="background:var(--border);"></i> Sem dados</span>
    </div>
  </div>`;
  return html;
}
function wireCalendarioBody(){
  document.getElementById('calPrev').onclick = ()=>{ calMonthOffset--; renderEvolucao(); };
  const nextBtn = document.getElementById('calNext');
  if(nextBtn) nextBtn.onclick = ()=>{ if(calMonthOffset<0){ calMonthOffset++; renderEvolucao(); } };
}

/* ---- Linha do tempo ---- */
function buildTimelineEvents(){
  const events = [];
  db.weights.forEach(w=> events.push({date:w.date, icon:'⚖️', text:`Peso registrado: ${fmtNum(w.value,1)} kg`}));
  db.measurements.forEach(m=> events.push({date:m.date, icon:'📏', text:'Medidas corporais atualizadas'}));
  Object.keys(db.habitLogs).forEach(k=>{
    if((db.habitLogs[k]||{}).__workout) events.push({date:k, icon:'🏋️', text:'Treino concluído'});
  });
  Object.keys(db.water).forEach(k=>{
    const goal = db.profile.waterGoalMl||2000;
    if((db.water[k]||0)>=goal) events.push({date:k, icon:'💧', text:'Meta de água batida'});
  });
  const badges = computeBadges().filter(b=>b.earned);
  badges.forEach(b=> events.push({date: todayKey(), icon:b.icon, text:`Conquista: ${b.label}`, isBadge:true}));
  events.sort((a,b)=> a.date<b.date?1:(a.date>b.date?-1:0));
  return events.slice(0,60);
}
function buildLinhaTempoHtml(){
  const events = buildTimelineEvents();
  let html = `<div class="hint" style="margin-bottom:12px;">Tudo o que você registrou, em ordem — sua rotina virando resultado.</div>`;
  if(events.length===0){
    html += `<div class="empty-state"><div class="e-emoji">🕒</div><div class="e-text">Ainda não há eventos registrados.<br>Comece pesando-se ou registrando água, refeições ou treino.</div></div>`;
    return html;
  }
  let lastDate = null;
  events.forEach(ev=>{
    if(ev.date!==lastDate){
      html += `<div class="section-label">${formatLabelRelative(ev.date)}</div>`;
      lastDate = ev.date;
    }
    html += `<div class="timeline-item"><span class="ti-icon">${ev.icon}</span><span class="ti-text">${ev.text}</span></div>`;
  });
  return html;
}

/* ---- Desafios ---- */
function activeChallengeFor(defId){
  return db.challenges.find(c=>c.defId===defId && c.status==='active');
}
function buildDesafiosHtml(){
  let html = `<div class="hint" style="margin-bottom:12px;">Desafios curtos ajudam a criar novos hábitos sem parecer punição.</div>`;
  html += CHALLENGES.map(c=>{
    const active = activeChallengeFor(c.id);
    const progress = active ? Object.keys(active.checks||{}).length : 0;
    const pct = active ? Math.min(100, Math.round((progress/c.days)*100)) : 0;
    const doneToday = active && active.checks && active.checks[todayKey()];
    return `<div class="card challenge-card">
      <div style="display:flex; gap:10px; align-items:flex-start;">
        <div style="font-size:26px;">${c.icon}</div>
        <div style="flex:1;">
          <div style="font-weight:800; color:var(--text); font-size:14.5px;">${c.title}</div>
          <div class="hint" style="margin-top:2px;">${c.desc}</div>
          ${active ? `
            <div class="sc-track" style="margin-top:10px;"><div class="sc-fill" style="width:${pct}%; background:var(--primary);"></div></div>
            <div class="hint" style="margin-top:4px;">${progress} de ${c.days} dias</div>
          ` : ''}
        </div>
      </div>
      <div class="modal-actions" style="margin-top:12px; margin-bottom:0;">
        ${active ?
          `<button class="btn secondary" data-abandon="${active.id}">Abandonar</button>
           <button class="btn" data-check="${active.id}" ${doneToday?'disabled style="opacity:.5"':''}>${doneToday?'Feito hoje ✓':'Marcar hoje'}</button>`
          : `<button class="btn" data-start="${c.id}" style="width:100%;">Começar desafio</button>`
        }
      </div>
    </div>`;
  }).join("");
  return html;
}
function wireDesafiosBody(){
  const main = document.getElementById('main');
  main.querySelectorAll('[data-start]').forEach(b=>{
    b.onclick = ()=>{
      const defId = b.dataset.start;
      db.challenges.push({id:uid(), defId, startDate:todayKey(), status:'active', checks:{}});
      saveDB(); renderEvolucao();
      toast("Desafio iniciado! 🚀");
    };
  });
  main.querySelectorAll('[data-check]').forEach(b=>{
    b.onclick = ()=>{
      const entry = db.challenges.find(c=>c.id===b.dataset.check);
      if(!entry) return;
      if(!entry.checks) entry.checks = {};
      entry.checks[todayKey()] = true;
      const def = CHALLENGES.find(c=>c.id===entry.defId);
      if(def && Object.keys(entry.checks).length>=def.days){
        entry.status = 'completed';
        saveDB(); renderEvolucao();
        toast(`🎉 Desafio concluído: ${def.title}!`);
        checkNewBadges();
      } else {
        saveDB(); renderEvolucao();
        toast("Marcado! Continue assim.");
      }
    };
  });
  main.querySelectorAll('[data-abandon]').forEach(b=>{
    b.onclick = ()=>{
      confirmModal("Abandonar desafio", "Tem certeza que quer abandonar esse desafio? Você pode começar de novo quando quiser.", "Abandonar", ()=>{
        const entry = db.challenges.find(c=>c.id===b.dataset.abandon);
        if(entry) entry.status = 'abandoned';
        saveDB(); renderEvolucao();
      });
    };
  });
}

/* ---- Ranking pessoal ---- */
function allKnownDates(){
  const s = new Set();
  db.weights.forEach(w=>s.add(w.date));
  Object.keys(db.water).forEach(k=>s.add(k));
  Object.keys(db.meals).forEach(k=>s.add(k));
  Object.keys(db.habitLogs).forEach(k=>s.add(k));
  db.measurements.forEach(m=>s.add(m.date));
  return s;
}
function maxConsecutive(predicate){
  const dates = Array.from(allKnownDates()).sort();
  if(dates.length===0) return 0;
  let max=0, cur=0;
  let cursor = dates[0];
  const last = todayKey();
  let guard = 0;
  while(cursor<=last && guard<3660){
    if(predicate(cursor)){ cur++; max=Math.max(max,cur); } else { cur=0; }
    cursor = addDaysKey(cursor,1);
    guard++;
  }
  return max;
}
function maxWeightLossWithinDays(maxDays){
  const w = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);
  let best = 0;
  for(let i=0;i<w.length;i++){
    for(let j=i+1;j<w.length;j++){
      const diffDays = Math.round((keyToDate(w[j].date)-keyToDate(w[i].date))/86400000);
      if(diffDays<=maxDays){
        const loss = w[i].value - w[j].value;
        if(loss>best) best = loss;
      }
    }
  }
  return best;
}
function buildRankingHtml(){
  const waterGoal = db.profile.waterGoalMl || 2000;
  const maiorSequenciaAtividade = maxConsecutive(k=>hasAnyActivity(k));
  const maiorSequenciaTreino = maxConsecutive(k=>(db.habitLogs[k]||{}).__workout);
  const maiorAguaDia = Object.values(db.water).length ? Math.max(...Object.values(db.water)) : 0;
  const maiorPerda30 = maxWeightLossWithinDays(30);

  const records = [
    {icon:'🔥', label:'Maior sequência de uso', value: maiorSequenciaAtividade>0 ? `${maiorSequenciaAtividade} dias` : '—'},
    {icon:'🏋️', label:'Maior sequência de treino', value: maiorSequenciaTreino>0 ? `${maiorSequenciaTreino} dias` : '—'},
    {icon:'💧', label:'Maior consumo de água em um dia', value: maiorAguaDia>0 ? `${fmtNum(maiorAguaDia)} ml` : '—'},
    {icon:'⚖️', label:'Maior perda de peso em 30 dias', value: maiorPerda30>0 ? `${fmtNum(maiorPerda30,1)} kg` : '—'}
  ];

  let html = `<div class="hint" style="margin-bottom:12px;">Aqui você compete só com você mesmo(a) — seus melhores números até agora.</div>`;
  html += records.map(r=>`
    <div class="card" style="display:flex; align-items:center; gap:12px;">
      <div style="font-size:26px;">${r.icon}</div>
      <div style="flex:1;">
        <div class="hint" style="margin:0; font-weight:700; color:var(--text); font-size:13px;">${r.label}</div>
      </div>
      <div style="font-size:16px; font-weight:800; color:var(--primary);">${r.value}</div>
    </div>
  `).join("");
  return html;
}

/* ============ Controle de compulsão ============ */
const CRAVING_STRATEGIES = {
  fome: {
    label: 'Fome',
    msg: 'Se já faz um tempo desde sua última refeição, pode ser fome de verdade.',
    tips: ['Beba um copo de água e espere 10 minutos.', 'Se a fome continuar, faça uma refeição equilibrada — não precisa ser pouco, precisa ser adequado.', 'Evite pular refeições ao longo do dia, isso costuma gerar picos de fome depois.']
  },
  ansiedade: {
    label: 'Ansiedade',
    msg: 'Comer por ansiedade é muito comum — o importante é reconhecer o gatilho.',
    tips: ['Respire fundo por 1 minuto antes de decidir o que fazer.', 'Beba água ou um chá quente devagar.', 'Dê uma volta curta ou mude de ambiente por alguns minutos.']
  },
  estresse: {
    label: 'Estresse',
    msg: 'Momentos de estresse costumam disparar vontade de comer algo rápido.',
    tips: ['Tente uma pausa de 5 minutos longe da situação estressante.', 'Alongue o pescoço e os ombros — libera um pouco da tensão.', 'Anote o que está te estressando antes de decidir comer.']
  },
  tedio: {
    label: 'Tédio',
    msg: 'Às vezes comemos só porque não há nada mais interessante acontecendo.',
    tips: ['Escolha uma atividade rápida: mensagem para um amigo, música, um alongamento.', 'Pergunte-se: "eu comeria uma maçã agora?" Se a resposta for não, talvez não seja fome.', 'Beba água e ocupe as mãos com outra coisa por alguns minutos.']
  },
  tristeza: {
    label: 'Tristeza',
    msg: 'Comer para se confortar é humano — mas vale buscar outros tipos de conforto também.',
    tips: ['Ligue ou mande mensagem para alguém de confiança.', 'Permita-se sentir a tristeza por alguns minutos, sem julgamento.', 'Se puder, escreva o que está sentindo antes de decidir comer.']
  }
};
function openCravingModal(){
  openModal(`
    <h2>Estou com vontade de comer</h2>
    <p style="color:var(--muted); font-size:13.5px; margin-top:-6px; line-height:1.5;">Antes de decidir, vamos entender o que você está sentindo agora.</p>
    <div class="field"><label>O que você está sentindo?</label>
      <div class="seg" id="cravingReason" style="flex-direction:column;">
        ${Object.keys(CRAVING_STRATEGIES).map(k=>`<button type="button" data-v="${k}" style="width:100%; text-align:left;">${CRAVING_STRATEGIES[k].label}</button>`).join('')}
      </div>
    </div>
  `, ()=>{
    document.getElementById('cravingReason').querySelectorAll('button').forEach(b=>{
      b.onclick = ()=>{ showCravingStrategy(b.dataset.v); };
    });
  });
}
function showCravingStrategy(reason){
  const s = CRAVING_STRATEGIES[reason];
  openModal(`
    <h2>${s.label}</h2>
    <p style="color:var(--text); font-size:13.5px; line-height:1.5;">${s.msg}</p>
    <div class="hint" style="font-weight:700; color:var(--text); text-transform:uppercase; font-size:11px; margin-bottom:8px;">Algumas estratégias</div>
    ${s.tips.map(t=>`<div class="coach-msg"><span class="cm-dot"></span><span>${t}</span></div>`).join('')}
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn secondary" id="cravingAte">Vou comer mesmo assim</button>
      <button class="btn" id="cravingTried">Vou tentar uma estratégia</button>
    </div>
  `, ()=>{
    document.getElementById('cravingAte').onclick = ()=>{
      db.cravings.push({id:uid(), date:todayKey(), reason, coped:false});
      saveDB(); closeModal();
      toast("Tudo bem — sem culpa. O importante é continuar se observando.");
    };
    document.getElementById('cravingTried').onclick = ()=>{
      db.cravings.push({id:uid(), date:todayKey(), reason, coped:true});
      saveDB(); closeModal();
      toast("Muito bem! Pequenas escolhas assim fazem diferença. 🌱");
    };
  });
}

/* ============ SAÚDE (Agenda + Medicamentos) ============ */
const APPT_TYPES = {
  consulta: {label:'Consulta', icon:'🩺'},
  nutricionista: {label:'Nutricionista', icon:'🥗'},
  academia: {label:'Academia', icon:'🏋️'},
  exame: {label:'Exame', icon:'🧪'},
  retorno: {label:'Retorno', icon:'📅'}
};
let saudeSubtab = 'agenda'; // agenda | medicamentos
function renderSaude(){
  const main = document.getElementById('main');
  const subtabsHtml = `<div class="subtabs" id="saudeSubtabs">
    <button data-s="agenda" class="${saudeSubtab==='agenda'?'active':''}">Agenda</button>
    <button data-s="medicamentos" class="${saudeSubtab==='medicamentos'?'active':''}">Medicamentos</button>
  </div>`;
  const bodyHtml = saudeSubtab==='agenda' ? buildAgendaHtml() : buildMedicamentosHtml();
  main.innerHTML = subtabsHtml + bodyHtml;
  main.querySelectorAll('#saudeSubtabs button').forEach(b=>{
    b.onclick = ()=>{ saudeSubtab = b.dataset.s; renderSaude(); };
  });
  if(saudeSubtab==='agenda') wireAgendaBody(); else wireMedicamentosBody();
}

/* ---- Agenda ---- */
function buildAgendaHtml(){
  const sorted = db.appointments.slice().sort((a,b)=> a.date<b.date?-1:1);
  const upcoming = sorted.filter(a=>!a.done && a.date>=todayKey());
  const past = sorted.filter(a=>a.done || a.date<todayKey());

  let html = `<button class="btn" id="addApptBtn" style="margin-bottom:14px;">+ Marcar compromisso</button>`;
  html += `<div class="section-label">Próximos</div>`;
  if(upcoming.length===0){
    html += `<div class="empty-state"><div class="e-emoji">📅</div><div class="e-text">Nenhum compromisso marcado.</div></div>`;
  } else {
    html += upcoming.map(a=>{
      const t = APPT_TYPES[a.type] || {label:a.type, icon:'📅'};
      return `<div class="card" style="display:flex; align-items:center; gap:12px;">
        <div style="font-size:22px;">${t.icon}</div>
        <div style="flex:1;">
          <div style="font-weight:800; color:var(--text); font-size:14px;">${escapeHtml(a.title||t.label)}</div>
          <div class="hint" style="margin-top:1px;">${t.label} · ${formatLabelRelative(a.date)}${a.time?' às '+a.time:''}</div>
          ${a.notes?`<div class="hint" style="margin-top:3px;">${escapeHtml(a.notes)}</div>`:''}
        </div>
        <button class="er-del" data-done="${a.id}" title="Marcar concluído">✓</button>
        <button class="er-del" data-del="${a.id}">🗑</button>
      </div>`;
    }).join("");
  }
  if(past.length>0){
    html += `<div class="section-label">Anteriores</div>`;
    html += past.slice(0,10).map(a=>{
      const t = APPT_TYPES[a.type] || {label:a.type, icon:'📅'};
      return `<div class="entry-row" data-id="${a.id}">
        <div class="er-date">${formatLabelRelative(a.date)}</div>
        <div class="er-val" style="font-size:12.5px;">${t.icon} ${escapeHtml(a.title||t.label)}</div>
        <button class="er-del" data-del="${a.id}">🗑</button>
      </div>`;
    }).join("");
  }
  return html;
}
function wireAgendaBody(){
  const main = document.getElementById('main');
  document.getElementById('addApptBtn').onclick = openApptModal;
  main.querySelectorAll('[data-done]').forEach(b=>{
    b.onclick = ()=>{
      const a = db.appointments.find(x=>x.id===b.dataset.done);
      if(a) a.done = true;
      saveDB(); renderSaude();
    };
  });
  main.querySelectorAll('[data-del]').forEach(b=>{
    b.onclick = ()=>{
      confirmModal("Excluir compromisso", "Remover este compromisso da agenda?", "Excluir", ()=>{
        db.appointments = db.appointments.filter(x=>x.id!==b.dataset.del);
        saveDB(); renderSaude();
      });
    };
  });
}
function openApptModal(){
  openModal(`
    <h2>Marcar compromisso</h2>
    ${segField('Tipo', 'aType', Object.fromEntries(Object.keys(APPT_TYPES).map(k=>[k,{label:APPT_TYPES[k].icon+' '+APPT_TYPES[k].label}])), 'consulta')}
    <div class="field"><label>Título (opcional)</label><input type="text" id="aTitle" placeholder="Ex: Dr. Carlos - cardiologista"></div>
    <div class="dt-row">
      <div class="field"><label>Data</label><input type="date" id="aDate" value="${todayKey()}"></div>
      <div class="field"><label>Horário (opcional)</label><input type="time" id="aTime"></div>
    </div>
    <div class="field"><label>Notas (opcional)</label><input type="text" id="aNotes" placeholder="Ex: Levar exames anteriores"></div>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Cancelar</button>
      <button class="btn" id="mSave">Salvar</button>
    </div>
  `, ()=>{
    segWire('aType');
    document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('mSave').onclick = ()=>{
      const type = segGetValue('aType') || 'consulta';
      const title = document.getElementById('aTitle').value.trim();
      const date = document.getElementById('aDate').value || todayKey();
      const time = document.getElementById('aTime').value;
      const notes = document.getElementById('aNotes').value.trim();
      db.appointments.push({id:uid(), type, title, date, time, notes, done:false});
      saveDB(); closeModal(); renderSaude();
      toast("Compromisso marcado.");
    };
  });
}

/* ---- Medicamentos ---- */
function buildMedicamentosHtml(){
  const t = todayKey();
  let html = `<button class="btn" id="addMedBtn" style="margin-bottom:14px;">+ Novo medicamento</button>`;
  const active = db.medications.filter(m=>m.active!==false);
  if(active.length===0){
    html += `<div class="empty-state"><div class="e-emoji">💊</div><div class="e-text">Nenhum medicamento cadastrado.</div></div>`;
  } else {
    html += active.map(m=>{
      const takenToday = (db.medLogs[t]||{})[m.id];
      return `<div class="today-workout-row" style="margin-bottom:10px;">
        <div class="check ${takenToday?'checked':''}" data-medcheck="${m.id}">${takenToday?'✓':''}</div>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:14.5px; color:var(--text);">${escapeHtml(m.name)}</div>
          <div class="hint" style="margin-top:1px;">${escapeHtml(m.dose||'')}${m.time?' · '+m.time:''}</div>
        </div>
        <button class="er-del" data-meddel="${m.id}">🗑</button>
      </div>`;
    }).join("");
  }
  return html;
}
function wireMedicamentosBody(){
  const main = document.getElementById('main');
  const t = todayKey();
  document.getElementById('addMedBtn').onclick = openMedModal;
  main.querySelectorAll('[data-medcheck]').forEach(b=>{
    b.onclick = ()=>{
      const id = b.dataset.medcheck;
      if(!db.medLogs[t]) db.medLogs[t] = {};
      db.medLogs[t][id] = !db.medLogs[t][id];
      saveDB(); renderSaude();
    };
  });
  main.querySelectorAll('[data-meddel]').forEach(b=>{
    b.onclick = ()=>{
      confirmModal("Excluir medicamento", "Remover este medicamento da lista?", "Excluir", ()=>{
        db.medications = db.medications.filter(x=>x.id!==b.dataset.meddel);
        saveDB(); renderSaude();
      });
    };
  });
}
function openMedModal(){
  openModal(`
    <h2>Novo medicamento</h2>
    <div class="field"><label>Nome</label><input type="text" id="medName" placeholder="Ex: Metformina" autofocus></div>
    <div class="field"><label>Dose (opcional)</label><input type="text" id="medDose" placeholder="Ex: 500mg"></div>
    <div class="field"><label>Horário (opcional)</label><input type="time" id="medTime"></div>
    <div class="modal-actions">
      <button class="btn secondary" id="mCancel">Cancelar</button>
      <button class="btn" id="mSave">Salvar</button>
    </div>
  `, ()=>{
    document.getElementById('mCancel').onclick = closeModal;
    document.getElementById('mSave').onclick = ()=>{
      const name = document.getElementById('medName').value.trim();
      if(!name){ toast("Informe o nome do medicamento."); return; }
      const dose = document.getElementById('medDose').value.trim();
      const time = document.getElementById('medTime').value;
      db.medications.push({id:uid(), name, dose, time, active:true});
      saveDB(); closeModal(); renderSaude();
      toast("Medicamento adicionado.");
    };
  });
}

/* ============ RELATÓRIO MENSAL ============ */
let reportMonthOffset = 0;
function monthPrefixFromOffset(offset){
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth()+offset);
  return {year:base.getFullYear(), month:base.getMonth(), prefix: base.getFullYear()+'-'+pad2(base.getMonth()+1), label: base.toLocaleDateString('pt-BR',{month:'long', year:'numeric'})};
}
function buildMonthlyReportData(offset){
  const cur = monthPrefixFromOffset(offset);
  const prev = monthPrefixFromOffset(offset-1);

  const wCur = db.weights.filter(w=>w.date.startsWith(cur.prefix)).sort((a,b)=>a.date<b.date?-1:1);
  const wPrev = db.weights.filter(w=>w.date.startsWith(prev.prefix)).sort((a,b)=>a.date<b.date?-1:1);
  const weightChange = wCur.length>=2 ? wCur[wCur.length-1].value - wCur[0].value : null;
  const weightChangePrev = wPrev.length>=2 ? wPrev[wPrev.length-1].value - wPrev[0].value : null;

  const mCur = db.measurements.filter(m=>m.date.startsWith(cur.prefix)).sort((a,b)=>a.date<b.date?-1:1);
  const measureFirst = mCur[0] || null, measureLast = mCur[mCur.length-1] || null;

  const waterKeysCur = Object.keys(db.water).filter(k=>k.startsWith(cur.prefix));
  const waterKeysPrev = Object.keys(db.water).filter(k=>k.startsWith(prev.prefix));
  const waterAvgCur = avg(waterKeysCur.map(k=>db.water[k]||0));
  const waterAvgPrev = avg(waterKeysPrev.map(k=>db.water[k]||0));

  const mealKeysCur = Object.keys(db.meals).filter(k=>k.startsWith(cur.prefix) && db.meals[k].length>0);
  const kcalAvgCur = avg(mealKeysCur.map(k=>db.meals[k].reduce((s,m)=>s+(Number(m.kcal)||0),0)));

  const habitLogKeysCur = Object.keys(db.habitLogs).filter(k=>k.startsWith(cur.prefix));
  const workoutDaysCur = habitLogKeysCur.filter(k=>db.habitLogs[k].__workout).length;
  let habitPctAvg = null;
  if(db.habits.length>0 && habitLogKeysCur.length>0){
    const pcts = habitLogKeysCur.map(k=>{
      const done = db.habits.filter(h=>(db.habitLogs[k]||{})[h.id]).length;
      return (done/db.habits.length)*100;
    });
    habitPctAvg = avg(pcts);
  }

  const badgesThisMonth = computeBadges().filter(b=> b.earned && db.badgeDates && (db.badgeDates[b.id]||'').startsWith(cur.prefix));

  return {
    cur, prev, wCur, weightChange, weightChangePrev,
    measureFirst, measureLast,
    waterAvgCur, waterAvgPrev,
    kcalAvgCur, workoutDaysCur, habitPctAvg,
    badgesThisMonth
  };
}
function diffArrow(curVal, prevVal, lowerIsBetter){
  if(curVal==null || prevVal==null) return '';
  const d = curVal - prevVal;
  if(Math.abs(d)<0.01) return ' <span class="rp-arrow same">→</span>';
  const better = lowerIsBetter ? d<0 : d>0;
  return ` <span class="rp-arrow ${better?'good':'bad'}">${d>0?'↑':'↓'}</span>`;
}
function buildRelatorioHtml(){
  const data = buildMonthlyReportData(reportMonthOffset);
  const p = db.profile;
  let html = `<div class="card" style="text-align:center;">
    <div style="font-weight:800; font-size:17px; color:var(--text); text-transform:capitalize;">Relatório de ${data.cur.label}</div>
    <div class="hint" style="margin-top:2px;">${p.name?escapeHtml(p.name)+' · ':''}Leve — Coach de saúde</div>
  </div>`;

  html += `<div class="section-label">⚖️ Peso</div>`;
  html += `<div class="card">
    ${data.wCur.length>0 ? `
      <div class="rp-row"><span>Peso inicial do mês</span><b>${fmtNum(data.wCur[0].value,1)} kg</b></div>
      <div class="rp-row"><span>Peso final do mês</span><b>${fmtNum(data.wCur[data.wCur.length-1].value,1)} kg</b></div>
      <div class="rp-row"><span>Variação no mês</span><b>${data.weightChange!=null?(data.weightChange>0?'+':'')+fmtNum(data.weightChange,1)+' kg':'—'}${diffArrow(data.weightChange, data.weightChangePrev, true)}</b></div>
    ` : `<div class="hint">Nenhum registro de peso neste mês.</div>`}
  </div>`;

  if(data.measureFirst || data.measureLast){
    html += `<div class="section-label">📏 Medidas corporais</div><div class="card">`;
    MEASURE_FIELDS.forEach(f=>{
      const first = data.measureFirst ? data.measureFirst[f.key] : null;
      const last = data.measureLast ? data.measureLast[f.key] : null;
      if(first==null && last==null) return;
      html += `<div class="rp-row"><span>${f.label}</span><b>${last!=null?fmtNum(last,1)+' cm':'—'}${first!=null&&last!=null?diffArrow(last, first, true):''}</b></div>`;
    });
    html += `</div>`;
  }

  html += `<div class="section-label">💧 Água & 🍽️ Alimentação</div>`;
  html += `<div class="card">
    <div class="rp-row"><span>Média diária de água</span><b>${data.waterAvgCur>0?fmtNum(Math.round(data.waterAvgCur))+' ml':'—'}${data.waterAvgCur>0&&data.waterAvgPrev>0?diffArrow(data.waterAvgCur,data.waterAvgPrev,false):''}</b></div>
    <div class="rp-row"><span>Média diária de calorias</span><b>${data.kcalAvgCur>0?fmtNum(Math.round(data.kcalAvgCur))+' kcal':'—'}</b></div>
  </div>`;

  html += `<div class="section-label">🏋️ Treino & ✅ Hábitos</div>`;
  html += `<div class="card">
    <div class="rp-row"><span>Dias treinados no mês</span><b>${data.workoutDaysCur}</b></div>
    <div class="rp-row"><span>Cumprimento médio de hábitos</span><b>${data.habitPctAvg!=null?fmtNum(Math.round(data.habitPctAvg))+'%':'—'}</b></div>
  </div>`;

  html += `<div class="section-label">🏆 Conquistas do mês</div>`;
  html += `<div class="card">
    ${data.badgesThisMonth.length>0 ? data.badgesThisMonth.map(b=>`<div class="rp-row"><span>${b.icon} ${b.label}</span></div>`).join('') : `<div class="hint">Nenhuma conquista nova neste mês.</div>`}
  </div>`;

  const tips = generateCoachTips();
  html += `<div class="section-label">🤖 Resumo do Coach</div>`;
  html += `<div class="coach-card">${tips.map(t=>`<div class="coach-msg"><span class="cm-dot"></span><span>${t}</span></div>`).join('')}</div>`;

  return html;
}
function renderRelatorio(){
  const main = document.getElementById('main');
  let html = `<div class="cal-header no-print">
    <button class="cal-nav" id="repPrev">←</button>
    <div class="cal-month-label">Navegar mês</div>
    <button class="cal-nav" id="repNext" ${reportMonthOffset>=0?'disabled style="opacity:.3"':''}>→</button>
  </div>`;
  html += `<button class="btn no-print" id="printReportBtn" style="margin-bottom:14px;">🖨️ Salvar / Imprimir PDF</button>`;
  html += buildRelatorioHtml();
  main.innerHTML = html;
  document.getElementById('repPrev').onclick = ()=>{ reportMonthOffset--; renderRelatorio(); };
  const nextBtn = document.getElementById('repNext');
  if(nextBtn) nextBtn.onclick = ()=>{ if(reportMonthOffset<0){ reportMonthOffset++; renderRelatorio(); } };
  document.getElementById('printReportBtn').onclick = ()=>{ window.print(); };
}

/* ============ JEJUM INTERMITENTE ============ */
const FASTING_PROTOCOLS = [
  {id:'12:12', fast:12, eat:12, label:'12:12', tag:'Iniciante', desc:'12h de jejum e 12h de janela alimentar — o ponto de partida ideal para quem nunca fez jejum.'},
  {id:'14:10', fast:14, eat:10, label:'14:10', tag:'Iniciante+', desc:'Um passo além do 12:12, ainda bem tranquilo para o dia a dia.'},
  {id:'16:8', fast:16, eat:8, label:'16:8', tag:'Mais usado', desc:'O protocolo mais popular — 16h de jejum, 8h para comer. Costuma-se pular o café da manhã.'},
  {id:'18:6', fast:18, eat:6, label:'18:6', tag:'Intermediário', desc:'Janela alimentar mais curta — recomendado para quem já tem experiência com o 16:8.'},
  {id:'20:4', fast:20, eat:4, label:'20:4', tag:'Avançado', desc:'Conhecido como "Dieta do Guerreiro". Só recomendado para praticantes experientes.'},
  {id:'omad', fast:23, eat:1, label:'OMAD', tag:'Avançado', desc:'Uma única refeição por dia. Nível avançado — não recomendado sem acompanhamento.'}
];
function fastingProtocol(id){ return FASTING_PROTOCOLS.find(p=>p.id===id) || FASTING_PROTOCOLS[2]; }
let jejumSubtab = 'guia'; // guia | cronometro | receitas | progresso
let fastingTimerInterval = null;
function stopFastingTimerLoop(){ if(fastingTimerInterval){ clearInterval(fastingTimerInterval); fastingTimerInterval=null; } }

function renderJejum(){
  const main = document.getElementById('main');
  const subtabsHtml = `<div class="subtabs" id="jejumSubtabs">
    <button data-s="guia" class="${jejumSubtab==='guia'?'active':''}">Guia</button>
    <button data-s="cronometro" class="${jejumSubtab==='cronometro'?'active':''}">Cronômetro</button>
    <button data-s="receitas" class="${jejumSubtab==='receitas'?'active':''}">Receitas</button>
    <button data-s="progresso" class="${jejumSubtab==='progresso'?'active':''}">Progresso</button>
  </div>`;
  let bodyHtml;
  if(jejumSubtab==='guia') bodyHtml = buildJejumGuiaHtml();
  else if(jejumSubtab==='cronometro') bodyHtml = buildJejumCronometroHtml();
  else if(jejumSubtab==='receitas') bodyHtml = buildJejumReceitasHtml();
  else bodyHtml = buildJejumProgressoHtml();

  main.innerHTML = subtabsHtml + bodyHtml;
  main.querySelectorAll('#jejumSubtabs button').forEach(b=>{
    b.onclick = ()=>{ jejumSubtab = b.dataset.s; renderJejum(); };
  });
  if(jejumSubtab==='guia') wireJejumGuiaBody();
  else if(jejumSubtab==='cronometro') wireJejumCronometroBody();
  else if(jejumSubtab==='receitas') wireJejumReceitasBody();
  else wireJejumProgressoBody();
}

/* ---- Guia ---- */
function buildJejumGuiaHtml(){
  const current = fastingProtocol(db.fasting.protocol);
  let html = `<div class="card">
    <div style="font-weight:800; color:var(--text); font-size:15px; margin-bottom:6px;">O que é o jejum intermitente?</div>
    <div class="hint" style="line-height:1.6;">É um padrão alimentar que alterna períodos sem comer (jejum) com períodos em que você se alimenta normalmente (janela alimentar). Não é sobre o que comer, e sim sobre quando comer. Pode ajudar no controle de peso e na sensibilidade à insulina, mas os resultados variam de pessoa para pessoa.</div>
  </div>`;

  html += `<div class="card" style="border-color:var(--red);">
    <div style="font-weight:800; color:var(--red); font-size:13.5px; margin-bottom:6px;">⚠️ Antes de começar</div>
    <div class="hint" style="line-height:1.6; color:var(--text);">Se você tem diabetes, hipoglicemia, está grávida ou amamentando, tem (ou teve) transtornos alimentares, toma medicamentos contínuos, ou é menor de idade, converse com seu médico antes de iniciar o jejum intermitente. O Leve não substitui acompanhamento médico ou nutricional.</div>
  </div>`;

  html += `<div class="card">
    <div style="font-weight:800; color:var(--text); font-size:14px; margin-bottom:8px;">Como fazer, passo a passo</div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Comece pelo protocolo mais leve (12:12) e só avance quando se sentir confortável — não pule etapas.</span></div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Beba bastante água, chá ou café puro (sem açúcar) durante o jejum — isso ajuda a controlar a fome.</span></div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Quebre o jejum com uma refeição leve e de fácil digestão, evitando exagerar por estar "compensando" o tempo sem comer.</span></div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Durma bem — o sono ruim aumenta a fome e dificulta manter o jejum.</span></div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Se sentir tontura, mal-estar forte ou tremores, interrompa o jejum imediatamente e coma algo.</span></div>
  </div>`;

  html += `<div class="section-label">Trilha de progressão</div>`;
  html += `<div class="card"><div class="fast-track">
    ${FASTING_PROTOCOLS.map((p,i)=>`
      <div class="ft-step ${p.id===db.fasting.protocol?'current':''}">
        <div class="ft-dot">${i+1}</div>
        <div class="ft-label">${p.label}</div>
      </div>
      ${i<FASTING_PROTOCOLS.length-1?'<div class="ft-line"></div>':''}
    `).join('')}
  </div></div>`;

  html += `<div class="section-label">Escolha seu protocolo</div>`;
  html += FASTING_PROTOCOLS.map(p=>`
    <div class="card protocol-card ${p.id===db.fasting.protocol?'selected':''}" data-proto="${p.id}">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="font-weight:800; color:var(--text); font-size:14.5px;">${p.label} <span class="proto-tag">${p.tag}</span></div>
        ${p.id===db.fasting.protocol?'<span style="color:var(--primary); font-weight:800;">✓ Atual</span>':''}
      </div>
      <div class="hint" style="margin-top:4px;">${p.desc}</div>
    </div>
  `).join('');

  return html;
}
function wireJejumGuiaBody(){
  document.querySelectorAll('[data-proto]').forEach(card=>{
    card.onclick = ()=>{
      db.fasting.protocol = card.dataset.proto;
      saveDB(); renderJejum();
      toast(`Protocolo alterado para ${fastingProtocol(card.dataset.proto).label}.`);
    };
  });
}

/* ---- Cronômetro ---- */
function activeFast(){ return db.fasting.active; }
function fastElapsedMs(){
  const a = activeFast();
  if(!a) return 0;
  return Date.now() - a.startAt;
}
function fmtDuration(ms){
  const totalSec = Math.max(0, Math.floor(ms/1000));
  const h = Math.floor(totalSec/3600);
  const m = Math.floor((totalSec%3600)/60);
  const s = totalSec%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function buildJejumCronometroHtml(){
  const a = activeFast();
  const proto = fastingProtocol(db.fasting.protocol);
  let html = '';

  if(!a){
    // Guidance for next fast timing (if just ended one)
    const lastEnded = db.fasting.history.slice().sort((x,y)=> x.endedAt<y.endedAt?1:-1)[0];
    let waitHtml = '';
    if(lastEnded){
      const eatMs = (fastingProtocol(lastEnded.protocol||proto.id).eat||8)*3600*1000;
      const readyAt = lastEnded.endedAt + eatMs;
      const now = Date.now();
      if(now < readyAt){
        waitHtml = `<div class="card" style="border-color:var(--orange);">
          <div style="font-weight:800; color:var(--text); font-size:13.5px;">⏱️ Aguarde antes do próximo jejum</div>
          <div class="hint" style="margin-top:4px;">Recomendado esperar até <b>${new Date(readyAt).toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</b> (fim da janela alimentar) antes de começar o próximo jejum.</div>
        </div>`;
      }
    }
    html += waitHtml;
    html += `<div class="card" style="text-align:center;">
      <div style="font-size:40px;">⏳</div>
      <div style="font-weight:800; color:var(--text); font-size:15px; margin-top:4px;">Nenhum jejum em andamento</div>
      <div class="hint" style="margin-top:4px;">Protocolo atual: <b>${proto.label}</b> (${proto.fast}h de jejum)</div>
      <button class="btn" id="startFastBtn" style="margin-top:14px;">Iniciar jejum agora</button>
    </div>`;
    if(db.fasting.history.length>0){
      html += buildFastingLossEstimateHtml();
    }
    return html;
  }

  const goalMs = a.goalHours*3600*1000;
  const elapsed = fastElapsedMs();
  const pct = Math.min(100, Math.round((elapsed/goalMs)*100));
  const remainingMs = goalMs - elapsed;
  const overMs = elapsed - goalMs;

  html += `<div class="card" style="text-align:center;">
    <div class="ring-wrap" style="margin:0 auto;">${ringSvg(Math.min(100,pct), 130, 11, overMs>0?'var(--red)':'var(--primary)')}
      <div class="ring-label"><div class="rval" id="fastTimerText" style="font-size:22px;">${fmtDuration(elapsed)}</div><div class="rsub">${overMs>0?'além do objetivo':'em jejum'}</div></div>
    </div>
    <div class="hint" style="margin-top:10px;" id="fastRemainText">${overMs>0 ? `${fmtDuration(overMs)} além do objetivo de ${a.goalHours}h` : `Faltam ${fmtDuration(remainingMs)} para completar ${a.goalHours}h`}</div>
  </div>`;

  if(overMs > 2*3600*1000){
    html += `<div class="card" style="border-color:var(--red);">
      <div style="font-weight:800; color:var(--red); font-size:13.5px;">⚠️ Jejum muito prolongado</div>
      <div class="hint" style="margin-top:4px; color:var(--text);">Você já passou ${fmtDuration(overMs)} do seu objetivo. Jejuns muito longos sem orientação profissional podem trazer riscos (queda de açúcar no sangue, tontura, perda de massa muscular). Considere quebrar o jejum agora com uma refeição leve.</div>
    </div>`;
  }

  html += `<div class="modal-actions" style="margin-bottom:14px;">
    <button class="btn" id="endFastBtn" style="width:100%;">Encerrar jejum</button>
  </div>`;

  return html;
}
function buildFastingLossEstimateHtml(){
  const bmr = estimateBMR();
  const last = db.fasting.history[db.fasting.history.length-1];
  const lastGrams = estimateFastingDeficitGrams(last.actualHours||last.goalHours);
  const dailySessions = 1;
  const projection30 = (lastGrams*dailySessions*30)/1000;
  return `<div class="section-label">Estimativa</div>
  <div class="card">
    <div class="rp-row"><span>Perda estimada no último jejum</span><b>~${fmtNum(Math.round(lastGrams))} g</b></div>
    <div class="rp-row"><span>Projeção em 30 dias (fazendo todo dia)</span><b>~${fmtNum(projection30,1)} kg</b></div>
    <div class="hint" style="margin-top:8px;">Estimativa aproximada com base no seu gasto calórico basal. Boa parte da perda inicial é água e glicogênio, não gordura — resultados reais variam bastante e dependem também da alimentação na janela.</div>
  </div>`;
}
function wireJejumCronometroBody(){
  const startBtn = document.getElementById('startFastBtn');
  if(startBtn) startBtn.onclick = ()=>{
    const proto = fastingProtocol(db.fasting.protocol);
    db.fasting.active = {id:uid(), startAt:Date.now(), goalHours:proto.fast, protocol:proto.id};
    saveDB(); renderJejum();
    toast(`Jejum iniciado! Meta: ${proto.fast}h.`);
  };
  const endBtn = document.getElementById('endFastBtn');
  if(endBtn) endBtn.onclick = ()=>{
    confirmModal("Encerrar jejum", "Tem certeza que quer encerrar o jejum agora?", "Encerrar", ()=>{
      const a = db.fasting.active;
      const endedAt = Date.now();
      const actualHours = (endedAt - a.startAt)/3600000;
      db.fasting.history.push({id:a.id, startAt:a.startAt, endedAt, goalHours:a.goalHours, actualHours, protocol:a.protocol, date: todayKey()});
      db.fasting.active = null;
      saveDB();
      setTimeout(()=>showBreakFastModal(actualHours, a.goalHours), 0);
    });
  };
  if(activeFast()){
    fastingTimerInterval = setInterval(()=>{
      const el = document.getElementById('fastTimerText');
      if(!el){ stopFastingTimerLoop(); return; }
      const a = activeFast();
      if(!a){ stopFastingTimerLoop(); return; }
      const goalMs = a.goalHours*3600*1000;
      const elapsed = fastElapsedMs();
      const overMs = elapsed - goalMs;
      el.textContent = fmtDuration(elapsed);
      const remainText = document.getElementById('fastRemainText');
      if(remainText) remainText.textContent = overMs>0 ? `${fmtDuration(overMs)} além do objetivo de ${a.goalHours}h` : `Faltam ${fmtDuration(goalMs-elapsed)} para completar ${a.goalHours}h`;
    }, 1000);
  }
}
function showBreakFastModal(actualHours, goalHours){
  const grams = estimateFastingDeficitGrams(actualHours);
  const proto = fastingProtocol(db.fasting.protocol);
  const readyAt = Date.now() + proto.eat*3600*1000;
  const quebraRecipes = FASTING_RECIPES.filter(r=>r.phase==='quebra').slice(0,3);
  openModal(`
    <h2>Jejum encerrado 🎉</h2>
    <div class="rp-row"><span>Duração total</span><b>${fmtDuration(actualHours*3600*1000)}</b></div>
    <div class="rp-row"><span>Meta era</span><b>${goalHours}h</b></div>
    <div class="rp-row"><span>Estimativa de perda</span><b>~${fmtNum(Math.round(grams))} g</b></div>
    <div class="hint" style="margin:10px 0; line-height:1.6;">Estimativa aproximada — inclui bastante água e glicogênio, não só gordura.</div>
    <div style="font-weight:800; color:var(--text); font-size:13px; margin-top:10px;">O que fazer agora</div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Quebre o jejum com uma refeição leve e de fácil digestão — evite exagerar.</span></div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Hidrate-se bem e mastigue devagar.</span></div>
    <div class="coach-msg"><span class="cm-dot"></span><span>Espere até aproximadamente <b>${new Date(readyAt).toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</b> antes de iniciar o próximo jejum.</span></div>
    ${quebraRecipes.length>0?`<div style="font-weight:800; color:var(--text); font-size:13px; margin-top:12px;">Sugestões para quebrar o jejum</div>${quebraRecipes.map(r=>`<div class="plan-row-wrap"><div class="plan-row" data-jrecipe="${r.id}" style="flex:1;"><span class="plan-name">${r.name}</span><span class="plan-kcal">${fmtNum(r.kcal)} kcal</span></div></div>`).join('')}`:''}
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn" id="mClose">Entendi</button>
    </div>
  `, ()=>{
    document.getElementById('mClose').onclick = ()=>{ closeModal(); renderJejum(); };
    document.querySelectorAll('[data-jrecipe]').forEach(row=>{
      row.onclick = ()=>{ closeModal(); openRecipeModal(FASTING_RECIPES.find(r=>r.id===row.dataset.jrecipe)); };
    });
  });
  checkNewBadges();
}

/* ---- Estimativa de perda (BMR) ---- */
function estimateBMR(){
  const p = db.profile;
  const w = (db.weights.length ? db.weights[db.weights.length-1].value : null) || p.weightGoal || 75;
  const h = p.height || 165;
  const age = p.age || 35;
  if(p.sex==='f') return 10*w + 6.25*h - 5*age - 161;
  return 10*w + 6.25*h - 5*age + 5;
}
function estimateFastingDeficitGrams(hours){
  const bmr = estimateBMR();
  const kcal = (bmr/24) * hours;
  return kcal / 9;
}

/* ---- Progresso (calendário + gráfico + recordes) ---- */
let jejumCalMonthOffset = 0;
function fastingDayStatus(k){
  const sessions = db.fasting.history.filter(h=>h.date===k);
  if(sessions.length===0) return null;
  const best = sessions.reduce((a,b)=> (a.actualHours>b.actualHours?a:b));
  return best.actualHours >= best.goalHours ? 'ok' : 'partial';
}
function buildJejumProgressoHtml(){
  const hist = db.fasting.history.slice().sort((a,b)=> a.startAt-b.startAt);
  let html = '';

  if(hist.length>0){
    html += buildFastingLossEstimateHtml();
    const avgHours = avg(hist.map(h=>h.actualHours));
    const longest = Math.max(...hist.map(h=>h.actualHours));
    const completedCount = hist.filter(h=>h.actualHours>=h.goalHours).length;
    html += `<div class="section-label">Recordes</div>
    <div class="card">
      <div class="rp-row"><span>Total de jejuns concluídos</span><b>${hist.length}</b></div>
      <div class="rp-row"><span>Duração média</span><b>${fmtNum(avgHours,1)}h</b></div>
      <div class="rp-row"><span>Jejum mais longo</span><b>${fmtNum(longest,1)}h</b></div>
      <div class="rp-row"><span>Meta batida</span><b>${completedCount} de ${hist.length}</b></div>
    </div>`;

    html += `<div class="section-label">Evolução (duração por jejum)</div>`;
    const pts = hist.slice(-30).map(h=>({value: Math.round(h.actualHours*10)/10, label: formatShort(h.date)}));
    html += `<div class="card"><div class="chart-wrap">${lineChartSvg(pts)}</div></div>`;
  } else {
    html += `<div class="empty-state"><div class="e-emoji">⏳</div><div class="e-text">Você ainda não concluiu nenhum jejum.<br>Comece pelo Cronômetro para ver seu progresso aqui.</div></div>`;
  }

  // Calendário
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth()+jejumCalMonthOffset);
  const year = base.getFullYear(), month = base.getMonth();
  const monthLabel = base.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  let cells = '';
  for(let i=0;i<firstWeekday;i++) cells += `<div class="cal-cell empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const k = year+'-'+pad2(month+1)+'-'+pad2(d);
    const status = fastingDayStatus(k);
    const isFuture = k>todayKey();
    const color = status==='ok' ? 'var(--green)' : (status==='partial' ? 'var(--orange)' : 'var(--border)');
    cells += `<div class="cal-cell ${k===todayKey()?'today':''}" style="${isFuture?'opacity:.25;':''}">
      <div class="cal-dot" style="background:${isFuture?'var(--border)':color};"></div>
      <div class="cal-daynum">${d}</div>
    </div>`;
  }
  html += `<div class="section-label">Calendário de jejuns</div>`;
  html += `<div class="card">
    <div class="cal-header">
      <button class="cal-nav" id="jcalPrev">←</button>
      <div class="cal-month-label">${monthLabel}</div>
      <button class="cal-nav" id="jcalNext" ${jejumCalMonthOffset>=0?'disabled style="opacity:.3"':''}>→</button>
    </div>
    <div class="cal-weekdays"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-legend">
      <span><i style="background:var(--green);"></i> Meta batida</span>
      <span><i style="background:var(--orange);"></i> Jejum parcial</span>
      <span><i style="background:var(--border);"></i> Sem jejum</span>
    </div>
  </div>`;
  return html;
}
function wireJejumProgressoBody(){
  const prevBtn = document.getElementById('jcalPrev');
  if(prevBtn) prevBtn.onclick = ()=>{ jejumCalMonthOffset--; renderJejum(); };
  const nextBtn = document.getElementById('jcalNext');
  if(nextBtn) nextBtn.onclick = ()=>{ if(jejumCalMonthOffset<0){ jejumCalMonthOffset++; renderJejum(); } };
}

/* ---- Receitas para o jejum ---- */
let jejumReceitaFilter = 'todos'; // todos | quebra | janela
function buildJejumReceitasHtml(){
  let html = `<div class="hint" style="margin-bottom:12px;">20 receitas pensadas para o jejum intermitente: leves para quebrar o jejum, e nutritivas para a janela alimentar.</div>`;
  html += `<div class="filter-chips" id="jejumReceitaFilters">
    <button data-k="todos" class="${jejumReceitaFilter==='todos'?'active':''}">Todas</button>
    <button data-k="quebra" class="${jejumReceitaFilter==='quebra'?'active':''}">Quebra-jejum</button>
    <button data-k="janela" class="${jejumReceitaFilter==='janela'?'active':''}">Janela alimentar</button>
  </div>`;
  const list = jejumReceitaFilter==='todos' ? FASTING_RECIPES : FASTING_RECIPES.filter(r=>r.phase===jejumReceitaFilter);
  html += list.map(r=>`
    <div class="recipe-card" data-jr="${r.id}">
      <div class="rc-top">
        <div class="rc-name">${r.name}</div>
        <div class="rc-badge">${fmtNum(r.kcal)} kcal</div>
      </div>
      <div class="rc-meta">${r.phase==='quebra'?'Quebra-jejum':'Janela alimentar'} · ${r.prep} min</div>
    </div>
  `).join("");
  return html;
}
function wireJejumReceitasBody(){
  document.getElementById('jejumReceitaFilters').querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{ jejumReceitaFilter = b.dataset.k; renderJejum(); };
  });
  document.querySelectorAll('[data-jr]').forEach(card=>{
    card.onclick = ()=>openRecipeModal(FASTING_RECIPES.find(r=>r.id===card.dataset.jr));
  });
}

const FASTING_RECIPES = [
  /* Quebra-jejum (leves, fácil digestão) */
  {id:'jf1', phase:'quebra', name:'Água morna com limão', kcal:10, prep:2, ingredients:['1 copo de água morna','suco de 1/2 limão'], steps:['Esprema o limão na água morna.','Beba devagar para preparar o estômago antes de comer.']},
  {id:'jf2', phase:'quebra', name:'Caldo de legumes leve', kcal:80, prep:20, ingredients:['cenoura, abobrinha e chuchu picados','sal e ervas a gosto','água'], steps:['Cozinhe os legumes em água até ficarem bem macios.','Bata levemente ou amasse para um caldo suave.','Tempere com sal e ervas e sirva morno.']},
  {id:'jf3', phase:'quebra', name:'Iogurte natural com mel', kcal:130, prep:2, ingredients:['1 pote de iogurte natural','1 colher (chá) de mel'], steps:['Misture o mel ao iogurte.','Coma devagar, em pequenas colheradas.']},
  {id:'jf4', phase:'quebra', name:'Melancia fatiada', kcal:60, prep:3, ingredients:['2 fatias de melancia'], steps:['Corte a melancia em fatias ou cubos.','Consuma devagar — é leve e hidratante.']},
  {id:'jf5', phase:'quebra', name:'Ovo cozido simples', kcal:80, prep:10, ingredients:['1 ovo','sal a gosto'], steps:['Cozinhe o ovo por 8-10 minutos.','Descasque, tempere com sal e coma devagar.']},
  {id:'jf6', phase:'quebra', name:'Smoothie leve de banana', kcal:120, prep:5, ingredients:['1 banana','1/2 copo de água ou leite vegetal'], steps:['Bata a banana com a água no liquidificador.','Beba em goles pequenos.']},
  {id:'jf7', phase:'quebra', name:'Sopa de abóbora leve', kcal:110, prep:25, ingredients:['abóbora em cubos','cebola picada','água ou caldo de legumes'], steps:['Refogue a cebola e adicione a abóbora.','Cubra com água e cozinhe até ficar macia.','Bata até formar um creme leve.']},
  {id:'jf8', phase:'quebra', name:'Torrada integral com abacate', kcal:180, prep:6, ingredients:['1 fatia de pão integral','1/4 de abacate amassado','sal a gosto'], steps:['Toste o pão.','Espalhe o abacate amassado por cima.','Tempere com uma pitada de sal.']},
  {id:'jf9', phase:'quebra', name:'Chá de gengibre com limão', kcal:15, prep:8, ingredients:['1 pedaço pequeno de gengibre','suco de limão','água quente'], steps:['Ferva a água com o gengibre por alguns minutos.','Coe, adicione o limão e beba morno.']},
  {id:'jf10', phase:'quebra', name:'Mamão com limão', kcal:70, prep:3, ingredients:['1 fatia de mamão','algumas gotas de limão'], steps:['Corte o mamão em cubos.','Regue com limão e consuma devagar.']},

  /* Janela alimentar (refeições completas e nutritivas) */
  {id:'jf11', phase:'janela', name:'Frango grelhado com legumes', kcal:420, prep:25, ingredients:['1 filé de frango','abobrinha e cenoura salteadas','azeite e temperos a gosto'], steps:['Tempere e grelhe o frango.','Salteie os legumes numa frigideira com azeite.','Sirva juntos.']},
  {id:'jf12', phase:'janela', name:'Salada completa com ovo e grão de bico', kcal:400, prep:15, ingredients:['folhas verdes','1 ovo cozido','1/2 xícara de grão de bico','azeite e limão'], steps:['Monte a salada com as folhas.','Adicione o ovo em rodelas e o grão de bico.','Tempere com azeite e limão.']},
  {id:'jf13', phase:'janela', name:'Salmão (ou peixe) assado com batata doce', kcal:450, prep:30, ingredients:['1 filé de peixe','1 batata doce em rodelas','azeite e ervas'], steps:['Tempere o peixe e a batata doce.','Asse em forno preaquecido a 200°C por cerca de 25 minutos.']},
  {id:'jf14', phase:'janela', name:'Bowl de quinoa com legumes e frango', kcal:460, prep:25, ingredients:['1/2 xícara de quinoa cozida','frango desfiado','legumes variados picados'], steps:['Monte o bowl com a quinoa na base.','Adicione o frango e os legumes por cima.','Tempere a gosto e sirva.']},
  {id:'jf15', phase:'janela', name:'Omelete robusta com legumes e queijo', kcal:380, prep:15, ingredients:['3 ovos','legumes picados a gosto','1 fatia de queijo'], steps:['Bata os ovos e misture os legumes.','Cozinhe em frigideira antiaderente.','Adicione o queijo antes de dobrar.']},
  {id:'jf16', phase:'janela', name:'Carne magra com arroz integral e feijão', kcal:480, prep:30, ingredients:['carne magra','1/2 xícara de arroz integral','1/2 xícara de feijão'], steps:['Grelhe ou refogue a carne.','Sirva com o arroz e o feijão já cozidos.']},
  {id:'jf17', phase:'janela', name:'Wrap integral de frango e vegetais', kcal:400, prep:15, ingredients:['1 tortilha integral','frango grelhado em tiras','folhas e legumes a gosto'], steps:['Monte a tortilha com o frango e os vegetais.','Enrole bem e corte ao meio.']},
  {id:'jf18', phase:'janela', name:'Macarrão integral com atum e legumes', kcal:430, prep:20, ingredients:['macarrão integral','1 lata de atum (ao natural)','legumes salteados'], steps:['Cozinhe o macarrão conforme a embalagem.','Misture com o atum escorrido e os legumes salteados.']},
  {id:'jf19', phase:'janela', name:'Bife com purê de mandioquinha', kcal:470, prep:35, ingredients:['1 bife magro','mandioquinha cozida e amassada','sal e ervas'], steps:['Tempere e grelhe o bife.','Amasse a mandioquinha até formar um purê.','Sirva juntos.']},
  {id:'jf20', phase:'janela', name:'Bowl de iogurte com frutas e granola', kcal:350, prep:5, ingredients:['1 pote de iogurte natural','frutas picadas a gosto','2 colheres (sopa) de granola'], steps:['Coloque o iogurte na tigela.','Adicione as frutas picadas e a granola por cima.']}
];

/* ============ HÁBITOS ============ */
function habitStreak(habitId){
  let count = 0;
  let cursor = todayKey();
  const doneToday = (db.habitLogs[cursor]||{})[habitId];
  if(!doneToday) cursor = addDaysKey(cursor,-1);
  while((db.habitLogs[cursor]||{})[habitId]){
    count++;
    cursor = addDaysKey(cursor,-1);
  }
  return count;
}
function renderHabitos(){
  const main = document.getElementById('main');
  const t = todayKey();
  const days7 = last7Keys();

  let html = coachBoxHtml('habitos');
  html += `<div class="card craving-card" id="cravingBtn" style="display:flex; align-items:center; gap:12px; cursor:pointer; margin-bottom:14px;">
    <div style="font-size:26px;">🍫</div>
    <div style="flex:1;">
      <div style="font-weight:800; color:var(--text); font-size:14px;">Estou com vontade de comer</div>
      <div class="hint" style="margin-top:1px;">Toque aqui antes de decidir — vamos entender o que você está sentindo.</div>
    </div>
  </div>`;
  html += `<button class="btn" id="addHabitBtn" style="margin-bottom:14px;">+ Novo hábito</button>`;

  if(db.habits.length===0){
    html += `<div class="empty-state"><div class="e-emoji">✅</div><div class="e-text">Nenhum hábito ainda.<br>Exemplos: "Treinar", "Beber 2L de água", "Dormir 7h", "Sem refrigerante".</div></div>`;
  } else {
    html += db.habits.map(h=>{
      const doneToday = (db.habitLogs[t]||{})[h.id];
      const streak = habitStreak(h.id);
      const grid = days7.map(k=>{
        const on = !!(db.habitLogs[k]||{})[h.id];
        return `<div class="hg-day"><div class="hgd-label">${weekdayLetter(k)}</div><div class="hgd-dot ${on?'on':''}"></div></div>`;
      }).join("");
      return `<div class="habit-row" data-id="${h.id}">
        <div class="habit-top">
          <div class="check ${doneToday?'checked':''}" data-check="${h.id}">${doneToday?'✓':''}</div>
          <div class="habit-name">${escapeHtml(h.name)}</div>
          ${streak>0?`<div class="habit-streak">🔥 ${streak}d</div>`:''}
          <button class="habit-del" data-del="${h.id}">🗑</button>
        </div>
        <div class="habit-grid">${grid}</div>
      </div>`;
    }).join("");
  }

  main.innerHTML = html;
  document.getElementById('cravingBtn').onclick = openCravingModal;
  document.getElementById('addHabitBtn').onclick = ()=>{
    openModal(`
      <h2>Novo hábito</h2>
      <div class="field"><label>Nome do hábito</label><input type="text" id="habitName" placeholder="Ex: Treinar 30 minutos" autofocus></div>
      <div class="modal-actions">
        <button class="btn secondary" id="mCancel">Cancelar</button>
        <button class="btn" id="mSave">Criar</button>
      </div>
    `, ()=>{
      document.getElementById('mCancel').onclick = closeModal;
      document.getElementById('habitName').focus();
      document.getElementById('mSave').onclick = ()=>{
        const name = document.getElementById('habitName').value.trim();
        if(!name){ toast("Digite um nome."); return; }
        db.habits.push({id:uid(), name});
        saveDB(); closeModal(); renderHabitos();
      };
    });
  };
  main.querySelectorAll('[data-check]').forEach(b=>{
    b.onclick = ()=>{
      const id = b.dataset.check;
      if(!db.habitLogs[t]) db.habitLogs[t] = {};
      db.habitLogs[t][id] = !db.habitLogs[t][id];
      saveDB(); renderHabitos();
      checkNewBadges();
    };
  });
  main.querySelectorAll('[data-del]').forEach(b=>{
    b.onclick = (e)=>{
      e.stopPropagation();
      const id = b.dataset.del;
      const h = db.habits.find(x=>x.id===id);
      confirmModal("Excluir hábito", `Excluir "${escapeHtml(h.name)}"? O histórico dele também será removido.`, "Excluir", ()=>{
        db.habits = db.habits.filter(x=>x.id!==id);
        Object.keys(db.habitLogs).forEach(k=>{ if(db.habitLogs[k]) delete db.habitLogs[k][id]; });
        saveDB(); renderHabitos();
      });
    };
  });
}

/* ============ TREINO ============ */
let treinoFilter = 'todos';
function renderTreino(){
  const main = document.getElementById('main');
  const t = todayKey();
  const doneToday = (db.habitLogs[t]||{}).__workout || false;
  const streak = habitStreak('__workout');

  let html = coachBoxHtml('treino');
  html += `<div class="today-workout-row">
    <div class="check ${doneToday?'checked':''}" id="workoutCheck">${doneToday?'✓':''}</div>
    <div style="flex:1;">
      <div style="font-weight:700; font-size:15px; color:var(--text);">Treinei hoje</div>
      <div class="hint">${streak>0?`🔥 ${streak} dia(s) seguidos`:'Marque quando terminar seu treino'}</div>
    </div>
  </div>`;

  const groups = ['todos', ...new Set(EXERCISES.map(e=>e.group))];
  html += `<div class="filter-chips" id="treinoFilters">
    ${groups.map(g=>`<button data-g="${g}" class="${treinoFilter===g?'active':''}">${g==='todos'?'Todos':g}</button>`).join("")}
  </div>`;

  let list = treinoFilter==='todos' ? EXERCISES : EXERCISES.filter(e=>e.group===treinoFilter);
  if(db.travelMode){
    html = html.replace('<div class="filter-chips"', `<div class="card craving-card" style="border-color:var(--blue); margin-bottom:12px;">
      <div style="font-weight:800; color:var(--text); font-size:13.5px;">🧳 Modo viagem ativo</div>
      <div class="hint" style="margin-top:2px;">Mostrando só exercícios sem equipamento — perfeitos para hotel ou espaços pequenos.</div>
    </div><div class="filter-chips"`);
    list = list.filter(e => !/halteres|elástico/i.test(e.name));
  }
  html += `<div class="section-label">Exercícios${db.travelMode?' rápidos':' (sem equipamento)'}</div>`;
  html += list.length===0 ? `<div class="empty-state"><div class="e-emoji">🏋️</div><div class="e-text">Nenhum exercício disponível nesse filtro.</div></div>` : list.map(e=>`
    <div class="exercise-card" data-ex="${e.id}">
      <div class="ec-top">
        <div class="ec-icon">${e.icon}</div>
        <div class="ec-name">${e.name}</div>
        <div class="ec-diff ${e.diff}">${e.diff}</div>
      </div>
      <div class="ec-meta">${e.group} · ${e.duration}</div>
    </div>
  `).join("");

  main.innerHTML = html;
  document.getElementById('workoutCheck').onclick = ()=>{
    if(!db.habitLogs[t]) db.habitLogs[t] = {};
    db.habitLogs[t].__workout = !db.habitLogs[t].__workout;
    saveDB(); renderTreino();
    if(db.habitLogs[t].__workout) checkNewBadges();
  };
  document.getElementById('treinoFilters').querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{ treinoFilter = b.dataset.g; renderTreino(); };
  });
  main.querySelectorAll('[data-ex]').forEach(card=>{
    card.onclick = ()=>openExerciseModal(EXERCISES.find(e=>e.id===card.dataset.ex));
  });
}
function openExerciseModal(ex){
  openModal(`
    <h2>${ex.icon} ${ex.name}</h2>
    <div class="hint" style="margin-bottom:12px;">${ex.group} · ${ex.diff} · ${ex.duration}</div>
    <ol class="detail-steps">${ex.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <div class="warn-box">💡 ${escapeHtml(ex.tip)}</div>
    <div class="modal-actions"><button class="btn secondary" id="mClose">Fechar</button></div>
  `, ()=>{ document.getElementById('mClose').onclick = closeModal; });
}

/* ============ Sistema anti-abandono ============ */
function showWelcomeBackModal(gapDays){
  let title, msg;
  if(gapDays<7){
    title = "Sentimos sua falta! 👋";
    msg = `Faz ${gapDays} dias que você não aparece por aqui. Seus dados continuam salvos — que tal registrar seu peso de hoje pra retomar o ritmo?`;
  } else if(gapDays<15){
    title = "Ainda dá tempo de voltar 🌱";
    msg = `Já fazem ${gapDays} dias. Uma pausa não apaga o que você já conquistou — vamos dar só um passo pequeno hoje?`;
  } else if(gapDays<30){
    title = "Seu plano continua salvo 📋";
    msg = `Faz ${gapDays} dias desde sua última visita. Tudo que você registrou continua aqui. Se quiser, dá pra revisar sua meta antes de retomar.`;
  } else {
    title = "Bem-vindo(a) de volta 🌱";
    msg = `Já faz mais de um mês. Sem problema — o importante é recomeçar. Pode valer a pena revisar seu peso, objetivo e metas, já que algumas coisas podem ter mudado.`;
  }
  openModal(`
    <h2>${title}</h2>
    <p style="color:var(--text); font-size:14px; line-height:1.6;">${msg}</p>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn" id="mClose">Continuar</button>
    </div>
  `, ()=>{ document.getElementById('mClose').onclick = closeModal; });
}

/* ============ Notificações locais (experimental) ============ */
function canUseNotifications(){
  return typeof Notification !== 'undefined';
}
function notifPermissionLabel(){
  if(!canUseNotifications()) return 'Não suportado neste navegador';
  if(Notification.permission==='granted') return 'Ativadas';
  if(Notification.permission==='denied') return 'Bloqueadas nas permissões do navegador';
  return 'Desativadas';
}
async function toggleNotifications(){
  if(!canUseNotifications()){ toast("Seu navegador não suporta notificações."); return; }
  if(Notification.permission==='granted'){
    db.notifEnabled = !db.notifEnabled;
    saveDB();
    toast(db.notifEnabled ? "Lembretes locais ativados." : "Lembretes locais desativados.");
    return;
  }
  const perm = await Notification.requestPermission();
  if(perm==='granted'){
    db.notifEnabled = true;
    saveDB();
    toast("Notificações ativadas neste aparelho.");
    try{ new Notification("Viva Leve", {body:"Prontinho! Vou te lembrar por aqui enquanto o app estiver aberto.", icon:"/icons/icon-192.png"}); }catch(e){}
  } else {
    toast("Permissão não concedida.");
  }
}
function maybeFireLocalRiskNotification(){
  if(!db.notifEnabled || !canUseNotifications() || Notification.permission!=='granted') return;
  if(document.visibilityState==='visible') return; // só notifica quando em segundo plano
  const alerts = riskAlerts();
  if(alerts.length===0) return;
  const key = todayKey();
  if(db._lastNotifDate===key) return;
  db._lastNotifDate = key;
  try{ new Notification("Viva Leve", {body: alerts[0], icon:"/icons/icon-192.png"}); }catch(e){}
}

/* ============ Boot ============ */
render();
const _gapDays = db.lastOpenedAt ? daysSince(db.lastOpenedAt) : null;
const _showWelcomeBack = db.profile.name && _gapDays!=null && _gapDays>=3;
db.lastOpenedAt = todayKey();
saveDB();
if(!db.profile.name){
  setTimeout(()=>openProfileModal(true), 300);
} else if(_showWelcomeBack){
  setTimeout(()=>showWelcomeBackModal(_gapDays), 300);
}
if(typeof document !== 'undefined'){
  document.addEventListener('visibilitychange', maybeFireLocalRiskNotification);
}


/* ============ Biblioteca de Receitas ============ */
const RECIPES = [
  {id:'r1', type:'cafe', name:'Ovos mexidos com aveia', kcal:280, prep:10,
    ingredients:['2 ovos','2 colheres (sopa) de aveia em flocos','1 fatia de queijo branco (opcional)','sal e pimenta a gosto'],
    steps:['Bata os ovos numa tigela e tempere com sal e pimenta.','Misture a aveia aos ovos batidos.','Leve à frigideira antiaderente em fogo baixo, mexendo até cozinhar por igual.','Sirva com o queijo branco por cima, se quiser.']},
  {id:'r2', type:'cafe', name:'Iogurte com frutas e granola', kcal:220, prep:5,
    ingredients:['1 pote de iogurte natural','1/2 banana ou fruta de sua preferência','2 colheres (sopa) de granola sem açúcar','canela a gosto'],
    steps:['Corte a fruta em pedaços pequenos.','Misture o iogurte com a fruta num pote.','Finalize com a granola e uma pitada de canela por cima.']},
  {id:'r3', type:'cafe', name:'Pão integral com abacate', kcal:250, prep:8,
    ingredients:['1 fatia de pão integral','1/4 de abacate','suco de limão','sal e pimenta a gosto'],
    steps:['Amasse o abacate com um garfo numa tigela.','Tempere com limão, sal e pimenta.','Espalhe sobre a fatia de pão tostada.']},
  {id:'r4', type:'cafe', name:'Vitamina de banana com aveia', kcal:230, prep:5,
    ingredients:['1 banana','1 copo de leite (ou leite vegetal)','2 colheres (sopa) de aveia','1 colher (chá) de mel (opcional)'],
    steps:['Coloque todos os ingredientes no liquidificador.','Bata até ficar homogêneo.','Sirva imediatamente.']},

  {id:'r5', type:'almoco', name:'Frango grelhado com legumes', kcal:420, prep:25,
    ingredients:['1 filé de frango','1 xícara de brócolis','1 cenoura em rodelas','azeite, sal, alho e pimenta a gosto'],
    steps:['Tempere o frango com sal, alho e pimenta.','Grelhe em frigideira com um fio de azeite até dourar dos dois lados.','Cozinhe os legumes no vapor ou na água por 5-8 minutos.','Sirva o frango acompanhado dos legumes.']},
  {id:'r6', type:'almoco', name:'Arroz integral, feijão e salada', kcal:450, prep:30,
    ingredients:['1/2 xícara de arroz integral cozido','1/2 xícara de feijão cozido','folhas verdes a gosto','tomate e pepino em cubos','azeite e limão para temperar'],
    steps:['Monte o prato com arroz e feijão.','Adicione a salada de folhas, tomate e pepino.','Tempere a salada com azeite, limão e sal.']},
  {id:'r7', type:'almoco', name:'Salmão ou tilápia com purê de mandioquinha', kcal:480, prep:35,
    ingredients:['1 filé de peixe','2 mandioquinhas médias','1 colher (sopa) de azeite','sal, limão e ervas a gosto'],
    steps:['Cozinhe a mandioquinha até ficar bem macia e amasse até virar purê.','Tempere o peixe com sal, limão e ervas.','Grelhe ou asse o peixe até cozinhar por completo.','Sirva o peixe com o purê.']},
  {id:'r8', type:'almoco', name:'Wrap integral de frango desfiado', kcal:400, prep:20,
    ingredients:['1 tortilha integral','frango desfiado (cozido e temperado)','folhas de alface','tomate em cubos','1 colher (sopa) de iogurte natural'],
    steps:['Misture o frango desfiado com o iogurte.','Monte a tortilha com alface, tomate e o frango.','Enrole bem e corte no meio para servir.']},

  {id:'r9', type:'jantar', name:'Omelete de legumes', kcal:300, prep:15,
    ingredients:['2 ovos','abobrinha e cenoura raladas','cebola picada','sal e pimenta a gosto'],
    steps:['Bata os ovos e misture os legumes ralados.','Tempere com sal e pimenta.','Cozinhe em frigideira antiaderente em fogo baixo até firmar dos dois lados.']},
  {id:'r10', type:'jantar', name:'Sopa de legumes com frango', kcal:280, prep:30,
    ingredients:['peito de frango em cubos','cenoura, chuchu e abóbora em cubos','1 cebola picada','caldo de legumes ou água','sal e temperos a gosto'],
    steps:['Refogue a cebola e o frango até dourar.','Adicione os legumes e cubra com água ou caldo.','Cozinhe até os legumes ficarem macios.','Tempere a gosto e sirva quente.']},
  {id:'r11', type:'jantar', name:'Salada completa com atum', kcal:320, prep:12,
    ingredients:['1 lata de atum (ao natural)','folhas verdes a gosto','tomate cereja','milho e ervilha (opcional)','azeite e limão'],
    steps:['Monte a base com as folhas verdes.','Adicione o atum escorrido, tomate, milho e ervilha.','Tempere com azeite, limão e sal a gosto.']},
  {id:'r12', type:'jantar', name:'Torrada integral com queijo e tomate', kcal:260, prep:10,
    ingredients:['2 fatias de pão integral','2 fatias de queijo branco ou minas','1 tomate em rodelas','orégano a gosto'],
    steps:['Toste as fatias de pão.','Monte com o queijo e o tomate.','Finalize com orégano por cima.']},

  {id:'r13', type:'lanche', name:'Mix de castanhas', kcal:180, prep:1,
    ingredients:['1 punhado pequeno de castanhas variadas (castanha do Pará, amêndoas, nozes)'],
    steps:['Separe uma porção pequena (uma mão fechada) para não exceder as calorias.','Consuma como lanche entre as refeições principais.']},
  {id:'r14', type:'lanche', name:'Maçã com pasta de amendoim', kcal:200, prep:3,
    ingredients:['1 maçã','1 colher (sopa) de pasta de amendoim integral'],
    steps:['Corte a maçã em fatias.','Sirva com a pasta de amendoim para acompanhar.']},
  {id:'r15', type:'lanche', name:'Iogurte com canela', kcal:120, prep:2,
    ingredients:['1 pote de iogurte natural','canela em pó a gosto'],
    steps:['Adicione canela por cima do iogurte.','Sirva gelado.']},
  {id:'r16', type:'lanche', name:'Ovo cozido com sal e limão', kcal:80, prep:10,
    ingredients:['1 ovo','sal e limão a gosto'],
    steps:['Cozinhe o ovo em água por 8-10 minutos.','Descasque e tempere com sal e limão.']},

  /* --- Café da manhã (mais 16) --- */
  {id:'r17', type:'cafe', name:'Panqueca de banana e aveia', kcal:260, prep:12,
    ingredients:['1 banana amassada','2 ovos','3 colheres (sopa) de aveia em flocos','canela a gosto'],
    steps:['Misture todos os ingredientes numa tigela até formar uma massa homogênea.','Aqueça uma frigideira antiaderente em fogo baixo.','Despeje pequenas porções e doure dos dois lados.','Sirva com canela por cima.']},
  {id:'r18', type:'cafe', name:'Tapioca com queijo', kcal:240, prep:8,
    ingredients:['3 colheres (sopa) de goma de tapioca','1 fatia de queijo branco ou minas','sal a gosto'],
    steps:['Peneire a goma numa frigideira antiaderente quente formando um disco fino.','Deixe firmar por cerca de 1 minuto e vire.','Recheie com o queijo, dobre ao meio e sirva.']},
  {id:'r19', type:'cafe', name:'Smoothie verde (couve, banana e maçã)', kcal:190, prep:6,
    ingredients:['1 folha de couve','1 banana','1/2 maçã','1 copo de água ou leite vegetal'],
    steps:['Lave bem a couve.','Bata todos os ingredientes no liquidificador até ficar homogêneo.','Sirva gelado.']},
  {id:'r20', type:'cafe', name:'Overnight oats com frutas vermelhas', kcal:270, prep:5,
    ingredients:['4 colheres (sopa) de aveia em flocos','1 pote de iogurte natural','1/2 xícara de frutas vermelhas','1 colher (chá) de mel (opcional)'],
    steps:['Misture a aveia com o iogurte num pote com tampa.','Adicione as frutas vermelhas por cima.','Leve à geladeira de um dia para o outro e consuma no café da manhã seguinte.']},
  {id:'r21', type:'cafe', name:'Crepioca com frango desfiado', kcal:290, prep:12,
    ingredients:['1 ovo','2 colheres (sopa) de goma de tapioca','frango desfiado temperado','sal a gosto'],
    steps:['Bata o ovo com a goma de tapioca e uma pitada de sal.','Despeje numa frigideira antiaderente quente, espalhando bem.','Doure dos dois lados e recheie com o frango desfiado.','Dobre ao meio e sirva.']},
  {id:'r22', type:'cafe', name:'Torrada de banana com canela', kcal:210, prep:6,
    ingredients:['1 fatia de pão integral','1/2 banana amassada','canela em pó a gosto'],
    steps:['Toste a fatia de pão.','Espalhe a banana amassada por cima.','Finalize com canela a gosto.']},
  {id:'r23', type:'cafe', name:'Omelete simples com espinafre', kcal:230, prep:10,
    ingredients:['2 ovos','1 punhado de espinafre picado','sal e pimenta a gosto'],
    steps:['Bata os ovos e tempere com sal e pimenta.','Misture o espinafre picado.','Cozinhe em frigideira antiaderente em fogo baixo até firmar dos dois lados.']},
  {id:'r24', type:'cafe', name:'Cuscuz com ovo mexido', kcal:280, prep:15,
    ingredients:['1/2 xícara de flocos de milho para cuscuz','2 ovos','sal a gosto','água quente'],
    steps:['Hidrate os flocos de milho com água quente e uma pitada de sal, deixando descansar por 5 minutos.','Cozinhe no vapor até firmar.','Prepare os ovos mexidos numa frigideira à parte.','Sirva o cuscuz acompanhado dos ovos.']},
  {id:'r25', type:'cafe', name:'Panqueca de aveia com maçã', kcal:250, prep:12,
    ingredients:['1/2 maçã ralada','2 ovos','3 colheres (sopa) de aveia em flocos','canela a gosto'],
    steps:['Misture todos os ingredientes numa tigela.','Aqueça uma frigideira antiaderente em fogo baixo.','Despeje pequenas porções e doure dos dois lados.']},
  {id:'r26', type:'cafe', name:'Sanduíche natural de peito de peru', kcal:260, prep:8,
    ingredients:['2 fatias de pão integral','2 fatias de peito de peru','folhas de alface','1 colher (sopa) de requeijão light'],
    steps:['Passe o requeijão light nas fatias de pão.','Monte o sanduíche com o peito de peru e a alface.','Corte ao meio e sirva.']},
  {id:'r27', type:'cafe', name:'Mingau de aveia com mel', kcal:220, prep:8,
    ingredients:['3 colheres (sopa) de aveia em flocos','1 copo de leite (ou leite vegetal)','1 colher (chá) de mel','canela a gosto'],
    steps:['Aqueça o leite numa panela em fogo baixo.','Adicione a aveia e mexa até engrossar.','Sirva com mel e canela por cima.']},
  {id:'r28', type:'cafe', name:'Vitamina de mamão com aveia', kcal:210, prep:5,
    ingredients:['1 fatia de mamão','1 copo de leite (ou leite vegetal)','2 colheres (sopa) de aveia'],
    steps:['Coloque todos os ingredientes no liquidificador.','Bata até ficar homogêneo.','Sirva gelado.']},
  {id:'r29', type:'cafe', name:'Ovo poché com torrada integral', kcal:230, prep:10,
    ingredients:['1 ovo','1 fatia de pão integral','vinagre (para escaldar)','sal e pimenta a gosto'],
    steps:['Ferva água com um pouco de vinagre.','Quebre o ovo com cuidado dentro da água em fervura branda por cerca de 3 minutos.','Retire com uma escumadeira e tempere.','Sirva sobre a torrada.']},
  {id:'r30', type:'cafe', name:'Iogurte grego com mel e nozes', kcal:240, prep:3,
    ingredients:['1 pote de iogurte grego','1 colher (chá) de mel','1 colher (sopa) de nozes picadas'],
    steps:['Coloque o iogurte num pote.','Regue com o mel.','Finalize com as nozes picadas por cima.']},
  {id:'r31', type:'cafe', name:'Pão de queijo fit (com tapioca)', kcal:200, prep:20,
    ingredients:['1 xícara de goma de tapioca hidratada','1 ovo','2 colheres (sopa) de queijo ralado','sal a gosto'],
    steps:['Misture a goma de tapioca com o ovo, o queijo e o sal até formar uma massa.','Modele bolinhas pequenas.','Asse em forno preaquecido a 180°C por cerca de 20 minutos, até dourar.']},
  {id:'r32', type:'cafe', name:'Salada de frutas com chia', kcal:180, prep:8,
    ingredients:['1 xícara de frutas variadas picadas (mamão, banana, maçã)','1 colher (chá) de sementes de chia','suco de limão a gosto'],
    steps:['Corte as frutas em pedaços pequenos numa tigela.','Regue com limão para não escurecer.','Finalize com a chia por cima.']},

  /* --- Almoço (mais 16) --- */
  {id:'r33', type:'almoco', name:'Filé de tilápia com quinoa', kcal:430, prep:25,
    ingredients:['1 filé de tilápia','1/2 xícara de quinoa cozida','azeite, limão, sal e ervas a gosto'],
    steps:['Tempere o filé com limão, sal e ervas.','Grelhe em frigideira com um fio de azeite até dourar dos dois lados.','Sirva acompanhado da quinoa cozida.']},
  {id:'r34', type:'almoco', name:'Frango ao curry com arroz integral', kcal:460, prep:30,
    ingredients:['1 filé de frango em cubos','1 colher (chá) de curry em pó','1/2 xícara de arroz integral cozido','leite de coco (opcional)'],
    steps:['Refogue o frango temperado com o curry até dourar.','Se quiser, adicione um pouco de leite de coco e deixe apurar.','Sirva com o arroz integral.']},
  {id:'r35', type:'almoco', name:'Carne moída refogada com legumes', kcal:440, prep:25,
    ingredients:['carne moída magra','cenoura e abobrinha picadas','cebola e alho a gosto','sal e temperos a gosto'],
    steps:['Refogue a cebola e o alho, adicione a carne moída e cozinhe até dourar.','Junte os legumes picados e cozinhe até ficarem macios.','Tempere a gosto e sirva.']},
  {id:'r36', type:'almoco', name:'Macarrão integral ao sugo com frango', kcal:470, prep:25,
    ingredients:['macarrão integral','frango desfiado','molho de tomate caseiro','manjericão a gosto'],
    steps:['Cozinhe o macarrão integral conforme instruções da embalagem.','Aqueça o molho de tomate com o frango desfiado.','Misture o macarrão ao molho e finalize com manjericão.']},
  {id:'r37', type:'almoco', name:'Peixe assado com batata doce', kcal:410, prep:35,
    ingredients:['1 filé de peixe','1 batata doce média em rodelas','azeite, limão e ervas a gosto'],
    steps:['Tempere o peixe e as rodelas de batata doce.','Disponha em uma assadeira com um fio de azeite.','Asse em forno preaquecido a 200°C por cerca de 25 minutos.']},
  {id:'r38', type:'almoco', name:'Almôndegas de carne com purê de abóbora', kcal:450, prep:35,
    ingredients:['carne moída magra','1 ovo','abóbora cozida para o purê','sal e temperos a gosto'],
    steps:['Misture a carne moída com o ovo e temperos, moldando as almôndegas.','Doure as almôndegas numa frigideira.','Amasse a abóbora cozida até formar um purê e sirva junto.']},
  {id:'r39', type:'almoco', name:'Bife acebolado com arroz e feijão', kcal:480, prep:25,
    ingredients:['1 bife magro','1 cebola fatiada','1/2 xícara de arroz cozido','1/2 xícara de feijão cozido'],
    steps:['Tempere o bife com sal e grelhe até o ponto desejado.','Refogue a cebola fatiada até dourar e sirva sobre o bife.','Acompanhe com arroz e feijão.']},
  {id:'r40', type:'almoco', name:'Frango xadrez fit', kcal:420, prep:25,
    ingredients:['frango em cubos','pimentão, cebola e cenoura em cubos','molho shoyu light','gengibre a gosto'],
    steps:['Refogue o frango até dourar.','Adicione os legumes e o gengibre, cozinhando por mais alguns minutos.','Finalize com um fio de shoyu light e sirva.']},
  {id:'r41', type:'almoco', name:'Escondidinho de frango com batata doce', kcal:440, prep:35,
    ingredients:['frango desfiado','batata doce cozida e amassada','cebola e alho a gosto','queijo ralado (opcional)'],
    steps:['Refogue o frango desfiado com cebola e alho.','Coloque numa travessa e cubra com o purê de batata doce.','Polvilhe queijo ralado, se quiser, e leve ao forno para gratinar.']},
  {id:'r42', type:'almoco', name:'Risoto integral de legumes', kcal:400, prep:35,
    ingredients:['arroz integral','abobrinha, cenoura e ervilha','caldo de legumes','cebola e alho a gosto'],
    steps:['Refogue a cebola e o alho, adicione o arroz integral.','Vá acrescentando o caldo de legumes aos poucos, mexendo sempre.','Junte os legumes e cozinhe até o arroz ficar no ponto.']},
  {id:'r43', type:'almoco', name:'Peito de frango grelhado com legumes salteados', kcal:400, prep:25,
    ingredients:['1 filé de frango','abobrinha e pimentão em tiras','azeite, sal e ervas a gosto'],
    steps:['Tempere e grelhe o frango até dourar dos dois lados.','Salteie os legumes numa frigideira com um fio de azeite.','Sirva o frango acompanhado dos legumes.']},
  {id:'r44', type:'almoco', name:'Salada de grão de bico com atum', kcal:390, prep:15,
    ingredients:['1 xícara de grão de bico cozido','1 lata de atum (ao natural)','tomate e cebola picados','azeite e limão'],
    steps:['Misture o grão de bico, o atum escorrido, o tomate e a cebola numa tigela.','Tempere com azeite, limão e sal.','Sirva fresco ou gelado.']},
  {id:'r45', type:'almoco', name:'Estrogonofe de frango fit', kcal:450, prep:25,
    ingredients:['frango em tiras','iogurte natural ou creme de leite light','champignon (opcional)','molho de tomate a gosto'],
    steps:['Refogue o frango até dourar.','Adicione o champignon e o molho de tomate, cozinhando por alguns minutos.','Desligue o fogo e misture o iogurte antes de servir.']},
  {id:'r46', type:'almoco', name:'Carne de panela com legumes', kcal:470, prep:45,
    ingredients:['carne magra em cubos','cenoura, batata e chuchu em pedaços','cebola e alho a gosto','caldo ou água'],
    steps:['Doure a carne com cebola e alho numa panela.','Adicione água ou caldo e cozinhe em fogo baixo até a carne ficar macia.','Junte os legumes nos últimos 20 minutos de cozimento.']},
  {id:'r47', type:'almoco', name:'Quibe assado de forno', kcal:410, prep:40,
    ingredients:['carne moída magra','trigo para quibe hidratado','cebola e hortelã a gosto','azeite para untar'],
    steps:['Misture a carne moída com o trigo hidratado, cebola e hortelã.','Espalhe numa assadeira untada, alisando a superfície.','Marque em losangos e regue com azeite.','Asse em forno preaquecido a 200°C por cerca de 25 minutos.']},
  {id:'r48', type:'almoco', name:'Espaguete de abobrinha com molho de tomate e frango', kcal:360, prep:20,
    ingredients:['abobrinha em tiras finas (tipo espaguete)','frango desfiado','molho de tomate caseiro','manjericão a gosto'],
    steps:['Faça tiras finas de abobrinha com um descascador ou espiralizador.','Aqueça o molho de tomate com o frango desfiado.','Misture a abobrinha rapidamente ao molho quente e sirva.']},

  /* --- Jantar (mais 16) --- */
  {id:'r49', type:'jantar', name:'Sopa de abóbora com gengibre', kcal:220, prep:30,
    ingredients:['abóbora em cubos','1 pedaço pequeno de gengibre','cebola picada','caldo de legumes ou água'],
    steps:['Refogue a cebola e o gengibre.','Adicione a abóbora e cubra com água ou caldo.','Cozinhe até a abóbora ficar macia e bata no liquidificador até ficar cremosa.']},
  {id:'r50', type:'jantar', name:'Salada Caesar fit com frango', kcal:340, prep:20,
    ingredients:['frango grelhado em tiras','folhas de alface romana','molho de iogurte com mostarda','queijo parmesão ralado (opcional)'],
    steps:['Grelhe e corte o frango em tiras.','Monte a salada com a alface rasgada.','Regue com o molho de iogurte e finalize com o parmesão.']},
  {id:'r51', type:'jantar', name:'Wrap de atum', kcal:330, prep:12,
    ingredients:['1 tortilha integral','1 lata de atum (ao natural)','folhas verdes','1 colher (sopa) de iogurte natural'],
    steps:['Misture o atum escorrido com o iogurte.','Monte a tortilha com as folhas e o atum.','Enrole bem e corte ao meio.']},
  {id:'r52', type:'jantar', name:'Frittata de legumes', kcal:290, prep:25,
    ingredients:['3 ovos','abobrinha, pimentão e cebola picados','sal e pimenta a gosto'],
    steps:['Bata os ovos e tempere.','Misture os legumes picados.','Despeje numa frigideira antiaderente e cozinhe em fogo baixo, ou leve ao forno até firmar.']},
  {id:'r53', type:'jantar', name:'Panqueca de frango', kcal:310, prep:20,
    ingredients:['frango desfiado','2 ovos','2 colheres (sopa) de farinha de aveia','sal a gosto'],
    steps:['Misture os ovos com a farinha de aveia até formar uma massa.','Frite pequenas panquecas numa frigideira antiaderente.','Recheie com o frango desfiado e dobre ao meio.']},
  {id:'r54', type:'jantar', name:'Caldo verde light', kcal:250, prep:30,
    ingredients:['batata cozida e amassada','couve fatiada finamente','calabresa light em rodelas (opcional)','caldo de legumes'],
    steps:['Cozinhe a batata e amasse até formar um creme com o caldo.','Adicione a calabresa, se usar, e deixe apurar.','Nos últimos minutos, junte a couve fatiada e desligue o fogo.']},
  {id:'r55', type:'jantar', name:'Salada morna de batata doce e frango', kcal:350, prep:25,
    ingredients:['batata doce em cubos assados','frango grelhado em tiras','folhas verdes','azeite e limão'],
    steps:['Asse os cubos de batata doce até ficarem macios.','Grelhe e corte o frango em tiras.','Monte a salada com as folhas, a batata doce e o frango, temperando com azeite e limão.']},
  {id:'r56', type:'jantar', name:'Peixe grelhado com salada', kcal:300, prep:20,
    ingredients:['1 filé de peixe','folhas verdes a gosto','tomate cereja','azeite e limão'],
    steps:['Tempere e grelhe o peixe até dourar dos dois lados.','Monte uma salada simples com as folhas e o tomate.','Regue com azeite e limão e sirva junto ao peixe.']},
  {id:'r57', type:'jantar', name:'Omelete de claras com espinafre', kcal:180, prep:12,
    ingredients:['4 claras de ovo','1 punhado de espinafre picado','sal e pimenta a gosto'],
    steps:['Bata as claras e tempere.','Misture o espinafre picado.','Cozinhe em frigideira antiaderente em fogo baixo até firmar.']},
  {id:'r58', type:'jantar', name:'Sopa de lentilha', kcal:280, prep:35,
    ingredients:['1 xícara de lentilha','cenoura e cebola picadas','alho a gosto','caldo de legumes ou água'],
    steps:['Refogue a cebola e o alho.','Adicione a lentilha, a cenoura e o caldo.','Cozinhe até a lentilha ficar macia, cerca de 25 minutos.']},
  {id:'r59', type:'jantar', name:'Sanduíche de omelete integral', kcal:290, prep:12,
    ingredients:['2 fatias de pão integral','2 ovos','folhas de alface','sal a gosto'],
    steps:['Prepare uma omelete simples e tempere com sal.','Monte o sanduíche com o pão, a omelete e a alface.','Corte ao meio e sirva.']},
  {id:'r60', type:'jantar', name:'Salada de quinoa com legumes', kcal:320, prep:20,
    ingredients:['1/2 xícara de quinoa cozida','pepino e tomate picados','folhas verdes','azeite e limão'],
    steps:['Misture a quinoa cozida com o pepino e o tomate.','Adicione as folhas verdes.','Tempere com azeite, limão e sal a gosto.']},
  {id:'r61', type:'jantar', name:'Canja de galinha', kcal:270, prep:35,
    ingredients:['peito de frango desfiado','arroz','cenoura picada','caldo de galinha ou água'],
    steps:['Cozinhe o frango até ficar macio e desfie.','Na mesma água, cozinhe o arroz e a cenoura.','Junte o frango desfiado de volta e tempere a gosto.']},
  {id:'r62', type:'jantar', name:'Escondidinho de carne moída com mandioquinha', kcal:380, prep:35,
    ingredients:['carne moída magra','mandioquinha cozida e amassada','cebola e alho a gosto','queijo ralado (opcional)'],
    steps:['Refogue a carne moída com cebola e alho.','Coloque numa travessa e cubra com o purê de mandioquinha.','Polvilhe queijo, se quiser, e leve ao forno para gratinar.']},
  {id:'r63', type:'jantar', name:'Creme de abobrinha', kcal:200, prep:25,
    ingredients:['abobrinha em cubos','cebola picada','caldo de legumes ou água','sal e ervas a gosto'],
    steps:['Refogue a cebola e adicione a abobrinha.','Cubra com água ou caldo e cozinhe até ficar macia.','Bata no liquidificador até obter um creme e tempere a gosto.']},
  {id:'r64', type:'jantar', name:'Salada de folhas com ovo e grão de bico', kcal:310, prep:15,
    ingredients:['folhas verdes a gosto','1 ovo cozido','1/2 xícara de grão de bico cozido','azeite e limão'],
    steps:['Monte a base com as folhas verdes.','Adicione o ovo cozido em rodelas e o grão de bico.','Tempere com azeite, limão e sal a gosto.']},

  /* --- Lanche (mais 16) --- */
  {id:'r65', type:'lanche', name:'Banana com canela', kcal:110, prep:2,
    ingredients:['1 banana','canela em pó a gosto'],
    steps:['Corte a banana em rodelas.','Polvilhe canela por cima e sirva.']},
  {id:'r66', type:'lanche', name:'Barrinha de proteína caseira', kcal:170, prep:15,
    ingredients:['1 xícara de aveia','2 colheres (sopa) de pasta de amendoim','1 colher (sopa) de mel','frutas secas picadas (opcional)'],
    steps:['Misture todos os ingredientes numa tigela até formar uma massa uniforme.','Espalhe numa forma pequena forrada e leve à geladeira por 1 hora.','Corte em barrinhas e sirva.']},
  {id:'r67', type:'lanche', name:'Palitos de cenoura com homus', kcal:150, prep:8,
    ingredients:['1 cenoura em palitos','3 colheres (sopa) de homus'],
    steps:['Corte a cenoura em palitos.','Sirva acompanhada do homus para molhar.']},
  {id:'r68', type:'lanche', name:'Queijo cottage com tomate cereja', kcal:130, prep:3,
    ingredients:['3 colheres (sopa) de queijo cottage','5 tomates cereja','orégano a gosto'],
    steps:['Corte os tomates cereja ao meio.','Misture com o queijo cottage numa tigela.','Finalize com orégano a gosto.']},
  {id:'r69', type:'lanche', name:'Mix de frutas secas', kcal:160, prep:1,
    ingredients:['1 punhado pequeno de frutas secas (damasco, ameixa, uva passa)'],
    steps:['Separe uma porção pequena para não exceder as calorias.','Consuma como lanche entre as refeições.']},
  {id:'r70', type:'lanche', name:'Bolinho de banana com aveia', kcal:190, prep:20,
    ingredients:['1 banana amassada','1/2 xícara de aveia em flocos','1 ovo','canela a gosto'],
    steps:['Misture todos os ingredientes até formar uma massa.','Disponha colheradas numa forma untada.','Asse em forno preaquecido a 180°C por cerca de 15 minutos.']},
  {id:'r71', type:'lanche', name:'Torrada com requeijão light', kcal:140, prep:5,
    ingredients:['1 fatia de pão integral','1 colher (sopa) de requeijão light'],
    steps:['Toste a fatia de pão.','Espalhe o requeijão light por cima e sirva.']},
  {id:'r72', type:'lanche', name:'Iogurte com granola e mel', kcal:200, prep:3,
    ingredients:['1 pote de iogurte natural','2 colheres (sopa) de granola sem açúcar','1 colher (chá) de mel'],
    steps:['Coloque o iogurte num pote.','Adicione a granola por cima.','Finalize com um fio de mel.']},
  {id:'r73', type:'lanche', name:'Pipoca sem óleo', kcal:100, prep:8,
    ingredients:['3 colheres (sopa) de milho de pipoca','sal a gosto'],
    steps:['Coloque o milho numa panela com tampa em fogo médio, sem óleo.','Sacuda a panela até parar de estourar.','Tempere com uma pitada de sal.']},
  {id:'r74', type:'lanche', name:'Rap10 com peito de peru', kcal:180, prep:8,
    ingredients:['1 rap10 (tortilha pequena)','2 fatias de peito de peru','folhas de alface','1 colher (chá) de requeijão light'],
    steps:['Passe o requeijão light na tortilha.','Adicione o peito de peru e a alface.','Enrole bem e corte ao meio.']},
  {id:'r75', type:'lanche', name:'Smoothie de morango com iogurte', kcal:170, prep:5,
    ingredients:['1 xícara de morangos','1 pote de iogurte natural','gelo (opcional)'],
    steps:['Coloque os morangos e o iogurte no liquidificador.','Bata até ficar homogêneo.','Sirva gelado.']},
  {id:'r76', type:'lanche', name:'Cenoura baby com molho de iogurte', kcal:120, prep:6,
    ingredients:['1 punhado de cenoura baby','2 colheres (sopa) de iogurte natural','ervas a gosto'],
    steps:['Tempere o iogurte com ervas a gosto para o molho.','Sirva a cenoura baby acompanhada do molho.']},
  {id:'r77', type:'lanche', name:'Bolacha de arroz com pasta de amendoim', kcal:150, prep:2,
    ingredients:['2 bolachas de arroz','1 colher (sopa) de pasta de amendoim integral'],
    steps:['Espalhe a pasta de amendoim sobre as bolachas de arroz.','Sirva na sequência para manter a crocância.']},
  {id:'r78', type:'lanche', name:'Espetinho de frutas', kcal:110, prep:8,
    ingredients:['morango, uva e melão em pedaços','palitos de espetinho'],
    steps:['Corte as frutas em pedaços do mesmo tamanho.','Monte alternando as frutas nos palitos.','Sirva gelado.']},
  {id:'r79', type:'lanche', name:'Chá gelado com limão e hortelã (light)', kcal:20, prep:10,
    ingredients:['1 chá de sua preferência (ex: erva-cidreira)','suco de limão a gosto','folhas de hortelã','gelo'],
    steps:['Prepare o chá e deixe esfriar.','Adicione limão e hortelã.','Sirva com bastante gelo.']},
  {id:'r80', type:'lanche', name:'Mix de castanha e frutas secas', kcal:190, prep:1,
    ingredients:['1 punhado pequeno de castanhas','1 punhado pequeno de frutas secas'],
    steps:['Misture as castanhas com as frutas secas numa porção pequena.','Consuma como lanche entre as refeições principais.']},
];
const MEAL_TYPE_LABELS = {cafe:'Café da manhã', almoco:'Almoço', jantar:'Jantar', lanche:'Lanche'};

/* ============ Biblioteca de Exercícios ============ */
const EXERCISES = [
  {id:'e1', name:'Agachamento livre', group:'Pernas', diff:'iniciante', icon:'🏋️', duration:'3 séries de 12-15 repetições',
    steps:['Fique em pé com os pés na largura dos ombros.','Desça flexionando os joelhos e quadris, como se fosse sentar numa cadeira.','Mantenha as costas retas e o peso nos calcanhares.','Desça até as coxas ficarem paralelas ao chão (ou até onde for confortável).','Suba controladamente voltando à posição inicial.'],
    tip:'Não deixe os joelhos passarem muito da linha da ponta dos pés.'},
  {id:'e2', name:'Prancha abdominal', group:'Core', diff:'iniciante', icon:'🧍', duration:'3 séries, segurando 20-40 segundos',
    steps:['Apoie os antebraços e as pontas dos pés no chão.','Mantenha o corpo alinhado, formando uma linha reta da cabeça aos pés.','Contraia o abdômen e a região lombar.','Respire normalmente e segure a posição pelo tempo definido.'],
    tip:'Evite deixar o quadril subir ou cair — mantenha o corpo alinhado.'},
  {id:'e3', name:'Flexão de braço (pode ser com apoio nos joelhos)', group:'Superior', diff:'iniciante', icon:'💪', duration:'3 séries de 8-12 repetições',
    steps:['Apoie as mãos no chão, um pouco mais largas que os ombros.','Se for mais fácil, apoie os joelhos no chão em vez dos pés.','Desça o corpo flexionando os braços até quase tocar o peito no chão.','Empurre de volta até estender os braços.'],
    tip:'Mantenha o corpo reto — não deixe o quadril cair durante o movimento.'},
  {id:'e4', name:'Polichinelo (jumping jack)', group:'Cardio', diff:'iniciante', icon:'🤸', duration:'3 séries de 30-45 segundos',
    steps:['Fique em pé com os braços ao lado do corpo e pés juntos.','Salte abrindo as pernas e levando os braços para cima ao mesmo tempo.','Salte novamente voltando à posição inicial.','Repita em ritmo constante pelo tempo definido.'],
    tip:'Ótimo para aquecer ou aumentar a frequência cardíaca rapidamente.'},
  {id:'e5', name:'Afundo (passada)', group:'Pernas', diff:'intermediario', icon:'🦵', duration:'3 séries de 10-12 repetições por perna',
    steps:['Fique em pé e dê um passo largo para frente com uma perna.','Desça o corpo até o joelho de trás quase tocar o chão.','Mantenha o joelho da frente alinhado com o tornozelo.','Empurre o corpo de volta à posição inicial e repita com a outra perna.'],
    tip:'Mantenha o tronco erguido durante todo o movimento.'},
  {id:'e6', name:'Abdominal remador', group:'Core', diff:'intermediario', icon:'🧘', duration:'3 séries de 15 repetições',
    steps:['Sente-se com os joelhos flexionados e os pés apoiados no chão.','Incline o tronco levemente para trás, mantendo as costas retas.','Contraia o abdômen e traga os joelhos em direção ao peito.','Volte controladamente à posição inicial.'],
    tip:'Quanto mais reto o tronco, mais o abdômen trabalha.'},
  {id:'e7', name:'Elevação de quadril (ponte)', group:'Glúteos', diff:'iniciante', icon:'🍑', duration:'3 séries de 15 repetições',
    steps:['Deite de costas com os joelhos flexionados e os pés apoiados no chão.','Contraia os glúteos e eleve o quadril até formar uma linha reta com os joelhos e ombros.','Segure por 1-2 segundos no topo.','Desça controladamente e repita.'],
    tip:'Evite arquear demais as costas — o movimento vem do quadril.'},
  {id:'e8', name:'Caminhada rápida ou trote leve', group:'Cardio', diff:'iniciante', icon:'🚶', duration:'20-30 minutos',
    steps:['Escolha um ritmo em que você consiga conversar, mas com um pouco de esforço.','Mantenha a postura ereta e os braços se movendo naturalmente.','Se possível, inclua pequenos trechos em ritmo mais acelerado.','Finalize com uma caminhada leve para desacelerar.'],
    tip:'Uma das formas mais simples e acessíveis de começar a se exercitar.'},
  {id:'e9', name:'Escalador (mountain climber)', group:'Cardio', diff:'intermediario', icon:'⛰️', duration:'3 séries de 30 segundos',
    steps:['Apoie as mãos no chão na posição de prancha alta.','Traga um joelho em direção ao peito e depois volte.','Alterne rapidamente entre as pernas, como se estivesse correndo no lugar.','Mantenha o abdômen contraído durante todo o movimento.'],
    tip:'Ótimo exercício para elevar a frequência cardíaca e trabalhar o core.'},
  {id:'e10', name:'Burpee', group:'Corpo todo', diff:'avancado', icon:'🔥', duration:'3 séries de 8-10 repetições',
    steps:['Comece em pé, agache e apoie as mãos no chão.','Salte os pés para trás, ficando em posição de prancha.','Faça uma flexão (opcional).','Salte os pés de volta para perto das mãos e salte para cima esticando o corpo.'],
    tip:'Exercício intenso — vá no seu ritmo e descanse quando precisar.'},

  /* --- Pernas (mais 8) --- */
  {id:'e11', name:'Agachamento sumô', group:'Pernas', diff:'iniciante', icon:'🏋️', duration:'3 séries de 12-15 repetições',
    steps:['Fique em pé com os pés mais afastados que a largura dos ombros e pontas voltadas para fora.','Desça flexionando os joelhos na direção dos pés, mantendo o tronco ereto.','Desça até as coxas ficarem paralelas ao chão, ou onde for confortável.','Suba controladamente contraindo a parte interna das coxas.'],
    tip:'Mantenha os joelhos alinhados com as pontas dos pés durante todo o movimento.'},
  {id:'e12', name:'Elevação de panturrilha', group:'Pernas', diff:'iniciante', icon:'🦶', duration:'3 séries de 15-20 repetições',
    steps:['Fique em pé, apoiado numa parede ou cadeira para equilíbrio.','Eleve os calcanhares do chão, ficando na ponta dos pés.','Segure por 1 segundo no topo.','Desça controladamente e repita.'],
    tip:'Faça o movimento devagar para sentir bem a contração da panturrilha.'},
  {id:'e13', name:'Cadeira na parede (wall sit)', group:'Pernas', diff:'intermediario', icon:'🪑', duration:'3 séries, segurando 20-40 segundos',
    steps:['Encoste as costas numa parede e deslize para baixo até os joelhos ficarem a 90°.','Mantenha os pés afastados na largura do quadril.','Segure a posição pelo tempo definido, respirando normalmente.','Suba devagar para descansar entre as séries.'],
    tip:'Quanto mais os joelhos se aproximam de 90°, mais desafiador fica.'},
  {id:'e14', name:'Afundo lateral (passada lateral)', group:'Pernas', diff:'intermediario', icon:'🦵', duration:'3 séries de 10-12 repetições por lado',
    steps:['Fique em pé com os pés juntos.','Dê um passo largo para o lado, flexionando o joelho dessa perna e mantendo a outra esticada.','Empurre o quadril para trás, como se fosse sentar.','Volte à posição inicial e repita para o outro lado.'],
    tip:'Mantenha o pé de apoio totalmente no chão durante o movimento.'},
  {id:'e15', name:'Agachamento búlgaro (com apoio)', group:'Pernas', diff:'avancado', icon:'🏋️', duration:'3 séries de 8-10 repetições por perna',
    steps:['Fique de costas para um banco ou cadeira baixa e apoie o peito de um dos pés nele.','Desça o corpo flexionando o joelho da perna da frente.','Desça até a coxa ficar quase paralela ao chão.','Suba controladamente e repita antes de trocar de perna.'],
    tip:'Use um apoio para equilíbrio se precisar — o foco é na perna da frente.'},
  {id:'e16', name:'Elevação de perna lateral em pé', group:'Pernas', diff:'iniciante', icon:'🦵', duration:'3 séries de 15 repetições por perna',
    steps:['Fique em pé, apoiado numa parede ou cadeira.','Eleve uma perna esticada para o lado, mantendo o tronco firme.','Desça controladamente sem tocar o chão totalmente.','Repita e depois troque de perna.'],
    tip:'Evite inclinar o tronco para o lado — o movimento vem só da perna.'},
  {id:'e17', name:'Agachamento com salto (jump squat)', group:'Pernas', diff:'avancado', icon:'🤾', duration:'3 séries de 10-12 repetições',
    steps:['Fique em pé com os pés na largura dos ombros.','Agache como num agachamento normal.','Impulsione o corpo para cima, saltando com força.','Aterrisse suavemente flexionando os joelhos e volte a agachar.'],
    tip:'Aterrisse com cuidado para proteger os joelhos.'},
  {id:'e18', name:'Extensão de perna sentado (isometria)', group:'Pernas', diff:'iniciante', icon:'🪑', duration:'3 séries de 12 repetições por perna',
    steps:['Sente-se numa cadeira com as costas retas.','Estique uma perna até ficar paralela ao chão.','Segure por 2 segundos contraindo a coxa.','Desça controladamente e repita antes de trocar de perna.'],
    tip:'Ótimo exercício para fortalecer o joelho sem impacto.'},

  /* --- Core (mais 8) --- */
  {id:'e19', name:'Prancha lateral', group:'Core', diff:'intermediario', icon:'🧍', duration:'3 séries, segurando 20-30 segundos por lado',
    steps:['Deite de lado apoiando o antebraço no chão, cotovelo abaixo do ombro.','Eleve o quadril, formando uma linha reta da cabeça aos pés.','Contraia o abdômen e segure a posição.','Repita do outro lado.'],
    tip:'Se for muito difícil, apoie o joelho de baixo no chão para reduzir a intensidade.'},
  {id:'e20', name:'Abdominal bicicleta', group:'Core', diff:'intermediario', icon:'🚴', duration:'3 séries de 15-20 repetições por lado',
    steps:['Deite de costas com as mãos atrás da cabeça.','Eleve as pernas e simule um movimento de pedalada.','Leve o cotovelo em direção ao joelho oposto a cada pedalada.','Mantenha o movimento controlado e contínuo.'],
    tip:'Evite puxar o pescoço com as mãos — o esforço deve vir do abdômen.'},
  {id:'e21', name:'Elevação de pernas deitado', group:'Core', diff:'intermediario', icon:'🧘', duration:'3 séries de 12-15 repetições',
    steps:['Deite de costas com as pernas esticadas e mãos ao lado do corpo.','Eleve as pernas juntas até formarem um ângulo de 90° com o chão.','Desça controladamente sem tocar o chão totalmente.','Repita o movimento.'],
    tip:'Mantenha a lombar pressionada contra o chão durante todo o exercício.'},
  {id:'e22', name:'Prancha com toque no ombro', group:'Core', diff:'intermediario', icon:'🧍', duration:'3 séries de 12-16 toques',
    steps:['Fique na posição de prancha alta, com as mãos apoiadas no chão.','Toque o ombro oposto com uma mão, alternando os lados.','Mantenha o quadril o mais estável possível.','Continue alternando pelo tempo ou repetições definidas.'],
    tip:'Afaste um pouco mais os pés se estiver difícil manter o equilíbrio.'},
  {id:'e23', name:'Abdominal infra (canivete)', group:'Core', diff:'avancado', icon:'🤸', duration:'3 séries de 10-12 repetições',
    steps:['Deite de costas com braços e pernas esticados.','Eleve simultaneamente o tronco e as pernas, tentando tocar os pés com as mãos.','Desça controladamente de volta à posição inicial.','Repita o movimento.'],
    tip:'Movimento avançado — mantenha o controle em vez de usar embalo.'},
  {id:'e24', name:'Superman', group:'Core', diff:'iniciante', icon:'🦸', duration:'3 séries de 12-15 repetições',
    steps:['Deite de bruços com braços e pernas esticados.','Eleve simultaneamente braços, peito e pernas do chão.','Segure por 1-2 segundos contraindo a lombar e os glúteos.','Desça controladamente e repita.'],
    tip:'Ótimo para fortalecer a lombar e melhorar a postura.'},
  {id:'e25', name:'Rotação de tronco (russian twist)', group:'Core', diff:'intermediario', icon:'🔄', duration:'3 séries de 16-20 repetições',
    steps:['Sente-se com os joelhos flexionados, inclinando o tronco levemente para trás.','Junte as mãos na frente do corpo.','Gire o tronco de um lado para o outro, tocando o chão ao lado do quadril.','Mantenha o abdômen contraído durante todo o movimento.'],
    tip:'Para aumentar a dificuldade, eleve os pés do chão.'},
  {id:'e26', name:'Prancha dinâmica (subida e descida)', group:'Core', diff:'intermediario', icon:'🧍', duration:'3 séries de 10-12 repetições',
    steps:['Comece na posição de prancha com os antebraços apoiados.','Suba para a posição de prancha alta, apoiando uma mão de cada vez.','Desça novamente para os antebraços, uma mão de cada vez.','Alterne a mão que inicia o movimento a cada repetição.'],
    tip:'Mantenha o quadril firme, sem balançar de um lado para o outro.'},

  /* --- Superior (mais 9) --- */
  {id:'e27', name:'Flexão diamante', group:'Superior', diff:'avancado', icon:'💪', duration:'3 séries de 6-10 repetições',
    steps:['Apoie as mãos no chão formando um triângulo (diamante) com os polegares e indicadores.','Se for mais fácil, apoie os joelhos no chão.','Desça o corpo flexionando os braços, focando no tríceps.','Empurre de volta até estender os braços.'],
    tip:'Exercício mais avançado que a flexão tradicional — foca bastante o tríceps.'},
  {id:'e28', name:'Tríceps no banco (mergulho)', group:'Superior', diff:'intermediario', icon:'💪', duration:'3 séries de 10-12 repetições',
    steps:['Sente na borda de um banco ou cadeira firme, com as mãos apoiadas ao lado do corpo.','Deslize o quadril para fora do banco, mantendo as mãos apoiadas.','Desça o corpo flexionando os cotovelos para trás.','Empurre de volta até estender os braços.'],
    tip:'Quanto mais afastados os pés, mais intenso fica o exercício.'},
  {id:'e29', name:'Rosca direta com halteres', group:'Superior', diff:'iniciante', icon:'🏋️', duration:'3 séries de 12-15 repetições',
    steps:['Fique em pé segurando um halter (ou garrafa de água) em cada mão.','Mantenha os cotovelos junto ao corpo.','Flexione os braços trazendo os halteres em direção aos ombros.','Desça controladamente e repita.'],
    tip:'Evite balançar o corpo para embalar o movimento.'},
  {id:'e30', name:'Elevação lateral de ombro', group:'Superior', diff:'iniciante', icon:'🏋️', duration:'3 séries de 12-15 repetições',
    steps:['Fique em pé com um halter leve (ou garrafa) em cada mão ao lado do corpo.','Eleve os braços lateralmente até a altura dos ombros.','Segure por 1 segundo no topo.','Desça controladamente e repita.'],
    tip:'Use pesos leves — o importante é a execução controlada, não a carga.'},
  {id:'e31', name:'Remada curvada com halteres', group:'Superior', diff:'intermediario', icon:'🏋️', duration:'3 séries de 12 repetições',
    steps:['Incline o tronco para frente mantendo as costas retas, joelhos levemente flexionados.','Segure um halter (ou garrafa) em cada mão, braços estendidos.','Puxe os cotovelos para trás, aproximando os halteres do abdômen.','Desça controladamente e repita.'],
    tip:'Mantenha a coluna neutra durante todo o movimento para proteger a lombar.'},
  {id:'e32', name:'Desenvolvimento de ombro com halteres', group:'Superior', diff:'intermediario', icon:'🏋️', duration:'3 séries de 10-12 repetições',
    steps:['Sente-se ou fique em pé segurando um halter em cada mão na altura dos ombros.','Empurre os halteres para cima até estender os braços.','Desça controladamente até a altura dos ombros novamente.','Repita o movimento.'],
    tip:'Evite arquear demais as costas ao empurrar o peso para cima.'},
  {id:'e33', name:'Flexão inclinada (mãos elevadas)', group:'Superior', diff:'iniciante', icon:'💪', duration:'3 séries de 10-12 repetições',
    steps:['Apoie as mãos numa superfície elevada, como um banco ou sofá firme.','Mantenha o corpo alinhado da cabeça aos pés.','Desça o peito em direção à superfície, flexionando os braços.','Empurre de volta até estender os braços.'],
    tip:'Quanto mais alta a superfície, mais fácil fica o exercício — ótimo para começar.'},
  {id:'e34', name:'Rosca martelo com halteres', group:'Superior', diff:'iniciante', icon:'🏋️', duration:'3 séries de 12-15 repetições',
    steps:['Fique em pé segurando um halter em cada mão, palmas voltadas para o corpo.','Mantenha os cotovelos junto ao corpo.','Flexione os braços trazendo os halteres em direção aos ombros.','Desça controladamente e repita.'],
    tip:'Essa variação trabalha também o antebraço, além do bíceps.'},
  {id:'e35', name:'Puxada com elástico (banda elástica)', group:'Superior', diff:'intermediario', icon:'💪', duration:'3 séries de 12-15 repetições',
    steps:['Prenda a banda elástica numa porta ou estrutura firme, na altura do peito.','Segure as pontas e afaste-se até sentir tensão no elástico.','Puxe os cotovelos para trás, aproximando as escápulas.','Retorne controladamente e repita.'],
    tip:'Ótima alternativa para trabalhar as costas sem equipamentos pesados.'},

  /* --- Cardio (mais 7) --- */
  {id:'e36', name:'Corrida estacionária (high knees)', group:'Cardio', diff:'intermediario', icon:'🏃', duration:'3 séries de 30-40 segundos',
    steps:['Fique em pé e comece a correr no lugar.','Eleve os joelhos o mais alto possível a cada passada.','Mantenha os braços se movendo em ritmo com as pernas.','Continue no ritmo definido pelo tempo estabelecido.'],
    tip:'Ótimo para elevar rápido a frequência cardíaca em pouco espaço.'},
  {id:'e37', name:'Pular corda', group:'Cardio', diff:'intermediario', icon:'🪢', duration:'3 séries de 45-60 segundos',
    steps:['Segure a corda com as mãos na altura do quadril.','Gire a corda e pule com os dois pés juntos, saltos pequenos.','Mantenha um ritmo constante, aterrissando na ponta dos pés.','Descanse entre as séries se necessário.'],
    tip:'Comece devagar até pegar o ritmo, evitando saltos muito altos.'},
  {id:'e38', name:'Subida no step ou banco', group:'Cardio', diff:'iniciante', icon:'🪜', duration:'3 séries de 12-15 repetições por perna',
    steps:['Fique em frente a um degrau, banco baixo ou step firme.','Suba com uma perna, apoiando o pé completo no degrau.','Suba o corpo até ficar em pé sobre o degrau.','Desça controladamente e repita, alternando a perna que inicia o movimento.'],
    tip:'Use um degrau estável e com altura confortável para evitar quedas.'},
  {id:'e39', name:'Agachamento com salto lateral (skater jump)', group:'Cardio', diff:'avancado', icon:'⛸️', duration:'3 séries de 10-12 repetições por lado',
    steps:['Fique em pé e salte lateralmente com uma perna, cruzando a outra por trás.','Aterrisse suavemente flexionando o joelho.','Impulsione para o lado oposto e repita.','Mantenha o equilíbrio e o core contraído durante o movimento.'],
    tip:'Excelente para trabalhar agilidade e equilíbrio lateral.'},
  {id:'e40', name:'Bicicleta (ergométrica ou ao ar livre)', group:'Cardio', diff:'iniciante', icon:'🚴', duration:'20-30 minutos',
    steps:['Ajuste o banco na altura adequada para os joelhos.','Comece pedalando num ritmo confortável para aquecer.','Aumente a intensidade gradualmente, se possível.','Finalize com alguns minutos em ritmo leve para desacelerar.'],
    tip:'Boa opção de baixo impacto para as articulações.'},
  {id:'e41', name:'Dança aeróbica livre', group:'Cardio', diff:'iniciante', icon:'💃', duration:'20-30 minutos',
    steps:['Escolha uma música animada de sua preferência.','Movimente o corpo livremente, elevando os braços e as pernas.','Mantenha o ritmo constante, aumentando a intensidade aos poucos.','Finalize desacelerando os movimentos.'],
    tip:'Uma forma divertida de fazer cardio sem parecer treino.'},
  {id:'e42', name:'Circuito curto em intervalos (tabata)', group:'Cardio', diff:'avancado', icon:'⏱️', duration:'4 minutos (20s trabalho / 10s descanso, 8 rounds)',
    steps:['Escolha um exercício simples, como polichinelo ou corrida no lugar.','Execute em alta intensidade por 20 segundos.','Descanse por 10 segundos.','Repita o ciclo por 8 rounds (4 minutos no total).'],
    tip:'Treino curto e intenso — ótimo quando o tempo está corrido.'},

  /* --- Glúteos (mais 9) --- */
  {id:'e43', name:'Ponte unilateral', group:'Glúteos', diff:'intermediario', icon:'🍑', duration:'3 séries de 10-12 repetições por perna',
    steps:['Deite de costas com os joelhos flexionados e pés apoiados no chão.','Estenda uma perna, mantendo a coxa alinhada com a outra.','Eleve o quadril contraindo o glúteo da perna de apoio.','Desça controladamente e repita antes de trocar de perna.'],
    tip:'Mantenha o quadril nivelado, sem deixar um lado cair.'},
  {id:'e44', name:'Coice de glúteo (kickback)', group:'Glúteos', diff:'iniciante', icon:'🍑', duration:'3 séries de 15 repetições por perna',
    steps:['Fique em quatro apoios, mãos e joelhos no chão.','Mantenha o joelho flexionado a 90° e empurre uma perna para trás e para cima.','Contraia o glúteo no topo do movimento.','Desça controladamente e repita antes de trocar de perna.'],
    tip:'Evite arquear a lombar — o movimento deve vir do quadril.'},
  {id:'e45', name:'Elevação de perna em quatro apoios (donkey kick)', group:'Glúteos', diff:'iniciante', icon:'🍑', duration:'3 séries de 15 repetições por perna',
    steps:['Fique em quatro apoios, mãos alinhadas com os ombros.','Eleve uma perna para trás mantendo o joelho flexionado a 90°.','Contraia o glúteo no topo, sem elevar além do quadril.','Desça controladamente e repita antes de trocar de perna.'],
    tip:'Mantenha o abdômen contraído para proteger a lombar.'},
  {id:'e46', name:'Agachamento sumô com pulso', group:'Glúteos', diff:'intermediario', icon:'🏋️', duration:'3 séries de 15 repetições',
    steps:['Fique num agachamento sumô, pés afastados e pontas para fora.','Na posição baixa, faça pequenos pulsos subindo e descendo alguns centímetros.','Mantenha o tronco ereto durante os pulsos.','Depois de várias repetições, suba totalmente para descansar.'],
    tip:'Os pulsos aumentam bastante o tempo de tensão no glúteo.'},
  {id:'e47', name:'Concha (clamshell)', group:'Glúteos', diff:'iniciante', icon:'🐚', duration:'3 séries de 15 repetições por lado',
    steps:['Deite de lado com os joelhos flexionados e um em cima do outro.','Mantenha os pés juntos e eleve o joelho de cima, como uma concha abrindo.','Segure por 1 segundo no topo.','Desça controladamente e repita antes de trocar de lado.'],
    tip:'Excelente para ativar o glúteo médio, importante para a estabilidade do quadril.'},
  {id:'e48', name:'Passada com elevação de joelho', group:'Glúteos', diff:'intermediario', icon:'🦵', duration:'3 séries de 10 repetições por perna',
    steps:['Dê um passo à frente como num afundo.','Ao subir, eleve o joelho da perna de trás em direção ao peito.','Equilibre-se por um instante.','Volte à posição inicial e repita, alternando as pernas.'],
    tip:'Movimento combinado que trabalha glúteo, equilíbrio e core ao mesmo tempo.'},
  {id:'e49', name:'Abdução de quadril deitado de lado', group:'Glúteos', diff:'iniciante', icon:'🦵', duration:'3 séries de 15 repetições por lado',
    steps:['Deite de lado com as pernas esticadas, uma sobre a outra.','Eleve a perna de cima mantendo-a esticada.','Segure por 1 segundo no topo.','Desça controladamente e repita antes de trocar de lado.'],
    tip:'Evite girar o quadril para trás — mantenha o corpo alinhado.'},
  {id:'e50', name:'Ponte com pés elevados', group:'Glúteos', diff:'avancado', icon:'🍑', duration:'3 séries de 15 repetições',
    steps:['Deite de costas e apoie os pés numa superfície elevada, como um banco ou sofá.','Eleve o quadril contraindo os glúteos até o corpo formar uma linha reta.','Segure por 1-2 segundos no topo.','Desça controladamente e repita.'],
    tip:'A elevação dos pés aumenta a amplitude e a intensidade do exercício.'},
  {id:'e51', name:'Agachamento com elástico nas pernas', group:'Glúteos', diff:'intermediario', icon:'🏋️', duration:'3 séries de 15 repetições',
    steps:['Posicione uma banda elástica ao redor das coxas, logo acima dos joelhos.','Fique em pé com os pés na largura do quadril, joelhos levemente para fora.','Agache mantendo a tensão do elástico, sem deixar os joelhos fecharem.','Suba controladamente e repita.'],
    tip:'O elástico ajuda a ativar ainda mais o glúteo médio durante o movimento.'},

  /* --- Corpo todo (mais 9) --- */
  {id:'e52', name:'Mountain climber cruzado', group:'Corpo todo', diff:'intermediario', icon:'⛰️', duration:'3 séries de 30 segundos',
    steps:['Apoie as mãos no chão na posição de prancha alta.','Traga um joelho em direção ao cotovelo oposto.','Volte à posição inicial e repita com a outra perna.','Mantenha o ritmo constante durante o tempo definido.'],
    tip:'Além do cardio, esse movimento trabalha bastante o core por causa da rotação.'},
  {id:'e53', name:'Agachamento com desenvolvimento de ombro', group:'Corpo todo', diff:'intermediario', icon:'🏋️', duration:'3 séries de 12 repetições',
    steps:['Fique em pé segurando um halter em cada mão na altura dos ombros.','Agache normalmente, mantendo os halteres parados.','Ao subir do agachamento, empurre os halteres para cima, estendendo os braços.','Desça os halteres e repita o movimento combinado.'],
    tip:'Movimento composto que trabalha pernas e ombros ao mesmo tempo, economizando tempo de treino.'},
  {id:'e54', name:'Afundo com rotação de tronco', group:'Corpo todo', diff:'intermediario', icon:'🔄', duration:'3 séries de 10 repetições por lado',
    steps:['Dê um passo à frente como num afundo tradicional.','Na posição baixa, gire o tronco na direção da perna da frente.','Volte o tronco ao centro e suba à posição inicial.','Repita, alternando as pernas.'],
    tip:'Trabalha pernas, glúteos e o core com o movimento de rotação.'},
  {id:'e55', name:'Prancha com puxada (remada renegade)', group:'Corpo todo', diff:'avancado', icon:'🧍', duration:'3 séries de 8-10 repetições por lado',
    steps:['Fique na posição de prancha alta, com um halter em cada mão apoiado no chão.','Puxe um halter em direção às costelas, mantendo o quadril estável.','Desça o halter e repita do outro lado.','Alterne os lados mantendo o core sempre contraído.'],
    tip:'Movimento avançado — mantenha o quadril o mais parado possível para não perder o equilíbrio.'},
  {id:'e56', name:'Burpee sem salto (versão iniciante)', group:'Corpo todo', diff:'iniciante', icon:'🔥', duration:'3 séries de 8-10 repetições',
    steps:['Comece em pé, agache e apoie as mãos no chão.','Leve os pés para trás, um de cada vez, até a posição de prancha.','Volte os pés para perto das mãos, um de cada vez.','Suba até ficar em pé novamente, sem saltar.'],
    tip:'Ótima forma de começar a praticar o burpee antes de adicionar o salto.'},
  {id:'e57', name:'Circuito funcional (agachamento + flexão + prancha)', group:'Corpo todo', diff:'avancado', icon:'🔁', duration:'3 rounds do circuito completo',
    steps:['Faça 10 agachamentos livres.','Em seguida, 8 flexões de braço (pode ser com apoio nos joelhos).','Finalize segurando uma prancha por 20-30 segundos.','Descanse 1 minuto entre os rounds e repita.'],
    tip:'Um treino completo em poucos minutos, trabalhando pernas, superior e core.'},
  {id:'e58', name:'Escalador lento com toque no ombro', group:'Corpo todo', diff:'intermediario', icon:'⛰️', duration:'3 séries de 12 repetições por lado',
    steps:['Fique na posição de prancha alta.','Traga um joelho em direção ao peito, devagar e controlado.','Volte à posição inicial e toque o ombro oposto com a mão.','Repita alternando pernas e mãos.'],
    tip:'Versão mais lenta e controlada do escalador, ótima para focar na estabilidade.'},
  {id:'e59', name:'Levantamento terra com halteres', group:'Corpo todo', diff:'intermediario', icon:'🏋️', duration:'3 séries de 10-12 repetições',
    steps:['Fique em pé segurando um halter em cada mão à frente das coxas.','Incline o tronco para frente, empurrando o quadril para trás, mantendo as costas retas.','Desça os halteres próximos às pernas até sentir alongar a parte de trás da coxa.','Suba controladamente contraindo glúteos e pernas.'],
    tip:'Mantenha a coluna sempre neutra — evite arredondar as costas durante o movimento.'},
  {id:'e60', name:'Agachamento com flexão (squat thrust)', group:'Corpo todo', diff:'avancado', icon:'🔥', duration:'3 séries de 10 repetições',
    steps:['Comece em pé, agache e apoie as mãos no chão.','Leve os pés para trás até a posição de prancha.','Faça uma flexão de braço.','Volte os pés para perto das mãos e suba até ficar em pé.'],
    tip:'Basicamente um burpee sem o salto final — ainda assim bem intenso.'},
];

/* ============ Assistente (dicas baseadas nos dados) ============ */
function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

function daysSince(dateKey){
  if(!dateKey) return null;
  const a = keyToDate(dateKey), b = keyToDate(todayKey());
  return Math.round((b-a)/86400000);
}
function backupOverdue(){
  const accountDays = daysSince(db.createdAt) || 0;
  if(accountDays<7) return false; // dá tempo pro usuário se ambientar
  if(!db.lastBackupAt) return true;
  return daysSince(db.lastBackupAt) >= 30;
}
function backupStatusText(){
  if(!db.lastBackupAt) return backupOverdue() ? '⚠️ Você nunca fez backup — seus dados só existem neste aparelho' : 'Salva um arquivo .json com todos os dados';
  const d = daysSince(db.lastBackupAt);
  if(d===0) return 'Último backup: hoje';
  if(backupOverdue()) return `⚠️ Último backup há ${d} dias — considere exportar de novo`;
  return `Último backup há ${d} dia(s)`;
}
function lastLoggedWeightDate(){
  const w = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);
  return w.length ? w[w.length-1].date : null;
}
function lastLoggedMealDate(){
  const keys = Object.keys(db.meals).filter(k=>(db.meals[k]||[]).length>0).sort();
  return keys.length ? keys[keys.length-1] : null;
}
function hasAnyActivity(k){
  return !!( (db.water[k]&&db.water[k]>0) || (db.meals[k]&&db.meals[k].length>0) ||
    db.weights.some(w=>w.date===k) || Object.values(db.habitLogs[k]||{}).some(Boolean) ||
    db.sleep[k] || db.mood[k] );
}
function activityStreak(){
  let count=0, cursor=todayKey();
  if(!hasAnyActivity(cursor)) cursor = addDaysKey(cursor,-1);
  while(hasAnyActivity(cursor)){ count++; cursor = addDaysKey(cursor,-1); }
  return count;
}
function riskAlerts(){
  const alerts = [];
  const lw = lastLoggedWeightDate();
  if(lw){
    const d = daysSince(lw);
    if(d>=10) alerts.push(`Você ficou ${d} dias sem registrar seu peso. Que tal atualizar agora na aba Peso? 📉`);
  }
  const lm = lastLoggedMealDate();
  if(db.weights.length>0 || Object.keys(db.meals).length>0){
    const d = lm ? daysSince(lm) : 999;
    if(d>=5) alerts.push(`Faz ${d>=999?'alguns':d} dias que você não registra refeições. Registrar ajuda o Leve a te dar dicas melhores. 🍽️`);
  }
  const last7 = last7Keys();
  const waterDays = last7.filter(k=>(db.water[k]||0)>0).length;
  if(waterDays<=1 && db.weights.length>0){
    alerts.push("Você quase não registrou água essa semana. Beber o suficiente ajuda bastante no processo. 💧");
  }
  // Compromissos próximos (hoje ou amanhã)
  const t = todayKey(), tmr = addDaysKey(t,1);
  const soon = db.appointments.filter(a=>!a.done && (a.date===t || a.date===tmr));
  soon.forEach(a=>{
    const typeLabel = (APPT_TYPES[a.type]||{label:a.type}).label;
    alerts.push(`Você tem ${typeLabel.toLowerCase()}${a.title?' — '+a.title:''} ${a.date===t?'hoje':'amanhã'}${a.time?' às '+a.time:''}. Não esqueça! 📅`);
  });
  // Medicamentos não tomados hoje
  const activeMeds = db.medications.filter(m=>m.active!==false);
  if(activeMeds.length>0){
    const notTaken = activeMeds.filter(m=>!((db.medLogs[t]||{})[m.id]));
    if(notTaken.length>0 && notTaken.length===activeMeds.length){
      alerts.push(`Você ainda não marcou seus medicamentos de hoje. Não esqueça de tomá-los no horário. 💊`);
    }
  }
  // Jejum em andamento
  if(db.fasting.active){
    const a = db.fasting.active;
    const elapsed = Date.now()-a.startAt;
    const goalMs = a.goalHours*3600*1000;
    const overMs = elapsed-goalMs;
    if(overMs > 2*3600*1000){
      alerts.push(`Seu jejum já passou ${fmtDuration(overMs)} da meta de ${a.goalHours}h. Considere encerrar com uma refeição leve na aba Jejum. ⚠️`);
    } else if(elapsed >= goalMs*0.9 && elapsed < goalMs){
      alerts.push(`Você está quase completando seu jejum de ${a.goalHours}h. Continue firme! ⏳`);
    }
  }
  return alerts;
}
function objectivePhrase(){
  const o = db.profile.objective;
  if(o==='ganhar_massa') return "Como seu foco é ganhar massa, o mais importante aqui é a consistência no treino e nas refeições — não se preocupe se o ponteiro da balança subir um pouco.";
  if(o==='controlar_diabetes') return "Como seu foco é controlar a diabetes, priorize refeições regulares e evite pular horários — isso ajuda a manter a glicemia mais estável.";
  if(o==='controlar_pressao') return "Como seu foco é controlar a pressão, reduzir sal e manter a rotina de exercícios leves faz bastante diferença.";
  if(o==='habitos_saudaveis') return "Seu foco é construir hábitos saudáveis — pequenas ações repetidas todos os dias importam mais do que resultados rápidos.";
  return null;
}
function generateCoachTips(){
  const tips = [];
  const t = todayKey();
  const w = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);

  // Alertas de risco (prioridade)
  riskAlerts().forEach(a=>tips.push(a));

  // Peso
  if(w.length===0){
    tips.push("Registre seu peso na aba Peso para eu começar a acompanhar sua evolução por aqui. 📈");
  } else if(w.length>=2){
    const last14 = w.filter(x=>x.date>=addDaysKey(t,-13));
    if(last14.length>=2){
      const delta = last14[last14.length-1].value - last14[0].value;
      if(delta <= -0.3){
        tips.push(`Você perdeu ${fmtNum(Math.abs(delta),1)} kg nos últimos ${last14.length} registros. Continue assim! 🎉`);
      } else if(delta >= 0.3){
        tips.push(`Seu peso subiu ${fmtNum(delta,1)} kg recentemente. Vale revisar a alimentação e a rotina de treinos dos últimos dias.`);
      } else {
        tips.push("Seu peso está estável nos últimos registros. Pequenos ajustes na rotina podem ajudar a retomar a evolução.");
      }
    }
  }

  // Água
  const last7 = last7Keys();
  const waterAvg = avg(last7.map(k=>db.water[k]||0));
  const waterGoal = db.profile.waterGoalMl || 2000;
  if(waterAvg < waterGoal*0.7){
    tips.push(`Sua média de água na última semana foi ${fmtNum(Math.round(waterAvg))} ml — abaixo da sua meta de ${fmtNum(waterGoal)} ml. Tente deixar uma garrafa sempre visível para lembrar de beber mais.`);
  } else {
    tips.push("Sua hidratação está indo bem essa semana. 💧");
  }

  // Calorias
  if(db.profile.calorieGoal){
    const kcalDays = last7.map(k=>{
      const meals = db.meals[k]||[];
      return meals.reduce((s,m)=>s+(Number(m.kcal)||0),0);
    }).filter(v=>v>0);
    if(kcalDays.length>0){
      const kcalAvg = avg(kcalDays);
      if(kcalAvg > db.profile.calorieGoal*1.1){
        tips.push(`Sua média de calorias essa semana (${fmtNum(Math.round(kcalAvg))} kcal) ficou acima da sua meta. Dá uma olhada nas receitas de lanche e café da manhã — costumam ter opções mais leves.`);
      } else {
        tips.push("Suas calorias estão dentro (ou perto) da meta definida. Bom trabalho!");
      }
    }
  }

  // Treino
  const workoutDoneDays = last7.filter(k => (db.habitLogs[k]||{}).__workout).length;
  if(workoutDoneDays===0){
    tips.push("Você ainda não registrou treinos essa semana. Que tal escolher um exercício simples na aba Treino para começar hoje?");
  } else if(workoutDoneDays>=4){
    tips.push(`Você treinou ${workoutDoneDays} dias essa semana. Ótima consistência! 💪`);
  } else {
    tips.push(`Você treinou ${workoutDoneDays} dia(s) essa semana. Se conseguir, tente adicionar mais um dia de atividade.`);
  }

  // Hábitos
  if(db.habits.length>0){
    const doneToday = db.habits.filter(h=>(db.habitLogs[t]||{})[h.id]).length;
    if(doneToday===db.habits.length){
      tips.push("Você completou todos os seus hábitos de hoje. Excelente! ✅");
    }
  }

  // Sono
  const sleepDays = last7.map(k=>db.sleep[k]).filter(Boolean);
  if(sleepDays.length>=3){
    const sleepAvg = avg(sleepDays.map(s=>s.hours));
    if(sleepAvg<6){
      tips.push(`Sua média de sono essa semana foi de ${fmtNum(sleepAvg,1)}h. Dormir pouco aumenta a fome e dificulta manter a rotina — tente dormir um pouco mais cedo.`);
    } else if(sleepAvg>=7){
      tips.push(`Sua média de sono essa semana (${fmtNum(sleepAvg,1)}h) está boa. Isso ajuda bastante no seu progresso. 😴`);
    }
  }

  // Personalização por objetivo (uma vez, no fim)
  const op = objectivePhrase();
  if(op) tips.push(op);

  return tips.slice(0,4);
}

/* ============ Coach por aba ============ */
function coachTipForTab(tab){
  const t = todayKey();
  const o = db.profile.objective;
  if(tab==='peso'){
    const w = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);
    if(w.length===0) return "Ainda não há registros aqui. Registre seu peso hoje para eu começar a acompanhar sua evolução.";
    const last = w[w.length-1];
    if(db.profile.weightGoal!=null){
      const diff = last.value - db.profile.weightGoal;
      if(Math.abs(diff)<0.3) return "Você está muito perto (ou já bateu) da sua meta de peso! 🎉";
      if(o==='ganhar_massa') return "Lembre-se: no ganho de massa, oscilações para cima na balança fazem parte do processo — olhe também para as medidas.";
      return diff>0 ? `Faltam ${fmtNum(diff,1)} kg para sua meta. Continue no ritmo.` : "Você já está abaixo da sua meta — hora de pensar em manutenção.";
    }
    return "Defina uma meta de peso em Ajustes para eu poder te mostrar sua evolução até lá.";
  }
  if(tab==='agua'){
    const today = db.water[t]||0;
    const goal = db.profile.waterGoalMl || 2000;
    if(today>=goal) return "Você já bateu sua meta de água hoje. Mandou bem! 💧";
    const falta = goal-today;
    return `Faltam ${fmtNum(falta)} ml para sua meta de hoje. A água ajuda no metabolismo e reduz a fome falsa.`;
  }
  if(tab==='comida'){
    if(o==='controlar_diabetes') return "Priorize refeições em horários regulares e prefira carboidratos integrais — ajuda a manter a glicemia mais estável ao longo do dia.";
    if(o==='controlar_pressao') return "Fique de olho no sal dos temperos prontos e embutidos — pequenas trocas fazem diferença na pressão.";
    if(db.profile.calorieGoal){
      const mealsToday = db.meals[t]||[];
      const kcalToday = mealsToday.reduce((s,m)=>s+(Number(m.kcal)||0),0);
      const falta = db.profile.calorieGoal - kcalToday;
      if(falta<0) return `Você já passou ${fmtNum(Math.abs(falta))} kcal da sua meta hoje. Sem culpa — só ajuste a próxima refeição.`;
      return `Ainda restam cerca de ${fmtNum(falta)} kcal na sua meta de hoje.`;
    }
    return "Registrar suas refeições ajuda o Leve a entender seus hábitos e sugerir trocas melhores.";
  }
  if(tab==='treino'){
    const streak = habitStreak('__workout');
    if(streak>=3) return `Você está com ${streak} dias seguidos de treino. Constância é o que mais importa aqui! 🔥`;
    if(o==='ganhar_massa') return "Para ganho de massa, dê preferência aos exercícios de força (Superior, Pernas, Core) e descanse bem entre os treinos.";
    return "Comece com exercícios simples, sem equipamento — o importante é criar o hábito antes de aumentar a intensidade.";
  }
  if(tab==='habitos'){
    if(db.habits.length===0) return "Crie hábitos pequenos e específicos, como 'beber água ao acordar' — são mais fáceis de manter todos os dias.";
    const doneToday = db.habits.filter(h=>(db.habitLogs[t]||{})[h.id]).length;
    if(doneToday===db.habits.length) return "Todos os hábitos de hoje concluídos. Isso é o que constrói resultado no longo prazo! ✅";
    return `Você já completou ${doneToday} de ${db.habits.length} hábitos hoje. Falta pouco.`;
  }
  return null;
}

/* ============ Conquistas / medalhas ============ */
function totalWeightLost(){
  const w = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);
  if(w.length<2) return 0;
  const first = w[0].value, last = w[w.length-1].value;
  return Math.max(0, first-last);
}
function computeBadges(){
  const lost = totalWeightLost();
  const streak = activityStreak();
  const accountDays = Math.max(0, daysSince(db.createdAt)||0);
  const waterGoal = db.profile.waterGoalMl || 2000;
  const hitWaterGoal = Object.values(db.water).some(v=>v>=waterGoal);
  const workedOut = Object.values(db.habitLogs).some(l=>l && l.__workout);
  const lastWeight = db.weights.length ? db.weights[db.weights.length-1].value : null;
  const sortedWeights = db.weights.slice().sort((a,b)=> a.date<b.date?-1:1);
  const firstWeight = sortedWeights.length ? sortedWeights[0].value : null;
  const lastWeightByDate = sortedWeights.length ? sortedWeights[sortedWeights.length-1].value : null;
  const goalReached = lastWeightByDate!=null && firstWeight!=null && db.profile.weightGoal!=null && (
    (firstWeight >= db.profile.weightGoal && lastWeightByDate <= db.profile.weightGoal) ||
    (firstWeight <= db.profile.weightGoal && lastWeightByDate >= db.profile.weightGoal)
  );
  const challengeCompleted = db.challenges.some(c=>c.status==='completed');
  return [
    {id:'b_first_weight', icon:'🥇', label:'Primeiro registro', desc:'Registrou o primeiro peso', earned: db.weights.length>=1},
    {id:'b_first_water', icon:'💧', label:'Primeiro litro', desc:'Bateu a meta de água em um dia', earned: hitWaterGoal},
    {id:'b_first_workout', icon:'🏋️', label:'Primeiro treino', desc:'Marcou um treino como concluído', earned: workedOut},
    {id:'b_first_habit', icon:'✅', label:'Primeiro hábito', desc:'Criou seu primeiro hábito', earned: db.habits.length>=1},
    {id:'b_first_challenge', icon:'🏅', label:'Primeiro desafio', desc:'Concluiu um desafio inteiro', earned: challengeCompleted},
    {id:'b_streak7', icon:'🔥', label:'7 dias seguidos', desc:'Sequência de 7 dias de uso', earned: streak>=7},
    {id:'b_streak30', icon:'🔥', label:'30 dias seguidos', desc:'Sequência de 30 dias de uso', earned: streak>=30},
    {id:'b_kg1', icon:'⚖️', label:'Primeiro quilo', desc:'Perdeu o primeiro kg', earned: lost>=1},
    {id:'b_kg5', icon:'🏅', label:'5 kg perdidos', desc:'Perdeu 5 kg no total', earned: lost>=5},
    {id:'b_kg10', icon:'🏆', label:'10 kg perdidos', desc:'Perdeu 10 kg no total', earned: lost>=10},
    {id:'b_kg20', icon:'👑', label:'20 kg perdidos', desc:'Perdeu 20 kg no total', earned: lost>=20},
    {id:'b_goal', icon:'🎯', label:'Meta atingida', desc:'Chegou ao peso que definiu como meta', earned: goalReached},
    {id:'b_week1', icon:'📅', label:'Primeira semana', desc:'1 semana usando o Leve', earned: accountDays>=7},
    {id:'b_month1', icon:'🎉', label:'Primeiro mês', desc:'1 mês usando o Leve', earned: accountDays>=30}
  ];
}
function checkNewBadges(){
  const badges = computeBadges();
  const earnedIds = badges.filter(b=>b.earned).map(b=>b.id);
  const newOnes = earnedIds.filter(id=>db.badgesSeen.indexOf(id)===-1);
  if(newOnes.length>0){
    db.badgesSeen = db.badgesSeen.concat(newOnes);
    if(!db.badgeDates) db.badgeDates = {};
    newOnes.forEach(id=>{ db.badgeDates[id] = todayKey(); });
    saveDB();
    const b = badges.find(x=>x.id===newOnes[0]);
    setTimeout(()=>toast(`🏆 Nova conquista: ${b.label}!`), 400);
  }
}

/* ============ Base de alimentos (cálculo automático de calorias) ============ */
// Valores em kcal são estimativas médias por porção, baseadas em referências
// nutricionais de uso comum (ex: tabela TACO). Podem variar conforme marca/preparo.
const UNIT_LABELS = {
  colher_sopa: 'colher (sopa)',
  colher_cha: 'colher (chá)',
  unidade: 'unidade',
  fatia: 'fatia',
  xicara: 'xícara (chá)',
  copo: 'copo (200ml)',
  pote: 'pote',
  concha: 'concha',
  prato_raso: 'prato raso',
  g100: '100 g'
};
const FOOD_DB = [
  // Carboidratos
  {id:'f1', name:'Arroz branco cozido', units:{colher_sopa:25, xicara:200, g100:130}},
  {id:'f2', name:'Arroz integral cozido', units:{colher_sopa:22, xicara:180, g100:120}},
  {id:'f3', name:'Feijão cozido', units:{colher_sopa:30, concha:80, xicara:130}},
  {id:'f4', name:'Macarrão cozido', units:{colher_sopa:25, xicara:190, g100:150}},
  {id:'f5', name:'Batata cozida', units:{unidade:80, xicara:130, g100:85}},
  {id:'f6', name:'Batata frita', units:{prato_raso:300, g100:270}},
  {id:'f7', name:'Mandioca/aipim cozido', units:{unidade:120, g100:125}},
  {id:'f8', name:'Pão francês', units:{unidade:150}},
  {id:'f9', name:'Pão de forma integral', units:{fatia:70}},
  {id:'f10', name:'Pão de queijo', units:{unidade:100}},
  {id:'f11', name:'Tapioca (sem recheio)', units:{unidade:120}},
  {id:'f12', name:'Aveia em flocos', units:{colher_sopa:30, xicara:150}},
  {id:'f13', name:'Granola', units:{colher_sopa:60, xicara:400}},
  {id:'f14', name:'Cuscuz', units:{fatia:110, xicara:150}},
  {id:'f15', name:'Polenta', units:{fatia:90, xicara:130}},

  // Proteínas
  {id:'f16', name:'Peito de frango grelhado', units:{unidade:230, g100:165}},
  {id:'f17', name:'Carne bovina grelhada', units:{unidade:200, g100:250}},
  {id:'f18', name:'Carne moída refogada', units:{colher_sopa:45, g100:210}},
  {id:'f19', name:'Peixe grelhado (tilápia/similar)', units:{unidade:150, g100:130}},
  {id:'f20', name:'Ovo cozido', units:{unidade:70}},
  {id:'f21', name:'Ovo frito', units:{unidade:90}},
  {id:'f22', name:'Ovo mexido', units:{unidade:95}},
  {id:'f23', name:'Atum em lata (ao natural)', units:{colher_sopa:20, g100:110}},
  {id:'f24', name:'Linguiça/salsicha', units:{unidade:150}},
  {id:'f25', name:'Queijo minas/mussarela', units:{fatia:50}},
  {id:'f26', name:'Presunto/peito de peru', units:{fatia:25}},

  // Laticínios e bebidas
  {id:'f27', name:'Leite integral', units:{copo:120}},
  {id:'f28', name:'Leite desnatado', units:{copo:70}},
  {id:'f29', name:'Iogurte natural', units:{pote:100}},
  {id:'f30', name:'Iogurte com frutas (industrializado)', units:{pote:150}},
  {id:'f31', name:'Suco de fruta natural', units:{copo:90}},
  {id:'f32', name:'Refrigerante', units:{copo:85}},
  {id:'f33', name:'Café com açúcar', units:{unidade:30}},
  {id:'f34', name:'Café sem açúcar', units:{unidade:5}},

  // Legumes e verduras
  {id:'f35', name:'Salada verde (folhas)', units:{prato_raso:20, xicara:5}},
  {id:'f36', name:'Brócolis cozido', units:{xicara:55, colher_sopa:15}},
  {id:'f37', name:'Cenoura crua/cozida', units:{unidade:25}},
  {id:'f38', name:'Tomate', units:{unidade:20}},
  {id:'f39', name:'Abobrinha refogada', units:{xicara:35}},
  {id:'f40', name:'Legumes variados no vapor', units:{xicara:50}},

  // Frutas
  {id:'f41', name:'Banana', units:{unidade:90}},
  {id:'f42', name:'Maçã', units:{unidade:80}},
  {id:'f43', name:'Laranja', units:{unidade:60}},
  {id:'f44', name:'Mamão', units:{fatia:60, unidade:120}},
  {id:'f45', name:'Melancia', units:{fatia:50}},
  {id:'f46', name:'Uva', units:{xicara:100}},
  {id:'f47', name:'Abacate', units:{unidade:320, colher_sopa:40}},

  // Gorduras, doces e lanches
  {id:'f48', name:'Azeite de oliva', units:{colher_sopa:120, colher_cha:40}},
  {id:'f49', name:'Manteiga/margarina', units:{colher_cha:35}},
  {id:'f50', name:'Açúcar', units:{colher_sopa:50, colher_cha:20}},
  {id:'f51', name:'Mel', units:{colher_sopa:65}},
  {id:'f52', name:'Pasta de amendoim', units:{colher_sopa:95}},
  {id:'f53', name:'Castanhas (mix)', units:{unidade:30, colher_sopa:90}},
  {id:'f54', name:'Chocolate ao leite', units:{unidade:110}},
  {id:'f55', name:'Bolacha/biscoito recheado', units:{unidade:70}},
  {id:'f56', name:'Bolacha água e sal', units:{unidade:15}},
  {id:'f57', name:'Pizza (fatia média)', units:{fatia:250}},
  {id:'f58', name:'Hambúrguer (sanduíche simples)', units:{unidade:350}},
  {id:'f59', name:'Salgado frito (coxinha/similar)', units:{unidade:280}},
  {id:'f60', name:'Sorvete', units:{colher_sopa:60, pote:200}},
];

function searchFoods(query){
  const q = norm(query);
  if(!q) return [];
  return FOOD_DB.filter(f=>norm(f.name).includes(q)).slice(0,8);
}
function calcFoodKcal(food, unitKey, qty){
  const per = food.units[unitKey];
  if(per==null) return 0;
  return Math.round(per * (Number(qty)||0));
}
