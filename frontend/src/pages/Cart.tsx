import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { API } from "../api/api"
import { useNavigate } from "react-router-dom"
import { Trash2, Calendar, Clock, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react"

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [error, setError] = useState("")

  // Total Price Calculate karna
  const totalPrice = cart.reduce((total, item) => total + (item.price || 0), 0)

  const handleCheckout = async () => {
    setError("")
    
    if (!user) {
      setError("Please login to book services.")
      setTimeout(() => navigate('/'), 2000)
      return
    }
    if (!date || !time) {
      setError("Please select both Date and Time for the service.")
      return
    }

    setIsBooking(true)

    try {
      // Agar cart mein multiple items hain, toh sabke liye alag booking create karenge
      await Promise.all(
        cart.map(async (service) => {
          const payload = {
            user_name: user.name,
            user_email: user.email, // 🔴 Naya Email Field for Notification
            service_id: service.id,
            date: date,
            time: time
          }
          await API.post("/booking", payload)
        })
      )

      // Booking Success ho gayi
      setBookingSuccess(true)
      clearCart() // Cart khali kar do
      
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || "Failed to complete booking. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  // Agar booking ho gayi hai toh Success Screen dikhao
  if (bookingSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8">
            Your service request has been received. We have sent a confirmation email to <strong>{user?.email}</strong> with all the details.
          </p>
          <button 
            onClick={() => navigate("/my-bookings")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            View My Bookings <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Your Cart</h1>

        {cart.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added any services yet.</p>
            <button 
              onClick={() => navigate("/home")}
              className="px-8 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-sm"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1 block">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-2xl font-black text-slate-900 mt-2">₹{item.price}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="mt-4 sm:mt-0 p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl h-fit sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Booking Details</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} // Disable past dates
                      className="w-full pl-11 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-11 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-bold">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Visiting Charge</span>
                  <span className="text-green-500 font-bold">Free</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-black text-sky-500">₹{totalPrice}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isBooking || cart.length === 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-md disabled:opacity-60 flex justify-center items-center gap-2"
              >
                {isBooking ? (
                  "Processing Booking..."
                ) : (
                  <>Confirm Booking <CheckCircle size={18} /></>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}