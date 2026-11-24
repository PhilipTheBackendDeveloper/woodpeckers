import json

with open('data/store.json', 'r') as f:
    data = json.load(f)

articles = [
  {
    "id": "blog-1",
    "slug": "meet-the-reserve-art-of-naming-price",
    "title": "Meet the Reserve: The Art of Naming Your Price on Limited Grails",
    "subtitle": "The Movement Redefining Sneaker Retail in Accra",
    "author": "Woodpeckers Editorial • Dzorwulu",
    "date": "24 October 2026",
    "readTime": "4 min read",
    "image": "images/featured-collection-image-1.jpg",
    "category": "Culture & Grails",
    "excerpt": "Discover how Woodpeckers Ghana disrupted traditional retail by introducing Accra's first interactive deadstock bidding format.",
    "content": "<p>For decades, sneaker commerce in West Africa has been governed by rigid retail pricing, uncertain imported deadstock conditions, and unpredictable markups on limited-edition releases. In October 2026, Woodpeckers Ghana decided to disrupt the paradigm by introducing an unprecedented retail format: <strong>Meet the Reserve</strong>.</p><p>Operating from our flagship showroom at 24 Blohum Road in Dzorwulu, Accra, the campaign invites sneakerheads, streetwear creators, and collectors to do something once considered unthinkable in luxury retail — name their own price on coveted grails, from Air Jordan 1 'Chicago Lost & Found' to Travis Scott reverse mochas and New Balance 9060s.</p><blockquote style='border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;'><p style='font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;'>\"Retail should be more than a transaction. It should be an experience. We want customers to come into our store not simply to purchase merchandise, but to discover, participate and enjoy something different. Meet the Reserve gives them that opportunity.\"</p><span style='font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#008751;font-weight:800;'>— Management, State Street Retail Group (Woodpeckers Ghana)</span></blockquote><h2>How the Reserve Mechanism Actually Works</h2><p>Unlike traditional discount bins or clearance sales, Meet the Reserve introduces genuine strategic anticipation and valuation into every drop:</p><ul><li><strong>Undisclosed Reserves:</strong> Selected pairs carry an undisclosed minimum acceptable floor price based on international deadstock acquisition.</li><li><strong>Shopper Makes an Offer:</strong> Shoppers submit what they believe the pair is worth — digitally on our web terminal or in person at Dzorwulu.</li><li><strong>Instant Feedback & Counteroffers:</strong> If an offer meets or exceeds the reserve, the deal is locked immediately. Competitive offers receive fair counteroffers.</li><li><strong>Weekly Curated Drops:</strong> Fresh hype grails rotate into the Reserve every Thursday, Friday, and Saturday.</li></ul><h2>100% Deadstock • Zero Compromise Authentication</h2><p>Every pair eligible for Meet the Reserve is rigorously verified at 24 Blohum Road. We verify blacklight glow, leather density, box typography, and insole glue to ensure complete authenticity.</p>",
    "tags": ["#MeetTheReserve", "#GrailSneakers", "#WoodpeckersAccra", "#AccraStreetwear"]
  },
  {
    "id": "blog-2",
    "slug": "deadstock-authentication-process",
    "title": "100% Deadstock: Inside Our Multi-Point Sneaker Authentication Process",
    "subtitle": "How Woodpeckers Guarantees Zero Replicas in West Africa",
    "author": "Kojo Frimpong • Head of Authentication",
    "date": "20 October 2026",
    "readTime": "5 min read",
    "image": "images/post-1.jpg",
    "category": "Authentication",
    "excerpt": "From UV blacklight stitching checks to midsole density and factory scents: inside our 12-point authentication protocol.",
    "content": "<p>In a marketplace flooded with high-tier unauthorized replicas and grey-market counterfeits, sneaker collectors in Ghana need absolute certainty when investing in four-figure grails. At Woodpeckers, authenticity is not a marketing buzzword — it is our operational foundation.</p><p>Every sneaker entering our Dzorwulu showroom undergoes our strict 12-point physical authentication protocol before it ever reaches the shelf or the online Reserve inventory.</p><h2>The 12-Point Authentication Protocol</h2><ul><li><strong>Box Label & Typography:</strong> Font kerning, UPC barcode resolution, and thermal label adhesive verification.</li><li><strong>UV Blacklight Luminescence:</strong> Examination of hidden factory stamping, glue bleeding along the midsole, and stitch glow characteristics.</li><li><strong>Leather Grain & Scent:</strong> Authentic deadstock pairs from Jordan Brand and Nike carry distinct vegetable-tanned leather aromas and natural pebble texture.</li><li><strong>Insole Stitching & Footbed Glue:</strong> Factory strobel stitching density, thread tension, and glue swirl patterns beneath the removable insoles.</li><li><strong>Weight & Outsole Rigidity:</strong> Gram-accurate weight comparison against certified retail reference pairs in our archive.</li></ul><blockquote style='border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;'><p style='font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;'>\"If there is even a 0.1% doubt on a pair's provenance, it does not enter our store. Period. Our customers trust us with their biggest sneaker grails.\"</p><span style='font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#008751;font-weight:800;'>— Kojo Frimpong, Lead Sneaker Curator</span></blockquote>",
    "tags": ["#Authentication", "#DeadstockVerified", "#SneakerSafety", "#AccraGrails"]
  },
  {
    "id": "blog-3",
    "slug": "accra-streetwear-lookbook-2026",
    "title": "Street is a State of Mind: The Accra Streetwear Lookbook",
    "subtitle": "Heavyweight Cotton, Tactical Cuts, and Tropical Aesthetics",
    "author": "Nana Yaw Boateng • Fashion Stylist",
    "date": "16 October 2026",
    "readTime": "6 min read",
    "image": "images/post-2.jpg",
    "category": "Streetwear & Styling",
    "excerpt": "Inside the Woodpeckers 2026 Lookbook: pairing boxy heavyweight tees with tactical cargo pants and rare retro kicks across Accra.",
    "content": "<p>Streetwear in Accra has evolved beyond borrowed Western aesthetics into a vibrant, distinct cultural statement. Between the humid coastal air and the buzzing energy of Osu, Airport Residential, and East Legon, the modern Ghanaian streetwear uniform balances heavy fabric durability with breathable, relaxed proportions.</p><p>For our 2026 Lookbook, Woodpeckers curated a monochromatic yet functional collection featuring custom-milled 280 GSM heavyweight cotton tees, ripstop utility cargo pants, and structured boxy hoodies.</p><h2>The Three Pillars of Modern Accra Streetwear</h2><ul><li><strong>1. Proportional Contrast:</strong> Pair wide-leg utility cargo pants with clean, boxy tees that fall slightly below the waistline without bunching.</li><li><strong>2. Heat-Ready Durability:</strong> Heavyweight combed cotton absorbs moisture while retaining its architectural silhouette through repeated daily wear.</li><li><strong>3. Footwear Anchor:</strong> Grounding neutral earthy streetwear tones (Ivory, Obsidian, Olive) with bold grail kicks like the Air Jordan 1 Chicago Lost & Found or Travis Scott Reverse Mocha.</li></ul><blockquote style='border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;'><p style='font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;'>\"Streetwear isn't about wearing a loud logo. It's about knowing how the fabric falls on your silhouette and how your footwear anchors the whole story.\"</p><span style='font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#008751;font-weight:800;'>— Nana Yaw Boateng, Fashion Stylist • Osu</span></blockquote>",
    "tags": ["#AccraStreetwear", "#StreetMindset", "#HeavyweightCotton", "#CargoPants"]
  },
  {
    "id": "blog-4",
    "slug": "top-5-grail-colorways-2026",
    "title": "Top 5 Grail Colorways Every Sneakerhead Needs in 2026",
    "subtitle": "The Silhouettes Defining Contemporary Sneaker Culture",
    "author": "Woodpeckers Curators",
    "date": "12 October 2026",
    "readTime": "4 min read",
    "image": "images/post-4.jpg",
    "category": "Sneaker Heat",
    "excerpt": "From the Air Jordan 1 Lost & Found to Travis Scott Reverse Mocha: the most iconic kicks holding immense cultural and collector value.",
    "content": "<p>Sneaker trends come and go, but true grails transcend release cycles. Whether you are building a foundational five-pair sneaker rotation or searching for the centerpiece of your collection, these five silhouettes represent the peak of craftsmanship, cultural relevance, and collector value in 2026.</p><h2>1. Air Jordan 1 Retro High OG 'Chicago Lost & Found'</h2><p>The definitive basketball sneaker silhouette. With vintage cracked leather collars and aged sail midsoles, it bridges 1985 heritage with 2026 street style.</p><h2>2. Travis Scott x Air Jordan 1 Low 'Reverse Mocha'</h2><p>The reverse oversized Swoosh, rich nubuck and sail leather overlays, and signature Cactus Jack branding make this low-top one of the most coveted grails on Earth.</p><h2>3. New Balance 9060 'Sea Salt & Rain Cloud'</h2><p>The retro-futuristic Y2K wave perfected. ABZORB cushioning and sculptural exaggerated soles provide supreme all-day comfort for navigating Accra.</p><h2>4. Nike Dunk Low Retro 'Panda'</h2><p>The undisputed everyday uniform shoe. Clean black-and-white leather color blocking pairs with literally any outfit from jeans to sweatpants.</p><h2>5. Asics Gel-Kayano 14 'White & Pure Gold'</h2><p>Metallic tech runner aesthetics at their finest. Lightweight GEL-cushioned tooling meets high-fashion runway crossover appeal.</p>",
    "tags": ["#Sneakers2026", "#Jordan1", "#TravisScott", "#CollectorGrails"]
  },
  {
    "id": "blog-5",
    "slug": "tropical-sneaker-maintenance-guide",
    "title": "Caring for Suede & Vintage Leather: The Tropical Sneaker Maintenance Guide",
    "subtitle": "How to Protect Deadstock Footwear in West Africa's Climate",
    "author": "Showroom Care Team",
    "date": "08 October 2026",
    "readTime": "3 min read",
    "image": "images/post-5.jpg",
    "category": "Care & Maintenance",
    "excerpt": "How to preserve deadstock nubuck, suede, and aged leather soles in West Africa's climate and humidity.",
    "content": "<p>High humidity, tropical rains, and red Accra dust pose unique challenges for sneaker collectors. Caring for premium footwear in Ghana requires proactive preservation techniques rather than reactive cleaning.</p><h2>1. Hydrophobic Nano-Coating</h2><p>Before wearing any suede or nubuck pair outdoors, apply two light coats of specialized hydrophobic stain repellant spray, allowing 20 minutes between applications.</p><h2>2. Proper Dry Storage with Silica Gel</h2><p>Never store sneakers in plastic bags or unventilated boxes in high heat. Use breathable drop-front sneaker crates paired with silica gel packs to prevent sole yellowing and humidity breakdown.</p><h2>3. Brass Bristle Brush for Suede Nap</h2><p>Never use wet cloths on dirty suede. Always allow mud or dust to dry completely, then gently brush in one direction using a dry crepe or brass suede brush to reset the velvety nap.</p>",
    "tags": ["#SneakerCare", "#ShoeRestoration", "#AccraLiving", "#LeatherProtection"]
  },
  {
    "id": "blog-6",
    "slug": "dzorwulu-drop-culture",
    "title": "Dzorwulu Drop Culture: How Woodpeckers Built Accra's Premier Sneaker Hub",
    "subtitle": "The Story Behind 24 Blohum Road and West Africa's Sneaker Renaissance",
    "author": "State Street Retail Group",
    "date": "01 October 2026",
    "readTime": "5 min read",
    "image": "images/post-6.jpg",
    "category": "Culture",
    "excerpt": "Why 24 Blohum Road became the epicenter for authenticated footwear, community link-ups, and weekly reserve drops.",
    "content": "<p>When Woodpeckers opened its doors on Blohum Road in Dzorwulu, the goal was not simply to create another clothing store. The vision was to build a physical sanctuary for sneaker culture in West Africa — a place where collectors could discuss release histories, inspect deadstock craftsmanship in person, and feel part of a global movement.</p><p>Today, our Dzorwulu showroom is a bustling hub where creatives, athletes, and sneakerheads gather for weekly Reserve drops, coffee conversations, and exclusive releases.</p><blockquote style='border-left:4px solid #008751;background:#f8f9fa;padding:24px 30px;margin:30px 0;'><p style='font-size:19px;font-style:italic;color:#111;font-weight:700;line-height:1.6;'>\"We didn't just bring grails to Accra. We gave our community a seat at the global sneakerhead table.\"</p></blockquote>",
    "tags": ["#Dzorwulu", "#AccraCulture", "#Community", "#WoodpeckersDrop"]
  }
]

data['articles'] = articles

with open('data/store.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Added {len(articles)} articles to data/store.json successfully.")
