import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, MessageSquare, Heart, Shield, Package, Mail, Phone } from 'lucide-react';
import { BUSINESS_PHONE, FORMATTED_PHONE } from '../../utils/whatsapp';

export default function Footer() {
  const { setSelectedCategory, setCustomOrderOpen } = useStore();

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8DFF5] pt-16 pb-12 mt-16 text-[#2B2D42]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Banner Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-12 border-b border-[#E5DCD0]/80">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E8DFF5]/70 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#E8DFF5] text-[#7454D1] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">100% Handcrafted</h4>
              <p className="text-xs text-gray-500 mt-0.5">Woven stitch-by-stitch with soft cotton yarn.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D0ECE7]/70 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#D0ECE7] text-[#2B6064] flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 fill-[#2B6064]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Direct WhatsApp Ordering</h4>
              <p className="text-xs text-gray-500 mt-0.5">Instant coordination on <strong>{FORMATTED_PHONE}</strong>.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#FCD5CE]/70 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#FCD5CE] text-[#E76F51] flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">2FA Protected Accounts</h4>
              <p className="text-xs text-gray-500 mt-0.5">Safe authentication with SMTP & SMS OTPs.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4 md:col-span-1">
            <div className="h-14 flex items-center">
              <img 
                src="/images/logo.jpg" 
                alt="Stitch & Hook Logo" 
                className="h-full w-auto object-contain" 
              />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              An artisan crochet boutique celebrating cozy, tactile handmade creations. From everyday laptop sleeves to cute floral charms and superhero collectibles.
            </p>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3.5">
              Creations & Pricing
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <button 
                  onClick={() => setSelectedCategory('laptop-bags')} 
                  className="hover:text-[#2B6064] transition cursor-pointer"
                >
                  Laptop Bags (₹150 – ₹200)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('buds-cases')} 
                  className="hover:text-[#2B6064] transition cursor-pointer"
                >
                  Earbuds & Buds Cases (₹70 – ₹100)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('keychains')} 
                  className="hover:text-[#2B6064] transition cursor-pointer"
                >
                  Flower & Charm Keychains (₹70)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('spiderman-keychains')} 
                  className="hover:text-[#2B6064] transition cursor-pointer"
                >
                  Spiderman Amigurumi (₹80)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Custom Commissions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3.5">
              Custom Crafting
            </h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Want a specific colorway or size for your device? Commission your customized piece today.
            </p>
            <button
              type="button"
              onClick={() => setCustomOrderOpen(true)}
              className="text-xs font-bold text-[#7454D1] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Request Custom Design →
            </button>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3.5">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-gray-600">
              <a
                href={`https://wa.me/91${BUSINESS_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-700 font-bold hover:underline"
              >
                <MessageSquare className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>WhatsApp: {FORMATTED_PHONE}</span>
              </a>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail className="w-4 h-4 text-[#A388EE]" />
                <span>orders@stitchandhook.art</span>
              </div>
              <p className="text-[11px] text-gray-400 pt-1">
                Mon – Sun • 9:00 AM – 9:00 PM IST
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5DCD0]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© 2026 Stitch & Hook. Handcrafted with passion.</p>
          <div className="flex items-center gap-1 text-gray-500">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#E76F51] fill-[#E76F51]" />
            <span>for crochet lovers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
