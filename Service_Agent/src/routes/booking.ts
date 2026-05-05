import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  const { user_name, service_id, date, time } = await c.req.json()

  if (!user_name || !service_id || !date || !time) {
    return c.json({ success: false, error: 'Missing required fields' }, 400)
  }

  try {
    await c.env.DB.prepare(
      "INSERT INTO bookings (user_name, service_id, booking_date, booking_time) VALUES (?, ?, ?, ?)"
    ).bind(user_name, service_id, date, time).run()

    return c.json({ success: true })
  } catch (error: any) {
    console.error("Database error:", error.message)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// src/routes/booking.ts (Backend)

// GET user bookings
app.get('/', async (c) => {
  const userName = c.req.query('user_name')
  
  if (!userName) {
    return c.json({ success: false, error: 'User name is required' }, 400)
  }

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT bookings.*, services.name as service_name 
       FROM bookings 
       LEFT JOIN services ON bookings.service_id = services.id 
       WHERE user_name = ? 
       ORDER BY booking_date DESC, booking_time DESC`
    ).bind(userName).all()

    return c.json({ success: true, bookings: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app