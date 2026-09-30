# VoyageAI Backend — Django REST API

A production-ready Django REST Framework backend serving all AI intelligence data for the VoyageAI luxury travel platform.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your settings.

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Seed Initial Data

```bash
python manage.py seed_data
```

### 5. Start Development Server

```bash
python manage.py runserver
```

Server starts at: **http://127.0.0.1:8000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/destinations/` | List all AI-curated destinations |
| `GET` | `/api/v1/destinations/{id}/` | Get destination detail |
| `GET` | `/api/v1/features/` | List all 6 AI engine features |
| `GET` | `/api/v1/missions/` | List active live flight missions |
| `GET` | `/api/v1/testimonials/` | List traveler testimonials |
| `GET` | `/api/v1/itineraries/` | List saved AI itineraries |
| `POST` | `/api/v1/plan/` | Generate AI itinerary from a prompt |
| `GET` | `/api/v1/health/` | Backend health check & node status |

### POST `/api/v1/plan/` Body

```json
{
  "prompt": "Tokyo cherry blossom season under $3k",
  "save_result": true
}
```

---

## 📁 Folder Structure

```
backend/
├── config/                    # Django project config
│   ├── settings.py            # Core Django settings
│   ├── urls.py                # Root URL dispatcher
│   ├── wsgi.py                # WSGI entrypoint
│   └── asgi.py                # ASGI entrypoint
├── api/                       # Main VoyageAI API app
│   ├── migrations/            # Database migrations
│   ├── management/
│   │   └── commands/
│   │       └── seed_data.py   # Initial data seeder
│   ├── utils/
│   │   └── ai_engine.py       # AI itinerary generation engine
│   ├── models.py              # Django ORM models
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API views & viewsets
│   ├── urls.py                # API URL routes
│   └── admin.py               # Django Admin customization
├── manage.py                  # Django management CLI
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variable template
└── db.sqlite3                 # SQLite database (auto-created)
```

---

## 🛠️ Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `Django` | ≥ 5.0 | Web framework |
| `djangorestframework` | ≥ 3.14 | REST API toolkit |
| `django-cors-headers` | ≥ 4.3 | CORS support for frontend |
| `python-dotenv` | ≥ 1.0 | `.env` file loader |

---

## 🔗 Frontend Integration

The Django backend runs on `http://localhost:8000` and the React+Vite frontend on `http://localhost:5173`.

CORS is pre-configured to allow requests from `localhost:5173` and `localhost:8443`.
