import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  ShoppingCart,
  User,
  Truck,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

export default function AdminOrders() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status modify states
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingComment, setTrackingComment] = useState("");

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      addToast("Access denied, administrator authentication required", "error");
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [token, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/orders/all");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      addToast("Error fetching order records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId) => {
    if (!newStatus) return;
    try {
      await axios.put(`/orders/${orderId}/status`, {
        status: newStatus,
        comment: trackingComment || `Order status updated to ${newStatus}`,
      });
      addToast("Order status updated. Notification delivered!", "success");
      setUpdatingOrderId(null);
      setNewStatus("");
      setTrackingComment("");
      fetchOrders();
    } catch (err) {
      console.error(err);
      addToast("Error updating order status", "error");
    }
  };

  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-8">
      {/* Header */}
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
            Orders Management
          </h1>
        </div>

        <button
          onClick={fetchOrders}
          className="border border-brand-dark text-brand-dark text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-brand-dark hover:text-white transition flex items-center space-x-1.5"
        >
          <RefreshCw size={12} />
          <span>Reload Orders</span>
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-150 rounded-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            No Orders Available
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Order metadata & Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-3">
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      Order ID
                    </span>
                    <p className="text-xs font-black text-brand-dark">
                      #{order._id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-extrabold text-brand-orange bg-brand-orange/5 px-2.5 py-0.5 rounded-full uppercase border border-brand-orange/20">
                      {order.status}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-semibold">
                      <Calendar size={12} />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">
                    Order Items
                  </p>
                  <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2 flex items-center justify-between text-xs font-semibold"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-brand-orange font-bold">
                            x{item.quantity}
                          </span>
                          <span className="text-brand-dark">{item.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            ({item.size} / {item.color})
                          </span>
                        </div>
                        <span className="text-brand-dark">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping info */}
                <div className="bg-brand-gray/50 border border-gray-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                      <User size={10} />
                      <span>Customer details</span>
                    </p>
                    <p className="text-brand-dark">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Ph: {order.shippingAddress?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                      <Truck size={10} />
                      <span>Destination Address</span>
                    </p>
                    <p className="text-gray-500 leading-normal text-[11px]">
                      {order.shippingAddress?.street},{" "}
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Financial Info & Status Updates Form */}
              <div className="lg:col-span-1 bg-brand-gray/30 border border-gray-150 p-5 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-400 uppercase tracking-widest">
                      Subtotal
                    </span>
                    <span className="text-brand-dark">
                      ₹
                      {(
                        order.totalPrice - (order.totalPrice > 150 ? 0 : 15)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-400 uppercase tracking-widest">
                      Delivery fee
                    </span>
                    <span className="text-brand-dark">
                      {order.totalPrice > 150 ? "FREE" : "₹15.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-black">
                    <span className="text-brand-dark uppercase tracking-widest">
                      Total Price
                    </span>
                    <span className="text-brand-orange">
                      ₹{order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Update Form Controls */}
                {updatingOrderId === order._id ? (
                  <div className="space-y-3 pt-3 border-t border-gray-150">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                        Select New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-bold text-brand-dark"
                      >
                        <option value="">-- Choose Status --</option>
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
                        Status Change Note (Customer Log)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Package verified at local warehouse"
                        value={trackingComment}
                        onChange={(e) => setTrackingComment(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateStatus(order._id)}
                        className="flex-1 bg-black text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition"
                      >
                        Apply Status
                      </button>
                      <button
                        onClick={() => setUpdatingOrderId(null)}
                        className="border border-black bg-white text-black py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setUpdatingOrderId(order._id);
                        setNewStatus(order.status);
                      }}
                    className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-lg"
                    >
                      Modify Delivery Status
                    </button>

                    {/* Direct WhatsApp link for admin to contact customer or send order update */}
                    <a
                      href={`https://wa.me/${order.shippingAddress?.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${order.shippingAddress?.fullName}, your order ${order._id} is currently ${order.status}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition shadow"
                    >
                      Send WhatsApp Update
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
