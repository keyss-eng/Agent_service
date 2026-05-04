import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

const INTENT_REGEX = {
  GREETING: /^(hey|hello|hi|namaste|greetings)\b/i,
  AFFIRMATION: /^(yes|yeah|yep|ok|okay|sure|ha|haan|ji|absolutely)\b/i,
  BOOKING: /\b(book|schedule|hire|appointment)\b/i,
  PRICE: /\b(cheap|price|cost|rate|charges|list|fee)\b/i,
};

const SERVICE_KEYWORDS = [
  // \w* add karne se electric, electrician, electrical sab match honge!
  { key: 'electric', regex: /\b(electric\w*|wiring|wire|switch)\b/i },
  { key: 'plumb', regex: /\b(plumb\w*|pipe|leak|sink)\b/i },
  { key: 'repair', regex: /\b(ac|repair|service|cooling|appliance)\b/i },
  { key: 'clean', regex: /\b(clean\w*|sweep|mop|maid)\b/i },
];


const detectKeyword = (msg: string): string | null => {
  for (const service of SERVICE_KEYWORDS) {
    if (service.regex.test(msg)) return service.key;
  }
  return null;
};

const saveConversation = async (db: D1Database, sessionId: string, userMsg: string, aiMsg: string) => {
  await db.prepare(
    `INSERT INTO conversations (session_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)`
  ).bind(sessionId, userMsg, sessionId, aiMsg).run();
};

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const sessionId = body.sessionId;
    const message = body.message;
    const userName = body.userName || "Guest";

    if (!sessionId || !message) {
      return c.json({ error: "Missing required fields: sessionId or message" }, 400);
    }

    const db = c.env.DB;
    const msg = String(message).toLowerCase().trim();

    // 1. FETCH CONTEXT (Memory)
    const { results: history } = await db.prepare(
      'SELECT role, content FROM conversations WHERE session_id = ? ORDER BY id DESC LIMIT 6'
    ).bind(sessionId).all();

    const lastRow = history.find((row: any) => row.role === 'assistant') as { content: string } | undefined;
    const lastAssistantMsg = lastRow?.content ? String(lastRow.content).toLowerCase() : "";

    let reply = "";

   

    const keyword = detectKeyword(msg);
    const wantsBooking = INTENT_REGEX.BOOKING.test(msg);
    const wantsPrice = INTENT_REGEX.PRICE.test(msg);

    // ROUTE A: GREETINGS
    if (INTENT_REGEX.GREETING.test(msg)) {
      reply = `Hello ${userName}! 👋 Welcome to Agent Services. How can I help you today?`;
    } 
    
    // ROUTE B: CONTEXTUAL FOLLOW-UP (Yes/Ok)
    else if (INTENT_REGEX.AFFIRMATION.test(msg) && (lastAssistantMsg.includes("book this") || lastAssistantMsg.includes("schedule"))) {
      reply = "Great! Please navigate to the Booking tab at the top to select your preferred date and time.";
    }

    // ROUTE C: EXPLICIT BOOKING REQUEST
    else if (wantsBooking) {
      if (keyword) {
        const { results } = await db.prepare("SELECT name, price FROM services WHERE name LIKE ? OR category LIKE ? LIMIT 1").bind(`%${keyword}%`, `%${keyword}%`).all();
        reply = results.length > 0 
          ? `I found ${results[0].name} (₹${results[0].price}). Please navigate to the Booking tab to schedule this service.`
          : `I couldn't find exactly what you're looking for. Could you clarify the service?`;
      } else {
        reply = "I can help you book! Which specific service do you need? (e.g., Electrician, Cleaning, Plumbing, AC Repair)";
      }
    }

    // ROUTE D: SPECIFIC SERVICE INQUIRY (Details or Price)
    else if (keyword) {
      const { results } = await db.prepare("SELECT name, price, description FROM services WHERE name LIKE ? OR category LIKE ? LIMIT 1").bind(`%${keyword}%`, `%${keyword}%`).all();
      
      if (results.length > 0) {
        const s = results[0] as any;
        reply = wantsPrice 
          ? `The cost for ${s.name} is ₹${s.price}.`
          : `${s.name}:\nDetails: ${s.description || "Professional service"}.\nPrice: ₹${s.price}.\nWould you like to book this?`;
      }
    }

    // ROUTE E: GENERAL PRICE LIST
    else if (wantsPrice) {
      const { results } = await db.prepare("SELECT name, price FROM services ORDER BY price ASC LIMIT 5").all();
      reply = "Here is our standard price list:\n" + results.map((s: any) => `• ${s.name} - ₹${s.price}`).join("\n");
    }

    // ROUTE F: AI FALLBACK (LLaMA-3)
    if (!reply) {
      const formattedHistory = history.reverse().map((row: any) => ({ role: row.role, content: row.content }));
      const messages = [
        { role: 'system', content: `You are a professional home services assistant for a platform called UttamSewa. You are assisting ${userName}. Keep answers helpful, polite, and under 3 sentences.` },
        ...formattedHistory,
        { role: 'user', content: message }
      ];

      try {
        const aiRes = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages });
        reply = aiRes.response || "I am currently upgrading my systems. Please try asking about our prices or specific services!";
      } catch (err) {
        console.error("[AI ERROR]:", err);
        reply = "I'm having a little trouble connecting to my AI core. I can still help you check prices or book an electrician/plumber!";
      }
    }

    // Save state and respond
    await saveConversation(db, sessionId, message, reply);
    return c.json({ success: true, reply });

  } catch (err: any) {
    console.error("[CHAT FATAL ERROR]:", err);
    return c.json({ error: "Internal server error occurred." }, 500);
  }
});

export default app;