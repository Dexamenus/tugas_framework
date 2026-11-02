// Skrip uji alur BookStore. Jalankan HANYA pada database kosong (data uji memakai ISBN/email tetap):
//   npm run start:dev   (terminal 1)
//   node test/e2e-bookstore.mjs   (terminal 2)
const B = process.env.BASE_URL ?? 'http://localhost:3000';
let pass = 0, fail = 0;
const call = async (method, path, body) => {
  const r = await fetch(B + path, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  let j; try { j = await r.json(); } catch { j = null; }
  return { s: r.status, d: j?.data ?? j, raw: j };
};
const ok = (name, cond, extra='') => { cond ? pass++ : fail++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  -> ' + extra)); };

const cat = await call('POST', '/categories', { name: 'Programming' });
ok('create category', cat.s === 201, JSON.stringify(cat.raw));
ok('duplicate category -> 409', (await call('POST', '/categories', { name: 'Programming' })).s === 409);
const pub = await call('POST', '/publishers', { name: 'Informatika' });
const a1 = await call('POST', '/authors', { name: 'Penulis Satu' });
const a2 = await call('POST', '/authors', { name: 'Penulis Dua' });
ok('create publisher/authors', pub.s === 201 && a1.s === 201 && a2.s === 201);

const b1 = await call('POST', '/books', { title: 'Belajar NestJS', isbn: '978-1', publishedYear: 2024, price: 130000, stock: 5, categoryId: cat.d.id, publisherId: pub.d.id, authorIds: [a1.d.id, a2.d.id] });
ok('create book with relations', b1.s === 201, JSON.stringify(b1.raw));
const b2 = await call('POST', '/books', { title: 'Buku Langka', isbn: '978-2', publishedYear: 2020, price: 99999.99, stock: 1 });
ok('create book 2', b2.s === 201, JSON.stringify(b2.raw));
ok('duplicate ISBN -> 409', (await call('POST', '/books', { title: 'x', isbn: '978-1', publishedYear: 1 })).s === 409);
const gb = await call('GET', '/books/' + b1.d.id);
ok('book returns 2 authors + category + numeric price', gb.d.authors?.length === 2 && gb.d.category?.name === 'Programming' && gb.d.price === 130000, JSON.stringify(gb.raw).slice(0,300));
const up = await call('PATCH', '/books/' + b1.d.id, { stock: 6 });
ok('PATCH book (DTO decorators work)', up.s === 200 && up.d.stock === 6, JSON.stringify(up.raw));

const cu = await call('POST', '/customers', { name: 'Budi', email: 'budi@mail.com', phone: '0812' });
ok('create customer', cu.s === 201, JSON.stringify(cu.raw));
ok('duplicate email -> 409', (await call('POST', '/customers', { name: 'X', email: 'budi@mail.com' })).s === 409);
ok('invalid email -> 400', (await call('POST', '/customers', { name: 'X', email: 'bukan-email' })).s === 400);
const ad = await call('POST', `/customers/${cu.d.id}/addresses`, { recipientName: 'Budi', phone: '0812', address: 'Jl. Mawar 1', city: 'Tegal', postalCode: '52111' });
ok('create address', ad.s === 201, JSON.stringify(ad.raw));

// --- checkout
const o1 = await call('POST', '/orders', { customerId: cu.d.id, addressId: ad.d.id, items: [{ bookId: b1.d.id, quantity: 2 }, { bookId: b2.d.id, quantity: 1 }] });
ok('checkout 201', o1.s === 201, JSON.stringify(o1.raw));
ok('total = 2*130000 + 99999.99 = 359999.99', o1.d.totalAmount === 359999.99, String(o1.d.totalAmount));
ok('status pending + order number', o1.d.status === 'pending' && /^ORD-\d{8}-[0-9A-F]{8}$/.test(o1.d.orderNumber), o1.d.orderNumber);
ok('address snapshot copied', o1.d.shippingCity === 'Tegal' && o1.d.shippingAddress === 'Jl. Mawar 1');
ok('items have price snapshot + subtotal', o1.d.items.length === 2 && o1.d.items.some(i => i.price === 130000 && i.subtotal === 260000));
const s1 = await call('GET', '/books/' + b1.d.id), s2 = await call('GET', '/books/' + b2.d.id);
ok('stock reduced (6->4), last copy sold -> isAvailable=false', s1.d.stock === 4 && s2.d.stock === 0 && s2.d.isAvailable === false, `${s1.d.stock}/${s2.d.stock}/${s2.d.isAvailable}`);
ok('out of stock -> 400', (await call('POST', '/orders', { customerId: cu.d.id, addressId: ad.d.id, items: [{ bookId: b2.d.id, quantity: 1 }] })).s === 400);
ok('qty > stock -> 400', (await call('POST', '/orders', { customerId: cu.d.id, addressId: ad.d.id, items: [{ bookId: b1.d.id, quantity: 99 }] })).s === 400);
ok('empty items -> 400', (await call('POST', '/orders', { customerId: cu.d.id, addressId: ad.d.id, items: [] })).s === 400);
const s1b = await call('GET', '/books/' + b1.d.id);
ok('failed checkouts did not change stock (rollback)', s1b.d.stock === 4);

// price snapshot stays after price change
await call('PATCH', '/books/' + b1.d.id, { price: 150000 });
const o1r = await call('GET', '/orders/' + o1.d.id);
ok('old order keeps old price after catalog change', o1r.d.items.some(i => i.price === 130000) && o1r.d.items.find(i => i.bookId === b1.d.id).book.price === 150000);

// --- payment
ok('ship before paid -> 400', (await call('POST', '/shipments', { orderId: o1.d.id, courier: 'JNE' })).s === 400);
const p1 = await call('POST', '/payments', { orderId: o1.d.id, paymentMethod: 'bank_transfer' });
ok('create payment, amount from order', p1.s === 201 && p1.d.amount === 359999.99 && p1.d.status === 'pending', JSON.stringify(p1.raw));
ok('second payment -> 409', (await call('POST', '/payments', { orderId: o1.d.id, paymentMethod: 'x' })).s === 409);
const p1f = await call('PATCH', `/payments/${p1.d.id}/status`, { status: 'failed' });
ok('payment failed', p1f.s === 200 && p1f.d.status === 'failed');
const p1r = await call('POST', '/payments', { orderId: o1.d.id, paymentMethod: 'qris' });
ok('retry after failed reuses same record', p1r.s === 201 && p1r.d.id === p1.d.id && p1r.d.status === 'pending' && p1r.d.paymentMethod === 'qris', JSON.stringify(p1r.raw));
const p1p = await call('PATCH', `/payments/${p1.d.id}/status`, { status: 'paid' });
ok('payment paid + paidAt', p1p.s === 200 && p1p.d.status === 'paid' && p1p.d.paidAt, JSON.stringify(p1p.raw));
ok('order now paid', (await call('GET', '/orders/' + o1.d.id)).d.status === 'paid');
ok('cancel paid order -> 400', (await call('PATCH', `/orders/${o1.d.id}/cancel`)).s === 400);

// --- shipment
const sh = await call('POST', '/shipments', { orderId: o1.d.id, courier: 'JNE' });
ok('create shipment -> order processing', sh.s === 201 && (await call('GET', '/orders/' + o1.d.id)).d.status === 'processing', JSON.stringify(sh.raw));
ok('duplicate shipment -> 409/400', [409, 400].includes((await call('POST', '/shipments', { orderId: o1.d.id, courier: 'JNE' })).s));
ok('shipped without tracking -> 400', (await call('PATCH', `/shipments/${sh.d.id}/status`, { status: 'shipped' })).s === 400);
ok('skip to delivered -> 400', (await call('PATCH', `/shipments/${sh.d.id}/status`, { status: 'delivered' })).s === 400);
const shs = await call('PATCH', `/shipments/${sh.d.id}/status`, { status: 'shipped', trackingNumber: 'JNE123' });
ok('shipped with resi', shs.s === 200 && shs.d.status === 'shipped' && shs.d.shippedAt && shs.d.trackingNumber === 'JNE123', JSON.stringify(shs.raw));
ok('order shipped', (await call('GET', '/orders/' + o1.d.id)).d.status === 'shipped');
const shd = await call('PATCH', `/shipments/${sh.d.id}/status`, { status: 'delivered' });
ok('delivered + deliveredAt', shd.s === 200 && shd.d.deliveredAt);
const final = await call('GET', '/orders/' + o1.d.id);
ok('order completed with payment+shipment+items', final.d.status === 'completed' && final.d.payment?.status === 'paid' && final.d.shipment?.status === 'delivered' && final.d.items.length === 2);

// --- cancel flow restores stock
const o2 = await call('POST', '/orders', { customerId: cu.d.id, addressId: ad.d.id, items: [{ bookId: b1.d.id, quantity: 3 }] });
const before = (await call('GET', '/books/' + b1.d.id)).d.stock;
const c2 = await call('PATCH', `/orders/${o2.d.id}/cancel`);
const after = (await call('GET', '/books/' + b1.d.id)).d.stock;
ok('cancel pending order -> cancelled, stock restored', c2.s === 200 && c2.d.status === 'cancelled' && after === before + 3, `${before}->${after} ${JSON.stringify(c2.raw).slice(0,200)}`);
ok('pay cancelled order -> 400', (await call('POST', '/payments', { orderId: o2.d.id, paymentMethod: 'x' })).s === 400);

// --- concurrency: 1 copy left, 5 parallel checkouts
const b3 = await call('POST', '/books', { title: 'Rebutan', isbn: '978-3', publishedYear: 2021, price: 50000, stock: 1 });
const results = await Promise.all(Array.from({ length: 5 }, () => call('POST', '/orders', { customerId: cu.d.id, addressId: ad.d.id, items: [{ bookId: b3.d.id, quantity: 1 }] })));
const created = results.filter(r => r.s === 201).length, rejected = results.filter(r => r.s === 400).length;
ok('concurrency: exactly 1 of 5 parallel checkouts wins', created === 1 && rejected === 4, results.map(r => r.s).join(','));
ok('stock never negative', (await call('GET', '/books/' + b3.d.id)).d.stock === 0);

// --- misc
ok('invalid uuid param -> 400', (await call('GET', '/orders/abc')).s === 400);
ok('unknown order -> 404', (await call('GET', '/orders/00000000-0000-4000-8000-000000000000')).s === 404);
ok('orders filter by customer', (await call('GET', '/orders?customerId=' + cu.d.id)).d.length >= 3);
ok('soft delete book keeps order history', (await call('DELETE', '/books/' + b2.d.id)).s === 200 && (await call('GET', '/orders/' + o1.d.id)).d.items.length === 2);
ok('soft delete customer', (await call('DELETE', '/customers/' + cu.d.id)).s === 200 && (await call('GET', '/customers/' + cu.d.id)).s === 404);
console.log(`\n${pass} passed, ${fail} failed`);
