import {getSettings,setSetting,remove,addActivity} from '../db.js';
import {testGeminiConnection,normalizeGeminiModel} from '../gemini.js';
import {applyTheme,escapeHTML,formatDate,pageHead,toast} from '../ui.js';

function connectionView(connection,keyConfigured){
  if(connection?.ok){
    return {badge:'Conectado',badgeClass:'success',state:'success',title:'Conexão confirmada',message:`Modelo ${connection.model} validado em ${connection.latencyMs||'—'} ms. Último teste: ${formatDate(connection.testedAt)}.`};
  }
  if(connection?.error){
    return {badge:'Com erro',badgeClass:'warning',state:'error',title:'Teste não aprovado',message:connection.error};
  }
  if(keyConfigured){
    return {badge:'Não testado',badgeClass:'warning',state:'neutral',title:'Chave salva localmente',message:'Use “Testar conexão” para validar a chave, o modelo, a cota e o acesso à API.'};
  }
  return {badge:'Não configurado',badgeClass:'',state:'neutral',title:'Gemini ainda não configurado',message:'Informe sua chave e o modelo que deseja utilizar.'};
}

export async function renderConfiguracoes(root,ctx){
  const s=await getSettings();
  const apiKey=String(s.geminiApiKey||'');
  const model=String(s.geminiModel||'gemini-3.5-flash');
  const status=connectionView(s.geminiConnection,Boolean(apiKey));
  root.innerHTML=`<section class="page">${pageHead('CONFIGURAÇÕES','Personalize a aparência, o perfil, a inteligência artificial e o comportamento geral do sistema.')}
    <form id="settingsForm" class="grid grid-2"><article class="card"><div class="card-head"><h3>Perfil local</h3><span class="badge success">Não publicado</span></div><div class="form-grid"><label class="field span-2"><span>Como deseja ser chamado</span><input name="profileName" maxlength="50" value="${escapeHTML(s.profileName||'VIP')}" required></label><label class="field"><span>Modo inicial</span><select name="currentMode">${['Pessoal','Plantão','Pós-plantão','Folga','Casa','Estudo','Recuperação','Modo mínimo'].map(m=>`<option ${s.currentMode===m?'selected':''}>${m}</option>`).join('')}</select></label><label class="field"><span>Idioma</span><select disabled><option>Português do Brasil</option></select></label></div></article>
    <article class="card"><div class="card-head"><h3>Identidade visual VIP</h3><span class="badge">Metálico</span></div><div class="form-grid"><label class="field"><span>Tema</span><select name="theme"><option value="dark" ${s.theme==='dark'?'selected':''}>Escuro</option><option value="light" ${s.theme==='light'?'selected':''}>Claro</option><option value="system" ${s.theme==='system'?'selected':''}>Automático</option></select></label><label class="field"><span>Tamanho do texto</span><select name="fontScale"><option value="small" ${s.fontScale==='small'?'selected':''}>Compacto</option><option value="normal" ${!s.fontScale||s.fontScale==='normal'?'selected':''}>Normal</option><option value="large" ${s.fontScale==='large'?'selected':''}>Ampliado</option></select></label></div><div class="section-note" style="margin-top:13px">Paleta fixa: azul-marinho, azul elétrico e verde metálico. As cores de alerta permanecem reservadas para risco, atenção e sucesso.</div></article>

    <article class="card span-2"><div class="card-head"><h3>Inteligência Artificial · Google Gemini</h3><span id="geminiBadge" class="badge ${status.badgeClass}">${status.badge}</span></div>
      <p>Configure uma chave exclusiva do Google AI Studio e escreva o identificador exato do modelo. O teste realiza uma solicitação mínima para confirmar chave, modelo, internet, permissão e cota.</p>
      <div class="form-grid">
        <label class="field"><span>Integração Gemini</span><select name="geminiEnabled"><option value="true" ${s.geminiEnabled!==false?'selected':''}>Ativada</option><option value="false" ${s.geminiEnabled===false?'selected':''}>Desativada</option></select></label>
        <label class="field"><span>Modelo da API</span><input id="geminiModel" name="geminiModel" list="geminiModelSuggestions" value="${escapeHTML(model)}" placeholder="Ex.: gemini-3.5-flash" autocomplete="off" spellcheck="false" required><datalist id="geminiModelSuggestions"><option value="gemini-3.5-flash"><option value="gemini-3.1-flash-lite"></datalist></label>
        <label class="field span-2"><span>Chave API do Google</span><div class="secret-input"><input id="geminiApiKey" name="geminiApiKey" type="password" value="${escapeHTML(apiKey)}" placeholder="Cole sua chave aqui" autocomplete="off" autocapitalize="off" spellcheck="false"><button id="toggleApiKeyBtn" class="btn btn-secondary btn-sm" type="button">Mostrar</button></div></label>
      </div>
      <div id="geminiStatus" class="api-status ${status.state}" aria-live="polite"><strong>${escapeHTML(status.title)}</strong><span>${escapeHTML(status.message)}</span></div>
      <div class="action-row" style="margin-top:13px"><button id="testGeminiBtn" class="btn btn-primary" type="button">Testar conexão</button><button id="deleteGeminiKeyBtn" class="btn btn-danger" type="button" ${apiKey?'':'disabled'}>Apagar chave salva</button></div>
      <div class="section-note api-warning" style="margin-top:13px"><strong>Aviso de segurança:</strong> a chave ficará somente no IndexedDB deste navegador e não será incluída no GitHub nem no backup do GUARDIÃO. Como a chamada será feita diretamente pelo navegador, este modo é adequado apenas para uso pessoal e ainda é menos seguro que uma ponte de servidor.</div>
    </article>

    <article class="card span-2"><div class="card-head"><h3>Princípios da versão Genesis</h3><span class="badge success">0.1.2</span></div><div class="grid grid-4"><div class="kv"><small>DADOS</small><strong>Armazenados no navegador</strong></div><div class="kv"><small>INTERNET</small><strong>Exigida apenas para a IA</strong></div><div class="kv"><small>IA ONLINE</small><strong>${s.geminiConnection?.ok?'Gemini conectado':'Configuração disponível'}</strong></div><div class="kv"><small>ATUALIZAÇÃO</small><strong>Arquivos pelo GitHub</strong></div></div><p>As áreas locais continuam funcionando sem internet. Somente os recursos que consultarem o Gemini dependerão de conexão.</p></article>
    <div class="span-2 action-row"><button class="btn btn-primary" type="submit">Salvar configurações</button><button id="goGuardianBtn" class="btn btn-secondary" type="button">Abrir GUARDIÃO</button></div></form>
  </section>`;

  const form=root.querySelector('#settingsForm');
  const keyInput=root.querySelector('#geminiApiKey');
  const modelInput=root.querySelector('#geminiModel');
  const testBtn=root.querySelector('#testGeminiBtn');
  const deleteBtn=root.querySelector('#deleteGeminiKeyBtn');

  root.querySelector('#toggleApiKeyBtn').onclick=e=>{const showing=keyInput.type==='text';keyInput.type=showing?'password':'text';e.currentTarget.textContent=showing?'Mostrar':'Ocultar';};

  testBtn.onclick=async()=>{
    const key=keyInput.value.trim(),selectedModel=normalizeGeminiModel(modelInput.value);
    const original=testBtn.textContent;testBtn.disabled=true;testBtn.textContent='Testando…';
    const box=root.querySelector('#geminiStatus');box.className='api-status testing';box.innerHTML='<strong>Verificando conexão</strong><span>Aguarde a resposta da Gemini API.</span>';
    try{
      const result=await testGeminiConnection({apiKey:key,model:selectedModel});
      await setSetting('geminiApiKey',key);await setSetting('geminiModel',selectedModel);await setSetting('geminiEnabled',true);await setSetting('geminiConnection',result);
      await addActivity('gemini',`Conexão validada com o modelo ${selectedModel}`);
      toast('Conexão com Gemini confirmada.');ctx.refresh();
    }catch(error){
      const failure={ok:false,error:error.message||'Falha desconhecida.',model:selectedModel,testedAt:new Date().toISOString()};
      await setSetting('geminiConnection',failure);await addActivity('gemini',`Teste não aprovado para o modelo ${selectedModel||'não informado'}`);
      box.className='api-status error';box.innerHTML=`<strong>Conexão não aprovada</strong><span>${escapeHTML(failure.error)}</span>`;toast('Não foi possível validar a conexão.','error');
    }finally{testBtn.disabled=false;testBtn.textContent=original;}
  };

  deleteBtn.onclick=async()=>{
    await remove('settings','geminiApiKey');await remove('settings','geminiConnection');
    await addActivity('gemini','Chave local do Gemini removida');toast('Chave do Gemini apagada deste navegador.');ctx.refresh();
  };

  form.onsubmit=async e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget);
    for(const key of ['profileName','currentMode','theme','fontScale'])await setSetting(key,String(fd.get(key)));
    const selectedModel=normalizeGeminiModel(fd.get('geminiModel'));
    const enteredKey=String(fd.get('geminiApiKey')||'').trim();
    await setSetting('geminiEnabled',String(fd.get('geminiEnabled'))==='true');
    await setSetting('geminiModel',selectedModel||'gemini-3.5-flash');
    if(enteredKey)await setSetting('geminiApiKey',enteredKey);else await remove('settings','geminiApiKey');
    await addActivity('configuracao','Preferências e integração Gemini atualizadas');
    applyTheme(Object.fromEntries(fd.entries()));ctx.updateProfile();toast('Configurações salvas.');ctx.refresh();
  };
  root.querySelector('#goGuardianBtn').onclick=()=>location.hash='#guardiao';
}
