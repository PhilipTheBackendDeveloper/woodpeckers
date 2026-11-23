import re

with open("index.html", "r", encoding="utf-8") as fp:
    html = fp.read()

# 1. Update Hero section
old_hero_content = re.compile(
    r'<div class="hero-content">.*?<div class="section-title">.*?<span class="section-sub-title wow fadeInUp">.*?</span>.*?<h1 class="text-anime-style-2" data-cursor="-opaque">.*?</h1>.*?<p class="wow fadeInUp" data-wow-delay="0.2s">.*?</p>.*?</div>.*?<div class="hero-content-btn wow fadeInUp" data-wow-delay="0.4s">.*?<a href="products.html" class="btn-default">.*?</a>.*?</div>.*?</div>',
    re.DOTALL
)

new_hero_content = """<div class="hero-content">
                        <!-- Section Title Start -->
                        <div class="section-title">
                            <span class="section-sub-title wow fadeInUp" style="color:#B98F6A;letter-spacing:2px;font-weight:800;">Affordable Luxury &bull; Bold &bull; Innovative</span>
                            <h1 class="text-anime-style-2" data-cursor="-opaque">Exclusive <span>Sneakers &amp; Streetwear</span></h1>
                            <p class="wow fadeInUp" data-wow-delay="0.2s">Ghana's premier destination for authenticated grail sneakers, collectible drops, and contemporary streetwear. Dzorwulu Showroom, Accra.</p>
                        </div>
                        <!-- Section Title End -->

                        <!-- Hero Content Button Start -->
                        <div class="hero-content-btn wow fadeInUp" data-wow-delay="0.4s" style="display:flex;gap:12px;flex-wrap:wrap;">
                            <a href="products.html" class="btn-default">Explore Catalogue</a>
                            <a href="reserve.html" class="btn-default btn-accent" style="background:#B98F6A;border-color:#B98F6A;color:#111;font-weight:800;"><i class="fa-solid fa-gavel me-1"></i> Meet The Reserve</a>
                        </div>
                        <!-- Hero Content Button End -->
                    </div>"""

html = old_hero_content.sub(new_hero_content, html, count=1)

# 2. Update Hero Offer Tag Box
old_hero_tag = re.compile(
    r'<div class="hero-offer-tag">.*?<h2>.*?</h2>.*?<h3>.*?</h3>.*?<p>.*?</p>.*?</div>',
    re.DOTALL
)
new_hero_tag = """<div class="hero-offer-tag" style="background:#111;border:2px solid #B98F6A;box-shadow:0 15px 35px rgba(0,0,0,0.5);">
                            <h2 style="font-size:22px;color:#B98F6A;font-weight:900;">NAME</h2>
                            <h3 style="color:#fff;font-size:14px;letter-spacing:1px;">YOUR PRICE</h3>
                            <p style="color:#ddd;font-weight:700;">Meet The Reserve</p>
                        </div>"""

html = old_hero_tag.sub(new_hero_tag, html, count=1)

# 3. Insert Meet the Reserve highlight section right above Intro Video section
reserve_section_html = """
    <!-- Meet The Reserve Home Feature Section Start -->
    <div class="meet-the-reserve-home" style="background:#111;color:#fff;padding:80px 0;border-top:1px solid #222;border-bottom:1px solid #222;">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 mb-4 mb-lg-0">
                    <span style="background:rgba(185,143,106,0.15);border:1px solid #B98F6A;color:#B98F6A;padding:4px 12px;border-radius:50px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;display:inline-block;margin-bottom:14px;">
                        🔥 Signature Digital Commerce Experience
                    </span>
                    <h2 style="font-size:clamp(28px, 4vw, 42px);font-weight:900;line-height:1.15;margin-bottom:16px;">
                        NAME YOUR PRICE.<br><span style="color:#B98F6A;">MEET THE RESERVE.</span>
                    </h2>
                    <p style="font-size:15px;color:#bbb;line-height:1.6;margin-bottom:24px;">
                        Experience Ghana's premier interactive sneaker negotiation platform. Pick your grail from our curated reserve vault, select your size, and name the price you want to pay. When your offer meets our reserve floor, the deal is yours.
                    </p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <a href="reserve.html" class="btn-default btn-accent" style="background:#B98F6A;border-color:#B98F6A;color:#111;font-weight:800;padding:12px 26px;">
                            <i class="fa-solid fa-gavel me-2"></i> Enter Reserve Vault
                        </a>
                        <a href="reserve.html#offer-tracker" class="btn btn-outline-light" style="padding:12px 24px;font-weight:700;border-color:#444;">
                            <i class="fa-solid fa-magnifying-glass me-2"></i> Track Offer
                        </a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div style="background:#181818;border:1px solid #282828;border-radius:8px;padding:24px;box-shadow:0 15px 35px rgba(0,0,0,0.4);">
                        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a2a2a;padding-bottom:12px;margin-bottom:16px;">
                            <span style="color:#B98F6A;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Active Reserve Highlight</span>
                            <span class="badge bg-success" style="font-size:11px;">Verified Authentic</span>
                        </div>
                        <div style="display:flex;gap:16px;align-items:center;">
                            <img src="images/product-image-1.jpg" alt="Air Jordan 1" style="width:110px;height:110px;object-fit:contain;background:#202020;border-radius:6px;padding:8px;">
                            <div>
                                <h4 style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px;">Air Jordan 1 Retro High OG 'Chicago'</h4>
                                <div style="font-size:12px;color:#888;margin-bottom:6px;">Retail Price: <del>GH₵ 4,200.00</del></div>
                                <div style="font-size:14px;color:#fff;">Target Reserve: <strong style="color:#B98F6A;">~GH₵ 3,200.00</strong></div>
                            </div>
                        </div>
                        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:12px;color:#999;"><i class="fa-solid fa-shield-halved me-1 text-warning"></i> 48-Hour Private Checkout Window</span>
                            <a href="reserve.html?offer=SNK-001" class="btn btn-sm btn-outline-warning" style="border-color:#B98F6A;color:#B98F6A;font-weight:700;">
                                Make Offer &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Meet The Reserve Home Feature Section End -->
"""

if "meet-the-reserve-home" not in html:
    html = html.replace('<div class="intro-video parallaxie">', reserve_section_html + '\n    <div class="intro-video parallaxie">')

# 4. Update Product Titles and Prices on Homepage
product_replacements = [
    ("Floral Print Casual Sneakers", "Air Jordan 1 Retro High OG 'Chicago Lost & Found'"),
    ("Beige Comfort Slide Sandals", "Travis Scott x Air Jordan 1 Low 'Reverse Mocha'"),
    ("Performance Running Shoes", "Nike Dunk Low Retro 'Panda'"),
    ("Urban Street Sneakers", "New Balance 9060 'Sea Salt & Rain Cloud'"),
]
for old_name, new_name in product_replacements:
    html = html.replace(old_name, new_name)

with open("index.html", "w", encoding="utf-8") as fp:
    fp.write(html)

print("Homepage enhanced successfully.")
