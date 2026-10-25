# Image Caption Generator

A focused full-stack application that creates polished captions from uploaded photos using Groq vision.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Authentication**: Clerk with Google OAuth
- **AI**: Groq vision API (`qwen/qwen3.8-27b`)
- **Database**: SQLite

## Features

- Upload images (JPG, PNG, WEBP up to 5MB)
- Generate captions in multiple styles
- Support for English, Telugu, and Hindi languages
- User authentication with Clerk and Google
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
- Clerk application with Google authentication enabled

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Create `client/.env.local`:
```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

Create `server/.env`:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Keep `GROQ_API_KEY` in `server/.env` only. Do not add it to a client environment variable or commit the file.

### Configure Google sign-in

1. In the Clerk Dashboard, open **Configure → SSO connections → Google** and enable Google.
2. For local development, Clerk's development Google connection can be used immediately. For production, configure your own Google OAuth credentials in Clerk and add the deployed domain to the allowed origins.
3. Copy the Clerk publishable key to `client/.env.local` and the Clerk secret key to `server/.env`. Never expose the secret key in a `VITE_` variable.
4. Start the app and select **Continue with Google**.

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
| `VITE_API_URL` | Client | No | Same-origin in production; `http://localhost:3000` for local split dev |
| `VITE_CLERK_PUBLISHABLE_KEY` | Client | Yes | — |
| `GROQ_API_KEY` | Server | Yes | — |
| `GROQ_MODEL` | Server | No | `qwen/qwen3.8-27b` |
| `CLERK_SECRET_KEY` | Server | Yes | — |
| `FRONTEND_URL` | Server | No | `http://localhost:5173` |
| `PORT` | Server | No | `3000` |
| `DB_PATH` | Server | No | `server/captions.db` |

## Deployment

### Combined deployment (Render)

The Render blueprint builds the React client and serves it from the Node/Express server, so one Render URL hosts both the website and the API.

1. Create a Render Web Service from this repository using `render.yaml`.
2. Use the repository root as the service root, `npm install && npm run build` as the build command, and `npm start` as the start command.
3. Set `GROQ_API_KEY` and `CLERK_SECRET_KEY` in Render. Set `DB_PATH=/var/data/captions.db` only when a persistent disk is mounted at `/var/data`; otherwise use `/tmp/captions.db`.
4. Set `VITE_CLERK_PUBLISHABLE_KEY` in the Render environment. `VITE_API_URL` can be omitted because production API calls use the same origin.
5. Open the generated Render URL. The API health check is available at `/api/health`.

Netlify remains supported for a separate frontend deployment, but it is not required for the combined Render deployment.

## Security Notes

- Never commit `.env` files
- Never share the Clerk secret key
- Keep API keys on server-side only
- Do not prefix secrets with `VITE_` (exposes to browser)
