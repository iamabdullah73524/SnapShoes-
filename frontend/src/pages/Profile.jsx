import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Shield, Phone, MapPin, Trash2, Box, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address adding state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!token) {
      addToast('Please login to access profile details', 'error');
      navigate('/login');
      return;
    }
    fetchProfileData();

    // Listen to real-time status updates on socket
    const handleStatusUpdate = (data) => {
      // Re-fetch orders to update the timelines dynamically
      fetchProfileData();
    };

    // Note: since our AppContext handles socket events and triggers toasts,
    // we can also hook into it here or simply reload when notifications change.
  }, [token]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const ordersRes = await axios.get('/orders/my-orders');
      setOrders(ordersRes.data);

      const addrRes = await axios.get('/auth/addresses');
      setAddresses(addrRes.data);
    } catch (err) {
      console.error(err);
      addToast('Error fetching profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!fullName || !street || !city || !state || !postalCode || !phone) {
      addToast('Please fill all address fields', 'error');
      return;
    }

    try {
      await axios.post('/auth/addresses', {
        fullName, street, city, state, postalCode, phone
      });
      addToast('Address added!', 'success');
      setFullName('');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhone('');
      setShowAddressForm(false);
      fetchProfileData();
    } catch (err) {
      console.error(err);
      addToast('Error adding address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`/auth/addresses/${id}`);
      addToast('Address deleted successfully', 'info');
      fetchProfileData();
    } catch (err) {
      console.error(err);
      addToast('Error deleting address', 'error');
    }
  };

  const getStatusStepIndex = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest text-brand-dark">My Profile</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Manage details, address books, and track orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Side: Profile Details & Addresses */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* User Info Card */}
          {user && (
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-dark border-b border-gray-50 pb-3 flex items-center space-x-2">
                <User size={14} className="text-brand-orange" />
                <span>Account Information</span>
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Full Name</label>
                  <p className="font-bold text-brand-dark">{user.name}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Email Address</label>
                  <p className="font-bold text-brand-dark flex items-center gap-1.5">
                    <Mail size={12} className="text-gray-400" />
                    <span>{user.email}</span>
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Role Level</label>
                  <p className="font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1">
                    <Shield size={12} />
                    <span>{user.role}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Address List Card */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-dark flex items-center space-x-2">
                <MapPin size={14} className="text-brand-orange" />
                <span>Saved Addresses</span>
              </h2>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-[10px] font-bold uppercase tracking-wider text-brand-orange hover:underline"
              >
                {showAddressForm ? 'Cancel' : '+ Add New'}
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-3 border-b border-gray-50 pb-4">
                <input
                  type="text" placeholder="Full Name" required
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                />
                <input
                  type="text" placeholder="Phone Number" required
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                />
                <input
                  type="text" placeholder="Street Address" required
                  value={street} onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text" placeholder="City" required
                    value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                  <input
                    type="text" placeholder="State" required
                    value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                  />
                </div>
                <input
                  type="text" placeholder="Postal Code" required
                  value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-orange font-semibold"
                />
                <button
                  type="submit"
                  className="w-full bg-brand-dark text-white py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest hover:bg-brand-orange transition"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Addresses Grid */}
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {addresses.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">No addresses saved yet</p>
              ) : (
                addresses.map(addr => (
                  <div key={addr._id} className="border border-gray-100 rounded-xl p-3.5 flex items-start justify-between bg-brand-gray/5 hover:bg-white transition relative">
                    <div className="text-xs space-y-1 font-semibold">
                      <p className="font-extrabold text-brand-dark">{addr.fullName}</p>
                      <p className="text-gray-500 leading-normal">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-[10px] text-gray-400 block pt-0.5">Ph: {addr.phone}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-gray-300 hover:text-red-500 transition p-1 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Order List & Tracking Timelines */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark flex items-center gap-2 border-b border-gray-100 pb-3">
            <Box size={16} className="text-brand-orange" />
            <span>Order History & Real-Time Tracking</span>
          </h2>

          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-150 rounded-2xl shadow-sm">
                <Box size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">No Orders Placed Yet</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Any sneaker concepts you order will display here with tracking.</p>
              </div>
            ) : (
              orders.map((order) => {
                const currentIdx = getStatusStepIndex(order.status);
                const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                
                return (
                  <div key={order._id} className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
                    
                    {/* Order Details Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                        <p className="text-xs font-black text-brand-dark">#{order._id}</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-xs">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="font-black text-brand-orange">₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order items summary */}
                    <div className="space-y-2.5">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">Items Ordered</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center space-x-2 bg-brand-gray p-2 rounded-lg">
                            <span className="text-brand-orange font-bold">x{it.quantity}</span>
                            <span className="truncate">{it.name} ({it.size}/{it.color})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual 4-Step Stepper Timeline (Matching real-time status tracker) */}
                    <div className="space-y-4 pt-2">
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">Delivery Status Timeline</p>
                      
                      <div className="relative flex items-center justify-between w-full max-w-lg mx-auto pt-6 pb-2">
                        
                        {/* Connecting timeline bar background */}
                        <div className="absolute top-[34px] left-0 w-full h-1 bg-gray-150 z-0"></div>
                        
                        {/* Orange progress bar overlay */}
                        <div 
                          className="absolute top-[34px] left-0 h-1 bg-brand-orange z-0 transition-all duration-500"
                          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {/* Timeline Step Circles */}
                        {steps.map((st, i) => {
                          const isActive = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={st} className="flex flex-col items-center z-10 relative">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${isCurrent ? 'bg-white text-brand-orange border-brand-orange scale-110 shadow' : isActive ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-300 border-gray-200'}`}
                              >
                                {isActive && i < currentIdx ? (
                                  <CheckCircle size={14} className="fill-white stroke-brand-orange" />
                                ) : (
                                  i + 1
                                )}
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-2 ${isCurrent ? 'text-brand-orange' : isActive ? 'text-brand-dark' : 'text-gray-300'}`}>
                                {st}
                              </span>
                            </div>
                          );
                        })}

                      </div>
                    </div>

                    {/* Logs of tracking status comments */}
                    {order.trackingHistory?.length > 0 && (
                      <div className="bg-brand-gray/50 border border-gray-100 rounded-xl p-4 space-y-2 text-[10px] font-medium text-gray-500 max-h-24 overflow-y-auto">
                        <p className="font-extrabold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                          <Clock size={10} />
                          <span>Tracking Log History</span>
                        </p>
                        {order.trackingHistory.map((h, idx) => (
                          <div key={idx} className="flex justify-between items-start border-l border-gray-200 pl-2 ml-1">
                            <p className="leading-tight"><span className="font-bold text-brand-dark uppercase">{h.status}:</span> {h.comment}</p>
                            <span className="text-gray-400 shrink-0 text-[8px] font-semibold uppercase">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
