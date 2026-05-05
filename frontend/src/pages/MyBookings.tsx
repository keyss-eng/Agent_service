import { useState, useEffect } from "react"
import { API } from "../api/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  SearchX
} from "lucide-react"

// TypeScript interface for Booking Data
interface BookingRecord {
  id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  created_at: string;
  // Optional: If you fetch service name from DB via JOIN
  service_name?: string; 
}

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;
      
      try {
        // Fetch bookings for the logged-in user
        // Note: Make sure your backend has a GET /book endpoint to handle this!
        const res = await API.get(`/book?user_name=${user.name}`)
        
        if (res.data.success) {
          setBookings(res.data.bookings || [])
        } else {
          setError("Failed to load your bookings.")
        }
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Unable to connect to the server.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyBookings()
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 mt-2">Track and manage your scheduled services</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          // ⏳ Loading Skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          // 📭 Empty State
          <div className="bg-white py-16 px-6 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <SearchX className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Bookings Found</h3>
            <p className="text-slate-500 max-w-md mb-8">
              You haven't scheduled any services yet. Explore our catalog to find what you need.
            </p>
            <button 
              onClick={() => navigate('/home')}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              Browse Services <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          // 📅 Booking List
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-sky-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 size={14} />
                      Confirmed
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ID: #{booking.id.toString().padStart(4, '0')}
                    </span>
                  </div>
                  
                  {/* Defaulting to "Premium Service" if service_name isn't passed from backend */}
                  <h3 className="text-lg font-bold text-slate-900">
                    {booking.service_name || `Service Appointment`}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Booked for: {user?.name}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 bg-slate-50 p-4 rounded-xl sm:bg-transparent sm:p-0">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <CalendarDays className="text-sky-500 w-5 h-5" />
                    {booking.booking_date}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="text-sky-500 w-5 h-5" />
                    {booking.booking_time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  )
}