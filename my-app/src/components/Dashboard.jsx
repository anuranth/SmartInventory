import { useState, useEffect } from "react";
import { Menu, X, Package, PlusCircle, Trash2 } from "lucide-react";

const PRODUCTS_API = "http://localhost:5000/api/products";
const STOCK_API = "http://localhost:5000/api/stock";
const CATEGORY_API = "http://localhost:5000/api/categories";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    expiry_date: "",
    categoryId: "",
    quantity: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 📦 Load products
  const loadProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  // 🏷️ Load categories
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
    loadProducts();
    loadCategories();
  }, []);

  // ➕ Add new product
  const addProduct = async () => {
    const { product_name, expiry_date, categoryId } = form;
    if (!product_name || !expiry_date || !categoryId) {
      return alert("Please fill in all fields");
    }

    const res = await fetch(PRODUCTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name,
        expiry_date,
        categoryId: Number(categoryId),
      }),
    });

    if (res.ok) {
      setForm({ product_name: "", expiry_date: "", categoryId: "", quantity: "" });
      loadProducts();
    } else {
      alert("Failed to add product");
    }
  };

  // ➕ Add stock
  const addStock = async (productId, qty) => {
    if (!qty || qty <= 0) return alert("Enter valid quantity");
    const res = await fetch(STOCK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(qty) }),
    });
    if (res.ok) loadProducts();
  };

  // 🗑️ Delete product
  const deleteProduct = async (id) => {
    await fetch(`${PRODUCTS_API}/${id}`, { method: "DELETE" });
    loadProducts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 border rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" /> Smart Inventory
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Add Product Section */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Add New Product</h2>
          <div className="flex flex-wrap gap-3">
            <input
              className="border rounded-md px-3 py-2 flex-1 min-w-[150px] focus:ring-2 focus:ring-blue-400"
              placeholder="Product name"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            />
            <select
              className="border rounded-md px-3 py-2 w-44 focus:ring-2 focus:ring-blue-400"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
            <input
              className="border rounded-md px-3 py-2 w-44 text-center focus:ring-2 focus:ring-blue-400"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            />
            <button
              onClick={addProduct}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} /> Add
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr className="text-gray-700">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Stock Count</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-5 italic">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr
                    key={p.product_id}
                    className={`border-b ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="p-3 font-medium text-gray-800">{p.product_name}</td>
                    <td className="p-3">{p.category?.category_name || "-"}</td>
                    <td className="p-3">
                      {p.expiry_date ? p.expiry_date.split("T")[0] : "-"}
                    </td>
                    <td className="p-3">
                      {p.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            id={`add-${p.product_id}`}
                            type="number"
                            placeholder="Qty"
                            className="border rounded-md px-2 py-1 w-16 text-center"
                          />
                          <button
                            onClick={() =>
                              addStock(
                                p.product_id,
                                document.getElementById(`add-${p.product_id}`).value
                              )
                            }
                            className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition"
                          >
                            +Stock
                          </button>
                        </div>

                        <button
                          onClick={() => deleteProduct(p.product_id)}
                          className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
