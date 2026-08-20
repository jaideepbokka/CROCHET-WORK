import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, MessageSquare, ShieldCheck, Heart, ArrowDown, Package, Layers, Gift, Feather, Star } from 'lucide-react';
import { BUSINESS_PHONE, FORMATTED_PHONE } from '../../utils/whatsapp';

export default function Hero() {
  const { setSelectedCategory, setCustomOrderOpen } = useStore();

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pt-8 sm:pb-16 bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6]/60 to-[#FAF7F2]">
      {/* Decorative Pastel Mesh Glows */}
      <div className="absolute top-6 left-1/4 w-80 h-80 bg-[#E8DFF5]/70 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-16 right-1/4 w-96 h-96 bg-[#D0ECE7]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Calligraphy Brand Banner Display */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="max-w-md sm:max-w-lg w-full p-2 bg-white/70 backdrop-blur-md rounded-3xl border border-[#E8DFF5] shadow-xs flex items-center justify-center">
            <img 
              src="/images/stitch_hook_banner_logo.jpg" 
              alt="Stitch & Hook Handmade Crochet" 
              className="w-full h-auto object-contain rounded-2xl" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Story & Value Props */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E8DFF5] to-[#D0ECE7] border border-[#A388EE]/30 text-[#7454D1] text-xs font-extrabold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#7454D1]" />
              <span>100% Milk Cotton Weaves • Artisan Handcrafted</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#2B2D42] tracking-tight leading-[1.14]">
              Tactile crochet designs crafted with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B6064] via-[#4E878C] to-[#A388EE]">
                warmth and precision.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-[#4A4E69] leading-relaxed max-w-2xl">
              Elevate your daily carry with handmade double-waffle laptop sleeves, charming floral earbuds cozies, amigurumi Spiderman charms, and personalized crochet accessories.
            </p>

            {/* Price Brackets Interactive Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div 
                onClick={() => setSelectedCategory('laptop-bags')} 
                className="p-3 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#E8DFF5] hover:border-[#A388EE] hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>Laptop Bags</span>
                  <Layers className="w-3 h-3 text-[#A388EE]" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#2B6064] group-hover:text-[#A388EE] transition block mt-0.5">
                  ₹150 – ₹200
                </span>
              </div>

              <div 
                onClick={() => setSelectedCategory('buds-cases')} 
                className="p-3 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#D0ECE7] hover:border-[#4E878C] hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>Buds Cases</span>
                  <Feather className="w-3 h-3 text-[#4E878C]" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#2B6064] group-hover:text-[#4E878C] transition block mt-0.5">
                  ₹70 – ₹100
                </span>
              </div>

              <div 
                onClick={() => setSelectedCategory('keychains')} 
                className="p-3 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#FCD5CE] hover:border-[#E76F51] hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>Keychains</span>
                  <Heart className="w-3 h-3 text-[#E76F51]" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#2B6064] group-hover:text-[#E76F51] transition block mt-0.5">
                  ₹70
                </span>
              </div>

              <div 
                onClick={() => setSelectedCategory('spiderman-keychains')} 
                className="p-3 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#FDE2B8] hover:border-[#E9C46A] hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>Spiderman</span>
                  <Star className="w-3 h-3 text-[#E9C46A]" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#2B6064] group-hover:text-[#E9C46A] transition block mt-0.5">
                  ₹80
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleScrollToProducts}
                className="btn-artisan text-xs sm:text-sm py-3.5 px-6 shadow-md hover:shadow-lg"
              >
                <span>Browse Creations</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/91${BUSINESS_PHONE}?text=${encodeURIComponent('Hi Stitch & Hook! 👋 I would like to inquire about your handmade crochet pieces.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-xs sm:text-sm py-3.5 px-6 shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp: {FORMATTED_PHONE}</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-semibold text-[#6C757D]">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#D0ECE7] text-[#2B6064] flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span>Direct WhatsApp Confirmation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#E8DFF5] text-[#7454D1] flex items-center justify-center text-xs font-bold">
                  ♥
                </div>
                <span>Custom Colorways Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Workshop Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Luxury Border */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#E8DFF5]/30 group">
                <img
                  src="/images/hero_banner.jpg"
                  alt="Stitch & Hook Handcrafted Workshop"
                  className="w-full h-auto object-cover transform group-hover:scale-103 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#D0ECE7]">Handcrafted in India</p>
                  <p className="text-base sm:text-lg font-bold font-serif">Made With Love, Designed For Everyday Joy</p>
                </div>
              </div>

              {/* Floating Badge 1: Lavender Laptop Sleeve */}
              <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#E8DFF5] flex items-center gap-3 animate-float max-w-[210px]">
                <img
                  src="/images/laptop_bag_lavender.jpg"
                  alt="Laptop Sleeve"
                  className="w-12 h-12 rounded-xl object-cover border border-[#FAF7F2]"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#7454D1] uppercase block">Bestseller</span>
                  <span className="text-xs font-bold text-gray-900 block leading-tight">Waffle Sleeve</span>
                  <span className="text-xs font-extrabold text-[#2B6064]">₹180</span>
                </div>
              </div>

              {/* Floating Badge 2: Spiderman Keychain */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#FCD5CE] flex items-center gap-3 animate-float-delayed max-w-[190px]">
                <img
                  src="/images/spiderman_keychain.jpg"
                  alt="Spiderman Amigurumi"
                  className="w-12 h-12 rounded-xl object-cover border border-[#FAF7F2]"
                />
                <div>
                  <span className="text-[10px] font-bold text-red-500 uppercase block">Amigurumi</span>
                  <span className="text-xs font-bold text-gray-900 block leading-tight">Spidey Charm</span>
                  <span className="text-xs font-extrabold text-[#2B6064]">₹80</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
