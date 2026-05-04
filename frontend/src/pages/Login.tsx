import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { API } from "../api/api"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const { user, login } = useAuth() // Fixed: useAuth exports 'login'
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("") // Added: backend requires email
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      navigate("/home")
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !email.trim()) {
      setError("Please enter your full name and email.")
      return
    }

    setIsLoading(true)

    try {
      const res = await API.post("/auth/login", { // Fixed: added /auth prefix based on your backend
        name: name.trim(),
        email: email.trim(),
      })

      if (res.data.success) {
        login(res.data.user) // Fixed: Using login function, saves to localStorage automatically
        navigate("/home")
      } else {
        setError(res.data.message || "Login failed. Try again.")
      }
    } catch (err) {
      console.error("Login failed:", err)
      setError("Unable to connect to the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2 text-sm">Enter your details to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              required
              disabled={isLoading}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all disabled:opacity-50"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              disabled={isLoading}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all disabled:opacity-50"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !email.trim()}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex justify-center items-center disabled:opacity-70"
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  )
}