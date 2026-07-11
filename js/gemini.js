const INTERACTIONS_URL='https://generativelanguage.googleapis.com/v1/interactions';

export function normalizeGeminiModel(value=''){
  return String(value).trim().replace(/^models\//i,'');
}

function hideSecrets(value=''){
  return String(value||'').replace(/AIza[0-9A-Za-z_-]+/g,'[CHAVE OCULTA]').replace(/AQ\.[0-9A-Za-z._-]+/g,'[CHAVE OCULTA]');
}

function friendlyError(status,message=''){
  const detail=hideSecrets(message).trim();
  if(status===400)return `A solicitação foi recusada. Confira o modelo e os dados enviados. ${detail}`.trim();
  if(status===401)return `A chave não foi aceita. Gere ou copie novamente a chave no Google AI Studio. ${detail}`.trim();
  if(status===403)return `A chave não possui permissão para usar a Gemini API ou está bloqueada/restrita. ${detail}`.trim();
  if(status===404)return `O modelo informado não foi encontrado ou não está disponível para esta chave. ${detail}`.trim();
  if(status===429)return `A conexão foi reconhecida, mas a cota ou o limite de solicitações foi atingido. ${detail}`.trim();
  if(status>=500)return `O serviço Gemini está temporariamente indisponível. Tente novamente mais tarde. ${detail}`.trim();
  return detail||`Falha na conexão com a Gemini API (HTTP ${status}).`;
}

function extractInteractionText(data={}){
  const texts=[];
  for(const step of Array.isArray(data.steps)?data.steps:[]){
    if(step?.type!=='model_output')continue;
    for(const content of Array.isArray(step.content)?step.content:[]){
      if(content?.type==='text'&&typeof content.text==='string')texts.push(content.text);
    }
  }
  return texts.join('\n').trim();
}

async function interactionRequest({apiKey,model,input,systemInstruction='',timeoutMs=45000,maxOutputTokens=1200,temperature=0.2}={}){
  const key=String(apiKey||'').trim();
  const normalizedModel=normalizeGeminiModel(model);
  const cleanInput=String(input||'').trim();
  if(!key)throw new Error('Informe a chave API do Google Gemini em CONFIGURAÇÕES.');
  if(!normalizedModel)throw new Error('Informe o nome do modelo Gemini em CONFIGURAÇÕES.');
  if(!cleanInput)throw new Error('Escreva uma pergunta para o Gemini.');
  if(!navigator.onLine)throw new Error('O aparelho está sem internet. Conecte-se e tente novamente.');

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  const started=performance.now();
  try{
    const body={
      model:normalizedModel,
      input:cleanInput,
      store:false,
      generation_config:{
        max_output_tokens:Math.max(16,Math.min(4096,Number(maxOutputTokens)||1200)),
        temperature:Math.max(0,Math.min(1,Number(temperature)||0))
      }
    };
    if(systemInstruction)body.system_instruction=String(systemInstruction);
    const response=await fetch(INTERACTIONS_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:JSON.stringify(body),
      signal:controller.signal,
      cache:'no-store'
    });
    const raw=await response.text();
    let data={};
    if(raw){try{data=JSON.parse(raw);}catch{data={raw};}}
    if(!response.ok)throw new Error(friendlyError(response.status,data?.error?.message||data?.message||raw));
    const text=extractInteractionText(data);
    if(!text)throw new Error('A Gemini API respondeu, mas não retornou texto utilizável. Confira se o modelo escolhido gera respostas em texto.');
    return {
      ok:true,
      text,
      model:data.model||normalizedModel,
      latencyMs:Math.max(1,Math.round(performance.now()-started)),
      interactionId:data.id||'',
      usage:data.usage||null,
      testedAt:new Date().toISOString(),
      api:'Interactions API v1'
    };
  }catch(error){
    if(error?.name==='AbortError')throw new Error(`A solicitação excedeu ${Math.round(timeoutMs/1000)} segundos. Verifique a internet e tente novamente.`);
    if(error instanceof TypeError)throw new Error('Não foi possível alcançar a Gemini API. Verifique a internet, o navegador ou bloqueios de rede.');
    throw error;
  }finally{clearTimeout(timer);}
}

export async function askGemini(options={}){
  return interactionRequest(options);
}

export async function testGeminiConnection({apiKey,model,timeoutMs=25000}={}){
  const result=await interactionRequest({
    apiKey,model,timeoutMs,
    input:'Responda somente com a palavra OK.',
    systemInstruction:'Responda somente com a palavra OK, sem explicações.',
    maxOutputTokens:24,
    temperature:0
  });
  return {
    ok:true,
    model:result.model,
    latencyMs:result.latencyMs,
    testedAt:result.testedAt,
    interactionId:result.interactionId,
    api:result.api
  };
}
