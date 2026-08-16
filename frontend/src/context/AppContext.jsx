import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || [],
  );
  const [wishlist, setWishlist] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const API_BASE = "http://localhost:5000";
  axios.defaults.baseURL = `${API_BASE}/api`;

  // Set Authorization Header dynamically
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);

      fetchUserProfile();
      fetchWishlist();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setUser(null);
      setWishlist([]);
      setNotifications([]);
    }
  }, [token]);

  // Sync cart and wishlist to local storage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Set up socket.io connection when user log changes
  useEffect(() => {
    if (user) {
      const socketConnection = io(API_BASE);
      setSocket(socketConnection);

      // Join room based on user role/ID
      socketConnection.on("connect", () => {
        if (user.role === "admin") {
          socketConnection.emit("join_user_room", "admin");
        } else {
          socketConnection.emit("join_user_room", user.id);
        }
      });

      // Socket alerts
      socketConnection.on("new_order_alert", (data) => {
        addToast(data.message || "New order placed by client!", "success");
        fetchNotifications();
      });

      socketConnection.on("order_status_update", (data) => {
        addToast(
          data.message || `Your order status changed to ${data.status}!`,
          "info",
        );
        fetchNotifications();
      });

      socketConnection.on("product_catalog_updated", (data) => {
        addToast(
          data.message || "Product catalog updated in real time",
          "info",
        );
        loadProducts();
      });

      return () => {
        socketConnection.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  //fetch wishlist
  const fetchWishlist = async () => {
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const res = await axios.get("/wishlist");
      setWishlist(res.data || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  // Fetch user profile on load
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("/auth/profile");
      setUser(res.data);
      fetchNotifications();
    } catch (err) {
      logout();
    }
  };

  // Toast notifier helper
  const addToast = (message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  };

  // Authentications
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      addToast(`Welcome back, ${res.data.user.name}!`, "success");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      addToast(msg, "error");
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await axios.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      setToken(res.data.token);
      setUser(res.data.user);
      addToast(`Account created! Welcome, ${res.data.user.name}!`, "success");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      addToast(msg, "error");
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setCart([]);
    setWishlist([]);
    addToast("Logged out successfully", "info");
  };
  // Cart operations
  const addToCart = (product, quantity, size, color) => {
    console.log("addToCart called");
    if (!size || !color) {
      addToast("Please select size and color", "error");
      return;
    }

    const price = product.salePrice || product.price;
    const cartId = `${product._id}-${size}-${color}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.cartId === cartId);
      if (existingIdx > -1) {
        const newCart = [...prevCart];
        newCart[existingIdx].quantity += quantity;
        addToast(`Updated quantity of ${product.name} in cart`, "success");
        return newCart;
      } else {
        addToast(`Added ${product.name} to cart`, "success");
        return [
          ...prevCart,
          {
            cartId,
            productId: product._id,
            name: product.name,
            price,
            quantity,
            size,
            color,
            image:
              product.images[0] ||
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
            maxStock: product.inventory,
          },
        ];
      }
    });
  };

  const updateCartQty = (cartId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartId === cartId) {
          const newQty = Math.max(1, Math.min(item.maxStock, quantity));
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
    addToast("Item removed from cart", "info");
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Wishlist operations
  const addToWishlist = async (product) => {
    if (!token) {
      addToast("Please login to add items to wishlist", "error");
      return;
    }

    try {
      const res = await axios.post(`/wishlist/${product._id}`);

      setWishlist(res.data || []);

      addToast(`${product.name} added to wishlist`, "success");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to add product to wishlist";

      addToast(msg, "error");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.delete(`/wishlist/${productId}`);

      setWishlist(res.data || []);

      addToast("Removed from wishlist", "info");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to remove product from wishlist";

      addToast(msg, "error");
    }
  };

  const clearWishlist = async () => {
    try {
      await axios.delete("/wishlist");

      setWishlist([]);

      addToast("Wishlist cleared", "info");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to clear wishlist";

      addToast(msg, "error");
    }
  };
  // Catalog loading
  const loadProducts = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await axios.get("/products", { params: filters });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      addToast("Error loading product catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        wishlist,
        products,
        notifications,
        toasts,
        loading,
        setLoading,
        login,
        register,
        logout,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        getCartSubtotal,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        loadProducts,
        addToast,
        fetchNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
