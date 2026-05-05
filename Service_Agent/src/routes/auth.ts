import { Hono } from "hono"
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// 🔐 Helper Function: Password Hashing (Cloudflare Workers Web Crypto API)
async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 📧 1. SEND OTP FOR REGISTRATION
// 📧 1. SEND OTP FOR REGISTRATION
app.post("/send-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ success: false, message: "Email is required" }, 400);

    // Check if user already exists
    const existingUser = await c.env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(email).first();
    if (existingUser) {
      return c.json({ success: false, message: "User already exists. Please login." }, 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; 

    // Save OTP to DB
    await c.env.DB.prepare(
      `INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?) 
       ON CONFLICT(email) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at`
    ).bind(email, otp, expiresAt).run();

    // Send Email using Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${c.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // 🔴 Yeh dhyan rakhein, free tier mein yahi 'from' email hona chahiye
        to: email,
        subject: "Your BOOKSS Verification OTP",
        html: `<h2>Welcome to BOOKSS!</h2><p>Your verification OTP is: <strong>${otp}</strong></p>`
      })
    });

    // 🔴 YAHAN HUMNE ERROR CHECKING KO UPDATE KIYA HAI
    // 🔴 YAHAN 'as any' LAGA DIYA HAI TAQUi TYPESCRIPT ERROR NA DE
    if (!resendRes.ok) {
      const errorData = (await resendRes.json()) as any; 
      console.error("Resend Error:", errorData);
      
      // Ab aapko UI par Resend ka exact error dikhega
      return c.json({ 
        success: false, 
        message: `API Error: ${errorData?.message || JSON.stringify(errorData)}` 
      }, 500);
    }

    return c.json({ success: true, message: "OTP sent successfully!" });
  } catch (err: any) {
    console.error(err);
    return c.json({ success: false, message: `Server Error: ${err.message}` }, 500);
  }
});

// 📝 2. VERIFY OTP & REGISTER
app.post("/register", async (c) => {
  try {
    const { name, email, password, otp } = await c.req.json();

    if (!name || !email || !password || !otp) {
      return c.json({ success: false, message: "All fields are required" }, 400);
    }

    // Check OTP in DB
    const otpRecord = await c.env.DB.prepare("SELECT * FROM otps WHERE email = ?").bind(email).first<any>();

    if (!otpRecord) {
      return c.json({ success: false, message: "Please request an OTP first." }, 400);
    }

    if (otpRecord.otp !== String(otp)) {
      return c.json({ success: false, message: "Invalid OTP." }, 400);
    }

    if (Date.now() > otpRecord.expires_at) {
      return c.json({ success: false, message: "OTP has expired. Please request a new one." }, 400);
    }

    // Hash Password & Save User
    const hashedPassword = await hashPassword(password);
    await c.env.DB.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    ).bind(name, email, hashedPassword).run();

    // Delete used OTP
    await c.env.DB.prepare("DELETE FROM otps WHERE email = ?").bind(email).run();

    return c.json({ success: true, message: "Registration successful! You can now login." });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// 🔑 3. LOGIN
app.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, message: "Email and password are required" }, 400);
    }

    // Fetch User
    const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<any>();

    if (!user) {
      return c.json({ success: false, message: "Invalid email or password" }, 401);
    }

    // Verify Password
    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return c.json({ success: false, message: "Invalid email or password" }, 401);
    }

    // Return User Data (Without Password)
    const userData = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      token: "mock-jwt-token-123", // You can replace this with actual JWT logic later
    };

    return c.json({ success: true, user: userData, message: "Login successful!" });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export default app;