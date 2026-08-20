import React from 'react';
import { useStore } from '../../context/StoreContext';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, RefreshCw, AlertCircle, Layers } from 'lucide-react';

export default function ProductGrid() {
  const { 
    products, 
    loadingProducts, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    maxPrice, 
    setMaxPrice,
    sortBy, 
    setSortBy 
  } = useStore();

  const categories = [
    { id: 'all', label: 'All Creations' },
    { id: 'laptop-bags', label: 'Laptop Bags (₹150–200)' },
    { id: 'buds-cases', label: 'Buds Cases (₹70–100)' },
    { id: 'spiderman-keychains', label: 'Spiderman (₹80)' },
    { id: 'keychains', label: 'Keychains (₹70)' }
  ];

  return (
    <section id="products-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-[#E0D4F5]/70 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#4E878C] mb-1.5">
            <Sparkles className="w-4 h-4 text-[#8A68E8]" />
            <span>The Artisan Lookbook</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-[#1F2421] tracking-tight">
            Curated Handcrafted Catalog
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Each item is individually woven with combed milk cotton yarn for soft tactile touch, durability, and daily delight.
          </p>
        </div>

        {/* Total Creations Count Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-4 py-2 rounded-full bg-white border border-[#E0D4F5] text-xs font-extrabold text-[#1D4548] shadow-xs">
            {products.length} {products.length === 1 ? 'Design' : 'Designs'} Available
          </span>
        </div>
      </div>

      {/* Luxury Filter & Controls Toolbar */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-[28px] border border-[#EDE4D6] shadow-md mb-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1D4548] text-white shadow-md scale-102'
                    : 'bg-[#FAF8F5] text-gray-600 hover:bg-[#EFE9FA] hover:text-[#5F32C4] border border-[#EDE4D6]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Custom Price Slider & Sort */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-6 ml-auto">
            {/* Price Slider */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-gray-500 font-bold whitespace-nowrap">Price Range:</span>
              <input
                type="range"
                min="70"
                max="250"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="lux-slider w-28 sm:w-36 cursor-pointer"
              />
              <span className="font-extrabold text-[#1D4548] bg-[#E1EFEF] px-2.5 py-1 rounded-xl text-xs min-w-[46px] text-center">
                ≤ ₹{maxPrice}
              </span>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-bold whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3.5 rounded-2xl border border-[#EDE4D6] bg-[#FAF8F5] text-xs font-extrabold text-gray-800 focus:outline-none focus:border-[#8A68E8] cursor-pointer shadow-xs"
              >
                <option value="featured">Featured Creations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Customer Rated</option>
              </select>
            </div>
          </div>

        </div>

        {/* Active Search Notification */}
        {searchQuery && (
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>Showing filtered results for "<strong>{searchQuery}</strong>"</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#8A68E8] font-extrabold hover:underline cursor-pointer"
            >
              Clear Search Filter
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-[28px] p-5 border border-gray-100 h-96 animate-pulse flex flex-col justify-between">
              <div className="aspect-square bg-gray-100 rounded-2xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-10 bg-gray-100 rounded-2xl mt-4" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-6 bg-white rounded-[36px] border border-[#E0D4F5] max-w-lg mx-auto shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#F5EFE6] text-[#8A68E8] mx-auto flex items-center justify-center mb-4 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1.5">No Creations Found</h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            We couldn't find items matching your selected criteria. Try adjusting the price filter or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setMaxPrice(250);
            }}
            className="btn-primary-artisan text-xs py-3 px-6"
          >
            <RefreshCw className="w-4 h-4" />
            Reset All Filters
          </button>
        </div>
      )}

    </section>
  );
}
