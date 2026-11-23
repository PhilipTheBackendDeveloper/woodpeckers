import re
import glob

new_video_section = """    <!-- Intro Video Section Start -->
    <div class="intro-video" style="position:relative;background:#0d0d0d;padding:100px 0;overflow:hidden;border-top:1px solid #1f1f1f;border-bottom:1px solid #1f1f1f;">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at center, rgba(0,135,81,0.25) 0%, rgba(10,10,10,0.85) 60%, #0a0a0a 100%), url('images/hero-bg-image.jpg') center/cover no-repeat;filter:brightness(0.65);pointer-events:none;"></div>
        
        <div class="container" style="position:relative;z-index:2;">
            <div class="row justify-content-center text-center">
                <div class="col-lg-9 col-md-11">
                    <div class="wow fadeInUp">
                        <span style="background:rgba(0,135,81,0.2);border:1px solid #008751;color:#00D084;padding:6px 18px;border-radius:50px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;display:inline-block;margin-bottom:20px;">
                            🔥 THE WOODPECKERS EXPERIENCE &bull; IN-STORE &amp; ONLINE
                        </span>
                        <h2 style="font-size:clamp(30px, 4.5vw, 52px);font-weight:900;color:#fff;line-height:1.15;margin-bottom:18px;text-transform:uppercase;letter-spacing:1px;">
                            "STREET IS A STATE OF MIND.<br><span style="color:#008751;">WEAR THE MINDSET."</span>
                        </h2>
                        <p style="font-size:16px;color:#ccc;max-width:720px;margin:0 auto 35px;line-height:1.65;">
                            Watch how Accra's premier sneaker boutique is changing the game. Name your price on exclusive verified deadstock drops every Thursday, Friday, and Saturday at our 24 Blohum Road showroom in Dzorwulu.
                        </p>

                        <!-- Video Play Button -->
                        <div class="mb-3" style="display:flex;justify-content:center;align-items:center;">
                            <a href="https://www.youtube.com/watch?v=3Zlx_V4z1sU" class="popup-video" style="display:inline-flex;align-items:center;justify-content:center;width:84px;height:84px;background:#008751;color:#fff;border-radius:50%;box-shadow:0 0 0 14px rgba(0,135,81,0.25);transition:all 0.3s ease;text-decoration:none;" title="Play Woodpeckers Promo Reel">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style="margin-left:4px;">
                                    <polygon points="5,3 21,12 5,21"/>
                                </svg>
                            </a>
                        </div>
                        <div style="font-size:13px;color:#aaa;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin-bottom:28px;">
                            Click To Watch Campaign Video
                        </div>

                        <!-- CTA Links -->
                        <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
                            <a href="reserve.html" class="btn btn-primary" style="background:#008751;border-color:#008751;color:#fff;font-weight:800;padding:13px 30px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;">
                                🔥 Enter Meet The Reserve
                            </a>
                            <a href="contact.html" class="btn btn-outline-light" style="font-weight:700;padding:13px 28px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;">
                                📍 Dzorwulu Showroom Info
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Intro Video Section End -->"""

blog_replacements = [
    ("Walking Shoes That Deliver Ultimate Everyday Comfort", "Meet the Reserve: The Art of Naming Your Price on Limited Grails"),
    ("Office Footwear Styles For Professional Everyday Wear", "100% Deadstock: Inside Our Multi-Point Sneaker Authentication Process"),
    ("Step Into Style With Trending Footwear Collections", "Street is a State of Mind: The Accra Streetwear Lookbook"),
    ("Your Ultimate Guide To Modern Footwear And Fashion", "Top 5 Grail Colorways Every Sneakerhead Needs in 2026"),
]

# Update index.html and index-2.html
for fpath in ['index.html', 'index-2.html']:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace intro-video section
    content = re.sub(
        r'<!-- Intro Video Section Start -->.*?<!-- Intro Video Section End -->',
        new_video_section,
        content,
        flags=re.DOTALL
    )

    # Replace blog titles
    for old_title, new_title in blog_replacements:
        content = content.replace(old_title, new_title)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated video & blog in {fpath}")

# Update blog.html and blog-single.html
for fpath in ['blog.html', 'blog-single.html']:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    for old_title, new_title in blog_replacements:
        content = content.replace(old_title, new_title)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated blog titles in {fpath}")

# Update footer contact icons in all HTML files
footer_old_loc = re.compile(r'<i class="fa-solid fa-location-dot[^"]*"[^>]*></i>\s*24 Blohum Road', re.DOTALL)
footer_new_loc = '<img src="images/icon-location-white.svg" alt="" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"> 24 Blohum Road'

footer_old_phone = re.compile(r'<i class="fa-solid fa-phone[^"]*"[^>]*></i>\s*\+233 55 392 1612\s*&bull;\s*<i class="fa-brands fa-instagram[^"]*"[^>]*></i>\s*<a href="https://www.instagram.com/woodpeckers_gh/"[^>]*>@woodpeckers_gh</a>', re.DOTALL)
footer_new_phone = '<img src="images/icon-phone-white.svg" alt="" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"> +233 55 392 1612 &bull; <img src="images/icon-instagram-white.svg" alt="" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"> <a href="https://www.instagram.com/woodpeckers_gh/" target="_blank" style="color:#008751;font-weight:600;">@woodpeckers_gh</a>'

for fpath in glob.glob('*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = footer_old_loc.sub(footer_new_loc, content)
    content = footer_old_phone.sub(footer_new_phone, content)

    # Star ratings fallback: replace empty star icons with clean gold/green stars
    content = content.replace(
        '<span class="product-item-rating">\n                                    <i class="fa-solid fa-star"></i>\n                                    <i class="fa-solid fa-star"></i>\n                                    <i class="fa-solid fa-star"></i>\n                                    <i class="fa-solid fa-star"></i>\n                                    <i class="fa-solid fa-star"></i>\n                                </span>',
        '<span class="product-item-rating" style="color:#FFB800;letter-spacing:2px;font-size:13px;">★★★★★</span>'
    )

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated footer icons and star ratings across all HTML files")
