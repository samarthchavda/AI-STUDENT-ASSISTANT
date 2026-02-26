# CodeCampus AI 🎓

An AI-powered placement preparation platform built specifically for engineering students. Get personalized roadmaps, resume analysis, mock interviews, and structured learning paths for your dream tech job.

## 🎯 Target Audience
**Engineering Students** preparing for campus placements and tech careers

## 🌟 Features

### 🎯 Problems We Solve for Engineering Students

❌ **No proper roadmap** → ✅ Personalized placement roadmaps  
❌ **Don't know what to study** → ✅ Daily study plans with tracking  
❌ **Weak resume** → ✅ AI-powered resume analyzer with ATS scoring  
❌ **No mock interview practice** → ✅ Company-specific interview prep  
❌ **Random YouTube learning** → ✅ Structured learning paths  
❌ **No tracking system** → ✅ Progress tracking and analytics  

### 🗺️ Personalized Placement Roadmap
- **Input Your Details**: Branch, Current Year, Target Role (Frontend, Backend, Data Analyst, etc.)
- **Get AI-Generated**:
  - 3-month placement roadmap
  - Daily study plans
  - Skills to focus on
  - Company-specific preparation
  - DSA practice schedule
  - Project recommendations

### 📄 Resume Analyzer
- **Upload PDF Resume**
- **AI Analysis Provides**:
  - ATS Score (0-100)
  - Weak points identification
  - Improvement suggestions
  - Keyword optimization
  - Format recommendations
  - Industry-specific feedback

### 💻 Coding & DSA Practice
- **DSA Problem Solving**: Hints and approaches for algorithm problems
- **Code Debugging**: Get help fixing your code
- **Project Guidance**: Build placement-worthy projects
- **Tech Stack Recommendations**: Based on target role

### 🎯 Interview Preparation
- **Mock Interviews**: Practice with AI interviewer
- **Company-Specific Prep**: TCS, Infosys, Wipro, Google, Amazon, etc.
- **HR Round Practice**: Common questions and answers
- **Technical Round Prep**: Role-based questions

### 🤖 AI Features
- **Personalized Roadmaps**: Based on branch, year, and target role
- **Progress Tracking**: Monitor your placement preparation
- **Smart Recommendations**: Skills and projects based on your profile
- **Company Insights**: Latest hiring trends and requirements

### 🔐 Admin Panel
- **User Management**: View and manage all users
- **Analytics Dashboard**: Track usage and revenue
- **Chat Monitoring**: View all conversations
- **Payment Tracking**: Monitor transactions
- **Access Control**: Secure admin-only access

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls

### Backend
- **FastAPI** (Python)
- **PostgreSQL** database
- **SQLAlchemy** ORM
- **OpenAI/Anthropic** APIs for AI
- **JWT** authentication
- **Pydantic** for validation

### AI Integration
- OpenAI GPT-4 for roadmap generation
- Resume parsing and analysis
- Interview question generation
- Personalized recommendations

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+

### 1. Clone & Setup

\`\`\`bash
git clone https://github.com/samarthchavda/AI-STUDENT-ASSISTANT.git
cd AI-STUDENT-ASSISTANT
\`\`\`

### 2. Database Setup

See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for detailed PostgreSQL installation and configuration.

Quick setup:
\`\`\`bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database and user
psql postgres
CREATE DATABASE ai_student_db;
CREATE USER student_user WITH PASSWORD 'student_pass';
GRANT ALL PRIVILEGES ON DATABASE ai_student_db TO student_user;
\\q
\`\`\`

### 3. Backend Setup

\`\`\`bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your settings

# Create database tables
python -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"

# Run backend server
python main.py
# Or: uvicorn main:app --reload
\`\`\`

Backend will run on: http://localhost:8000
API Docs: http://localhost:8000/docs

### 4. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Frontend will run on: http://localhost:3000

## 🔑 Environment Variables

### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://student_user:student_pass@localhost:5432/ai_student_db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
STRIPE_API_KEY=your-stripe-key-here
RAZORPAY_KEY_ID=rzp_test_your-key
\`\`\`

### Frontend (.env)
\`\`\`env
VITE_API_URL=http://localhost:8000/api
\`\`\`

## 🎮 Usage

1. **Start PostgreSQL**: Ensure PostgreSQL is running
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Open Browser**: Navigate to http://localhost:3000

## 🔐 Admin Setup

To create an admin user with full access to the admin panel:

```bash
cd backend
source venv/bin/activate
python create_admin.py
```

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed admin configuration.

Quick admin access:
- Create admin user with the script above
- Login at http://localhost:3000/auth
- Access admin panel at http://localhost:3000/admin

## 🔐 Demo Mode

The application includes demo API keys and mock responses for testing:
- Payment integration uses demo keys (no real charges)
- AI responses are pre-configured demos
- Replace with real API keys for production use

## 📚 API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🗃️ Database Schema

### Tables
- **users**: User accounts and authentication
- **chat_history**: All chat conversations
- **user_progress**: Learning progress tracking
- **payments**: Payment transactions

## 🚀 Deployment

### Backend
- Deploy to: Heroku, Railway, Render, AWS
- Set environment variables
- Use production PostgreSQL instance

### Frontend
- Deploy to: Vercel, Netlify, AWS Amplify
- Update API URL in environment variables
- Build: `npm run build`

## 📁 Project Structure

\`\`\`
ai-student-assistant/
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── pages/        # React pages
│   │   ├── store/        # State management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── routes/           # API routes
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # Authentication
│   ├── ai_service.py     # AI integration
│   ├── main.py           # FastAPI app
│   └── requirements.txt
└── README.md
\`\`\`

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `brew services list`
- Check credentials in .env match PostgreSQL user
- Test connection: `psql -U student_user -d ai_student_db`

### Frontend/Backend Connection Issues
- Check CORS settings in main.py
- Verify API URL in frontend .env
- Ensure backend is running on port 8000

### AI Features Not Working
- Add real OpenAI/Anthropic API keys in backend .env
- Check API key format and validity
- Review console for error messages

## 📧 Support

For questions or issues:
- Open a GitHub issue
- Email: support@aistudent.com
- Documentation: /docs

## 🎯 Roadmap

- [ ] PDF resume upload and parsing
- [ ] Advanced ATS scoring algorithm
- [ ] Company-wise interview questions database
- [ ] Mock interview with voice
- [ ] Peer-to-peer mock interviews
- [ ] Placement statistics dashboard
- [ ] Mobile app (React Native)
- [ ] LinkedIn profile analyzer
- [ ] GitHub profile recommendations
- [ ] Coding contest reminders

## 🎓 For Engineering Students

**Branches Supported:**
- Computer Science & Engineering
- Information Technology
- Electronics & Communication
- Electrical Engineering
- Mechanical Engineering
- Civil Engineering

**Target Roles:**
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Analyst
- Data Scientist
- DevOps Engineer
- Mobile App Developer
- Machine Learning Engineer

---

Built with ❤️ for engineering students preparing for placements
# AI-STUDENT-ASSISTANT
