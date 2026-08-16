import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login, user, loading } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirect = searchParams.get("redirect") || "";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : "/");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate(redirect ? `/${redirect}` : "/");
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-20 pb-32">
      <div className="bg-white border border-gray-150 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-black uppercase tracking-widest text-brand-dark">
            Welcome Back
          </h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Access your custom sneaker tracker
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@domain.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-gray border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
              />
              <Mail
                size={14}
                className="absolute left-3 top-3.5 text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-gray border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-orange font-semibold text-brand-dark"
              />
              <Lock
                size={14}
                className="absolute left-3 top-3.5 text-gray-400"
              />
            </div>
          </div>
<button
  type="submit"
  disabled={loading}
  className="w-full h-14 rounded-full border border-black bg-black text-white font-bold uppercase tracking-[0.18em] text-sm transition-all duration-300 hover:bg-white hover:text-black hover:border-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
  {loading ? (
    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  ) : (
    <>
      <LogIn size={18} strokeWidth={2.2} />
      <span>LOG IN</span>
    </>
  )}
</button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-gray-50 text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Don't have an account?{" "}
          <Link
            to={`/register${redirect ? `?redirect=${redirect}` : ""}`}
            className="text-brand-orange hover:underline"
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
