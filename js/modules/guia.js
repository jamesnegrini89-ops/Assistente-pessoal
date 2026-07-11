import {getSetting,setSetting,addActivity} from '../db.js';
import {askGemini} from '../gemini.js';
import {escapeHTML,navigate,pageHead,toast,uid} from '../ui.js';
import {MANUAL_CATEGORIES,findManualEntries,getManualEntry,manualContext} from '../manual-data.js';

const MAX_HISTORY=30;
const starterQuestions=[
  'Como faço um backup?',
  'Como criar um checklist na FORJA?',
  'Como analisar uma compra no ORÁCULO?',
  'Onde configuro e testo o Gemini?',
  'Como pesquisar uma memória antiga?',
  'Como instalar a nova versão no celular?'
];

function safeHistory(value){return Array.isArray(value)?value.filter(item=>item&&['user','assistant'].includes(item.role)&&typeof item.text==='string').slice(-MAX_HISTORY):[];}
function currentAIStatus(settings){
  const configured=Boolean(settings.geminiEnabled!==false&&settings.geminiApiKey&&settings.geminiModel);
  const tested=Boolean(settings.geminiConnection?.ok);
  return {available:configured&&navigator.onLine,configured,tested,label:configured?(tested?'Gemini conectado':'Gemini configurado'):'Gemini não configurado'};
}
function formatPlainText(text=''){
  const escaped=escapeHTML(text).replace(/\r/g,'');
  const lines=escaped.split('\n');
  let html='',listOpen=false;
  const closeList=()=>{if(listOpen){html+='</ol>';listOpen=false;}};
  for(const raw of lines){
    const line=raw.trim();
    if(!line){closeList();continue;}
    const numbered=line.match(/^(\d+)[.)]\s+(.+)$/);
    if(numbered){if(!listOpen){html+='<ol>';listOpen=true;}html+=`<li>${numbered[2]}</li>`;continue;}
    closeList();
    if(/^#{1,3}\s+/.test(line))html+=`<h4>${line.replace(/^#{1,3}\s+/,'')}</h4>`;
    else if(/^[-•]\s+/.test(line))html+=`<p>• ${line.replace(/^[-•]\s+/,'')}</p>`;
    else html+=`<p>${line.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</p>`;
  }
  closeList();return html||'<p>Não encontrei conteúdo para exibir.</p>';
}
function localAnswer(entry){
  if(!entry)return {title:'Não encontrei uma função específica',text:'Não consegui relacionar essa pergunta a uma ferramenta atual. Tente mencionar AGORA, QG, MEMÓRIA, ORÁCULO, FORJA, GUARDIÃO, CONFIGURAÇÕES, GEMINI ou VIP GUIA.',route:'guia',related:starterQuestions.slice(0,3)};
  const sections=[entry.summary,'','Como utilizar corretamente:',...entry.steps.map((step,index)=>`${index+1}. ${step}`)];
  if(entry.tips.length)sections.push('','Dica:',...entry.tips.map(t=>`• ${t}`));
  if(entry.warnings.length)sections.push('','Atenção:',...entry.warnings.map(w=>`• ${w}`));
  return {title:entry.title,text:sections.join('\n'),route:entry.route,related:entry.questions.slice(0,3)};
}
function renderMessage(message){
  const isUser=message.role==='user';
  return `<article class="guide-message ${isUser?'user':'assistant'}"><div class="guide-avatar">${isUser?'EU':'VIP'}</div><div class="guide-bubble">${message.title?`<h3>${escapeHTML(message.title)}</h3>`:''}<div class="guide-text">${formatPlainText(message.text)}</div>${message.source?`<div class="guide-meta"><span class="badge ${message.source==='Gemini'?'success':''}">${escapeHTML(message.source)}</span>${message.model?`<span>${escapeHTML(message.model)}</span>`:''}</div>`:''}${!isUser&&message.route?`<div class="action-row guide-actions"><button class="btn btn-primary btn-sm" data-open-route="${escapeHTML(message.route)}">Abrir função</button>${(message.related||[]).slice(0,3).map(q=>`<button class="btn btn-secondary btn-sm" data-guide-question="${escapeHTML(q)}">${escapeHTML(q)}</button>`).join('')}</div>`:''}</div></article>`;
}
function renderConversation(container,history){
  container.innerHTML=history.length?history.map(renderMessage).join(''):`<div class="guide-welcome"><span class="module-symbol">?</span><h3>Olá! Eu sou o VIP Guia.</h3><p>Pergunte como funciona qualquer área do aplicativo. Posso responder com o manual offline ou ampliar a explicação com o Gemini.</p></div>`;
  container.querySelectorAll('[data-open-route]').forEach(button=>button.onclick=()=>{const [route,query='']=button.dataset.openRoute.split('?');navigate(route,query?`?${query}`:'');});
  container.querySelectorAll('[data-guide-question]').forEach(button=>button.onclick=()=>{const input=document.querySelector('#guideQuestion');if(input){input.value=button.dataset.guideQuestion;input.focus();}});
  container.scrollTop=container.scrollHeight;
}
async function saveHistory(history){await setSetting('guideHistory',history.slice(-MAX_HISTORY));}

