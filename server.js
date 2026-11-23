/**
 * Woodpeckers Sneakers & Streetwear — Full-Stack Server
 * Zero-dependency Node.js HTTP REST API & Static Asset Server
 * Supports: Products, Meet the Reserve Engine, Orders & Inventory, Admin Dashboard, Customer Account
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const STORE_PATH = path.join(__dirname, 'data', 'store.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4'
};

// In-memory data store with disk persistence
let store = {
  products: [],
  reserveOffers: [],
  orders: [],
  settings: {},
  adminUser: {}
};

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      store = JSON.parse(raw);
      console.log(`[Woodpeckers DB] Loaded ${store.products.length} products, ${store.reserveOffers.length} offers, ${store.orders.length} orders.`);
    }
  } catch (err) {
    console.error('[Woodpeckers DB] Failed to load store.json:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Woodpeckers DB] Failed to save store.json:', err);
  }
}

loadStore();

// Utility helpers
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendError(res, status, message) {
  sendJSON(res, status, { error: true, message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function generateRef(prefix = 'WPK-RSV') {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

// Router
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ---------------- API ENDPOINTS ----------------
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health check
      if (pathname === '/api/health' && method === 'GET') {
        return sendJSON(res, 200, {
          status: 'ok',
          business: 'Woodpeckers Sneakers & Streetwear',
          currency: 'GHS (GH₵)',
          location: 'Dzorwulu, Accra, Ghana',
          timestamp: new Date().toISOString()
        });
      }

      // 2. Settings
      if (pathname === '/api/settings') {
        if (method === 'GET') {
          return sendJSON(res, 200, store.settings);
        }
        if (method === 'POST') {
          const body = await parseBody(req);
          store.settings = { ...store.settings, ...body };
          saveStore();
          return sendJSON(res, 200, store.settings);
        }
      }

      // 3. Products
      if (pathname === '/api/products') {
        if (method === 'GET') {
          let list = [...store.products];
          const { category, reserveOnly, search, sort } = parsedUrl.query;

          if (category && category !== 'All') {
            list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
          }
          if (reserveOnly === 'true' || reserveOnly === '1') {
            list = list.filter(p => p.reserveEligible === true);
          }
          if (search) {
            const q = search.toLowerCase();
            list = list.filter(p =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
            );
          }
          if (sort === 'price-low') {
            list.sort((a, b) => a.price - b.price);
          } else if (sort === 'price-high') {
            list.sort((a, b) => b.price - a.price);
          } else if (sort === 'rating') {
            list.sort((a, b) => b.rating - a.rating);
          }
          return sendJSON(res, 200, list);
        }

        if (method === 'POST') {
          const body = await parseBody(req);
          if (!body.name || !body.price) {
            return sendError(res, 400, 'Product name and price are required.');
          }
          const newProduct = {
            id: body.id || `PRD-${Date.now().toString().slice(-4)}`,
            sku: body.sku || `WPK-${Date.now().toString().slice(-6)}`,
            name: body.name,
            category: body.category || 'Exclusive Sneakers',
            brand: body.brand || 'Woodpeckers',
            price: parseFloat(body.price),
            originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : parseFloat(body.price) * 1.15,
            description: body.description || '',
            images: body.images && body.images.length ? body.images : ['images/product-image-1.jpg'],
            sizes: body.sizes || [
              { size: 'UK 7', stock: 2 },
              { size: 'UK 8', stock: 2 },
              { size: 'UK 9', stock: 2 }
            ],
            reserveEligible: Boolean(body.reserveEligible),
            reserveFloor: body.reserveFloor ? parseFloat(body.reserveFloor) : 0,
            reserveGuidance: body.reserveGuidance || '',
            tags: body.tags || ['New Drop'],
            rating: 5.0,
            reviewCount: 1
          };
          store.products.unshift(newProduct);
          saveStore();
          return sendJSON(res, 201, newProduct);
        }
      }

      // Product single
      const productMatch = pathname.match(/^\/api\/products\/([A-Za-z0-9_-]+)$/);
      if (productMatch) {
        const id = productMatch[1];
        const productIndex = store.products.findIndex(p => p.id === id || p.sku === id);

        if (productIndex === -1) {
          return sendError(res, 404, 'Product not found.');
        }

        if (method === 'GET') {
          return sendJSON(res, 200, store.products[productIndex]);
        }

        if (method === 'PUT') {
          const body = await parseBody(req);
          store.products[productIndex] = {
            ...store.products[productIndex],
            ...body
          };
          saveStore();
          return sendJSON(res, 200, store.products[productIndex]);
        }

        if (method === 'DELETE') {
          const deleted = store.products.splice(productIndex, 1);
          saveStore();
          return sendJSON(res, 200, { success: true, deleted: deleted[0] });
        }
      }

      // 4. Meet the Reserve Engine
      // List offers or filter
      if (pathname === '/api/reserve/offers' && method === 'GET') {
        let offers = [...store.reserveOffers];
        const { status, email, reference } = parsedUrl.query;
        if (status && status !== 'all') {
          offers = offers.filter(o => o.status.toLowerCase() === status.toLowerCase());
        }
        if (email) {
          offers = offers.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
        }
        if (reference) {
          offers = offers.filter(o => o.reference.toLowerCase() === reference.toLowerCase());
        }
        // Most recent first
        offers.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        return sendJSON(res, 200, offers);
      }

      // Submit an offer
      if (pathname === '/api/reserve/offers' && method === 'POST') {
        const body = await parseBody(req);
        const { productId, size, customerName, customerEmail, customerPhone, offerAmount, note } = body;

        if (!productId || !size || !customerName || !customerEmail || !customerPhone || !offerAmount) {
          return sendError(res, 400, 'Please complete all required fields: product, size, name, email, phone, and offer amount.');
        }

        const product = store.products.find(p => p.id === productId || p.sku === productId);
        if (!product) {
          return sendError(res, 404, 'Target product not found.');
        }

        if (!product.reserveEligible) {
          return sendError(res, 400, 'This product is not currently participating in Meet the Reserve.');
        }

        const amount = parseFloat(offerAmount);
        if (isNaN(amount) || amount <= 0) {
          return sendError(res, 400, 'Invalid offer amount.');
        }

        // Enforce safety rule: Cannot offer below 40% of retail price
        const minAllowed = product.price * (store.settings.reserveRules?.minimumOfferRatio || 0.5);
        if (amount < minAllowed) {
          return sendError(res, 400, `Offer is below the minimum threshold for consideration (GH₵ ${minAllowed.toFixed(2)}). Please submit a serious offer.`);
        }

        const reference = generateRef('WPK-RSV');
        const now = new Date();
        const validUntil = new Date(now.getTime() + (store.settings.reserveRules?.offerValidityHours || 48) * 60 * 60 * 1000);

        let initialStatus = 'under_review';
        let counterAmount = null;
        let systemNote = 'Queued for review by Woodpeckers store team';

        // Auto-evaluation rules (configurable demonstration engine)
        if (store.settings.reserveRules?.autoEvaluate) {
          const floor = product.reserveFloor || (product.price * 0.85);
          const autoAcceptThreshold = floor * (store.settings.reserveRules.autoAcceptRatio || 0.95);
          const autoCounterThreshold = floor * (store.settings.reserveRules.autoCounterRatio || 0.85);

          if (amount >= autoAcceptThreshold) {
            initialStatus = 'accepted';
            systemNote = 'Auto-accepted by Meet the Reserve rule (Offer met reserve expectation).';
          } else if (amount >= autoCounterThreshold) {
            initialStatus = 'counteroffered';
            counterAmount = Math.round(floor);
            systemNote = `Auto-counteroffered at GH₵ ${counterAmount.toFixed(2)}. Customer can accept or decline.`;
          }
        }

        const newOffer = {
          reference,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productImage: product.images[0] || 'images/product-image-1.jpg',
          retailPrice: product.price,
          size,
          customerName,
          customerEmail,
          customerPhone,
          offerAmount: amount,
          status: initialStatus,
          submittedAt: now.toISOString(),
          validUntil: validUntil.toISOString(),
          counterAmount,
          internalNotes: note || systemNote,
          history: [
            {
              timestamp: now.toISOString(),
              action: 'submitted',
              actor: 'Customer',
              note: `Offer submitted for GH₵ ${amount.toFixed(2)}`
            },
            {
              timestamp: new Date(now.getTime() + 1000).toISOString(),
              action: initialStatus,
              actor: 'System',
              note: systemNote
            }
          ]
        };

        store.reserveOffers.unshift(newOffer);
        saveStore();
        return sendJSON(res, 201, {
          success: true,
          reference: newOffer.reference,
          status: newOffer.status,
          offer: newOffer,
          message: initialStatus === 'accepted' 
            ? 'Congratulations! Your offer met the reserve target! You can proceed directly to checkout.'
            : initialStatus === 'counteroffered'
            ? `Your offer is close! Woodpeckers counteroffered GH₵ ${counterAmount.toFixed(2)}.`
            : 'Your offer has been submitted and is under review by our store team. Track status using your reference code.'
        });
      }

      // Single offer by reference
      const offerMatch = pathname.match(/^\/api\/reserve\/offers\/([A-Za-z0-9_-]+)$/);
      if (offerMatch && method === 'GET') {
        const ref = offerMatch[1].toUpperCase();
        const offer = store.reserveOffers.find(o => o.reference.toUpperCase() === ref);
        if (!offer) {
          return sendError(res, 404, `No reserve offer found for reference ${ref}`);
        }
        return sendJSON(res, 200, offer);
      }

      // Action on an offer (Accept, Reject, Counteroffer, Customer accept/decline)
      const actionMatch = pathname.match(/^\/api\/reserve\/offers\/([A-Za-z0-9_-]+)\/action$/);
      if (actionMatch && method === 'POST') {
        const ref = actionMatch[1].toUpperCase();
        const offer = store.reserveOffers.find(o => o.reference.toUpperCase() === ref);
        if (!offer) {
          return sendError(res, 404, `Offer ${ref} not found.`);
        }

        const body = await parseBody(req);
        const { action, counterAmount, note, actor } = body;
        const now = new Date().toISOString();

        if (action === 'accept') {
          offer.status = 'accepted';
          offer.counterAmount = null;
          offer.history.push({
            timestamp: now,
            action: 'accepted',
            actor: actor || 'Store Manager',
            note: note || `Offer accepted at GH₵ ${offer.offerAmount.toFixed(2)}. Customer may proceed to checkout.`
          });
        } else if (action === 'reject') {
          offer.status = 'rejected';
          offer.history.push({
            timestamp: now,
            action: 'rejected',
            actor: actor || 'Store Manager',
            note: note || 'Offer declined as it did not meet the reserve floor.'
          });
        } else if (action === 'counteroffer') {
          const counter = parseFloat(counterAmount);
          if (!counter || counter <= 0) {
            return sendError(res, 400, 'Valid counteroffer amount required.');
          }
          offer.status = 'counteroffered';
          offer.counterAmount = counter;
          offer.history.push({
            timestamp: now,
            action: 'counteroffered',
            actor: actor || 'Store Manager',
            note: note || `Counteroffer of GH₵ ${counter.toFixed(2)} sent to customer.`
          });
        } else if (action === 'customer_accept_counter') {
          offer.status = 'accepted';
          offer.offerAmount = offer.counterAmount; // Customer agreed to counter amount
          offer.history.push({
            timestamp: now,
            action: 'accepted',
            actor: 'Customer',
            note: `Customer agreed to counteroffer price of GH₵ ${offer.counterAmount.toFixed(2)}!`
          });
        } else if (action === 'customer_decline_counter') {
          offer.status = 'withdrawn';
          offer.history.push({
            timestamp: now,
            action: 'withdrawn',
            actor: 'Customer',
            note: 'Customer declined counteroffer.'
          });
        } else if (action === 'add_note') {
          offer.internalNotes = (offer.internalNotes ? offer.internalNotes + '\n' : '') + `[${now}] ${note}`;
          offer.history.push({
            timestamp: now,
            action: 'note_added',
            actor: actor || 'Store Staff',
            note: note || 'Internal note updated.'
          });
        } else {
          return sendError(res, 400, `Unknown action: ${action}`);
        }

        saveStore();
        return sendJSON(res, 200, { success: true, offer });
      }

      // 5. Orders & Inventory Management
      if (pathname === '/api/orders') {
        if (method === 'GET') {
          const { email, orderNumber } = parsedUrl.query;
          let orders = [...store.orders];
          if (email) {
            orders = orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
          }
          if (orderNumber) {
            orders = orders.filter(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase());
          }
          orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return sendJSON(res, 200, orders);
        }

        if (method === 'POST') {
          const body = await parseBody(req);
          const {
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            items,
            deliveryMethod,
            deliveryFee,
            paymentMethod,
            reserveOfferRef,
            notes
          } = body;

          if (!customerName || !customerEmail || !customerPhone || !items || !items.length) {
            return sendError(res, 400, 'Missing required order fields (customer info or items).');
          }

          // Validate stock and deduct inventory safely
          for (const item of items) {
            const product = store.products.find(p => p.id === item.productId || p.sku === item.productId);
            if (product && product.sizes) {
              const sizeObj = product.sizes.find(s => s.size === item.size);
              if (sizeObj) {
                if (sizeObj.stock < item.quantity) {
                  return sendError(res, 400, `Insufficient stock for ${product.name} (${item.size}). Available: ${sizeObj.stock}`);
                }
                sizeObj.stock -= item.quantity;
              }
            }
          }

          const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
          const fee = typeof deliveryFee === 'number' ? deliveryFee : 35.0;
          const total = subtotal + fee;
          const orderNumber = generateRef('WPK-ORD');

          const newOrder = {
            orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress: shippingAddress || {
              street: '24 Blohum Road Area',
              city: 'Accra',
              region: 'Greater Accra',
              country: 'Ghana'
            },
            items,
            subtotal,
            deliveryFee: fee,
            total,
            deliveryMethod: deliveryMethod || 'Accra Metro Delivery',
            paymentMethod: paymentMethod || 'MTN Mobile Money',
            paymentStatus: 'paid', // Instant confirmation in test/demo mode
            fulfilmentStatus: 'processing',
            reserveOfferRef: reserveOfferRef || null,
            notes: notes || '',
            createdAt: new Date().toISOString()
          };

          // If linked to an accepted reserve offer, mark offer as completed
          if (reserveOfferRef) {
            const offer = store.reserveOffers.find(o => o.reference.toUpperCase() === reserveOfferRef.toUpperCase());
            if (offer) {
              offer.status = 'completed';
              offer.history.push({
                timestamp: new Date().toISOString(),
                action: 'completed',
                actor: 'System',
                note: `Order ${orderNumber} placed and paid! Offer fulfilled.`
              });
            }
          }

          store.orders.unshift(newOrder);
          saveStore();
          return sendJSON(res, 201, { success: true, order: newOrder });
        }
      }

      // Single order lookup & status update
      const singleOrderMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9_-]+)$/);
      if (singleOrderMatch) {
        const orderNum = singleOrderMatch[1].toUpperCase();
        const order = store.orders.find(o => o.orderNumber.toUpperCase() === orderNum);
        if (!order) {
          return sendError(res, 404, `Order ${orderNum} not found.`);
        }

        if (method === 'GET') {
          return sendJSON(res, 200, order);
        }

        if (method === 'PUT') {
          const body = await parseBody(req);
          if (body.fulfilmentStatus) order.fulfilmentStatus = body.fulfilmentStatus;
          if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
          saveStore();
          return sendJSON(res, 200, order);
        }
      }

      // 6. Admin KPI Metrics
      if (pathname === '/api/admin/metrics' && method === 'GET') {
        const totalSales = store.orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.total : 0), 0);
        const totalOrders = store.orders.length;
        const pendingOrders = store.orders.filter(o => o.fulfilmentStatus === 'processing').length;
        const pendingOffers = store.reserveOffers.filter(o => o.status === 'under_review').length;
        const acceptedOffers = store.reserveOffers.filter(o => o.status === 'accepted').length;

        // Low stock alerts (variants with stock <= 1)
        const lowStock = [];
        store.products.forEach(p => {
          if (p.sizes) {
            p.sizes.forEach(s => {
              if (s.stock <= 1) {
                lowStock.push({ productId: p.id, name: p.name, size: s.size, stock: s.stock });
              }
            });
          }
        });

        return sendJSON(res, 200, {
          totalSales,
          totalOrders,
          pendingOrders,
          pendingOffers,
          acceptedOffers,
          totalProducts: store.products.length,
          reserveEligibleProducts: store.products.filter(p => p.reserveEligible).length,
          lowStock
        });
      }

      // 7. Auth login (Admin & Customer)
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseBody(req);
        const { username, password } = body;

        if (username === store.adminUser.username) {
          if (password === store.adminUser.password) {
            return sendJSON(res, 200, {
              success: true,
              role: 'admin',
              user: {
                username: store.adminUser.username,
                name: store.adminUser.name,
                role: 'admin'
              },
              token: 'wpk-adm-token-' + Date.now()
            });
          } else {
            return sendError(res, 401, 'Invalid admin password.');
          }
        }

        // Customer login demo
        if (username && password) {
          return sendJSON(res, 200, {
            success: true,
            role: 'customer',
            user: {
              username: username,
              email: username.includes('@') ? username : `${username}@example.com`,
              name: username.split('@')[0],
              role: 'customer'
            },
            token: 'wpk-cst-token-' + Date.now()
          });
        }

        return sendError(res, 401, 'Invalid credentials.');
      }

      // 8. Contact form submission
      if (pathname === '/api/contact' && method === 'POST') {
        const body = await parseBody(req);
        return sendJSON(res, 200, {
          success: true,
          message: 'Thank you! Your message has been received by our Dzorwulu showroom team.',
          data: body
        });
      }

      // 9. Newsletter subscription
      if (pathname === '/api/newsletter' && method === 'POST') {
        const body = await parseBody(req);
        return sendJSON(res, 200, {
          success: true,
          message: 'Welcome to Woodpeckers VIP drop alerts! You will receive drop notifications every Thursday, Friday, and Saturday.',
          email: body ? body.email : ''
        });
      }

      // Default API 404
      return sendError(res, 404, `Endpoint not found: ${pathname}`);

    } catch (err) {
      console.error('[API Error]', err);
      return sendError(res, 500, err.message || 'Internal server error');
    }
  }

  // ---------------- STATIC FILE SERVER ----------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  
  // Custom vanity routes
  if (safePath === '/' || safePath === '') safePath = '/index.html';
  if (safePath === '/admin' || safePath === '/admin/') safePath = '/admin.html';
  if (safePath === '/reserve' || safePath === '/reserve/') safePath = '/reserve.html';
  if (safePath === '/shop' || safePath === '/shop/') safePath = '/products.html';

  let filePath = path.join(__dirname, safePath);

  // If path has no extension, check if an html file exists
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      const notFoundPath = path.join(__dirname, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Handle HTML5 video streaming with Range requests (essential for Safari/Chrome video playback)
    if (ext === '.mp4') {
      const range = req.headers.range;
      const fileSize = stats.size;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        });
        file.pipe(res);
        return;
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error reading file');
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  WOODPECKERS SNEAKERS & STREETWEAR — PRODUCTION SERVER`);
    console.log(`  Live local server: http://localhost:${PORT}`);
    console.log(`  Meet the Reserve:  http://localhost:${PORT}/reserve.html`);
    console.log(`  Admin Dashboard:   http://localhost:${PORT}/admin.html`);
    console.log(`  Storefront:        http://localhost:${PORT}/index.html`);
    console.log(`=======================================================`);
  });
}

module.exports = server;
