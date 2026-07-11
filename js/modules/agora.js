import {getAll,getSetting} from '../db.js';
import {escapeHTML,navigate,pageHead,toast} from '../ui.js';
import {getFinanceSnapshot} from './financeiro.js';

function greeting(){const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';}
export async function renderAgora(root,ctx){
  const [memories,decisions,modules,name,mode,finance]=await Promise.all([getAll('memories'),getAll('decisions'),getAll('forgeModules'),getSetting('profileName','VIP'),getSetting('currentMode','Pessoal'),getFinanceSnapshot()]);
  const openDecisions=decisions.filter(d=>d.status!=='concluida');
  const priorities=[];
  if(!memories.length) priorities.push({title:'Criar a primeira memória',detail:'Registre uma ideia, fato ou aprendizado para iniciar sua linha do tempo.',route:'memoria?action=new'});
  if(!finance.transactions.length) priorities.push({title:'Registrar a primeira movimentação',detail:'Adicione uma entrada ou gasto para iniciar seu planejamento financeiro.',route:'finance?view=transactions'});
  if(finance.monthlyBalance<0) priorities.push({title:'Revisar o resultado financeiro do mês',detail:`Os gastos superam as entradas em ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Math.abs(finance.monthlyBalance))}.`,route:'finance'});
  if(!decisions.length) priorities.push({title:'Testar o ORÁCULO',detail:'Analise uma escolha real usando critérios, pesos e cenários.',route:'oraculo?action=new'});
  if(!modules.length) priorities.push({title:'Construir uma ferramenta na FORJA',detail:'Crie um checklist, diário, cadastro ou rastreador personalizado.',route:'forja?action=new'});
  if(openDecisions.length) priorities.push({title:`Revisar ${openDecisions.length} decisão(ões) aberta(s)`,detail:'Confira os cenários e registre o resultado quando estiver pronto.',route:'oraculo'});
  if(memories.length) priorities.push({title:'Revisar registros recentes',detail:`Sua Memória Viva possui ${memories.length} registro(s).`,route:'memoria'});
  priorities.splice(3);
  while(priorities.length<3) priorities.push({title:'Explorar o QG',detail:'Veja os módulos ativos e ajuste o modo atual da sua rotina.',route:'qg'});
  root.innerHTML=`<section class="page">
    <div class="hero">
      <small>${escapeHTML(mode.toUpperCase())} · ${new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(new Date())}</small>
      <h2>${greeting()}, ${escapeHTML(name)}.</h2>
      <p>O sistema está operando localmente. Estas são as três ações mais úteis com base no estado atual do seu Assistente Pessoal VIP.</p>
      <div class="hero-meta"><span class="chip"><i></i> Privado no aparelho</span><span class="chip">${memories.length} memórias</span><span class="chip">${openDecisions.length} decisões abertas</span><span class="chip">${modules.length} módulos da FORJA</span><span class="chip">Saldo ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(finance.accountBalance)}</span></div>
      <form id="commandForm" class="command-box"><input id="commandInput" placeholder="Ex.: registrar uma ideia, analisar uma decisão, criar um controle..." autocomplete="off"><button type="submit">Executar</button></form>
    </div>
    ${pageHead('Prioridades do momento','O AGORA reduz a complexidade e mostra no máximo três próximos passos.')}
    <div class="grid grid-3">${priorities.map((p,i)=>`<article class="card priority-item clickable" data-go="${p.route}"><span class="priority-number">${i+1}</span><div><b>${escapeHTML(p.title)}</b><small>${escapeHTML(p.detail)}</small></div></article>`).join('')}</div>
    <div class="grid grid-4" style="margin-top:16px">
      <article class="card stat-card"><span class="stat-label">MEMÓRIA VIVA</span><strong class="stat-value">${memories.length}</strong><small class="stat-label">registros locais</small></article>
      <article class="card stat-card"><span class="stat-label">ORÁCULO</span><strong class="stat-value">${openDecisions.length}</strong><small class="stat-label">decisões abertas</small></article>
      <article class="card stat-card"><span class="stat-label">FORJA</span><strong class="stat-value">${modules.length}</strong><small class="stat-label">ferramentas criadas</small></article>
      <article class="card stat-card clickable" data-go="finance"><span class="stat-label">FINANCEIRO</span><strong class="stat-value" style="font-size:1.15rem">${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(finance.monthlyBalance)}</strong><small class="stat-label">resultado do mês</small></article>
    </div>
  </section>`;
  root.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{const [r,q]=el.dataset.go.split('?');navigate(r,q?`?${q}`:'')});
  root.querySelector('#commandForm').onsubmit=e=>{e.preventDefault();const text=root.querySelector('#commandInput').value.trim().toLowerCase();if(!text)return;
    if(/gasto|despesa|entrada|receita|finance|saldo|or[cç]amento|conta|meta financeira|dinheiro/.test(text)) navigate('finance');
    else if(/mem[oó]ria|ideia|anota|aprendizado|lembrar/.test(text)) navigate('memoria','?action=new');
    else if(/decis|or[aá]culo|escolh|comprar|vale a pena/.test(text)) navigate('oraculo','?action=new');
    else if(/forja|m[oó]dulo|controle|checklist|rastreador|di[aá]rio/.test(text)) navigate('forja','?action=new');
    else if(/manual|ajuda|duvida|dúvida|como funciona|tutorial|vip guia/.test(text)) navigate('guia');
    else if(/backup|seguran|pin|bloque/.test(text)) navigate('guardiao');
    else if(/config|tema|nome|letra/.test(text)) navigate('configuracoes');
    else {toast('Não identifiquei o comando. Abra o QG para escolher uma área.','error');navigate('qg');}
  };
}
