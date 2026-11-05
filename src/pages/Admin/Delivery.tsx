import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLang } from '@/i18n/LanguageContext';

type Rate = { city: string; amount: number; free_threshold: number | null };
type Coupon = { code: string; percent: number; max_uses: number; uses: number; expires_at: string | null; enabled: number };

export function Delivery() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [rates, setRates] = useState<Rate[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [city, setCity] = useState('');
  const [fee, setFee] = useState('');
  const [threshold, setThreshold] = useState('');
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiry, setExpiry] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const [a, b] = await Promise.all([fetch('/api/admin/shipping'), fetch('/api/admin/coupons')]);
    if (!a.ok || !b.ok) throw Error();
    setRates(await a.json());
    setCoupons(await b.json());
  }, []);

  useEffect(() => {
    void refresh().catch(() => setMessage(ar ? 'تعذر تحميل الإعدادات' : 'Could not load settings'));
  }, [refresh, ar]);

  const save = async (e: FormEvent, kind: 'shipping' | 'coupons') => {
    e.preventDefault();
    const body =
      kind === 'shipping'
        ? { city: city.trim(), amount: Number(fee), freeThreshold: threshold === '' ? null : Number(threshold) }
        : { code: code.trim(), percent: Number(percent), maxUses: Number(maxUses), expiresAt: expiry ? new Date(expiry).toISOString() : null, enabled };
    try {
      const r = await fetch(`/api/admin/${kind}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw Error();
      await refresh();
      setMessage(ar ? 'تم الحفظ ✓' : 'Saved ✓');
      if (kind === 'shipping') { setCity(''); setFee(''); setThreshold(''); }
      else { setCode(''); setPercent(''); setMaxUses(''); setExpiry(''); }
      setTimeout(() => setMessage(''), 2500);
    } catch {
      setMessage(ar ? 'تعذر الحفظ، تحقق من البيانات' : 'Could not save; check the fields');
    }
  };



  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl">{ar ? 'الشحن والخصومات' : 'Delivery'}</h2>
        <p className="mt-1 text-xs leading-relaxed text-mist">{ar ? 'أضف سعر الشحن لكل محافظة وكوبونات الخصم — واجهة مبسطة بدون أقسام إضافية.' : 'Set shipping per governorate and discount coupons — simple, no extra sections.'}</p>
      </div>

      {message && <p role="status" className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bone">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Shipping */}
        <section className="rounded-2xl border border-ink/10 bg-white p-4">
          <h3 className="text-sm font-bold">{ar ? 'الشحن' : 'Shipping'}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-mist">{ar ? 'اكتب اسم المحافظة بالإنجليزية (مثال: Cairo). المحافظات غير المسجلة لن تقبل الطلبات.' : 'Use English governorate name (e.g. Cairo). Unconfigured governorates reject orders.'}</p>
          <form onSubmit={(e) => void save(e, 'shipping')} className="mt-4 grid gap-2.5">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'المحافظة' : 'Governorate'}</span>
              <input className="field h-10 text-sm" placeholder="Cairo" required value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'رسوم الشحن (جنيه)' : 'Fee (EGP)'}</span>
                <input className="field h-10 text-sm" type="number" min={0} required placeholder="60" value={fee} onChange={(e) => setFee(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'حد المجاني (اختياري)' : 'Free threshold'}</span>
                <input className="field h-10 text-sm" type="number" min={0} placeholder="1000" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
              </label>
            </div>
            <button className="mt-1 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-bone hover:bg-plum">{ar ? 'حفظ الشحن' : 'Save shipping'}</button>
          </form>

          <ul className="mt-4 space-y-2">
            {rates.length === 0 ? <li className="rounded-xl border border-dashed border-ink/10 p-3 text-center text-xs text-mist">{ar ? 'لا توجد محافظات مسجلة' : 'No rates yet'}</li> : rates.map((r) => (
              <li key={r.city} className="flex items-center justify-between rounded-xl border border-ink/8 bg-bone-2/40 px-3 py-2.5">
                <span className="text-sm font-bold">{r.city}</span>
                <span className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-ink px-2 py-1 font-bold text-bone">{r.amount} EGP</span>
                  <span className="text-mist">{r.free_threshold === null ? '—' : `${ar ? 'مجاني فوق' : 'free ≥'} ${r.free_threshold}`}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Coupons */}
        <section className="rounded-2xl border border-ink/10 bg-white p-4">
          <h3 className="text-sm font-bold">{ar ? 'كوبونات الخصم' : 'Coupons'}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-mist">{ar ? 'أنشئ كود خصم بنسبة مئوية وعدد استخدامات.' : 'Create a code with percent off and max uses.'}</p>
          <form onSubmit={(e) => void save(e, 'coupons')} className="mt-4 grid gap-2.5">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'الكود' : 'Code'}</span>
              <input className="field h-10 text-sm uppercase" required placeholder="VLOR20" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'الخصم %' : 'Discount %'}</span>
                <input className="field h-10 text-sm" type="number" min={1} max={100} required placeholder="20" value={percent} onChange={(e) => setPercent(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'الحد الأقصى' : 'Max uses'}</span>
                <input className="field h-10 text-sm" type="number" min={1} required placeholder="100" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{ar ? 'انتهاء الصلاحية (اختياري)' : 'Expiry (optional)'}</span>
              <input className="field h-10 text-sm" type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-bone-2/30 px-3 py-2">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
              <span className="text-sm font-medium">{ar ? 'مفعّل' : 'Enabled'}</span>
            </label>
            <button className="mt-1 rounded-full bg-acid px-5 py-2.5 text-sm font-black text-ink hover:bg-acid-deep">{ar ? 'حفظ الكوبون' : 'Save coupon'}</button>
          </form>

          <ul className="mt-4 space-y-2">
            {coupons.length === 0 ? <li className="rounded-xl border border-dashed border-ink/10 p-3 text-center text-xs text-mist">{ar ? 'لا توجد كوبونات' : 'No coupons yet'}</li> : coupons.map((c) => (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/8 bg-bone-2/40 px-3 py-2.5">
                <span className="font-mono text-sm font-bold">{c.code}</span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-ink px-2 py-1 font-bold text-bone">{c.percent}%</span>
                  <span className="text-mist">{c.uses}/{c.max_uses}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${c.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-ink/10 text-mist'}`}>{c.enabled ? (ar ? 'مفعّل' : 'enabled') : (ar ? 'موقوف' : 'disabled')}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
