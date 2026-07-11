import {getAll,getSetting,setSetting,put,remove,addActivity} from '../db.js';
import {escapeHTML,formatDate,navigate,pageHead,openModal,confirmModal,toast,uid} from '../ui.js';

const DEFAULT_ACCOUNTS=[{id:'account-main',name:'Carteira principal',type:'Conta principal',initialBalance:0,active:true,createdAt:new Date().toISOString()}];
const DEFAULT_CATEGORIES=[
  ['income-salary','Salário','income','◆'],['income-extra','Renda extra','income','+'],['income-refund','Reembolso','income','↺'],['income-invest','Rendimentos','income','↗'],['income-other','Outras entradas','income','•'],
  ['expense-home','Moradia','expense','⌂'],['expense-food','Alimentação','expense','◉'],['expense-transport','Transporte','expense','➜'],['expense-health','Saúde','expense','✚'],['expense-leisure','Lazer','expense','☆'],['expense-shopping','Compras','expense','▣'],['expense-education','Educação','expense','▤'],['expense-work','Trabalho','expense','◇'],['expense-other','Outros gastos','expense','•']
].map(([id,name,type,icon])=>({id,name,type,icon,active:true,createdAt:new Date().toISOString()}));

const todayISO=()=>new Date().toISOString().slice(0,10);
const currentMonth=()=>todayISO().slice(0,7);
const money=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0);
const number=value=>Math.max(0,Number(String(value??'').replace(',','.'))||0);
const monthLabel=value=>{const [y,m]=String(value||currentMonth()).split('-');return new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(Number(y),Number(m)-1,1));};
const localDateLabel=value=>{if(!value)return '—';const [y,m,d]=String(value).slice(0,10).split('-').map(Number);return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short'}).format(new Date(y,m-1,d));};
const signAmount=t=>t.type==='income'?Number(t.amount||0):-Number(t.amount||0);
const byDateDesc=(a,b)=>String(b.date||b.createdAt).localeCompare(String(a.date||a.createdAt));

export async function ensureFinanceDefaults(){
  const [accounts,categories]=await Promise.all([getAll('financeAccounts'),getAll('financeCategories')]);
  if(!accounts.length)for(const item of DEFAULT_ACCOUNTS)await put('financeAccounts',item);
  if(!categories.length)for(const item of DEFAULT_CATEGORIES)await put('financeCategories',item);
}

export async function getFinanceSnapshot(month=currentMonth()){
  await ensureFinanceDefaults();
  const [transactions,accounts,budgets,goals,recurring]=await Promise.all([
    getAll('financeTransactions'),getAll('financeAccounts'),getAll('financeBudgets'),getAll('financeGoals'),getAll('financeRecurring')
  ]);
  const monthTransactions=transactions.filter(t=>String(t.date||'').startsWith(month));
  const income=monthTransactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount||0),0);
  const expense=monthTransactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount||0),0);
  const accountBalance=accounts.reduce((s,a)=>s+Number(a.initialBalance||0),0)+transactions.reduce((s,t)=>s+signAmount(t),0);
  const monthBudgets=budgets.filter(b=>b.month===month);
  const budgetLimit=monthBudgets.reduce((s,b)=>s+Number(b.limit||0),0);
  const budgetSpent=monthBudgets.reduce((sum,b)=>sum+monthTransactions.filter(t=>t.type==='expense'&&t.categoryId===b.categoryId).reduce((s,t)=>s+Number(t.amount||0),0),0);
  const activeRecurring=recurring.filter(r=>r.active!==false);
  const plannedIncome=activeRecurring.filter(r=>r.type==='income').reduce((s,r)=>s+Number(r.amount||0),0);
  const plannedExpense=activeRecurring.filter(r=>r.type==='expense').reduce((s,r)=>s+Number(r.amount||0),0);
  const openGoals=goals.filter(g=>g.status!=='completed');
  return {month,transactions,monthTransactions,accounts,budgets:monthBudgets,goals,openGoals,recurring:activeRecurring,income,expense,monthlyBalance:income-expense,accountBalance,budgetLimit,budgetSpent,plannedIncome,plannedExpense,projectedBalance:(income+plannedIncome)-(expense+plannedExpense)};
}

export async function renderFinanceiro(root,ctx,params){
  await ensureFinanceDefaults();
  const view=params.get('view')||'dashboard';
  const month=params.get('month')||await getSetting('financeSelectedMonth',currentMonth());
  if(view==='transactions')return renderTransactions(root,ctx,month);
  if(view==='planning')return renderPlanning(root,ctx,month);
  if(view==='goals')return renderGoals(root,ctx,month);
  if(view==='setup')return renderSetup(root,ctx,month);
  return renderDashboard(root,ctx,month);
}

