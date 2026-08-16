import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ShoppingBag,
  User,
  Bell,
  Heart,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  History,
} from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const { user, cart, wishlist, notifications, logout, fetchNotifications } =
    useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await axios.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 px-6 md:px-12 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/"
          className="text-2xl font-black tracking-widest text-[#1a1a1a]"
        >
          SNAP SHOES
        </Link>

        <div className="hidden lg:flex items-center gap-12 text-sm font-semibold text-gray-700">
          {/* <a href="#home" className="transition hover:text-[#000]">HOME</a>
          <a href="#featured" className="transition hover:text-[#000]">COLLECTION</a>
          <a href="#featured" className="transition hover:text-[#000]">FOR MEN</a>
          <a href="#featured" className="transition hover:text-[#000]">FOR KIDS</a>
          <a href="#featured" className="transition hover:text-[#000]">BRANDS</a>
          <a href="#featured" className="transition hover:text-[#000]">MORE INFORMATION</a>
          <Link to="/wishlist" className="transition hover:text-[#b94f75]">MY WISHLIST</Link> */}
          <a href="#home" className="transition hover:text-[#000]">
            HOME
          </a>
          <a href="#featured" className="transition hover:text-[#000]">
            COLLECTION
          </a>
          <a href="#featured" className="transition hover:text-[#000]">
            FOR MEN
          </a>

          <a href="#featured" className="transition hover:text-[#000]">
            MORE INFORMATION
          </a>
          <Link to="/wishlist" className="transition hover:text-[#b94f75]">
            MY WISHLIST
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 text-[#111] transition hover:border-[#b94f75] hover:text-[#b94f75]"
          >
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#b94f75] text-[10px] font-black text-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Link>

          <Link
            to="/wishlist"
            className="relative inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 text-[#111] transition hover:border-[#b94f75] hover:text-[#b94f75]"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#b94f75] text-[10px] font-black text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#111] transition hover:border-[#b94f75] hover:text-[#b94f75]"
              >
                <Bell size={18} />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#b94f75] text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}

              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-80 rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.35em] text-[#111]">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#b94f75] hover:text-[#111]"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif._id)}
                          className={`w-full rounded-2xl p-3 text-left text-[11px] transition ${notif.isRead ? "bg-gray-50 text-gray-500" : "bg-[#fdf2f5] text-[#111] border border-[#f1d2dc]"}`}
                        >
                          <p className="font-bold">{notif.message}</p>
                          <span className="mt-1 block text-[10px] text-gray-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            {user ? (
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#111] transition hover:border-[#b94f75] hover:text-[#b94f75]"
              >
                <User size={18} />
                <span className="hidden md:inline-block max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.28em] text-[#111] transition hover:border-[#b94f75] hover:text-[#b94f75]"
              >
                <User size={18} />
                <span>Login</span>
              </Link>
            )}

            {user && showUserDropdown && (
              <div className="absolute right-0 top-16 z-50 w-52 rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl text-sm text-[#111]">
                <div className="mb-3 rounded-2xl bg-gray-50 p-3">
                  <p className="font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2 text-[#111] transition hover:bg-gray-100"
                  >
                    <LayoutDashboard size={16} className="text-[#b94f75]" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-[#111] transition hover:bg-gray-100"
                >
                  <History size={16} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                    navigate("/");
                  }}
                  className="mt-2 w-full rounded-2xl bg-black px-3 py-2 text-left text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#111] transition hover:border-[#b94f75] hover:text-[#b94f75] lg:hidden"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[84px] z-40 bg-white border-t border-gray-200 px-6 py-6 shadow-2xl lg:hidden">
          <div className="grid gap-3 text-sm font-black uppercase tracking-[0.25em] text-[#111]">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#fbf3f5] px-4 py-3 transition hover:bg-[#f4d8e1]"
            >
              Home
            </a>
            <a
              href="#collections"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#fbf3f5] px-4 py-3 transition hover:bg-[#f4d8e1]"
            >
              Collection
            </a>
            <a
              href="#featured"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#fbf3f5] px-4 py-3 transition hover:bg-[#f4d8e1]"
            >
              For Men
            </a>

            <a
              href="#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#fbf3f5] px-4 py-3 transition hover:bg-[#f4d8e1]"
            >
              More Information
            </a>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#fbf3f5] px-4 py-3 transition hover:bg-[#f4d8e1]"
            >
              My Wishlist
            </Link>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#fbf3f5] px-4 py-3 transition hover:bg-[#f4d8e1]"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
