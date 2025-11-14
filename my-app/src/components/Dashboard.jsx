// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { Package, PlusCircle, Trash2, ShoppingCart } from "lucide-react";

const PRODUCTS_API = "http://localhost:5000/api/products";
const SALES_API = "http://localhost:5000/api/sales";
const STOCK_API = "http://localhost:5000/api/stock";
const CATEGORY_API = "http://localhost:5000/api/categories";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    product_name: "",
    expiry_date: "",
    categoryId: "",
    quantity: "",
    price: "",
  });

  const [salesForm, setSalesForm] = useState({
    productId: "",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    price: "",
  });

  // Load products and categories
  const loadProducts = async () => {
    try {
      let res = await fetch(PRODUCTS_API);
      if (!res.ok) return setProducts([]);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadSales = async () => {
    try {
      let salesRes = await fetch(SALES_API);
      if (!salesRes.ok) return setSales([]);
      const data = await salesRes.json();
      setSales(data);
    } catch (e) {
      console.error("Error loading: ", e);
    }
  };

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
    loadSales();
  }, []);

  // Add new product

  const addProduct = async () => {
    const { product_name, expiry_date, categoryId, price } = productForm;
    console.log(product_name, expiry_date, categoryId, price);
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
        price: Number(price),
      }),
    });

    if (res.ok) {
      setProductForm({
        product_name: "",
        expiry_date: "",
        categoryId: "",
        quantity: "",
        price: "",
      });
      loadProducts();
    } else {
      alert("Failed to add product");
    }
  };

  const addSale = async () => {
    const { productId, date, quantity, price } = salesForm;

    if (!productId || !date || !quantity || !price) {
      return alert("Please fill in all fields");
    }

    const res = await fetch(SALES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(productId),
        date,
        quantity: Number(quantity),
        price: Number(price),
      }),
    });

    if (res.ok) {
      // reset sales form
      setSalesForm({
        productId: "",
        date: "",
        quantity: "",
        price: "",
      });
      loadProducts();
      loadSales();

      alert("Successfully added sale");

      // loadSales(); // or refresh
    } else {
      alert("Failed to add sale");
    }
  };

  // Add stock
  const addStock = async (productId, qty) => {
    if (!qty || qty <= 0) return alert("Enter valid quantity");
    const res = await fetch(STOCK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(qty) }),
    });
    if (res.ok) loadProducts();
  };

  // Delete product
  const deleteProduct = async (id) => {
    await fetch(`${PRODUCTS_API}/${id}`, { method: "DELETE" });
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-600" /> Smart Inventory Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium shadow-sm">
            <ShoppingCart size={18} />
            {products.length} Products
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-3">
          ➕ Add New Product
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Product name"
            value={productForm.product_name}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                product_name: e.target.value,
                e,
              })
            }
          />
          <select
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            value={productForm.categoryId}
            onChange={(e) =>
              setProductForm({ ...productForm, categoryId: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="date"
            value={productForm.expiry_date}
            onChange={(e) =>
              setProductForm({ ...productForm, expiry_date: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="number"
            value={productForm.price}
            onChange={(e) =>
              setProductForm({ ...productForm, price: e.target.value })
            }
          />
          <button
            onClick={addProduct}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-3">
          ➕ Add New Sale
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {/* PRODUCT DROPDOWN */}
          <select
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            value={salesForm.productId}
            onChange={(e) =>
              setSalesForm({ ...salesForm, productId: e.target.value })
            }
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name}
              </option>
            ))}
          </select>

          {/* DATE */}
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="datetime-local"
            value={salesForm.date}
            onChange={(e) =>
              setSalesForm({ ...salesForm, date: e.target.value })
            }
          />

          {/* QUANTITY */}
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Quantity"
            value={salesForm.quantity}
            onChange={(e) =>
              setSalesForm({ ...salesForm, quantity: e.target.value })
            }
          />

          {/* PRICE */}
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Price"
            value={salesForm.price}
            onChange={(e) =>
              setSalesForm({ ...salesForm, price: e.target.value })
            }
          />

          {/* BUTTON */}
          <button
            onClick={addSale}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
          <h2 className="text-lg font-semibold text-white">
            📦 Inventory Overview
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Expiry Date</th>
                <th className="p-3 text-left">Stock Count</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-6 italic bg-gray-50"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr
                    key={p.product_id}
                    className={`border-b hover:bg-blue-50 transition ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {p.product_name}
                    </td>
                    <td className="p-3">{p.category?.category_name || "-"}</td>
                    <td className="p-3">
                      {p.expiry_date ? p.expiry_date.split("T")[0] : "-"}
                    </td>
                    <td className="p-3 font-semibold text-blue-700">
                      {p.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2 items-center">
                        <div className="flex items-center gap-1">
                          <input
                            id={`add-${p.product_id}`}
                            type="number"
                            placeholder="Qty"
                            className="border rounded-md px-2 py-1 w-16 text-center focus:ring-2 focus:ring-blue-400"
                          />
                          <button
                            onClick={() =>
                              addStock(
                                p.product_id,
                                document.getElementById(`add-${p.product_id}`)
                                  .value
                              )
                            }
                            className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition text-sm"
                          >
                            +Stock
                          </button>
                        </div>
                        <button
                          onClick={() => deleteProduct(p.product_id)}
                          className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition text-sm"
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
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
          <h2 className="text-lg font-semibold text-white">
            📦 Sales Overview
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock Count</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-500 py-6 italic bg-gray-50"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                sales.map((p, i) => (
                  <tr
                    key={p.sale_id}
                    className={`border-b hover:bg-blue-50 transition ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {p.product.product_name}
                    </td>

                    <td className="p-3">
                      {p.product.category?.category_name || "-"}
                    </td>


                    {/* NEW: Quantity */}
                    <td className="p-3 font-semibold text-gray-800">
                      {p.quantity}
                    </td>

                    {/* NEW: Price */}
                    <td className="p-3 font-semibold text-gray-800">
                      ₹{p.price}
                    </td>

                    <td className="p-3 font-semibold text-blue-700">
                      {p.product.stocks?.reduce(
                        (sum, s) => sum + s.quantity,
                        0
                      ) || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
