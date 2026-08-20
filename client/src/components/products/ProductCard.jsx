import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Eye, Star, MessageSquare, Sparkles, Check } from 'lucide-react';
import { FORMATTED_PHONE } from '../../utils/whatsapp';

export default function ProductCard({ product }) {
  const { 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    triggerDirectBuyNow, 
    setQuickViewProduct 
  } = useStore();

  const [selectedColor, setSelectedColor] = useState(
    product.colorOptions?.[0] || 'Original'
  );

  const isSaved = wishlist.includes(product.id);
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="product-luxury-card group flex flex-col justify-between h-full bg-white rounded-[28px] border border-[#F0E8DD] hover:border-[#CBB6ED] transition-all duration-400 shadow-sm hover:shadow-xl">
      
      {/* Top Image Showcase */}
      <div className="relative aspect-square w-full bg-[#F5EFE6]/50 overflow-hidden rounded-t-[28px]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badge && (
            <span className="badge-artisan-lavender px-3 py-1 rounded-full text-[11px] shadow-sm font-extrabold tracking-wide uppercase">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="badge-artisan-gold px-2.5 py-0.5 rounded-full text-[10px] shadow-xs font-extrabold">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Top Right Wishlist & Quick View */}
        <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer backdrop-blur-md ${
              isSaved
                ? 'bg-[#E76F51] text-white scale-110'
                : 'bg-white/90 text-gray-600 hover:text-[#E76F51] hover:scale-105 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-600 hover:text-[#2B6064] hover:scale-105 hover:bg-white flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Quick Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pill Over Image Bottom */}
        <div className="absolute bottom-3 left-3.5 z-10">
          <span className="text-[11px] font-extrabold text-[#1D4548] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-white/80">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-3.5">
        <div>
          {/* Rating */}
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="font-extrabold text-gray-900">{product.rating}</span>
              <span className="text-gray-400">({product.reviewsCount})</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock
            </span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => setQuickViewProduct(product)}
            className="font-serif font-bold text-lg text-[#1F2421] group-hover:text-[#2B6064] transition line-clamp-1 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Color Switcher Swatches */}
          {product.colorOptions && product.colorOptions.length > 0 && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100/80">
              <span className="text-[11px] text-gray-400 font-semibold">Colorway:</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[170px]">
                {product.colorOptions.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                      selectedColor === col
                        ? 'bg-[#1D4548] text-white border-[#1D4548] shadow-xs'
                        : 'bg-[#FAF8F5] text-gray-600 border-[#EDE4D6] hover:border-gray-400'
                    }`}
                  >
                    {col.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1D4548]">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-semibold">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#8A68E8]">
              Selected: <strong className="text-gray-800">{selectedColor.split(' ')[0]}</strong>
            </span>
          </div>

          {/* Action Row: Add to Bag + Buy Now (WhatsApp) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => addToCart(product, 1, selectedColor)}
              className="py-3 px-3 rounded-2xl bg-[#F5EFE6] hover:bg-[#EFE9FA] text-[#1D4548] hover:text-[#5F32C4] text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#EDE4D6] shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>

            <button
              type="button"
              onClick={() => triggerDirectBuyNow(product, 1, selectedColor)}
              className="py-3 px-3 rounded-2xl btn-whatsapp-lux text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
