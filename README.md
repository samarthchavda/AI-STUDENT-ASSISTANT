# CodeCampus AI

CodeCampus AI is a placement-preparation platform with a React frontend and a FastAPI backend.

## Production Structure

```text
codecampus-ai/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Backend Layout

- `backend/app/main.py`: FastAPI application setup and router registration
- `backend/app/core`: config, auth, database, middleware
- `backend/app/models`: SQLAlchemy models and Pydantic schemas
- `backend/app/routes`: API route modules
- `backend/app/services`: AI and business logic services
- `backend/main.py`: thin launcher for local development and deployment compatibility

## Frontend Layout

- `frontend/src`: application source code
- `frontend/public`: static assets
- `frontend/package.json`: frontend scripts and dependencies

## Local Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Backend runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Environment Variables

### Backend

```env
DATABASE_URL=postgresql://student_user:student_pass@localhost:5432/ai_student_db
SECRET_KEY=change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=your-google-client-id
GEMINI_API_KEY=your-gemini-key
```

### Frontend

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Run Commands

```bash
# backend
cd backend && source venv/bin/activate && python main.py

# frontend
cd frontend && npm run dev
```

## Notes

- The backend now follows an application-package layout under `backend/app`.
- Root-level documentation clutter and one-off helper scripts were removed to keep the repository production-oriented.
- If you change `backend/.env`, restart the backend process.
