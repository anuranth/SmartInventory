// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const loc = useLocation();
  const linkClass = (path) =>
    `px-3 py-2 rounded-md ${loc.pathname === path ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-gray-800">AI Smart Inventory</div>
            <div className="hidden md:flex items-baseline space-x-1">
              <Link to="/" className={linkClass("/")}>Dashboard</Link>
              <Link to="/sales" className={linkClass("/sales")}>Sales</Link>
            </div>
          </div>
          <div className="text-sm text-gray-500">v1.0</div>
        </div>
      </div>
    </nav>
  );
}
