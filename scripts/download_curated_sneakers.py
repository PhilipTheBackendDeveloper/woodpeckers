import urllib.request
import os

images_map = {
    # Products
    "images/product-image-3.jpg": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-thumbnail-image-3.jpg": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-image-4.jpg": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-thumbnail-image-4.jpg": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-image-5.jpg": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-image-6.jpg": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-image-8.jpg": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&h=1200&q=85",
    "images/product-image-9.jpg": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&h=1200&q=85",

    # Blog Posts
    "images/post-1.jpg": "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1366&h=768&q=85",
    "images/post-2.jpg": "https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=1366&h=768&q=85",
    "images/post-3.jpg": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1366&h=768&q=85",

    # Categories
    "images/category-item-image-1.jpg": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&h=600&q=80",
    "images/category-item-image-2.jpg": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&h=600&q=80",
    "images/category-item-image-3.jpg": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&h=600&q=80",
    "images/category-item-image-4.jpg": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&h=600&q=80",
    "images/category-item-image-5.jpg": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&h=600&q=80",
    "images/category-item-image-6.jpg": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=600&q=80",

    # Promo / Featured Banners
    "images/promo-code-item-image-1.jpg": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&h=600&q=80",
    "images/promo-code-item-image-2.jpg": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&h=600&q=80",
    "images/promo-code-item-image-3.jpg": "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&h=600&q=80",
    "images/featured-collection-image-1.jpg": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&h=600&q=80",
    "images/featured-collection-image-2.jpg": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&h=600&q=80",
    "images/featured-collection-image-3.jpg": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&h=600&q=80",
    "images/limited-offer-image.jpg": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&h=800&q=85",
}

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for path, url in images_map.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read()
            if len(data) > 1000:
                with open(path, 'wb') as f:
                    f.write(data)
                print(f"[OK] Downloaded {path} ({len(data)} bytes)")
            else:
                print(f"[WARN] Small response for {path}")
    except Exception as e:
        print(f"[FAIL] {path}: {e}")
