import { Orders } from "@/pages/Admin/Orders";
import { Security } from "@/pages/Admin/Security";
import { PublisherProvider } from "@/context/PublisherContext";
import { AdminPage } from "@/pages/Admin/AdminPage";
import { PublishDock } from "@/pages/Admin/PublishDock";
import { StudioLock } from "@/pages/Admin/StudioLock";
import { useEffect, useState } from "react";

export function StudioGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState<'owner'|'orders'>('orders');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/session').then(async r => { if (!r.ok) throw Error(); const data=await r.json(); setRole(data.role); setUnlocked(true); }).catch(() => setUnlocked(false)).finally(() => setLoading(false));
    const meta = document.createElement('meta'); meta.name='robots'; meta.content='noindex, nofollow'; document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  if (loading) return <p className="p-10">Loading…</p>;
  if (!unlocked) return <StudioLock onUnlocked={() => { setLoading(true); fetch('/api/admin/session').then(async r => {if (!r.ok) throw Error(); const data=await r.json(); setRole(data.role); setUnlocked(true);}).catch(()=>setUnlocked(false)).finally(()=>setLoading(false)); }} />;
  if (role === 'orders') return <div className="mx-auto max-w-4xl p-6"><button className="mb-6 underline" onClick={()=>{fetch('/api/admin/logout',{method:'POST'}).finally(()=>setUnlocked(false));}}>Log out / تسجيل الخروج</button><Orders /><div className="mt-8"><Security /></div></div>;
  return <PublisherProvider><AdminPage /><PublishDock onLock={() => { fetch('/api/admin/logout',{method:'POST'}).finally(() => setUnlocked(false)); }} /></PublisherProvider>;
}
