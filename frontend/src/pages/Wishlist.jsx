import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, X, Heart } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart, addToast, clearWishlist } = useApp();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    if (product.inventory === 0) {
      addToast('This product is out of stock', 'error');
      return;
    }

    const size = product.sizes?.[0] || 'One size';
    const color = product.colors?.[0] || 'Standard';
    addToCart(product, 1, size, color);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase text-brand-dark">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-2">Save your favorite products here. Remove items or buy them instantly.</p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.32em] text-brand-dark hover:bg-gray-50 transition"
          >
            <X size={16} />
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Heart size={48} className="mx-auto text-brand-orange" />
          <h2 className="text-xl font-bold text-brand-dark mt-6">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-gray-500">Add products to your wishlist and come back later to buy them.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-dark px-8 py-3 text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-brand-orange transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {wishlist.map((product) => (
            <div key={product._id} className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] p-6">
                <div className="relative overflow-hidden rounded-3xl bg-[#faf8f7] p-5 flex items-center justify-center">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                    alt={product.name}
                    className="max-h-52 object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.brand}</p>
                    <h2 className="mt-2 text-lg font-black text-brand-dark">{product.name}</h2>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">{product.description || 'No description available.'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                    <span>{product.sizes?.length ? product.sizes[0] : 'One Size'}</span>
                    <span>{product.colors?.length ? product.colors[0] : 'Standard Color'}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">Price</p>
                      <p className="text-base font-black text-brand-dark">₹{(product.salePrice && product.salePrice < product.price ? product.salePrice : product.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-brand-orange"
                      >
                        <ShoppingCart size={14} />
                        Buy Now
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark transition hover:bg-gray-50"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
