import { Hono, type Context, type MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';

type Env = { Bindings: { DB: D1Database }, Variables: { adminId: string; role: "owner" | "orders" } };
const app = new Hono<Env>();
const text = (max: number) => z.string().trim().min(1).max(max);
const localized = z.object({ en: text(5000), ar: text(5000) });
const product = z.object({
  id: text(100).regex(/^[\w-]+$/), slug: text(100).regex(/^[a-z0-9-]+$/), name: localized, tagline: localized, description: localized, story: localized,
  price: z.number().int().min(0).max(10000000), compareAt: z.number().int().min(0).max(10000000).optional(),
  sizes: z.array(z.object({ ml: z.number().int().min(1).max(10000), price: z.number().int().min(0).max(10000000) })).min(1).max(30).refine(v => new Set(v.map(x => x.ml)).size === v.length),
  category: z.enum(['fresh','floral','woody','oriental']), gender: z.enum(['women','men','unisex']), moods: z.array(z.enum(['fresh','warm','bold','floral'])).max(4),
  notes: z.object({ top: z.array(localized).max(30), heart: z.array(localized).max(30), base: z.array(localized).max(30) }),
  images: z.array(z.string().max(2048)).max(20), cutout: z.string().max(2048).optional(), accent: text(50), featured: z.boolean().optional(), isNew: z.boolean().optional(), bestseller: z.boolean().optional(), rating: z.number().min(0).max(5), reviews: z.number().int().min(0), longevity: text(100), sillage: localized, createdAt: text(100)
}).strict();
const order = z.object({ coupon: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{1,40}$/).optional(), expectedShipping: z.number().int().min(0).max(10000000), expectedDiscount: z.number().int().min(0).max(500000000), customer: z.object({ name: text(120).min(2), phone: text(30).regex(/^[+\d\s()-]{8,30}$/), city: text(100), address: text(500).min(6), note: z.string().trim().max(1000) }), items: z.array(z.object({ productId: text(100), ml: z.number().int().positive(), qty: z.number().int().min(1).max(20), expectedPrice: z.number().int().min(0).max(10000000) })).min(1).max(50) });
const encoder = new TextEncoder();
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2,'0')).join('');
const sha = async (s: string) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(s)));
async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 310000 }, key, 256));
}
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2,'0')).join('');
const jsonBody = async (c: any) => { try { return await c.req.json(); } catch { return null; } };
app.use('/api/*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  if (!(c.req.method === 'GET' && c.req.path.startsWith('/api/images/'))) c.header('Cache-Control', 'no-store');
  if (!['GET','HEAD'].includes(c.req.method)) {
    const origin = c.req.header('Origin');
    if (!origin || origin !== new URL(c.req.url).origin) return c.json({ error: 'Invalid origin' }, 403);
    const size = Number(c.req.header('Content-Length') || 0);
    if (size > 6_000_000) return c.json({ error: 'Request too large' }, 413);
  }
  await next();
});
app.post('/api/login', async c => {
  const data = z.object({ username: text(100), password: text(256) }).safeParse(await jsonBody(c));
  if (!data.success) return c.json({ error: 'Invalid credentials' }, 400);
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const key = await sha(ip); const now = Date.now();
  await c.env.DB.prepare('INSERT INTO login_attempts (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires_at < ? THEN 1 ELSE count + 1 END, expires_at = CASE WHEN expires_at < ? THEN ? ELSE expires_at END').bind(key,now+900000,now,now,now+900000).run();
  const attempts = await c.env.DB.prepare('SELECT count FROM login_attempts WHERE key=?').bind(key).first<{count:number}>();
  if ((attempts?.count || 0) > 10) return c.json({ error: 'Too many attempts' }, 429);
  const admin = await c.env.DB.prepare('SELECT * FROM admins WHERE username=?').bind(data.data.username).first<{id:string,salt:string,password_hash:string}>();
  const hash = await passwordHash(data.data.password, admin?.salt || '00000000000000000000000000000000');
  let diff = 0; const expected = admin?.password_hash || '0'.repeat(64);
  for (let i = 0; i < 64; i++) diff |= hash.charCodeAt(i) ^ expected.charCodeAt(i);
  if (!admin || diff !== 0) return c.json({ error: 'Invalid credentials' }, 401);
  const token = random();
  await c.env.DB.prepare('INSERT INTO sessions (token_hash,admin_id,expires_at,last_seen) VALUES (?,?,?,?)').bind(await sha(token),admin.id,now+8*3600000,now).run();
  setCookie(c, '__Host-malika_session', token, { httpOnly:true, secure:true, sameSite:'Strict', path:'/', maxAge:28800 });
  return c.json({ ok:true });
});
const adminGuard: MiddlewareHandler<Env> = async (c, next) => {
  const token = getCookie(c, '__Host-malika_session');
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return c.json({error:'Unauthorized'},401);
  const tokenHash = await sha(token), now = Date.now();
  const session = await c.env.DB.prepare('SELECT sessions.admin_id,admins.role FROM sessions JOIN admins ON admins.id=sessions.admin_id WHERE token_hash=? AND expires_at>? AND last_seen>?').bind(tokenHash,now,now-30*60000).first<{admin_id:string,role:'owner'|'orders'}>();
  if (!session) return c.json({error:'Unauthorized'},401);
  await c.env.DB.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=? AND expires_at>? AND last_seen>?').bind(now,tokenHash,now,now-30*60000).run();
  c.set('adminId', session.admin_id); c.set('role', session.role);
  if (session.role === 'orders' && !(['/api/admin/session','/api/admin/logout','/api/admin/password','/api/admin/orders'].includes(c.req.path) || /^\/api\/admin\/orders\/[^/]+$/.test(c.req.path))) return c.json({error:'Forbidden'},403);
  await next();
};
app.use('/api/admin/*', adminGuard);
app.get('/api/admin/session', c => c.json({ok:true,role:c.get('role')}));
app.post('/api/admin/logout', async c => { const token = getCookie(c,'__Host-malika_session'); if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(token)).run(); deleteCookie(c,'__Host-malika_session',{secure:true,path:'/'}); return c.json({ok:true}); });
app.post('/api/admin/password', async c => {
  const data = z.object({ currentPassword: text(256), newPassword: z.string().min(16).max(256) }).safeParse(await jsonBody(c));
  if (!data.success) return c.json({error:'New password must contain at least 16 characters'},400);
  const admin = await c.env.DB.prepare('SELECT salt,password_hash FROM admins WHERE id=?').bind(c.get('adminId')).first<{salt:string,password_hash:string}>();
  if (!admin) return c.json({error:'Unauthorized'},401);
  const hash = await passwordHash(data.data.currentPassword,admin.salt); let diff = 0;
  for (let i=0;i<64;i++) diff |= hash.charCodeAt(i) ^ admin.password_hash.charCodeAt(i);
  if (diff !== 0) return c.json({error:'Invalid credentials'},401);
  const salt = random().slice(0,32), newHash = await passwordHash(data.data.newPassword,salt);
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE admins SET salt=?,password_hash=? WHERE id=?').bind(salt,newHash,c.get('adminId')),
    c.env.DB.prepare('DELETE FROM sessions WHERE admin_id=?').bind(c.get('adminId')),
    c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'password_changed',c.get('adminId'))
  ]);
  deleteCookie(c,'__Host-malika_session',{secure:true,path:'/'});
  return c.json({ok:true});
});
app.get('/api/admin/accounts', async c => c.json((await c.env.DB.prepare('SELECT id,username,role FROM admins ORDER BY username').all()).results));
app.post('/api/admin/accounts', async c => {
  const data=z.object({username:z.string().regex(/^[A-Za-z0-9_.-]{3,64}$/),password:z.string().min(16).max(256),role:z.enum(['orders'])}).safeParse(await jsonBody(c));
  if (!data.success) return c.json({error:'Invalid account'},400);
  const id=crypto.randomUUID(), salt=random().slice(0,32), hash=await passwordHash(data.data.password,salt);
  try { await c.env.DB.batch([c.env.DB.prepare('INSERT INTO admins(id,username,salt,password_hash,role) VALUES(?,?,?,?,?)').bind(id,data.data.username,salt,hash,data.data.role),c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'account_created',id)]); }
  catch { return c.json({error:'Account could not be created'},409); }
  return c.json({ok:true},201);
});
app.delete('/api/admin/accounts/:id', async c => {
  const id=c.req.param('id'); const user=await c.env.DB.prepare("SELECT id FROM admins WHERE id=? AND role='orders'").bind(id).first();
  if(!user) return c.json({error:'Not found'},404);
  await c.env.DB.batch([c.env.DB.prepare('DELETE FROM sessions WHERE admin_id=?').bind(id),c.env.DB.prepare("DELETE FROM admins WHERE id=? AND role='orders'").bind(id),c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'account_deleted',id)]);
  return c.json({ok:true});
});
app.get('/api/admin/audit', async c => c.json((await c.env.DB.prepare('SELECT id,admin_id,action,target_id,created_at FROM audit_log ORDER BY created_at DESC LIMIT 100').all()).results));
app.get('/api/categories', async c => c.json((await c.env.DB.prepare('SELECT * FROM categories ORDER BY id').all()).results));
app.get('/api/products', async c => c.json((await c.env.DB.prepare('SELECT data FROM products WHERE archived=0 ORDER BY updated_at DESC').all<{data:string}>()).results.map(x => JSON.parse(x.data))));
app.post('/api/admin/products/import', async c => {
  const body = z.object({products:z.array(product).min(1).max(100)}).safeParse(await jsonBody(c));
  if (!body.success) return c.json({error:'Invalid catalogue', issues:body.error.issues.slice(0,20).map(i=>({path:i.path,message:i.message}))},400);
  const products=body.data.products;
  if (new Set(products.map(p=>p.id)).size!==products.length || new Set(products.map(p=>p.slug)).size!==products.length) return c.json({error:'Duplicate IDs or slugs'},400);
  try {
    await c.env.DB.batch([...products.map(p=>c.env.DB.prepare('INSERT INTO products(id,slug,category_id,data,archived) VALUES (?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, category_id=excluded.category_id,data=excluded.data,archived=0,updated_at=CURRENT_TIMESTAMP').bind(p.id,p.slug,p.category,JSON.stringify(p))),c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'catalogue_imported',String(products.length))]);
  } catch { return c.json({error:'Import failed; check for conflicting slugs'},409); }
  return c.json({ok:true,count:products.length});
});
app.put('/api/admin/products/:id', async c => {
  const data = product.safeParse(await jsonBody(c));
  if (!data.success || data.data.id !== c.req.param('id')) return c.json({error:'Invalid product'},400);
  const p=data.data;
  try { await c.env.DB.prepare('INSERT INTO products(id,slug,category_id,data,archived) VALUES (?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, category_id=excluded.category_id,data=excluded.data,archived=0,updated_at=CURRENT_TIMESTAMP').bind(p.id,p.slug,p.category,JSON.stringify(p)).run(); }
  catch { return c.json({error:'Product could not be saved; check slug'},409); }
  await c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'product_saved',p.id).run();
  return c.json({ok:true});
});
app.delete('/api/admin/products/:id', async c => { const result=await c.env.DB.prepare('UPDATE products SET archived=1 WHERE id=? AND archived=0').bind(c.req.param('id')).run(); if (!result.meta.changes) return c.json({error:'Not found'},404); await c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'product_archived',c.req.param('id')).run(); return c.json({ok:true}); });
app.get('/api/admin/inventory', async c => {
  const rows = await c.env.DB.prepare("SELECT i.product_id,i.size,i.quantity,p.data FROM inventory i JOIN products p ON p.id=i.product_id WHERE p.archived=0 AND EXISTS (SELECT 1 FROM json_each(p.data,'$.sizes') s WHERE json_extract(s.value,'$.ml')=i.size) ORDER BY p.slug,i.size").all<{product_id:string,size:number,quantity:number,data:string}>();
  return c.json(rows.results.map(({data,...row}) => ({...row,name:JSON.parse(data).name})));
});
app.put('/api/admin/inventory/:id/:size', async c => {
  const parsed=z.object({quantity:z.number().int().min(0).max(1000000),expectedQuantity:z.number().int().min(0).max(1000000)}).safeParse(await jsonBody(c));
  const size=Number(c.req.param('size'));
  if (!parsed.success || !Number.isInteger(size) || size <= 0) return c.json({error:'Invalid stock'},400);
  const result=await c.env.DB.prepare("UPDATE inventory SET quantity=? WHERE product_id=? AND size=? AND quantity=? AND EXISTS (SELECT 1 FROM products p, json_each(p.data,'$.sizes') s WHERE p.id=inventory.product_id AND p.archived=0 AND json_extract(s.value,'$.ml')=inventory.size)").bind(parsed.data.quantity,c.req.param('id'),size,parsed.data.expectedQuantity).run();
  if (!result.meta.changes) return c.json({error:'Stock changed or product unavailable; reload'},409);
  await c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'stock_updated',`${c.req.param('id')}:${size}`).run();
  return c.json({ok:true});
});
const shippingSchema = z.object({city:text(100),amount:z.number().int().min(0).max(10000000),freeThreshold:z.number().int().min(0).max(500000000).nullable()});
app.get('/api/admin/shipping', async c => c.json((await c.env.DB.prepare('SELECT city,amount,free_threshold FROM shipping_rates ORDER BY city').all()).results));
app.put('/api/admin/shipping', async c => {
  const value=shippingSchema.safeParse(await jsonBody(c)); if(!value.success) return c.json({error:'Invalid shipping rate'},400);
  const v=value.data;
  await c.env.DB.batch([c.env.DB.prepare('INSERT INTO shipping_rates VALUES(?,?,?) ON CONFLICT(city) DO UPDATE SET amount=excluded.amount,free_threshold=excluded.free_threshold').bind(v.city,v.amount,v.freeThreshold),c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'shipping_updated',v.city)]);
  return c.json({ok:true});
});
const couponSchema = z.object({code:z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{1,40}$/),percent:z.number().int().min(1).max(100),maxUses:z.number().int().min(1).max(1000000),expiresAt:z.string().datetime().nullable(),enabled:z.boolean()});
app.get('/api/admin/coupons', async c => c.json((await c.env.DB.prepare('SELECT * FROM coupons ORDER BY code').all()).results));
app.put('/api/admin/coupons', async c => {
  const parsed=couponSchema.safeParse(await jsonBody(c)); if(!parsed.success) return c.json({error:'Invalid coupon'},400);
  const v=parsed.data;
  await c.env.DB.batch([c.env.DB.prepare('INSERT INTO coupons(code,percent,max_uses,expires_at,enabled) VALUES(?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET percent=excluded.percent,max_uses=excluded.max_uses,expires_at=excluded.expires_at,enabled=excluded.enabled').bind(v.code,v.percent,v.maxUses,v.expiresAt,v.enabled?1:0), c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'coupon_updated',v.code)]);
  return c.json({ok:true});
});
// Quotes are previews only; the order and database triggers revalidate everything.
async function quote(db:D1Database, city:string, coupon:string | undefined, subtotal:number) {
  const rate=await db.prepare('SELECT amount,free_threshold FROM shipping_rates WHERE city=?').bind(city).first<{amount:number,free_threshold:number|null}>();
  if (!rate) return null;
  let discount=0;
  if (coupon) {
    const c=await db.prepare("SELECT percent FROM coupons WHERE code=? AND enabled=1 AND uses<max_uses AND (expires_at IS NULL OR datetime(expires_at)>datetime('now'))").bind(coupon).first<{percent:number}>();
    if (!c) return null;
    discount=Math.floor(subtotal*c.percent/100);
  }
  const shipping=rate.free_threshold!==null && subtotal-discount>=rate.free_threshold ? 0 : rate.amount;
  return {discount,shipping,total:subtotal-discount+shipping};
}
app.post('/api/quote', async c => {
  const input=z.object({city:text(100),coupon:z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{1,40}$/).optional(),items:z.array(z.object({productId:text(100),ml:z.number().int().positive(),qty:z.number().int().min(1).max(20)})).min(1).max(50)}).safeParse(await jsonBody(c));
  if(!input.success) return c.json({error:'Invalid quote'},400);
  let subtotal=0; const seen=new Set<string>(); const prices=[];
  for (const item of input.data.items) {
    const k=`${item.productId}:${item.ml}`;if(seen.has(k))return c.json({error:'Duplicate item'},400);seen.add(k);
    const row=await c.env.DB.prepare('SELECT data FROM products WHERE id=? AND archived=0').bind(item.productId).first<{data:string}>();
    if(!row)return c.json({error:'Product unavailable'},400);
    const p=product.safeParse(JSON.parse(row.data)); const size=p.success && p.data.sizes.find(s=>s.ml===item.ml);
    if(!size)return c.json({error:'Size unavailable'},400);
    subtotal+=size.price*item.qty;prices.push({productId:item.productId,ml:item.ml,price:size.price});
  }
  const value=await quote(c.env.DB,input.data.city,input.data.coupon,subtotal);
  if(!value)return c.json({error:'Shipping unavailable or invalid coupon'},400);
  return c.json({subtotal,...value,prices});
});
app.post('/api/track', async c => {
  const data=z.object({token:z.string().uuid()}).safeParse(await jsonBody(c)); if(!data.success) return c.json({error:'Not found'},404);
  const row=await c.env.DB.prepare('SELECT id,status,created_at FROM orders WHERE tracking_hash=?').bind(await sha('track:'+data.data.token)).first();
  return row ? c.json(row) : c.json({error:'Not found'},404);
});
app.post('/api/orders', async c => {
  const key = c.req.header('Idempotency-Key');
  if (!key || !/^[a-f0-9-]{36}$/i.test(key)) return c.json({error:'Idempotency key required'},400);
  const data=order.safeParse(await jsonBody(c)); if (!data.success) return c.json({error:'Invalid order'},400);
  const requestHash = await sha(JSON.stringify(data.data));
  const previous = await c.env.DB.prepare('SELECT id,subtotal,shipping,discount,request_hash FROM orders WHERE idempotency_key=?').bind(key).first<{id:string,subtotal:number,shipping:number,discount:number,request_hash:string}>();
  if (previous) return previous.request_hash === requestHash ? c.json({id:previous.id,subtotal:previous.subtotal,shipping:previous.shipping,discount:previous.discount,total:previous.subtotal-previous.discount+previous.shipping,trackingToken:key},200) : c.json({error:'Idempotency key reused'},409);
  const seen = new Set<string>(); const rows: {id:string;name:string;ml:number;price:number;qty:number}[] = [];
  const changed: {productId:string;ml:number;price:number}[] = [];
  for (const item of data.data.items) {
    const itemKey = `${item.productId}:${item.ml}`; if(seen.has(itemKey)) return c.json({error:'Duplicate item'},400); seen.add(itemKey);
    const row=await c.env.DB.prepare('SELECT data FROM products WHERE id=? AND archived=0').bind(item.productId).first<{data:string}>();
    if (!row) return c.json({error:'Product unavailable'},400);
    const p=product.safeParse(JSON.parse(row.data)); const size=p.success && p.data.sizes.find(x=>x.ml===item.ml);
    if (!p.success || !size) return c.json({error:'Size unavailable'},400);
    if (item.expectedPrice !== size.price) changed.push({productId:item.productId,ml:item.ml,price:size.price});
    rows.push({id:item.productId,name:JSON.stringify(p.data.name),ml:item.ml,price:size.price,qty:item.qty});
  }
  if (changed.length) return c.json({error:'Prices changed',changed},409);
  const id=crypto.randomUUID(), customer=data.data.customer, subtotal=rows.reduce((sum,x)=>sum+x.price*x.qty,0);
  const calculated=await quote(c.env.DB,customer.city,data.data.coupon,subtotal);
  if (!calculated || calculated.shipping!==data.data.expectedShipping || calculated.discount!==data.data.expectedDiscount) return c.json({error:'Shipping or coupon changed'},409);
  try {
    await c.env.DB.batch([c.env.DB.prepare('INSERT INTO orders(id,customer_name,phone,city,address,note,subtotal,idempotency_key,request_hash,stock_reserved,shipping,discount,coupon_code,tracking_hash) VALUES (?,?,?,?,?,?,?,?,?,1,?,?,?,?)').bind(id,customer.name,customer.phone,customer.city,customer.address,customer.note,subtotal,key,requestHash,calculated.shipping,calculated.discount,data.data.coupon || null,await sha('track:'+key)), ...rows.map(x=>c.env.DB.prepare('INSERT INTO order_items VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,x.id,x.name,x.ml,x.price,x.qty))]);
  } catch (error) {
    const existing = await c.env.DB.prepare('SELECT id,subtotal,shipping,discount,request_hash FROM orders WHERE idempotency_key=?').bind(key).first<{id:string,subtotal:number,shipping:number,discount:number,request_hash:string}>();
    if (!existing) { const message=String(error); if (message.includes('insufficient_stock') || message.includes('product_changed') || message.includes('coupon_changed') || message.includes('shipping_changed')) return c.json({error:'Product price or stock changed. Refresh your cart and try again.'},409); throw error; }
    return existing.request_hash === requestHash ? c.json({id:existing.id,subtotal:existing.subtotal,shipping:existing.shipping,discount:existing.discount,total:existing.subtotal-existing.discount+existing.shipping,trackingToken:key},200) : c.json({error:'Idempotency key reused'},409);
  }
  return c.json({id,subtotal,...calculated,trackingToken:key},201);
});
app.get('/api/admin/orders', async c => {
  const page = Math.min(Math.max(Number.parseInt(c.req.query('page') || '1',10) || 1,1),10000);
  const status = c.req.query('status') || '', q = (c.req.query('q') || '').trim().slice(0,100);
  if (status && !['new','confirmed','shipped','completed','cancelled'].includes(status)) return c.json({error:'Invalid status'},400);
  const pattern = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
  const filter = "WHERE (?='' OR status=?) AND (?='' OR id LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\')";
  const orders=(await c.env.DB.prepare(`SELECT * FROM orders ${filter} ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET ?`).bind(status,status,q,pattern,pattern,(page-1)*20).all()).results;
  const hasMore = orders.length > 20; if (hasMore) orders.pop();
  const ids=orders.map(o=>o.id); const items=ids.length ? (await c.env.DB.prepare(`SELECT * FROM order_items WHERE order_id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all()).results : [];
  return c.json({orders,items,page,hasMore});
});
app.patch('/api/admin/orders/:id', async c => {
  const data=z.object({status:z.enum(['new','confirmed','shipped','completed','cancelled'])}).safeParse(await jsonBody(c)); if(!data.success) return c.json({error:'Invalid status'},400);
  let r; try { r=await c.env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind(data.data.status,c.req.param('id')).run(); } catch (error) { if (String(error).includes('cancelled_order_is_final')) return c.json({error:'Cancelled orders cannot be reopened'},409); throw error; }
  if (!r.meta.changes) return c.json({error:'Not found'},404);
  await c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),`order_status:${data.data.status}`,c.req.param('id')).run();
  return c.json({ok:true});
});
const imageKey = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const maxImageBytes = 1_000_000;
const maxMultipartBytes = 1_050_000;
const toBase64 = (bytes: Uint8Array): string => {
  const native = (bytes as unknown as { toBase64?: () => string }).toBase64;
  if (typeof native === 'function') return native.call(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};
const fromBase64 = (b64: string): Uint8Array<ArrayBuffer> => {
  const native = (Uint8Array as unknown as { fromBase64?: (s: string) => Uint8Array }).fromBase64;
  if (typeof native === 'function') {
    const decoded = native.call(Uint8Array, b64);
    const out = new Uint8Array(decoded.byteLength);
    out.set(decoded);
    return out;
  }
  const binary = atob(b64), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};
app.get('/api/admin/images', async c => {
  const cursor=c.req.query('cursor') || '';
  if (cursor && !imageKey.test(cursor)) return c.json({error:'Invalid cursor'},400);
  const rows=(await c.env.DB.prepare('SELECT key,size,created_at AS uploaded FROM images WHERE key>? ORDER BY key LIMIT 101').bind(cursor).all<{key:string,size:number,uploaded:string}>()).results;
  const more=rows.length>100;
  if (more) rows.pop();
  return c.json({images:rows,cursor:more ? rows[rows.length-1].key : null});
});
const edgeCache = (): Cache | undefined => (typeof caches !== 'undefined' ? (caches as unknown as { default?: Cache }).default : undefined);
const deleteImage = async (c: Context<Env>) => {
  const key=c.req.param('key'); if(!imageKey.test(key)) return c.json({error:'Invalid key'},400);
  // The reference check, tombstone, audit entry and deletion share one D1
  // transaction. Product triggers prevent later references to a tombstoned key.
  const results=await c.env.DB.batch([
    c.env.DB.prepare("INSERT OR IGNORE INTO deleted_images(key) SELECT ? WHERE EXISTS (SELECT 1 FROM images WHERE key=?) AND NOT EXISTS (SELECT 1 FROM products p WHERE instr(COALESCE(json_extract(p.data,'$.cutout'),''),'/api/images/' || ?)>0 OR EXISTS (SELECT 1 FROM json_each(p.data,'$.images') j WHERE instr(j.value,'/api/images/' || ?)>0))").bind(key,key,key,key),
    c.env.DB.prepare("INSERT INTO audit_log(id,admin_id,action,target_id) SELECT ?,?,'image_deleted',? WHERE EXISTS (SELECT 1 FROM images WHERE key=?) AND EXISTS (SELECT 1 FROM deleted_images WHERE key=?)").bind(crypto.randomUUID(),c.get('adminId'),key,key,key),
    c.env.DB.prepare('DELETE FROM images WHERE key=? AND EXISTS (SELECT 1 FROM deleted_images WHERE key=?)').bind(key,key)
  ]);
  if (results[2].meta.changes) {
    await edgeCache()?.delete(new Request(new URL(`/api/images/${key}`, c.req.url).toString(), { method: 'GET' }));
    return c.json({ok:true});
  }
  const existing=await c.env.DB.prepare('SELECT key FROM images WHERE key=?').bind(key).first();
  return existing ? c.json({error:'Image is referenced by a product'},409) : c.json({error:'Not found'},404);
};
app.delete('/api/admin/images/:key', deleteImage);
app.delete('/api/images/:key', adminGuard, deleteImage);
const uploadImage = async (c: Context<Env>) => {
  if (!c.req.header('Content-Type')?.toLowerCase().startsWith('multipart/form-data;')) return c.json({error:'Invalid upload'},400);
  const contentLength = Number(c.req.header('Content-Length') || 0);
  if (contentLength > maxMultipartBytes) return c.json({error:'Image upload too large (max 1 MB)'},413);
  // Enforce the limit while reading, including for requests without Content-Length.
  const reader=c.req.raw.body?.getReader();
  if (!reader) return c.json({error:'Invalid upload'},400);
  const chunks: Uint8Array[]=[]; let length=0;
  try {
    for (;;) {
      const {done,value}=await reader.read(); if(done) break;
      length+=value.byteLength;
      if(length>maxMultipartBytes) { await reader.cancel(); return c.json({error:'Image upload too large (max 1 MB)'},413); }
      chunks.push(value);
    }
  } catch { return c.json({error:'Invalid upload'},400); }
  const body=new Uint8Array(length); let offset=0;
  for(const chunk of chunks) {body.set(chunk,offset);offset+=chunk.byteLength;}
  let form: FormData;
  try { form=await new Response(body,{headers:{'Content-Type':c.req.header('Content-Type')!}}).formData(); }
  catch { return c.json({error:'Invalid upload'},400); }
  const files=form.getAll('file'); const file=files[0];
  if (files.length!==1 || !(file instanceof File) || file.size<12) return c.json({error:'Invalid image'},400);
  if (file.size>maxImageBytes) return c.json({error:'Image exceeds 1 MB limit'},413);
  const bytes=new Uint8Array(await file.arrayBuffer());
  const type=bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff ? 'image/jpeg' : bytes[0]===0x89 && bytes[1]===0x50 && bytes[2]===0x4e && bytes[3]===0x47 && bytes[4]===0x0d && bytes[5]===0x0a && bytes[6]===0x1a && bytes[7]===0x0a ? 'image/png' : String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP' ? 'image/webp' : null;
  if (!type) return c.json({error:'Only JPEG, PNG and WebP are supported'},400);
  const key=crypto.randomUUID();
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO images(key,content_type,data_base64,size) VALUES(?,?,?,?)').bind(key,type,toBase64(bytes),bytes.length),
    c.env.DB.prepare('INSERT INTO audit_log(id,admin_id,action,target_id) VALUES(?,?,?,?)').bind(crypto.randomUUID(),c.get('adminId'),'image_uploaded',key)
  ]);
  return c.json({id:key,url:`/api/images/${key}`},201);
};
app.post('/api/admin/images', uploadImage);
app.post('/api/images', adminGuard, uploadImage);
app.get('/api/images/:key', async c => {
  const key=c.req.param('key');
  if(!imageKey.test(key)) { c.header('Cache-Control','no-store'); return c.notFound(); }
  const cacheKey = new Request(new URL(`/api/images/${key}`, c.req.url).toString(), { method: 'GET' });
  const cache = edgeCache();
  const cached = await cache?.match(cacheKey);
  if (cached) return cached;
  const image=await c.env.DB.prepare('SELECT content_type,data_base64 FROM images WHERE key=?').bind(key).first<{content_type:string,data_base64:string}>();
  if(!image) { c.header('Cache-Control','no-store'); return c.notFound(); }
  const bytes=fromBase64(image.data_base64);
  const res = new Response(bytes, {
    headers: {
      'Content-Type': image.content_type,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
  if (cache) await cache.put(cacheKey, res.clone());
  return res;
});
app.all('/api/*', c => c.json({error:'Not found'},404));
export default app;
