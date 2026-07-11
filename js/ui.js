export const ROUTES={
  agora:{label:'AGORA',icon:'⌂'},qg:{label:'QG',icon:'◇'},oraculo:{label:'ORÁCULO',icon:'◈'},forja:{label:'FORJA',icon:'✦'},memoria:{label:'MEMÓRIA',icon:'▤'},guia:{label:'VIP GUIA',icon:'?'},guardiao:{label:'GUARDIÃO',icon:'⬡'},configuracoes:{label:'CONFIGURAÇÕES',icon:'⚙'}
};
export const CORE_MOBILE=['agora','qg','oraculo','forja','memoria'];
export const $=(selector,root=document)=>root.querySelector(selector);
export const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
export function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
export function uid(prefix='id'){return `${prefix}-${crypto.randomUUID()}`;}
export function formatDate(value,withTime=true){if(!value)return '—';const d=new Date(value);return new Intl.DateTimeFormat('pt-BR',withTime?{dateStyle:'short',timeStyle:'short'}:{dateStyle:'medium'}).format(d);}
export function toast(message,type='success'){
  const c=$('#toastContainer'); const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;c.append(el);setTimeout(()=>el.remove(),4200);
}
export function navigate(route,params=''){location.hash=`#${route}${params}`;}
export function parseHash(){const raw=location.hash.replace(/^#/,'')||'agora';const [route,query='']=raw.split('?');return {route:ROUTES[route]?route:'agora',params:new URLSearchParams(query)};}
export function openModal(html,onReady){const modal=$('#modal');$('#modalContent').innerHTML=html;modal.showModal();$('#modalContent .modal-close')?.addEventListener('click',()=>modal.close());onReady?.(modal);return modal;}
export function confirmModal(title,message,confirmText='Confirmar'){
  return new Promise(resolve=>{
    const modal=openModal(`<div class="modal-head"><h3>${escapeHTML(title)}</h3><button class="modal-close" type="button">×</button></div><p>${escapeHTML(message)}</p><div class="action-row"><button id="modalCancel" class="btn btn-secondary" type="button">Cancelar</button><button id="modalConfirm" class="btn btn-danger" type="button">${escapeHTML(confirmText)}</button></div>`);
    const done=v=>{modal.close();resolve(v)};$('#modalCancel',modal).onclick=()=>done(false);$('#modalConfirm',modal).onclick=()=>done(true);modal.addEventListener('cancel',()=>resolve(false),{once:true});
  });
}
export function downloadJSON(payload,filename){const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function pageHead(title,description,actions=''){return `<div class="page-head"><div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p></div><div class="page-actions">${actions}</div></div>`;}
export function emptyState(text){return `<div class="empty-state">${escapeHTML(text)}</div>`;}
export function applyTheme(settings={}){
  const systemDark=matchMedia('(prefers-color-scheme: dark)').matches;
  const theme=settings.theme==='system'?(systemDark?'dark':'light'):(settings.theme||'dark');
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.setProperty('--font-scale',settings.fontScale==='large'?'1.09':settings.fontScale==='small'?'.94':'1');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#07182d':'#0c2946');
}
export function sanitizeText(value){return String(value??'').trim();}
export function scoreDecision(option){
  const benefit=Number(option.benefit||1),urgency=Number(option.urgency||1),reversibility=Number(option.reversibility||1),cost=Number(option.cost||1),risk=Number(option.risk||1);
  return Math.round(((benefit*30)+(urgency*15)+(reversibility*15)+((6-cost)*20)+((6-risk)*20))/5);
}
