import os
import re

titles = {
  "index.html": "Woodpeckers Sneakers & Streetwear | Affordable Luxury in Ghana",
  "index-2.html": "Woodpeckers Sneakers & Streetwear | Editorial Collection",
  "products.html": "Shop Sneakers & Streetwear | Woodpeckers Ghana",
  "product-single.html": "Sneaker Details & Reserve Offer | Woodpeckers Ghana",
  "cart.html": "Shopping Cart | Woodpeckers Ghana",
  "checkout.html": "Checkout & Secure Payment | Woodpeckers Ghana",
  "order-received.html": "Order Confirmation | Woodpeckers Ghana",
  "about.html": "About Our Brand | Woodpeckers Sneakers & Streetwear Ghana",
  "contact.html": "Showroom & Contact | Woodpeckers Ghana",
  "faqs.html": "Frequently Asked Questions | Woodpeckers Ghana",
  "privacy-policy.html": "Privacy Policy | Woodpeckers Ghana",
  "delivery-policy.html": "Delivery Policy & Shipping | Woodpeckers Ghana",
  "refund-return.html": "Returns & Exchanges | Woodpeckers Ghana",
  "term-condition.html": "Terms & Conditions | Woodpeckers Ghana",
  "testimonials.html": "Client Reviews & Feedback | Woodpeckers Ghana",
  "blog.html": "Culture & Drops Blog | Woodpeckers Ghana",
  "blog-single.html": "Streetwear Editorial | Woodpeckers Ghana",
  "login.html": "Customer & Staff Login | Woodpeckers Ghana",
  "forgot-password.html": "Reset Password | Woodpeckers Ghana",
  "empty-cart.html": "Empty Bag | Woodpeckers Ghana",
  "404.html": "Page Not Found | Woodpeckers Ghana",
  "account-dashboard.html": "My Account Dashboard | Woodpeckers Ghana",
  "account-order.html": "My Orders & Reserve Offers | Woodpeckers Ghana",
  "account-orders-details.html": "Order Details | Woodpeckers Ghana",
  "account-address.html": "Saved Addresses | Woodpeckers Ghana",
  "account-addresses.html": "Manage Addresses | Woodpeckers Ghana",
  "account-details.html": "Account Profile | Woodpeckers Ghana",
  "account-wishlist.html": "Saved Grails & Wishlist | Woodpeckers Ghana",
  "account-download.html": "Purchased Receipts | Woodpeckers Ghana",
  "reserve.html": "Meet the Reserve | Woodpeckers Sneakers & Streetwear Ghana"
}

files = sorted([f for f in os.listdir(".") if f.endswith(".html")])

old_footer_addr = re.compile(
    r"<p>78 Market Street Urban, Central City Ahmedabad, Gujarat 380009</p>\s*<p>Retail Hub, West End Mumbai, Maharashtra 400001</p>",
    re.IGNORECASE
)
new_footer_addr = """<p><i class="fa-solid fa-location-dot me-2" style="color:#B98F6A;"></i> 24 Blohum Road, near Fidelity Bank, Dzorwulu, Accra, Ghana</p>
                            <p><i class="fa-solid fa-phone me-2" style="color:#B98F6A;"></i> +233 55 392 1612 &bull; <i class="fa-brands fa-instagram ms-2 me-1" style="color:#B98F6A;"></i> <a href="https://www.instagram.com/woodpeckers_gh/" target="_blank" style="color:#B98F6A;font-weight:600;">@woodpeckers_gh</a></p>"""

updated_count = 0
for f in files:
    if f in ("reserve.html", "admin.html"):
        continue
    with open(f, "r", encoding="utf-8") as fp:
        content = fp.read()
    
    # 1. Update Title
    if f in titles:
        content = re.sub(r"<title>.*?</title>", f"<title>{titles[f]}</title>", content, count=1)
    
    # 2. Update Footer Address
    content = old_footer_addr.sub(new_footer_addr, content)

    # 3. Replace Indian Rupee symbol with Ghana Cedis GH₵
    content = content.replace("₹", "GH₵ ")

    # 4. Replace external video links with official spec ad
    content = content.replace(
        "../../demo.awaikenthemes.com/assets/videos/shoexo-intro-video.mp4",
        "https://www.youtube.com/watch?v=8yA57IWmSrE"
    )

    # 5. Replace generic Shoexo copyright and text
    content = content.replace(
        "Copyright © 2026 All Rights Reserved.",
        "&copy; 2026 Woodpeckers Sneakers and Streetwear Ghana. All Rights Reserved."
    )
    content = re.sub(r">Shoexo<", ">Woodpeckers<", content)

    # 6. Ensure Meet the Reserve link is present in navigation menu
    if "reserve.html" not in content:
        content = re.sub(
            r'(<li class="nav-item"><a class="nav-link" href="products\.html">Shop.*?</a></li>)',
            r'\1\n                                    <li class="nav-item"><a class="nav-link" href="reserve.html" style="color:#B98F6A;font-weight:800;">🔥 Meet The Reserve</a></li>',
            content
        )

    # 7. Add Cart Badge in header if not already there
    if "header-cart-badge" not in content and 'images/icon-cart-primary.svg' in content:
        content = re.sub(
            r'(<img src="images/icon-cart-primary\.svg"[^>]*>)',
            r'\1<span class="header-cart-badge" style="display:none;position:absolute;top:-6px;right:-8px;background:#B98F6A;color:#111;font-size:10px;font-weight:800;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;">0</span>',
            content
        )

    # 8. Include woodpeckers-commerce.js before </body>
    if "woodpeckers-commerce.js" not in content and "</body>" in content:
        content = content.replace("</body>", "    <!-- Woodpeckers Commerce & Reserve Engine -->\n    <script src=\"js/woodpeckers-commerce.js\"></script>\n</body>")

    with open(f, "w", encoding="utf-8") as fp:
        fp.write(content)
    updated_count += 1

print(f"Batch branding applied to {updated_count} files successfully.")
