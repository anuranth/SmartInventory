import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  redirect,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Categories from "./components/Categories";
import Sales from "./components/Sales";
import SignUp from "./components/Signup";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setUser(data.user);
            redirect("/");
          } else {
            localStorage.removeItem("token");
          }
        });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* UNAUTH ROUTES */}
        {!user && (
          <>
            <Route path="/login" element={<Login onLogin={setUser} user={user} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* AUTH PROTECTED ROUTES */}
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
    </BrowserRouter>
  );
}
