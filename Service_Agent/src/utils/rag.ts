export const getContext = async (db: D1Database, query: string) => {
  const { results } = await db.prepare(
    "SELECT name, price, description FROM services WHERE name LIKE ? LIMIT 5"
  ).bind(`%${query}%`).all()

  if (!results.length) return "No relevant services found."

  return results
    .map((s: any) => `${s.name} - ₹${s.price} - ${s.description}`)
    .join("\n")
}