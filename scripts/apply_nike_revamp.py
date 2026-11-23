#!/usr/bin/env python3
"""
Apply Nike-Style Revamp across Woodpeckers codebase:
1. Replace font links in all HTML files to Oswald (condensed bold) + Plus Jakarta Sans.
2. Remove all pill-like subtitles (<span class="section-sub-title">...) from HTML.
3. Standardize navigation to clean Nike/streetwear structure (Drops, Sneakers, Streetwear, Meet The Reserve, Showroom).
4. Update logo SVGs to modern athletic bold typography.
5. Update custom.css with condensed typography, slicknav mobile styles, and video styles.
6. Replace video section in index.html with clean local video player (play button + quote ONLY).
"""

import os
import re
import glob

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def update_logos():
    logo_svg = """<svg width="260" height="48" viewBox="0 0 260 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brand Monogram Icon -->
  <g transform="translate(4, 4)">
    <rect width="40" height="40" rx="8" fill="#008751"/>
    <path d="M10 14L15.5 28L19.5 18L23.5 28L29 14" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="29" cy="14" r="2.5" fill="#FFEB00"/>
  </g>
  
  <!-- Wordmark in Oswald bold condensed streetwear font -->
  <text x="56" y="27" font-family="'Oswald', -apple-system, sans-serif" font-size="24" font-weight="700" letter-spacing="1.5" fill="#111111">WOODPECKERS<tspan font-size="12" dy="-9" font-weight="700" fill="#008751">™</tspan></text>
  
  <!-- Subtitle -->
  <text x="56" y="40" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="8.5" font-weight="800" letter-spacing="3" fill="#008751">SNEAKERS &amp; STREETWEAR</text>
</svg>"""

    logo_white_svg = """<svg width="260" height="48" viewBox="0 0 260 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brand Monogram Icon -->
  <g transform="translate(4, 4)">
    <rect width="40" height="40" rx="8" fill="#008751"/>
    <path d="M10 14L15.5 28L19.5 18L23.5 28L29 14" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="29" cy="14" r="2.5" fill="#FFEB00"/>
  </g>
  
  <!-- Wordmark in white -->
  <text x="56" y="27" font-family="'Oswald', -apple-system, sans-serif" font-size="24" font-weight="700" letter-spacing="1.5" fill="#FFFFFF">WOODPECKERS<tspan font-size="12" dy="-9" font-weight="700" fill="#00D084">™</tspan></text>
  
  <!-- Subtitle -->
  <text x="56" y="40" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="8.5" font-weight="800" letter-spacing="3" fill="#00D084">SNEAKERS &amp; STREETWEAR</text>
</svg>"""

    with open(os.path.join(ROOT_DIR, 'images', 'logo.svg'), 'w', encoding='utf-8') as f:
        f.write(logo_svg)
    with open(os.path.join(ROOT_DIR, 'images', 'logo-white.svg'), 'w', encoding='utf-8') as f:
        f.write(logo_white_svg)
    print("Updated logo.svg and logo-white.svg")

