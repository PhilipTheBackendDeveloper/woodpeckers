# WOODPECKERS SNEAKERS & STREETWEAR — GHANA
## Premium Digital Commerce Platform & "Meet the Reserve" Engine

> **Brand Identity:** "Affordable Luxury, Bold & Innovative"  
> **Showroom Location:** 24 Blohum Road, Dzorwulu, Accra, Ghana  
> **Prepared for:** Philip Odame Ayesu for client presentation to Woodpeckers Ghana (`@woodpeckers_gh`)  
> **Stack:** Zero-Dependency Node.js Server &bull; RESTful API &bull; Dynamic JavaScript Client &bull; Bootstrap 5 &bull; JSON Document Persistence  

---

## 1. Project Overview

**Woodpeckers** is Ghana's premier destination for exclusive authenticated sneakers, collectible grails, and luxury streetwear. 

This platform transforms Woodpeckers' viral social media campaign—**"Meet the Reserve"**—from manual, high-friction Instagram Direct Message (DM) chats into a **fully automated, high-conversion digital commerce engine**. Customers can discover verified deadstock sneakers, name their price, track offers in real time, and seamlessly check out via Ghana Mobile Money (MTN MoMo, Telecel Cash) or card.

Meanwhile, Woodpeckers' management gains an **Operations Console** (`/admin.html`) to review incoming bids, issue real-time counteroffers, track inventory across sizes, fulfill orders, and monitor sales metrics.

---

## 2. Key Capabilities & Features

### 💎 A. International Luxury Brand Elevation
- **Visual Identity:** Sleek dark editorial palette (`#0E0E0E`), camel gold metallic accents (`#B98F6A`), and authentic SVG branding (`images/logo.svg`, `images/logo-white.svg`).
- **Ghanaian Commerce Context:** Native Ghana Cedi currency formatting (`GH₵`), local Accra Metro / nationwide delivery tiers, local phone formatting (+233), and mobile money integrations.
- **Editorial Copy:** Replaced generic template shoe references with authentic sneakerhead terminology (Deadstock, Grails, Colorways, Cracked Leather Collars, High OG, Cactus Jack).

### 🔥 B. Signature "Meet the Reserve" Digital Engine
1. **Curated Reserve Vault:** Filterable showcase of eligible grails (Air Jordan 1 Lost & Found, Travis Scott Reverse Mocha, Nike Dunk Panda, New Balance 9060, Yeezy Boost 350).
2. **Interactive Bidding Modal:** Customers pick their size, input their offer in `GH₵`, provide contact details, and add optional negotiation notes.
3. **Transparent Audit Trail:** Every offer receives a unique reference (e.g. `WPK-RSV-94921`) and maintains an immutable timeline of status updates, actor actions, and timestamps.
4. **Automated & Manual Review Modes:**
   - **Manual Review:** Staff can accept, counteroffer, or decline bids from the Admin Console.
   - **Configurable Auto-Evaluation:** Offers meeting threshold percentages can auto-accept or trigger automated counteroffers with clear demonstration notices.
5. **Private Checkout Unlock:** When an offer is accepted (or a counteroffer is accepted by the customer), the negotiated price is locked into the session, allowing instant checkout with zero pricing tampering.

### 🛒 C. Full-Stack Commerce Experience
- **Dynamic Catalogue:** Real-time retrieval of products from `/api/products` on the homepage (`index.html`) and shop (`products.html`).
- **Product Single Page (`product-single.html`):** Dynamic size selector with real-time stock verification, quantity stepper, deadstock authentication badge, and dedicated "Name Your Price" trigger card.
- **Live Shopping Bag (`cart.html`):** Real-time subtotal calculations, size tagging, item removal, and empty state CTA.
- **Express Ghana Checkout (`checkout.html`):** Greater Accra / Ashanti region selectors, Accra Metro delivery, Showroom pickup (Dzorwulu), and MTN MoMo / Telecel Cash / Paystack card selectors.
- **Order Receipt (`order-received.html`):** Generates live order numbers (`WPK-ORD-...`), inventory decrements, and receipts.

### 🛡️ D. Staff Operations Console (`admin.html`)
- **Real-Time KPIs:** Total Sales, Active Orders, Pending Offers, Accepted Bids, Low Stock alerts.
- **Reserve Offer Center:** Live table of incoming bids, status filtering, one-click Accept, Counteroffer dialog with custom amount, Reject, and internal staff notes.
- **Order Fulfilment:** Update order status from `Processing` to `Dispatched` or `Delivered`.
- **Inventory Manager:** Live stock counts per size for every sneaker and streetwear piece with instant adjustment.
- **Store Configuration:** Toggle auto-evaluation rules, counter ratios, and demonstration notices.

---

## 3. Architecture & Tech Stack

