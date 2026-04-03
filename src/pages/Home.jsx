import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight, Play } from 'lucide-react';

const categories = ['All', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

// Free stock videos for hero (fashion/textile themed)
const heroVideos = [
  'https://videos.pexels.com/video-files/4620563/4620563-uhd_1440_2560_30fps.mp4',
  'https://videos.pexels.com/video-files/5710432/5710432-uhd_1440_2560_30fps.mp4',
  'https://videos.pexels.com/video-files/4620571/4620571-uhd_1440_2560_30fps.mp4',
];

// Fallback images if videos don't load
const heroFallbacks = [
  '/collection-images/suit-maroon-velvet.png',
  '/collection-images/suit-sage-chiffon.png',
  '/collection-images/suit-blush-pink.png',
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [videosLoaded, setVideosLoaded] = useState([false, false, false]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.filter(p => activeCategory === 'All' || p.category === activeCategory).slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const handleVideoLoaded = (index) => {
    setVideosLoaded(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const scrollToCollection = () => {
    document.getElementById('collection-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      
      {/* ===== 1. HERO: 3-Column Video Section ===== */}
      <section className="relative w-full h-[85vh] md:h-screen overflow-hidden">
        {/* Video Columns */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 relative overflow-hidden group">
              {/* Fallback Image */}
              <img 
                src={heroFallbacks[i]} 
                alt="" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videosLoaded[i] ? 'opacity-0' : 'opacity-100'}`}
              />
              {/* Video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => handleVideoLoaded(i)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              >
                <source src={heroVideos[i]} type="video/mp4" />
              </video>
              {/* Column separator lines */}
              {i < 2 && <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10 z-10"></div>}
            </div>
          ))}
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            {/* Brand Eyebrow */}
            <p 
              className="text-white/60 tracking-[0.5em] font-sans font-medium text-[10px] md:text-[11px] uppercase mb-8 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              The Festive Edit 2025
            </p>

            {/* Main Title */}
            <h1 
              className="text-white text-[clamp(3rem,7vw,6rem)] font-serif font-light leading-[0.95] tracking-tight opacity-0 animate-[letterIn_1s_ease-out_forwards]"
              style={{ animationDelay: '0.4s' }}
            >
              Timeless.<br/>Elegance.
            </h1>

            {/* Subtitle */}
            <p 
              className="text-white/60 font-sans text-sm md:text-base max-w-md mx-auto mt-8 leading-relaxed font-light opacity-0 animate-fade-up"
              style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
            >
              Discover our curated collection of hand-embroidered silks, pure cottons, and breathtaking designer organza suites tailored for the modern traditionalist.
            </p>

            {/* CTAs */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 opacity-0 animate-fade-up"
              style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
            >
              <button 
                onClick={scrollToCollection}
                className="bg-white text-text px-10 py-4 hover:bg-white/90 transition-all duration-300 uppercase tracking-[0.25em] text-[11px] font-semibold min-w-[200px]"
              >
                The Collection
              </button>
              <a 
                href="https://wa.me/919208275274?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20your%20new%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="text-white border border-white/30 px-10 py-4 hover:bg-white/10 transition-all duration-300 uppercase tracking-[0.25em] text-[11px] font-semibold min-w-[200px]"
              >
                Enquire Stylist
              </a>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce-hover">
            <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none"><path d="M6 0v16M1 11l5 5 5-5" stroke="currentColor" strokeWidth="1.5"/></svg>
          </div>
        </div>
      </section>

      {/* ===== 2. Category Strip ===== */}
      <section id="collection-start" className="py-5 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar scroll-smooth px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex-shrink-0 py-2 uppercase tracking-[0.15em] text-[11px] font-medium transition-colors hover:text-text group ${
                  activeCategory === cat ? 'text-text' : 'text-muted'
                }`}
              >
                {cat}
                <span className={`absolute bottom-0 left-0 h-[1.5px] bg-text transition-all duration-300 ${
                  activeCategory === cat ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Product Grid ===== */}
      <section className="py-20 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-14 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-normal text-text">Signature Pieces</h2>
          <div className="w-12 h-[1.5px] bg-text/20"></div>
          <p className="text-muted text-sm font-light tracking-wide">Handpicked for the modern traditionalist</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-7 md:gap-y-14">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted">
              <p className="font-serif text-2xl italic mb-6">This collection is being curated.</p>
              <button 
                onClick={() => setActiveCategory('All')}
                className="text-text hover:text-primary uppercase tracking-[0.2em] text-xs font-bold transition-colors border-b border-text/20 pb-1"
              >
                View All
              </button>
            </div>
          )}
        </div>
        
        {products.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link 
              to="/catalog" 
              className="group border border-text text-text px-12 py-4 hover:bg-text hover:text-white transition-all duration-300 uppercase tracking-[0.2em] text-[11px] font-bold flex items-center gap-3"
            >
              View All Arrivals
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </section>

      {/* ===== 4. Editorial Section ===== */}
      <section className="bg-[#0D1B38] py-28 px-6 lg:px-16 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(126,20,255,0.3) 0%, transparent 50%)'}}></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="text-primary/60 tracking-[0.5em] uppercase text-[10px] font-medium mb-6">The Art of Tradition</p>
          <h2 className="text-white text-[clamp(2rem,4vw,3.2rem)] font-serif font-light leading-[1.2] mb-8">
            Where timeless tradition<br className="hidden md:block"/> meets modern sophistication.
          </h2>
          <p className="text-white/40 font-sans font-light text-sm max-w-lg mx-auto leading-relaxed mb-10">
            Every fabric tells a story of heritage — of artisans who pour their hearts into every stitch, of traditions passed through generations.
          </p>
          <Link 
            to="/about"
            className="inline-block text-white/70 hover:text-white uppercase tracking-[0.2em] text-[11px] font-medium border-b border-white/20 pb-1 hover:border-white/60 transition-all"
          >
            Read Our Story
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
