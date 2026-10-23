import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function initDatabase() {
  const databasePath = resolve(process.env.DB_PATH || join(__dirname, 'captions.db'))
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = new Database(databasePath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS captions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_data BLOB NOT NULL,
      image_type TEXT NOT NULL DEFAULT 'image/jpeg',
      caption TEXT NOT NULL,
      style TEXT NOT NULL,
      language TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const columns = db.pragma('table_info(captions)')
  if (!columns.some((column) => column.name === 'image_type')) {
    db.exec("ALTER TABLE captions ADD COLUMN image_type TEXT NOT NULL DEFAULT 'image/jpeg'")
  }
  if (!columns.some((column) => column.name === 'user_id')) {
    db.exec('ALTER TABLE captions ADD COLUMN user_id TEXT')
  }
  db.exec('CREATE INDEX IF NOT EXISTS captions_user_id_id_idx ON captions(user_id, id DESC)')

  console.log('Database initialized successfully')
  return db
}
