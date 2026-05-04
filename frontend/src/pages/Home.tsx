import { useEffect, useState } from "react"
import { API } from "../api/api"
import type { Service } from "../types/index"
import { useCart } from "../context/CartContext"
import { 
  Sparkles, Wrench, Zap, Droplets, Plus, Check, Search, ShieldCheck, X
} from "lucide-react"

// Category list for filters
const CATEGORIES = ["All", "Cleaning", "Electric", "Plumbing", "Repair"];

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([]) // For filtering
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  
  const { addToCart } = useCart()
  const [addedItems, setAddedItems] = useState<number[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get("/services")
        setServices(res.data)
        setFilteredServices(res.data) // Initially show all
      } catch (error) {
        console.error("Failed to load services", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [])

  // 🔍 Real-time Search and Filter Logic
  useEffect(() => {
    let result = services;

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(s => 
        s.category?.toLowerCase().includes(activeCategory.toLowerCase())
      );
    }

    // Filter by Search Term
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
    if (lowerCat.includes("clean")) return <Sparkles className="w-6 h-6" />;
    if (lowerCat.includes("electric")) return <Zap className="w-6 h-6" />;
    if (lowerCat.includes("plumb")) return <Droplets className="w-6 h-6" />;
    return <Wrench className="w-6 h-6" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 🚀 HERO & SEARCH SECTION */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold mb-6 border border-sky-100">
            <ShieldCheck size={16} />
            <span>Verified Professionals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">
            Quality services, <span className="text-sky-500">on demand.</span>
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-xl shadow-xl rounded-2xl overflow-hidden border border-slate-200 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search for 'AC Repair', 'Cleaning'..."
              className="pl-12 pr-12 py-4 w-full text-slate-900 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* 🏷️ CATEGORY CHIPS */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {searchTerm || activeCategory !== "All" ? "Search Results" : "Featured Services"}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />)}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching services</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
              <button 
                onClick={() => {setSearchTerm(""); setActiveCategory("All")}}
                className="mt-6 text-sky-500 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((s) => {
                const isJustAdded = addedItems.includes(s.id)
                return (
                  <div key={s.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-sm">
                          {getCategoryIcon(s.category)}
                        </div>
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                          {s.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{s.name}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6">{s.description || "Top-rated service."}</p>
                      <p className="text-3xl font-extrabold text-slate-900">₹{s.price}</p>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <button
                        className={`w-full font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                          isJustAdded ? "bg-green-500 text-white" : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-900 hover:text-white"
                        }`}
                        onClick={() => handleAddToCart(s)}
                      >
                        {isJustAdded ? <><Check size={18} /> Added</> : <><Plus size={18} /> Add to Cart</>}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}