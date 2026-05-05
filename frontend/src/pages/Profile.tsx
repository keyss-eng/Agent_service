import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Save, Edit2, Navigation, ShieldCheck 
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: "",
    phone: "",
    address: "",
    location: ""
  });

  // Load saved profile data from LocalStorage (Backend न होने पर)
  useEffect(() => {
    const savedData = localStorage.getItem(`profile_${user?.id}`);
    if (savedData) {
      setProfile({ ...profile, ...JSON.parse(savedData) });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API save delay
    setTimeout(() => {
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profile));
      setIsEditing(false);
      setIsLoading(false);
    }, 800);
  };

  // 📍 Get Live Location using Browser GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setProfile({ ...profile, location: `${lat}, ${lng} (Live GPS)` });
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please allow location permissions.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 mt-2">Manage your personal information and address</p>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
              isEditing 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isLoading ? "Saving..." : isEditing ? <><Save size={18}/> Save Profile</> : <><Edit2 size={18}/> Edit</>}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-8 border-b border-slate-100 flex items-center gap-6 bg-sky-50/50">
            <div className="w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profile.name || "Add your name"}</h2>
              <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                <ShieldCheck size={16} className="text-green-500" />
                Verified Customer
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <User size={16} className="text-sky-500"/> Full Name
                </label>
                <input 
                  type="text" name="name" value={profile.name} onChange={handleChange} disabled={!isEditing}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-70"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <Mail size={16} className="text-sky-500"/> Email Address
                </label>
                <input 
                  type="email" name="email" value={profile.email} disabled
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none opacity-70 cursor-not-allowed"
                />
              </div>

              {/* Age */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <Calendar size={16} className="text-sky-500"/> Age
                </label>
                <input 
                  type="number" name="age" value={profile.age} onChange={handleChange} disabled={!isEditing} placeholder="e.g. 25"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-70"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <Phone size={16} className="text-sky-500"/> Phone Number
                </label>
                <input 
                  type="tel" name="phone" value={profile.phone} onChange={handleChange} disabled={!isEditing} placeholder="+91 98765 43210"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-70"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <MapPin size={16} className="text-sky-500"/> Complete Address
                </label>
                <textarea 
                  name="address" value={profile.address} onChange={handleChange} disabled={!isEditing} rows={3} placeholder="House no, Street, City..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-70 resize-none"
                />
              </div>

              {/* Live Location Widget */}
              <div className="md:col-span-2 bg-sky-50/50 border border-sky-100 p-5 rounded-2xl">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                  <Navigation size={16} className="text-sky-500"/> GPS Coordinates (For Service Partners)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" name="location" value={profile.location} onChange={handleChange} disabled={!isEditing} placeholder="Lat, Lng will appear here"
                    className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-70"
                  />
                  {isEditing && (
                    <button 
                      onClick={handleGetLocation}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
                    >
                      <Navigation size={18} /> Detect Location
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">Allow location access to help our service partners reach your exact address easily.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}