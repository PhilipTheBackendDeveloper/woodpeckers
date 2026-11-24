from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import os

print("Processing streetwear replacement images...")

# 1. For promo-code-item-image-3.jpg (Heavyweight Tees & Cargo Pants)
# We want to feature the authentic Woodpeckers cargo pants and heavyweight tee!
cargo_img = Image.open('images/product-image-8.jpg').convert('RGB') # 800 x 1169
tee_img = Image.open('images/product-image-7.jpg').convert('RGB') # 1024 x 1024

target_w, target_h = 1000, 700

# Create a rich dark luxury streetwear background
base = Image.new('RGB', (target_w, target_h), (14, 16, 15))

# Fit cargo on right side, tee on left side with subtle blending, or crop cargo centered
# Let's crop cargo nicely:
cargo_ratio = target_h / cargo_img.height
cargo_scaled = cargo_img.resize((int(cargo_img.width * 0.7), int(cargo_img.height * 0.7)), Image.Resampling.LANCZOS)

tee_scaled = tee_img.resize((int(target_h * 0.85), int(target_h * 0.85)), Image.Resampling.LANCZOS)

# Paste tee on left side
base.paste(tee_scaled, (-40, int((target_h - tee_scaled.height) / 2)))

# Paste cargo on right side
cargo_x = target_w - cargo_scaled.width + 40
cargo_y = int((target_h - cargo_scaled.height) / 2)
base.paste(cargo_scaled, (cargo_x, cargo_y))

# Add a subtle dark vignette overlay for luxury streetwear feel
overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
# Convert base to RGBA
base_rgba = base.convert('RGBA')

# Save as promo-code-item-image-3.jpg
base.save('images/promo-code-item-image-3.jpg', quality=95)
base.save('images/featured-collection-image-2.jpg', quality=95)
print("Saved images/promo-code-item-image-3.jpg and featured-collection-image-2.jpg")

# 2. For post-2.jpg (Accra Streetwear Lookbook)
# Create a 1366x768 wide streetwear visual
lookbook = Image.new('RGB', (1366, 768), (14, 16, 15))
tee_wide = tee_img.resize((680, 680), Image.Resampling.LANCZOS)
cargo_wide = cargo_img.resize((int(cargo_img.width * 0.7), int(cargo_img.height * 0.7)), Image.Resampling.LANCZOS)

lookbook.paste(tee_wide, (60, 44))
lookbook.paste(cargo_wide, (720, -50))
lookbook.save('images/post-2.jpg', quality=95)
print("Saved images/post-2.jpg")

# 3. For author-4.jpg (Nana Yaw Boateng, Fashion Stylist • Osu)
# Let's check team-item-image-1 or team-item-image-2
if os.path.exists('images/team-item-image-2.jpg'):
    stylist = Image.open('images/team-item-image-2.jpg').convert('RGB')
    # Crop headshot
    w, h = stylist.size
    crop_size = min(w, int(h * 0.55))
    headshot = stylist.crop((int((w - crop_size)/2), 10, int((w + crop_size)/2), 10 + crop_size))
    headshot = headshot.resize((120, 120), Image.Resampling.LANCZOS)
    headshot.save('images/author-4.jpg', quality=95)
    print("Saved images/author-4.jpg with authentic stylist profile")
