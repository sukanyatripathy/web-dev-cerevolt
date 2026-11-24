import os

from .settings import *  # noqa: F401,F403
from .settings import BASE_DIR

DEBUG = False

# The live server must provide its own secret key; the one in
# settings.py is only for local use.
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# Comma-separated lists, set on the server (no spaces), for example:
# ALLOWED_HOSTS=yourname.pythonanywhere.com
# CORS_ORIGINS=https://your-app.vercel.app
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h]
CORS_ALLOWED_ORIGINS = [
    o for o in os.environ.get("CORS_ORIGINS", "").split(",") if o
]

STATIC_ROOT = BASE_DIR / "staticfiles"