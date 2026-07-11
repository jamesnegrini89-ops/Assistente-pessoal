const DB_NAME = 'assistente_pessoal_vip_db';
const DB_VERSION = 2;
const SECRET_SETTING_KEYS = new Set(['geminiApiKey']);
export const STORES = ['settings','memories','decisions','forgeModules','forgeRecords','financeTransactions','financeAccounts','financeCategories','financeBudgets','financeGoals','financeRecurring','activity'];
let dbPromise;

export function openDB(){
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains('settings')) db.createObjectStore('settings',{keyPath:'key'});
      if(!db.objectStoreNames.contains('memories')){
        const s=db.createObjectStore('memories',{keyPath:'id'}); s.createIndex('createdAt','createdAt'); s.createIndex('category','category');
      }
      if(!db.objectStoreNames.contains('decisions')){
        const s=db.createObjectStore('decisions',{keyPath:'id'}); s.createIndex('createdAt','createdAt'); s.createIndex('status','status');
      }
      if(!db.objectStoreNames.contains('forgeModules')){
        const s=db.createObjectStore('forgeModules',{keyPath:'id'}); s.createIndex('createdAt','createdAt');
      }
      if(!db.objectStoreNames.contains('forgeRecords')){
        const s=db.createObjectStore('forgeRecords',{keyPath:'id'}); s.createIndex('moduleId','moduleId'); s.createIndex('createdAt','createdAt');
      }
      if(!db.objectStoreNames.contains('financeTransactions')){
        const s=db.createObjectStore('financeTransactions',{keyPath:'id'}); s.createIndex('date','date'); s.createIndex('type','type'); s.createIndex('accountId','accountId'); s.createIndex('categoryId','categoryId');
      }
      if(!db.objectStoreNames.contains('financeAccounts')){
        const s=db.createObjectStore('financeAccounts',{keyPath:'id'}); s.createIndex('name','name');
      }
      if(!db.objectStoreNames.contains('financeCategories')){
        const s=db.createObjectStore('financeCategories',{keyPath:'id'}); s.createIndex('type','type'); s.createIndex('name','name');
      }
      if(!db.objectStoreNames.contains('financeBudgets')){
        const s=db.createObjectStore('financeBudgets',{keyPath:'id'}); s.createIndex('month','month'); s.createIndex('categoryId','categoryId');
      }
      if(!db.objectStoreNames.contains('financeGoals')){
        const s=db.createObjectStore('financeGoals',{keyPath:'id'}); s.createIndex('status','status'); s.createIndex('deadline','deadline');
      }
      if(!db.objectStoreNames.contains('financeRecurring')){
        const s=db.createObjectStore('financeRecurring',{keyPath:'id'}); s.createIndex('type','type'); s.createIndex('day','day');
      }
      if(!db.objectStoreNames.contains('activity')){
        const s=db.createObjectStore('activity',{keyPath:'id'}); s.createIndex('createdAt','createdAt');
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  return dbPromise;
}

function requestToPromise(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function store(name,mode='readonly'){const db=await openDB();return db.transaction(name,mode).objectStore(name);}
export async function get(storeName,key){return requestToPromise((await store(storeName)).get(key));}
export async function getAll(storeName){return requestToPromise((await store(storeName)).getAll());}
export async function put(storeName,value){return requestToPromise((await store(storeName,'readwrite')).put(value));}
export async function remove(storeName,key){return requestToPromise((await store(storeName,'readwrite')).delete(key));}
export async function clearStore(storeName){return requestToPromise((await store(storeName,'readwrite')).clear());}
export async function getByIndex(storeName,indexName,key){return requestToPromise((await store(storeName)).index(indexName).getAll(key));}
export async function getSetting(key,fallback=null){const row=await get('settings',key);return row ? row.value : fallback;}
export async function setSetting(key,value){return put('settings',{key,value,updatedAt:new Date().toISOString()});}
export async function getSettings(){const rows=await getAll('settings');return Object.fromEntries(rows.map(r=>[r.key,r.value]));}
export async function addActivity(type,message,meta={}){return put('activity',{id:crypto.randomUUID(),type,message,meta,createdAt:new Date().toISOString()});}
export async function exportAll(){
  const payload={schema:'assistente-pessoal-vip',version:2,exportedAt:new Date().toISOString(),excludedSecrets:[...SECRET_SETTING_KEYS],stores:{}};
  for(const name of STORES){
    const rows=await getAll(name);
    payload.stores[name]=name==='settings'?rows.filter(row=>!SECRET_SETTING_KEYS.has(row.key)):rows;
  }
  return payload;
}
export async function importAll(payload){
  if(!payload || payload.schema!=='assistente-pessoal-vip' || !payload.stores) throw new Error('Arquivo de backup incompatível.');
  const localSecrets={};
  for(const key of SECRET_SETTING_KEYS)localSecrets[key]=await getSetting(key,null);
  for(const name of STORES){
    await clearStore(name);
    for(const item of (payload.stores[name]||[])){
      if(name==='settings'&&SECRET_SETTING_KEYS.has(item?.key))continue;
      await put(name,item);
    }
  }
  for(const [key,value] of Object.entries(localSecrets))if(value!==null&&value!==undefined)await setSetting(key,value);
}
export async function clearAll(){for(const name of STORES) await clearStore(name);}
