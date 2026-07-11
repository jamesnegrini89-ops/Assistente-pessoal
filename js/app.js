import {openDB,getSetting,setSetting,getSettings,addActivity} from './db.js';
import {configurePin,verifyPin,hasPin,createLockController} from './security.js';
import {$,$$,ROUTES,CORE_MOBILE,escapeHTML,parseHash,applyTheme,toast} from './ui.js';
import {renderAgora} from './modules/agora.js';
import {renderQG} from './modules/qg.js';
import {renderMemoria} from './modules/memoria.js';
import {renderOraculo} from './modules/oraculo.js';
import {renderForja} from './modules/forja.js';
import {renderGuardiao,handleImportFile} from './modules/guardiao.js';
import {renderGuia} from './modules/guia.js';
import {renderConfiguracoes} from './modules/configuracoes.js';

const APP_VERSION='0.1.2';
const renderers={agora:renderAgora,qg:renderQG,memoria:renderMemoria,oraculo:renderOraculo,forja:renderForja,guia:renderGuia,guardiao:renderGuardiao,configuracoes:renderConfiguracoes};
let settings={};
let currentRoute='agora';
const lockController=createLockController(showLock);
const ctx={
  refresh:()=>renderRoute(),
  lock:()=>lockController.lock(),
  setAutoLock:minutes=>lockController.setMinutes(minutes),
  openImport:()=>$('#importFileInput').click(),
  updateProfile:()=>updateProfile()
};

async function init(){
  await openDB();
  settings=await getSettings();
  applyTheme(settings);
  buildNavigation();
  bindGlobalEvents();
  if(!settings.onboardingComplete || !(await hasPin())){
    showOnboarding();
  }else{
    lockController.setMinutes(settings.autoLockMinutes??5);
    showLock();
  }
  registerServiceWorker();
}

function buildNavigation(){
  const desktop=['agora','qg','memoria','oraculo','forja','guia','guardiao','configuracoes'];
  $('#desktopNav').innerHTML=desktop.map(navButton).join('');
  $('#mobileNav').innerHTML=CORE_MOBILE.map(navButton).join('');
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{location.hash=`#${btn.dataset.route}`}));
}
function navButton(route){const r=ROUTES[route];return `<button class="nav-item" type="button" data-route="${route}"><span class="nav-icon">${r.icon}</span><span>${r.label}</span></button>`;}

function bindGlobalEvents(){
  window.addEventListener('hashchange',()=>{if(lockController.isUnlocked())renderRoute();});
  $('#settingsBtn').onclick=()=>location.hash='#configuracoes';
  $('#guideBtn').onclick=()=>location.hash='#guia';
  $('#lockNowBtn').onclick=()=>lockController.lock();
  $('#themeToggleBtn').onclick=toggleTheme;
  $('#unlockForm').onsubmit=unlock;
  $('#importFileInput').onchange=async e=>{const file=e.target.files?.[0];if(file)await handleImportFile(file,ctx);e.target.value='';};
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(settings.theme==='system')applyTheme(settings)});
}

async function toggleTheme(){
  const actual=document.documentElement.dataset.theme;
  settings.theme=actual==='dark'?'light':'dark';
  await setSetting('theme',settings.theme);applyTheme(settings);toast(`Tema ${settings.theme==='dark'?'escuro':'claro'} ativado.`);
}

function showLock(){
  $('#appShell').hidden=true;$('#onboarding').hidden=true;$('#lockScreen').hidden=false;$('#unlockPin').value='';$('#lockMessage').textContent='';
  const name=settings.profileName||'VIP';$('#lockGreeting').textContent=`Olá, ${name}. Digite seu PIN para continuar.`;
  setTimeout(()=>$('#unlockPin').focus(),80);
}
async function unlock(e){
  e.preventDefault();const pin=$('#unlockPin').value;
  if(await verifyPin(pin)){
    $('#lockScreen').hidden=true;$('#appShell').hidden=false;lockController.unlock();settings=await getSettings();applyTheme(settings);updateProfile();await addActivity('seguranca','Aplicativo desbloqueado');renderRoute();
  }else{$('#lockMessage').textContent='PIN incorreto.';$('#unlockPin').select();}
}

