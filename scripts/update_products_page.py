import re

with open('products.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update Categories sidebar
old_cats = re.compile(r'<h2 class="product-category-item-title">Categories</h2>\s*<ul>.*?</ul>', re.DOTALL)
new_cats = """<h2 class="product-category-item-title">Categories</h2>
                                <ul>
                                    <li>
                                        <input type="checkbox" id="cat_all" name="Categories" value="all" checked>
                                        <label for="cat_all">All Drops</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="cat_exclusive" name="Categories" value="Exclusive Sneakers">
                                        <label for="cat_exclusive">Exclusive Sneakers</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="cat_runners" name="Categories" value="Lifestyle Runners">
                                        <label for="cat_runners">Lifestyle Runners</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="cat_streetwear" name="Categories" value="Streetwear">
                                        <label for="cat_streetwear">Streetwear &amp; Apparel</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="cat_reserve" name="Categories" value="reserveOnly">
                                        <label for="cat_reserve" style="color:#008751;font-weight:700;">🔥 Reserve Eligible</label>
                                    </li>
                                </ul>"""
html = old_cats.sub(new_cats, html)

# Update Brands sidebar
old_brands = re.compile(r'<h2 class="product-category-item-title">Brands</h2>\s*<ul>.*?</ul>', re.DOTALL)
new_brands = """<h2 class="product-category-item-title">Brands</h2>
                                <ul>
                                    <li>
                                        <input type="checkbox" id="brand_nike" name="Brand" value="Nike">
                                        <label for="brand_nike">Nike / Jordan</label>
                                    </li>                                    
                                    <li>
                                        <input type="checkbox" id="brand_adidas" name="Brand" value="Yeezy">
                                        <label for="brand_adidas">Adidas / Yeezy</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="brand_nb" name="Brand" value="New Balance">
                                        <label for="brand_nb">New Balance</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="brand_asics" name="Brand" value="Asics">
                                        <label for="brand_asics">Asics / Saucony</label>
                                    </li>
                                    <li>
                                        <input type="checkbox" id="brand_woodpeckers" name="Brand" value="Woodpeckers">
                                        <label for="brand_woodpeckers" style="color:#008751;font-weight:700;">Woodpeckers Original</label>
                                    </li>
                                </ul>"""
html = old_brands.sub(new_brands, html)

# Update Sizes sidebar
old_sizes = re.compile(r'<h2 class="product-category-item-title">Size \(UK\)</h2>\s*<ul>.*?</ul>', re.DOTALL)
new_sizes = """<h2 class="product-category-item-title">Sizes</h2>
                                <ul>
                                    <li><input type="checkbox" id="sz_7" name="Size" value="UK 7"><label for="sz_7">UK 7</label></li>
                                    <li><input type="checkbox" id="sz_8" name="Size" value="UK 8"><label for="sz_8">UK 8</label></li>
                                    <li><input type="checkbox" id="sz_8_5" name="Size" value="UK 8.5"><label for="sz_8_5">UK 8.5</label></li>
                                    <li><input type="checkbox" id="sz_9" name="Size" value="UK 9"><label for="sz_9">UK 9</label></li>
                                    <li><input type="checkbox" id="sz_10" name="Size" value="UK 10"><label for="sz_10">UK 10</label></li>
                                    <li><input type="checkbox" id="sz_m" name="Size" value="M"><label for="sz_m">Streetwear (M)</label></li>
                                    <li><input type="checkbox" id="sz_l" name="Size" value="L"><label for="sz_l">Streetwear (L)</label></li>
                                </ul>"""
html = old_sizes.sub(new_sizes, html)

with open('products.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated products.html sidebar")
