// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // अगर यूज़र लॉगिन नहीं है, तो उसे Login पेज (/) पर भेज दें
  // और साथ में एक state मैसेज पास करें ताकि Login पेज पर अलर्ट दिख सके
  if (!user) {
    return (
      <Navigate 
        to="/" 
        state={{ message: "Please log in to access this page." }} 
        replace 
      />
    );
  }

  // अगर लॉगिन है, तो जो पेज वो देखना चाहता है उसे रेंडर करें
  return <Outlet />;
}