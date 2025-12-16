import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Categories from "./components/Categories";
import Sales from "./components/Sales";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Verify token validity
    fetch("http://localhost:5000/api/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <Routes>
      {/* UNAUTHENTICATED ROUTES */}
      {!user && (
        <>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<SignUp onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* AUTHENTICATED ROUTES */}
      {user && (
        <Route
          path="*"
          element={
            <div className="flex h-screen bg-gray-100 overflow-hidden">
              {/* Sidebar is fixed on desktop, toggleable on mobile */}
              <Sidebar role={user.role} user={user} />
              
              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sales" element={<Sales />} />
                  {user.role === "admin" && (
                    <Route path="/categories" element={<Categories />} />
                  )}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      )}
    </Routes>
  );
}