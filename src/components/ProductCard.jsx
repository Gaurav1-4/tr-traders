import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import WhatsAppButton from './WhatsAppButton';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const saved = isInWishlist(product.id);

  return (
    <div 
      ref={cardRef}
      className={`relative flex flex-col group transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* 1. IMAGE BOX - CLICKABLE */}
      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f5f0eb] rounded-sm block">
        {!imageLoaded && <div className="absolute inset-0 skeleton"></div>}
        <img
          src={product.images?.[0] || '/images/placeholder.jpg'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
               <ArrowUpRight size={20} className="text-[#0D1B38]" />
            </div>
        </div>
      </Link>

      {/* 2. WISHLIST - INDEPENDENT BUTTON */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
        className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${saved ? 'bg-red-500 text-white border-red-500' : 'bg-white/10 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}`}
      >
        <Heart size={18} className={saved ? 'fill-white' : ''} />
      </button>

      {/* 3. INFO SECTION */}
      <div className="pt-6 space-y-3">
        <div className="flex justify-between items-baseline gap-2">
           <Link to={`/product/${product.id}`} className="font-serif text-[16px] md:text-[18px] text-[#0D1B38] hover:opacity-60 transition-opacity leading-snug flex-1">
             {product.name}
           </Link>
           {product.price ? (
             <span className="text-[12px] font-black uppercase tracking-widest text-[#0D1B38]">₹{product.price.toLocaleString('en-IN')}</span>
           ) : (
             <span className="text-[10px] italic text-[#0D1B38]/30">On Request</span>
           )}
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-[#0D1B38]/30">
           <span>{product.fabric || 'Premium Blend'}</span>
           <span className="h-px bg-[#0D1B38]/10 flex-1 mx-4"></span>
           <span className="text-[#0D1B38]/20">{product.category}</span>
        </div>

        <div className="pt-4">
           <WhatsAppButton 
             productName={product.name}
             className="w-full text-[10px] py-4 bg-transparent border border-[#0D1B38]/10 text-[#0D1B38]/40 hover:bg-[#0D1B38] hover:text-white hover:border-[#0D1B38] uppercase tracking-[0.4em] font-black transition-all justify-center rounded-none"
           />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
