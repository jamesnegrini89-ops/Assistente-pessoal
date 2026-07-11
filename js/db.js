const DB_NAME = 'assistente_pessoal_vip_db';
const DB_VERSION = 1;
export const STORES = ['settings','memories','decisions','forgeModules','forgeRecords','activity'];
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
  const payload={schema:'assistente-pessoal-vip',version:1,exportedAt:new Date().toISOString(),stores:{}};
  for(const name of STORES) payload.stores[name]=await getAll(name);
  return payload;
}
export async function importAll(payload){
  if(!payload || payload.schema!=='assistente-pessoal-vip' || !payload.stores) throw new Error('Arquivo de backup incompatível.');
  for(const name of STORES){
    await clearStore(name);
    for(const item of (payload.stores[name]||[])) await put(name,item);
  }
}
export async function clearAll(){for(const name of STORES) await clearStore(name);}
