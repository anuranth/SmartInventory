import { useState } from "react";
import { User, Box, ShoppingCart, LogOut, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full md:h-auto w-64 bg-blue-700 text-white flex flex-col justify-between p-6 shadow-lg transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          <div className="flex items-center mb-8">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="profile"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div className="ml-3">
              <h2 className="font-semibold text-lg">Anuranth</h2>
              <p className="text-sm text-blue-200">Inventory Admin</p>
            </div>
          </div>

          <nav className="space-y-3">
            <Link
              to="/"
              className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-blue-600 transition"
            >
              <Box size={18} /> Inventory
            </Link>
            <Link
              to="/sales"
              className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-blue-600 transition"
            >
              <ShoppingCart size={18} /> Sales
            </Link>
            <button className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-blue-600 transition">
              <User size={18} /> Profile
            </button>
          </nav>
        </div>

        <button className="flex items-center gap-2 p-2 rounded hover:bg-blue-600 transition mt-8">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile menu toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md z-50"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        <span>{sidebarOpen ? "Close" : "Menu"}</span>
      </button>
    </>
  );
}
