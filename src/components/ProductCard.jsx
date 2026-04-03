import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import WhatsAppButton from './WhatsAppButton';

const ProductCard = ({ product }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const saved = isInWishlist(product.id);

  const handleCardClick = (e) => {
    // If user clicked the button or wishlist, don't navigate
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className={`card-enter ${isVisible ? 'visible' : ''} group flex flex-col relative cursor-pointer`}
    >
      {/* Wishlist Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100 ${saved ? 'opacity-100 text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        aria-label="Save to Wishlist"
      >
        <Heart size={16} className={saved ? 'fill-red-500' : ''} strokeWidth={1.5} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f0eb] block">
        {/* Loading Skeleton */}
        {!imageLoaded && <div className="absolute inset-0 skeleton"></div>}
        
        <img
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML += `<div class="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center"><span class="text-4xl font-serif text-gray-300">${product.name.charAt(0)}</span></div>`;
          }}
        />
      </div>
        
      {/* Info */}
      <div className="pt-5 pb-3 space-y-2">
        <div className="flex justify-between items-start gap-4">
           <h3 className="font-serif text-[15px] md:text-[17px] font-normal text-text leading-tight group-hover:text-primary transition-colors flex-1">
             {product.name}
           </h3>
           <button 
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               toggleWishlist(product.id);
             }}
             className={`transition-all ${saved ? 'text-red-500 scale-110' : 'text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100'}`}
             aria-label="Save to Wishlist"
           >
             <Heart size={18} className={saved ? 'fill-red-500' : ''} strokeWidth={1.5} />
           </button>
        </div>
        
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] pt-1">
           {product.fabric && (
             <p className="text-muted/60">{product.fabric}</p>
           )}
           {product.price ? (
             <p className="font-black text-text">₹{product.price.toLocaleString('en-IN')}</p>
           ) : (
             <p className="italic text-muted/30">Price on Request</p>
           )}
        </div>

        <div className="pt-6">
           <WhatsAppButton 
             productName={product.name}
             className="w-full text-[9px] py-3.5 bg-transparent border border-border/60 text-[#0D1B38]/40 hover:bg-[#0D1B38] hover:text-white hover:border-[#0D1B38] shadow-none uppercase tracking-[0.3em] font-black transition-all justify-center rounded-sm"
           />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
