/**
 * Woodpeckers Sneakers & Streetwear — Commerce & Meet the Reserve Engine
 * Powers Cart, Checkout, Meet the Reserve, and Real-time State Synchronization
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEYS = {
    CART: 'woodpeckers_cart',
    WISHLIST: 'woodpeckers_wishlist',
    RECENT_OFFERS: 'woodpeckers_my_offers',
    OFFER_TRACKING: 'woodpeckers_last_tracked_ref',
    USER: 'woodpeckers_user'
  };

  // Safe localStorage helper
  const storage = {
    get(key, fallback = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage set failed', e);
      }
    }
  };

  // Currency Formatter
  function formatGHS(amount) {
    const num = parseFloat(amount) || 0;
    return 'GH₵ ' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Toast Notification
  function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('woodpeckers-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'woodpeckers-toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `wpk-toast wpk-toast-${type}`;
    const bg = type === 'success' ? '#111111' : type === 'error' ? '#8a1f1f' : '#1e1e1e';
    const border = type === 'success' ? '#008751' : type === 'error' ? '#d9534f' : '#444';
    
    toast.style.cssText = `
      background:${bg};
      color:#fff;
      border:1px solid ${border};
      border-left:4px solid ${border};
      padding:14px 20px;
      border-radius:4px;
      font-family:'Stack Sans Text', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size:14px;
      font-weight:500;
      box-shadow:0 10px 30px rgba(0,0,0,0.35);
      pointer-events:auto;
      display:flex;
      align-items:center;
      gap:12px;
      opacity:0;
      transform:translateY(15px);
      transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width:380px;
    `;

    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-bell';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:#008751;font-size:16px;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  // Cart API
  const Cart = {
    getItems() {
      return storage.get(STORAGE_KEYS.CART, []);
    },

    addItem(product, size = 'Standard', qty = 1, customPrice = null, reserveOfferRef = null) {
      const items = this.getItems();
      const price = customPrice !== null ? parseFloat(customPrice) : parseFloat(product.price);
      const isReserveDeal = Boolean(reserveOfferRef);

      const existingIndex = items.findIndex(
        it => it.productId === product.id && it.size === size && it.isReserveDeal === isReserveDeal
      );

      if (existingIndex > -1) {
        items[existingIndex].quantity += parseInt(qty, 10);
      } else {
        items.push({
          productId: product.id,
          sku: product.sku || product.id,
          name: product.name,
          image: (product.images && product.images[0]) || 'images/product-image-1.jpg',
          price: price,
          originalPrice: product.originalPrice || price,
          size: size,
          quantity: parseInt(qty, 10),
          isReserveDeal: isReserveDeal,
          reserveOfferRef: reserveOfferRef || null
        });
      }

      storage.set(STORAGE_KEYS.CART, items);
      this.updateBadges();

      const notice = isReserveDeal
        ? `Reserved Pair added to cart at agreed offer price: ${formatGHS(price)}!`
        : `${product.name} (${size}) added to your cart!`;
      showToast(notice, 'success');
      return items;
    },

    updateQuantity(index, qty) {
      const items = this.getItems();
      if (items[index]) {
        const newQty = parseInt(qty, 10);
        if (newQty <= 0) {
          items.splice(index, 1);
        } else {
          items[index].quantity = newQty;
        }
        storage.set(STORAGE_KEYS.CART, items);
        this.updateBadges();
      }
      return items;
    },

    removeItem(index) {
      const items = this.getItems();
      if (items[index]) {
        const removed = items.splice(index, 1);
        storage.set(STORAGE_KEYS.CART, items);
        this.updateBadges();
        showToast(`${removed[0].name} removed from cart.`, 'info');
      }
      return items;
    },

    clear() {
      storage.set(STORAGE_KEYS.CART, []);
      this.updateBadges();
    },

    getSubtotal() {
      const items = this.getItems();
      return items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    },

    getCount() {
      const items = this.getItems();
      return items.reduce((acc, it) => acc + it.quantity, 0);
    },

    updateBadges() {
      const count = this.getCount();
      document.querySelectorAll('.header-cart-badge, .header-cart-count, #cart-item-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
      });
    }
  };

  // Meet the Reserve Engine
  const ReserveEngine = {
    // Submit an offer to backend API (with local fallback if offline)
    async submitOffer(offerData) {
      try {
        const response = await fetch('/api/reserve/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offerData)
        });

        if (response.ok) {
          const result = await response.json();
          this.saveMyOfferReference(result.reference);
          return result;
        } else {
          const errData = await response.json();
          throw new Error(errData.message || 'Server rejected offer');
        }
      } catch (err) {
        console.warn('API submission failed or running standalone, processing locally:', err);
        // Fallback local evaluation
        const ref = 'WPK-RSV-' + Math.floor(1000 + Math.random() * 9000);
        const amount = parseFloat(offerData.offerAmount);
        const retail = parseFloat(offerData.retailPrice || 3000);
        const floor = retail * 0.85;

        let status = 'under_review';
        let counterAmount = null;

        if (amount >= floor * 0.95) {
          status = 'accepted';
        } else if (amount >= floor * 0.85) {
          status = 'counteroffered';
          counterAmount = Math.round(floor);
        }

        const localOffer = {
          reference: ref,
          productId: offerData.productId,
          productName: offerData.productName || 'Woodpeckers Grail',
          productSku: offerData.productSku || 'WPK-RSV',
          productImage: offerData.productImage || 'images/product-image-1.jpg',
          retailPrice: retail,
          size: offerData.size,
          customerName: offerData.customerName,
          customerEmail: offerData.customerEmail,
          customerPhone: offerData.customerPhone,
          offerAmount: amount,
          status: status,
          submittedAt: new Date().toISOString(),
          counterAmount: counterAmount,
          history: [
            {
              timestamp: new Date().toISOString(),
              action: 'submitted',
              actor: 'Customer',
              note: `Offer submitted for ${formatGHS(amount)}`
            }
          ]
        };

        this.saveMyOfferReference(ref);
        return {
          success: true,
          reference: ref,
          status: status,
          offer: localOffer,
          message: status === 'accepted'
            ? 'Congratulations! Your offer met the reserve target! You can proceed directly to checkout.'
            : status === 'counteroffered'
            ? `Your offer is close! Woodpeckers counteroffered ${formatGHS(counterAmount)}.`
            : 'Your offer has been submitted and is under review by our store team.'
        };
      }
    },

    // Check status of an offer
    async getOffer(reference) {
      try {
        const res = await fetch(`/api/reserve/offers/${encodeURIComponent(reference.trim())}`);
        if (res.ok) {
          return await res.json();
        }
        throw new Error('Offer not found');
      } catch (err) {
        console.warn('Could not fetch offer from server, checking local memory:', err);
        return null;
      }
    },

    // Perform action (accept counteroffer, decline, etc.)
    async actOnOffer(reference, action, extra = {}) {
      try {
        const res = await fetch(`/api/reserve/offers/${encodeURIComponent(reference)}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...extra })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.error('Action failed:', e);
      }
      return null;
    },

    saveMyOfferReference(ref) {
      const list = storage.get(STORAGE_KEYS.RECENT_OFFERS, []);
      if (!list.includes(ref)) {
        list.unshift(ref);
        storage.set(STORAGE_KEYS.RECENT_OFFERS, list.slice(0, 10));
      }
      storage.set(STORAGE_KEYS.OFFER_TRACKING, ref);
    },

    getMyOffers() {
      return storage.get(STORAGE_KEYS.RECENT_OFFERS, []);
    }
  };

  // Interactive Offer Modal UI generator
  function openOfferModal(product, preselectedSize = null) {
    let modal = document.getElementById('woodpeckers-offer-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'woodpeckers-offer-modal';
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modal);
    }

    const sizes = product.sizes || [
      { size: 'UK 7', stock: 2 },
      { size: 'UK 8', stock: 2 },
      { size: 'UK 9', stock: 1 }
    ];

    const sizeOptions = sizes
      .map(s => {
        const isSelected = preselectedSize === s.size || (s.stock > 0 && !preselectedSize);
        const disabled = s.stock === 0 ? 'disabled' : '';
        const label = s.stock === 0 ? `${s.size} (Sold Out)` : `${s.size} (${s.stock} in stock)`;
        return `<option value="${s.size}" ${isSelected ? 'selected' : ''} ${disabled}>${label}</option>`;
      })
      .join('');

    const minRecommended = Math.round(product.price * 0.70);

    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content" style="background:#141414;color:#f5f5f5;border:1px solid #333;border-radius:8px;overflow:hidden;">
          <div class="modal-header" style="border-bottom:1px solid #282828;padding:20px 24px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="background:#008751;color:#fff;padding:4px 10px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;border-radius:2px;">
                Meet The Reserve
              </span>
              <h4 class="modal-title" style="margin:0;font-size:18px;font-weight:700;color:#fff;">Name Your Price</h4>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" style="filter:invert(1);"></button>
          </div>
          
          <div class="modal-body" style="padding:24px;">
            <div class="row g-4">
              <!-- Left: Product Snapshot -->
              <div class="col-md-5">
                <div style="background:#1b1b1b;border:1px solid #2a2a2a;padding:16px;border-radius:6px;text-align:center;">
                  <img src="${(product.images && product.images[0]) || 'images/product-image-1.jpg'}" alt="${product.name}" style="width:100%;max-height:190px;object-fit:contain;margin-bottom:14px;border-radius:4px;">
                  <h5 style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;">${product.name}</h5>
                  <div style="font-size:12px;color:#888;margin-bottom:8px;">SKU: ${product.sku || product.id}</div>
                  <div style="font-size:13px;color:#aaa;">Retail Value: <span style="color:#008751;font-weight:700;">${formatGHS(product.price)}</span></div>
                  ${product.reserveGuidance ? `<div style="margin-top:10px;padding:8px;background:#222;border-radius:4px;font-size:11px;color:#ccc;border-left:2px solid #008751;">${product.reserveGuidance}</div>` : ''}
                </div>
              </div>

              <!-- Right: Form -->
              <div class="col-md-7">
                <form id="wpk-reserve-form">
                  <div class="mb-3">
                    <label class="form-label" style="font-size:13px;font-weight:600;color:#bbb;">Select Size / Variant <span style="color:#008751;">*</span></label>
                    <select class="form-select" id="rsv-size" required style="background:#222;border:1px solid #333;color:#fff;font-size:14px;padding:10px;">
                      ${sizeOptions}
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label" style="font-size:13px;font-weight:600;color:#bbb;">Your Offer (Ghana Cedis GH₵) <span style="color:#008751;">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text" style="background:#282828;border:1px solid #333;color:#008751;font-weight:700;">GH₵</span>
                      <input type="number" class="form-control" id="rsv-amount" min="100" step="50" required placeholder="e.g. ${minRecommended}" style="background:#222;border:1px solid #333;color:#fff;font-size:16px;font-weight:700;padding:10px;">
                    </div>
                    <div id="rsv-feedback" style="font-size:11px;margin-top:5px;color:#888;">Enter a serious offer reflecting the authentic value of this grail.</div>
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-sm-6">
                      <label class="form-label" style="font-size:12px;color:#bbb;">Full Name <span style="color:#008751;">*</span></label>
                      <input type="text" class="form-control" id="rsv-name" required placeholder="Kwame Mensah" style="background:#222;border:1px solid #333;color:#fff;font-size:13px;padding:8px 12px;">
                    </div>
                    <div class="col-sm-6">
                      <label class="form-label" style="font-size:12px;color:#bbb;">Phone / WhatsApp <span style="color:#008751;">*</span></label>
                      <input type="tel" class="form-control" id="rsv-phone" required placeholder="+233 24 123 4567" style="background:#222;border:1px solid #333;color:#fff;font-size:13px;padding:8px 12px;">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label" style="font-size:12px;color:#bbb;">Email Address <span style="color:#008751;">*</span></label>
                    <input type="email" class="form-control" id="rsv-email" required placeholder="you@example.com" style="background:#222;border:1px solid #333;color:#fff;font-size:13px;padding:8px 12px;">
                  </div>

                  <div class="d-grid mt-4">
                    <button type="submit" id="rsv-submit-btn" class="btn btn-primary" style="background:#008751;border-color:#008751;color:#fff;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:12px;border-radius:4px;">
                      <i class="fa-solid fa-gavel me-2"></i> Submit Reserve Offer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div class="modal-footer" style="border-top:1px solid #282828;padding:12px 24px;justify-content:space-between;background:#0d0d0d;font-size:11px;color:#777;">
            <span><i class="fa-solid fa-shield-halved me-1"></i> Authentic Woodpeckers Guarantee</span>
            <span>Offers valid for 48 hours upon acceptance</span>
          </div>
        </div>
      </div>
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Live feedback on amount
    const amountInput = modal.querySelector('#rsv-amount');
    const feedback = modal.querySelector('#rsv-feedback');
    amountInput.addEventListener('input', () => {
      const val = parseFloat(amountInput.value);
      if (!val || val <= 0) {
        feedback.innerHTML = 'Enter a serious offer reflecting the value of this piece.';
        feedback.style.color = '#888';
      } else if (val < product.price * 0.5) {
        feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation me-1"></i> Offer is under 50% retail (${formatGHS(product.price * 0.5)}). Unlikely to meet reserve.`;
        feedback.style.color = '#d9534f';
      } else if (val >= (product.reserveFloor || product.price * 0.85)) {
        feedback.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Strong competitive offer! High probability of instant reserve match.`;
        feedback.style.color = '#5cb85c';
      } else {
        feedback.innerHTML = `<i class="fa-solid fa-circle-info me-1"></i> Moderate offer. Subject to store manager manual evaluation.`;
        feedback.style.color = '#008751';
      }
    });

    // Form submission
    const form = modal.querySelector('#wpk-reserve-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modal.querySelector('#rsv-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Submitting Offer...';

      const offerPayload = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku || product.id,
        productImage: (product.images && product.images[0]) || 'images/product-image-1.jpg',
        retailPrice: product.price,
        size: modal.querySelector('#rsv-size').value,
        offerAmount: parseFloat(amountInput.value),
        customerName: modal.querySelector('#rsv-name').value.trim(),
        customerPhone: modal.querySelector('#rsv-phone').value.trim(),
        customerEmail: modal.querySelector('#rsv-email').value.trim()
      };

      try {
        const result = await ReserveEngine.submitOffer(offerPayload);
        bsModal.hide();
        openOfferResultModal(result);
      } catch (err) {
        showToast(err.message || 'Failed to submit offer.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-gavel me-2"></i> Submit Reserve Offer';
      }
    });
  }

  // Offer Result / Status Modal
  function openOfferResultModal(result) {
    let modal = document.getElementById('woodpeckers-result-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'woodpeckers-result-modal';
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      document.body.appendChild(modal);
    }

    const { reference, status, offer, message } = result;
    const isAccepted = status === 'accepted';
    const isCounter = status === 'counteroffered';

    let headerBadge = '<span class="badge bg-warning text-dark">Under Review</span>';
    let iconClass = 'fa-hourglass-half text-warning';
    let ctaHtml = `
      <div style="background:#1e1e1e;padding:16px;border-radius:6px;border:1px solid #333;margin-top:16px;">
        <p style="margin:0;font-size:13px;color:#bbb;">
          Your offer has been logged into the Woodpeckers Reserve queue. Keep your reference code safe. We will update you via WhatsApp or Email.
        </p>
      </div>
      <div class="mt-3 text-center">
        <a href="reserve.html?track=${reference}" class="btn btn-outline-light btn-sm" style="border-color:#555;">
          <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Open Offer Tracker
        </a>
      </div>
    `;

    if (isAccepted) {
      headerBadge = '<span class="badge bg-success">Reserve Met! (Accepted)</span>';
      iconClass = 'fa-circle-check text-success';
      ctaHtml = `
        <div style="background:rgba(40,167,69,0.12);border:1px solid #28a745;padding:18px;border-radius:6px;margin-top:16px;text-align:center;">
          <h5 style="color:#28a745;margin-bottom:6px;font-size:16px;font-weight:700;">Your Offer Was Accepted!</h5>
          <p style="font-size:13px;color:#ddd;margin-bottom:14px;">
            The reserve target was satisfied. Your agreed price is <strong>${formatGHS(offer.offerAmount)}</strong>.
          </p>
          <button id="wpk-proceed-checkout-btn" class="btn btn-primary" style="background:#008751;border-color:#008751;color:#fff;font-weight:800;padding:12px 24px;border-radius:4px;text-transform:uppercase;">
            <i class="fa-solid fa-lock-open me-2"></i> Proceed to Checkout at ${formatGHS(offer.offerAmount)}
          </button>
        </div>
      `;
    } else if (isCounter) {
      headerBadge = '<span class="badge bg-info text-dark">Counteroffer Proposed</span>';
      iconClass = 'fa-scale-balanced text-info';
      ctaHtml = `
        <div style="background:rgba(23,162,184,0.12);border:1px solid #17a2b8;padding:18px;border-radius:6px;margin-top:16px;text-align:center;">
          <h5 style="color:#17a2b8;margin-bottom:6px;font-size:16px;font-weight:700;">Woodpeckers Sent a Counteroffer!</h5>
          <p style="font-size:13px;color:#ddd;margin-bottom:14px;">
            Our store team proposed <strong>${formatGHS(offer.counterAmount)}</strong> to lock in this pair.
          </p>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button id="wpk-accept-counter-btn" class="btn btn-success btn-sm px-3 py-2 font-weight-bold">
              <i class="fa-solid fa-check me-1"></i> Accept Counteroffer
            </button>
            <button id="wpk-decline-counter-btn" class="btn btn-outline-danger btn-sm px-3 py-2">
              <i class="fa-solid fa-xmark me-1"></i> Decline
            </button>
          </div>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background:#141414;color:#f5f5f5;border:1px solid #333;border-radius:8px;">
          <div class="modal-header" style="border-bottom:1px solid #282828;padding:18px 24px;">
            <h5 class="modal-title" style="font-size:17px;font-weight:700;color:#fff;">
              Offer Reference: <span style="color:#008751;font-family:monospace;letter-spacing:1px;">${reference}</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" style="filter:invert(1);"></button>
          </div>
          <div class="modal-body" style="padding:24px;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
              <i class="fa-solid ${iconClass}" style="font-size:32px;"></i>
              <div>
                <div style="margin-bottom:4px;">${headerBadge}</div>
                <div style="font-size:14px;color:#eee;font-weight:500;">${message}</div>
              </div>
            </div>

            <div style="background:#1c1c1c;border:1px solid #2a2a2a;padding:14px;border-radius:6px;font-size:13px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#888;">Product:</span>
                <span style="color:#fff;font-weight:600;">${offer.productName}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#888;">Size:</span>
                <span style="color:#fff;font-weight:600;">${offer.size}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#888;">Your Offer:</span>
                <span style="color:#008751;font-weight:700;">${formatGHS(offer.offerAmount)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#888;">Retail Reference:</span>
                <span style="color:#777;text-decoration:line-through;">${formatGHS(offer.retailPrice)}</span>
              </div>
            </div>

            ${ctaHtml}
          </div>
        </div>
      </div>
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Attach button handlers
    const checkoutBtn = modal.querySelector('#wpk-proceed-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        Cart.addItem(
          {
            id: offer.productId,
            name: offer.productName,
            sku: offer.productSku,
            images: [offer.productImage],
            price: offer.offerAmount,
            originalPrice: offer.retailPrice
          },
          offer.size,
          1,
          offer.offerAmount,
          offer.reference
        );
        bsModal.hide();
        window.location.href = 'checkout.html?reserveRef=' + encodeURIComponent(offer.reference);
      });
    }

    const acceptCounterBtn = modal.querySelector('#wpk-accept-counter-btn');
    if (acceptCounterBtn) {
      acceptCounterBtn.addEventListener('click', async () => {
        acceptCounterBtn.disabled = true;
        acceptCounterBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Processing...';
        await ReserveEngine.actOnOffer(offer.reference, 'customer_accept_counter');
        bsModal.hide();
        showToast('Counteroffer accepted! Loading checkout...', 'success');
        Cart.addItem(
          {
            id: offer.productId,
            name: offer.productName,
            sku: offer.productSku,
            images: [offer.productImage],
            price: offer.counterAmount,
            originalPrice: offer.retailPrice
          },
          offer.size,
          1,
          offer.counterAmount,
          offer.reference
        );
        setTimeout(() => {
          window.location.href = 'checkout.html?reserveRef=' + encodeURIComponent(offer.reference);
        }, 1000);
      });
    }

    const declineCounterBtn = modal.querySelector('#wpk-decline-counter-btn');
    if (declineCounterBtn) {
      declineCounterBtn.addEventListener('click', async () => {
        await ReserveEngine.actOnOffer(offer.reference, 'customer_decline_counter');
        bsModal.hide();
        showToast('Counteroffer declined.', 'info');
      });
    }
  }

  // Setup DOM listeners once ready
  document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadges();

    // Global listener for buttons with data-reserve-product
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-open-reserve-modal]');
      if (target) {
        e.preventDefault();
        const productId = target.getAttribute('data-product-id');
        const size = target.getAttribute('data-product-size') || null;

        // Fetch product info from cache/window or API
        if (window.WPK_PRODUCTS_MAP && window.WPK_PRODUCTS_MAP[productId]) {
          openOfferModal(window.WPK_PRODUCTS_MAP[productId], size);
        } else {
          fetch(`/api/products/${productId}`)
            .then(res => res.json())
            .then(p => openOfferModal(p, size))
            .catch(() => {
              // Minimal fallback
              openOfferModal({
                id: productId,
                name: target.getAttribute('data-product-name') || 'Woodpeckers Grail',
                price: parseFloat(target.getAttribute('data-product-price') || '3500'),
                images: [target.getAttribute('data-product-image') || 'images/product-image-1.jpg'],
                reserveEligible: true
              }, size);
            });
        }
      }

      // Quick Add-to-Cart triggers
      const addCartBtn = e.target.closest('[data-add-to-cart]');
      if (addCartBtn) {
        e.preventDefault();
        const productId = addCartBtn.getAttribute('data-product-id');
        const size = addCartBtn.getAttribute('data-product-size') || 'UK 8';
        const qty = parseInt(addCartBtn.getAttribute('data-product-qty') || '1', 10);

        if (window.WPK_PRODUCTS_MAP && window.WPK_PRODUCTS_MAP[productId]) {
          Cart.addItem(window.WPK_PRODUCTS_MAP[productId], size, qty);
        } else {
          fetch(`/api/products/${productId}`)
            .then(res => res.json())
            .then(p => Cart.addItem(p, size, qty))
            .catch(() => {
              Cart.addItem({
                id: productId,
                name: addCartBtn.getAttribute('data-product-name') || 'Woodpeckers Footwear',
                price: parseFloat(addCartBtn.getAttribute('data-product-price') || '1650'),
                images: [addCartBtn.getAttribute('data-product-image') || 'images/product-image-1.jpg']
              }, size, qty);
            });
        }
      }
    });
  });

  // Export to global scope
  window.Woodpeckers = {
    Cart,
    ReserveEngine,
    formatGHS,
    showToast,
    openOfferModal,
    openOfferResultModal
  };

})(window, document);
