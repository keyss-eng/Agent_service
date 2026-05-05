import { useState, useEffect } from "react"
import { API } from "../api/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowRight,
  SearchX,
  ChevronRight,
  Filter
} from "lucide-react"

// Updated Interface with Status
interface BookingRecord {
  id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  created_at: string;
  service_name?: string; 
  status: string; // Database se aane wala status (Pending/Confirmed/Cancelled)
}

const FILTER_OPTIONS = ["All", "Pending", "Confirmed", "Cancelled"];

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // 👈 New State for Filter
  const [activeFilter, setActiveFilter] = useState("All") 

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;
      
      try {
        const res = await API.get(`/booking?user_name=${user.name}`)
        
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

  // 👈 Logic to filter bookings based on selected tab
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === "All") return true;
    return booking.status === activeFilter;
  });

  // --- Helper to render dynamic status badge ---
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wide border border-red-100">
            <XCircle size={12} /> Cancelled
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wide border border-amber-100">
            <AlertCircle size={12} /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Bookings</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your service history with BOOKSS</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm self-center md:self-end">
            <span className="text-sm font-bold text-slate-600">{bookings.length} Total Bookings</span>
          </div>
        </div>

        {/* 👈 Filter Tabs Section */}
        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 text-slate-400 mr-2">
            <Filter size={18} />
          </div>
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === filter
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {filter}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                activeFilter === filter ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {filter === "All" ? bookings.length : bookings.filter(b => b.status === filter).length}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-bold flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white border border-slate-200 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white py-20 px-6 text-center rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <SearchX className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              {activeFilter === "All" ? "No bookings yet" : `No ${activeFilter.toLowerCase()} bookings`}
            </h3>
            <p className="text-slate-500 max-w-sm mb-10 font-medium">
              {activeFilter === "All" 
                ? "Ready to make your home shine? Explore our top-rated services and book your first one today."
                : `You don't have any bookings with a '${activeFilter}' status right now.`}
            </p>
            {activeFilter === "All" && (
              <button 
                onClick={() => navigate('/home')}
                className="bg-slate-900 hover:bg-sky-600 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 active:scale-95"
              >
                Start Exploring <ArrowRight size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id} 
                className={`group relative bg-white p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-8 ${
                  booking.status === 'Cancelled' 
                  ? "border-slate-100 bg-slate-50/50 opacity-80" 
                  : "border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-200 hover:-translate-y-1"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={booking.status} />
                    <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{booking.id.toString().padStart(4, '0')}
                    </span>
                  </div>
                  
                  <h3 className={`text-xl font-black transition-colors ${
                    booking.status === 'Cancelled' ? "text-slate-400 line-through" : "text-slate-900 group-hover:text-sky-600"
                  }`}>
                    {booking.service_name || `Service Appointment`}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1">
                    Booked for <span className="text-slate-900 font-bold">{user?.name}</span>
                  </p>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-slate-700 font-bold bg-white px-4 py-2 rounded-xl border border-slate-100 sm:border-none sm:p-0">
                      <CalendarDays className="text-sky-500 w-5 h-5" />
                      {booking.booking_date}
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700 font-bold bg-white px-4 py-2 rounded-xl border border-slate-100 sm:border-none sm:p-0">
                      <Clock className="text-sky-500 w-5 h-5" />
                      {booking.booking_time}
                    </div>
                  </div>
                  {booking.status !== 'Cancelled' && (
                    <ChevronRight className="hidden sm:block text-slate-300 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Help Banner */}
        <div className="mt-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-[3rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-sky-500/20">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black mb-2">Need help with a booking?</h2>
            <p className="text-sky-100 font-medium">Our support team is available 24/7 to assist you.</p>
          </div>
          <button 
            onClick={() => navigate('/chat')}
            className="whitespace-nowrap bg-white text-sky-600 font-black py-4 px-8 rounded-2xl hover:bg-sky-50 transition-all active:scale-95 shadow-lg"
          >
            Chat with BOOKSS AI
          </button>
        </div>

      </div>
    </div>
  )
}