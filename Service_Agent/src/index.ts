import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'

import authRoutes from './routes/auth'
import serviceRoutes from './routes/services'
import bookingRoutes from './routes/booking'
import chatRoutes from './routes/chat'

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.onError((err, c) => {
  console.error('[API ERROR]:', err)
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  }, 500)
})

app.get('/', (c) => {
  return c.json({ status: 'Agent API running' })
})

app.route('/api/auth', authRoutes)
app.route('/api/services', serviceRoutes)
app.route('/api/book', bookingRoutes)
app.route('/api/chat', chatRoutes)

export default app