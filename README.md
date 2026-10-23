# Image Caption Generator

A focused full-stack application that creates polished captions from uploaded photos using Groq vision.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Authentication**: Clerk
- **AI**: Groq vision API (`qwen/qwen3.8-27b`)
- **Database**: SQLite

## Features

- Upload images (JPG, PNG, WEBP up to 5MB)
- Generate captions in multiple styles
- Support for English, Telugu, and Hindi languages
- User authentication with Clerk
- Caption history for signed-in users
- Dark/Light theme toggle
- Rate limiting for guest users

## Project Structure

```
image-caption-generator/
├── client/          # React + Vite frontend
│   ├── public/images # Frontend image assets
│   └── src/          # Pages, components, and styles
├── server/           # Express API, Groq integration, and SQLite setup
├── package.json      # Workspace scripts and metadata
├── package-lock.json # Single workspace lockfile
└── netlify.toml      # Frontend deployment configuration
```

## Setup Instructions

### Prerequisites

- Node.js 20 or newer
- Groq API key
- Clerk account with publishable and secret keys

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Create `client/.env.local`:
```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Create `server/.env`:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Keep `GROQ_API_KEY` in `server/.env` only. Do not add it to a client environment variable or commit the file.

### Running the Application

Start both frontend and backend:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/api/health

## API Endpoints

- `POST /api/caption` - Generate caption from image
- `GET /api/history` - Get user's caption history
- `DELETE /api/history/:id` - Delete a saved caption
- `GET /api/health` - Health check endpoint

## Environment Variables

| Variable | Used by | Required | Default |
|----------|---------|----------|---------|
| `VITE_API_URL` | Client | No | `http://localhost:3000` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Client | Yes | — |
| `GROQ_API_KEY` | Server | Yes | — |
| `GROQ_MODEL` | Server | No | `qwen/qwen3.8-27b` |
| `CLERK_PUBLISHABLE_KEY` | Server | Yes | — |
| `CLERK_SECRET_KEY` | Server | Yes | — |
| `FRONTEND_URL` | Server | No | `http://localhost:5173` |
| `PORT` | Server | No | `3000` |
| `DB_PATH` | Server | No | `server/captions.db` |

## Deployment

### Frontend (Netlify)

1. Connect the repository to Netlify.
2. Use the root `netlify.toml` configuration.
3. Set `VITE_API_URL` to the deployed backend URL.
4. Set `VITE_CLERK_PUBLISHABLE_KEY` to your public Clerk key.

### Backend (Render)

1. Create Web Service
2. Set environment variables
3. Attach persistent disk for SQLite data
4. Set `DB_PATH` to disk mount path (e.g., `/var/data/captions.db`)

## Security Notes

- Never commit `.env` files
- Never share Clerk secret keys
- Keep API keys on server-side only
- Do not prefix secrets with `VITE_` (exposes to browser)
