import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { INITIAL_SERVICES, INITIAL_BARBERS, generateSeedQueue, INITIAL_TODAY_STATS } from './seedData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, 'salon_data.json')

class Database {
  constructor() {
    this.data = null
    this.init()
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8')
        this.data = JSON.parse(raw)
      } else {
        this.seed()
      }
    } catch (err) {
      console.error('Error loading DB, seeding fresh:', err)
      this.seed()
    }
  }

  seed() {
    this.data = {
      services: INITIAL_SERVICES,
      barbers: INITIAL_BARBERS,
      queue: generateSeedQueue(),
      queueOpen: true,
      closingTime: '21:00',
      todayStats: INITIAL_TODAY_STATS,
      _tokenCounter: 8,
      lastUpdated: Date.now(),
    }
    this.save()
  }

  save() {
    try {
      this.data.lastUpdated = Date.now()
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save to database:', err)
    }
  }

  getState() {
    return this.data
  }

  setState(updater) {
    if (typeof updater === 'function') {
      this.data = updater(this.data)
    } else {
      this.data = { ...this.data, ...updater }
    }
    this.save()
    return this.data
  }
}

export const db = new Database()