function financeNav(active,month){
  return `<div class="finance-tabs">
    ${[['dashboard','Visão geral'],['transactions','Movimentações'],['planning','Planejamento'],['goals','Metas'],['setup','Contas e categorias']].map(([id,label])=>`<button class="finance-tab ${active===id?'active':''}" data-finance-view="${id}" data-month="${month}">${label}</button>`).join('')}
  </div>`;
}

async function renderDashboard(root,ctx,month){
  const [snapshot,categories]=await Promise.all([getFinanceSnapshot(month),getAll('financeCategories')]);
  const categoryMap=Object.fromEntries(categories.map(c=>[c.id,c]));
  const recent=[...snapshot.transactions].sort(byDateDesc).slice(0,6);
  const budgetPercent=snapshot.budgetLimit?Math.min(100,Math.round(snapshot.budgetSpent/snapshot.budgetLimit*100)):0;
  const goalCards=snapshot.openGoals.slice(0,3);
  const recurringExpense=snapshot.recurring.filter(r=>r.type==='expense').reduce((s,r)=>s+Number(r.amount||0),0);
  root.innerHTML=`<section class="page">${pageHead('GÊMEO FINANCEIRO','Controle de entradas, gastos, saldo, orçamento, compromissos recorrentes e metas pessoais.',`<button id="newTransactionBtn" class="btn btn-primary">+ Movimentação</button><button id="oraclePurchaseBtn" class="btn btn-secondary">Analisar compra</button>`)}
    ${financeNav('dashboard',month)}
    <article class="finance-hero">
      <div><small>SALDO GERAL ESTIMADO</small><strong>${money(snapshot.accountBalance)}</strong><span>${snapshot.accounts.length} conta(s) ativa(s) · dados locais</span></div>
      <label class="field finance-month"><span>Mês analisado</span><input id="financeMonth" type="month" value="${escapeHTML(month)}"></label>
    </article>
    <div class="grid grid-4 finance-summary">
      <article class="card finance-kpi income"><span>ENTRADAS</span><strong>${money(snapshot.income)}</strong><small>${snapshot.monthTransactions.filter(t=>t.type==='income').length} registro(s)</small></article>
      <article class="card finance-kpi expense"><span>GASTOS</span><strong>${money(snapshot.expense)}</strong><small>${snapshot.monthTransactions.filter(t=>t.type==='expense').length} registro(s)</small></article>
      <article class="card finance-kpi ${snapshot.monthlyBalance>=0?'positive':'negative'}"><span>RESULTADO DO MÊS</span><strong>${money(snapshot.monthlyBalance)}</strong><small>${snapshot.monthlyBalance>=0?'superávit':'déficit'} em ${escapeHTML(monthLabel(month))}</small></article>
      <article class="card finance-kpi projected"><span>PROJEÇÃO + RECORRÊNCIAS</span><strong>${money(snapshot.projectedBalance)}</strong><small>${money(recurringExpense)} em gastos recorrentes</small></article>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <article class="card"><div class="card-head"><h3>Orçamento mensal</h3><span class="badge ${budgetPercent>=90?'warning':'success'}">${budgetPercent}% usado</span></div>
        ${snapshot.budgetLimit?`<div class="finance-progress"><i style="width:${budgetPercent}%"></i></div><div class="finance-progress-label"><span>${money(snapshot.budgetSpent)} utilizados</span><b>${money(snapshot.budgetLimit)} planejados</b></div>`:`<div class="empty-state">Nenhum orçamento definido para ${escapeHTML(monthLabel(month))}.</div>`}
        <div class="action-row" style="margin-top:14px"><button class="btn btn-secondary btn-sm" data-finance-view="planning" data-month="${month}">Planejar orçamento</button></div>
      </article>
      <article class="card"><div class="card-head"><h3>Metas financeiras</h3><span class="badge">${snapshot.openGoals.length} aberta(s)</span></div>
        <div class="finance-goal-mini">${goalCards.length?goalCards.map(g=>{const pct=Math.min(100,Math.round(Number(g.currentAmount||0)/Math.max(1,Number(g.targetAmount||0))*100));return `<div><span><b>${escapeHTML(g.name)}</b><small>${money(g.currentAmount)} de ${money(g.targetAmount)}</small></span><em>${pct}%</em></div>`}).join(''):'<div class="empty-state">Nenhuma meta financeira criada.</div>'}</div>
        <div class="action-row" style="margin-top:14px"><button class="btn btn-secondary btn-sm" data-finance-view="goals" data-month="${month}">Abrir metas</button></div>
      </article>
    </div>
    <article class="card" style="margin-top:16px"><div class="card-head"><h3>Movimentações recentes</h3><button class="btn btn-secondary btn-sm" data-finance-view="transactions" data-month="${month}">Ver todas</button></div>
      <div class="finance-list">${recent.length?recent.map(t=>transactionRow(t,categoryMap)).join(''):'<div class="empty-state">Ainda não existem entradas ou gastos. Registre a primeira movimentação.</div>'}</div>
    </article>
    <div class="grid grid-3" style="margin-top:16px">
      <article class="card module-card clickable" data-finance-view="transactions" data-month="${month}"><span class="module-symbol">⇄</span><h3>Entradas e gastos</h3><p>Registre salário, compras, contas, reembolsos e outras movimentações.</p></article>
      <article class="card module-card clickable" data-finance-view="planning" data-month="${month}"><span class="module-symbol">▥</span><h3>Planejamento mensal</h3><p>Defina limites por categoria e compromissos recorrentes.</p></article>
      <article class="card module-card clickable" data-finance-view="goals" data-month="${month}"><span class="module-symbol">◎</span><h3>Metas e reservas</h3><p>Acompanhe objetivos, valores acumulados e prazos.</p></article>
    </div>
  </section>`;
  bindFinanceNavigation(root);
  root.querySelector('#newTransactionBtn').onclick=()=>openTransactionModal(ctx,{date:todayISO()});
  root.querySelector('#oraclePurchaseBtn').onclick=()=>navigate('oraculo','?action=new');
  root.querySelector('#financeMonth').onchange=async e=>{await setSetting('financeSelectedMonth',e.target.value);navigate('finance',`?month=${e.target.value}`)};
}

