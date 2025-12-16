import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Categories from "./components/Categories";
import Sales from "./components/Sales";
import SignUp from "./components/Signup";
import { Loader2 } from "lucide-react";

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

    fetch("http://localhost:5000/api/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setUser(data.user);
          navigate("/");
        } else {
          localStorage.removeItem("token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <Routes>
      {/* UNAUTH ROUTES */}
      {!user && (
        <>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<SignUp onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}

      {/* AUTH ROUTES */}
      {user && (
        <Route
          path="*"
          element={
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar role={user.role} />
              <main className="flex-1 p-6 md:p-8 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sales" element={<Sales />} />
                  {user.role === "admin" && (
                    <Route path="/categories" element={<Categories />} />
                  )}
                </Routes>
              </main>
            </div>
          }
        />
      )}
    </Routes>
  );
}
