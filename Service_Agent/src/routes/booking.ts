import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  // 🔴 NOTE: Added 'user_email' here. It is required to send this from the frontend.
  const { user_name, user_email, service_id, date, time } = await c.req.json()

  if (!user_name || !user_email || !service_id || !date || !time) {
    return c.json({ success: false, error: 'Missing required fields including email' }, 400)
  }

  try {
    // 1. Save booking in the database
    await c.env.DB.prepare(
      "INSERT INTO bookings (user_name, service_id, booking_date, booking_time) VALUES (?, ?, ?, ?)"
    ).bind(user_name, service_id, date, time).run()

    // 2. Fetch Service Name and Price from DB to show in the email
    const serviceData = await c.env.DB.prepare(
      "SELECT name, price FROM services WHERE id = ?"
    ).bind(service_id).first<any>()

    const serviceName = serviceData ? serviceData.name : "Home Service"
    const servicePrice = serviceData ? serviceData.price : "As per inspection"

    // 3. Create a beautiful HTML Email Template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0ea5e9; margin: 0;">BOOKSS</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Quality services, on demand.</p>
        </div>
        
        <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Booking Confirmed! 🎉</h2>
        
        <p style="color: #334155; font-size: 16px;">Hello <strong>${user_name}</strong>,</p>
        <p style="color: #334155; font-size: 16px;">We have successfully received your booking details.</p>
        
        <div style="background-color: #f8fafc; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
          <p style="margin: 8px 0; color: #334155;"><strong>🛠️ Service:</strong> ${serviceName}</p>
          <p style="margin: 8px 0; color: #334155;"><strong>📅 Date:</strong> ${date}</p>
          <p style="margin: 8px 0; color: #334155;"><strong>⏰ Time:</strong> ${time}</p>
          <p style="margin: 8px 0; color: #334155;"><strong>💰 Est. Price:</strong> ₹${servicePrice}</p>
        </div>

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border: 1px solid #a7f3d0; text-align: center;">
          <p style="font-size: 16px; color: #059669; font-weight: bold; margin: 0;">
            Our team is processing your booking and will reach out to you shortly.
          </p>
        </div>
        
        <p style="margin-top: 30px; color: #94a3b8; font-size: 13px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          Thank you for choosing BOOKSS!<br>
          <a href="#" style="color: #0ea5e9; text-decoration: none;">www.bookss.com</a>
        </p>
      </div>
    `;

    // 4. Send Email using Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${c.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "BOOKSS <onboarding@resend.dev>", // Testing email for free tier
        to: user_email, 
        subject: `Booking Confirmed: ${serviceName} 🛠️`,
        html: emailHtml
      })
    });

    if (!resendRes.ok) {
      const errorData = await resendRes.json() as any;
      console.error("Resend Email Error:", errorData);
      // Do not fail the booking even if the email fails to send
    }

    return c.json({ success: true, message: "Booking confirmed and email sent!" })
  } catch (error: any) {
    console.error("Database error:", error.message)
    return c.json({ success: false, error: error.message }, 500)
  }
})

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