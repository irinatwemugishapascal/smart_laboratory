# SmartLaboratory Backend

Node.js + Express.js REST API for the SmartLaboratory application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Initialize database:
```bash
# Create database in MySQL
mysql -u root -p -e "CREATE DATABASE smart_laboratory;"

# Import schema
mysql -u root -p smart_laboratory < config/database.sql
```

4. Start server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication
All protected routes require Bearer token in Authorization header.

### Response Format
```json
{
  "message": "Success message",
  "data": {}
}
```

### Error Format
```json
{
  "message": "Error description"
}
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## Database Tables

- `users` - User accounts and profiles
- `experiments` - Available experiments
- `results` - User experiment results
- `badges` - Achievement badges
- `user_badges` - User-badge associations
- `chemical_reactions` - Chemistry simulation data
- `chemicals` - Available chemicals in virtual lab
- `video_tutorials` - Video tutorial metadata
