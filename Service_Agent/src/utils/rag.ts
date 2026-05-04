export const getContext = async (db: D1Database, query: string) => {
  // 1. Agar query bahut lambi hai, toh usko chota karein ya default search lagayein
  // Taki SQL exact match dhoondne me fail na ho
  const safeQuery = query.split(' ')[0]; // Basic example: get first word if it's too long

  const { results } = await db.prepare(
    `SELECT name, category, price, description 
     FROM services 
     WHERE name LIKE ? OR category LIKE ? OR description LIKE ? 
     LIMIT 5`
  ).bind(`%${query}%`, `%${query}%`, `%${query}%`).all()

  if (!results || results.length === 0) {
    return "No specific database context found. Answer generally."
  }

  // 2. AI ke samajhne ke liye clean format me data bhejein
  return results
    .map((s: any) => `Service: ${s.name} | Category: ${s.category} | Price: ₹${s.price} | Details: ${s.description}`)
    .join("\n")
}