def update_css():
    css_path = os.path.join(ROOT_DIR, 'css', 'custom.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update :root accent-font
    content = re.sub(
        r"--accent-font\s*:\s*'Playfair Display'[^;]+;",
        "--accent-font\t\t\t\t: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
        content
    )

    # Add comprehensive Nike-style condensed rules & pill purge at the end of custom.css
    revamp_css_block = """

/* ==========================================================================
   WOODPECKERS NIKE-STYLE CONDENSED STREETWEAR REVAMP
   ========================================================================== */

/* 1. Global Condensed Headings */
h1, h2, h3, h4, h5, h6,
.section-title h1,
.section-title h2,
.section-title h3,
.hero-content h1,
.promo-code-item-content h2,
.category-item-content h3,
.why-choose-us-item-content h3,
.featured-collection-item-content h2,
.footer-title h3,
.slicknav_nav a {
    font-family: var(--accent-font) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.02em !important;
    font-weight: 700 !important;
}

/* 2. Total Elimination of Pill Text Badges */
.section-title .section-sub-title,
.section-sub-title,
.hero-badge,
.promo-badge {
    display: none !important;
}

.section-title .section-sub-title::before,
.section-sub-title::before {
    display: none !important;
}

/* 3. Clean Modern Navigation (Desktop & Mobile) */
.main-menu ul#menu {
    display: flex;
    align-items: center;
    gap: 22px;
}

.main-menu ul#menu > li > a {
    font-family: var(--accent-font) !important;
    font-weight: 600 !important;
    font-size: 15px !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    color: #111111;
    padding: 8px 12px;
    transition: color 0.2s ease;
}

.main-menu ul#menu > li > a:hover {
    color: #008751;
}

/* Desktop Meet The Reserve Highlight */
.main-menu ul#menu > li.reserve-nav-item > a,
.navbar-nav .reserve-badge-link {
    background: #008751 !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    padding: 8px 18px !important;
    border-radius: 4px !important;
    letter-spacing: 1px !important;
    box-shadow: 0 4px 14px rgba(0, 135, 81, 0.35) !important;
    transition: all 0.3s ease !important;
}

.main-menu ul#menu > li.reserve-nav-item > a:hover,
.navbar-nav .reserve-badge-link:hover {
    background: #00a865 !important;
    color: #ffffff !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 135, 81, 0.45) !important;
}

@media (min-width: 992px) {
    .mobile-nav-item {
        display: none !important;
    }
}

/* Mobile SlickNav Styling - Clear, Big, Visible Meet The Reserve */
@media (max-width: 991px) {
    .slicknav_menu {
        background: #111111 !important;
        border-top: 1px solid #222222;
    }
    .slicknav_nav {
        padding: 10px 0 15px !important;
    }
    .slicknav_nav li a {
        font-family: var(--accent-font) !important;
        font-size: 17px !important;
        font-weight: 600 !important;
        letter-spacing: 1px !important;
        text-transform: uppercase !important;
        padding: 12px 20px !important;
        color: #ffffff !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        display: block !important;
    }
    .slicknav_nav li a:hover {
        background: rgba(0, 135, 81, 0.15) !important;
        color: #00D084 !important;
    }
    /* Mobile Meet The Reserve Button */
    .slicknav_nav li.reserve-nav-item a,
    .slicknav_nav .reserve-badge-link {
        background: #008751 !important;
        color: #ffffff !important;
        font-weight: 800 !important;
        text-align: center !important;
        border-radius: 6px !important;
        margin: 12px 18px !important;
        padding: 14px 20px !important;
        box-shadow: 0 4px 16px rgba(0, 135, 81, 0.5) !important;
        border: none !important;
    }
    .slicknav_nav li.reserve-nav-item a:hover,
    .slicknav_nav .reserve-badge-link:hover {
        background: #00a865 !important;
        color: #ffffff !important;
    }
}

/* 4. Local Video Sound Toggle Hover */
#videoSoundBtn:hover {
    transform: scale(1.08);
    box-shadow: 0 0 0 18px rgba(0,135,81,0.3), 0 15px 40px rgba(0,0,0,0.7) !important;
}
"""

    if "WOODPECKERS NIKE-STYLE CONDENSED STREETWEAR REVAMP" not in content:
        content += revamp_css_block

    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated custom.css with condensed typography and navigation rules")

def update_html_files():
    html_files = glob.glob(os.path.join(ROOT_DIR, '*.html'))
    old_font_regex = r'<link\s+href="https://fonts\.googleapis\.com/css2\?family=Playfair\+Display[^"]*"\s+rel="stylesheet">'
    new_font_tag = '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">'

    clean_nav_html = """<ul class="navbar-nav mr-auto" id="menu">
                                    <li class="nav-item"><a class="nav-link" href="products.html">Drops</a></li>                                
                                    <li class="nav-item"><a class="nav-link" href="products.html?category=Exclusive%20Sneakers">Sneakers</a></li>
                                    <li class="nav-item"><a class="nav-link" href="products.html?category=Streetwear">Streetwear</a></li>
                                    <li class="nav-item reserve-nav-item"><a class="nav-link reserve-badge-link" href="reserve.html">Meet The Reserve</a></li>
                                    <li class="nav-item"><a class="nav-link" href="contact.html">Showroom</a></li>
                                    <li class="nav-item mobile-nav-item"><a class="nav-link" href="account-dashboard.html">My Account &amp; Orders</a></li>
                                    <li class="nav-item mobile-nav-item"><a class="nav-link" href="faqs.html">FAQs &amp; Help</a></li>
                                </ul>"""

    for path in html_files:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Update font link
        if 'fonts.googleapis.com' in content:
            content = re.sub(old_font_regex, new_font_tag, content)

        # 2. Replace inline 'Playfair Display' font families
        content = re.sub(r"font-family\s*:\s*['\"]Playfair Display['\"][^;\"']*", "font-family:var(--accent-font)", content)

        # 3. Update the menu in files that have #menu
        menu_pattern = r'<ul class="navbar-nav mr-auto" id="menu">.*?</ul>'
        if re.search(menu_pattern, content, re.DOTALL):
            content = re.sub(menu_pattern, clean_nav_html, content, flags=re.DOTALL)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"Updated font links and menus in {len(html_files)} HTML files")