function updateProfile(){
  getSettings().then(s=>{settings=s;const name=s.profileName||'VIP';$('#profileInitial').textContent=name.trim().charAt(0).toUpperCase()||'V';});
}
async function renderRoute(){
  const {route,params}=parseHash();currentRoute=route;
  $$('.nav-item').forEach(btn=>btn.classList.toggle('active',btn.dataset.route===route));
  $('#pageTitle').textContent=ROUTES[route].label;
  const root=$('#mainContent');root.innerHTML='<div class="empty-state">Carregando área local…</div>';
  try{await renderers[route](root,ctx,params);root.focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'});if(params.toString())history.replaceState(null,'',`#${route}`);}catch(err){console.error(err);root.innerHTML=`<section class="page"><div class="empty-state">Não foi possível abrir esta área.<br>${escapeHTML(err.message||String(err))}</div></section>`;toast('Ocorreu um erro ao abrir a área.','error');}
}

function showOnboarding(){
  $('#appShell').hidden=true;$('#lockScreen').hidden=true;$('#onboarding').hidden=false;
  const draft={name:'',mode:'Pessoal',theme:'dark',fontScale:'normal',autoLockMinutes:5,pin:'',confirm:''};let step=0;
  const render=()=>{
    $('#setupProgress').style.width=`${((step+1)/4)*100}%`;
    const body=$('#setupBody');
    if(step===0)body.innerHTML=`<span class="eyebrow">GENESIS ${APP_VERSION}</span><h2>Bem-vindo ao Assistente Pessoal VIP</h2><p>Esta instalação começará vazia e armazenará seus dados neste navegador. A estrutura inicial inclui AGORA, QG, MEMÓRIA, ORÁCULO, FORJA, VIP GUIA, GUARDIÃO e CONFIGURAÇÕES.</p><div class="grid grid-2"><div class="kv"><small>FUNCIONAMENTO</small><strong>Offline-first</strong></div><div class="kv"><small>IDENTIDADE</small><strong>Azul-marinho e verde metálico</strong></div></div><div class="setup-actions"><span></span><button id="setupNext" class="btn btn-primary">Começar</button></div>`;
    if(step===1)body.innerHTML=`<span class="eyebrow">ETAPA 1 DE 3</span><h2>Seu perfil local</h2><p>Esses dados servem apenas para personalizar a interface.</p><div class="form-grid"><label class="field span-2"><span>Como deseja ser chamado</span><input id="setupName" maxlength="50" value="${escapeHTML(draft.name)}" placeholder="Ex.: James" required></label><label class="field span-2"><span>Modo inicial</span><select id="setupMode">${['Pessoal','Plantão','Pós-plantão','Folga','Casa','Estudo','Recuperação','Modo mínimo'].map(m=>`<option ${draft.mode===m?'selected':''}>${m}</option>`).join('')}</select></label></div><div class="setup-actions"><button id="setupBack" class="btn btn-secondary">Voltar</button><button id="setupNext" class="btn btn-primary">Continuar</button></div>`;
    if(step===2)body.innerHTML=`<span class="eyebrow">ETAPA 2 DE 3</span><h2>Aparência VIP</h2><p>A paleta metálica já está definida. Escolha como ela será apresentada.</p><div class="form-grid"><label class="field"><span>Tema</span><select id="setupTheme"><option value="dark" ${draft.theme==='dark'?'selected':''}>Escuro</option><option value="light" ${draft.theme==='light'?'selected':''}>Claro</option><option value="system" ${draft.theme==='system'?'selected':''}>Automático</option></select></label><label class="field"><span>Tamanho do texto</span><select id="setupFont"><option value="small" ${draft.fontScale==='small'?'selected':''}>Compacto</option><option value="normal" ${draft.fontScale==='normal'?'selected':''}>Normal</option><option value="large" ${draft.fontScale==='large'?'selected':''}>Ampliado</option></select></label><label class="field span-2"><span>Bloqueio automático</span><select id="setupAutoLock"><option value="1" ${draft.autoLockMinutes===1?'selected':''}>1 minuto</option><option value="5" ${draft.autoLockMinutes===5?'selected':''}>5 minutos</option><option value="15" ${draft.autoLockMinutes===15?'selected':''}>15 minutos</option><option value="30" ${draft.autoLockMinutes===30?'selected':''}>30 minutos</option><option value="0" ${draft.autoLockMinutes===0?'selected':''}>Somente manual</option></select></label></div><div class="setup-actions"><button id="setupBack" class="btn btn-secondary">Voltar</button><button id="setupNext" class="btn btn-primary">Continuar</button></div>`;
    if(step===3)body.innerHTML=`<span class="eyebrow">ETAPA 3 DE 3</span><h2>Crie seu PIN</h2><p>Use de 4 a 8 números. O aplicativo solicitará esse PIN sempre que for aberto ou bloqueado.</p><div class="form-grid"><label class="field"><span>Novo PIN</span><input id="setupPin" inputmode="numeric" pattern="[0-9]*" maxlength="8" type="password" required></label><label class="field"><span>Confirmar PIN</span><input id="setupPinConfirm" inputmode="numeric" pattern="[0-9]*" maxlength="8" type="password" required></label></div><small id="setupError" class="form-message"></small><div class="setup-actions"><button id="setupBack" class="btn btn-secondary">Voltar</button><button id="setupFinish" class="btn btn-primary">Criar Assistente VIP</button></div>`;
    $('#setupBack')?.addEventListener('click',()=>{capture();step--;render()});
    $('#setupNext')?.addEventListener('click',()=>{capture();if(step===1&&!draft.name.trim())return toast('Informe como deseja ser chamado.','error');step++;render()});
    $('#setupFinish')?.addEventListener('click',finish);
  };
  const capture=()=>{
    if($('#setupName'))draft.name=$('#setupName').value;
    if($('#setupMode'))draft.mode=$('#setupMode').value;
    if($('#setupTheme'))draft.theme=$('#setupTheme').value;
    if($('#setupFont'))draft.fontScale=$('#setupFont').value;
    if($('#setupAutoLock'))draft.autoLockMinutes=Number($('#setupAutoLock').value);
    if($('#setupPin'))draft.pin=$('#setupPin').value;
    if($('#setupPinConfirm'))draft.confirm=$('#setupPinConfirm').value;
  };
  const finish=async()=>{
    capture();const err=$('#setupError');
    if(!/^\d{4,8}$/.test(draft.pin)){err.textContent='O PIN deve ter de 4 a 8 números.';return;}
    if(draft.pin!==draft.confirm){err.textContent='Os PINs não coincidem.';return;}
    try{
      await configurePin(draft.pin);
      const values={onboardingComplete:true,profileName:draft.name.trim()||'VIP',currentMode:draft.mode,theme:draft.theme,fontScale:draft.fontScale,autoLockMinutes:draft.autoLockMinutes,appVersion:APP_VERSION,createdAt:new Date().toISOString()};
      for(const [k,v] of Object.entries(values))await setSetting(k,v);
      await addActivity('sistema','Assistente Pessoal VIP configurado');
      settings=await getSettings();applyTheme(settings);lockController.setMinutes(settings.autoLockMinutes);$('#onboarding').hidden=true;$('#appShell').hidden=false;lockController.unlock();updateProfile();location.hash='#agora';renderRoute();toast('Assistente Pessoal VIP criado.');
    }catch(e){err.textContent=e.message||'Falha ao criar o PIN.';}
  };
  render();
}

function registerServiceWorker(){if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));}
init().catch(err=>{console.error(err);document.body.innerHTML=`<div style="padding:30px;color:white;background:#050f1d;min-height:100vh">Falha ao iniciar: ${escapeHTML(err.message||String(err))}</div>`;});
