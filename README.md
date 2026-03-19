# AI Student Assistant 🚀

<div align="center">
  <img src="./github-banner.svg" alt="AI Student Assistant Banner" width="100%"/>
  
  <p align="center">
    <strong>Your Personal AI-Powered Learning Companion</strong>
  </p>
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#local-setup">Setup</a> •
    <a href="#deployment">Deployment</a>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
    <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/Python-3.11-ffd43b?style=for-the-badge&logo=python&logoColor=blue" alt="Python"/>
  </p>
</div>

---

## 📖 About

AI Student Assistant is a comprehensive full-stack learning platform powered by Google Gemini AI. It helps students prepare for placements, improve their skills, and ace interviews with personalized AI guidance.

## ✨ Features

- 🤖 **AI Chat Assistant** - Get instant answers to your academic questions
- 📝 **Aptitude Test Platform** - Practice quantitative, logical, verbal, and technical aptitude
- 💼 **Career Guidance** - Personalized career path recommendations
- 🏢 **Interview Preparation** - Company-specific interview questions database
- 📊 **Progress Tracking** - Monitor your learning journey
- 👨‍💼 **Admin Dashboard** - Modern SaaS-style admin panel
- 🔐 **Google OAuth** - Secure authentication
- 💳 **Subscription Plans** - Free, Basic, and Pro tiers

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for modern UI
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM for database operations
- **Google Gemini AI** - Advanced AI capabilities
- **JWT** - Secure authentication
- **SlowAPI** - Rate limiting

### DevOps
- **Render** - Backend deployment
- **Vercel** - Frontend deployment
- **GitHub Actions** - CI/CD pipeline

## 📁 Production Structure

```text
ai-student-assistant/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration, auth, database
│   │   ├── models/        # SQLAlchemy models & schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic & AI services
│   │   └── main.py        # FastAPI application
│   ├── migrations/        # Database migrations
│   ├── main.py           # Application launcher
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client services
│   │   ├── store/        # State management
│   │   └── main.tsx      # Application entry
│   ├── public/           # Static assets
│   └── package.json      # Node dependencies
├── github-banner.svg     # Project thumbnail
└── README.md
```

## 🚀 Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/samarthchavda/AI-STUDENT-ASSISTANT.git
cd AI-STUDENT-ASSISTANT/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the server
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL

# Run development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://student_user:student_pass@localhost:5432/ai_student_db

# JWT Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📦 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python main.py`
5. Add environment variables from `.env`

### Frontend (Vercel)

1. Import project from GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Samarth Chavda**

- GitHub: [@samarthchavda](https://github.com/samarthchavda)
- Project Link: [AI Student Assistant](https://github.com/samarthchavda/AI-STUDENT-ASSISTANT)

## 🙏 Acknowledgments

- Google Gemini AI for powering the AI features
- FastAPI for the amazing backend framework
- React team for the frontend library
- All contributors who help improve this project

---

<div align="center">
  <p>Made with ❤️ by Samarth Chavda</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
