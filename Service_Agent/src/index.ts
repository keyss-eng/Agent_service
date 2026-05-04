// src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'

// Import all routes
import authRoutes from './routes/auth'
import serviceRoutes from './routes/services'
import bookingRoutes from './routes/booking'
import chatRoutes from './routes/chat'

const app = new Hono<{ Bindings: Bindings }>()

// --------------------
// 🔧 GLOBAL MIDDLEWARE
// --------------------
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// --------------------
// ❌ GLOBAL ERROR HANDLER
// --------------------
app.onError((err, c) => {
  console.error('[API ERROR]:', err)
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  }, 500)
})

// --------------------
// 🟢 HEALTH CHECK
// --------------------
app.get('/', (c) => {
  return c.json({ status: 'Agent API running 🚀' })
})

// --------------------
// ✅ REGISTER ROUTES
// --------------------
app.route('/api/auth', authRoutes)
app.route('/api/services', serviceRoutes)
app.route('/api/book', bookingRoutes)
app.route('/api/chat', chatRoutes)

export default app