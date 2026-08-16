import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function Shop() {
  const { products, loadProducts, loading } = useApp();
  const location = useLocation();

  // Search parameters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Trigger search on parameter changes
  useEffect(() => {
    // Read URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const catParam = queryParams.get('category');
    const brandParam = queryParams.get('brand');
    
    if (catParam) setSelectedCategory(catParam);
    if (brandParam) setSelectedBrand(brandParam);

    handleFilterSubmit(catParam, brandParam);
  }, [location.search]);

  const handleFilterSubmit = (forcedCat, forcedBrand) => {
    const filters = {};
    if (search) filters.search = search;
    
    const cat = forcedCat !== undefined ? forcedCat : selectedCategory;
    if (cat) filters.category = cat;

    const brand = forcedBrand !== undefined ? forcedBrand : selectedBrand;
    if (brand) filters.brand = brand;

    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (sort) filters.sort = sort;

    loadProducts(filters);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    loadProducts({});
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilterSubmit();
    }
  };

  const brands = ['Nike', 'Adidas', 'Porsche', 'Reebok', 'Puma', 'Fila'];
  const categories = ['For Him', 'For Her', 'For Kids', 'Unisex'];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold uppercase text-brand-dark">Catalog</h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-[0.2em]">Simple shoe catalog with clean product cards</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - simplified catalog mode */}
        <div className="lg:col-span-1 bg-white border border-gray-200 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-3">
            Catalog filters
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Search</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search shoes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full bg-brand-gray border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-orange font-medium"
              />
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-dark font-semibold text-brand-dark"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Brand</label>
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-brand-gray border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-dark font-semibold text-brand-dark"
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Apply Button */}
          <button 
            onClick={() => handleFilterSubmit()}
            className="w-full bg-brand-dark text-white py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest hover:bg-brand-orange transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting panel */}
          <div className="flex items-center justify-between bg-white border border-gray-150 py-3 px-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Showing <span className="text-brand-dark">{products.length}</span> Products
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort by</span>
              <select 
                value={sort} 
                onChange={(e) => {
                  setSort(e.target.value);
                  // Trigger reload with new sort
                  const filters = {};
                  if (search) filters.search = search;
                  if (selectedCategory) filters.category = selectedCategory;
                  if (selectedBrand) filters.brand = selectedBrand;
                  if (minPrice) filters.minPrice = minPrice;
                  if (maxPrice) filters.maxPrice = maxPrice;
                  filters.sort = e.target.value;
                  loadProducts(filters);
                }}
                className="bg-brand-gray border border-gray-200 rounded-lg py-1 px-3 text-xs focus:outline-none focus:border-brand-orange font-bold text-brand-dark"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Catalog grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-6 rounded-xl border border-gray-150 h-72"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No Products Found</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Try refining your filter queries or resetting filters.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-6 border border-brand-dark text-brand-dark py-2 px-6 rounded-lg text-[9px] font-extrabold uppercase tracking-widest hover:bg-brand-dark hover:text-white transition"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
