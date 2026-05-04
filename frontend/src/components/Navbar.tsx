import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { Menu, X, LogOut, User, ChevronDown, ShoppingBag, Calendar, MessageSquare, Home } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/home', icon: Home },
  // { name: 'My Bookings', href: '/my-bookings', icon: Calendar },
  { name: 'Cart', href: '/cart', icon: ShoppingBag },
  { name: 'Booking', href: '/booking', icon: Calendar },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart(); // 👈 Get cart data
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-sky-700 transition-colors">
              <span className="font-bold">A</span>
            </div>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">Agent</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <NavLink 
                key={link.name}
                to={link.href} 
                className={({ isActive }) => `
                  relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                <link.icon size={18} />
                {link.name}
                
                {/* 🔴 Dynamic Cart Badge (Desktop) */}
                {link.name === 'Cart' && cart.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-200">
                    {cart.length}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop Profile Dropdown */}
          <div className="hidden md:flex items-center ml-4">
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:border-sky-300 hover:bg-slate-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email || user.name}</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="relative text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              
              {/* 🔴 Cart Indicator Dot for Mobile Menu Button */}
              {!isMobileMenuOpen && cart.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-200 shadow-lg pb-4">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.href} 
                className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <link.icon size={20} />
                  {link.name}
                </div>
                
                {/* 🔴 Dynamic Cart Badge (Mobile) */}
                {link.name === 'Cart' && cart.length > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                    {cart.length}
                  </span>
                )}
              </NavLink>
            ))}
            
            {user && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="px-4 py-2 mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                  <p className="text-slate-900 font-medium">{user.name}</p>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={20} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}