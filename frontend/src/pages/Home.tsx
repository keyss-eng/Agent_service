import { useEffect, useState } from "react"
import { Link } from "react-router-dom" // Navigation ke liye
import { API } from "../api/api"
import type { Service } from "../types/index"
import { useCart } from "../context/CartContext"
import { 
  Sparkles, Wrench, Zap, Droplets, Plus, Check, Search, 
  ShieldCheck, X, Star, Clock, MapPin, Phone, Mail, ArrowRight, MessageSquare
} from "lucide-react"

// ... (Social Icons same rahenge) ...

const CATEGORIES = ["All", "Cleaning", "Electric", "Plumbing", "Repair"];

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  
  const { addToCart } = useCart()
  const [addedItems, setAddedItems] = useState<number[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Agar backend route '/api/services' hai toh wahi likhein
        const res = await API.get("/services")
        const servicesArray = res.data.services || []; 
        setServices(servicesArray)
        setFilteredServices(servicesArray) 
      } catch (error) {
        console.error("Failed to load services", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [])

  // Optimized Filter Logic
  useEffect(() => {
    let result = services;
    if (activeCategory !== "All") {
      result = result.filter(s => s.category === activeCategory);
    }
    if (searchTerm) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredServices(result);
  }, [searchTerm, activeCategory, services]);

  const handleAddToCart = (s: Service) => {
    addToCart(s)
    setAddedItems((prev) => [...prev, s.id])
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((id) => id !== s.id))
    }, 2000)
  }

  const getCategoryIcon = (category: string) => {
    const lowerCat = category?.toLowerCase() || "";
    if (lowerCat.includes("clean")) return <Sparkles />;
    if (lowerCat.includes("electric")) return <Zap />;
    if (lowerCat.includes("plumb")) return <Droplets />;
    return <Wrench />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* 🚀 HERO SECTION */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50/50"></div>
        <div className="relative z-10 pt-20 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-sky-100 text-sky-700 text-sm font-bold mb-8">
              <ShieldCheck size={16} className="text-sky-500" />
              Trusted by 10,000+ Households
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
              Expert services, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                at your doorstep.
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
              Book verified professionals for cleaning, electrical, and repair needs. Fast, reliable, and affordable.
            </p>

            {/* AI Assistant Call-to-Action */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/chat" className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                <MessageSquare size={20} />
                Try BOOKSS AI
              </Link>
              <a href="#services" className="flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold hover:border-sky-200 transition-all active:scale-95">
                Browse Services
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search for 'AC Repair', 'Cleaning'..."
              className="w-full pl-14 pr-6 py-5 text-lg bg-white border-2 border-slate-100 rounded-3xl shadow-xl focus:border-sky-400 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 📋 SERVICES SECTION */}
      <main id="services" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Our Services</h2>
            <p className="text-slate-500 font-medium">Select a category to explore</p>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat 
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 bg-white border border-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((s) => (
              <div key={s.id} className="group bg-white rounded-[32px] border border-slate-200 p-6 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 flex flex-col">
                <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  {getCategoryIcon(s.category)}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{s.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">{s.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <span className="text-2xl font-black text-slate-900">₹{s.price}</span>
                  <button
                    onClick={() => handleAddToCart(s)}
                    className={`p-3 rounded-2xl transition-all ${
                      addedItems.includes(s.id) 
                      ? "bg-green-500 text-white" 
                      : "bg-slate-100 text-slate-900 hover:bg-sky-500 hover:text-white"
                    }`}
                  >
                    {addedItems.includes(s.id) ? <Check size={20} /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🌊 FOOTER */}
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">B</div>
                <span className="text-2xl font-black text-white">BOOKSS</span>
              </div>
              <p className="text-sm leading-relaxed">
                Premium home services at the tap of a button. Trusted by thousands of happy customers.
              </p>
            </div>
            {/* ... baaki sections same rahenge ... */}
          </div>
          <div className="pt-8 border-t border-slate-900 text-center text-xs">
            © {new Date().getFullYear()} BOOKSS Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}