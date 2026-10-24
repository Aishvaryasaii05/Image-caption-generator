import express from 'express'
import cors from 'cors'
import { verifyToken } from '@clerk/backend'
import dotenv from 'dotenv'
import multer from 'multer'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './database.js'
import { generateCaption } from './ai.js'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(serverDirectory, '.env') })

const clerkSecretKey = process.env.CLERK_SECRET_KEY

const app = express()
const PORT = process.env.PORT || 3000
app.set('trust proxy', 1)

if (!clerkSecretKey) {
  console.warn('CLERK_SECRET_KEY is not configured. The server will allow guest captions, but signed-in history requests will be unavailable.')
}

const db = initDatabase()
const guestGenerationAttempts = new Map()
const GUEST_GENERATION_LIMIT = 5
const GUEST_GENERATION_WINDOW_MS = 60 * 60 * 1000

function consumeGuestGeneration(req, res) {
  const now = Date.now()
  const cutoff = now - GUEST_GENERATION_WINDOW_MS
  const clientKey = req.ip || req.socket.remoteAddress
  const attempts = (guestGenerationAttempts.get(clientKey) || []).filter((timestamp) => timestamp > cutoff)

  if (attempts.length >= GUEST_GENERATION_LIMIT) {
    guestGenerationAttempts.set(clientKey, attempts)
    res.status(429).json({
      error: 'Guest limit reached (5 captions per hour). Sign in to continue generating captions.',
    })
    return false
  }

  attempts.push(now)
  guestGenerationAttempts.set(clientKey, attempts)

  if (guestGenerationAttempts.size > 1000) {
    for (const [key, timestamps] of guestGenerationAttempts) {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) {
        guestGenerationAttempts.delete(key)
      }
    }
  }

  return true
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WEBP allowed.'))
    }
  },
})

const corsOptions = {
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((url) => url.trim()),
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(async (req, res, next) => {
  const authorization = req.headers.authorization
  if (!clerkSecretKey || !authorization?.startsWith('Bearer ')) return next()

  const token = authorization.slice('Bearer '.length)
  try {
    const claims = await verifyToken(token, { secretKey: clerkSecretKey })
    if (claims.sub) req.user = { id: claims.sub, email: claims.email }
  } catch {
    // Keep unauthenticated requests available for the guest caption limit.
  }
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

function requireApiAuth(req, res, next) {
  if (req.user) {
    return next()
  }
  return res.status(401).json({ error: 'Sign in to access this service.' })
}

app.post('/api/caption', upload.single('image'), async (req, res) => {
  const userId = req.user?.id

  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' })
  }

  const { style = 'short', language = 'english' } = req.body
  const styles = ['short', 'detailed', 'funny', 'instagram', 'professional', 'alt-text']
  const languages = ['english', 'telugu', 'hindi']
  if (!styles.includes(style) || !languages.includes(language)) {
    return res.status(400).json({ error: 'Choose a supported caption style and language.' })
  }

  if (!userId && !consumeGuestGeneration(req, res)) {
    return
  }

  try {
    const caption = await generateCaption(
      req.file.buffer,
      req.file.mimetype,
      style,
      language
    )

    if (userId) {
      const stmt = db.prepare(`
        INSERT INTO captions (image_data, image_type, caption, style, language, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      stmt.run(req.file.buffer, req.file.mimetype, caption, style, language, userId)
    }

    res.json({ caption })
  } catch (error) {
    console.error('Error generating caption:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate caption.'
    const status = message.includes('GROQ_API_KEY') ? 503 : 502
    res.status(status).json({ error: message })
  }
})

app.get('/api/history', requireApiAuth, (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: 'Sign in to view caption history.' })
  }

  try {
    const stmt = db.prepare(`
      SELECT id, image_data, image_type, caption, style, language, created_at
      FROM captions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 20
    `)
    const rows = stmt.all(userId)

    const history = rows.map(row => ({
      ...row,
      image_data: row.image_data.toString('base64'),
    }))

    res.json(history)
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

app.delete('/api/history/:id', requireApiAuth, (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: 'Sign in to delete captions from your history.' })
  }

  try {
    const id = Number(req.params.id)
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid caption ID.' })
    }
    const stmt = db.prepare('DELETE FROM captions WHERE id = ? AND user_id = ?')
    const result = stmt.run(id, userId)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Caption not found' })
    }

    res.json({ message: 'Caption deleted successfully' })
  } catch (error) {
    console.error('Error deleting caption:', error)
    res.status(500).json({ error: 'Failed to delete caption' })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image must be 5 MB or smaller.' })
    }
    return res.status(400).json({ error: err.message })
  }
  
  if (err) {
    return res.status(400).json({ error: err.message })
  }
  
  next()
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
