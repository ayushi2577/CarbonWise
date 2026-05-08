"""
CarbonWise Django Backend Settings
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / '.env')

BASE_DIR = Path(__file__).resolve().parent.parent

# ── SECURITY ─────────────────────────────────────
# IMPORTANT: Change this before deployment!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-carbonwise-hackathon-secret-key-change-in-production')

# ── APPS ─────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # <-- add here
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'carbonwise.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

WSGI_APPLICATION = 'carbonwise.wsgi.application'

# ── DATABASE ─────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ── STATIC FILES ─────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ── CORS ─────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True  # Restrict in production:
# CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'https://your-domain.com']

# ── REST FRAMEWORK ────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
}

# ── AI API CONFIGURATION ─────────────────────────
# Using Groq (FREE — sign up at console.groq.com)
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
# To use: replace 'paste_your_groq_key_here' with your key from console.groq.com
# Or set env var:  export GROQ_API_KEY=gsk_xxxx  (Mac/Linux)
#                  set GROQ_API_KEY=gsk_xxxx     (Windows)
GROQ_MODEL   = 'llama-3.1-8b-instant'   # fast; switch to llama-3.3-70b-versatile for higher quality

# Alternative free options (uncomment to use):

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
