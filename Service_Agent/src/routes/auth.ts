// src/routes/auth.ts
import { Hono } from "hono"
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

app.post("/login", async (c) => {
  try {
    const { name, email } = await c.req.json()

    if (!name || !email) {
      return c.json({ success: false, message: "Name and Email required" }, 400)
    }

    const user = {
      id: Date.now().toString(),
      name,
      email,
      token: "mock-jwt-token-123",
    }

    return c.json({ success: true, user })
  } catch (err) {
    return c.json({ success: false, error: "Invalid request" }, 500)
  }
})

app.get("/me", (c) => {
  return c.json({ message: "Auth route is working!" })
})

export default app