// src/routes/services.ts
import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM services ORDER BY id ASC"
  ).all()
  return c.json(results)
})

app.post('/', async (c) => {
  const { name, category, price, description } = await c.req.json()

  await c.env.DB.prepare(
    "INSERT INTO services (name, category, price, description) VALUES (?, ?, ?, ?)"
  ).bind(name, category, price, description).run()

  return c.json({ success: true })
})

export default app