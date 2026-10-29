import {useEffect,useState} from 'react';
import {useLang} from '@/i18n/LanguageContext';
type Entry = {id:string; admin_id:string; action:string; target_id:string; created_at:string};
export function AuditLog() {
  const {lang}=useLang(); const [items,setItems]=useState<Entry[]>([]); const [error,setError]=useState(false);
  useEffect(()=>{fetch('/api/admin/audit').then(async r=>{if(!r.ok)throw Error();setItems(await r.json());}).catch(()=>setError(true));},[]);
  return <section className="mt-8"><h3 className="font-display text-2xl">{lang==='ar'?'آخر أنشطة الإدارة':'Recent admin activity'}</h3>{error ? <p role="alert">{lang==='ar'?'تعذر تحميل السجل':'Could not load activity'}</p> : <ul className="mt-3 space-y-2 text-sm">{items.map(i=><li className="border-b border-ink/10 pb-2" key={i.id}>{i.created_at} UTC · {i.action} · {i.target_id} · {i.admin_id}</li>)}</ul>}</section>;
}
