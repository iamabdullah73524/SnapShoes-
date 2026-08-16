import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, getCartSubtotal } = useApp();
  const navigate = useNavigate();

  const subtotal = getCartSubtotal();
  const delivery = subtotal > 150 ? 0 : 15; // Free delivery for orders over ₹150
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-gray border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest text-brand-dark">Your Cart is Empty</h2>
          <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
            You haven't added any shoes to your shopping bag yet. Explore our latest performance concepts.
          </p>
        </div>
        <Link 
          to="/shop" 
          className="inline-block bg-brand-dark text-white text-[10px] font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-brand-orange transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-widest text-brand-dark">Shopping Bag</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
          Review your selections before heading to checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div 
              key={item.cartId} 
              className="bg-white border border-gray-150 rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm hover:shadow-md transition relative group"
            >
              
              {/* Product Thumbnail */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-gray border border-gray-100 rounded-lg flex items-center justify-center p-2 shrink-0">
                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>

              {/* Product Meta details */}
              <div className="flex-1 min-w-0 space-y-1 md:space-y-1.5">
                <h3 className="text-sm font-bold text-brand-dark truncate">{item.name}</h3>
                
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>Size: <span className="text-brand-dark">{item.size}</span></span>
                  <span>•</span>
                  <span>Color: <span className="text-brand-dark">{item.color}</span></span>
                </div>

                <div className="flex items-center space-x-3.5 pt-1">
                  {/* Quantity modifiers */}
                  <div className="flex items-center border border-gray-200 rounded-md py-0.5 px-1 bg-white">
                    <button 
                      onClick={() => updateCartQty(item.cartId, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-brand-dark transition"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-6 text-center text-[11px] font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQty(item.cartId, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-brand-dark transition"
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <span className="text-xs font-black text-brand-dark">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delete button */}
              <button 
                onClick={() => removeFromCart(item.cartId)}
                className="text-gray-300 hover:text-red-500 absolute top-4 right-4 md:static md:p-2.5 transition shrink-0"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}

          {/* Back to Shop Link */}
          <Link 
            to="/shop" 
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-orange transition pt-2"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-1 bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-dark border-b border-gray-50 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3.5 text-xs text-gray-500 font-semibold">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wider">Subtotal</span>
              <span className="text-brand-dark">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wider">Estimated Delivery</span>
              <span>{delivery === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `₹${delivery.toFixed(2)}`}</span>
            </div>

            {delivery > 0 && (
              <p className="text-[10px] text-gray-400 font-medium italic">
                Tip: Spend ₹150.00 or more to qualify for free shipping!
              </p>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-black">
              <span className="uppercase tracking-wider text-brand-dark">Total</span>
              <span className="text-brand-orange">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-dark text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-orange transition shadow"
          >
            Secure Checkout
          </button>
        </div>

      </div>

    </div>
  );
}
