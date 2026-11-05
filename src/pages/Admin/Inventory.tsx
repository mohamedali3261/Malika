import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/i18n/LanguageContext';

type Stock = { product_id: string; size: number; quantity: number; name: { en: string; ar: string } };

export function Inventory() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const [rows, setRows] = useState<Stock[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [addDraft, setAddDraft] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/inventory');
      if (!r.ok) throw Error();
      const data: Stock[] = await r.json();
      setRows(data);
      setDraft(Object.fromEntries(data.map((x) => [`${x.product_id}:${x.size}`, String(x.quantity)])));
    } catch {
      setMessage(ar ? 'تعذر تحميل المخزون' : 'Could not load inventory');
    }
  }, [ar]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const name = row.name[lang] || row.name.en;
      const matchesSearch = !filter || name.toLowerCase().includes(filter.toLowerCase()) || String(row.size).includes(filter);
      const matchesLow = !lowOnly || row.quantity <= 5;
      return matchesSearch && matchesLow;
    });
  }, [rows, filter, lowOnly, lang]);

  const totalUnits = useMemo(() => rows.reduce((sum, r) => sum + r.quantity, 0), [rows]);
  const lowCount = useMemo(() => rows.filter((r) => r.quantity <= 5).length, [rows]);
  const outCount = useMemo(() => rows.filter((r) => r.quantity === 0).length, [rows]);

  const save = async (row: Stock) => {
    const key = `${row.product_id}:${row.size}`;
    const value = Number(draft[key]);
    if (!Number.isInteger(value) || value < 0 || value > 1000000) {
      setMessage(ar ? 'الكمية غير صالحة' : 'Invalid quantity');
      return;
    }
    setSaving(key);
    try {
      const r = await fetch(`/api/admin/inventory/${encodeURIComponent(row.product_id)}/${row.size}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: value, expectedQuantity: row.quantity }),
      });
      if (!r.ok) throw Error();
      await load();
      setMessage(ar ? 'تم حفظ المخزون' : 'Stock saved');
    } catch {
      setMessage(ar ? 'تغير المخزون أو تعذر الحفظ؛ أعد التحميل.' : 'Stock changed or could not be saved; reload.');
      await load();
    } finally {
      setSaving(null);
    }
  };

  const addStock = async (row: Stock) => {
    const key = `${row.product_id}:${row.size}`;
    const raw = addDraft[key];
    const amount = Number(raw);
    if (!Number.isInteger(amount) || amount === 0 || amount < -1000000 || amount > 1000000) {
      setMessage(ar ? 'أدخل كمية صحيحة للإضافة (مثال: 10 أو -5)' : 'Enter a valid amount to add (e.g. 10 or -5)');
      return;
    }
    setSaving(key + ':add');
    try {
      const r = await fetch(`/api/admin/inventory/${encodeURIComponent(row.product_id)}/${row.size}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'failed');
      setAddDraft((prev) => ({ ...prev, [key]: '' }));
      await load();
      setMessage(
        ar
          ? `تمت إضافة ${amount > 0 ? '+' : ''}${amount} — الكمية الجديدة: ${data.quantity}`
          : `Added ${amount > 0 ? '+' : ''}${amount} — new quantity: ${data.quantity}`
      );
    } catch (e: any) {
      setMessage(e?.message || (ar ? 'تعذر إضافة المخزون' : 'Could not add stock'));
      await load();
    } finally {
      setSaving(null);
    }
  };

  const quickAdd = (row: Stock, delta: number) => {
    const key = `${row.product_id}:${row.size}`;
    setAddDraft((prev) => ({ ...prev, [key]: String(delta) }));
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">{ar ? 'المخزون' : 'Inventory'}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink/60">
            {ar
              ? 'المنتجات الجديدة تبدأ بكمية صفر. يمكنك تحديد الكمية مباشرة أو إضافة كمية للمخزون الحالي. المخزون المنخفض (≤5) يظهر باللون الأحمر.'
              : 'New sizes start at zero. Set the quantity directly or add to the current stock. Low stock (≤5) is highlighted in red.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 font-bold">
            {ar ? 'إجمالي الوحدات' : 'Total units'}: <b className="text-ink">{totalUnits}</b>
          </span>
          <span className={`rounded-full px-3 py-1.5 font-bold ${lowCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {ar ? 'منخفض' : 'Low'}: {lowCount}
          </span>
          <span className={`rounded-full px-3 py-1.5 font-bold ${outCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-bone-2 text-mist'}`}>
            {ar ? 'نفد' : 'Out'}: {outCount}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-bone-2/40 p-3">
        <input
          placeholder={ar ? 'بحث باسم المنتج أو الحجم...' : 'Search by product or size...'}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="field h-10 max-w-xs flex-1 text-sm"
        />
        <label className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 py-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="h-4 w-4" />
          {ar ? 'المنخفض فقط (≤5)' : 'Low only (≤5)'}
        </label>
        <button onClick={() => void load()} className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-bold hover:border-ink/30">
          {ar ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {message && (
        <p role="status" className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bone">
          {message}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink/15 p-8 text-center text-sm text-mist">
          {ar ? 'لا توجد نتائج مطابقة.' : 'No matching stock.'}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => {
            const key = `${row.product_id}:${row.size}`;
            const isSaving = saving === key || saving === key + ':add';
            const low = row.quantity <= 5;
            const out = row.quantity === 0;
            return (
              <div
                key={key}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                  out ? 'border-rose-200 bg-rose-50' : low ? 'border-amber-200 bg-amber-50' : 'border-ink/10 bg-surface'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-bold leading-tight">
                    <span className="text-[15px] text-ink">{row.name[lang] || row.name.en}</span>
                    <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-bone" dir="ltr">
                      {row.size} ml
                    </span>
                    {out ? (
                      <span className="rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white">{ar ? 'نفد المخزون' : 'Out of stock'}</span>
                    ) : low ? (
                      <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">{ar ? 'مخزون منخفض' : 'Low stock'}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-mist">{ar ? 'الحالي:' : 'Current:'}</span>
                    <span className={`rounded-full px-2.5 py-1 text-sm font-black ${out ? 'bg-rose-600 text-white' : low ? 'bg-amber-500 text-white' : 'bg-ink text-bone'}`}>
                      {row.quantity}
                    </span>
                    <span className="text-xs text-mist">{ar ? 'وحدة' : 'units'}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:min-w-[360px] sm:flex-row sm:items-end sm:justify-end">
                  {/* Add stock */}
                  <div className="flex-1 sm:max-w-[200px]">
                    <span className="mb-1 block text-center text-[10px] font-bold uppercase tracking-widest text-mist sm:text-start">
                      {ar ? 'إضافة مخزون (+/-)' : 'Add stock (+/-)'}
                    </span>
                    <div className="flex gap-1">
                      <input
                        aria-label={ar ? 'كمية الإضافة' : 'Add amount'}
                        className="field h-10 flex-1 text-center font-bold"
                        type="number"
                        placeholder="+10"
                        value={addDraft[key] ?? ''}
                        onChange={(e) => setAddDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                      <button
                        disabled={isSaving || !addDraft[key]}
                        onClick={() => void addStock(row)}
                        className="grid h-10 min-w-[72px] place-items-center rounded-xl bg-acid px-3 text-sm font-black text-ink transition hover:bg-acid-deep disabled:opacity-40"
                      >
                        {isSaving ? '…' : ar ? 'إضافة' : 'Add'}
                      </button>
                    </div>
                    <div className="mt-1 flex gap-1">
                      {[5, 10, 25].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => quickAdd(row, n)}
                          className="flex-1 rounded-full border border-ink/10 bg-bone px-1 py-1 text-xs font-bold hover:border-ink/20"
                        >
                          +{n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => quickAdd(row, -5)}
                        className="flex-1 rounded-full border border-ink/10 bg-surface px-1 py-1 text-xs font-bold text-mist hover:text-rose-600"
                      >
                        -5
                      </button>
                    </div>
                  </div>

                  {/* Set exact */}
                  <div className="flex-1 sm:max-w-[160px]">
                    <span className="mb-1 block text-center text-[10px] font-bold uppercase tracking-widest text-mist sm:text-start">
                      {ar ? 'تحديد الكمية' : 'Set quantity'}
                    </span>
                    <div className="flex gap-1">
                      <input
                        aria-label={ar ? 'الكمية' : 'Quantity'}
                        className="field h-10 flex-1 text-center"
                        type="number"
                        min={0}
                        max={1000000}
                        value={draft[key] ?? ''}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                      <button
                        disabled={isSaving}
                        className="grid h-10 min-w-[56px] place-items-center rounded-xl bg-ink px-3 text-sm font-bold text-bone hover:bg-plum disabled:opacity-40"
                        onClick={() => void save(row)}
                      >
                        {ar ? 'حفظ' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-ink/15 bg-bone-2/30 p-3 text-xs leading-relaxed text-mist">
        {ar ? (
          <>
            <b className="text-ink">كيف يعمل؟</b> الإضافة تجمع الكمية الجديدة مع الحالية (مثال: الحالي 5 + إضافة 10 = 15). التحديد يستبدل القيمة مباشرة. التغييرات تُسجل في سجل التدقيق.
          </>
        ) : (
          <>
            <b className="text-ink">How it works?</b> Add increments the current stock (e.g. 5 + 10 = 15). Set replaces it directly. All changes are audit-logged.
          </>
        )}
      </div>
    </section>
  );
}
