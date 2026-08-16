import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { addToWishlist, wishlist } = useApp();
  const navigate = useNavigate();
  const hasSale = product.salePrice && product.salePrice < product.price;
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative flex cursor-pointer flex-col bg-white p-4 rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToWishlist(product);
        }}
        className={`absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
          isWishlisted ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-gray-200 bg-white text-gray-500 hover:border-brand-orange hover:text-brand-orange'
        }`}
        aria-label="Add to wishlist"
      >
        <Heart size={16} />
      </button>

      {/* Sale Tag */}
      {hasSale && (
        <span className="absolute top-4 left-4 bg-brand-orange text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">
          sale!
        </span>
      )}

      {/* Out of Stock Tag */}
      {product.inventory === 0 && (
        <span className="absolute top-16 right-4 bg-brand-dark text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">
          out of stock
        </span>
      )}

      {/* Image Container */}
      <div className="w-full aspect-[4/3] bg-[#f8f8f8] rounded-lg overflow-hidden flex items-center justify-center p-3 relative">
        {/* Replace this image URL in the backend product data for each shoe listing. */}
        <img 
          src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Meta Content */}
      <div className="mt-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
            {product.brand}
          </span>
          <h3 className="text-sm font-bold text-brand-dark group-hover:text-brand-orange transition truncate">
            {product.name}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={11} 
                  fill={i < Math.floor(product.rating || 4) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating || 4) ? "text-amber-400" : "text-gray-200"} 
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount || 0})</span>
          </div>

          {/* Pricing */}
          <div className="text-right">
            {hasSale ? (
              <div className="flex items-center space-x-1.5 justify-end">
                {/* Update price or salePrice values in the backend product data. */}
                <span className="text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                <span className="text-xs font-extrabold text-brand-dark">₹{product.salePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xs font-extrabold text-brand-dark">₹{product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
