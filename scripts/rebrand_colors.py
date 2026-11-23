import os
import re
import glob

# 1. Update css/custom.css
with open('css/custom.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace accent color
css = css.replace('--accent-color				: #B98F6A;', '--accent-color				: #008751;')
css = css.replace('#B98F6A', '#008751')

# Replace submenu after pseudo-element with pure CSS triangle arrow
old_submenu_arrow = re.compile(
    r'\.main-menu ul \.nav-item\.submenu > a:after\s*\{[^}]*\}',
    re.DOTALL
)
new_submenu_arrow = """.main-menu ul .nav-item.submenu > a:after {
	content: '';
	display: inline-block;
	width: 0;
	height: 0;
	margin-left: 6px;
	vertical-align: middle;
	border-top: 5px solid currentColor;
	border-right: 4px solid transparent;
	border-left: 4px solid transparent;
}"""
css = old_submenu_arrow.sub(new_submenu_arrow, css)

with open('css/custom.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated css/custom.css")

# 2. Update all HTML files
html_files = glob.glob('*.html')
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace #B98F6A with #008751
    content = content.replace('#B98F6A', '#008751')
    content = content.replace('#b98f6a', '#008751')
    content = content.replace('rgba(185, 143, 106,', 'rgba(0, 135, 81,')
    content = content.replace('rgba(185,143,106,', 'rgba(0,135,81,')

    # Ensure FontAwesome 6 CDN is present right before css/all.min.css or in head
    if 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' not in content:
        content = content.replace(
            '<link href="css/all.min.css" rel="stylesheet"',
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">\n\t<link href="css/all.min.css" rel="stylesheet"'
        )

    # In index.html / index-2.html, remove the pill above EXCLUSIVE SNEAKERS & STREETWEAR
    if file_path in ['index.html', 'index-2.html']:
        # Remove the pill
        content = re.sub(
            r'<span class="section-sub-title wow fadeInUp"[^>]*>Affordable Luxury &bull; Bold &bull; Innovative</span>\s*',
            '',
            content
        )
        content = re.sub(
            r'<span class="section-sub-title wow fadeInUp">Affordable Luxury.*?</span>\s*',
            '',
            content
        )
        # Remove empty icon square in button: replace <i class="fa-solid fa-gavel me-1"></i> with clean SVG or text
        content = content.replace(
            '<i class="fa-solid fa-gavel me-1"></i> Meet The Reserve',
            '🔥 Meet The Reserve'
        )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print(f"Updated {len(html_files)} HTML files")

# 3. Update js files
for js_path in ['js/woodpeckers-commerce.js', 'js/storefront-app.js']:
    if os.path.exists(js_path):
        with open(js_path, 'r', encoding='utf-8') as f:
            js = f.read()
        js = js.replace('#B98F6A', '#008751')
        js = js.replace('rgba(185, 143, 106,', 'rgba(0, 135, 81,')
        js = js.replace('rgba(185,143,106,', 'rgba(0,135,81,')
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(js)
        print(f"Updated {js_path}")