def update_index_page():
    index_path = os.path.join(ROOT_DIR, 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Clean hero section: eliminate any pill text badges and tidy headline
    hero_pattern = r'(<!-- Hero Section Start -->.*?)(<div class="hero parallaxie".*?<!-- Hero Section End -->)'
    match = re.search(hero_pattern, content, re.DOTALL)
    if match:
        clean_hero = """<!-- Hero Section Start -->
    <div class="hero parallaxie" style="background:#0e100f;position:relative;overflow:hidden;padding:110px 0 90px;min-height:680px;display:flex;align-items:center;">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 75% 50%, rgba(0,135,81,0.22) 0%, rgba(14,16,15,0.92) 55%, #0e100f 100%), url('images/hero-bg-image.jpg') center right/cover no-repeat;filter:brightness(0.7);pointer-events:none;"></div>
        
        <div class="container" style="position:relative;z-index:2;">
            <div class="row align-items-center">
                <div class="col-lg-6 col-md-10">
                    <!-- Hero Content Start -->
                    <div class="hero-content">
                        <!-- Section Title Start -->
                        <div class="section-title" style="margin-bottom:24px;">
                            <h1 class="text-anime-style-2" data-cursor="-opaque" style="font-family:var(--accent-font);color:#FFFFFF;font-size:clamp(38px, 5.5vw, 68px);font-weight:700;line-height:1.05;letter-spacing:0.02em;margin-bottom:18px;text-transform:uppercase;">
                                Exclusive <span style="color:#008751;">Sneakers &amp; Streetwear</span>
                            </h1>
                            <p class="wow fadeInUp" data-wow-delay="0.15s" style="color:#d4d4d4;font-size:16px;line-height:1.6;max-width:500px;margin-bottom:28px;">
                                Ghana's premier destination for authenticated deadstock grails and contemporary streetwear. Dzorwulu Showroom, Accra.
                            </p>
                        </div>
                        <!-- Section Title End -->

                        <!-- Hero Content Button Start -->
                        <div class="hero-content-btn wow fadeInUp" data-wow-delay="0.3s" style="display:flex;gap:14px;flex-wrap:wrap;">
                            <a href="products.html" class="btn-default" style="padding:14px 32px;font-family:var(--accent-font);font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:14px;">Explore Catalogue &rarr;</a>
                            <a href="reserve.html" class="btn-default btn-accent" style="background:#008751;border-color:#008751;color:#fff;font-family:var(--accent-font);font-weight:700;padding:14px 32px;letter-spacing:1px;text-transform:uppercase;font-size:14px;">Meet The Reserve</a>
                        </div>
                        <!-- Hero Content Button End -->
                    </div>
                    <!-- Hero Content End -->
                </div>

                <div class="col-lg-6 col-md-12 text-center mt-5 mt-lg-0">
                    <!-- Floating Sneaker Spotlight Start -->
                    <div class="hero-sneaker-spotlight wow zoomIn" data-wow-delay="0.2s" style="position:relative;display:inline-block;max-width:100%;">
                        <div style="position:relative;z-index:2;animation:floatSneaker 4.5s ease-in-out infinite;">
                            <a href="product-single.html?id=SNK-001">
                                <img src="images/product-image-1.jpg" alt="Air Jordan 1 Lost & Found" style="max-height:430px;width:auto;max-width:100%;object-fit:contain;filter:drop-shadow(0 25px 40px rgba(0,0,0,0.7));">
                            </a>
                        </div>
                    </div>
                    <!-- Floating Sneaker Spotlight End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Hero Section End -->"""
        content = re.sub(hero_pattern, clean_hero, content, flags=re.DOTALL)

    # 2. Promo cards - clean titles without pills
    promo_pattern = r'(<!-- Our Promo Code Section Start -->.*?<!-- Our Promo Code Section End -->)'
    clean_promo = """<!-- Our Promo Code Section Start -->
    <div class="our-promo-code">
        <div class="container-fluid">
            <div class="row">
                <div class="col-lg-12">
                    <!-- Promo Code Item List Start -->
                    <div class="promo-code-item-list">
                        <!-- Promo Code Item Start -->
                        <div class="promo-code-item item-1 wow fadeInUp">
                            <div class="promo-code-item-image">
                                <figure>
                                    <img src="images/promo-code-item-image-1.jpg" alt="Meet The Reserve">
                                </figure>
                            </div>
                            <div class="promo-code-item-content">
                                <div class="section-title" style="margin-bottom:15px;">
                                    <h2><a href="reserve.html">Name Your Price On Grail Drops</a></h2>
                                </div>
                                <div class="promo-code-item-body">
                                    <p>Selected deadstock sneakers &amp; streetwear</p>
                                    <p style="font-size:13px;color:#aaa;">Make your offer &bull; Verified in Accra</p>
                                </div>
                                <div class="promo-code-item-btn">
                                    <a href="reserve.html" class="readmore-btn" style="color:#008751;font-weight:800;">Make An Offer &rarr;</a>
                                </div>
                            </div>
                        </div><!-- Promo Code Item End -->

                        <!-- Promo Code Item Start -->
                        <div class="promo-code-item item-2 wow fadeInUp" data-wow-delay="0.2s">
                            <div class="promo-code-item-image">
                                <figure>
                                    <img src="images/promo-code-item-image-2.jpg" alt="Exclusive Sneakers">
                                </figure>
                            </div>
                            <div class="promo-code-item-content">
                                <div class="section-title" style="margin-bottom:15px;">
                                    <h2><a href="products.html">Curated Nike Jordans &amp; Yeezys</a></h2>
                                </div>
                                <div class="promo-code-item-body">
                                    <p>100% Authentic Guarantee</p>
                                    <p style="font-size:13px;color:#aaa;">Dzorwulu Showroom, 24 Blohum Rd</p>
                                </div>
                                <div class="promo-code-item-btn">
                                    <a href="products.html" class="readmore-btn">Explore Kicks &rarr;</a>
                                </div>
                            </div>
                        </div><!-- Promo Code Item End -->

                        <!-- Promo Code Item Start -->
                        <div class="promo-code-item item-3 wow fadeInUp" data-wow-delay="0.4s">
                            <div class="promo-code-item-image">
                                <figure>
                                    <img src="images/promo-code-item-image-3.jpg" alt="Streetwear Essentials">
                                </figure>
                            </div>
                            <div class="promo-code-item-content">
                                <div class="section-title" style="margin-bottom:15px;">
                                    <h2><a href="products.html">Heavyweight Tees &amp; Cargo Pants</a></h2>
                                </div>
                                <div class="promo-code-item-body">
                                    <p>Premium streetwear essentials</p>
                                    <p style="font-size:13px;color:#aaa;">Nationwide Delivery across Ghana</p>
                                </div>
                                <div class="promo-code-item-btn">
                                    <a href="products.html" class="readmore-btn">Shop Apparel &rarr;</a>
                                </div>
                            </div>
                        </div><!-- Promo Code Item End -->
                    </div>
                    <!-- Promo Code Item List End -->
                </div>
            </div>
        </div>
    </div>
    <!-- Our Promo Code Section End -->"""
    content = re.sub(promo_pattern, clean_promo, content, flags=re.DOTALL)

    # 3. Clean Video Section - play button in center and bottom quote ONLY
    video_pattern = r'(<!-- Intro Video Section Start -->.*?<!-- Intro Video Section End -->)'
    clean_video = """<!-- Intro Video Section Start -->
    <div class="intro-video-cinematic" style="position:relative;background:#000000;height:540px;max-height:75vh;overflow:hidden;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;">
        <!-- Local Autoplaying Muted HTML5 Video -->
        <video id="woodpeckersLocalVideo" 
               src="videos/woodpeckers-spec-ad.mp4" 
               autoplay 
               loop 
               muted 
               playsinline 
               preload="auto"
               style="position:absolute;top:50%;left:50%;width:100%;height:100%;object-fit:cover;transform:translate(-50%, -50%);filter:brightness(0.85);">
        </video>

        <!-- Minimal Cinematic Overlay: Play Button in Center & Quote at Bottom -->
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;pointer-events:none;">
            <!-- Circular Play / Sound Toggle Button -->
            <button id="videoSoundBtn" type="button" aria-label="Toggle sound and playback" style="pointer-events:auto;width:80px;height:80px;border-radius:50%;background:#008751;border:none;color:#ffffff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 0 12px rgba(0,135,81,0.25), 0 10px 30px rgba(0,0,0,0.6);transition:all 0.3s ease;">
                <svg id="videoPlayIcon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style="margin-left:4px;">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg id="videoPauseIcon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            </button>

            <!-- Bottom Quote ONLY -->
            <div style="position:absolute;bottom:35px;left:20px;right:20px;text-align:center;">
                <p style="color:#ffffff;font-size:clamp(17px, 2.2vw, 24px);font-family:var(--accent-font);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0;text-shadow:0 2px 10px rgba(0,0,0,0.9);">
                    &ldquo;Street is a state of mind. Wear the mindset.&rdquo;
                </p>
            </div>
        </div>
    </div>
    <!-- Intro Video Section End -->"""
    content = re.sub(video_pattern, clean_video, content, flags=re.DOTALL)

    # 4. Remove all remaining <span class="section-sub-title..."> in index.html
    content = re.sub(r'<span class="section-sub-title[^"]*"[^>]*>.*?</span>\s*', '', content)

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated index.html hero, promo cards, video player, and removed pill subtitles")

def update_storefront_js():
    js_path = os.path.join(ROOT_DIR, 'js', 'storefront-app.js')
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()

    video_listener_code = """
    // Local Video Player Sound & Play/Pause Controller
    const localVideo = document.getElementById('woodpeckersLocalVideo');
    const soundBtn = document.getElementById('videoSoundBtn');
    const playIcon = document.getElementById('videoPlayIcon');
    const pauseIcon = document.getElementById('videoPauseIcon');

    if (localVideo && soundBtn) {
        soundBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (localVideo.muted) {
                localVideo.muted = false;
                localVideo.play();
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
                soundBtn.style.background = '#00a865';
                soundBtn.setAttribute('title', 'Click to pause');
            } else {
                if (localVideo.paused) {
                    localVideo.play();
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                } else {
                    localVideo.pause();
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                }
            }
        });
    }
"""
    if "woodpeckersLocalVideo" not in content:
        content += "\n" + video_listener_code
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated storefront-app.js with local video controller")

if __name__ == '__main__':
    update_logos()
    update_css()
    update_html_files()
    update_index_page()
    update_storefront_js()
    print("All tasks completed successfully!")
