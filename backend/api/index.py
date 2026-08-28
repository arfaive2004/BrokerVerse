import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402,F401

# Vercel's Python runtime looks for a module-level `app` (ASGI or WSGI)
# in api/index.py and routes matching requests to it directly.
