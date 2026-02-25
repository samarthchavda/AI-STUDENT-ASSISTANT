# 🎓 AI Student Assistant

A full-stack AI-powered learning platform built with React, TypeScript, FastAPI, and PostgreSQL. Helps students learn faster, study smarter, and prepare for exams & jobs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109+-green.svg)

## ✨ Features

### 📚 Learning & Study
- AI-powered topic explanations
- Automatic notes generation
- 24/7 doubt solving
- Assignment helper

### 📝 Exam Preparation
- Mock tests & quizzes
- Previous year questions with solutions
- Personalized study plans
- Weak area detection

### 💻 Coding & Tech
- Code explanation & debugging
- DSA practice with hints
- Project guidance
- Multiple language support

### 🎯 Career & Placement
- Resume builder & ATS checker
- Interview preparation
- Company-specific guidance

### 🔐 Admin Panel
- User management dashboard
- Analytics & statistics
- Chat monitoring
- Payment tracking
- Secure access control

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand  
**Backend:** FastAPI, Python, PostgreSQL, SQLAlchemy  
**AI:** OpenAI/Anthropic APIs  
**Auth:** JWT, Google OAuth  
**Payment:** Stripe, Razorpay (demo)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-student-assistant.git
   cd ai-student-assistant
   ```

2. **Setup Database**
   ```bash
   # Install PostgreSQL
   brew install postgresql@14  # macOS
   
   # Create database
   psql postgres
   CREATE DATABASE ai_student_db;
   CREATE USER student_user WITH PASSWORD 'student_pass';
   GRANT ALL PRIVILEGES ON DATABASE ai_student_db TO student_user;
   \q
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Copy and configure environment
   cp .env.example .env
   # Edit .env with your settings
   
   # Initialize database
   npm run db:init
   
   # Start backend
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Create Admin User**
   ```bash
   cd backend
   npm run admin:create
   ```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Admin Panel:** http://localhost:3000/admin

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Admin Setup](ADMIN_SETUP.md)
- [PostgreSQL Setup](POSTGRESQL_SETUP.md)
- [Project Overview](PROJECT_OVERVIEW.md)

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://student_user:student_pass@localhost:5432/ai_student_db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🎮 Usage

1. Start both backend and frontend servers
2. Register/login at http://localhost:3000/auth
3. Explore features:
   - Chat with AI for learning
   - Generate mock tests
   - Get coding help
   - Prepare for interviews
4. Admin users can access the admin panel

## 🔐 Admin Features

Create an admin user to access:
- User management
- System statistics
- Chat monitoring
- Payment tracking
- Progress analytics

```bash
cd backend
npm run admin:create
```

## 📁 Project Structure

```
ai-student-assistant/
├── frontend/          # React TypeScript app
│   ├── src/
│   │   ├── pages/    # React pages
│   │   ├── api/      # API client
│   │   └── store/    # State management
│   └── package.json
├── backend/           # FastAPI Python app
│   ├── routes/       # API routes
│   ├── models.py     # Database models
│   ├── main.py       # FastAPI app
│   └── requirements.txt
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Demo mode uses mock AI responses (add real API keys for production)
- Payment integration uses test keys
- Google OAuth requires proper configuration

## 🚀 Roadmap

- [ ] Voice input for questions
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Group study rooms
- [ ] Live tutoring sessions
- [ ] More language support

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Check documentation in `/docs`

## 🙏 Acknowledgments

- OpenAI for GPT API
- Anthropic for Claude API
- FastAPI framework
- React community

---

**Built with ❤️ for students worldwide**

⭐ Star this repo if you find it helpful!
