# SmartLaboratory Client

React frontend for the SmartLaboratory application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (if needed):
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm start
```

## Features

- Responsive design with Tailwind CSS
- Dark mode support
- Interactive charts with Recharts
- Toast notifications
- Protected routes
- Role-based access control

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Theme)
├── pages/          # Page components
├── utils/          # API utilities
└── App.js          # Main app component
```

## Available Pages

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Student dashboard
- `/teacher-dashboard` - Teacher dashboard
- `/experiments` - Browse experiments
- `/experiments/:id` - Experiment detail
- `/chemistry-lab` - Virtual chemistry lab
- `/results` - My results
- `/ai-chat` - AI assistant
- `/videos` - Video tutorials
- `/badges` - Badges & achievements
- `/leaderboard` - Student leaderboard
- `/profile` - User profile

## Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
