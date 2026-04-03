import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, Heart, Menu, MessageCircle, User, ChevronDown } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

const Navbar = ({ onOpenWishlist }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}>
        {/* Top Row: icons + logo + icons */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* Left: Search + hamburger on mobile */}
            <div className="flex items-center gap-3 w-[140px]">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-text hover:text-primary transition-colors p-1"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-text p-1"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="flex flex-col items-center group">
              <img 
                src="/images/tr-traders-logo.png" 
                alt="TR TRADERS" 
                className="h-10 md:h-12 object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Right: WhatsApp, Profile, Wishlist */}
            <div className="flex items-center gap-4 w-[140px] justify-end">
              <a 
                href="https://wa.me/919208275274"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text hover:text-whatsapp transition-colors hidden sm:block"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} strokeWidth={1.5} />
              </a>
              <Link to="/admin/login" className="text-text hover:text-primary transition-colors hidden sm:block" aria-label="Account">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <button 
                onClick={onOpenWishlist}
                className="text-text hover:text-primary transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.5} className={wishlist.length > 0 ? 'fill-primary text-primary' : ''} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Nav - will be populated from firebase later */}
        <nav className="hidden md:block border-t border-border/60">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-8 lg:gap-12 py-3">
              <Link to="/catalog?category=Sarees" className="nav-link-jaipur">Sarees</Link>
              <Link to="/catalog?category=Kurta+Sets" className="nav-link-jaipur">Kurta Sets</Link>
              <Link to="/catalog?category=Suits" className="nav-link-jaipur">Suits</Link>
              <Link to="/catalog?category=Unstitched" className="nav-link-jaipur">Unstitched</Link>
              <Link to="/catalog?category=Lehengas" className="nav-link-jaipur">Lehengas</Link>
            </div>
          </div>
        </nav>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-border shadow-lg z-40 animate-fade-in">
            <div className="max-w-2xl mx-auto px-6 py-6 flex items-center gap-4">
              <Search size={20} className="text-muted flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="flex-1 text-lg font-serif font-light border-none outline-none bg-transparent placeholder:text-muted/50"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
