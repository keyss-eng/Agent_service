import { Hono } from 'hono'
import type { Bindings } from '../types'

const chat = new Hono<{ Bindings: Bindings }>()


const DEFAULT_MENU = ["Book a Service", "My Bookings", "Cancel a Booking", "My Profile", "Help & Support"];
const FALLBACK_MENU = ["Book a Service", "Help & Support", "Main Menu"];

// --- Helper Functions ---
const saveConversation = async (db: D1Database, sessionId: string, userMsg: string, aiMsg: string) => {
  try {
    await db.prepare(
      `INSERT INTO conversations (session_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)`
    ).bind(sessionId, userMsg, sessionId, aiMsg).run();
  } catch (error) {
    console.error("[Chat DB Error] Failed to save conversation:", error);
  }
};

// --- Main Chat Handler ---
chat.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, message, userName } = body;

    if (!sessionId || !message || !userName) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const msg = String(message).toLowerCase().trim();
    const db = c.env.DB;

    let reply = "";
    let systemInstruction = "";
    let options: string[] = [];

    // 1. General Greetings & Main Menu
    if (["hi", "hello", "hey", "namaste", "main menu"].includes(msg)) {
      systemInstruction = `Greet the user warmly. Welcome them to BOOKSS. Ask how you can help them today.`;
      options = DEFAULT_MENU;
    }

    // 2. Help & Customer Support
    else if (msg.includes("help") || msg.includes("support") || msg.includes("customer care") || msg.includes("contact")) {
      systemInstruction = `The user needs help. Provide our Customer Care number (+91-98765-43210) and email (support@bookss.com) in a polite way.`;
      options = ["Main Menu"];
    }

    // 3. User Profile Info
    else if (msg.includes("my profile") || msg.includes("my details") || msg.includes("account")) {
      try {
        const { results: userProfile } = await db.prepare("SELECT email, phone FROM users WHERE name = ?").bind(userName).all();
        if (userProfile.length > 0) {
          const user = userProfile[0] as { email: string; phone: string };
          systemInstruction = `Tell the user their profile details nicely. Name: ${userName}, Email: ${user.email || 'Not updated'}, Phone: ${user.phone || 'Not updated'}.`;
        } else {
          systemInstruction = `Tell the user their name is ${userName} but other details are not updated.`;
        }
      } catch (e) {
        systemInstruction = `Tell the user their name is ${userName} and their details are securely saved.`;
      }
      options = ["Main Menu"];
    }

    // 4. Booking Cancellation (AI JSON Mode)
    else if (msg.includes("cancel") || msg.includes("delete")) {
      const { results: activeBookings } = await db.prepare(`
        SELECT b.id, s.name as service_name, b.booking_date 
        FROM bookings b JOIN services s ON b.service_id = s.id
        WHERE b.user_name = ? AND b.status != 'Cancelled' ORDER BY b.created_at DESC LIMIT 5
      `).bind(userName).all();

      if (activeBookings.length > 0) {
        const cancelPrompt = `
          The user wants to cancel a booking. 
          User's message: "${message}"
          User's active bookings: ${JSON.stringify(activeBookings)}
          
          TASK: Identify WHICH booking ID the user wants to cancel.
          STRICT RULE: You MUST reply ONLY in a valid JSON format.
          FORMAT: {"cancel_id": <number>}
          If unsure, return {"cancel_id": null}.
        `;

        try {
          const aiRes = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [{ role: 'system', content: cancelPrompt }]
          });

          const cleanJson = aiRes.response.match(/\{[\s\S]*\}/)?.[0] || "{}";
          const parsedData = JSON.parse(cleanJson);

          if (parsedData.cancel_id) {
            await db.prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ?").bind(parsedData.cancel_id).run();
            reply = `Success! Your booking #${parsedData.cancel_id} has been cancelled.`;
            options = ["My Bookings", "Book a Service", "Main Menu"];
          } else {
            reply = "Which booking would you like to cancel? Please specify the service name or ID.";
            options = activeBookings.map((b: any) => `Cancel #${b.id} (${b.service_name})`);
            options.push("Main Menu");
          }
        } catch (e) {
          reply = "Please select the booking you want to cancel from the options below:";
          options = activeBookings.map((b: any) => `Cancel #${b.id} (${b.service_name})`);
        }
      } else {
        reply = "You do not have any active bookings to cancel.";
        options = ["Book a Service", "Main Menu"];
      }
    }

    // 5. Retrieve User Bookings
    else if (msg === "my bookings") {
      const { results } = await db.prepare(`
        SELECT b.id, b.booking_date, b.status, s.name as service_name 
        FROM bookings b JOIN services s ON b.service_id = s.id
        WHERE b.user_name = ? AND b.status != 'Cancelled' ORDER BY b.created_at DESC LIMIT 10
      `).bind(userName).all();

      if (results.length > 0) {
        reply = `Here are your active BOOKSS bookings:\n`;
        results.forEach((b: any, i: number) => {
          reply += `\n${i + 1}. ${b.service_name} (#${b.id})\nDate: ${b.booking_date}\nStatus: ${b.status}\n`;
        });
        options = ["Book a Service", "Main Menu"];
      } else {
        reply = "You have no active or pending bookings.";
        options = ["Book a Service", "Main Menu"];
      }
    }

    // 6. View Service Categories
    else if (msg === "book a service" || msg === "services") {
      const { results } = await db.prepare("SELECT DISTINCT category FROM services").all();
      const categories = results.map((r: any) => r.category).join(", ");
      systemInstruction = `Tell the user we have these categories: ${categories}. Ask which one they need.`;
      options = results.map((r: any) => r.category);
    }

    // 7. Core AI Intent Engine (Routing & Direct Booking)
    if (!reply) {
      try {
        const { results: rawHistory } = await db.prepare(
          "SELECT role, content FROM conversations WHERE session_id = ? ORDER BY id DESC LIMIT 3"
        ).bind(sessionId).all();

        const chatHistory = rawHistory.reverse().map((r: any) => `${r.role.toUpperCase()}: ${r.content}`).join("\n");
        const { results: availableServices } = await db.prepare("SELECT id, name FROM services").all();
        const servicesJson = JSON.stringify(availableServices);

        const aiPrompt = `
          You are the AI assistant for the BOOKSS platform. 
          User's Name: ${userName}
          Available Services: ${servicesJson}

          Recent Conversation Context:
          ${chatHistory}

          Current User Message: "${message}"

          TASK: Analyze if the user wants to BOOK a service, or just chat.
          - If the user wants to book, you MUST extract the service_id, date, and time based on their text and the recent context.
          - If they want to book but date or time is missing, set action to "chat" and naturally ask them what date and time they prefer.
          - If they are just asking a question, set action to "chat" and answer nicely.
          
          STRICT RULE: Reply ONLY in valid JSON. No introductory text. No markdown.
          FORMAT:
          {
            "action": "book" | "chat",
            "service_id": <number or null>,
            "date": "<YYYY-MM-DD or null>",
            "time": "<HH:MM AM/PM or null>",
            "reply": "<Your conversational response>"
          }
        `;

        const aiRes = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [{ role: 'system', content: aiPrompt }]
        });

        // Robust JSON parsing fallback
        let aiData = { action: 'chat', service_id: null, date: null, time: null, reply: "I'm sorry, could you clarify what you need help with?" };
        try {
          const cleanJson = aiRes.response.match(/\{[\s\S]*\}/)?.[0] || "{}";
          aiData = { ...aiData, ...JSON.parse(cleanJson) };
        } catch (err) {
          console.warn("[Chat AI] Failed to parse JSON response, falling back to chat mode.");
        }

        // Execute DB Insertion if intent is to book
        if (aiData.action === "book" && aiData.service_id && aiData.date && aiData.time) {
          await db.prepare(
            "INSERT INTO bookings (user_name, service_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, 'Pending')"
          ).bind(userName, aiData.service_id, aiData.date, aiData.time).run();

          reply = `Booking Confirmed! I have successfully scheduled your service for ${aiData.date} at ${aiData.time}.`;
          options = ["My Bookings", "Main Menu"];
        } else {
          reply = aiData.reply || "How can I help you today?";

          // Smart option suggestions based on AI's conversational response
          const lowerReply = reply.toLowerCase();
          if (lowerReply.includes("date") || lowerReply.includes("time")) {
            options = ["Tomorrow morning", "Today afternoon", "Cancel"];
          } else if (options.length === 0) {
            options = FALLBACK_MENU;
          }
        }
      } catch (error) {
        console.error("[Chat AI Error] Engine failed:", error);
        reply = "I'm having a connection issue right now. Please use the menu below.";
        options = FALLBACK_MENU;
      }
    }

    // 8. Save Conversation & Return Response
    await saveConversation(db, sessionId, message, reply);
    return c.json({ success: true, reply, options });

  } catch (err) {
    console.error("[Chat Post Error] Unhandled exception:", err);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default chat;