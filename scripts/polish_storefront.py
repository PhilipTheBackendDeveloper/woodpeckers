import re

def polish_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as fp:
        html = fp.read()

    # Category items
    cat_replacements = [
        (">Sneaker Shoes<", ">Grail Sneakers<"),
        (">Running Shoes<", ">Retro Jordans<"),
        (">Casual Shoes<", ">Nike Dunks<"),
        (">Sports Shoes<", ">Yeezy Drops<"),
        (">Formal Shoes<", ">Streetwear Apparel<"),
        (">Canvas Shoes<", ">Showroom Grails<"),
    ]
    for old, new in cat_replacements:
        html = html.replace(old, new)

    # Featured Category items
    html = re.sub(
        r'<h3><a href="products\.html">For Men</a></h3>\s*<p>.*?</p>',
        r'<h3><a href="products.html">Exclusive Footwear</a></h3>\n                                <p>Authenticated Nike Jordans, Dunks, Yeezys &amp; New Balance in Accra.</p>',
        html
    )
    html = re.sub(
        r'<h3><a href="products\.html">For Women</a></h3>\s*<p>.*?</p>',
        r'<h3><a href="products.html">Luxury Streetwear</a></h3>\n                                <p>Heavyweight graphic tees, minimalist hoodies, and utility cargo pants.</p>',
        html
    )
    html = re.sub(
        r'<h3><a href="products\.html">For Kids</a></h3>\s*<p>.*?</p>',
        r'<h3><a href="reserve.html">Meet The Reserve</a></h3>\n                                <p>Name your price on exclusive grails and participate in live bidding.</p>',
        html
    )

    # Promo Code Cards
    html = re.sub(
        r'<div class="promo-code-item item-1 wow fadeInUp">.*?<!-- Promo Code Item End -->',
        '''<div class="promo-code-item item-1 wow fadeInUp">
                            <div class="promo-code-item-image">
                                <figure>
                                    <img src="images/promo-code-item-image-1.jpg" alt="Meet The Reserve">
                                </figure>
                            </div>
                            <div class="promo-code-item-content">
                                <div class="section-title">
                                    <span class="section-sub-title" style="color:#B98F6A;font-weight:800;">🔥 Meet The Reserve</span>
                                    <h2><a href="reserve.html">Name Your Price On Grail Drops</a></h2>
                                </div>
                                <div class="promo-code-item-body">
                                    <p>Selected deadstock sneakers &amp; streetwear</p>
                                    <p style="font-size:13px;color:#aaa;">Make your offer &bull; Verified in Accra</p>
                                </div>
                                <div class="promo-code-item-btn">
                                    <a href="reserve.html" class="readmore-btn" style="color:#B98F6A;font-weight:800;">Make An Offer &rarr;</a>
                                </div>
                            </div>
                        </div><!-- Promo Code Item End -->''',
        html,
        flags=re.DOTALL
    )

    html = re.sub(
        r'<div class="promo-code-item item-2 wow fadeInUp"[^>]*>.*?<!-- Promo Code Item End -->',
        '''<div class="promo-code-item item-2 wow fadeInUp" data-wow-delay="0.2s">
                            <div class="promo-code-item-image">
                                <figure>
                                    <img src="images/promo-code-item-image-2.jpg" alt="Exclusive Sneakers">
                                </figure>
                            </div>
                            <div class="promo-code-item-content">
                                <div class="section-title">
                                    <span class="section-sub-title">Authentic Deadstock</span>
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
                        </div><!-- Promo Code Item End -->''',
        html,
        flags=re.DOTALL
    )

    html = re.sub(
        r'<div class="promo-code-item item-3 wow fadeInUp"[^>]*>.*?<!-- Promo Code Item End -->',
        '''<div class="promo-code-item item-3 wow fadeInUp" data-wow-delay="0.4s">
                            <div class="promo-code-item-image">
                                <figure>
                                    <img src="images/promo-code-item-image-3.jpg" alt="Streetwear Essentials">
                                </figure>
                            </div>
                            <div class="promo-code-item-content">
                                <div class="section-title">
                                    <span class="section-sub-title">Streetwear Vault</span>
                                    <h2><a href="products.html">Heavyweight Tees &amp; Cargo Pants</a></h2>
                                </div>
                                <div class="promo-code-item-body">
                                    <p>Affordable Luxury &bull; Bold &amp; Innovative</p>
                                    <p style="font-size:13px;color:#aaa;">Nationwide Delivery across Ghana</p>
                                </div>
                                <div class="promo-code-item-btn">
                                    <a href="products.html" class="readmore-btn">Shop Apparel &rarr;</a>
                                </div>
                            </div>
                        </div><!-- Promo Code Item End -->''',
        html,
        flags=re.DOTALL
    )

    # Featured Collection
    html = re.sub(
        r'<p>On Orders \$154 \+ Use Code : GET25% Off</p>',
        r'<p>Verified Deadstock &bull; Accra Showroom</p>',
        html
    )
    html = re.sub(
        r'<p>On Orders \$149 & Above</p>',
        r'<p>Nationwide Ghana Express Delivery</p>',
        html
    )

    # Limited Offer Section text
    html = re.sub(
        r"Don't miss your chance to save on premium footwear\. Shop stylish sneakers, boots, loafers, exclusive prices before this limited-time offer ends\.",
        r"Access Ghana's most coveted deadstock sneakers and exclusive streetwear drops. Every pair is authenticated at our Dzorwulu showroom and backed by our authenticity guarantee.",
        html
    )

    with open(filepath, 'w', encoding='utf-8') as fp:
        fp.write(html)
    print(f"Polished {filepath}")

polish_html('index.html')
polish_html('index-2.html')
