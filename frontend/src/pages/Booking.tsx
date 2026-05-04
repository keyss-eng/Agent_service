import { useState } from "react"
import { API } from "../api/api"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useNavigate } from "react-router-dom"
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  User,
  ShoppingBag
} from "lucide-react"

export default function Booking() {
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  // Get today's date in YYYY-MM-DD format to prevent booking in the past
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
  const platformFee = cart.length > 0 ? 49 : 0
  const finalTotal = subtotal + platformFee

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("Session expired. Please log in again.")
      setTimeout(() => navigate("/"), 2000)
      return
    }

    if (cart.length === 0) {
      setError("Your cart is empty. Please add services before booking.")
      return
    }

    setIsSubmitting(true)
    try {
      // We take the first item's ID to satisfy the current backend schema. 
      // In the future, you can upgrade the backend to accept an array of IDs!
      const primaryServiceId = cart[0].id

      const res = await API.post("/book", {
        user_name: user.name, 
        service_id: primaryServiceId,      
        date,
        time,
      })

      if (res.data.success) {
        setIsSuccess(true)
        clearCart() // Empty the cart on successful booking
      } else {
        setError(res.data.error || "Failed to confirm booking.")
      }
    } catch (err) {
      console.error("Booking failed:", err)
      setError("Failed to connect to the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 🎉 SUCCESS STATE UI
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8">
            Thank you, {user?.name}. Your service has been scheduled for <span className="font-semibold text-slate-700">{date}</span> at <span className="font-semibold text-slate-700">{time}</span>.
          </p>
          <button 
            onClick={() => navigate('/home')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  // 📅 BOOKING FORM UI
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finalize Booking</h1>
          <p className="text-slate-500 mt-2">Choose a date and time for your service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Booking Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CalendarDays className="text-sky-500" />
                Schedule Details
              </h2>
              
              <form onSubmit={handleBooking} className="space-y-6">
                
                {/* User Info (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Booking For</label>
                  <div className="flex items-center gap-3 w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-600">
                    <User size={18} className="text-slate-400" />
                    <span className="font-medium">{user?.name || "Guest"}</span>
                    <span className="text-slate-400 text-sm ml-auto">{user?.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                    <div className="relative">
                      <input 
                        type="date"
                        required
                        min={today}
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full border border-slate-300 rounded-xl p-3.5 pl-10 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)} 
                      />
                      <CalendarDays className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Time Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Time</label>
                    <div className="relative">
                      <input 
                        type="time"
                        required
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full border border-slate-300 rounded-xl p-3.5 pl-10 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)} 
                      />
                      <Clock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-sky-500"
                >
                  {isSubmitting ? "Processing..." : "Confirm Schedule"}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Service Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="text-sky-500" />
                Service Summary
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-500 text-sm">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                        </div>
                        <span className="font-bold text-slate-900">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3 mb-6 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span className="font-medium text-slate-900">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="text-base font-bold text-slate-900">Total to Pay</span>
                      <span className="text-2xl font-extrabold text-sky-500">₹{finalTotal}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <ShieldCheck className="text-slate-500 w-5 h-5 flex-shrink-0" />
                <p className="text-xs text-slate-600 font-medium">
                  Payment will be collected by the professional after the service is completed to your satisfaction.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}