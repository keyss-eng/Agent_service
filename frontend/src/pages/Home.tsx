import { useEffect, useState } from "react"
import { API } from "../api/api"
import type { Service } from "../types/index"
import { useCart } from "../context/CartContext"
import { 
  Sparkles, Wrench, Zap, Droplets, Plus, Check, Search, 
  ShieldCheck, X, Star, Clock, MapPin, Phone, Mail, ArrowRight
} from "lucide-react"

// --- Custom Social Media Icons (Lucide removed brand icons in v1) ---
const FacebookIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const InstagramIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const LinkedinIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
// -------------------------------------------------------------------

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
        const res = await API.get("/services")
        const servicesArray = res.data.services || []; 
        setServices(servicesArray)
        setFilteredServices(servicesArray) 
      } catch (error) {
        console.error("Failed to load services", error)
        setServices([])
        setFilteredServices([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [])

  useEffect(() => {
    let result = services;
    if (activeCategory !== "All") {
      result = result.filter(s => 
        s.category?.toLowerCase().includes(activeCategory.toLowerCase())
      );
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
    if (lowerCat.includes("clean")) return <Sparkles className="w-5 h-5" />;
    if (lowerCat.includes("electric")) return <Zap className="w-5 h-5" />;
    if (lowerCat.includes("plumb")) return <Droplets className="w-5 h-5" />;
    return <Wrench className="w-5 h-5" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* 🚀 PREMIUM HERO SECTION */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50/50 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] opacity-30 bg-sky-300 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-sky-100 text-sky-700 text-sm font-bold mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <ShieldCheck size={16} className="text-sky-500" />
              100% Verified Professionals
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Expert home services, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                delivered to your door.
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
              From plumbing to deep cleaning, book trusted professionals instantly. Experience hassle-free maintenance with just a few clicks.
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div className="relative w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="What do you need help with? (e.g., 'AC Repair')"
              className="w-full pl-14 pr-14 py-5 text-lg text-slate-900 bg-white border-2 border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:shadow-[0_8px_30px_rgb(14,165,233,0.15)] focus:border-sky-400 focus:outline-none transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📋 MAIN CONTENT */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Category Filter Chips */}
        <div className="flex items-center justify-center md:justify-start gap-3 overflow-x-auto pb-6 pt-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                activeCategory === cat 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 translate-y-0" 
                : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:-translate-y-0.5 hover:shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {searchTerm ? `Results for "${searchTerm}"` : activeCategory !== "All" ? `${activeCategory} Services` : "Most Popular Services"}
            </h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {filteredServices?.length || 0} available
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-[380px] bg-slate-200 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : filteredServices?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Search className="text-slate-300 w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">We couldn't find that service</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">We are constantly expanding our offerings. Try adjusting your search or browse our categories.</p>
              <button 
                onClick={() => {setSearchTerm(""); setActiveCategory("All")}}
                className="mt-8 px-6 py-3 bg-sky-50 text-sky-600 font-bold rounded-xl hover:bg-sky-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredServices?.map((s) => {
                const isJustAdded = addedItems.includes(s.id)
                return (
                  <div key={s.id} className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-sky-900/5 hover:-translate-y-1.5 hover:border-sky-200 transition-all duration-300 overflow-hidden">
                    
                    {/* Card Content */}
                    <div className="p-7 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                          {getCategoryIcon(s.category)}
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          4.8
                        </div>
                      </div>
                      
                      <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">
                        {s.category}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-sky-600 transition-colors">{s.name}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">{s.description || "Professional, high-quality service delivered by experts."}</p>
                      
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-400">Starting at</span>
                          <span className="text-2xl font-black text-slate-900">₹{s.price}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-400">
                          <Clock size={14} /> 60 mins
                        </div>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="p-3 bg-slate-50/50 group-hover:bg-sky-50/50 transition-colors">
                      <button
                        className={`w-full font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                          isJustAdded 
                          ? "bg-green-500 text-white shadow-md shadow-green-500/20" 
                          : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900"
                        }`}
                        onClick={() => handleAddToCart(s)}
                      >
                        {isJustAdded ? (
                          <><Check size={18} className="animate-in zoom-in" /> Added to Cart</>
                        ) : (
                          <><Plus size={18} /> Book Now</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* 🌊 PROFESSIONAL FOOTER */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold text-xl">B</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">BOKKSS</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Your trusted partner for home services. We connect you with top-rated professionals to make your life easier and your home better.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><FacebookIcon size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><TwitterIcon size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><InstagramIcon size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><LinkedinIcon size={18} /></a>
              </div>
            </div>

            {/* Links Section */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Services</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Home Cleaning</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> AC Maintenance</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Plumbing Solutions</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Electrical Repair</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ArrowRight size={14}/> Painting Services</a></li>
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-sky-500 flex-shrink-0 mt-0.5" />
                  <span>123 Tech Park, Cyber Hub<br/>New Delhi, India 110001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-sky-500 flex-shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-sky-500 flex-shrink-0" />
                  <span>support@BOOKSS.com</span>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} BOOKSS Technologies. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14}/> Secure Checkout</span>
              <span className="flex items-center gap-1.5"><Star size={14}/> 4.8/5 Avg Rating</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}