async function renderTransactions(root,ctx,month){
  const [transactions,categories,accounts]=await Promise.all([getAll('financeTransactions'),getAll('financeCategories'),getAll('financeAccounts')]);
  const categoryMap=Object.fromEntries(categories.map(c=>[c.id,c]));
  const accountMap=Object.fromEntries(accounts.map(a=>[a.id,a]));
  const filtered=transactions.filter(t=>String(t.date||'').startsWith(month)).sort(byDateDesc);
  root.innerHTML=`<section class="page">${pageHead('MOVIMENTAÇÕES','Cadastre, edite e consulte todas as entradas e gastos.',`<button id="newTransactionBtn" class="btn btn-primary">+ Nova movimentação</button>`)}${financeNav('transactions',month)}
    <article class="card"><div class="finance-filter-row"><label class="field"><span>Mês</span><input id="financeMonth" type="month" value="${escapeHTML(month)}"></label><label class="field"><span>Tipo</span><select id="transactionTypeFilter"><option value="all">Todos</option><option value="income">Entradas</option><option value="expense">Gastos</option></select></label><label class="field finance-search"><span>Pesquisar</span><input id="transactionSearch" placeholder="Descrição, categoria ou conta"></label></div></article>
    <article class="card" style="margin-top:16px"><div class="card-head"><h3>Histórico de ${escapeHTML(monthLabel(month))}</h3><span id="transactionCountBadge" class="badge">${filtered.length}</span></div><div id="transactionList" class="finance-list">${filtered.length?filtered.map(t=>transactionRow(t,categoryMap,accountMap,true)).join(''):'<div class="empty-state">Nenhuma movimentação neste mês.</div>'}</div></article>
  </section>`;
  bindFinanceNavigation(root);
  root.querySelector('#newTransactionBtn').onclick=()=>openTransactionModal(ctx,{date:todayISO()});
  root.querySelector('#financeMonth').onchange=e=>navigate('finance',`?view=transactions&month=${e.target.value}`);
  const applyFilters=()=>{
    const type=root.querySelector('#transactionTypeFilter').value;
    const query=root.querySelector('#transactionSearch').value.toLowerCase().trim();
    const rows=filtered.filter(t=>{
      const text=[t.description,categoryMap[t.categoryId]?.name,accountMap[t.accountId]?.name,t.notes].join(' ').toLowerCase();
      return (type==='all'||t.type===type)&&(!query||text.includes(query));
    });
    root.querySelector('#transactionList').innerHTML=rows.length?rows.map(t=>transactionRow(t,categoryMap,accountMap,true)).join(''):'<div class="empty-state">Nenhuma movimentação corresponde aos filtros.</div>';
    root.querySelector('#transactionCountBadge').textContent=rows.length;
    bindTransactionActions(root,ctx,transactions);
  };
  root.querySelector('#transactionTypeFilter').onchange=applyFilters;root.querySelector('#transactionSearch').oninput=applyFilters;
  bindTransactionActions(root,ctx,transactions);
}

