import { Hono } from 'hono'
import type { Bindings } from '../types'

const chat = new Hono<{ Bindings: Bindings }>()

const saveConversation = async (db: D1Database, sessionId: string, userMsg: string, aiMsg: string) => {
  await db.prepare(
    `INSERT INTO conversations (session_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)`
  ).bind(sessionId, userMsg, sessionId, aiMsg).run();
};

chat.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, message, userName } = body;
    const msg = String(message).toLowerCase().trim();
    const db = c.env.DB;

    let reply = "";
    let options: string[] = [];

    // ==========================================
    // 1. MAIN MENU & GREETING
    // ==========================================
    if (["hi", "hello", "hey", "namaste", "main menu"].includes(msg)) {
      reply = `Hi ${userName}! Welcome to BOOKSS. How can I help you today?`;
      options = ["Book a Service", "My Bookings", "Cancel a Booking", "My Profile", "Help & Support"];
    }
    
    // ==========================================
    // 2. HELP & CUSTOMER SUPPORT (NEW)
    // ==========================================
    else if (msg.includes("help") || msg.includes("support") || msg.includes("customer care") || msg.includes("contact")) {
      reply = `We are here to help! For any queries or issues, please contact our Customer Care at +91-98765-43210 or email us at support@bookss.com.`;
      options = ["Main Menu"];
    }

    // ==========================================
    // 3. USER PROFILE DETAILS (NEW - DATABASE DRIVEN)
    // ==========================================
    else if (msg.includes("my profile") || msg.includes("my details") || msg.includes("account")) {
      try {
        // Assuming you have a 'users' table with email and phone. 
        // If these columns don't exist, it will safely fall to the catch block.
        const { results: userProfile } = await db.prepare("SELECT email, phone FROM users WHERE name = ?").bind(userName).all();
        
        if (userProfile.length > 0) {
          const u = userProfile[0] as any;
          reply = `Here are your account details:\n👤 Name: ${userName}\n📧 Email: ${u.email || 'Not updated'}\n📱 Phone: ${u.phone || 'Not updated'}`;
        } else {
          reply = `👤 Name: ${userName}\n(Update your profile in the app to see more details here).`;
        }
        options = ["Main Menu"];
      } catch (e) {
        // Safe fallback just in case 'users' table or columns are missing
        reply = `👤 Name: ${userName}\n(Your complete details are securely stored in your account settings).`;
        options = ["Main Menu"];
      }
    }

    // ==========================================
    // 4. CANCELLATION INTENT
    // ==========================================
    else if (msg === "cancel a booking" || (msg.includes("cancel") && !msg.includes("#"))) {
      const { results } = await db.prepare(`
        SELECT b.id, s.name as service_name 
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.user_name = ? AND b.status != 'Cancelled'
        ORDER BY b.created_at DESC LIMIT 10
      `).bind(userName).all();

      if (results.length > 0) {
        reply = `Alright ${userName}, which booking would you like to cancel?`;
        options = results.map((b: any) => `Cancel #${b.id} (${b.service_name})`);
        options.push("Main Menu");
      } else {
        reply = "No active bookings found that can be cancelled.";
        options = ["Book a Service", "Main Menu"];
      }
    }

    // ==========================================
    // 5. EXECUTE CANCELLATION
    // ==========================================
    else if (msg.includes("cancel #")) {
      const bookingId = msg.split('#')[1].split(' ')[0];

      try {
        await db.prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ?")
          .bind(bookingId)
          .run();
        
        reply = `Success! Booking #${bookingId} has been cancelled. Its status will show as 'Cancelled' in your booking list.`;
        options = ["My Bookings", "Book a Service", "Main Menu"];
      } catch (e) {
        reply = "Error: Failed to update the database. Please try again.";
        options = ["Main Menu"];
      }
    }

    // ==========================================
    // 6. MY BOOKINGS
    // ==========================================
    else if (msg === "my bookings") {
      const { results } = await db.prepare(`
        SELECT b.id, b.booking_date, b.status, s.name as service_name 
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.user_name = ? AND b.status != 'Cancelled' 
        ORDER BY b.created_at DESC LIMIT 10
      `).bind(userName).all();

      if (results.length > 0) {
        reply = `Here are your active BOOKSS bookings:\n`;
        results.forEach((b: any, i: number) => {
          reply += `\n${i+1}. ${b.service_name} (#${b.id})\n${b.booking_date}\n Status: ${b.status}\n`;
        });
        options = ["Book a Service", "Cancel a Booking", "Main Menu"];
      } else {
        reply = "You have no active or pending bookings.";
        options = ["Book a Service", "Main Menu"];
      }
    }

    // ==========================================
    // 7. BOOK A SERVICE (Shows Categories)
    // ==========================================
    else if (msg === "book a service") {
      const { results } = await db.prepare("SELECT DISTINCT category FROM services").all();
      reply = "Please select a category:";
      options = results.map((r: any) => r.category);
    }
    
    // ==========================================
    // 8. CONFIRM BOOKING (Final step)
    // ==========================================
    else if (msg === "yes, book now") {
      reply = "Great! Please navigate to the 'Booking' or 'Cart' tab to finalize your date and time.";
      options = ["My Bookings", "Main Menu"];
    }

    // ==========================================
    // 9. DYNAMIC CHECK: CATEGORY or SERVICE NAME
    // ==========================================
    else {
      // Check if it's a Category Name
      const { results: services } = await db.prepare(
        "SELECT name FROM services WHERE LOWER(category) = ?"
      ).bind(msg).all();

      if (services.length > 0) {
        reply = `Which ${message} service do you need?`;
        options = services.map((s: any) => s.name);
        options.push("Main Menu");
      } 
      else {
        // Check if it's a Specific Service Name
        const { results: serviceDetail } = await db.prepare(
          "SELECT price, description FROM services WHERE LOWER(name) = ?"
        ).bind(msg).all();

        if (serviceDetail.length > 0) {
          const s = serviceDetail[0] as any;
          reply = `${message} Details:\n\nPrice: ₹${s.price}\nDescription: ${s.description}\n\nWould you like to book this service?`;
          options = ["Yes, Book Now", "Main Menu"];
        }
      }
    }
    
    // ==========================================
    // 10. AI FALLBACK (SMART CUSTOMER CARE)
    // ==========================================
    if (!reply) {
      try {
        const aiRes = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { 
              role: 'system', 
              content: `You are the BOOKSS AI. Be brief. 1 sentence max. If you cannot answer a question, tell the user to contact customer care at +91-98765-43210. Tell ${userName} to use buttons.` 
            },
            { role: 'user', content: message }
          ]
        });
        reply = aiRes.response.split(/[.!?]/)[0] + ". Please select an option:";
        options = ["Help & Support", "Main Menu"];
      } catch (e) {
        reply = "I'm having a connection issue. Please use the menu buttons:";
        options = ["Help & Support", "Main Menu"];
      }
    }

    await saveConversation(db, sessionId, message, reply);
    return c.json({ success: true, reply, options });

  } catch (err) {
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

export default chat;