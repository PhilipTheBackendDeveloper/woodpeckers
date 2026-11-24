/**
 * Woodpeckers Sneakers & Streetwear — Unified Commerce, Auth, Reserve & Inventory Engine
 * Ensures 100% functionality on both Node server (port 3000) and VS Code Live Server (port 5500).
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEYS = {
    CART: 'woodpeckers_cart',
    WISHLIST: 'woodpeckers_wishlist',
    RECENT_OFFERS: 'woodpeckers_my_offers',
    OFFER_TRACKING: 'woodpeckers_last_tracked_ref',
    USER: 'woodpeckers_current_user',
    LOCAL_ORDERS: 'woodpeckers_orders',
    LOCAL_OFFERS: 'woodpeckers_offers_store'
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
      font-family:'Plus Jakarta Sans', -apple-system, sans-serif;
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

  // Master Product Database
  const DEFAULT_PRODUCTS = [
    {
      id: 'SNK-001',
      sku: 'WPK-AJ1-CHI',
      name: "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
      category: 'Exclusive Sneakers',
      brand: 'Nike / Jordan',
      brandKey: 'Nike',
      material: 'Leather',
      price: 3850,
      originalPrice: 4200,
      description: "The grail colorway returns with vintage-inspired details. Featuring premium cracked leather collars, aged sail midsoles, and classic Chicago red-and-black overlays. Every pair is 100% verified authentic by Woodpeckers Ghana.",
      images: [
        'images/product-image-1.jpg',
        'images/product-thumbnail-image-1.jpg',
        'images/product-thumbnail-image-2.jpg',
        'images/product-thumbnail-image-3.jpg'
      ],
      sizes: [
        { size: 'UK 7.5', stock: 2 },
        { size: 'UK 8', stock: 2 },
        { size: 'UK 8.5', stock: 3 },
        { size: 'UK 9', stock: 3 },
        { size: 'UK 10', stock: 2 }
      ],
      reserveEligible: true,
      reserveFloor: 3200,
      reserveGuidance: 'Estimated Reserve: ~GH₵ 3,200 - GH₵ 3,500. Submit your best offer to secure.',
      tags: ['Grail', 'Hype', 'Collector', 'Reserve Eligible'],
      rating: 5,
      reviewCount: 18
    },
    {
      id: 'SNK-002',
      sku: 'WPK-TS-REVMOCHA',
      name: "Travis Scott x Air Jordan 1 Low 'Reverse Mocha'",
      category: 'Exclusive Sneakers',
      brand: 'Nike / Jordan',
      brandKey: 'Nike',
      material: 'Suede',
      price: 5200,
      originalPrice: 5800,
      description: "La Flame's signature inverse oversized Swoosh paired with rich brown nubuck, crisp white leather overlays, and vintage cream detailing. One of the most sought-after low-tops in contemporary sneaker culture.",
      images: [
        'images/product-image-2.jpg',
        'images/product-thumbnail-image-1.jpg',
        'images/product-thumbnail-image-2.jpg'
      ],
      sizes: [
        { size: 'UK 8', stock: 1 },
        { size: 'UK 8.5', stock: 2 },
        { size: 'UK 9', stock: 1 },
        { size: 'UK 10', stock: 1 }
      ],
      reserveEligible: true,
      reserveFloor: 4400,
      reserveGuidance: 'Estimated Reserve: ~GH₵ 4,400 - GH₵ 4,800. Fast manual store review.',
      tags: ['Grail', 'Travis Scott', 'Exclusive', 'Reserve Eligible'],
      rating: 5,
      reviewCount: 24
    },
    {
      id: 'SNK-003',
      sku: 'WPK-DUNK-PANDA',
      name: "Nike Dunk Low Retro 'Panda'",
      category: 'Lifestyle Runners',
      brand: 'Nike / Jordan',
      brandKey: 'Nike',
      material: 'Leather',
      price: 1650,
      originalPrice: 1850,
      description: "The ubiquitous street staple. Clean monochromatic black and white leather construction ready for everyday wear across Accra. Fresh in box, authenticated deadstock.",
      images: [
        'images/product-image-3.jpg',
        'images/product-thumbnail-image-1.jpg'
      ],
      sizes: [
        { size: 'UK 7', stock: 3 },
        { size: 'UK 8', stock: 4 },
        { size: 'UK 8.5', stock: 5 },
        { size: 'UK 9', stock: 4 },
        { size: 'UK 10', stock: 2 }
      ],
      reserveEligible: false,
      reserveFloor: 0,
      reserveGuidance: '',
      tags: ['Everyday', 'Essential', 'Dunk'],
      rating: 4.8,
      reviewCount: 42
    },
    {
      id: 'SNK-004',
      sku: 'WPK-NB-9060',
      name: "New Balance 9060 'Sea Salt & Rain Cloud'",
      category: 'Lifestyle Runners',
      brand: 'New Balance',
      brandKey: 'New Balance',
      material: 'Mesh',
      price: 2150,
      originalPrice: 2400,
      description: "Futuristic sculpted wavy midsole equipped with ABZORB and SBS cushioning. Premium pigskin suede overlays meet breathable mesh in neutral tones. Unrivalled all-day comfort.",
      images: [
        'images/product-image-4.jpg'
      ],
      sizes: [
        { size: 'UK 8', stock: 2 },
        { size: 'UK 8.5', stock: 3 },
        { size: 'UK 9', stock: 3 },
        { size: 'UK 10', stock: 1 }
      ],
      reserveEligible: true,
      reserveFloor: 1850,
      reserveGuidance: 'Estimated Reserve: ~GH₵ 1,850 - GH₵ 1,950.',
      tags: ['Comfort', 'Lifestyle', 'Trending', 'Reserve Eligible'],
      rating: 4.9,
      reviewCount: 15
    },
    {
      id: 'SNK-005',
      sku: 'WPK-YZY-350-BEL',
      name: "Yeezy Boost 350 V2 'Carbon Beluga'",
      category: 'Exclusive Sneakers',
      brand: 'Adidas / Yeezy',
      brandKey: 'Yeezy',
      material: 'Synthetic',
      price: 2900,
      originalPrice: 3200,
      description: "Classic zebra-style dark grey Primeknit upper accented with vibrant solar red 'SPLY-350' branding stripe. Full-length Boost midsole encapsulated in semi-translucent TPU.",
      images: [
        'images/product-image-5.jpg'
      ],
      sizes: [
        { size: 'UK 8', stock: 2 },
        { size: 'UK 8.5', stock: 2 },
        { size: 'UK 9', stock: 1 },
        { size: 'UK 10', stock: 1 }
      ],
      reserveEligible: true,
      reserveFloor: 2400,
      reserveGuidance: 'Estimated Reserve: ~GH₵ 2,400 - GH₵ 2,600.',
      tags: ['Yeezy', 'Boost', 'Deadstock', 'Reserve Eligible'],
      rating: 4.7,
      reviewCount: 29
    },
    {
      id: 'SNK-006',
      sku: 'WPK-ASC-KAYANO14',
      name: "Asics Gel-Kayano 14 'White & Pure Gold'",
      category: 'Lifestyle Runners',
      brand: 'Asics / Saucony',
      brandKey: 'Asics',
      material: 'Mesh',
      price: 1950,
      originalPrice: 2200,
      description: "Late 2000s technical running aesthetic recontextualized for modern streetwear. Metallic gold accents over lightweight white open mesh with signature GEL cushioning.",
      images: [
        'images/product-image-6.jpg'
      ],
      sizes: [
        { size: 'UK 8', stock: 2 },
        { size: 'UK 8.5', stock: 3 },
        { size: 'UK 9', stock: 2 }
      ],
      reserveEligible: false,
      reserveFloor: 0,
      reserveGuidance: '',
      tags: ['Tech Runner', 'Trendsetter', 'Asics'],
      rating: 4.8,
      reviewCount: 11
    },
    {
      id: 'STR-001',
      sku: 'WPK-STR-TEE-BLK',
      name: "Woodpeckers Heavyweight Oversized Tee 'Accra Night'",
      category: 'Streetwear',
      brand: 'Woodpeckers Original',
      brandKey: 'Woodpeckers',
      material: 'Canvas',
      price: 450,
      originalPrice: 520,
      description: "Custom cut & sewn 260GSM combed cotton jersey. Relaxed dropped shoulder silhouette with high-density puff print Woodpeckers graphic. Made for humid Accra tropical climate.",
      images: [
        'images/product-image-7.jpg'
      ],
      sizes: [
        { size: 'S', stock: 4 },
        { size: 'M', stock: 6 },
        { size: 'L', stock: 8 },
        { size: 'XL', stock: 5 }
      ],
      reserveEligible: false,
      reserveFloor: 0,
      reserveGuidance: '',
      tags: ['Streetwear', 'Apparel', 'Heavyweight', 'Local Brand'],
      rating: 5,
      reviewCount: 36
    },
    {
      id: 'STR-002',
      sku: 'WPK-STR-CRG-OBS',
      name: "Woodpeckers Tactical Cargo Pants 'Obsidian'",
      category: 'Streetwear',
      brand: 'Woodpeckers Original',
      brandKey: 'Woodpeckers',
      material: 'Canvas',
      price: 850,
      originalPrice: 980,
      description: "Durable cotton-twill utility cargo trousers with custom metal D-rings, 6 functional bellows pockets, and adjustable toggle ankles to stack effortlessly over high-top sneakers.",
      images: [
        'images/product-image-8.jpg'
      ],
      sizes: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 4 },
        { size: 'L', stock: 4 },
        { size: 'XL', stock: 2 }
      ],
      reserveEligible: true,
      reserveFloor: 700,
      reserveGuidance: 'Estimated Reserve: ~GH₵ 700 - GH₵ 750.',
      tags: ['Cargo', 'Streetwear', 'Tactical', 'Reserve Eligible'],
      rating: 4.9,
      reviewCount: 19
    },
    {
      id: 'STR-003',
      sku: 'WPK-STR-HD-IVR',
      name: "Woodpeckers Signature Boxy Hoodie 'Raw Ivory'",
      category: 'Streetwear',
      brand: 'Woodpeckers Original',
      brandKey: 'Woodpeckers',
      material: 'Canvas',
      price: 950,
      originalPrice: 1100,
      description: "Luxurious 450GSM loopback French terry fleece. Double-layered hood without drawstrings for clean minimalist aesthetic. Subtle tonal embroidery on wrist cuff.",
      images: [
        'images/product-image-9.jpg'
      ],
      sizes: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 5 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 3 }
      ],
      reserveEligible: true,
      reserveFloor: 780,
      reserveGuidance: 'Estimated Reserve: ~GH₵ 780 - GH₵ 850.',
      tags: ['Hoodie', 'Fleece', 'Luxury Streetwear', 'Reserve Eligible'],
      rating: 5,
      reviewCount: 22
    },
    {
      id: 'SNK-007',
      sku: 'WPK-SNK-AF1-WHT',
      name: "Nike Air Force 1 '07 'Triple White'",
      category: 'Exclusive Sneakers',
      brand: 'Nike',
      brandKey: 'Nike',
      material: 'Leather',
      price: 1450,
      originalPrice: 1650,
      description: "The classic that never goes out of style. Full-grain leather upper with the iconic AF1 cupsole. A foundational grail for every Accra sneakerhead — clean, versatile, and always authentic.",
      images: [
        'images/product-image-3.jpg'
      ],
      sizes: [
        { size: 'UK7', stock: 3 },
        { size: 'UK8', stock: 4 },
        { size: 'UK8.5', stock: 3 },
        { size: 'UK9', stock: 2 },
        { size: 'UK10', stock: 2 }
      ],
      reserveEligible: false,
      tags: ['Nike', 'Air Force 1', 'Classic', 'Lifestyle'],
      rating: 4.8,
      reviewCount: 34
    },
    {
      id: 'SNK-008',
      sku: 'WPK-SNK-ADS-SMB',
      name: "Adidas Samba OG 'Core Black & White'",
      category: 'Lifestyle Runners',
      brand: 'Adidas',
      brandKey: 'Adidas',
      material: 'Leather',
      price: 1680,
      originalPrice: 1900,
      description: "The Adidas Samba OG — the shoe that took over the world. Low-profile silhouette with gum sole, suede T-toe, and premium leather upper. Dzorwulu approved, globally recognised.",
      images: [
        'images/product-image-4.jpg'
      ],
      sizes: [
        { size: 'UK7', stock: 4 },
        { size: 'UK8', stock: 5 },
        { size: 'UK8.5', stock: 3 },
        { size: 'UK9', stock: 3 },
        { size: 'UK10', stock: 1 }
      ],
      reserveEligible: false,
      tags: ['Adidas', 'Samba', 'Lifestyle', 'Trending'],
      rating: 4.9,
      reviewCount: 28
    },
    {
      id: 'STR-004',
      sku: 'WPK-STR-SHT-BLK',
      name: "Woodpeckers Utility Shorts 'Stealth Black'",
      category: 'Streetwear',
      brand: 'Woodpeckers Original',
      brandKey: 'Woodpeckers',
      material: 'Canvas',
      price: 380,
      originalPrice: 450,
      description: "Relaxed-fit utility shorts with zip pockets and tonal embroidery. Cut from heavyweight canvas for a premium drape. The perfect pair for the Accra heat with a streetwear edge.",
      images: [
        'images/product-image-8.jpg'
      ],
      sizes: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 7 },
        { size: 'L', stock: 6 },
        { size: 'XL', stock: 4 }
      ],
      reserveEligible: false,
      tags: ['Shorts', 'Streetwear', 'Utility', 'Woodpeckers Original'],
      rating: 4.7,
      reviewCount: 11
    }
  ];

  // Global Products Map
  window.WPK_PRODUCTS_MAP = {};
  DEFAULT_PRODUCTS.forEach(p => { window.WPK_PRODUCTS_MAP[p.id] = p; });

  // Products Engine
  const Products = {
    async getAll() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            list.forEach(p => { window.WPK_PRODUCTS_MAP[p.id] = p; });
            return list;
          }
        }
      } catch (e) {}
      return DEFAULT_PRODUCTS;
    },

    async getById(id) {
      if (window.WPK_PRODUCTS_MAP[id]) return window.WPK_PRODUCTS_MAP[id];
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return DEFAULT_PRODUCTS.find(p => p.id === id) || null;
    },

    filter(products, criteria = {}) {
      let filtered = [...products];

      // 1. Categories
      if (criteria.categories && criteria.categories.length > 0 && !criteria.categories.includes('all')) {
        filtered = filtered.filter(p => {
          if (criteria.categories.includes('reserveOnly')) {
            if (p.reserveEligible) return true;
          }
          return criteria.categories.includes(p.category);
        });
      }

      // 2. Sizes
      if (criteria.sizes && criteria.sizes.length > 0) {
        filtered = filtered.filter(p => {
          if (!p.sizes) return false;
          return p.sizes.some(s => criteria.sizes.some(cs => s.size.toLowerCase().includes(cs.toLowerCase()) && s.stock > 0));
        });
      }

      // 3. Brands
      if (criteria.brands && criteria.brands.length > 0) {
        filtered = filtered.filter(p => {
          return criteria.brands.some(b => 
            p.brand.toLowerCase().includes(b.toLowerCase()) || 
            (p.brandKey && p.brandKey.toLowerCase().includes(b.toLowerCase()))
          );
        });
      }

      // 4. Material
      if (criteria.materials && criteria.materials.length > 0) {
        filtered = filtered.filter(p => criteria.materials.includes(p.material));
      }

      // 5. Search Text
      if (criteria.search && criteria.search.trim()) {
        const q = criteria.search.trim().toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }

      // 6. Sorting
      if (criteria.sort) {
        if (criteria.sort === 'Low_to_High') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (criteria.sort === 'High_to_Low') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (criteria.sort === 'Popularity' || criteria.sort === 'Best_Sellers') {
          filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        } else if (criteria.sort === 'Most_Reviewed') {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
      }

      return filtered;
    }
  };

  // Master Articles Database
  const DEFAULT_ARTICLES = [
    {
      id: "blog-1",
      slug: "meet-the-reserve-art-of-naming-price",
      title: "Meet the Reserve: The Art of Naming Your Price on Limited Grails",
      subtitle: "The Movement Redefining Sneaker Retail in Accra",
      author: "Woodpeckers Editorial • Dzorwulu",
      date: "24 October 2026",
      readTime: "4 min read",
      image: "images/featured-collection-image-1.jpg",
      category: "Culture & Grails",
      excerpt: "Discover how Woodpeckers Ghana disrupted traditional retail by introducing Accra's first interactive deadstock bidding format.",
      content: `<p>For decades, sneaker commerce in West Africa has been governed by rigid retail pricing, uncertain imported deadstock conditions, and unpredictable markups on limited-edition releases. In October 2026, Woodpeckers Ghana decided to disrupt the paradigm by introducing an unprecedented retail format: <strong>Meet the Reserve</strong>.</p><p>Operating from our flagship showroom at 24 Blohum Road in Dzorwulu, Accra, the campaign invites sneakerheads, streetwear creators, and collectors to do something once considered unthinkable in luxury retail — name their own price on coveted grails, from Air Jordan 1 'Chicago Lost & Found' to Travis Scott reverse mochas and New Balance 9060s.</p><blockquote style="border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;"><p style="font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;">"Retail should be more than a transaction. It should be an experience. We want customers to come into our store not simply to purchase merchandise, but to discover, participate and enjoy something different. Meet the Reserve gives them that opportunity."</p><span style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#008751;font-weight:800;">— Management, State Street Retail Group (Woodpeckers Ghana)</span></blockquote><h2>How the Reserve Mechanism Actually Works</h2><p>Unlike traditional discount bins or clearance sales, Meet the Reserve introduces genuine strategic anticipation and valuation into every drop:</p><ul><li><strong>Undisclosed Reserves:</strong> Selected pairs carry an undisclosed minimum acceptable floor price based on international deadstock acquisition.</li><li><strong>Shopper Makes an Offer:</strong> Shoppers submit what they believe the pair is worth — digitally on our web terminal or in person at Dzorwulu.</li><li><strong>Instant Feedback & Counteroffers:</strong> If an offer meets or exceeds the reserve, the deal is locked immediately. Competitive offers receive fair counteroffers.</li><li><strong>Weekly Curated Drops:</strong> Fresh hype grails rotate into the Reserve every Thursday, Friday, and Saturday.</li></ul><h2>100% Deadstock • Zero Compromise Authentication</h2><p>Every pair eligible for Meet the Reserve is rigorously verified at 24 Blohum Road. We verify blacklight glow, leather density, box typography, and insole glue to ensure complete authenticity.</p>`,
      tags: ["#MeetTheReserve", "#GrailSneakers", "#WoodpeckersAccra", "#AccraStreetwear"]
    },
    {
      id: "blog-2",
      slug: "deadstock-authentication-process",
      title: "100% Deadstock: Inside Our Multi-Point Sneaker Authentication Process",
      subtitle: "How Woodpeckers Guarantees Zero Replicas in West Africa",
      author: "Kojo Frimpong • Head of Authentication",
      date: "20 October 2026",
      readTime: "5 min read",
      image: "images/post-1.jpg",
      category: "Authentication",
      excerpt: "From UV blacklight stitching checks to midsole density and factory scents: inside our 12-point authentication protocol.",
      content: `<p>In a marketplace flooded with high-tier unauthorized replicas and grey-market counterfeits, sneaker collectors in Ghana need absolute certainty when investing in four-figure grails. At Woodpeckers, authenticity is not a marketing buzzword — it is our operational foundation.</p><p>Every sneaker entering our Dzorwulu showroom undergoes our strict 12-point physical authentication protocol before it ever reaches the shelf or the online Reserve inventory.</p><h2>The 12-Point Authentication Protocol</h2><ul><li><strong>Box Label & Typography:</strong> Font kerning, UPC barcode resolution, and thermal label adhesive verification.</li><li><strong>UV Blacklight Luminescence:</strong> Examination of hidden factory stamping, glue bleeding along the midsole, and stitch glow characteristics.</li><li><strong>Leather Grain & Scent:</strong> Authentic deadstock pairs from Jordan Brand and Nike carry distinct vegetable-tanned leather aromas and natural pebble texture.</li><li><strong>Insole Stitching & Footbed Glue:</strong> Factory strobel stitching density, thread tension, and glue swirl patterns beneath the removable insoles.</li><li><strong>Weight & Outsole Rigidity:</strong> Gram-accurate weight comparison against certified retail reference pairs in our archive.</li></ul><blockquote style="border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;"><p style="font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;">"If there is even a 0.1% doubt on a pair's provenance, it does not enter our store. Period. Our customers trust us with their biggest sneaker grails."</p><span style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#008751;font-weight:800;">— Kojo Frimpong, Lead Sneaker Curator</span></blockquote>`,
      tags: ["#Authentication", "#DeadstockVerified", "#SneakerSafety", "#AccraGrails"]
    },
    {
      id: "blog-3",
      slug: "accra-streetwear-lookbook-2026",
      title: "Street is a State of Mind: The Accra Streetwear Lookbook",
      subtitle: "Heavyweight Cotton, Tactical Cuts, and Tropical Aesthetics",
      author: "Nana Yaw Boateng • Fashion Stylist",
      date: "16 October 2026",
      readTime: "6 min read",
      image: "images/post-2.jpg",
      category: "Streetwear & Styling",
      excerpt: "Inside the Woodpeckers 2026 Lookbook: pairing boxy heavyweight tees with tactical cargo pants and rare retro kicks across Accra.",
      content: `<p>Streetwear in Accra has evolved beyond borrowed Western aesthetics into a vibrant, distinct cultural statement. Between the humid coastal air and the buzzing energy of Osu, Airport Residential, and East Legon, the modern Ghanaian streetwear uniform balances heavy fabric durability with breathable, relaxed proportions.</p><p>For our 2026 Lookbook, Woodpeckers curated a monochromatic yet functional collection featuring custom-milled 280 GSM heavyweight cotton tees, ripstop utility cargo pants, and structured boxy hoodies.</p><h2>The Three Pillars of Modern Accra Streetwear</h2><ul><li><strong>1. Proportional Contrast:</strong> Pair wide-leg utility cargo pants with clean, boxy tees that fall slightly below the waistline without bunching.</li><li><strong>2. Heat-Ready Durability:</strong> Heavyweight combed cotton absorbs moisture while retaining its architectural silhouette through repeated daily wear.</li><li><strong>3. Footwear Anchor:</strong> Grounding neutral earthy streetwear tones (Ivory, Obsidian, Olive) with bold grail kicks like the Air Jordan 1 Chicago Lost & Found or Travis Scott Reverse Mocha.</li></ul><blockquote style="border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;"><p style="font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;">"Streetwear isn't about wearing a loud logo. It's about knowing how the fabric falls on your silhouette and how your footwear anchors the whole story."</p><span style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#008751;font-weight:800;">— Nana Yaw Boateng, Fashion Stylist • Osu</span></blockquote>`,
      tags: ["#AccraStreetwear", "#StreetMindset", "#HeavyweightCotton", "#CargoPants"]
    },
    {
      id: "blog-4",
      slug: "top-5-grail-colorways-2026",
      title: "Top 5 Grail Colorways Every Sneakerhead Needs in 2026",
      subtitle: "The Silhouettes Defining Contemporary Sneaker Culture",
      author: "Woodpeckers Curators",
      date: "12 October 2026",
      readTime: "4 min read",
      image: "images/post-4.jpg",
      category: "Sneaker Heat",
      excerpt: "From the Air Jordan 1 Lost & Found to Travis Scott Reverse Mocha: the most iconic kicks holding immense cultural and collector value.",
      content: `<p>Sneaker trends come and go, but true grails transcend release cycles. Whether you are building a foundational five-pair sneaker rotation or searching for the centerpiece of your collection, these five silhouettes represent the peak of craftsmanship, cultural relevance, and collector value in 2026.</p><h2>1. Air Jordan 1 Retro High OG 'Chicago Lost & Found'</h2><p>The definitive basketball sneaker silhouette. With vintage cracked leather collars and aged sail midsoles, it bridges 1985 heritage with 2026 street style.</p><h2>2. Travis Scott x Air Jordan 1 Low 'Reverse Mocha'</h2><p>The reverse oversized Swoosh, rich nubuck and sail leather overlays, and signature Cactus Jack branding make this low-top one of the most coveted grails on Earth.</p><h2>3. New Balance 9060 'Sea Salt & Rain Cloud'</h2><p>The retro-futuristic Y2K wave perfected. ABZORB cushioning and sculptural exaggerated soles provide supreme all-day comfort for navigating Accra.</p><h2>4. Nike Dunk Low Retro 'Panda'</h2><p>The undisputed everyday uniform shoe. Clean black-and-white leather color blocking pairs with literally any outfit from jeans to sweatpants.</p><h2>5. Asics Gel-Kayano 14 'White & Pure Gold'</h2><p>Metallic tech runner aesthetics at their finest. Lightweight GEL-cushioned tooling meets high-fashion runway crossover appeal.</p>`,
      tags: ["#Sneakers2026", "#Jordan1", "#TravisScott", "#CollectorGrails"]
    },
    {
      id: "blog-5",
      slug: "tropical-sneaker-maintenance-guide",
      title: "Caring for Suede & Vintage Leather: The Tropical Sneaker Maintenance Guide",
      subtitle: "How to Protect Deadstock Footwear in West Africa's Climate",
      author: "Showroom Care Team",
      date: "08 October 2026",
      readTime: "3 min read",
      image: "images/post-5.jpg",
      category: "Care & Maintenance",
      excerpt: "How to preserve deadstock nubuck, suede, and aged leather soles in West Africa's climate and humidity.",
      content: `<p>High humidity, tropical rains, and red Accra dust pose unique challenges for sneaker collectors. Caring for premium footwear in Ghana requires proactive preservation techniques rather than reactive cleaning.</p><h2>1. Hydrophobic Nano-Coating</h2><p>Before wearing any suede or nubuck pair outdoors, apply two light coats of specialized hydrophobic stain repellant spray, allowing 20 minutes between applications.</p><h2>2. Proper Dry Storage with Silica Gel</h2><p>Never store sneakers in plastic bags or unventilated boxes in high heat. Use breathable drop-front sneaker crates paired with silica gel packs to prevent sole yellowing and humidity breakdown.</p><h2>3. Brass Bristle Brush for Suede Nap</h2><p>Never use wet cloths on dirty suede. Always allow mud or dust to dry completely, then gently brush in one direction using a dry crepe or brass suede brush to reset the velvety nap.</p>`,
      tags: ["#SneakerCare", "#ShoeRestoration", "#AccraLiving", "#LeatherProtection"]
    },
    {
      id: "blog-6",
      slug: "dzorwulu-drop-culture",
      title: "Dzorwulu Drop Culture: How Woodpeckers Built Accra's Premier Sneaker Hub",
      subtitle: "The Story Behind 24 Blohum Road and West Africa's Sneaker Renaissance",
      author: "State Street Retail Group",
      date: "01 October 2026",
      readTime: "5 min read",
      image: "images/post-6.jpg",
      category: "Culture",
      excerpt: "Why 24 Blohum Road became the epicenter for authenticated footwear, community link-ups, and weekly reserve drops.",
      content: `<p>When Woodpeckers opened its doors on Blohum Road in Dzorwulu, the goal was not simply to create another clothing store. The vision was to build a physical sanctuary for sneaker culture in West Africa — a place where collectors could discuss release histories, inspect deadstock craftsmanship in person, and feel part of a global movement.</p><p>Today, our Dzorwulu showroom is a bustling hub where creatives, athletes, and sneakerheads gather for weekly Reserve drops, coffee conversations, and exclusive releases.</p><blockquote style="border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;"><p style="font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;">"We didn't just bring grails to Accra. We gave our community a seat at the global sneakerhead table."</p></blockquote>`,
      tags: ["#Dzorwulu", "#AccraCulture", "#Community", "#WoodpeckersDrop"]
    }
  ];

  // Articles Engine
  const Articles = {
    async getAll() {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (e) {}
      return DEFAULT_ARTICLES;
    },
    async getById(id) {
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(id)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
      return DEFAULT_ARTICLES.find(a => a.id === id || a.slug === id) || DEFAULT_ARTICLES[0];
    }
  };

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

  // Auth / Customer Accounts Engine
  const Auth = {
    getCurrentUser() {
      return storage.get(STORAGE_KEYS.USER, null);
    },

    async register(name, email, password, phone = '') {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone })
        });
        if (res.ok) {
          const data = await res.json();
          storage.set(STORAGE_KEYS.USER, data.user);
          return { success: true, user: data.user };
        }
      } catch (e) {}

      // Fallback local registration
      const user = {
        id: 'USR-' + Date.now(),
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        phone: phone || '',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      storage.set(STORAGE_KEYS.USER, user);
      return { success: true, user };
    },

    async login(username, password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (res.ok) {
          const data = await res.json();
          storage.set(STORAGE_KEYS.USER, data.user);
          return { success: true, user: data.user, role: data.role };
        }
      } catch (e) {}

      // Fallback local login
      if (username === 'admin' && password === 'woodpeckers2026') {
        const adminUser = { username: 'admin', name: 'Philip (Store Manager)', role: 'admin' };
        storage.set(STORAGE_KEYS.USER, adminUser);
        return { success: true, user: adminUser, role: 'admin' };
      }

      if (username && password) {
        const user = {
          id: 'USR-LCL',
          name: username.includes('@') ? username.split('@')[0] : username,
          email: username.includes('@') ? username : `${username}@woodpeckers.gh`,
          role: 'customer'
        };
        storage.set(STORAGE_KEYS.USER, user);
        return { success: true, user, role: 'customer' };
      }

      throw new Error('Invalid credentials');
    },

    logout() {
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = 'login.html';
    }
  };

  // Orders Engine
  const Orders = {
    getAll() {
      return storage.get(STORAGE_KEYS.LOCAL_ORDERS, []);
    },

    async getByNumber(orderNumber) {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
        if (res.ok) {
          const data = await res.json();
          return data.order || data;
        }
      } catch (e) {}
      const local = this.getAll();
      return local.find(o => o.orderNumber === orderNumber) || null;
    },

    async create(orderPayload) {
      const orderNumber = 'WPK-ORD-' + Math.floor(1000 + Math.random() * 9000);
      const newOrder = {
        orderNumber,
        ...orderPayload,
        total: orderPayload.items.reduce((s, it) => s + (it.price * it.quantity), 0) + (orderPayload.deliveryFee || 35.0),
        status: 'Processing',
        paymentStatus: 'Paid (Test MoMo / Card)',
        createdAt: new Date().toISOString()
      };

      // Try server sync
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && serverData.order) {
            newOrder.orderNumber = serverData.order.orderNumber;
          }
        }
      } catch (e) {}

      // Save locally
      const list = this.getAll();
      list.unshift(newOrder);
      storage.set(STORAGE_KEYS.LOCAL_ORDERS, list);

      Cart.clear();
      return newOrder;
    },

    updateStatus(orderNumber, newStatus) {
      const list = this.getAll();
      const order = list.find(o => o.orderNumber === orderNumber);
      if (order) {
        order.status = newStatus;
        storage.set(STORAGE_KEYS.LOCAL_ORDERS, list);
      }
      return order;
    }
  };

  // Meet the Reserve Engine
  const ReserveEngine = {
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
        }
      } catch (err) {}

      // Fallback local evaluation
      const ref = 'WPK-RSV-' + Math.floor(1000 + Math.random() * 9000);
      const amount = parseFloat(offerData.offerAmount);
      const retail = parseFloat(offerData.retailPrice || 3500);
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

      // Save to localStorage
      const allOffers = storage.get(STORAGE_KEYS.LOCAL_OFFERS, []);
      allOffers.unshift(localOffer);
      storage.set(STORAGE_KEYS.LOCAL_OFFERS, allOffers);
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
    },

    async getOffer(reference) {
      try {
        const res = await fetch(`/api/reserve/offers/${encodeURIComponent(reference.trim())}`);
        if (res.ok) {
          const data = await res.json();
          return data.offer || data;
        }
      } catch (err) {}

      const allOffers = storage.get(STORAGE_KEYS.LOCAL_OFFERS, []);
      return allOffers.find(o => o.reference === reference) || null;
    },

    getAllOffers() {
      return storage.get(STORAGE_KEYS.LOCAL_OFFERS, []);
    },

    async actOnOffer(reference, action, extra = {}) {
      try {
        const res = await fetch(`/api/reserve/offers/${encodeURIComponent(reference)}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...extra })
        });
        if (res.ok) return await res.json();
      } catch (e) {}

      // Update in localStorage
      const allOffers = storage.get(STORAGE_KEYS.LOCAL_OFFERS, []);
      const offer = allOffers.find(o => o.reference === reference);
      if (offer) {
        if (action === 'customer_accept_counter') {
          offer.status = 'accepted';
          offer.offerAmount = offer.counterAmount;
        } else if (action === 'customer_decline_counter') {
          offer.status = 'rejected';
        } else if (action === 'accept') {
          offer.status = 'accepted';
        } else if (action === 'counteroffer') {
          offer.status = 'counteroffered';
          offer.counterAmount = extra.counterAmount;
        } else if (action === 'reject') {
          offer.status = 'rejected';
        }
        storage.set(STORAGE_KEYS.LOCAL_OFFERS, allOffers);
      }
      return { success: true, offer };
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

  // Wishlist Engine
  const Wishlist = {
    getItems() {
      return storage.get(STORAGE_KEYS.WISHLIST, [
        DEFAULT_PRODUCTS[0],
        DEFAULT_PRODUCTS[1],
        DEFAULT_PRODUCTS[2]
      ]);
    },

    add(product) {
      const items = this.getItems();
      if (!items.some(p => p.id === product.id)) {
        items.push(product);
        storage.set(STORAGE_KEYS.WISHLIST, items);
        showToast(`${product.name} saved to your wishlist!`, 'success');
      }
    },

    remove(productId) {
      const items = this.getItems().filter(p => p.id !== productId);
      storage.set(STORAGE_KEYS.WISHLIST, items);
      showToast('Item removed from wishlist', 'info');
      return items;
    },

    toggle(product) {
      const items = this.getItems();
      if (items.some(p => p.id === product.id)) {
        this.remove(product.id);
      } else {
        this.add(product);
      }
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

    // Dismiss preloader safely
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.style.transition = 'opacity 0.4s ease';
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 400);
      }, 300);
    }

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
          Products.getById(productId).then(p => {
            if (p) openOfferModal(p, size);
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
          Products.getById(productId).then(p => {
            if (p) Cart.addItem(p, size, qty);
          });
        }
      }
    });
  });

  // Export to global scope
  window.Woodpeckers = {
    Cart,
    Products,
    Articles,
    Orders,
    ReserveEngine,
    Auth,
    Wishlist,
    DEFAULT_PRODUCTS,
    DEFAULT_ARTICLES,
    BLOG_POSTS: DEFAULT_ARTICLES,
    formatGHS,
    showToast,
    openOfferModal,
    openOfferResultModal
  };

})(window, document);
