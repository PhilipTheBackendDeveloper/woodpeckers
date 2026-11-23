import glob

replacements = [
    ("Floral Print Casual Sneakers", "Air Jordan 1 Retro High OG 'Chicago Lost & Found'"),
    ("Beige Comfort Slide Sandals", "Travis Scott x Air Jordan 1 Low 'Reverse Mocha'"),
    ("Kids Floral Garden Clogs", "New Balance 9060 'Sea Salt & Rain Cloud'"),
    ("Performance Running Shoes", "Nike Dunk Low Retro 'Panda'"),
    ("Urban Street Sneakers", "Yeezy Boost 350 V2 'Carbon Beluga'"),
    ("Classic Black Ankle Boots", "Woodpeckers Heavyweight Oversized Tee 'Accra Night'"),
    ("Premium Casual Sneakers", "Woodpeckers Tactical Cargo Pants 'Obsidian'"),
]

for fpath in glob.glob('*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            changed = True

    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated product names in {fpath}")
