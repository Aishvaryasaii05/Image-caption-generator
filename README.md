# Image Caption Generator

An AI-powered full-stack application that turns uploaded images into polished captions in seconds. Choose a tone, select a language, and generate captions for social posts, products, accessibility, and more.

**[Live app](https://image-caption-generator-2-45my.onrender.com/)** · **[GitHub repository](https://github.com/Aishvaryasaii05/Image-caption-generator)**

## Highlights

- Generate captions from JPG, PNG, and WEBP images up to 5 MB
- Short, detailed, funny, Instagram, professional, and alt-text styles
- English, Telugu, and Hindi output
- Guest generation with rate limiting
- Clerk authentication and private caption history
- Responsive dark/light interface
- Full-stack deployment with separate frontend and API services

## Visual preview

| AI-assisted captioning | Audience-focused workflows | Product and accessibility use cases |
| --- | --- | --- |
| ![AI captioning](client/public/images/caption-ai-collaboration.png) | ![Creators and influencers](client/public/images/audiences/creators-and-influencers.png) | ![E-commerce and retail](client/public/images/audiences/ecommerce-retail.jpg) |

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js, Multer, CORS
- **AI:** Groq Vision API with `qwen/qwen3.8-27b`
- **Authentication:** Clerk
- **Database:** SQLite with `better-sqlite3`
- **Deployment:** Render

## Project structure

```text
image-caption-generator/
├── client/             # React + Vite frontend
│   ├── public/         # Brand assets and visual content
│   └── src/            # Components, pages, and styles
├── server/             # Express API and Groq integration
├── package.json        # Workspace scripts
└── netlify.toml        # Static frontend build configuration
```

## Run locally

### Prerequisites

- Node.js 20 or newer
- A Groq API key
- A Clerk application with publishable and secret keys

### Install

```bash
npm install
```

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

Keep real secrets in local or hosting environment variables. Never commit `.env` files or expose server secrets with a `VITE_` prefix.

### Start the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Health check: http://localhost:3000/api/health

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/caption` | Generate a caption from an uploaded image |
| `GET` | `/api/history` | Read the signed-in user’s caption history |
| `DELETE` | `/api/history/:id` | Delete a saved caption |
| `GET` | `/api/health` | Check API availability |

## Deployment

The production app uses two connected Render services:

1. **Backend Web Service**
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`

2. **Frontend Static Site**
   - Root directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

Set `VITE_API_URL` on the frontend to the backend URL and set `FRONTEND_URL` on the backend to the frontend URL.

## Security

- Never commit API keys or `.env` files.
- Keep `GROQ_API_KEY` and `CLERK_SECRET_KEY` on the server only.
- Use `VITE_CLERK_PUBLISHABLE_KEY` only for the public frontend key.
- Review AI-generated captions before publishing them.

## License

This project is available under the MIT License.
