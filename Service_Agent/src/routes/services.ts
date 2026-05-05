import { Hono } from 'hono'
import type { Bindings } from '../types'

const service = new Hono<{ Bindings: Bindings }>()

// 1. Get ALL services (useful for dashboard)
service.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM services ORDER BY category ASC").all();
    return c.json({ success: true, services: results });
  } catch (error: any) {
    return c.json({ success: false, error: "Database Connection Failed" }, 500);
  }
})

// 2. Get services BY CATEGORY (useful for chatbot options)
service.get('/category/:name', async (c) => {
  try {
    const categoryName = c.req.param('name');
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, price, description FROM services WHERE LOWER(category) = ?"
    ).bind(categoryName.toLowerCase()).all();

    return c.json({ 
      success: true, 
      count: results.length,
      services: results 
    });
  } catch (error: any) {
    return c.json({ success: false, error: "Failed to fetch category data" }, 500);
  }
})

export default service;