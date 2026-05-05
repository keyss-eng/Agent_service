import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { API } from "../api/api"
import { useNavigate, useLocation } from "react-router-dom"

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // 🟢 Protected Route से आने वाले मैसेज को कैच करना
  const [error, setError] = useState(location.state?.message || "")

  // अगर पहले से लॉगिन है तो वापस होम पर भेज दें
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true }) 
    }
  }, [user, navigate])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setError("Please enter your full name and email.")
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)

    try {
      const res = await API.post("/auth/login", { 
        name: trimmedName,
        email: trimmedEmail,
      })

      if (res.data.success) {
        login(res.data.user) 
        navigate("/home", { replace: true })
      } else {
        setError(res.data.message || "Login failed. Try again.")
      }
    } catch (err: any) {
      console.error("Login Error:", err)
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to connect to the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 w-full max-w-sm">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-950">Welcome to UttamSewa</h2>
          <p className="text-slate-500 mt-2 text-sm">Enter your details to continue</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-blue-950 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              disabled={isLoading}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all disabled:opacity-50"
              placeholder="e.g. Vishal Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-blue-950 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              disabled={isLoading}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all disabled:opacity-50"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !email.trim()}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg transition-colors mt-4 flex justify-center items-center shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>

      </div>
    </div>
  )
}