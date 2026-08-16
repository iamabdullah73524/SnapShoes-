import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  CreditCard,
  Truck,
  ShieldAlert,
  ArrowLeft,
  Plus,
  Check,
} from "lucide-react";
import axios from "axios";

export default function Checkout() {
  const { cart, getCartSubtotal, clearCart, user, addToast } = useApp();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(false);

  // New Address Form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const subtotal = getCartSubtotal();
  const delivery = subtotal > 150 ? 0 : 15;
  const total = subtotal + delivery;
  const WHATSAPP_NUMBER = "918210314098";
  // Protect checkout route
  useEffect(() => {
    if (!user) {
      addToast("Please login to checkout your shopping bag", "error");
      navigate("/login?redirect=checkout");
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/auth/addresses");
      setAddresses(res.data);
      if (res.data.length > 0) {
        // Auto-select default or first address
        const def = res.data.find((a) => a.isDefault);
        setSelectedAddressId(def ? def._id : res.data[0]._id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!fullName || !street || !city || !state || !postalCode || !phone) {
      addToast("Please fill all address fields", "error");
      return;
    }

    try {
      const res = await axios.post("/auth/addresses", {
        fullName,
        street,
        city,
        state,
        postalCode,
        phone,
        isDefault: true,
      });
      addToast("Address added successfully!", "success");

      // Reset form
      setFullName("");
      setStreet("");
      setCity("");
      setState("");
      setPostalCode("");
      setPhone("");
      setShowNewAddressForm(false);

      // Refresh
      fetchAddresses();
    } catch (err) {
      console.error(err);
      addToast("Error saving address details", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      addToast("Your cart is empty", "error");
      return;
    }

    let shippingAddress = null;

    if (showNewAddressForm) {
      addToast(
        "Please save your new address or select an existing one",
        "error",
      );
      return;
    }

    const addr = addresses.find((a) => a._id === selectedAddressId);
    if (!addr) {
      addToast("Please select or add a shipping address", "error");
      return;
    }

    shippingAddress = {
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || "India",
      phone: addr.phone,
    };

    const orderItems = cart
      .map(
        (item) =>
          `• ${item.name} (${item.size}) x${item.quantity} - ₹${(
            item.price * item.quantity
          ).toFixed(2)}`,
      )
      .join("\n");

    const whatsappMessage = `
🛍️ *New SnapShoes Order*

👤 Customer: ${shippingAddress.fullName}
📞 Phone: ${shippingAddress.phone}

📍 Address:
${shippingAddress.street}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}

━━━━━━━━━━━━━━

${orderItems}

━━━━━━━━━━━━━━

💰 Total: ₹${total.toFixed(2)}

Payment Method: ${paymentMethod}
`;

    setLoading(true);
    try {
      await axios.post("/orders", {
        items: cart,
        shippingAddress,
        totalPrice: total,
        paymentMethod,
      });

      const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        whatsappMessage,
      )}`;

      window.open(whatsappURL, "_blank");

      addToast("Order placed successfully!", "success");

      clearCart();

      setTimeout(() => {
        navigate("/profile");
      }, 1000); // Redirect to profile to track status
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Error placing order", "error");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          No Items to Checkout
        </p>
        <Link
          to="/shop"
          className="mt-4 inline-block bg-brand-dark text-white text-[9px] font-extrabold uppercase px-6 py-2.5 rounded-lg"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      {/* Back Link */}
      <Link
        to="/cart"
        className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-brand-orange mb-6 transition"
      >
        <ArrowLeft size={14} />
        <span>Return to Bag</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Columns: Address & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Address Selector */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark flex items-center gap-2 border-b border-gray-50 pb-3">
              <Truck size={16} className="text-brand-orange" />
              <span>Shipping Address</span>
            </h2>

            {/* Saved Addresses List */}
            {addresses.length > 0 && !showNewAddressForm && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Saved Address
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`border rounded-xl p-4 cursor-pointer transition relative ${selectedAddressId === addr._id ? "border-brand-dark bg-brand-dark/5 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <h3 className="text-xs font-bold text-brand-dark">
                        {addr.fullName}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-semibold mt-1 leading-relaxed">
                        {addr.street}, {addr.city},<br />
                        {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold mt-2">
                        Ph: {addr.phone}
                      </p>
                      {selectedAddressId === addr._id && (
                        <span className="absolute top-4 right-4 bg-brand-dark text-white p-0.5 rounded-full">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Use a different address</span>
                </button>
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Enter New Shipping Address
                  </p>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-brand-orange"
                    >
                      Use Saved Address
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-dark text-white text-[9px] font-extrabold uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-brand-orange transition shadow-sm"
                >
                  Save Address Details
                </button>
              </form>
            )}
          </div>

          {/* Section 2: Payment Selector */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark flex items-center gap-2 border-b border-gray-50 pb-3">
              <CreditCard size={16} className="text-brand-orange" />
              <span>Select Payment Method</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition border-brand-dark bg-brand-dark/5">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={() => setPaymentMethod("Cash on Delivery")}
                  className="accent-brand-orange"
                />
                <div className="text-xs">
                  <p className="font-bold text-brand-dark">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Pay in cash when your premium sneakers arrive at your door.
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl opacity-60 cursor-not-allowed bg-white">
                <input
                  type="radio"
                  name="payment"
                  disabled
                  className="accent-brand-orange"
                />
                <div className="text-xs">
                  <p className="font-bold text-brand-dark">
                    Credit / Debit Card (Online Payment)
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Temporarily disabled. (All orders are securely routed via
                    Cash on Delivery).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Complete order button */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-dark border-b border-gray-50 pb-3">
              Items in Order
            </h2>

            {/* Micro items list */}
            <div className="space-y-3.5 max-h-40 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="flex items-center justify-between text-xs font-semibold text-gray-500"
                >
                  <span className="truncate max-w-[150px]">
                    {item.name}{" "}
                    <span className="text-brand-dark">x{item.quantity}</span>
                  </span>
                  <span className="text-brand-dark font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3.5 text-xs text-gray-500 font-semibold border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider">
                  Estimated Delivery
                </span>
                <span>
                  {delivery === 0 ? (
                    <span className="text-emerald-500 font-bold">FREE</span>
                  ) : (
                    `₹${delivery.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-black">
                <span className="uppercase tracking-wider text-brand-dark">
                  Total
                </span>
                <span className="text-brand-orange">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={
                loading || (addresses.length === 0 && showNewAddressForm)
              }
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition shadow ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-brand-orange hover:bg-brand-dark"}`}
            >
              {loading ? "Processing Order..." : "Place Order Securely"}
            </button>
          </div>

          <div className="flex items-start space-x-2.5 p-4 bg-brand-gray border border-gray-150 rounded-2xl text-[10px] text-gray-400 font-semibold uppercase leading-normal tracking-wide">
            <ShieldAlert
              size={18}
              className="text-brand-orange shrink-0 mt-0.5"
            />
            <span>
              By placing your order, you agree to our terms of shoe design
              concepts and real-time delivery timelines.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