async function renderPlanning(root,ctx,month){
  const [budgets,recurring,categories,accounts,transactions]=await Promise.all([getAll('financeBudgets'),getAll('financeRecurring'),getAll('financeCategories'),getAll('financeAccounts'),getAll('financeTransactions')]);
  const categoryMap=Object.fromEntries(categories.map(c=>[c.id,c]));
  const accountMap=Object.fromEntries(accounts.map(a=>[a.id,a]));
  const monthBudgets=budgets.filter(b=>b.month===month);
  const monthExpenses=transactions.filter(t=>t.type==='expense'&&String(t.date||'').startsWith(month));
  root.innerHTML=`<section class="page">${pageHead('PLANEJAMENTO FINANCEIRO','Organize limites mensais e compromissos que se repetem.',`<button id="newBudgetBtn" class="btn btn-primary">+ Orçamento</button><button id="newRecurringBtn" class="btn btn-secondary">+ Recorrência</button>`)}${financeNav('planning',month)}
    <article class="card"><label class="field finance-month-inline"><span>Mês do orçamento</span><input id="financeMonth" type="month" value="${escapeHTML(month)}"></label></article>
    <div class="grid grid-2" style="margin-top:16px"><article class="card"><div class="card-head"><h3>Limites por categoria</h3><span class="badge">${monthBudgets.length}</span></div><div class="finance-budget-list">${monthBudgets.length?monthBudgets.map(b=>{const spent=monthExpenses.filter(t=>t.categoryId===b.categoryId).reduce((s,t)=>s+Number(t.amount||0),0);const pct=Math.min(100,Math.round(spent/Math.max(1,Number(b.limit||0))*100));return `<div class="finance-budget-row"><div><b>${escapeHTML(categoryMap[b.categoryId]?.name||'Categoria removida')}</b><small>${money(spent)} de ${money(b.limit)}</small><div class="finance-progress"><i style="width:${pct}%"></i></div></div><span class="badge ${pct>=90?'warning':'success'}">${pct}%</span><button class="btn btn-danger btn-sm" data-delete-budget="${b.id}">Excluir</button></div>`}).join(''):'<div class="empty-state">Nenhum limite criado para este mês.</div>'}</div></article>
      <article class="card"><div class="card-head"><h3>Resumo planejado</h3><span class="badge success">Mensal</span></div>${planningSummary(recurring)}<div class="section-note" style="margin-top:14px">Os valores recorrentes são uma projeção. Registre a movimentação real quando ela acontecer para manter o saldo correto.</div></article></div>
    <article class="card" style="margin-top:16px"><div class="card-head"><h3>Compromissos recorrentes</h3><span class="badge">${recurring.filter(r=>r.active!==false).length} ativo(s)</span></div><div class="finance-list">${recurring.length?recurring.sort((a,b)=>Number(a.day)-Number(b.day)).map(r=>`<div class="finance-row"><span class="finance-row-icon ${r.type}">${r.type==='income'?'+':'−'}</span><div><b>${escapeHTML(r.description)}</b><small>Todo dia ${Number(r.day)||1} · ${escapeHTML(categoryMap[r.categoryId]?.name||'Sem categoria')} · ${escapeHTML(accountMap[r.accountId]?.name||'Conta removida')}</small></div><strong class="${r.type}">${r.type==='income'?'+':'−'} ${money(r.amount)}</strong><div class="finance-row-actions"><button class="btn btn-secondary btn-sm" data-edit-recurring="${r.id}">Editar</button><button class="btn btn-danger btn-sm" data-delete-recurring="${r.id}">Excluir</button></div></div>`).join(''):'<div class="empty-state">Nenhuma entrada ou gasto recorrente cadastrado.</div>'}</div></article>
  </section>`;
  bindFinanceNavigation(root);
  root.querySelector('#financeMonth').onchange=e=>navigate('finance',`?view=planning&month=${e.target.value}`);
  root.querySelector('#newBudgetBtn').onclick=()=>openBudgetModal(ctx,{month});
  root.querySelector('#newRecurringBtn').onclick=()=>openRecurringModal(ctx,{});
  root.querySelectorAll('[data-delete-budget]').forEach(btn=>btn.onclick=async()=>{if(await confirmModal('Excluir orçamento?','O limite mensal será removido, mas as movimentações continuarão salvas.','Excluir')){await remove('financeBudgets',btn.dataset.deleteBudget);await addActivity('financeiro','Orçamento mensal excluído');toast('Orçamento excluído.');ctx.refresh();}});
  root.querySelectorAll('[data-edit-recurring]').forEach(btn=>btn.onclick=()=>openRecurringModal(ctx,recurring.find(r=>r.id===btn.dataset.editRecurring)));
  root.querySelectorAll('[data-delete-recurring]').forEach(btn=>btn.onclick=async()=>{if(await confirmModal('Excluir recorrência?','O compromisso recorrente será removido.','Excluir')){await remove('financeRecurring',btn.dataset.deleteRecurring);await addActivity('financeiro','Recorrência excluída');toast('Recorrência excluída.');ctx.refresh();}});
}

