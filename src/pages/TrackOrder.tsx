import {useEffect,useState} from 'react';
import {useRoute} from '@/lib/router';
import {useLang} from '@/i18n/LanguageContext';
export function TrackOrder(){
 const {segments}=useRoute();const {lang}=useLang();const [state,setState]=useState<{id:string;status:string;created_at:string}|null>(null);const [error,setError]=useState(false);
 useEffect(()=>{fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:segments[1]})}).then(async r=>{if(!r.ok)throw Error();setState(await r.json())}).catch(()=>setError(true));},[segments]);
 return <div className="mx-auto max-w-xl px-6 py-20"><h1 className="font-display text-4xl">{lang==='ar'?'تتبع الطلب':'Track order'}</h1>{error?<p className="mt-4">{lang==='ar'?'الرابط غير صالح أو الطلب غير موجود.':'Invalid link or order not found.'}</p>:state?<div className="mt-4"><p>{lang==='ar'?'رقم الطلب':'Order'}: {state.id}</p><p>{lang==='ar'?'الحالة':'Status'}: {state.status}</p><p>{state.created_at} UTC</p></div>:<p>...</p>}</div>;
}
