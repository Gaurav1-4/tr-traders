import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight } from 'lucide-react';

const categories = ['All', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

// Using samples that are known to allow hotlinking for visibility test
const DEFAULT_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

const fallbackImages = [
  '/images/suit-red-silk.jpg',
  '/images/suit-khatli.jpg',
  '/images/suit-blue.jpg',
  '/images/suit-tie-dye.jpg',
  '/images/suit-unstitched.jpg'
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [heroVideos, setHeroVideos] = useState(DEFAULT_VIDEOS);
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    const loadVideos = () => {
      const saved = localStorage.getItem('tr_traders_hero_videos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHeroVideos(parsed);
          }
        } catch (e) {
          console.error("Local videos parse error", e);
        }
      }
    };
    loadVideos();
    window.addEventListener('settingsUpdated', loadVideos);
    return () => window.removeEventListener('settingsUpdated', loadVideos);
  }, []);

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

  const handleVideoError = (index) => {
    console.warn(`Video ${index} failed to load, falling back to image.`);
    setVideoErrors(prev => ({ ...prev, [index]: true }));
  };

  const scrollToCollection = () => {
    document.getElementById('collection-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">

      {/* ===== 1. VIDEO STRIP (Distraction Free) ===== */}
      <section className="w-full relative bg-[#0D1B38]">
        <div className={`grid gap-0 ${
          heroVideos.length === 1 ? 'grid-cols-1' :
          heroVideos.length === 2 ? 'grid-cols-2' :
          heroVideos.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
          heroVideos.length === 5 ? 'grid-cols-2 md:grid-cols-5' :
          'grid-cols-1 md:grid-cols-3'
        }`}>
          {heroVideos.map((url, i) => (
            <div key={i} className="relative aspect-[9/16] md:aspect-[3/4] overflow-hidden group">
              {/* Fallback image */}
              {videoErrors[i] && (
                <img 
                  src={fallbackImages[i % fallbackImages.length]} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                />
              )}
              {/* Video */}
              {!videoErrors[i] && (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  onError={() => handleVideoError(i)}
                >
                  <source src={url} type="video/mp4" />
                </video>
              )}
              {/* Subtle dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. Category Strip ===== */}
      <section id="collection-start" className="py-5 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar scroll-smooth px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex-shrink-0 py-2 uppercase tracking-[0.18em] text-[11px] font-semibold transition-colors hover:text-text group ${
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
        <div className="flex flex-col items-center justify-center mb-16 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif font-normal text-text">Signature Pieces</h2>
          <div className="w-16 h-[1.5px] bg-text/20"></div>
          <p className="text-muted text-sm font-light tracking-widest uppercase">Handpicked for the modern traditionalist</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
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
          <div className="mt-20 flex justify-center">
            <Link 
              to="/catalog" 
              className="group border border-text text-text px-14 py-5 hover:bg-text hover:text-white transition-all duration-500 uppercase tracking-[0.25em] text-[11px] font-bold flex items-center gap-4 shadow-sm"
            >
              View Full Catalog
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
