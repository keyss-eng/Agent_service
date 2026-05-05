import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { API } from "../api/api"
import { useNavigate, useLocation } from "react-router-dom"
import { Mail, Lock, User, ShieldCheck } from "lucide-react"

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // UI States
  const [isLoginView, setIsLoginView] = useState(true) // true = Login, false = Register
  const [otpSent, setOtpSent] = useState(false)

  // Form States
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")

  // Status States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(location.state?.message || "")
  const [successMsg, setSuccessMsg] = useState("")

  // Agar user pehle se login hai toh usko Home par bhej do
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true })
    }
  }, [user, navigate])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🟢 1. LOGIN FUNCTION
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccessMsg("")

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.")
      return
    }

    setIsLoading(true)
    try {
      const res = await API.post("/auth/login", {
        email: email.trim(),
        password: password.trim()
      })

      if (res.data.success) {
        login(res.data.user)
        navigate("/home", { replace: true })
      } else {
        setError(res.data.message || "Login failed. Try again.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to connect to the server.")
    } finally {
      setIsLoading(false)
    }
  }

  // 🟢 2. SEND OTP FUNCTION (For Registration)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccessMsg("")

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all details before requesting OTP.")
      return
    }
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)
    try {
      const res = await API.post("/auth/send-otp", { email: email.trim() })
      if (res.data.success) {
        setOtpSent(true)
        setSuccessMsg("OTP sent to your email! Please check your inbox.")
      } else {
        setError(res.data.message || "Failed to send OTP.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending OTP.")
    } finally {
      setIsLoading(false)
    }
  }

  // 🟢 3. VERIFY OTP & REGISTER FUNCTION
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccessMsg("")

    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.")
      return
    }

    setIsLoading(true)
    try {
      const res = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        otp: otp.trim()
      })

      if (res.data.success) {
        setSuccessMsg("Registration successful! You can now login.")
        // Reset form aur Login view par bhej do
        setOtpSent(false)
        setOtp("")
        setPassword("")
        setIsLoginView(true)
      } else {
        setError(res.data.message || "Registration failed.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP or error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md transition-all">

        {/* Header Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => { setIsLoginView(true); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLoginView ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLoginView(false); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLoginView ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isLoginView ? "Welcome Back!" : otpSent ? "Verify Your Email" : "Create an Account"}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {isLoginView ? "Enter your credentials to access your account" : otpSent ? `Enter the OTP sent to ${email}` : "Join UttamSewa for expert home services"}
          </p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-semibold">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 text-center font-semibold">
            {successMsg}
          </div>
        )}

        {/* 🔑 LOGIN FORM */}
        {isLoginView && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input type="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading || !email || !password}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl transition-all mt-6 shadow-sm disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* 📝 REGISTER FORM */}
        {!isLoginView && (
          <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="space-y-4">

            {/* Step 1: Details (Hide this if OTP is sent) */}
            {!otpSent && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input type="text" required disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="Rahul Sharma"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input type="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: OTP Input (Show this only if OTP is sent) */}
            {otpSent && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 text-center">Enter 6-Digit OTP</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input type="text" required disabled={isLoading} value={otp} onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-11 p-3 bg-slate-50 border border-sky-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-center font-bold tracking-widest text-lg"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-xs text-slate-500 mt-4 hover:text-sky-500 font-medium">
                  Wrong email? Go back
                </button>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all mt-6 shadow-sm disabled:opacity-60"
            >
              {isLoading
                ? "Processing..."
                : otpSent
                  ? "Verify & Create Account"
                  : "Send OTP"}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}