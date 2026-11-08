import { useEffect, useRef, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { useLang } from '@/i18n/LanguageContext';

type Order = { id:string; customer_name:string; phone:string; city:string; address:string; note:string; subtotal:number; shipping:number; discount:number; status:string; created_at:string };
type Item = { id:string; order_id:string; name:string; size:number; unit_price:number; quantity:number };
const statuses=['new','confirmed','shipped','completed','cancelled'] as const;
const statusText = (status: string, ar: boolean) => {
  const labels: Record<string, string> = {
    new: ar ? 'جديد' : 'New',
    confirmed: ar ? 'مؤكد' : 'Confirmed',
    shipped: ar ? 'تم الشحن' : 'Shipped',
    completed: ar ? 'مكتمل' : 'Completed',
    cancelled: ar ? 'ملغى' : 'Cancelled',
  };
  return labels[status] || status;
};

function StatusBadge({ status, ar }: { status:string; ar:boolean }) {
  const map: Record<string,string> = {
    new: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-sky-100 text-sky-800 border-sky-200',
    shipped: 'bg-violet-100 text-violet-800 border-violet-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  const label: Record<string,string> = {
    new: ar ? 'جديد' : 'New',
    confirmed: ar ? 'مؤكد' : 'Confirmed',
    shipped: ar ? 'تم الشحن' : 'Shipped',
    completed: ar ? 'مكتمل' : 'Completed',
    cancelled: ar ? 'ملغى' : 'Cancelled',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${map[status] || 'bg-bone-2 text-mist'}`}>{label[status] || status}</span>;
}

export function Orders() {
  const { lang } = useLang();
  const ar = lang==='ar';
  const [orders,setOrders]=useState<Order[]>([]);
  const [items,setItems]=useState<Item[]>([]);
  const [error,setError]=useState('');
  const seenNew=useRef<Set<string>|null>(null);
  const [notice,setNotice]=useState('');
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('');
  const [page,setPage]=useState(1);
  const [hasMore,setHasMore]=useState(false);
  const statusOptions = statuses.map((value) => ({ value, label: statusText(value, ar) }));
  const filterOptions = [{ value: "", label: ar ? "كل الحالات" : "All statuses" }, ...statusOptions];

  useEffect(()=> {
    const controller=new AbortController();
    const params=new URLSearchParams({page:String(page),q:query,status});
    fetch(`/api/admin/orders?${params}`,{signal:controller.signal}).then(async r=>{
      if(!r.ok) throw Error();
      const data=await r.json();
      setOrders(data.orders);
      setItems(data.items);
      setHasMore(data.hasMore);
      setError('');
    }).catch(e=>{ if(e.name!=='AbortError') setError(ar?'تعذر تحميل الطلبات':'Could not load orders'); });
    return ()=>controller.abort();
  },[ar,page,query,status]);

  useEffect(()=> {
    let stopped=false;
    const poll=async()=>{
      try{
        const r=await fetch('/api/admin/orders?status=new&page=1');
        if(!r.ok) return;
        const data=await r.json();
        if(stopped) return;
        const ids=new Set<string>(data.orders.map((o:Order)=>o.id));
        if(seenNew.current){
          const fresh=[...ids].filter(id=>!seenNew.current!.has(id));
          if(fresh.length){
            setNotice(ar?`يوجد ${fresh.length} طلب جديد`: `${fresh.length} new order(s)`);
            if('Notification' in window && Notification.permission==='granted') new Notification(ar?'طلب جديد':'New order',{body:ar?'افتح لوحة الطلبات لمراجعته':'Open orders to review.'});
          }
        }
        seenNew.current=ids;
      }catch{}
    };
    void poll();
    const timer=window.setInterval(poll,60000);
    return ()=>{stopped=true;window.clearInterval(timer);};
  },[ar]);

  const update=async (id:string,next:string)=> {
    try {
      const r=await fetch(`/api/admin/orders/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});
      if(!r.ok) throw Error();
      setOrders(prev=>status && status!==next ? prev.filter(o=>o.id!==id) : prev.map(o=>o.id===id?{...o,status:next}:o));
    } catch {setError(ar?'تعذر تغيير الحالة':'Could not update status');}
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{ar?'الطلبات':'Orders'}</h2>
          <p className="mt-1 text-xs text-mist">{ar?'تابع حالة الطلبات وابحث برقم الهاتف — التحديث فوري.' : 'Track and update order status — search by phone or ID.'}</p>
        </div>
        {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
          <button className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-xs font-bold hover:border-ink/20" onClick={()=>void Notification.requestPermission()}>{ar?'تفعيل الإشعارات':'Enable notifications'}</button>
        )}
      </div>

      {notice && <p role="status" className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">{notice}</p>}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-ink/10 bg-surface p-3">
        <input aria-label={ar?'بحث برقم الطلب أو الهاتف':'Search by order ID or phone'} className="field h-10 max-w-xs flex-1 text-sm" placeholder={ar?'رقم الطلب أو الهاتف':'Order ID or phone'} value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/>
        <Select
          ariaLabel={ar ? 'تصفية حسب الحالة' : 'Filter by status'}
          className="w-full max-w-[180px]"
          buttonClassName="h-10 text-sm"
          value={status}
          options={filterOptions}
          onChange={(value) => { setStatus(value); setPage(1); }}
          dir={ar ? 'rtl' : 'ltr'}
        />
        <span className="ms-auto self-center text-xs text-mist">{orders.length} {ar?'طلب':'orders'}{hasMore ? '+' : ''}</span>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">{error}</p>}
      {orders.length===0 && !error && <p className="rounded-xl border border-dashed border-ink/15 p-8 text-center text-sm text-mist">{ar?'لا توجد طلبات':'No orders'}</p>}

      <div className="grid gap-3">
        {orders.map(o=>{
          const orderItems=items.filter(i=>i.order_id===o.id);
          const total=o.subtotal - o.discount + o.shipping;
          return (
            <article key={o.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 bg-bone-2/40 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold">{o.customer_name}</p>
                  <span className="text-xs text-mist">·</span>
                  <a href={`tel:${o.phone}`} className="text-sm font-medium text-plum underline" dir="ltr">{o.phone}</a>
                  <StatusBadge status={o.status} ar={ar} />
                </div>
                <span className="text-[11px] text-mist">{new Date(o.created_at).toLocaleString(ar?'ar-EG':'en-GB')} · {o.id.slice(0,8)}</span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-ink/80">{o.city} · {o.address}</p>
                {o.note && <p className="mt-1 rounded-lg bg-bone-2/60 px-3 py-2 text-xs text-mist">{o.note}</p>}
                <ul className="mt-3 divide-y divide-ink/5 rounded-xl border border-ink/10">
                  {orderItems.map(i=>{
                    let name: string = i.name;
                    try { const parsed = JSON.parse(i.name); name = parsed[lang] || parsed.en || i.name; } catch {}
                    return <li key={i.id} className="flex items-center justify-between px-3 py-2 text-sm"><span>{name} · {i.size} ml × {i.quantity}</span><span className="font-bold">{i.unit_price} EGP</span></li>;
                  })}
                </ul>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink px-4 py-3 text-sm text-bone">
                  <span className="text-bone/60 text-xs">{ar?'الإجمالي':'Total'}</span>
                  <span className="flex flex-wrap gap-3 text-xs">
                    <span>{ar?'المجموع':'Subtotal'} <b className="text-bone">{o.subtotal}</b></span>
                    <span>{ar?'الشحن':'Ship'} <b className="text-bone">{o.shipping}</b></span>
                    <span>{ar?'الخصم':'Disc'} <b className="text-acid">-{o.discount}</b></span>
                    <span className="rounded-full bg-acid px-3 py-1 font-black text-[#141019]">{total} EGP</span>
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-mist">{ar?'تغيير الحالة':'Change status'}</span>
                  <Select
                    ariaLabel={ar ? 'حالة الطلب' : 'Order status'}
                    className="w-full max-w-[200px]"
                    buttonClassName="h-9 text-sm"
                    value={o.status}
                    options={statusOptions}
                    onChange={(value) => void update(o.id, value)}
                    dir={ar ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="rounded-full border border-ink/10 bg-surface px-4 py-2 text-sm font-bold disabled:opacity-40 hover:border-ink/20">{ar?'السابق':'Previous'}</button>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-bone">{page}</span>
        <button disabled={!hasMore} onClick={()=>setPage(p=>p+1)} className="rounded-full border border-ink/10 bg-surface px-4 py-2 text-sm font-bold disabled:opacity-40 hover:border-ink/20">{ar?'التالي':'Next'}</button>
      </div>
    </div>
  );
}
