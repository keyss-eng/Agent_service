import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM services").all();
    return c.json({ success: true, services: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
})

export default app