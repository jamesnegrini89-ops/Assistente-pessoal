const INTERACTIONS_URL='https://generativelanguage.googleapis.com/v1/interactions';

export function normalizeGeminiModel(value=''){
  return String(value).trim().replace(/^models\//i,'');
}

function friendlyError(status,message=''){
  const detail=String(message||'').replace(/AIza[0-9A-Za-z_-]+/g,'[CHAVE OCULTA]').trim();
  if(status===400)return `A solicitação foi recusada. Confira o nome do modelo e se a chave é compatível. ${detail}`.trim();
  if(status===401)return `A chave não foi aceita. Gere ou copie novamente a chave no Google AI Studio. ${detail}`.trim();
  if(status===403)return `A chave não possui permissão para usar a Gemini API ou está bloqueada/restrita. ${detail}`.trim();
  if(status===404)return `O modelo informado não foi encontrado ou não está disponível para esta chave. ${detail}`.trim();
  if(status===429)return `A conexão foi reconhecida, mas a cota ou o limite de solicitações foi atingido. ${detail}`.trim();
  if(status>=500)return `O serviço Gemini está temporariamente indisponível. Tente novamente mais tarde. ${detail}`.trim();
  return detail||`Falha na conexão com a Gemini API (HTTP ${status}).`;
}

export async function testGeminiConnection({apiKey,model,timeoutMs=25000}={}){
  const key=String(apiKey||'').trim();
  const normalizedModel=normalizeGeminiModel(model);
  if(!key)throw new Error('Informe a chave API do Google Gemini.');
  if(!normalizedModel)throw new Error('Informe o nome do modelo Gemini.');
  if(!navigator.onLine)throw new Error('O aparelho está sem internet. Conecte-se e teste novamente.');

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  const started=performance.now();
  try{
    const response=await fetch(INTERACTIONS_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:JSON.stringify({
        model:normalizedModel,
        input:'Responda somente com a palavra OK.',
        store:false
      }),
      signal:controller.signal,
      cache:'no-store'
    });
    const raw=await response.text();
    let data={};
    if(raw){try{data=JSON.parse(raw)}catch{data={raw}}}
    if(!response.ok)throw new Error(friendlyError(response.status,data?.error?.message||data?.message||raw));
    return {
      ok:true,
      model:normalizedModel,
      latencyMs:Math.max(1,Math.round(performance.now()-started)),
      testedAt:new Date().toISOString(),
      interactionId:data?.id||'',
      api:'Interactions API v1'
    };
  }catch(error){
    if(error?.name==='AbortError')throw new Error('O teste excedeu 25 segundos. Verifique a internet e tente novamente.');
    if(error instanceof TypeError)throw new Error('Não foi possível alcançar a Gemini API. Verifique a internet, o navegador ou bloqueios de rede.');
    throw error;
  }finally{clearTimeout(timer)}
}