export async function renderGuia(root,ctx){
  const settings={
    geminiEnabled:await getSetting('geminiEnabled',true),
    geminiApiKey:await getSetting('geminiApiKey',''),
    geminiModel:await getSetting('geminiModel','gemini-3.5-flash'),
    geminiConnection:await getSetting('geminiConnection',null)
  };
  let history=safeHistory(await getSetting('guideHistory',[]));
  const ai=currentAIStatus(settings);
  root.innerHTML=`<section class="page">${pageHead('VIP Guia','Manual interativo oficial do Assistente Pessoal VIP, com respostas offline e explicações ampliadas pelo Gemini.','<button id="clearGuideBtn" class="btn btn-secondary">Limpar conversa</button>')}
    <div class="guide-layout">
      <aside class="guide-sidebar-panel">
        <article class="card guide-status-card"><div class="card-head"><h3>Modo de resposta</h3><span class="badge ${ai.tested?'success':ai.configured?'warning':''}">${escapeHTML(ai.label)}</span></div><label class="field"><span>Como deseja consultar</span><select id="guideMode"><option value="auto">Automático</option><option value="offline">Somente manual offline</option><option value="gemini">Preferir Gemini</option></select></label><p class="section-note">No modo Automático, o aplicativo tenta usar o Gemini quando disponível e recorre ao manual offline se houver falha.</p></article>
        <article class="card"><div class="card-head"><h3>Ferramentas</h3><span class="badge">Consulta rápida</span></div><div class="guide-category-grid">${MANUAL_CATEGORIES.map(([id,label])=>{const entry=getManualEntry(id);return `<button class="guide-category" type="button" data-manual-id="${id}"><span>${entry?.icon||'?'}</span><b>${escapeHTML(label)}</b></button>`;}).join('')}</div></article>
        <article class="card"><div class="card-head"><h3>Perguntas frequentes</h3></div><div class="guide-suggestions">${starterQuestions.map(q=>`<button type="button" data-guide-question="${escapeHTML(q)}">${escapeHTML(q)}</button>`).join('')}</div></article>
      </aside>
      <section class="card guide-chat-card"><div id="guideConversation" class="guide-conversation" aria-live="polite"></div><form id="guideForm" class="guide-composer"><textarea id="guideQuestion" rows="2" maxlength="700" placeholder="Ex.: Como criar um rastreador na FORJA?" required></textarea><div class="guide-composer-actions"><button id="guideMicBtn" class="btn btn-secondary" type="button" title="Perguntar por voz">🎙 Voz</button><button id="guideSendBtn" class="btn btn-primary" type="submit">Perguntar</button></div><small>As perguntas ficam neste navegador. Ao usar Gemini, a pergunta e os trechos necessários do manual são enviados à API com armazenamento desativado.</small></form></section>
    </div>
  </section>`;

  const conversation=root.querySelector('#guideConversation');
  const form=root.querySelector('#guideForm');
  const input=root.querySelector('#guideQuestion');
  const sendBtn=root.querySelector('#guideSendBtn');
  const modeSelect=root.querySelector('#guideMode');
  modeSelect.value=await getSetting('guideMode','auto');
  renderConversation(conversation,history);

  const ask=async(rawQuestion)=>{
    const question=String(rawQuestion||'').trim();if(!question)return;
    const mode=modeSelect.value;await setSetting('guideMode',mode);
    history.push({id:uid('guide'),role:'user',text:question,createdAt:new Date().toISOString()});
    history=history.slice(-MAX_HISTORY);renderConversation(conversation,history);await saveHistory(history);
    input.value='';sendBtn.disabled=true;sendBtn.textContent='Consultando…';
    const matches=findManualEntries(question,5);const offline=localAnswer(matches[0]);
    let answer={...offline,source:'Manual offline'};
    const shouldTryAI=mode!=='offline'&&ai.available;
    if(mode==='gemini'&&!ai.configured){toast('Configure e teste o Gemini em CONFIGURAÇÕES.','error');}
    try{
      if(shouldTryAI){
        const systemInstruction=`Você é o VIP Guia, manual oficial do aplicativo Assistente Pessoal VIP Genesis 0.1.2. Responda em português do Brasil, com linguagem simples, precisa e acolhedora. Use SOMENTE a documentação fornecida. Não invente telas, botões, integrações ou funções futuras. Se a função não existir nesta versão, diga claramente. Dê passos numerados quando houver procedimento. Diferencie o que funciona offline do que exige internet. Não peça nem repita a chave API. Não transforme a resposta em aconselhamento médico, jurídico ou financeiro. Finalize com uma dica curta quando útil.`;
        const prompt=`PERGUNTA DO USUÁRIO:\n${question}\n\nDOCUMENTAÇÃO OFICIAL MAIS RELEVANTE:\n${manualContext(matches.length?matches:findManualEntries('visão geral',5))}\n\nResponda diretamente à pergunta. Quando houver uma rota interna útil, mencione o nome do módulo, mas não invente links.`;
        const result=await askGemini({apiKey:settings.geminiApiKey,model:settings.geminiModel,input:prompt,systemInstruction,maxOutputTokens:1200,temperature:0.2});
        answer={title:matches[0]?.title||'Resposta do VIP Guia',text:result.text,route:matches[0]?.route||'guia',related:matches[0]?.questions?.slice(0,3)||starterQuestions.slice(0,3),source:'Gemini',model:result.model};
      }else if(mode==='gemini'&&ai.configured&&!navigator.onLine){answer.text=`O aparelho está sem internet, então usei o manual offline.\n\n${answer.text}`;}
    }catch(error){
      answer.text=`O Gemini não respondeu, então usei o manual offline. Motivo: ${error.message}\n\n${answer.text}`;
      answer.source='Manual offline · fallback';toast('Gemini indisponível; resposta offline exibida.','error');
    }
    history.push({id:uid('guide'),role:'assistant',...answer,createdAt:new Date().toISOString()});history=history.slice(-MAX_HISTORY);
    await saveHistory(history);await addActivity('guia',`Dúvida consultada: ${question.slice(0,90)}`);renderConversation(conversation,history);sendBtn.disabled=false;sendBtn.textContent='Perguntar';input.focus();
  };

  form.onsubmit=e=>{e.preventDefault();ask(input.value);};
  root.querySelectorAll('[data-guide-question]').forEach(button=>button.onclick=()=>{input.value=button.dataset.guideQuestion;input.focus();});
  root.querySelectorAll('[data-manual-id]').forEach(button=>button.onclick=()=>{const entry=getManualEntry(button.dataset.manualId);if(entry)ask(`Como funciona ${entry.module} e qual é a forma correta de utilizar?`);});
  root.querySelector('#clearGuideBtn').onclick=async()=>{history=[];await saveHistory(history);renderConversation(conversation,history);toast('Histórico do VIP Guia limpo.');};

  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const micBtn=root.querySelector('#guideMicBtn');
  if(!SpeechRecognition){micBtn.hidden=true;}else{
    micBtn.onclick=()=>{const recognition=new SpeechRecognition();recognition.lang='pt-BR';recognition.interimResults=false;recognition.maxAlternatives=1;micBtn.disabled=true;micBtn.textContent='Ouvindo…';recognition.onresult=e=>{input.value=e.results[0][0].transcript;input.focus();};recognition.onerror=()=>toast('Não foi possível reconhecer a voz.','error');recognition.onend=()=>{micBtn.disabled=false;micBtn.textContent='🎙 Voz';};recognition.start();};
  }
}
