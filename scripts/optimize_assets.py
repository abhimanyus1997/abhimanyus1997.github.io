import os
from PIL import Image

def optimize_image(filepath, max_size=512, quality=85):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    try:
        orig_size = os.path.getsize(filepath)
        im = Image.open(filepath)
        
        # Calculate new size keeping aspect ratio
        width, height = im.size
        if width > max_size or height > max_size:
            if width > height:
                new_width = max_size
                new_height = int(height * (max_size / width))
            else:
                new_height = max_size
                new_width = int(width * (max_size / height))
            
            im = im.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"Resized {filepath} from {width}x{height} to {new_width}x{new_height}")
        
        # Save optimized
        if filepath.endswith('.png'):
            im.save(filepath, "PNG", optimize=True)
        elif filepath.endswith('.jpg') or filepath.endswith('.jpeg'):
            im.save(filepath, "JPEG", quality=quality, optimize=True)
        
        new_size = os.path.getsize(filepath)
        reduction = (orig_size - new_size) / 1024
        print(f"Optimized {filepath}: {orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB (Reduced by {reduction:.1f}KB)")
    except Exception as e:
        print(f"Failed to optimize {filepath}: {e}")

if __name__ == "__main__":
    images = [
        ('public/static/images/cyber_profile.png', 512),
        ('public/static/images/pilot_sync.png', 512),
        ('public/static/images/profile_ghibli.png', 512),
        ('public/abhimanyu-reference.jpg', 400),
        ('abhimanyu-reference.jpg', 400)
    ]
    
    for path, max_dim in images:
        optimize_image(path, max_size=max_dim)
