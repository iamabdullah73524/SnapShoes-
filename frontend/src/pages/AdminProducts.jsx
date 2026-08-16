import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Edit2, Trash2, ArrowLeft, X } from "lucide-react";
import axios from "axios";

export default function AdminProducts() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [inventory, setInventory] = useState(10);
  const [sizes, setSizes] = useState("7,8,9,10,11");
  const [colors, setColors] = useState("Black,White");
  const [category, setCategory] = useState("Unisex");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      addToast("Access denied, administrator authentication required", "error");
      navigate("/login");
      return;
    }
    fetchProducts();
  }, [token, user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      addToast("Error fetching products catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditProductId(null);
    setName("");
    setDescription("");
    setBrand("");
    setPrice("");
    setSalePrice("");
    setInventory(10);
    setSizes("7,8,9,10,11");
    setColors("Black,White");
    setCategory("Unisex");
    setImageUrl("");
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditProductId(p._id);
    setName(p.name);
    setDescription(p.description);
    setBrand(p.brand);
    setPrice(p.price);
    setSalePrice(p.salePrice || "");
    setInventory(p.inventory);
    setSizes(p.sizes?.join(",") || "7,8,9,10,11");
    setColors(p.colors?.join(",") || "Black,White");
    setCategory(p.category || "Unisex");
    setImageUrl(p.images ? p.images[0] : "");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !brand || !price || inventory === undefined) {
      addToast("Please fill all required fields", "error");
      return;
    }

    const payload = {
      name,
      description,
      brand,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      inventory: parseInt(inventory),
      sizes: sizes.split(",").map((s) => parseFloat(s.trim())),
      colors: colors.split(",").map((c) => c.trim()),
      category,
      images: imageUrl
        ? [imageUrl]
        : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
    };

    try {
      if (editProductId) {
        // Edit Mode
        await axios.put(`/products/${editProductId}`, payload);
        addToast("Shoe product updated successfully!", "success");
      } else {
        // Create Mode
        await axios.post("/products", payload);
        addToast("New shoe product added successfully!", "success");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast("Error saving product", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shoe product?"))
      return;
    try {
      await axios.delete(`/products/${id}`);
      addToast("Product deleted from catalog", "info");
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast("Error deleting product", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-8">
      {/* Header Link & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
        <div className="space-y-1">
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-brand-orange transition"
          >
            <ArrowLeft size={14} />
            <span>Admin Home</span>
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tight text-brand-dark">
            Catalog Management
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-gray-900 transition flex items-center space-x-1.5 shadow-sm"
        >
          <Plus size={14} />
          <span>Add New Shoe</span>
        </button>
      </div>

      {/* Products Grid Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-gray text-[10px] font-extrabold uppercase tracking-widest text-gray-400 border-b border-gray-150">
                <th className="py-4 px-6">Model Info</th>
                <th className="py-4 px-6">Brand / Category</th>
                <th className="py-4 px-6">Inventory</th>
                <th className="py-4 px-6">Price Details</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-600">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    No products found in catalog
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 flex items-center space-x-3.5">
                      <div className="w-12 h-12 bg-brand-gray rounded-lg p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={p.images ? p.images[0] : ""}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="font-bold text-brand-dark truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-brand-dark uppercase tracking-wider">
                        {p.brand}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${p.inventory <= 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {p.inventory} in stock
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold">
                      {p.salePrice ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-red-500">
                            ₹{p.salePrice.toFixed(2)}
                          </span>
                          <span className="text-gray-400 line-through font-normal text-[10px]">
                            ₹{p.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-brand-dark">
                          ₹{p.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center space-x-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-gray-400 hover:text-brand-orange transition p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-gray-300 hover:text-red-500 transition p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-float-in">
            {/* Modal Header */}
            <div className="bg-brand-gray border-b border-gray-150 py-4 px-6 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-dark">
                {editProductId
                  ? "Edit Product Specifications"
                  : "Insert New Catalog Shoe"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-brand-dark transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Shoe Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Nike, Adidas"
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Inventory
                  </label>
                  <input
                    type="number"
                    required
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  >
                    <option value="For Him">For Him</option>
                    <option value="For Her">For Her</option>
                    <option value="For Kids">For Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Sizes (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="e.g. 7,8,9,10,11"
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                    Colors (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="e.g. Black,White,Pink"
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition shadow mt-2"
              >
                Save Shoe Product Specifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
