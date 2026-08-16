import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname.replace(/^\//, '')}`} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${location.pathname.replace(/^\//, "")}`}
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}