import {getSetting,setSetting} from './db.js';

const encoder=new TextEncoder();
function bytesToBase64(bytes){let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s);}
function base64ToBytes(value){const s=atob(value);return Uint8Array.from(s,c=>c.charCodeAt(0));}
async function derivePin(pin,salt){
  const key=await crypto.subtle.importKey('raw',encoder.encode(pin),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},key,256);
  return bytesToBase64(new Uint8Array(bits));
}
export async function configurePin(pin){
  if(!/^\d{4,8}$/.test(pin)) throw new Error('O PIN deve ter de 4 a 8 números.');
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const hash=await derivePin(pin,salt);
  await setSetting('pinSecurity',{salt:bytesToBase64(salt),hash,configuredAt:new Date().toISOString()});
}
export async function verifyPin(pin){
  const cfg=await getSetting('pinSecurity');
  if(!cfg) return false;
  const hash=await derivePin(pin,base64ToBytes(cfg.salt));
  return hash===cfg.hash;
}
export async function hasPin(){return Boolean(await getSetting('pinSecurity'));}
export function createLockController(onLock){
  let timer=null; let minutes=5; let unlocked=false;
  const arm=()=>{clearTimeout(timer);if(unlocked&&minutes>0)timer=setTimeout(()=>{unlocked=false;onLock();},minutes*60*1000);};
  const activity=()=>arm();
  ['pointerdown','keydown','touchstart'].forEach(evt=>window.addEventListener(evt,activity,{passive:true}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden) arm();});
  return {
    setMinutes(v){minutes=Math.max(0,Number(v)||0);arm();},
    unlock(){unlocked=true;arm();},
    lock(){unlocked=false;clearTimeout(timer);onLock();},
    isUnlocked(){return unlocked;}
  };
}
