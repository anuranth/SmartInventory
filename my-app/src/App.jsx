import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Categories from "./components/Categories";
import Sales from "./components/Sales";

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally: verify token with backend
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
        });
    }
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role={user.role} /> {/* Pass role to sidebar */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            {/* Only admin can access categories */}
            {user.role === "admin" && (
              <Route path="/categories" element={<Categories />} />
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
