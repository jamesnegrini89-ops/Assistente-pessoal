import {getAll,getSetting,setSetting,addActivity,getByIndex,put} from '../db.js';
import {escapeHTML,navigate,pageHead,openModal,toast,uid,formatDate} from '../ui.js';

const core=[
  ['agora','⌂','AGORA','Prioridades contextuais e comando universal.'],['finance','$','GÊMEO FINANCEIRO','Entradas, gastos, saldo, orçamento, recorrências e metas.'],['memoria','▤','MEMÓRIA VIVA','Linha do tempo, ideias e registros pessoais.'],['oraculo','◈','ORÁCULO','Análise estruturada de decisões e cenários.'],['forja','✦','FORJA','Criação de controles e miniaplicativos.'],['guia','?','VIP GUIA','Manual interativo offline e respostas ampliadas pelo Gemini.'],['guardiao','⬡','GUARDIÃO','PIN, backup, restauração e privacidade.'],['configuracoes','⚙','CONFIGURAÇÕES','Tema, perfil, modo e comportamento.']
];
const modes=['Pessoal','Plantão','Pós-plantão','Folga','Casa','Estudo','Recuperação','Modo mínimo'];
export async function renderQG(root,ctx){
  const [custom,currentMode]=await Promise.all([getAll('forgeModules'),getSetting('currentMode','Pessoal')]);
  root.innerHTML=`<section class="page">${pageHead('QG Central','Todos os motores do sistema e as ferramentas criadas na FORJA ficam reunidos aqui.')}
    <article class="card" style="margin-bottom:16px"><div class="card-head"><h3>Modo atual</h3><span class="badge success">Contexto manual</span></div><div class="mode-selector">${modes.map(m=>`<button class="btn btn-secondary btn-sm ${m===currentMode?'active':''}" data-mode="${escapeHTML(m)}">${escapeHTML(m)}</button>`).join('')}</div><p class="section-note">O modo altera a linguagem e as prioridades do AGORA. A automação contextual avançada será adicionada em uma etapa posterior.</p></article>
    <h3 style="margin:22px 0 12px">Motores principais</h3><div class="grid grid-3">${core.map(([r,i,t,d])=>`<article class="card module-card clickable" data-route="${r}"><span class="module-symbol">${i}</span><h3>${t}</h3><p>${d}</p><div class="module-footer"><span class="badge success">Ativo</span><button class="btn btn-secondary btn-sm">Abrir</button></div></article>`).join('')}</div>
    <h3 style="margin:24px 0 12px">Ferramentas da FORJA</h3><div class="grid grid-3">${custom.length?custom.map(m=>`<article class="card module-card clickable" data-module="${m.id}"><span class="module-symbol">${escapeHTML(m.icon||'✦')}</span><h3>${escapeHTML(m.name)}</h3><p>${escapeHTML(m.description||`Modelo ${m.template}`)}</p><div class="module-footer"><span class="badge">${m.fields.length} campos</span><button class="btn btn-secondary btn-sm">Usar</button></div></article>`).join(''):`<article class="card span-2"><div class="empty-state">Nenhuma ferramenta personalizada ainda. Use a FORJA para criar a primeira.</div><div class="action-row" style="margin-top:12px"><button id="createModuleBtn" class="btn btn-primary">Criar na FORJA</button></div></article>`}</div>
  </section>`;
  root.querySelectorAll('[data-route]').forEach(el=>el.onclick=()=>navigate(el.dataset.route));
  root.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=async()=>{await setSetting('currentMode',btn.dataset.mode);await addActivity('modo',`Modo alterado para ${btn.dataset.mode}`);toast('Modo atualizado.');ctx.refresh();});
  root.querySelector('#createModuleBtn')?.addEventListener('click',()=>navigate('forja','?action=new'));
  root.querySelectorAll('[data-module]').forEach(el=>el.onclick=()=>openCustomModule(el.dataset.module,ctx));
}

async function openCustomModule(moduleId,ctx){
  const modules=await getAll('forgeModules');const mod=modules.find(m=>m.id===moduleId);if(!mod)return;
  const records=(await getByIndex('forgeRecords','moduleId',moduleId)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const fieldHTML=mod.fields.map(f=>`<label class="field"><span>${escapeHTML(f.label)}</span>${f.type==='textarea'?`<textarea name="${f.id}"></textarea>`:f.type==='checkbox'?`<select name="${f.id}"><option value="Não">Não</option><option value="Sim">Sim</option></select>`:`<input name="${f.id}" type="${['number','date'].includes(f.type)?f.type:'text'}">`}</label>`).join('');
  const modal=openModal(`<div class="modal-head"><div><h3>${escapeHTML(mod.icon||'✦')} ${escapeHTML(mod.name)}</h3><small>${records.length} registro(s)</small></div><button class="modal-close" type="button">×</button></div><form id="moduleRecordForm" class="form-grid">${fieldHTML}<div class="span-2 action-row"><button class="btn btn-primary" type="submit">Salvar registro</button></div></form><h3 style="margin-top:22px">Histórico</h3><div class="list" style="margin-top:10px">${records.length?records.map(r=>`<div class="list-item"><div><b>${formatDate(r.createdAt)}</b><small>${mod.fields.map(f=>`${escapeHTML(f.label)}: ${escapeHTML(r.values[f.id]||'—')}`).join(' · ')}</small></div></div>`).join(''):'<div class="empty-state">Nenhum registro.</div>'}</div>`);
  modal.querySelector('#moduleRecordForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const values={};mod.fields.forEach(f=>values[f.id]=String(fd.get(f.id)||'').trim());await put('forgeRecords',{id:uid('record'),moduleId,values,createdAt:new Date().toISOString()});await addActivity('forja',`Registro adicionado em ${mod.name}`);toast('Registro salvo.');modal.close();openCustomModule(moduleId,ctx);};
}
