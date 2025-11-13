import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Tag } from "lucide-react";

const CATEGORY_API = "http://localhost:5000/api/categories";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  // 📦 Load categories
  const loadCategories = async () => {
    try {
      const res = await fetch(CATEGORY_API);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ➕ Add category
  const addCategory = async () => {
    if (!categoryName.trim()) return alert("Enter category name");

    const res = await fetch(CATEGORY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_name: categoryName }),
    });

    if (res.ok) {
      setCategoryName("");
      loadCategories();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add category");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
        <Tag /> Manage Categories
      </h1>

      <div className="bg-white p-5 rounded-lg shadow-sm mb-6 flex gap-3">
        <input
          className="border rounded-md px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-400"
          placeholder="Enter category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button
          onClick={addCategory}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} /> Add
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b text-gray-700">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Category Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center text-gray-500 py-5 italic">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((c, i) => (
                <tr key={c.category_id} className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="p-3 font-medium">{c.category_id}</td>
                  <td className="p-3">{c.category_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
