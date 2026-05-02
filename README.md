# SmartLaboratory

An AI-powered virtual science laboratory for students and teachers. Learn Physics, Chemistry, and Biology through interactive experiments, virtual simulations, and AI-assisted learning.

## Features

### Core Features
- **Authentication System**: JWT-based auth with student and teacher roles
- **Virtual Experiments**: 18+ experiments across Physics, Chemistry, and Biology
- **Virtual Chemistry Lab**: Interactive drag-and-drop chemical reaction simulator
- **AI Assistant**: Chatbot for science questions, result explanations, and learning suggestions
- **Progress Tracking**: Track experiment completion and scores
- **Badge System**: Earn achievements for completing experiments and reaching milestones
- **Video Tutorials**: YouTube-integrated educational videos with AI summaries
- **Analytics Dashboard**: Student progress charts and teacher monitoring tools

### Experiments Included

**Physics:**
- Ohm's Law Verification
- Series and Parallel Circuits
- Newton's Second Law
- Simple Pendulum
- Lens Formula Verification
- Young's Double Slit Experiment

**Chemistry:**
- Acid-Base Titration
- Electrolysis of Water
- Reaction Rates
- Chromatography Separation
- pH Scale Investigation
- Saponification Reaction

**Biology:**
- Microscope Observation of Cells
- Photosynthesis Test
- Enzyme Activity (Amylase)
- Osmosis in Potato Strips
- Respiration Rate in Seeds
- DNA Extraction from Fruit

## Tech Stack

- **Frontend**: React.js + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **AI**: Ollama (Local LLM) with `deepseek-v3.1:671b-cloud` -or OpenAI API (optional)

## Project Structure

```
SmartLaboratory/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── pages/         # Page components
│   │   └── utils/         # API utilities
│   └── public/
├── server/                # Node.js backend
│   ├── config/           # Database config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, validation
│   ├── models/           # Database models
│   └── routes/           # API routes
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- Ollama (for local AI) - [Installation Guide](OLLAMA_SETUP.md)
- OpenAI API Key (optional fallback)

### 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p
# Then run: CREATE DATABASE smart_laboratory;

# Import schema
mysql -u root -p smart_laboratory < server/config/database.sql
```

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and API keys

npm start
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Experiments
- `GET /api/experiments` - List all experiments
- `GET /api/experiments/:id` - Get experiment details
- `POST /api/experiments/submit` - Submit experiment result
- `GET /api/experiments/results` - Get user's results

### AI
- `POST /api/ai/explain` - Explain experiment results
- `POST /api/ai/suggestion` - Get learning suggestions
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/summarize-video` - Summarize video content

### Dashboard
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/teacher` - Teacher dashboard data
- `GET /api/dashboard/leaderboard` - Get leaderboard

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_laboratory
DB_PORT=3306
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

## Demo Credentials

- **Student**: student@example.com / password123
- **Teacher**: teacher@example.com / password123

## Screenshots

*Screenshots will be added here*

## Running with Ollama (Local AI)

### 1. Install and Start Ollama
```bash
# Download from https://ollama.com/download
# Start Ollama server
ollama serve

# Pull the model
ollama pull deepseek-v3.1:671b-cloud
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env - set OLLAMA_MODEL=deepseek-v3.1:671b-cloud
```

### 3. Run the Application
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm start
```

Visit `http://localhost:3000` and use AI features completely offline!

**Note**: For detailed Ollama setup instructions, see [OLLAMA_SETUP.md](OLLAMA_SETUP.md)

## License

MIT License
