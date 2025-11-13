import os
import sys
from pathlib import Path


# Ensure 'backend' is on sys.path when running pytest from repo root
ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / 'backend'
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

# Ensure DJANGO_SETTINGS_MODULE is set for pytest if not provided
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog.settings')
