import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { products, loadProducts, loading } = useApp();

  useEffect(() => {
    loadProducts();
  }, []);

  // Get featured and best seller products
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                NEW CONCEPT FOR SUMMER
              </span>
              <h1 className="text-5xl md:text-7xl font-black uppercase leading-tight tracking-tight text-[#1a1a1a]">
                sneaker
                <br />
                <span className="text-orange-500">PORSCHE</span>
              </h1>
              <p className="mt-6 text-base text-gray-600 leading-relaxed max-w-md">
                Experience premium craftsmanship combined with innovative design for the modern sneaker enthusiast.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide text-sm hover:bg-gray-800 transition"
                >
                  Shop Now
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full h-96 lg:h-full">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                  alt="Hero Sneaker"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="py-16 md:py-24 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] mb-2">
              featured
            </h2>
            <p className="text-sm uppercase tracking-widest text-gray-500">Products</p>
          </div>

          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No featured products available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Best Seller Section */}
      <section id="best-sellers" className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] mb-2">
              best seller
            </h2>
            <p className="text-sm uppercase tracking-widest text-gray-500">Products</p>
          </div>

          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-80" />
              ))}
            </div>
          ) : (
            <div>
              {/* Large featured best seller on left */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {bestSellers.length > 0 && (
                  <div className="lg:col-span-1 flex flex-col">
                    <div className="group relative flex flex-col bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      {bestSellers[0].salePrice && bestSellers[0].salePrice < bestSellers[0].price && (
                        <span className="absolute top-4 left-4 bg-orange-500 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">
                          sale!
                        </span>
                      )}
                      <div className="w-full aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center p-3 relative mb-4">
                        <img
                          src={bestSellers[0].images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                          alt={bestSellers[0].name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                            {bestSellers[0].brand}
                          </span>
                          <h3 className="text-sm font-bold text-[#1a1a1a] mb-2">
                            {bestSellers[0].name}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {bestSellers[0].salePrice && bestSellers[0].salePrice < bestSellers[0].price ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs text-gray-400 line-through">₹{bestSellers[0].price.toFixed(2)}</span>
                              <span className="text-sm font-extrabold text-[#1a1a1a]">₹{bestSellers[0].salePrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-extrabold text-[#1a1a1a]">₹{bestSellers[0].price.toFixed(2)}</span>
                          )}
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(bestSellers[0].rating || 4) ? 'text-yellow-400' : 'text-gray-200'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid of smaller best sellers */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {bestSellers.slice(1, 5).map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>

              {/* Additional best sellers grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.slice(5).map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* View All Button */}
          <div className="flex justify-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-black text-black font-bold uppercase tracking-wide rounded-full hover:bg-black hover:text-white transition"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-[#1a1a1a] text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4">FLARE</h3>
              <p className="text-sm text-gray-400">Premium sneaker collection for the modern enthusiast.</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wide text-sm mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/shop" className="hover:text-white transition">Men</Link></li>
                <li><Link to="/shop" className="hover:text-white transition">Women</Link></li>
                <li><Link to="/shop" className="hover:text-white transition">Kids</Link></li>
                <li><Link to="/shop" className="hover:text-white transition">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wide text-sm mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition">Returns</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wide text-sm mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">Copyright © 2024 FLARE. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
