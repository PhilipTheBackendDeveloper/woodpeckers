/**
 * Woodpeckers Sneakers & Streetwear — Storefront Application
 * Handles Product Details, Dynamic Cart, Checkout, Order Received, and Catalogue
 */

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname.replace(/\/$/, '');
  let rawPage = path.split('/').pop() || 'index.html';
  if (!rawPage.includes('.')) {
    rawPage = rawPage + '.html';
  }
  const page = rawPage.toLowerCase();

  // Robust page matcher that works across clean URLs and DOM structures
  function isPage(name, selector) {
    if (page === name) return true;
    if (selector && document.querySelector(selector)) return true;
    return false;
  }

  // If someone lands on root or index.html with ?search=..., forward directly to products.html?search=...
  const rootSearchParams = new URLSearchParams(window.location.search);
  const rootSearchQ = (rootSearchParams.get('search') || '').trim();
  if (rootSearchQ && (page === 'index.html' || !page)) {
    window.location.replace(`products.html?search=${encodeURIComponent(rootSearchQ)}`);
    return;
  }

  // -------------------------------------------------------------
  // 1. PRODUCT SINGLE PAGE (product-single.html)
  // -------------------------------------------------------------
  if (isPage('product-single.html', '.product-single-title')) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || 'SNK-001';

    let product = null;
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        product = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch product from API, using fallback data');
    }

    if (product) {
      // Update Title & Meta
      document.title = `${product.name} | Woodpeckers Ghana`;
      const titleEl = document.querySelector('.product-single-title h1');
      if (titleEl) titleEl.textContent = product.name;

      // Update Breadcrumb
      const breadcrumbEl = document.querySelector('.breadcrumb .active');
      if (breadcrumbEl) breadcrumbEl.textContent = product.name;

      // Update Price
      const priceEl = document.querySelector('.product-single-price h2');
      if (priceEl) {
        priceEl.innerHTML = `${Woodpeckers.formatGHS(product.price)} ${product.originalPrice ? `<span>${Woodpeckers.formatGHS(product.originalPrice)}</span>` : ''}`;
      }

      // Update Description
      const descEl = document.querySelector('.product-single-description p');
      if (descEl && product.description) descEl.textContent = product.description;

      // Update Details (SKU & Category)
      const detailsList = document.querySelector('.product-single-details-list ul');
      if (detailsList) {
        detailsList.innerHTML = `
          <li><span>SKU:</span> ${product.sku || product.id}</li>
          <li><span>Brand:</span> ${product.brand || 'Woodpeckers'}</li>
          <li><span>Category:</span> ${product.category}</li>
          <li><span>Condition:</span> Brand New &bull; Verified Authentic Deadstock</li>
          <li><span>Location:</span> Woodpeckers Showroom, 24 Blohum Rd, Dzorwulu, Accra</li>
        `;
      }

      // Update Images
      if (product.images && product.images.length) {
        const mainThumbs = document.querySelectorAll('.product-single-slider .swiper-slide img, .product-single-image-slider .swiper-slide img');
        mainThumbs.forEach((img, i) => {
          img.src = product.images[i % product.images.length];
        });
      }

      // Update Sizes
      const sizeContainer = document.querySelector('.product-single-item-size ul');
      if (sizeContainer && product.sizes && product.sizes.length) {
        sizeContainer.innerHTML = product.sizes.map((s, idx) => {
          const isAvailable = s.stock > 0;
          const checked = isAvailable && idx === 0 ? 'checked' : '';
          const disabled = isAvailable ? '' : 'disabled';
          const sizeId = `size_${s.size.replace(/[^a-zA-Z0-9]/g, '_')}`;
          return `
            <li>
              <input type="radio" id="${sizeId}" name="Size" value="${s.size}" ${checked} ${disabled}>
              <label for="${sizeId}" style="${!isAvailable ? 'text-decoration:line-through;opacity:0.4;cursor:not-allowed;' : ''}">
                ${s.size} ${!isAvailable ? '(Sold)' : ''}
              </label>
            </li>
          `;
        }).join('');
      }

      // If Reserve Eligible, insert prominent "Meet the Reserve" card
      if (product.reserveEligible) {
        const bodyContent = document.querySelector('.product-single-content-body');
        if (bodyContent) {
          const reserveCard = document.createElement('div');
          reserveCard.className = 'reserve-single-box mb-4';
          reserveCard.style.cssText = 'background:#141414;color:#fff;border:1px solid #008751;border-radius:6px;padding:18px;margin-bottom:24px;';
          reserveCard.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="background:#008751;color:#fff;font-size:11px;font-weight:800;padding:3px 8px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;">
                Meet The Reserve Eligible
              </span>
              <span style="font-size:12px;color:#aaa;">Reserve Floor: ~${Woodpeckers.formatGHS(product.reserveFloor || product.price * 0.85)}</span>
            </div>
            <p style="font-size:13px;color:#ccc;margin-bottom:12px;line-height:1.5;">
              Looking to name your price? Make a competitive offer on this grail. Our store team reviews bids promptly.
            </p>
            <button id="btn-trigger-reserve" class="btn btn-warning w-100" style="background:#008751;border-color:#008751;color:#fff;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:12px;border-radius:4px;">
              <i class="fa-solid fa-gavel me-2"></i> Name Your Price / Make An Offer
            </button>
          `;
          bodyContent.parentNode.insertBefore(reserveCard, bodyContent);

          document.getElementById('btn-trigger-reserve').addEventListener('click', (e) => {
            e.preventDefault();
            const selectedSizeInput = document.querySelector('input[name="Size"]:checked');
            const selectedSize = selectedSizeInput ? selectedSizeInput.value : (product.sizes[0] && product.sizes[0].size);
            Woodpeckers.openOfferModal(product, selectedSize);
          });
        }
      }

      // Quantity controls
      const qtyInput = document.querySelector('.qty-input');
      const minusBtn = document.querySelector('.qty-btn.minus');
      const plusBtn = document.querySelector('.qty-btn.plus');
      if (qtyInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let val = parseInt(qtyInput.value, 10) || 1;
          if (val > 1) qtyInput.value = String(val - 1).padStart(2, '0');
        });
        plusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let val = parseInt(qtyInput.value, 10) || 1;
          qtyInput.value = String(val + 1).padStart(2, '0');
        });
      }

      // Add to Cart handler
      const addToCartBtn = document.querySelector('.product-single-content-btn a');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const selectedSizeInput = document.querySelector('input[name="Size"]:checked');
          const selectedSize = selectedSizeInput ? selectedSizeInput.value : (product.sizes && product.sizes[0] ? product.sizes[0].size : 'Standard');
          const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

          Woodpeckers.Cart.addItem(product, selectedSize, qty);
        });
      }
    }
  }

  // Helper to render uniform luxury product card
  function renderStorefrontCard(p) {
    return `
      <div class="product-item wow fadeInUp" data-category="${p.category}" style="display:flex;flex-direction:column;">
        <div class="product-item-header">
          <div class="product-item-image">
            <a href="product-single.html?id=${p.id}">
              <figure>
                <img src="${p.images[0]}" alt="${p.name}" style="height:210px;object-fit:contain;padding:12px;">
              </figure>
            </a>
          </div>
          ${p.reserveEligible ? `
            <div style="position:absolute;top:10px;left:10px;background:#008751;color:#fff;font-size:10px;font-weight:800;padding:3px 7px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;z-index:2;">
              Reserve
            </div>
          ` : ''}
          <div class="product-item-action">
            <ul>
              <li><a href="#" class="btn-wishlist-toggle" data-product-id="${p.id}" title="Save Grail"><img src="images/icon-wishlist-primary.svg" alt=""></a></li>
              <li><a href="product-single.html?id=${p.id}" title="View Details"><img src="images/icon-preview-primary.svg" alt=""></a></li>
              <li><a href="#" class="btn-quick-cart" title="Add to Bag" data-product-id="${p.id}"><img src="images/icon-cart-primary.svg" alt=""></a></li>
            </ul>
          </div>
        </div>
        <div class="product-item-content" style="display:flex;flex-direction:column;flex-grow:1;">
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${p.brand} &bull; ${p.category}</div>
          <h2 style="font-size:15px;font-weight:700;margin-bottom:8px;min-height:38px;">
            <a href="product-single.html?id=${p.id}">${p.name}</a>
          </h2>
          <h3 style="font-size:16px;font-weight:800;color:#111;margin-bottom:12px;">
            ${Woodpeckers.formatGHS(p.price)} ${p.originalPrice ? `<span>${Woodpeckers.formatGHS(p.originalPrice)}</span>` : ''}
          </h3>
          <div style="margin-top:auto;display:flex;gap:6px;">
            <button class="btn btn-outline-dark btn-sm w-100 btn-quick-cart" data-product-id="${p.id}" style="font-size:12px;font-weight:700;">
              <i class="fa-solid fa-cart-shopping me-1"></i> Add To Bag
            </button>
            ${p.reserveEligible ? `
              <button class="btn btn-sm w-100" data-open-reserve-modal data-product-id="${p.id}" style="background:#008751;border-color:#008751;color:#fff;font-weight:800;font-size:12px;">
                <i class="fa-solid fa-gavel me-1"></i> Offer
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function updateHeaderBadges() {
    if (!window.Woodpeckers) return;

    // Cart Badges
    const cartCount = window.Woodpeckers.Cart ? window.Woodpeckers.Cart.getCount() : 0;
    document.querySelectorAll('.header-cart-badge').forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'inline-block' : 'none';
    });

    // Wishlist Badges
    const wishlistItems = window.Woodpeckers.Wishlist ? window.Woodpeckers.Wishlist.getItems() : [];
    const wishCount = wishlistItems.length;
    document.querySelectorAll('.header-wishlist-badge').forEach(badge => {
      badge.textContent = wishCount;
      badge.style.display = wishCount > 0 ? 'inline-block' : 'none';
    });

    // Dashboard Counters
    const dashOrdersEl = document.getElementById('dash-orders-count');
    const dashWishEl = document.getElementById('dash-wishlist-count');
    const dashReserveEl = document.getElementById('dash-reserve-count');
    if (dashOrdersEl && window.Woodpeckers.Orders) {
      dashOrdersEl.textContent = window.Woodpeckers.Orders.getAll().length;
    }
    if (dashWishEl) {
      dashWishEl.textContent = wishCount;
    }
    if (dashReserveEl && window.Woodpeckers.Reserve) {
      dashReserveEl.textContent = window.Woodpeckers.Reserve.getMyOffers().length;
    }

    // Toggle button active styling
    document.querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
      const pId = btn.getAttribute('data-product-id');
      const isSaved = wishlistItems.some(it => it.id === pId);
      if (isSaved) {
        btn.classList.add('active');
        btn.style.filter = 'drop-shadow(0 0 6px #008751) brightness(1.2)';
      } else {
        btn.classList.remove('active');
        btn.style.filter = 'none';
      }
    });
  }

  function attachWishlistListeners(container) {
    (container || document).querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
      if (btn.dataset.wishlistBound === 'true') return;
      btn.dataset.wishlistBound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pId = btn.getAttribute('data-product-id');
        let product = (window.WPK_PRODUCTS_MAP && window.WPK_PRODUCTS_MAP[pId]);
        if (!product && window.Woodpeckers && window.Woodpeckers.DEFAULT_PRODUCTS) {
          product = window.Woodpeckers.DEFAULT_PRODUCTS.find(p => p.id === pId);
        }
        if (product && window.Woodpeckers && window.Woodpeckers.Wishlist) {
          window.Woodpeckers.Wishlist.toggle(product);
          updateHeaderBadges();
          if (document.querySelector('.wishlist-content-box') && typeof renderWishlistTable === 'function') {
            renderWishlistTable();
          }
        }
      });
    });
  }

  function attachQuickCartListeners(container) {
    (container || document).querySelectorAll('.btn-quick-cart').forEach(btn => {
      if (btn.dataset.quickCartBound === 'true') return;
      btn.dataset.quickCartBound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pId = btn.getAttribute('data-product-id');
        let product = (window.WPK_PRODUCTS_MAP && window.WPK_PRODUCTS_MAP[pId]);
        if (!product && window.Woodpeckers && window.Woodpeckers.DEFAULT_PRODUCTS) {
          product = window.Woodpeckers.DEFAULT_PRODUCTS.find(p => p.id === pId);
        }
        if (product && window.Woodpeckers && window.Woodpeckers.Cart) {
          const defaultSize = product.sizes && product.sizes[0] ? product.sizes[0].size : 'UK 8';
          window.Woodpeckers.Cart.addItem(product, defaultSize, 1);
          updateHeaderBadges();
        } else {
          console.warn('Product not found for quick cart:', pId);
        }
      });
    });

    (container || document).querySelectorAll('[data-open-reserve-modal]').forEach(btn => {
      if (btn.dataset.reserveModalBound === 'true') return;
      btn.dataset.reserveModalBound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pId = btn.getAttribute('data-product-id');
        let product = (window.WPK_PRODUCTS_MAP && window.WPK_PRODUCTS_MAP[pId]);
        if (!product && window.Woodpeckers && window.Woodpeckers.DEFAULT_PRODUCTS) {
          product = window.Woodpeckers.DEFAULT_PRODUCTS.find(p => p.id === pId);
        }
        if (product && window.Woodpeckers && window.Woodpeckers.openOfferModal) {
          const defaultSize = product.sizes && product.sizes[0] ? product.sizes[0].size : 'UK 8';
          window.Woodpeckers.openOfferModal(product, defaultSize);
        } else {
          window.location.href = `reserve.html?product=${pId}`;
        }
      });
    });

    attachWishlistListeners(container);
  }

  // Ensure header wishlist and cart badges exist
  document.querySelectorAll('header a[href*="wishlist"]').forEach(a => {
    a.style.position = 'relative';
    if (!a.querySelector('.header-wishlist-badge')) {
      const badge = document.createElement('span');
      badge.className = 'header-wishlist-badge';
      badge.style.cssText = 'display:none;position:absolute;top:-6px;right:-8px;background:#008751;color:#fff;font-size:10px;font-weight:800;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;';
      badge.textContent = '0';
      a.appendChild(badge);
    }
  });

  document.querySelectorAll('header a[href*="cart"]').forEach(a => {
    a.style.position = 'relative';
    if (!a.querySelector('.header-cart-badge')) {
      const badge = document.createElement('span');
      badge.className = 'header-cart-badge';
      badge.style.cssText = 'display:none;position:absolute;top:-6px;right:-8px;background:#008751;color:#111;font-size:10px;font-weight:800;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;';
      badge.textContent = '0';
      a.appendChild(badge);
    }
  });

  updateHeaderBadges();
  attachWishlistListeners(document);

  // -------------------------------------------------------------
  // 2. SHOP / CATALOGUE PAGE (products.html)
  // -------------------------------------------------------------
  if (isPage('products.html', '.shop-page-wrapper, .filter-sidebar, .product-item-list')) {
    let allProducts = [];
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const fetched = await res.json();
        if (Array.isArray(fetched) && fetched.length > 0) {
          allProducts = fetched;
        }
      }
    } catch (e) {
      console.warn('API error in products.html, falling back to local catalogue');
    }

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      if (window.Woodpeckers && window.Woodpeckers.Products) {
        try {
          allProducts = await window.Woodpeckers.Products.getAll();
        } catch (e) {
          allProducts = window.Woodpeckers.DEFAULT_PRODUCTS || [];
        }
      } else if (window.Woodpeckers && window.Woodpeckers.DEFAULT_PRODUCTS) {
        allProducts = window.Woodpeckers.DEFAULT_PRODUCTS;
      }
    }

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      if (window.Woodpeckers && window.Woodpeckers.DEFAULT_PRODUCTS) {
        allProducts = window.Woodpeckers.DEFAULT_PRODUCTS;
      }
    }

    window.WPK_PRODUCTS_MAP = window.WPK_PRODUCTS_MAP || {};
    if (Array.isArray(allProducts)) {
      allProducts.forEach(p => { window.WPK_PRODUCTS_MAP[p.id] = p; });
    }

    const grid = document.querySelector('.product-item-list');
    const resultCountHeader = document.querySelector('.product-item-list-box .product-category-filter-header .product-category-filter-title h2') ||
                              document.querySelector('.product-category-filter-title h2');

    // Parse URL Query Parameters on load
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const reserveParam = params.get('reserve');
    let currentSearch = (params.get('search') || '').trim();

    // Sync search input if present
    const modalSearchInput = document.getElementById('search');
    if (modalSearchInput && currentSearch) {
      modalSearchInput.value = currentSearch;
    }

    // Expose search API for in-page updates
    window.WPK_SET_SEARCH = function(query) {
      currentSearch = (query || '').trim();
      const url = new URL(window.location.href);
      if (currentSearch) {
        url.searchParams.set('search', currentSearch);
      } else {
        url.searchParams.delete('search');
      }
      window.history.pushState(null, '', url.toString());
      if (modalSearchInput) modalSearchInput.value = currentSearch;
      applyFilters();
      const targetHeader = document.querySelector('.product-category-filter-header') || document.querySelector('.product-item-list-box');
      if (targetHeader) {
        targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const catAll = document.getElementById('cat_all');
    const catExclusive = document.getElementById('cat_exclusive');
    const catRunners = document.getElementById('cat_runners');
    const catStreetwear = document.getElementById('cat_streetwear');
    const catReserve = document.getElementById('cat_reserve');

    if (catParam) {
      const cLower = catParam.toLowerCase();
      if (catAll) catAll.checked = false;
      if (cLower.includes('streetwear') && catStreetwear) {
        catStreetwear.checked = true;
      } else if ((cLower.includes('exclusive') || cLower.includes('grail') || cLower.includes('jordan') || cLower.includes('sneaker')) && catExclusive) {
        catExclusive.checked = true;
      } else if ((cLower.includes('runner') || cLower.includes('lifestyle')) && catRunners) {
        catRunners.checked = true;
      }
    }

    if (reserveParam === 'true' && catReserve) {
      if (catAll) catAll.checked = false;
      catReserve.checked = true;
    }

    function applyFilters() {
      if (!grid) return;

      const isAll = catAll ? catAll.checked : true;
      const isExclusive = catExclusive ? catExclusive.checked : false;
      const isRunners = catRunners ? catRunners.checked : false;
      const isStreetwear = catStreetwear ? catStreetwear.checked : false;
      const isReserveOnly = catReserve ? catReserve.checked : false;

      const checkedSizes = Array.from(document.querySelectorAll('input[name="Size"]:checked')).map(el => el.value);
      const checkedBrands = Array.from(document.querySelectorAll('input[name="Brand"]:checked')).map(el => el.value.toLowerCase());
      const checkedMaterials = Array.from(document.querySelectorAll('input[name="Material"]:checked')).map(el => el.value.toLowerCase());
      const sortSelect = document.getElementById('sorting_list');
      const sortVal = sortSelect ? sortSelect.value : '';

      let filtered = allProducts.slice();

      // Search Query
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(p => {
          const name = (p.name || '').toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const tags = Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()).join(' ') : '';
          const sku = (p.sku || '').toLowerCase();
          return name.includes(q) || brand.includes(q) || cat.includes(q) || desc.includes(q) || tags.includes(q) || sku.includes(q);
        });
      }

      // Categories
      if (!isAll) {
        const allowedCats = [];
        if (isExclusive) allowedCats.push('Exclusive Sneakers');
        if (isRunners) allowedCats.push('Lifestyle Runners');
        if (isStreetwear) allowedCats.push('Streetwear');

        if (allowedCats.length > 0) {
          filtered = filtered.filter(p => allowedCats.some(c => (p.category || '').toLowerCase().includes(c.toLowerCase())));
        }
      }

      // Reserve Eligible filter
      if (isReserveOnly) {
        filtered = filtered.filter(p => p.reserveEligible === true);
      }

      // Sizes filter
      if (checkedSizes.length > 0) {
        filtered = filtered.filter(p => {
          if (!p.sizes || !Array.isArray(p.sizes)) return false;
          return p.sizes.some(s => checkedSizes.includes(s.size));
        });
      }

      // Brands filter
      if (checkedBrands.length > 0) {
        filtered = filtered.filter(p => {
          const pb = (p.brand || '').toLowerCase();
          return checkedBrands.some(b => pb.includes(b));
        });
      }

      // Material filter
      if (checkedMaterials.length > 0) {
        filtered = filtered.filter(p => {
          const pm = (p.material || '').toLowerCase();
          return checkedMaterials.some(m => pm.includes(m));
        });
      }

      // Sorting
      if (sortVal === 'Low_to_High') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortVal === 'High_to_Low') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortVal === 'Popularity' || sortVal === 'Trending') {
        filtered.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
      } else if (sortVal === 'Best_Sellers') {
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      }

      // Render
      if (filtered.length === 0) {
        const queryText = currentSearch ? `matching "${currentSearch.replace(/"/g, '&quot;')}"` : 'matching your selected filters';
        grid.innerHTML = `
          <div class="col-12 text-center py-5" style="width:100%;grid-column:1/-1;">
            <i class="fa-solid fa-magnifying-glass fa-3x text-muted mb-3" style="color:#008751 !important;"></i>
            <h3 style="font-weight:800;color:#111;">No Grails Found</h3>
            <p style="color:#777;max-width:440px;margin:8px auto 20px;">
              No sneakers or streetwear found ${queryText}. Try a different search term or reset filters to explore our full deadstock collection.
            </p>
            <button id="btn-reset-filters" class="btn btn-dark" style="padding:10px 24px;font-weight:700;">
              Reset All Filters
            </button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-reset-filters');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            clearAllFilters();
          });
        }
      } else {
        grid.innerHTML = filtered.map(p => renderStorefrontCard(p)).join('');
        attachQuickCartListeners(grid);
      }

      // Update Result Count
      if (resultCountHeader) {
        if (currentSearch) {
          const safeQ = currentSearch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          resultCountHeader.innerHTML = `Showing results for <span style="color:#008751;font-weight:700;">"${safeQ}"</span> (${filtered.length} items) <button type="button" id="btnClearSearch" class="btn btn-sm btn-outline-secondary ms-2" style="font-size:11px;padding:2px 8px;border-radius:12px;vertical-align:middle;cursor:pointer;">Clear ×</button>`;
          const btnClear = document.getElementById('btnClearSearch');
          if (btnClear) {
            btnClear.addEventListener('click', (e) => {
              e.preventDefault();
              window.WPK_SET_SEARCH('');
            });
          }
        } else {
          resultCountHeader.textContent = `Showing ${filtered.length} of ${allProducts.length} results`;
        }
      }
    }

    function clearAllFilters() {
      currentSearch = '';
      const url = new URL(window.location.href);
      url.searchParams.delete('search');
      window.history.pushState(null, '', url.toString());
      if (modalSearchInput) modalSearchInput.value = '';

      if (catAll) catAll.checked = true;
      if (catExclusive) catExclusive.checked = false;
      if (catRunners) catRunners.checked = false;
      if (catStreetwear) catStreetwear.checked = false;
      if (catReserve) catReserve.checked = false;

      document.querySelectorAll('input[name="Size"]').forEach(el => el.checked = false);
      document.querySelectorAll('input[name="Brand"]').forEach(el => el.checked = false);
      document.querySelectorAll('input[name="Material"]').forEach(el => el.checked = false);

      const sortSelect = document.getElementById('sorting_list');
      if (sortSelect) sortSelect.selectedIndex = 0;

      applyFilters();
    }

    // Bind Category Listeners
    if (catAll) {
      const handleAll = () => {
        if (catAll.checked) {
          if (catExclusive) catExclusive.checked = false;
          if (catRunners) catRunners.checked = false;
          if (catStreetwear) catStreetwear.checked = false;
          if (catReserve) catReserve.checked = false;
        }
        applyFilters();
      };
      catAll.addEventListener('change', handleAll);
      catAll.addEventListener('click', handleAll);
    }

    [catExclusive, catRunners, catStreetwear, catReserve].forEach(cb => {
      if (cb) {
        const handleCat = () => {
          if (cb.checked && catAll) {
            catAll.checked = false;
          } else if (!catExclusive?.checked && !catRunners?.checked && !catStreetwear?.checked && !catReserve?.checked && catAll) {
            catAll.checked = true;
          }
          applyFilters();
        };
        cb.addEventListener('change', handleCat);
        cb.addEventListener('click', handleCat);
      }
    });

    // Bind Size, Brand, Material listeners
    document.querySelectorAll('input[name="Size"], input[name="Brand"], input[name="Material"]').forEach(cb => {
      cb.addEventListener('change', applyFilters);
      cb.addEventListener('click', applyFilters);
    });

    // Bind Sorting listener
    const sortSelect = document.getElementById('sorting_list');
    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
      sortSelect.addEventListener('input', applyFilters);
    }

    // Bind Clear All button
    const clearBtn = document.querySelector('.product-category-filter-clear-btn a');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearAllFilters();
      });
    }

    // Initial render with URL params respected
    applyFilters();
  }

  // -------------------------------------------------------------
  // 2B. HOMEPAGE HYDRATION (index.html, index-2.html, /)
  // -------------------------------------------------------------
  if (isPage('index.html', '.hero.parallaxie') || page === 'index-2.html' || page === '') {
    let allProducts = [];
    try {
      const res = await fetch('/api/products');
      if (res.ok) allProducts = await res.json();
    } catch (e) {
      console.warn('API error in index.html');
    }

    if (allProducts.length > 0) {
      window.WPK_PRODUCTS_MAP = window.WPK_PRODUCTS_MAP || {};
      allProducts.forEach(p => { window.WPK_PRODUCTS_MAP[p.id] = p; });

      // Featured products grid
      const featGrid = document.querySelector('.featured-products .product-item-list');
      if (featGrid) {
        featGrid.innerHTML = allProducts.slice(0, 4).map(p => renderStorefrontCard(p)).join('');
        attachQuickCartListeners(featGrid);
      }

      // Best Rated / Reserve Grails grid
      const bestGrid = document.querySelector('.our-best-products .product-item-list');
      if (bestGrid) {
        const reserveGrails = allProducts.filter(p => p.reserveEligible);
        const listToDisplay = reserveGrails.length >= 4 ? reserveGrails : allProducts.slice(2, 6);
        bestGrid.innerHTML = listToDisplay.slice(0, 4).map(p => renderStorefrontCard(p)).join('');
        attachQuickCartListeners(bestGrid);
      }
    }
  }

  // -------------------------------------------------------------
  // 3. CART PAGE (cart.html)
  // -------------------------------------------------------------
  if (isPage('cart.html', '.cart-page-wrapper, table.cart-table')) {
    let appliedDiscountPct = 0;

    function renderCartTable() {
      const items = Woodpeckers.Cart.getItems();
      const tableBox = document.querySelector('.cart-item-table-box');
      const checkoutBtn = document.querySelector('.order-checkout-button a');

      if (!tableBox) return;

      if (items.length === 0) {
        tableBox.innerHTML = `
          <div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;border:1px solid #eee;">
            <img src="images/empty-cart-image.png" alt="Empty Cart" style="max-height:160px;margin-bottom:20px;opacity:0.8;">
            <h3 style="font-size:22px;font-weight:800;color:#111;margin-bottom:8px;">Your Shopping Bag is Empty</h3>
            <p style="font-size:14px;color:#777;max-width:440px;margin:0 auto 24px;">
              Looking for exclusive kicks or ready to name your price on limited grails?
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="products.html" class="btn btn-dark" style="padding:12px 24px;font-weight:700;">Explore Catalogue</a>
              <a href="reserve.html" class="btn btn-primary" style="background:#008751;border-color:#008751;color:#fff;font-weight:800;padding:12px 24px;">Meet The Reserve</a>
            </div>
          </div>
        `;

        // Update Order Summary to zero and disable checkout
        document.querySelectorAll('.cart-subtotal-val').forEach(el => el.textContent = 'GH₵ 0.00');
        document.querySelectorAll('.cart-total-val').forEach(el => el.textContent = 'GH₵ 0.00');

        if (checkoutBtn) {
          checkoutBtn.style.pointerEvents = 'none';
          checkoutBtn.style.opacity = '0.5';
          checkoutBtn.style.background = '#888';
          checkoutBtn.style.cursor = 'not-allowed';
          checkoutBtn.textContent = 'Your Shopping Bag is Empty';
        }
        return;
      }

      if (checkoutBtn) {
        checkoutBtn.style.pointerEvents = 'auto';
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.background = '#008751';
        checkoutBtn.style.cursor = 'pointer';
        checkoutBtn.textContent = 'Proceed To Checkout';
      }

      let subtotal = 0;
      const rowsHtml = items.map((it, idx) => {
        const itemSubtotal = it.price * it.quantity;
        subtotal += itemSubtotal;
        return `
          <div class="cart-item" style="border-bottom:1px solid #f0f0f0;padding:18px 0;">
            <div class="cart-item-image-content" style="display:flex;align-items:center;gap:16px;">
              <div class="cart-item-image" style="width:75px;height:75px;background:#f9f9f9;padding:6px;border-radius:4px;flex-shrink:0;">
                <img src="${it.image}" alt="${it.name}" style="width:100%;height:100%;object-fit:contain;">
              </div>
              <div class="cart-item-info-content">
                <div class="cart-item-title">
                  <a href="product-single.html?id=${it.productId}" style="color:#111;font-weight:700;font-size:14px;">${it.name}</a>
                </div>
                <div style="font-size:12px;color:#777;margin:3px 0;">Size: <strong>${it.size}</strong> &bull; SKU: ${it.sku}</div>
                ${it.isReserveDeal ? `
                  <div style="background:rgba(0,135,81,0.15);border:1px solid #008751;color:#8f623a;font-size:11px;font-weight:800;padding:2px 8px;border-radius:2px;display:inline-block;margin-top:2px;">
                    Agreed Reserve Deal: Ref ${it.reserveOfferRef}
                  </div>
                ` : ''}
                <div class="cart-item-price" style="font-weight:700;color:#111;margin-top:4px;">
                  ${Woodpeckers.formatGHS(it.price)}
                </div>
              </div>
            </div>

            <div class="cart-item-quantity-total" style="display:flex;align-items:center;gap:20px;">
              <div class="cart-item-quantity">
                <div class="qty-box" style="display:flex;align-items:center;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
                  <button class="qty-btn" style="padding:6px 12px;background:#f5f5f5;border:none;" onclick="updateCartItemQty(${idx}, ${it.quantity - 1})">-</button>
                  <input type="text" class="qty-input" value="${String(it.quantity).padStart(2, '0')}" readonly style="width:40px;text-align:center;border:none;font-weight:700;font-size:13px;">
                  <button class="qty-btn" style="padding:6px 12px;background:#f5f5f5;border:none;" onclick="updateCartItemQty(${idx}, ${it.quantity + 1})">+</button>
                </div>
              </div>
              <div class="cart-item-subtotal" style="font-size:15px;font-weight:800;color:#111;min-width:110px;text-align:right;">
                ${Woodpeckers.formatGHS(itemSubtotal)}
              </div>
              <button class="btn btn-sm btn-link text-danger" title="Remove" onclick="removeCartItem(${idx})">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      tableBox.innerHTML = `
        <div class="cart-item-table wow fadeInUp">
          <div class="cart-item-header" style="border-bottom:2px solid #111;padding-bottom:12px;font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:1px;color:#111;">
            <span>Product Details</span>
            <span>Quantity &amp; Subtotal</span>
          </div>
          ${rowsHtml}
        </div>
      `;

      // Update Subtotals & Totals
      updateTotals(subtotal);
    }

    function updateTotals(subtotal) {
      const selectedRadio = document.querySelector('input[name="delivery_choice"]:checked');
      const deliveryFee = selectedRadio ? parseFloat(selectedRadio.value) : 35.0;
      const discount = subtotal * (appliedDiscountPct / 100);
      const total = Math.max(0, subtotal - discount + deliveryFee);

      document.querySelectorAll('.cart-subtotal-val').forEach(el => el.textContent = Woodpeckers.formatGHS(subtotal));
      document.querySelectorAll('.cart-total-val').forEach(el => el.textContent = Woodpeckers.formatGHS(total));
    }

    // Delivery radio change listener
    document.querySelectorAll('input[name="delivery_choice"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const items = Woodpeckers.Cart.getItems();
        const subtotal = items.reduce((s, it) => s + (it.price * it.quantity), 0);
        updateTotals(subtotal);
      });
    });

    // Promo code form listener
    const promoForm = document.getElementById('promocodeForm');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('promo');
        const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
        if (code === 'WOODPECKERS10' || code === 'WOODPECKER10') {
          appliedDiscountPct = 10;
          Woodpeckers.showToast('VIP Discount Code Applied: 10% Off your drop order!', 'success');
          const items = Woodpeckers.Cart.getItems();
          const subtotal = items.reduce((s, it) => s + (it.price * it.quantity), 0);
          updateTotals(subtotal);
        } else {
          Woodpeckers.showToast('Invalid promo code. Try WOODPECKERS10 for 10% off.', 'error');
        }
      });
    }

    window.updateCartItemQty = function(idx, newQty) {
      Woodpeckers.Cart.updateQuantity(idx, newQty);
      renderCartTable();
    };

    window.removeCartItem = function(idx) {
      Woodpeckers.Cart.removeItem(idx);
      renderCartTable();
    };

    renderCartTable();
  }

  // -------------------------------------------------------------
  // 4. CHECKOUT PAGE (checkout.html)
  // -------------------------------------------------------------
  if (isPage('checkout.html', '.checkout-page-wrapper, #checkoutForm')) {
    const items = Woodpeckers.Cart.getItems();
    const params = new URLSearchParams(window.location.search);
    const reserveRef = params.get('reserveRef');

    if (items.length === 0) {
      const container = document.querySelector('.page-checkout .container');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:80px 20px;">
            <i class="fa-solid fa-bag-shopping fa-3x text-muted mb-3"></i>
            <h3 style="font-weight:800;">Your Cart Is Empty</h3>
            <p style="color:#777;">Please select your footwear or streetwear items before proceeding to checkout.</p>
            <a href="products.html" class="btn btn-dark mt-2" style="font-weight:700;padding:12px 28px;">Return to Shop</a>
          </div>
        `;
      }
      return;
    }

    // Render Order Items Review Table in Sidebar
    const reviewContainer = document.querySelector('.product-total-order-list');
    let subtotal = 0;
    if (reviewContainer) {
      const itemsHtml = items.map(it => {
        const itemTotal = it.price * it.quantity;
        subtotal += itemTotal;
        return `
          <div class="product-total-item" style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eee;">
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${it.image}" alt="" style="width:46px;height:46px;object-fit:contain;background:#f9f9f9;border-radius:4px;padding:3px;">
              <div>
                <strong style="font-size:13px;color:#111;">${it.name}</strong><br>
                <small class="text-muted">Size: ${it.size} &bull; Qty: ${it.quantity}</small>
                ${it.isReserveDeal ? `<br><small style="color:#008751;font-weight:800;">Reserve Deal</small>` : ''}
              </div>
            </div>
            <div style="font-weight:700;font-size:13px;color:#111;">
              ${Woodpeckers.formatGHS(itemTotal)}
            </div>
          </div>
        `;
      }).join('');

      let selectedDeliveryFee = 35.0;

      reviewContainer.innerHTML = `
        ${reserveRef ? `
          <div style="background:rgba(0,135,81,0.15);border:1px solid #008751;border-radius:4px;padding:12px;margin-bottom:14px;font-size:12px;color:#7e532b;">
            <i class="fa-solid fa-award me-1"></i> Checking out for Accepted Reserve Offer: <strong>${reserveRef}</strong>
          </div>
        ` : ''}
        <div style="max-height:260px;overflow-y:auto;margin-bottom:14px;">
          ${itemsHtml}
        </div>
        
        <div style="border-top:1px solid #ddd;padding-top:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
            <span class="text-muted">Subtotal:</span>
            <strong id="chk-subtotal">${Woodpeckers.formatGHS(subtotal)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:13px;">
            <span class="text-muted">Delivery Fee:</span>
            <strong id="chk-delivery-fee">${Woodpeckers.formatGHS(selectedDeliveryFee)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid #111;font-size:16px;">
            <span style="font-weight:800;">Total Payable:</span>
            <strong id="chk-grand-total" style="color:#008751;font-size:18px;">${Woodpeckers.formatGHS(subtotal + selectedDeliveryFee)}</strong>
          </div>
        </div>
      `;
    }

    // Populate Ghana delivery districts
    const districtSelect = document.getElementById('district');
    if (districtSelect) {
      districtSelect.innerHTML = `
        <option value="" disabled>Select Delivery Region in Ghana</option>
        <option value="Greater Accra" selected>Greater Accra (Accra, Tema, Dzorwulu, East Legon)</option>
        <option value="Ashanti Region">Ashanti Region (Kumasi, Obuasi)</option>
        <option value="Central Region">Central Region (Cape Coast, Kasoa)</option>
        <option value="Western Region">Western Region (Takoradi, Sekondi)</option>
        <option value="Eastern Region">Eastern Region (Koforidua)</option>
        <option value="Northern Region">Northern Region (Tamale)</option>
      `;
    }

    // Form submission
    const form = document.querySelector('form.checkout-form') || document.querySelector('form');
    const placeOrderBtn = document.querySelector('.place-order-button a');

    if (placeOrderBtn && form) {
      placeOrderBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const fname = (document.getElementById('fname') && document.getElementById('fname').value.trim()) || '';
        const lname = (document.getElementById('lname') && document.getElementById('lname').value.trim()) || '';
        const email = (document.getElementById('email') && document.getElementById('email').value.trim()) || '';
        const phone = (document.getElementById('phone') && document.getElementById('phone').value.trim()) || '';
        const address = (document.getElementById('address') && document.getElementById('address').value.trim()) || '';
        const city = (document.getElementById('city') && document.getElementById('city').value.trim()) || 'Accra';
        const region = (document.getElementById('district') && document.getElementById('district').value) || 'Greater Accra';

        if (!fname || !email || !phone) {
          Woodpeckers.showToast('Please enter your Name, Email, and Phone / WhatsApp number.', 'error');
          return;
        }

        placeOrderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Confirming Order...';
        placeOrderBtn.style.pointerEvents = 'none';

        const orderPayload = {
          customerName: `${fname} ${lname}`.trim(),
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: {
            street: address || 'Showroom Collection / Blohum Rd',
            city: city,
            region: region,
            country: 'Ghana'
          },
          items: items,
          deliveryMethod: 'Accra Metro Delivery',
          deliveryFee: 35.0,
          paymentMethod: 'MTN Mobile Money (MoMo)',
          reserveOfferRef: reserveRef || null,
          notes: ''
        };

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
          });

          if (res.ok) {
            const result = await res.json();
            Woodpeckers.Cart.clear();
            window.location.href = `order-received.html?orderNumber=${encodeURIComponent(result.order.orderNumber)}`;
          } else {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to place order');
          }
        } catch (err) {
          // Local fallback creation
          const fallbackOrderNum = 'WPK-ORD-' + Math.floor(1000 + Math.random() * 9000);
          Woodpeckers.Cart.clear();
          window.location.href = `order-received.html?orderNumber=${fallbackOrderNum}`;
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 5. ORDER RECEIVED PAGE (order-received.html)
  // -------------------------------------------------------------
  if (isPage('order-received.html', '.order-received-box, .order-success-content')) {
    const params = new URLSearchParams(window.location.search);
    const orderNumber = params.get('orderNumber') || 'WPK-ORD-7701';

    let order = null;
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (res.ok) order = await res.json();
    } catch (e) {
      console.warn('API error fetching order');
    }

    const orderBox = document.querySelector('.order-received-box') || document.querySelector('.order-success-content');
    if (orderBox) {
      const dateStr = order ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';
      const custName = order ? order.customerName : 'Valued Customer';
      const totalStr = order ? Woodpeckers.formatGHS(order.total) : 'GH₵ 1,685.00';
      const paymentMethod = order ? order.paymentMethod : 'MTN Mobile Money';

      orderBox.innerHTML = `
        <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:36px;box-shadow:0 10px 30px rgba(0,0,0,0.05);margin-bottom:30px;">
          <div class="text-center mb-4">
            <div style="width:70px;height:70px;background:rgba(40,167,69,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <i class="fa-solid fa-circle-check" style="color:#28a745;font-size:36px;"></i>
            </div>
            <h2 style="font-size:26px;font-weight:900;color:#111;margin-bottom:6px;">Order Confirmed!</h2>
            <p style="font-size:14px;color:#666;margin:0;">
              Thank you, <strong>${custName}</strong>. Your sneaker drop has been secured.
            </p>
          </div>

          <div class="row g-3 text-center mb-4" style="background:#f9f9f9;border:1px solid #eee;border-radius:6px;padding:16px 10px;">
            <div class="col-sm-3 col-6">
              <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;">Order Number:</span>
              <strong style="color:#008751;font-family:monospace;font-size:15px;">${orderNumber}</strong>
            </div>
            <div class="col-sm-3 col-6">
              <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;">Date:</span>
              <strong style="color:#111;font-size:14px;">${dateStr}</strong>
            </div>
            <div class="col-sm-3 col-6">
              <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;">Total Paid:</span>
              <strong style="color:#111;font-size:15px;">${totalStr}</strong>
            </div>
            <div class="col-sm-3 col-6">
              <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;">Payment Method:</span>
              <strong style="color:#111;font-size:13px;">${paymentMethod}</strong>
            </div>
          </div>

          <div style="border-top:1px solid #eee;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
            <div>
              <div style="font-size:13px;font-weight:700;color:#111;"><i class="fa-solid fa-location-dot text-danger me-1"></i> Showroom Collection Point:</div>
              <div style="font-size:12px;color:#666;">24 Blohum Road, near Fidelity Bank, Dzorwulu, Accra</div>
            </div>
            <div>
              <a href="https://wa.me/233553921612?text=Hello%20Woodpeckers,%20I%20just%20placed%20order%20${orderNumber}" target="_blank" class="btn btn-success btn-sm" style="font-weight:700;">
                <i class="fa-brands fa-whatsapp me-1"></i> WhatsApp Order Support
              </a>
              <a href="products.html" class="btn btn-outline-dark btn-sm ms-2" style="font-weight:700;">Continue Shopping</a>
            </div>
          </div>
        </div>
      `;
    }
  }

  // -------------------------------------------------------------
  // 6. ACCOUNT ORDERS PAGE (account-order.html)
  // -------------------------------------------------------------
  if (isPage('account-order.html', '#account-orders-body, #customer-orders-table-body')) {
    const ordersTbody = document.getElementById('account-orders-body');
    const offersTbody = document.getElementById('my-reserve-offers-body');
    const user = (window.Woodpeckers && window.Woodpeckers.Auth) ? Woodpeckers.Auth.getUser() : null;

    if (ordersTbody) {
      const ordersUrl = user && user.email ? `/api/orders?email=${encodeURIComponent(user.email)}` : null;
      if (ordersUrl) {
        fetch(ordersUrl)
          .then(res => res.json())
          .then(orders => {
            if (orders && orders.length) {
              ordersTbody.innerHTML = orders.map(ord => {
                const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const itemsCount = ord.items ? ord.items.reduce((s, it) => s + (it.quantity || 1), 0) : 1;
                const firstItem = ord.items && ord.items[0] ? (ord.items[0].name || ord.items[0].productName) : 'Sneakers';
                const statusBadge = ord.status === 'Delivered' || ord.fulfilmentStatus === 'delivered'
                  ? '<span class="badge" style="background:#f1f5f9;color:#334155;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-box"></i> Delivered</span>'
                  : (ord.status === 'Dispatched' || ord.status === 'In Transit' || ord.fulfilmentStatus === 'dispatched')
                  ? '<span class="badge" style="background:#dcfce7;color:#15803d;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-truck-fast"></i> In Transit</span>'
                  : '<span class="badge" style="background:#e0f2fe;color:#0369a1;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-clock"></i> Processing</span>';
                
                return `
                  <tr>
                    <td class="account-order-table-no" style="font-weight:700;color:#008751;">#${ord.orderNumber}</td>
                    <td>${dateStr}</td>
                    <td>${statusBadge}</td>
                    <td>${itemsCount} item${itemsCount > 1 ? 's' : ''} (${firstItem})</td>
                    <td><strong>${Woodpeckers.formatGHS(ord.total)}</strong></td>
                    <td><a href="order-received.html?orderNumber=${encodeURIComponent(ord.orderNumber)}" class="btn-default btn-accent" style="padding:6px 14px;font-size:12px;">View</a></td>
                  </tr>
                `;
              }).join('');
            } else {
              renderEmptyOrders();
            }
          })
          .catch(() => renderEmptyOrders());
      } else {
        renderEmptyOrders();
      }

      function renderEmptyOrders() {
        ordersTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;padding:50px 20px;color:#777;">
              <i class="fa-solid fa-box-open" style="font-size:38px;color:#ccc;margin-bottom:12px;display:block;"></i>
              <p style="font-size:16px;font-weight:700;color:#222;margin-bottom:6px;">No Orders Yet</p>
              <p style="font-size:13px;color:#888;margin-bottom:20px;max-width:440px;margin-left:auto;margin-right:auto;">
                You have not placed any orders with Woodpeckers yet. When you purchase drops or win a Meet the Reserve grail, your orders will appear here.
              </p>
              <a href="products.html" class="btn-default btn-accent" style="padding:10px 24px;font-size:13px;display:inline-block;">Explore Drops &amp; Grails</a>
            </td>
          </tr>
        `;
      }
    }

    if (offersTbody) {
      const offersUrl = user && user.email ? `/api/reserve/offers?email=${encodeURIComponent(user.email)}` : null;
      if (offersUrl) {
        fetch(offersUrl)
          .then(res => res.json())
          .then(offers => {
            const userOffers = (offers || []).filter(o => user ? (o.email && o.email.toLowerCase() === user.email.toLowerCase()) : false);
            if (userOffers && userOffers.length) {
              offersTbody.innerHTML = userOffers.map(o => `
                <tr>
                  <td><code style="color:#008751;font-weight:700;">${o.reference || o.id}</code></td>
                  <td>${o.productName} (${o.size})</td>
                  <td><strong>${Woodpeckers.formatGHS(o.offerAmount)}</strong></td>
                  <td><span class="badge ${o.status === 'accepted' ? 'bg-success' : o.status === 'declined' ? 'bg-danger' : 'bg-warning text-dark'}">${o.status}</span></td>
                  <td>${o.status === 'accepted' ? `<a href="checkout.html?reserveRef=${o.reference}" class="btn btn-sm btn-primary py-1 px-2" style="background:#008751;border-color:#008751;color:#111;font-weight:700;font-size:11px;">Checkout &rarr;</a>` : `<a href="reserve.html?track=${o.reference}" class="btn btn-sm btn-dark py-1 px-2" style="font-size:11px;">Track &rarr;</a>`}</td>
                </tr>
              `).join('');
            } else {
              renderEmptyOffers();
            }
          })
          .catch(() => renderEmptyOffers());
      } else {
        renderEmptyOffers();
      }

      function renderEmptyOffers() {
        offersTbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;padding:30px 15px;color:#888;">
              <p style="margin:0;font-size:13px;">No active Meet the Reserve offers. <a href="reserve.html" style="color:#008751;font-weight:700;">Name your price on exclusive grails &rarr;</a></p>
            </td>
          </tr>
        `;
      }
    }
  }

  // -------------------------------------------------------------
  // 6b. ACCOUNT CERTIFICATES PAGE (account-download.html)
  // -------------------------------------------------------------
  if (isPage('account-download.html', '.download-content-box')) {
    const certsTbody = document.getElementById('certs-body');
    if (certsTbody) {
      const user = (window.Woodpeckers && window.Woodpeckers.Auth) ? Woodpeckers.Auth.getUser() : null;
      const ordersUrl = user && user.email ? `/api/orders?email=${encodeURIComponent(user.email)}` : null;

      if (ordersUrl) {
        fetch(ordersUrl)
          .then(res => res.json())
          .then(orders => {
            const deliveredOrders = (orders || []).filter(o => o.fulfilmentStatus === 'delivered' || o.status === 'Delivered');
            if (deliveredOrders && deliveredOrders.length) {
              let rows = '';
              deliveredOrders.forEach(ord => {
                (ord.items || []).forEach((item, idx) => {
                  const authCode = `WPK-AUTH-${(ord.orderNumber || '').replace(/[^0-9]/g, '') || (1000 + idx)}`;
                  const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  rows += `
                    <tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:12px;">
                          <img src="images/product-image-1.jpg" alt="" style="width:44px;height:44px;object-fit:contain;border:1px solid #eee;border-radius:4px;padding:2px;">
                          <div>
                            <strong style="display:block;font-size:13px;">${item.name || item.productName || 'Grail Deadstock'}</strong>
                            <span style="font-size:11px;color:#888;">Size: ${item.size || 'Standard'} &bull; Verified Deadstock</span>
                          </div>
                        </div>
                      </td>
                      <td><code style="background:#f1f5f9;color:#008751;padding:3px 6px;border-radius:3px;font-weight:700;">${authCode}</code></td>
                      <td>${dateStr}</td>
                      <td><span style="background:#dcfce7;color:#15803d;font-size:11px;font-weight:800;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-check"></i> 100% Authentic</span></td>
                      <td>
                        <button type="button" class="btn btn-sm btn-dark" onclick="alert('Downloading Certificate of Authenticity (${authCode})...')" style="font-size:12px;padding:5px 10px;">
                          <i class="fa-solid fa-file-pdf"></i> Certificate
                        </button>
                      </td>
                    </tr>
                  `;
                });
              });
              certsTbody.innerHTML = rows;
            } else {
              renderEmptyCerts();
            }
          })
          .catch(() => renderEmptyCerts());
      } else {
        renderEmptyCerts();
      }

      function renderEmptyCerts() {
        certsTbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;padding:50px 20px;color:#777;">
              <i class="fa-solid fa-certificate" style="font-size:38px;color:#ccc;margin-bottom:12px;display:block;"></i>
              <p style="font-size:16px;font-weight:700;color:#222;margin-bottom:6px;">No Certificates Yet</p>
              <p style="font-size:13px;color:#888;margin-bottom:0;max-width:440px;margin-left:auto;margin-right:auto;">
                Every pair of grail sneakers and luxury streetwear sold at Woodpeckers comes with an encrypted certificate of authenticity verified at our Dzorwulu showroom upon delivery.
              </p>
            </td>
          </tr>
        `;
      }
    }
  }

  // -------------------------------------------------------------
  // 7. CONTACT & NEWSLETTER FORMS
  // -------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fname = (document.getElementById('fname') || {}).value || '';
      const lname = (document.getElementById('lname') || {}).value || '';
      const email = (document.getElementById('email') || {}).value || '';
      const phone = (document.getElementById('phone') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';

      const msgSubmit = document.getElementById('msgSubmit');
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fname, lname, email, phone, message })
        });
      } catch (err) {}

      if (msgSubmit) {
        msgSubmit.className = 'h5 text-success mt-3';
        msgSubmit.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, ${fname || 'Customer'}! Your message has been received by Woodpeckers showroom team at Dzorwulu (+233 55 392 1612). We will reply promptly.`;
        msgSubmit.classList.remove('d-none');
      }
      contactForm.reset();
    });
  }

  // Newsletter forms across site
  const newsletterForms = document.querySelectorAll('#newslettersForm, .footer-newsletter-form form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const emailVal = input ? input.value : '';
      if (!emailVal) return;

      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailVal })
        });
      } catch (err) {}

      let feedback = form.querySelector('.newsletter-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'newsletter-feedback';
        feedback.style.cssText = 'color:#00D084;font-size:12px;font-weight:700;margin-top:8px;';
        form.appendChild(feedback);
      }
      feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> VIP Alert Confirmed! You will receive drop updates every Thursday, Friday, and Saturday.';
      if (input) input.value = '';
    });
  });

  // -------------------------------------------------------------
  // 6B. AUTHENTICATION & LOGIN/SIGNUP (login.html)
  // -------------------------------------------------------------
  const loginForm = document.getElementById('LoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userField = document.getElementById('name');
      const passField = document.getElementById('loginpassword');
      const username = userField ? userField.value.trim() : '';
      const password = passField ? passField.value : '';

      if (!username || !password) {
        Woodpeckers.showToast('Please enter your username and password.', 'error');
        return;
      }

      const res = await Woodpeckers.Auth.login(username, password);
      if (res.success) {
        Woodpeckers.showToast(`Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => {
          if (res.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'account-dashboard.html';
          }
        }, 500);
      } else {
        Woodpeckers.showToast(res.message || 'Login failed. Check your credentials.', 'error');
      }
    });
  }

  const signupForm = document.getElementById('SignupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameField = document.getElementById('signupname');
      const emailField = document.getElementById('email');
      const passField = document.getElementById('signuppassword');

      const name = nameField ? nameField.value.trim() : '';
      const email = emailField ? emailField.value.trim() : '';
      const password = passField ? passField.value : '';

      if (!email || !password) {
        Woodpeckers.showToast('Please enter your email and password.', 'error');
        return;
      }

      const displayName = name || email.split('@')[0];
      const res = await Woodpeckers.Auth.register(displayName, email, password);
      if (res.success) {
        Woodpeckers.showToast(`Account created! Welcome, ${displayName}.`, 'success');
        setTimeout(() => {
          window.location.href = 'account-dashboard.html';
        }, 500);
      } else {
        Woodpeckers.showToast(res.message || 'Registration failed.', 'error');
      }
    });
  }

  // -------------------------------------------------------------
  // 6C. ACCOUNT DASHBOARD (account-dashboard.html)
  // -------------------------------------------------------------
  if (isPage('account-dashboard.html', '#dash-recent-orders-body, #user-display-name')) {
    const user = Woodpeckers.Auth.getCurrentUser();
    const displayName = user ? user.name : 'Valued Collector';

    const nameEl = document.getElementById('user-display-name');
    const nameSubEl = document.getElementById('user-display-name-sub');
    if (nameEl) nameEl.textContent = displayName;
    if (nameSubEl) nameSubEl.textContent = displayName;

    // Load live orders count and table
    const orders = Woodpeckers.Orders ? Woodpeckers.Orders.getAll() : [];
    const wishlistItems = Woodpeckers.Wishlist ? Woodpeckers.Wishlist.getItems() : [];
    const offers = (window.Woodpeckers && window.Woodpeckers.DB) ? (Woodpeckers.DB.get('offers') || []) : [];

    const ordersCountEl = document.getElementById('dash-orders-count');
    const wishCountEl = document.getElementById('dash-wishlist-count');
    const reserveCountEl = document.getElementById('dash-reserve-count');

    if (ordersCountEl) ordersCountEl.textContent = orders.length;
    if (wishCountEl) wishCountEl.textContent = wishlistItems.length;
    if (reserveCountEl) reserveCountEl.textContent = offers.length;

    // Populate recent orders table
    const recentTbody = document.getElementById('dash-recent-orders-body');
    if (recentTbody) {
      if (orders.length === 0) {
        recentTbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4">
              <p class="text-muted mb-2">You haven't placed any orders yet.</p>
              <a href="products.html" class="btn btn-dark btn-sm font-weight-bold">Shop Latest Drops</a>
            </td>
          </tr>
        `;
      } else {
        recentTbody.innerHTML = orders.slice(0, 5).map(ord => {
          const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const itemsCount = ord.items ? ord.items.reduce((s, it) => s + (it.quantity || 1), 0) : 1;
          const firstItem = ord.items && ord.items[0] ? ord.items[0].name : 'Sneakers';
          const statusBadge = ord.status === 'Delivered' 
            ? '<span class="badge" style="background:#f1f5f9;color:#334155;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-box"></i> Delivered</span>'
            : (ord.status === 'Dispatched' || ord.status === 'In Transit')
            ? '<span class="badge" style="background:#dcfce7;color:#15803d;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-truck-fast"></i> In Transit</span>'
            : '<span class="badge" style="background:#e0f2fe;color:#0369a1;padding:4px 8px;border-radius:4px;"><i class="fa-solid fa-clock"></i> Processing</span>';

          return `
            <tr>
              <td style="font-weight:700;color:#008751;">#${ord.orderNumber}</td>
              <td>${dateStr}</td>
              <td>${statusBadge}</td>
              <td>${itemsCount} item${itemsCount > 1 ? 's' : ''} (${firstItem})</td>
              <td><strong>${Woodpeckers.formatGHS(ord.total)}</strong></td>
              <td><a href="order-received.html?orderNumber=${encodeURIComponent(ord.orderNumber)}" class="btn-default btn-accent" style="padding:4px 10px;font-size:11px;">View</a></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // -------------------------------------------------------------
  // 6D. ACCOUNT WISHLIST (account-wishlist.html)
  // -------------------------------------------------------------
  if (isPage('account-wishlist.html', '.wishlist-content-box')) {
    function renderWishlistTable() {
      const items = Woodpeckers.Wishlist.getItems();
      const tableBox = document.querySelector('.wishlist-content-box');
      if (!tableBox) return;

      if (items.length === 0) {
        tableBox.innerHTML = `
          <div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;border:1px solid #eee;">
            <i class="fa-solid fa-heart-crack fa-3x text-muted mb-3"></i>
            <h3 style="font-size:22px;font-weight:800;color:#111;margin-bottom:8px;">No Saved Grails in Wishlist</h3>
            <p style="font-size:14px;color:#777;max-width:440px;margin:0 auto 24px;">
              Explore our deadstock sneakers and streetwear collections to save your favorite grails.
            </p>
            <a href="products.html" class="btn btn-dark" style="padding:12px 24px;font-weight:700;">Explore Drops</a>
          </div>
        `;
        return;
      }

      const rowsHtml = items.map((p, idx) => {
        return `
          <div class="wishlist-item" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid #eee;">
            <div style="display:flex;align-items:center;gap:16px;">
              <img src="${(p.images && p.images[0]) || p.image || 'images/product-image-1.jpg'}" alt="${p.name}" style="width:70px;height:70px;object-fit:contain;background:#f9f9f9;border-radius:4px;padding:4px;">
              <div>
                <a href="product-single.html?id=${p.id}" style="color:#111;font-weight:700;font-size:14px;display:block;margin-bottom:4px;">${p.name}</a>
                <span style="font-size:12px;color:#888;">${p.brand || 'Woodpeckers'} &bull; ${p.category || 'Footwear'}</span>
                <div style="font-weight:800;color:#008751;margin-top:4px;">${Woodpeckers.formatGHS(p.price)}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <button class="btn btn-dark btn-sm btn-quick-cart" data-product-id="${p.id}" style="font-size:12px;font-weight:700;">
                <i class="fa-solid fa-bag-shopping me-1"></i> Add to Bag
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="removeWishlistItem('${p.id}')" title="Remove">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      tableBox.innerHTML = `
        <div class="wishlist-item-table wow fadeInUp">
          <div style="border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:10px;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
            Saved Deadstock Grails (${items.length})
          </div>
          ${rowsHtml}
        </div>
      `;

      attachQuickCartListeners(tableBox);
    }

    window.removeWishlistItem = function(productId) {
      Woodpeckers.Wishlist.remove(productId);
      renderWishlistTable();
    };

    renderWishlistTable();
  }

  // Global Logout buttons listener
  document.querySelectorAll('.btn-woodpeckers-logout').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Woodpeckers.Auth.logout();
      Woodpeckers.showToast('You have been logged out.', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 400);
    });
  });

  // Local Video Player Sound & Play/Pause Controller
  const localVideo = document.getElementById('woodpeckersLocalVideo');
  const soundBtn = document.getElementById('videoSoundBtn');
  const videoContainer = document.getElementById('videoSectionContainer');
  const playIcon = document.getElementById('videoPlayIcon');
  const pauseIcon = document.getElementById('videoPauseIcon');

  function toggleVideoAudioPlay(e) {
    if (e) e.preventDefault();
    if (!localVideo) return;

    if (localVideo.muted) {
      localVideo.muted = false;
      localVideo.play().catch(() => {});
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (soundBtn) {
        soundBtn.style.background = '#00a865';
        soundBtn.setAttribute('title', 'Sound enabled. Click to pause');
      }
    } else {
      if (localVideo.paused) {
        localVideo.play().catch(() => {});
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
      } else {
        localVideo.pause();
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
      }
    }
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', toggleVideoAudioPlay);
  }
  if (videoContainer) {
    videoContainer.addEventListener('click', (e) => {
      // If clicking container but not button
      if (e.target !== soundBtn && !soundBtn.contains(e.target)) {
        toggleVideoAudioPlay(e);
      }
    });
  }

  // Dynamic Weekly Drop Countdown Timer
  const timerEl = document.getElementById('dropCountdownTimer');
  if (timerEl) {
    function updateDropCountdown() {
      // Calculate target: next Thursday at 10:00 AM UTC
      const now = new Date();
      let target = new Date();
      target.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
      target.setHours(10, 0, 0, 0);

      const diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      const dEl = timerEl.querySelector('.days');
      const hEl = timerEl.querySelector('.hours');
      const mEl = timerEl.querySelector('.minutes');
      const sEl = timerEl.querySelector('.seconds');

      if (dEl) dEl.textContent = String(d).padStart(2, '0');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }

    updateDropCountdown();
    setInterval(updateDropCountdown, 1000);
  }

  // -------------------------------------------------------------
  // UNIVERSAL SEARCH MODAL & GLOBAL SEARCH
  // -------------------------------------------------------------
  function closeSearchModal() {
    const modalEl = document.getElementById('exampleModal');
    if (modalEl) {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) {
          inst.hide();
        }
      } else if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
        $('#exampleModal').modal('hide');
      }
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  }

  function executeGlobalSearch(query) {
    const q = (query || '').trim();
    if (!q) return;

    closeSearchModal();

    if (isPage('products.html', '.product-item-list')) {
      if (typeof window.WPK_SET_SEARCH === 'function') {
        window.WPK_SET_SEARCH(q);
      } else {
        window.location.href = `products.html?search=${encodeURIComponent(q)}`;
      }
    } else {
      window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  }

  // Intercept all modal search forms and inputs
  document.querySelectorAll('.modal-search-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="search"]') || document.getElementById('search');
      executeGlobalSearch(input ? input.value : '');
    });
  });

  document.querySelectorAll('.modal-search-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.closest('.modal-search-form') || btn.closest('.modal-content') || document;
      const input = parent.querySelector('input[name="search"]') || document.getElementById('search');
      executeGlobalSearch(input ? input.value : '');
    });
  });

  document.querySelectorAll('#search, .modal-search-form input[name="search"]').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeGlobalSearch(input.value);
      }
    });
  });

  // Auto-focus search input when modal opens
  const searchModalEl = document.getElementById('exampleModal');
  if (searchModalEl) {
    searchModalEl.addEventListener('shown.bs.modal', () => {
      const input = searchModalEl.querySelector('input[name="search"]') || document.getElementById('search');
      if (input) input.focus();
    });
  }
});
