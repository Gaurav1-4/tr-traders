import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import WhatsAppButton from './WhatsAppButton';

const ProductCard = ({ product }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
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

  return (
    <div 
      ref={cardRef}
      className={`card-enter ${isVisible ? 'visible' : ''} group flex flex-col relative`}
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

      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f5f0eb] block">
        {/* Loading Skeleton */}
        {!imageLoaded && <div className="absolute inset-0 skeleton"></div>}
        
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML += `<div class="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center"><span class="text-4xl font-serif text-gray-300">${product.name.charAt(0)}</span></div>`;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.featured && (
            <span className="bg-[#0D1B38] text-white text-[9px] font-semibold px-3 py-1 uppercase tracking-[0.15em]">
              Best Selling
            </span>
          )}
          {product.stock === 'low_stock' && (
            <span className="bg-amber-500 text-white text-[9px] font-semibold px-3 py-1 uppercase tracking-[0.15em]">
              Low Stock
            </span>
          )}
          {product.status === 'out_of_stock' && (
            <span className="bg-red-500 text-white text-[9px] font-semibold px-3 py-1 uppercase tracking-[0.15em]">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick Enquiry on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <WhatsAppButton 
            productName={product.name}
            className="w-full text-[10px] py-3 bg-white text-text hover:bg-[#0D1B38] hover:text-white shadow-lg tracking-[0.15em] uppercase font-semibold transition-colors"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 pb-1 space-y-1.5">
        <Link 
          to={`/product/${product.id}`} 
          className="block font-serif text-[15px] md:text-base font-normal text-text leading-snug hover:text-primary transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        
        {product.fabric && (
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted">{product.fabric}</p>
        )}
        
        {product.price ? (
          <p className="text-sm font-medium text-text">₹{product.price.toLocaleString('en-IN')}</p>
        ) : (
          <p className="text-sm italic text-muted">Price on Request</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
