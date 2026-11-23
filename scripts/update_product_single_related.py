import re

with open('product-single.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the related products list
related_html = """                    <div class="product-item-list">
                        <!-- Product Item Start -->
                        <div class="product-item wow fadeInUp">
                            <div class="product-item-header">
                                <div class="product-item-image">
                                    <a href="product-single.html?id=SNK-001">
                                        <figure>
                                            <img src="images/product-image-1.jpg" alt="Air Jordan 1 Chicago Lost & Found" style="height:210px;object-fit:contain;padding:12px;">
                                        </figure>
                                    </a>
                                </div>
                                <div style="position:absolute;top:10px;left:10px;background:#008751;color:#fff;font-size:10px;font-weight:800;padding:3px 7px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;z-index:2;">
                                    🔥 Reserve
                                </div>
                                <div class="product-item-action">
                                    <ul>
                                        <li><a href="account-wishlist.html"><img src="images/icon-wishlist-primary.svg" alt=""></a></li>
                                        <li><a href="product-single.html?id=SNK-001"><img src="images/icon-preview-primary.svg" alt=""></a></li>
                                        <li><a href="cart.html"><img src="images/icon-cart-primary.svg" alt=""></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="product-item-content">
                                <span class="product-item-rating" style="color:#FFB800;letter-spacing:2px;font-size:13px;">★★★★★</span>
                                <h2><a href="product-single.html?id=SNK-001">Air Jordan 1 Retro High OG 'Chicago Lost &amp; Found'</a></h2>
                                <h3>GH₵ 3,850.00 <span>GH₵ 4,200.00</span></h3>
                            </div>
                        </div>
                        <!-- Product Item End --> 

                        <!-- Product Item Start -->
                        <div class="product-item wow fadeInUp" data-wow-delay="0.2s">
                            <div class="product-item-header">
                                <div class="product-item-image">
                                    <a href="product-single.html?id=SNK-002">
                                        <figure>
                                            <img src="images/product-image-2.jpg" alt="Travis Scott Reverse Mocha" style="height:210px;object-fit:contain;padding:12px;">
                                        </figure>
                                    </a>
                                </div>
                                <div style="position:absolute;top:10px;left:10px;background:#008751;color:#fff;font-size:10px;font-weight:800;padding:3px 7px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;z-index:2;">
                                    🔥 Reserve
                                </div>
                                <div class="product-item-action">
                                    <ul>
                                        <li><a href="account-wishlist.html"><img src="images/icon-wishlist-primary.svg" alt=""></a></li>
                                        <li><a href="product-single.html?id=SNK-002"><img src="images/icon-preview-primary.svg" alt=""></a></li>
                                        <li><a href="cart.html"><img src="images/icon-cart-primary.svg" alt=""></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="product-item-content">
                                <span class="product-item-rating" style="color:#FFB800;letter-spacing:2px;font-size:13px;">★★★★★</span>
                                <h2><a href="product-single.html?id=SNK-002">Travis Scott x Air Jordan 1 Low 'Reverse Mocha'</a></h2>
                                <h3>GH₵ 5,200.00 <span>GH₵ 5,800.00</span></h3>
                            </div>
                        </div>
                        <!-- Product Item End -->

                        <!-- Product Item Start -->
                        <div class="product-item wow fadeInUp" data-wow-delay="0.4s">
                            <div class="product-item-header">
                                <div class="product-item-image">
                                    <a href="product-single.html?id=SNK-003">
                                        <figure>
                                            <img src="images/product-image-3.jpg" alt="Nike Dunk Low Retro Panda" style="height:210px;object-fit:contain;padding:12px;">
                                        </figure>
                                    </a>
                                </div>
                                <div style="position:absolute;top:10px;left:10px;background:#008751;color:#fff;font-size:10px;font-weight:800;padding:3px 7px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;z-index:2;">
                                    🔥 Reserve
                                </div>
                                <div class="product-item-action">
                                    <ul>
                                        <li><a href="account-wishlist.html"><img src="images/icon-wishlist-primary.svg" alt=""></a></li>
                                        <li><a href="product-single.html?id=SNK-003"><img src="images/icon-preview-primary.svg" alt=""></a></li>
                                        <li><a href="cart.html"><img src="images/icon-cart-primary.svg" alt=""></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="product-item-content">
                                <span class="product-item-rating" style="color:#FFB800;letter-spacing:2px;font-size:13px;">★★★★★</span>
                                <h2><a href="product-single.html?id=SNK-003">Nike Dunk Low Retro 'Panda'</a></h2>
                                <h3>GH₵ 1,850.00 <span>GH₵ 2,100.00</span></h3>
                            </div>
                        </div>
                        <!-- Product Item End -->

                        <!-- Product Item Start -->
                        <div class="product-item wow fadeInUp" data-wow-delay="0.6s">
                            <div class="product-item-header">
                                <div class="product-item-image">
                                    <a href="product-single.html?id=SNK-004">
                                        <figure>
                                            <img src="images/product-image-4.jpg" alt="New Balance 9060" style="height:210px;object-fit:contain;padding:12px;">
                                        </figure>
                                    </a>
                                </div>
                                <div style="position:absolute;top:10px;left:10px;background:#008751;color:#fff;font-size:10px;font-weight:800;padding:3px 7px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;z-index:2;">
                                    🔥 Reserve
                                </div>
                                <div class="product-item-action">
                                    <ul>
                                        <li><a href="account-wishlist.html"><img src="images/icon-wishlist-primary.svg" alt=""></a></li>
                                        <li><a href="product-single.html?id=SNK-004"><img src="images/icon-preview-primary.svg" alt=""></a></li>
                                        <li><a href="cart.html"><img src="images/icon-cart-primary.svg" alt=""></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="product-item-content">
                                <span class="product-item-rating" style="color:#FFB800;letter-spacing:2px;font-size:13px;">★★★★★</span>
                                <h2><a href="product-single.html?id=SNK-004">New Balance 9060 'Sea Salt &amp; Rain Cloud'</a></h2>
                                <h3>GH₵ 2,150.00 <span>GH₵ 2,400.00</span></h3>
                            </div>
                        </div>
                        <!-- Product Item End -->"""

html = re.sub(
    r'<div class="product-item-list">.*?<!-- Products Item List End -->',
    related_html + '\n                    </div>\n                    <!-- Products Item List End -->',
    html,
    flags=re.DOTALL
)

with open('product-single.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated product-single.html related products")