async function renderGoals(root,ctx,month){
  const goals=(await getAll('financeGoals')).sort((a,b)=>(a.status==='completed')-(b.status==='completed')||String(a.deadline||'9999').localeCompare(String(b.deadline||'9999')));
  root.innerHTML=`<section class="page">${pageHead('METAS FINANCEIRAS','Planeje reservas, compras e objetivos de médio ou longo prazo.',`<button id="newGoalBtn" class="btn btn-primary">+ Nova meta</button>`)}${financeNav('goals',month)}
    <div class="grid grid-3">${goals.length?goals.map(g=>goalCard(g)).join(''):'<article class="card span-2"><div class="empty-state">Nenhuma meta criada. Cadastre um objetivo e acompanhe o progresso.</div></article>'}</div>
  </section>`;
  bindFinanceNavigation(root);
  root.querySelector('#newGoalBtn').onclick=()=>openGoalModal(ctx,{});
  root.querySelectorAll('[data-edit-goal]').forEach(btn=>btn.onclick=()=>openGoalModal(ctx,goals.find(g=>g.id===btn.dataset.editGoal)));
  root.querySelectorAll('[data-delete-goal]').forEach(btn=>btn.onclick=async()=>{if(await confirmModal('Excluir meta?','O objetivo e seu progresso serão removidos.','Excluir')){await remove('financeGoals',btn.dataset.deleteGoal);await addActivity('financeiro','Meta financeira excluída');toast('Meta excluída.');ctx.refresh();}});
}

