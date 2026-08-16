import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeCustomers: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Protect Admin Route
  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      addToast("Access denied, administrator authentication required", "error");
      navigate("/login");
      return;
    }
    fetchDashboardStats();
  }, [token, user]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch orders to calculate statistics
      // Fetch Orders
      const ordersRes = await axios.get("/orders/all");
      const orders = ordersRes.data;

      // Fetch Products
      const productsRes = await axios.get("/products");
      const products = productsRes.data;

      // Fetch Users
      const usersRes = await axios.get("/auth/users");
      const users = usersRes.data;

      // Calculate statistics
      const totalSales = orders
        .filter(
          (o) =>
            o.status === "Delivered" ||
            o.paymentStatus === "Completed" ||
            o.status === "Shipped",
        )
        .reduce((sum, o) => sum + o.totalPrice, 0);

      const totalOrders = orders.length;

      // Total Registered Users
      const activeCustomers = users.length;

      // Low stock (inventory <= 5)
      const lowStockCount = products.filter((p) => p.inventory <= 5).length;

      setStats({
        totalSales,
        totalOrders,
        activeCustomers,
        lowStockCount,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error(err);
      addToast("Error loading dashboard analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && recentOrders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  // Monthly Sales mock details for charts
  const monthlySales = [
    { month: "Jan", sales: 450 },
    { month: "Feb", sales: 620 },
    { month: "Mar", sales: 890 },
    { month: "Apr", sales: 1200 },
    { month: "May", sales: 980 },
    { month: "Jun", sales: stats.totalSales || 1500 },
  ];

  const maxChartValue = Math.max(...monthlySales.map((m) => m.sales));

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500">
            <TrendingUp size={14} />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark mt-1">
            Dashboard Analytics
          </h1>
        </div>

        <div className="flex items-center space-x-3.5">
          <Link
            to="/admin/products"
           className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-orange-500 transition"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Sales */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-dark/5 flex items-center justify-center text-brand-dark shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">
              Gross Sales
            </span>
            <span className="text-lg font-bold text-brand-dark">
              ₹{stats.totalSales.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-dark/10 flex items-center justify-center text-brand-dark shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">
              Total Orders
            </span>
            <span className="text-lg font-bold text-brand-dark">
              {stats.totalOrders}
            </span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">
              Active Users
            </span>
            <span className="text-lg font-bold text-brand-dark">
              {stats.activeCustomers}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">
              Low Stock Shoes
            </span>
            <span className="text-lg font-bold text-brand-dark">
              {stats.lowStockCount}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Activity Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart (Left Column) */}
        <div className="lg:col-span-2 bg-white border border-gray-150 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Sales Growth Trend (₹)
            </h3>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              Live Sync
            </span>
          </div>

          {/* Graphical bar chart using pure CSS */}
          <div className="flex items-end justify-between h-56 pt-6 px-4 relative">
            {/* Grid Lines */}
            <div className="absolute left-0 bottom-[10%] w-full h-[1px] bg-gray-50 border-dashed border-b"></div>
            <div className="absolute left-0 bottom-[50%] w-full h-[1px] bg-gray-50 border-dashed border-b"></div>
            <div className="absolute left-0 bottom-[90%] w-full h-[1px] bg-gray-50 border-dashed border-b"></div>

            {monthlySales.map((item, idx) => {
              const heightPct = (item.sales / maxChartValue) * 80;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center w-12 group z-10"
                >
                  <div className="text-[9px] font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-1">
                    ₹{item.sales.toFixed(0)}
                  </div>
                  <div
                    className="w-8 bg-brand-dark transition-all duration-500 rounded-t-lg"
                    style={{ height: `${heightPct}%`, minHeight: "10px" }}
                  ></div>
                  <span className="text-[9px] font-medium text-gray-400 mt-3">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Log (Right Column) */}
        <div className="lg:col-span-1 bg-white border border-gray-150 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Recent Activity
            </h3>
            <Link
              to="/admin/orders"
              className="text-sm text-gray-600 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                No orders logged yet
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="border-b border-gray-50 pb-3 last:border-none last:pb-0 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-semibold truncate max-w-[120px]">
                      #{order._id}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
