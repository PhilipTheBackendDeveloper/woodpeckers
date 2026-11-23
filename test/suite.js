/**
 * Woodpeckers Sneakers & Streetwear — In-Process End-to-End Test Suite
 * Tests REST APIs, Meet the Reserve Engine, Inventory & Orders, Admin, and Static Assets
 */

const { PassThrough } = require('stream');
const http = require('http');
const assert = require('assert');
const server = require('../server.js');

function request(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const socket = new PassThrough();
    const req = new http.IncomingMessage(socket);
    req.method = method.toUpperCase();
    req.url = url;
    req.headers = { host: 'localhost', 'content-type': 'application/json' };

    const resSocket = new PassThrough();
    const res = new http.ServerResponse(req);
    res.assignSocket(resSocket);

    let rawData = '';
    resSocket.on('data', chunk => rawData += chunk.toString('utf-8'));

    res.on('finish', () => {
      // resSocket stream contains HTTP response headers and body
      // Extract HTTP body after \r\n\r\n
      let bodyStr = rawData;
      const headerEnd = rawData.indexOf('\r\n\r\n');
      if (headerEnd !== -1) {
        bodyStr = rawData.substring(headerEnd + 4);
      }

      let json = null;
      try {
        json = JSON.parse(bodyStr);
      } catch (e) {}

      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: bodyStr,
        json
      });
    });

    server.emit('request', req, res);

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.emit('data', Buffer.from(payload));
    }
    req.emit('end');
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING WOODPECKERS END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('API: /api/health returns 200 and Woodpeckers brand info', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.status, 'ok');
    assert.strictEqual(res.json.business, 'Woodpeckers Sneakers & Streetwear');
    assert.ok(res.json.currency.includes('GH₵'));
  });

  // 2. Products API
  await test('API: /api/products returns catalogue with GHS pricing', async () => {
    const res = await request('GET', '/api/products');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.json));
    assert.ok(res.json.length >= 6);
    const aj1 = res.json.find(p => p.id === 'SNK-001');
    assert.ok(aj1, 'AJ1 Chicago found in catalogue');
    assert.strictEqual(aj1.price, 3850);
    assert.strictEqual(aj1.reserveEligible, true);
  });

  await test('API: /api/products?reserveOnly=true filters for Reserve-eligible grails only', async () => {
    const res = await request('GET', '/api/products?reserveOnly=true');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json.every(p => p.reserveEligible === true));
  });

  await test('API: /api/products/SNK-001 returns single product details with sizes & stock', async () => {
    const res = await request('GET', '/api/products/SNK-001');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.id, 'SNK-001');
    assert.ok(res.json.sizes.length > 0);
  });

  // 3. Meet the Reserve Engine
  let createdOfferRef = null;
  await test('Reserve Engine: Submitting an offer validates inputs and creates an offer record', async () => {
    const payload = {
      productId: 'SNK-001',
      size: 'UK 8',
      customerName: 'Philip Ayesu',
      customerEmail: 'philip@test.com',
      customerPhone: '+233 55 000 1122',
      offerAmount: 3400.00
    };
    const res = await request('POST', '/api/reserve/offers', payload);
    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.json.success);
    assert.ok(res.json.reference.startsWith('WPK-RSV-'));
    createdOfferRef = res.json.reference;
  });

  await test('Reserve Engine: Querying offer by reference returns complete history trail', async () => {
    assert.ok(createdOfferRef, 'Offer ref must exist');
    const res = await request('GET', `/api/reserve/offers/${createdOfferRef}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.reference, createdOfferRef);
    assert.strictEqual(res.json.customerName, 'Philip Ayesu');
    assert.ok(res.json.history.length >= 1);
  });

  await test('Reserve Engine: Rejects unreasonably low offer below minimum threshold', async () => {
    const payload = {
      productId: 'SNK-001',
      size: 'UK 8',
      customerName: 'Lowballer',
      customerEmail: 'low@test.com',
      customerPhone: '+233 24 111 2233',
      offerAmount: 100 // retail is 3,850
    };
    const res = await request('POST', '/api/reserve/offers', payload);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.json.error);
  });

  await test('Reserve Engine: Admin counteroffer proposal updates status to counteroffered', async () => {
    const res = await request('POST', `/api/reserve/offers/${createdOfferRef}/action`, {
      action: 'counteroffer',
      counterAmount: 3500.00,
      note: 'Special client price'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.offer.status, 'counteroffered');
    assert.strictEqual(res.json.offer.counterAmount, 3500);
  });

  await test('Reserve Engine: Customer accepting counteroffer locks price and status to accepted', async () => {
    const res = await request('POST', `/api/reserve/offers/${createdOfferRef}/action`, {
      action: 'customer_accept_counter'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.offer.status, 'accepted');
    assert.strictEqual(res.json.offer.offerAmount, 3500);
  });

  // 4. Orders & Inventory Management
  let createdOrderNum = null;
  await test('Orders: Creating an order verifies stock, deducts inventory, and links reserve ref', async () => {
    let prodBefore = await request('GET', '/api/products/SNK-001');
    let sizeObjBefore = prodBefore.json.sizes.find(s => s.size === 'UK 8');
    if (!sizeObjBefore || sizeObjBefore.stock < 2) {
      // Replenish stock for test idempotency
      const updatedSizes = prodBefore.json.sizes.map(s => s.size === 'UK 8' ? { ...s, stock: 5 } : s);
      await request('PUT', '/api/products/SNK-001', { sizes: updatedSizes });
      prodBefore = await request('GET', '/api/products/SNK-001');
      sizeObjBefore = prodBefore.json.sizes.find(s => s.size === 'UK 8');
    }
    const stockBefore = sizeObjBefore.stock;

    const orderPayload = {
      customerName: 'Philip Ayesu',
      customerEmail: 'philip@test.com',
      customerPhone: '+233 55 000 1122',
      shippingAddress: {
        street: '24 Blohum Rd Area',
        city: 'Accra',
        region: 'Greater Accra',
        country: 'Ghana'
      },
      items: [
        {
          productId: 'SNK-001',
          productName: "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
          size: 'UK 8',
          quantity: 1,
          price: 3500.00
        }
      ],
      deliveryMethod: 'Accra Metro Delivery',
      deliveryFee: 35.0,
      paymentMethod: 'MTN Mobile Money',
      reserveOfferRef: createdOfferRef
    };

    const res = await request('POST', '/api/orders', orderPayload);
    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.json.success);
    assert.ok(res.json.order.orderNumber.startsWith('WPK-ORD-'));
    assert.strictEqual(res.json.order.total, 3535.00);
    createdOrderNum = res.json.order.orderNumber;

    // Verify inventory deducted
    const prodAfter = await request('GET', '/api/products/SNK-001');
    const sizeObjAfter = prodAfter.json.sizes.find(s => s.size === 'UK 8');
    assert.strictEqual(sizeObjAfter.stock, stockBefore - 1, 'Inventory stock successfully decremented by 1');

    // Verify linked reserve offer marked completed
    const offerAfter = await request('GET', `/api/reserve/offers/${createdOfferRef}`);
    assert.strictEqual(offerAfter.json.status, 'completed', 'Reserve offer marked completed after order placed');
  });

  await test('Orders: Querying order returns full customer, payment and item details', async () => {
    assert.ok(createdOrderNum, 'Order number must exist');
    const res = await request('GET', `/api/orders/${createdOrderNum}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.orderNumber, createdOrderNum);
    assert.strictEqual(res.json.customerName, 'Philip Ayesu');
    assert.strictEqual(res.json.paymentStatus, 'paid');
  });

  await test('Orders: Staff can update fulfilment status (Processing -> Dispatched)', async () => {
    const res = await request('PUT', `/api/orders/${createdOrderNum}`, {
      fulfilmentStatus: 'dispatched'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.fulfilmentStatus, 'dispatched');
  });

  // 5. Admin Metrics
  await test('Admin: /api/admin/metrics returns real-time KPI aggregates', async () => {
    const res = await request('GET', '/api/admin/metrics');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(typeof res.json.totalSales === 'number');
    assert.ok(res.json.totalSales > 0);
    assert.ok(typeof res.json.totalOrders === 'number');
    assert.ok(Array.isArray(res.json.lowStock));
  });

  // 6. Authentication
  await test('Auth: Store manager login validates credentials', async () => {
    const res = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'woodpeckers2026'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.role, 'admin');
    assert.ok(res.json.token);
  });

  await test('Auth: Rejects incorrect password', async () => {
    const res = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'wrongpassword'
    });
    assert.strictEqual(res.statusCode, 401);
  });

  // 6b. Contact and Newsletter APIs
  await test('API: /api/contact submits message and returns confirmation', async () => {
    const res = await request('POST', '/api/contact', {
      fname: 'Kofi',
      lname: 'Mensah',
      email: 'kofi@example.com',
      phone: '+233 55 123 4567',
      message: 'Inquiring about Friday drop in Dzorwulu'
    });
    assert.strictEqual(res.statusCode, 200);
    const json = JSON.parse(res.body);
    assert.strictEqual(json.success, true);
  });

  await test('API: /api/newsletter subscribes email and returns confirmation', async () => {
    const res = await request('POST', '/api/newsletter', {
      email: 'collector@ghana.com'
    });
    assert.strictEqual(res.statusCode, 200);
    const json = JSON.parse(res.body);
    assert.strictEqual(json.success, true);
  });

  // 7. Static Web Pages Serving
  const pages = [
    '/',
    '/index.html',
    '/reserve.html',
    '/admin.html',
    '/products.html',
    '/product-single.html',
    '/cart.html',
    '/checkout.html',
    '/order-received.html',
    '/about.html',
    '/contact.html'
  ];

  for (const p of pages) {
    await test(`Static Server: GET ${p} returns 200 OK with HTML content`, async () => {
      const res = await request('GET', p);
      assert.strictEqual(res.statusCode, 200, `Expected 200 for ${p}`);
      assert.ok(res.body.includes('Woodpeckers'), 'Page contains Woodpeckers branding');
    });
  }

  // 8. Nike Streetwear Revamp Verifications
  await test('UI / Branding: index.html has local video player with play button and quote only', async () => {
    const res = await request('GET', '/index.html');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('videos/woodpeckers-spec-ad.mp4'), 'Embeds local MP4 video asset');
    assert.ok(res.body.includes('id="woodpeckersLocalVideo"'), 'Has local video element');
    assert.ok(res.body.includes('id="videoSoundBtn"'), 'Has central interactive play/sound toggle button');
    assert.ok(res.body.includes('Street is a state of mind. Wear the mindset.'), 'Has official Woodpeckers street mindset quote');
    assert.ok(!res.body.includes('woodpeckersPromoVideo'), 'Old YouTube iframe is removed');
  });

  await test('UI / Branding: All pill badges stripped across site', async () => {
    const res = await request('GET', '/index.html');
    assert.ok(!res.body.includes('section-sub-title'), 'Zero section-sub-title pill badges in index.html');
    assert.ok(!res.body.includes('Exclusive Flat 50% Off Collection'), 'Generic template sale banner removed');
  });

  await test('UI / Navigation: Meet The Reserve is prominently present in navigation menu', async () => {
    const res = await request('GET', '/index.html');
    assert.ok(res.body.includes('reserve-badge-link'), 'Navigation contains Meet The Reserve badge link');
    assert.ok(res.body.includes('href="reserve.html"'), 'Navigation links directly to reserve.html');
    assert.ok(!res.body.includes('<li class="nav-item submenu"><a class="nav-link" href="#">Pages</a>'), 'Cluttered Pages dropdown removed from main nav');
  });

  await test('Typography: Clean condensed streetwear font (Oswald) configured in custom.css', async () => {
    const fs = require('fs');
    const css = fs.readFileSync('css/custom.css', 'utf8');
    assert.ok(css.includes("'Oswald'"), 'Oswald condensed font defined in custom.css');
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
