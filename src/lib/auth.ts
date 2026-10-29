export const authPolicy = { iterations: 310000, sessionHours: 8, idleMinutes: 30, freeAttempts: 10 };
export function lockRemaining() { return 0; }
export async function unlock(username: string, password: string): Promise<{ok:true}|{ok:false;reason:'invalid'|'unsupported'}|{ok:false;reason:'locked';waitMs:number}> {
  try { const r = await fetch('/api/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})}); return r.ok ? {ok:true} : {ok:false,reason:'invalid'}; }
  catch { return {ok:false,reason:'unsupported'}; }
}