```
woodpecker/
├── server.js                     # Zero-dependency Node.js REST API & static file server
├── data/
│   └── store.json                # Single source of truth (products, offers, orders, settings, auth)
├── js/
│   ├── woodpeckers-commerce.js    # Core client SDK (Cart state, ReserveEngine, Modal, Toast)
│   ├── storefront-app.js         # Page hydrator (Index, Shop, Product Single, Cart, Checkout)
│   └── custom.js                 # Template UI interactions (Swiper, animations)
├── css/
│   ├── custom.css                # Base styling and luxury overrides
│   └── bootstrap.min.css         # Bootstrap 5 grid & utilities
├── images/
│   ├── logo.svg                  # Dark-mode Woodpeckers logo with camel gold crest
│   ├── logo-white.svg            # White luxury emblem logo for dark sections
│   └── product-*.jpg             # Curated sneaker & streetwear imagery
├── test/
│   └── suite.js                  # Automated 26-test verification suite (API & Server)
├── index.html                    # Luxury Storefront Homepage
├── reserve.html                  # Dedicated Meet the Reserve Portal & Offer Tracker
├── products.html                 # Complete Sneaker & Streetwear Catalogue
├── product-single.html           # Product Detail & Offer Trigger Page
├── cart.html                     # Dynamic Shopping Cart
├── checkout.html                 # Ghana Delivery & Mobile Money Checkout
├── order-received.html           # Order Confirmation & Receipt
├── admin.html                    # Staff Operations Console & Reserve Dashboard
└── package.json                  # NPM scripts & project configuration
```

---

## 4. Quick Start & Local Run

### Prerequisites
- Node.js version 18.x or later installed on your system.

### Launch Server
```bash
# Start the production server
npm start
# Alternatively:
node server.js
```

The server will initialize on port 3000:
- **Homepage:** [http://localhost:3000/](http://localhost:3000/)
- **Meet The Reserve:** [http://localhost:3000/reserve.html](http://localhost:3000/reserve.html)
- **Shop Catalogue:** [http://localhost:3000/products.html](http://localhost:3000/products.html)
- **Staff Operations Admin:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### Run Test Suite
```bash
npm test
# Alternatively:
node test/suite.js
```
*Current status: 26 passed, 0 failed.*

---

## 5. Staff Credentials (Demonstration)

To log into the Staff Operations Console (`/admin.html`):
- **Username:** `admin`
- **Password:** `woodpeckers2026`

---

## 6. Client Pitch Strategy: Presenting to Woodpeckers Ghana

When Philip presents this platform to the owner/manager of Woodpeckers Ghana, follow this structured 6-step walkthrough to turn a speculative prototype into a high-value client win.

### 🎯 Step 1: Validate Their Vision (The Compliment)
> *"We noticed your Instagram content around 'Meet the Reserve' and the incredible engagement it gets (over 10,000 views on your in-store Reels). Your customers love the thrill of naming their price, but handling offers manually in Instagram DMs is losing you money, taking up staff time, and letting leads go cold while you're asleep."*

### 👟 Step 2: Show the Elevated Brand Experience
- Open `http://localhost:3000/`
- Highlight the international luxury aesthetic: Dzorwulu showroom credentials, Ghana Cedi pricing, and high-end sneaker photography.
- Scroll down to the dedicated **"NAME YOUR PRICE. MEET THE RESERVE."** hero feature section on the homepage.

### 🔥 Step 3: Demonstrate the Customer Journey (Live Offer)
1. Navigate to **Meet The Reserve** (`reserve.html`).
2. Show the "How It Works" 4-step guide that explains the rules clearly.
3. Click **"Make An Offer"** on the *Air Jordan 1 High OG 'Chicago'* (Size UK 8, retail GH₵ 3,850).
4. Enter an offer: e.g. **GH₵ 3,400**.
5. Submit the offer and show the instant confirmation toast and **Offer Reference** (e.g. `WPK-RSV-XXXXX`).
6. Paste the reference into the **Live Offer Tracker** box to show the real-time history trail.

### ⚡ Step 4: Open the Staff Operations Console (The Game Changer)
1. Open a second browser tab to `http://localhost:3000/admin.html`.
2. Show the **KPI Dashboard**: Real-time sales, active bids, and low-stock alerts.
3. Switch to the **Meet The Reserve** tab:
   - Point out the newly submitted offer from Step 3 appearing at the top of the queue.
   - Click **"Counteroffer"** and propose **GH₵ 3,500** with note: *"Special weekend showroom price"*.
4. Switch back to the customer tab and refresh tracker:
   - The customer immediately sees the counteroffer of GH₵ 3,500!
   - The customer clicks **"Accept Counteroffer"**.

### 💳 Step 5: The Locked Checkout & Inventory Protection
1. Click **"Proceed to Checkout at GH₵ 3,500"**.
2. Notice how the negotiated price is automatically locked into the checkout table with the reserve reference attached.
3. Fill in the Accra delivery details, select **MTN Mobile Money**, and click **Place Order**.
4. Show the instant receipt on `order-received.html`.
5. Switch back to `admin.html` and show:
   - The order is logged under **Orders & Fulfilment**.
   - The UK 8 stock for Jordan 1 was **automatically decremented by 1**.
   - The reserve offer status changed from `accepted` to `completed`.

### 💼 Step 6: The Closing Commercial Pitch
> *"Right now, an Instagram DM negotiation can take 3 hours of back-and-forth messaging, and if the customer gets distracted, the sale is lost. With this digital platform, you capture the customer's email and phone immediately, negotiate or auto-accept in seconds, lock in payment via MTN MoMo or card, and automatically manage your inventory without ever losing a customer to slow replies."*

---

## 7. Commercial Safeguards & Disclaimer
- **Demonstration Data:** All current prices, inventory counts, and reserve floors are demonstration samples designed to illustrate system capabilities.
- **Configurable Rules:** Reserve evaluation rules can be tailored to Woodpeckers' exact margins (fixed floor, percentage discount, or 100% manual review).
- **Production Readiness:** The backend is ready to be deployed to any Node.js hosting platform (VPS, DigitalOcean, Heroku, AWS, or GCP) or connected to PostgreSQL/MongoDB and the Paystack Ghana live payment gateway.