async function renderSetup(root,ctx,month){
  const [accounts,categories,transactions,budgets,recurring]=await Promise.all([getAll('financeAccounts'),getAll('financeCategories'),getAll('financeTransactions'),getAll('financeBudgets'),getAll('financeRecurring')]);
  root.innerHTML=`<section class="page">${pageHead('CONTAS E CATEGORIAS','Organize onde o dinheiro fica e como cada movimentação será classificada.',`<button id="newAccountBtn" class="btn btn-primary">+ Conta</button><button id="newCategoryBtn" class="btn btn-secondary">+ Categoria</button>`)}${financeNav('setup',month)}
    <div class="grid grid-2"><article class="card"><div class="card-head"><h3>Contas</h3><span class="badge">${accounts.length}</span></div><div class="finance-list">${accounts.map(a=>`<div class="finance-row"><span class="finance-row-icon account">▣</span><div><b>${escapeHTML(a.name)}</b><small>${escapeHTML(a.type)} · saldo inicial ${money(a.initialBalance)}</small></div><div class="finance-row-actions"><button class="btn btn-secondary btn-sm" data-edit-account="${a.id}">Editar</button><button class="btn btn-danger btn-sm" data-delete-account="${a.id}">Excluir</button></div></div>`).join('')}</div></article>
      <article class="card"><div class="card-head"><h3>Categorias</h3><span class="badge">${categories.length}</span></div><div class="finance-category-list">${categories.sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name)).map(c=>`<div class="finance-category"><span>${escapeHTML(c.icon||'•')}</span><div><b>${escapeHTML(c.name)}</b><small>${c.type==='income'?'Entrada':'Gasto'}</small></div><button class="btn btn-danger btn-sm" data-delete-category="${c.id}">Excluir</button></div>`).join('')}</div></article></div>
  </section>`;
  bindFinanceNavigation(root);
  root.querySelector('#newAccountBtn').onclick=()=>openAccountModal(ctx,{});
  root.querySelector('#newCategoryBtn').onclick=()=>openCategoryModal(ctx,{});
  root.querySelectorAll('[data-edit-account]').forEach(btn=>btn.onclick=()=>openAccountModal(ctx,accounts.find(a=>a.id===btn.dataset.editAccount)));
  root.querySelectorAll('[data-delete-account]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.deleteAccount;if(accounts.length<=1)return toast('Mantenha pelo menos uma conta.','error');if(transactions.some(t=>t.accountId===id)||recurring.some(r=>r.accountId===id))return toast('Esta conta possui movimentações ou recorrências e não pode ser excluída.','error');if(await confirmModal('Excluir conta?','A conta será removida.','Excluir')){await remove('financeAccounts',id);await addActivity('financeiro','Conta financeira excluída');ctx.refresh();}});
  root.querySelectorAll('[data-delete-category]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.deleteCategory;if(transactions.some(t=>t.categoryId===id)||budgets.some(b=>b.categoryId===id)||recurring.some(r=>r.categoryId===id))return toast('Esta categoria está em uso e não pode ser excluída.','error');if(await confirmModal('Excluir categoria?','A categoria será removida.','Excluir')){await remove('financeCategories',id);await addActivity('financeiro','Categoria financeira excluída');ctx.refresh();}});
}

function bindFinanceNavigation(root){
  root.querySelectorAll('[data-finance-view]').forEach(btn=>btn.onclick=()=>navigate('finance',`?view=${btn.dataset.financeView}&month=${btn.dataset.month||currentMonth()}`));
}

function transactionRow(t,categoryMap,accountMap={},withActions=false){
  const category=categoryMap[t.categoryId];const account=accountMap[t.accountId];
  return `<div class="finance-row" data-transaction-row="${t.id}"><span class="finance-row-icon ${t.type}">${t.type==='income'?'+':'−'}</span><div><b>${escapeHTML(t.description)}</b><small>${localDateLabel(t.date)} · ${escapeHTML(category?.name||'Sem categoria')}${account?.name?` · ${escapeHTML(account.name)}`:''}</small></div><strong class="${t.type}">${t.type==='income'?'+':'−'} ${money(t.amount)}</strong>${withActions?`<div class="finance-row-actions"><button class="btn btn-secondary btn-sm" data-edit-transaction="${t.id}">Editar</button><button class="btn btn-danger btn-sm" data-delete-transaction="${t.id}">Excluir</button></div>`:''}</div>`;
}

function goalCard(g){const target=Math.max(1,Number(g.targetAmount||0)),current=Number(g.currentAmount||0),pct=Math.min(100,Math.round(current/target*100));return `<article class="card finance-goal-card"><div class="card-head"><h3>${escapeHTML(g.name)}</h3><span class="badge ${pct>=100?'success':''}">${pct}%</span></div><strong>${money(current)}</strong><small>de ${money(target)}${g.deadline?` · até ${localDateLabel(g.deadline)}`:''}</small><div class="finance-progress"><i style="width:${pct}%"></i></div><p>${escapeHTML(g.notes||'Objetivo financeiro pessoal.')}</p><div class="action-row"><button class="btn btn-secondary btn-sm" data-edit-goal="${g.id}">Atualizar</button><button class="btn btn-danger btn-sm" data-delete-goal="${g.id}">Excluir</button></div></article>`;}

function planningSummary(recurring){const active=recurring.filter(r=>r.active!==false);const income=active.filter(r=>r.type==='income').reduce((s,r)=>s+Number(r.amount||0),0);const expense=active.filter(r=>r.type==='expense').reduce((s,r)=>s+Number(r.amount||0),0);return `<div class="grid grid-2"><div class="kv"><small>ENTRADAS RECORRENTES</small><strong>${money(income)}</strong></div><div class="kv"><small>GASTOS RECORRENTES</small><strong>${money(expense)}</strong></div><div class="kv span-2"><small>RESULTADO PLANEJADO</small><strong class="${income-expense>=0?'finance-positive':'finance-negative'}">${money(income-expense)}</strong></div></div>`;}

function bindTransactionActions(root,ctx,transactions){
  root.querySelectorAll('[data-edit-transaction]').forEach(btn=>btn.onclick=()=>openTransactionModal(ctx,transactions.find(t=>t.id===btn.dataset.editTransaction)));
  root.querySelectorAll('[data-delete-transaction]').forEach(btn=>btn.onclick=async()=>{if(await confirmModal('Excluir movimentação?','O lançamento será removido do saldo e dos relatórios.','Excluir')){await remove('financeTransactions',btn.dataset.deleteTransaction);await addActivity('financeiro','Movimentação excluída');toast('Movimentação excluída.');ctx.refresh();}});
}

async function openTransactionModal(ctx,item={}){
  const [accounts,categories]=await Promise.all([getAll('financeAccounts'),getAll('financeCategories')]);
  const type=item.type||'expense';
  const modal=openModal(`<div class="modal-head"><h3>${item.id?'Editar':'Nova'} movimentação</h3><button class="modal-close" type="button">×</button></div><form id="transactionForm" class="form-grid"><label class="field"><span>Tipo</span><select name="type" id="transactionType"><option value="expense" ${type==='expense'?'selected':''}>Gasto</option><option value="income" ${type==='income'?'selected':''}>Entrada</option></select></label><label class="field"><span>Data</span><input name="date" type="date" value="${escapeHTML(item.date||todayISO())}" required></label><label class="field span-2"><span>Descrição</span><input name="description" maxlength="90" value="${escapeHTML(item.description||'')}" placeholder="Ex.: supermercado, salário, combustível" required></label><label class="field"><span>Valor</span><input name="amount" type="number" step="0.01" min="0.01" value="${item.amount??''}" required></label><label class="field"><span>Conta</span><select name="accountId">${accounts.map(a=>`<option value="${a.id}" ${item.accountId===a.id?'selected':''}>${escapeHTML(a.name)}</option>`).join('')}</select></label><label class="field span-2"><span>Categoria</span><select name="categoryId" id="transactionCategory"></select></label><label class="field span-2"><span>Observações</span><textarea name="notes" maxlength="500" placeholder="Informações opcionais">${escapeHTML(item.notes||'')}</textarea></label><div class="span-2 action-row"><button class="btn btn-primary" type="submit">Salvar movimentação</button></div></form>`);
  const categorySelect=modal.querySelector('#transactionCategory');
  const fillCategories=()=>{const selectedType=modal.querySelector('#transactionType').value;const list=categories.filter(c=>c.type===selectedType);categorySelect.innerHTML=list.map(c=>`<option value="${c.id}" ${item.categoryId===c.id?'selected':''}>${escapeHTML(c.icon||'•')} ${escapeHTML(c.name)}</option>`).join('');};
  fillCategories();modal.querySelector('#transactionType').onchange=fillCategories;
  modal.querySelector('#transactionForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={id:item.id||uid('fin'),type:String(fd.get('type')),date:String(fd.get('date')),description:String(fd.get('description')).trim(),amount:number(fd.get('amount')),accountId:String(fd.get('accountId')),categoryId:String(fd.get('categoryId')),notes:String(fd.get('notes')||'').trim(),createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};if(!row.description||row.amount<=0)return toast('Informe descrição e valor válido.','error');await put('financeTransactions',row);await addActivity('financeiro',`${row.type==='income'?'Entrada':'Gasto'} registrado: ${row.description}`);toast('Movimentação salva.');modal.close();ctx.refresh();};
}

async function openBudgetModal(ctx,item={}){const categories=(await getAll('financeCategories')).filter(c=>c.type==='expense');const modal=openModal(`<div class="modal-head"><h3>Definir orçamento</h3><button class="modal-close" type="button">×</button></div><form id="budgetForm" class="form-grid"><label class="field"><span>Mês</span><input name="month" type="month" value="${escapeHTML(item.month||currentMonth())}" required></label><label class="field"><span>Categoria</span><select name="categoryId">${categories.map(c=>`<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('')}</select></label><label class="field span-2"><span>Limite mensal</span><input name="limit" type="number" step="0.01" min="0.01" required></label><div class="span-2 action-row"><button class="btn btn-primary">Salvar orçamento</button></div></form>`);modal.querySelector('#budgetForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget),month=String(fd.get('month')),categoryId=String(fd.get('categoryId'));const existing=(await getAll('financeBudgets')).find(b=>b.month===month&&b.categoryId===categoryId);await put('financeBudgets',{id:existing?.id||uid('budget'),month,categoryId,limit:number(fd.get('limit')),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});await addActivity('financeiro','Orçamento mensal atualizado');toast('Orçamento salvo.');modal.close();ctx.refresh();};}

async function openRecurringModal(ctx,item={}){const [accounts,categories]=await Promise.all([getAll('financeAccounts'),getAll('financeCategories')]);const type=item.type||'expense';const modal=openModal(`<div class="modal-head"><h3>${item.id?'Editar':'Novo'} compromisso recorrente</h3><button class="modal-close" type="button">×</button></div><form id="recurringForm" class="form-grid"><label class="field"><span>Tipo</span><select name="type" id="recurringType"><option value="expense" ${type==='expense'?'selected':''}>Gasto</option><option value="income" ${type==='income'?'selected':''}>Entrada</option></select></label><label class="field"><span>Dia do mês</span><input name="day" type="number" min="1" max="31" value="${item.day||1}" required></label><label class="field span-2"><span>Descrição</span><input name="description" value="${escapeHTML(item.description||'')}" required></label><label class="field"><span>Valor previsto</span><input name="amount" type="number" min="0.01" step="0.01" value="${item.amount??''}" required></label><label class="field"><span>Conta</span><select name="accountId">${accounts.map(a=>`<option value="${a.id}" ${item.accountId===a.id?'selected':''}>${escapeHTML(a.name)}</option>`).join('')}</select></label><label class="field span-2"><span>Categoria</span><select name="categoryId" id="recurringCategory"></select></label><label class="field span-2"><span>Status</span><select name="active"><option value="true" ${item.active!==false?'selected':''}>Ativo</option><option value="false" ${item.active===false?'selected':''}>Pausado</option></select></label><div class="span-2 action-row"><button class="btn btn-primary">Salvar recorrência</button></div></form>`);const select=modal.querySelector('#recurringCategory');const fill=()=>{const selected=modal.querySelector('#recurringType').value;select.innerHTML=categories.filter(c=>c.type===selected).map(c=>`<option value="${c.id}" ${item.categoryId===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('');};fill();modal.querySelector('#recurringType').onchange=fill;modal.querySelector('#recurringForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={id:item.id||uid('recurring'),type:String(fd.get('type')),description:String(fd.get('description')).trim(),amount:number(fd.get('amount')),day:Math.min(31,Math.max(1,Number(fd.get('day'))||1)),accountId:String(fd.get('accountId')),categoryId:String(fd.get('categoryId')),active:String(fd.get('active'))==='true',createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};await put('financeRecurring',row);await addActivity('financeiro',`Recorrência salva: ${row.description}`);toast('Recorrência salva.');modal.close();ctx.refresh();};}

async function openGoalModal(ctx,item={}){const modal=openModal(`<div class="modal-head"><h3>${item.id?'Atualizar':'Nova'} meta financeira</h3><button class="modal-close" type="button">×</button></div><form id="goalForm" class="form-grid"><label class="field span-2"><span>Nome da meta</span><input name="name" maxlength="90" value="${escapeHTML(item.name||'')}" placeholder="Ex.: reserva de emergência" required></label><label class="field"><span>Valor desejado</span><input name="targetAmount" type="number" min="0.01" step="0.01" value="${item.targetAmount??''}" required></label><label class="field"><span>Valor acumulado</span><input name="currentAmount" type="number" min="0" step="0.01" value="${item.currentAmount??0}" required></label><label class="field"><span>Prazo opcional</span><input name="deadline" type="date" value="${escapeHTML(item.deadline||'')}"></label><label class="field"><span>Status</span><select name="status"><option value="active" ${item.status!=='completed'?'selected':''}>Em andamento</option><option value="completed" ${item.status==='completed'?'selected':''}>Concluída</option></select></label><label class="field span-2"><span>Observações</span><textarea name="notes" maxlength="500">${escapeHTML(item.notes||'')}</textarea></label><div class="span-2 action-row"><button class="btn btn-primary">Salvar meta</button></div></form>`);modal.querySelector('#goalForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={id:item.id||uid('goal'),name:String(fd.get('name')).trim(),targetAmount:number(fd.get('targetAmount')),currentAmount:number(fd.get('currentAmount')),deadline:String(fd.get('deadline')||''),status:String(fd.get('status')),notes:String(fd.get('notes')||'').trim(),createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};if(row.currentAmount>=row.targetAmount)row.status='completed';await put('financeGoals',row);await addActivity('financeiro',`Meta atualizada: ${row.name}`);toast('Meta salva.');modal.close();ctx.refresh();};}

async function openAccountModal(ctx,item={}){const modal=openModal(`<div class="modal-head"><h3>${item.id?'Editar':'Nova'} conta</h3><button class="modal-close" type="button">×</button></div><form id="accountForm" class="form-grid"><label class="field span-2"><span>Nome</span><input name="name" maxlength="70" value="${escapeHTML(item.name||'')}" placeholder="Ex.: Conta corrente, Carteira, Poupança" required></label><label class="field"><span>Tipo</span><select name="type">${['Conta corrente','Carteira','Poupança','Investimento','Cartão/controle','Outro'].map(t=>`<option ${item.type===t?'selected':''}>${t}</option>`).join('')}</select></label><label class="field"><span>Saldo inicial</span><input name="initialBalance" type="number" step="0.01" value="${item.initialBalance??0}" required></label><div class="span-2 action-row"><button class="btn btn-primary">Salvar conta</button></div></form>`);modal.querySelector('#accountForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={id:item.id||uid('account'),name:String(fd.get('name')).trim(),type:String(fd.get('type')),initialBalance:Number(fd.get('initialBalance'))||0,active:true,createdAt:item.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};await put('financeAccounts',row);await addActivity('financeiro',`Conta salva: ${row.name}`);toast('Conta salva.');modal.close();ctx.refresh();};}

async function openCategoryModal(ctx,item={}){const modal=openModal(`<div class="modal-head"><h3>Nova categoria</h3><button class="modal-close" type="button">×</button></div><form id="categoryForm" class="form-grid"><label class="field"><span>Tipo</span><select name="type"><option value="expense">Gasto</option><option value="income">Entrada</option></select></label><label class="field"><span>Ícone curto</span><input name="icon" maxlength="3" value="•"></label><label class="field span-2"><span>Nome</span><input name="name" maxlength="60" required></label><div class="span-2 action-row"><button class="btn btn-primary">Salvar categoria</button></div></form>`);modal.querySelector('#categoryForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={id:uid('category'),name:String(fd.get('name')).trim(),type:String(fd.get('type')),icon:String(fd.get('icon')||'•').trim(),active:true,createdAt:new Date().toISOString()};await put('financeCategories',row);await addActivity('financeiro',`Categoria criada: ${row.name}`);toast('Categoria criada.');modal.close();ctx.refresh();};}
