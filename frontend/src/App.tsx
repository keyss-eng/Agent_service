import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Cart from "./pages/Cart"

import Booking from "./pages/Booking"
import Chat from "./pages/Chat"
// import MyBookings from './pages/MyBookings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-slate-50">
            {/* Navbar will show on all pages */}
            <Navbar />
            
            {/* Page Content */}
            <main>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/chat" element={<Chat />} />
                {/* <Route path="/my-bookings" element={<MyBookings />} /> */}
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App