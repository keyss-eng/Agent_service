import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import type { Service } from "../types/index"
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Info
} from "lucide-react"

export default function Cart() {
  const { cart, removeFromCart } = useCart()
  const navigate = useNavigate()

  // Calculations
  const subtotal = cart.reduce((sum: number, item: Service) => sum + item.price, 0)
  const platformFee = cart.length > 0 ? 49 : 0 // Flat platform fee for realism
  const finalTotal = subtotal + platformFee

  // 📭 EMPTY STATE UI
  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center max-w-md w-full text-center">
          <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">
            Looks like you haven't added any services yet. Explore our catalog to find what you need.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            Browse Services
          </button>
        </div>
      </div>
    )
  }

  // 🛒 FULL CART UI
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Review Your Cart</h1>
          <p className="text-slate-500 mt-2">You have {cart.length} {cart.length === 1 ? 'service' : 'services'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item: Service, index: number) => (
              <div
                key={`${item.id}-${index}`}
                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors duration-200"
              >
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-6 h-6 text-slate-400 group-hover:text-sky-500 transition-colors" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md tracking-wider uppercase mb-1">
                      {item.category || 'Service'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.description || "Professional home service"}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-4 sm:gap-2">
                  <span className="font-extrabold text-slate-900 text-xl">₹{item.price}</span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span title="Helps us maintain the platform and support workers" className="flex items-center cursor-help">
                      <Info size={14} className="text-slate-400" />
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">₹{platformFee}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-6 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-extrabold text-sky-500">₹{finalTotal}</span>
                </div>
                <p className="text-xs text-slate-400 text-right mt-1">Inclusive of all taxes</p>
              </div>

              <button
                onClick={() => navigate('/booking')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="mt-6 flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
                <ShieldCheck className="text-green-600 w-6 h-6 flex-shrink-0" />
                <p className="text-xs text-green-800 font-medium">
                  Safe and secure checkout. We only connect you with verified & background-checked professionals.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}