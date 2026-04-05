# AI Student Assistant

An AI-powered platform for engineering students to prepare for placements, aptitude tests, DSA practice, and career development.

## Features

- 🤖 AI-powered chat assistant
- 📝 Aptitude test preparation (4800+ questions)
- 💻 DSA practice and tracking
- 📄 Resume builder and ATS analysis
- 💳 Payment integration (Razorpay)
- 👨‍💼 Admin dashboard
- 📊 Analytics and leaderboards

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Zustand (State Management)

**Backend:**
- Python 3.9+
- FastAPI
- PostgreSQL (Supabase)
- SQLAlchemy
- Google Gemini AI

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories.

**Backend `.env`:**
```
DATABASE_URL=your_postgresql_url
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET_KEY=your_jwt_secret
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## License

Private Project
