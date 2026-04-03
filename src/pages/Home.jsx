import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight, Loader2 } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

const DEFAULT_CATEGORIES = ['All', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

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
  
  // Real-time Settings
  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.heroVideos) setHeroVideos(data.heroVideos);
            if (data.categories) setCategories(['All', ...data.categories]);
          }
        }
      } catch (err) {
        console.error("Cloud fetching error", err);
      }
    };
    fetchSettings();
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
    setVideoErrors(prev => ({ ...prev, [index]: true }));
  };

  const scrollToCollection = () => {
    document.getElementById('collection-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">

      {/* ===== 1. CLOUD VIDEO STRIP ===== */}
      <section className="w-full relative bg-[#0D1B38]">
        <div className="grid gap-0 border-b border-white/5 grid-cols-3">
          {heroVideos.slice(0, 3).map((url, i) => (
            <div key={i} className="relative aspect-[9/16] md:aspect-[3/4] overflow-hidden group border-r border-white/5 last:border-r-0">
              {videoErrors[i] && (
                <img src={fallbackImages[i % fallbackImages.length]} alt="" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
              )}
              {!videoErrors[i] && (
                <video autoPlay muted loop playsInline
                  className="w-full h-full object-cover"
                  onError={() => handleVideoError(i)}
                >
                  <source src={url} type="video/mp4" />
                </video>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. DYNAMIC CATEGORY STRIP (From Cloud) ===== */}
      <section id="collection-start" className="py-4 md:py-5 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-sm overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar scroll-smooth px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex-shrink-0 py-2 uppercase tracking-[0.2em] text-[10px] md:text-[11px] font-bold transition-all hover:text-primary group ${
                  activeCategory === cat ? 'text-primary' : 'text-muted'
                }`}
              >
                {cat}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-500 ${
                  activeCategory === cat ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Product Grid ===== */}
      <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-12 md:mb-20 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif font-normal text-text tracking-tight">Signature Pieces</h2>
          <div className="w-16 h-[1.5px] bg-primary"></div>
          <p className="text-muted text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Handpicked for you</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 md:gap-x-10 gap-y-12 md:gap-y-20">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 bg-surface rounded-2xl border border-dashed border-border text-center">
              <p className="font-serif text-2xl italic mb-6 text-muted">A collection is being curated...</p>
              <button onClick={() => setActiveCategory('All')} className="text-primary font-bold uppercase tracking-[0.2em] text-xs border-b border-primary/20 pb-1">
                Back to All Collections
              </button>
            </div>
          )}
        </div>
        
        {products.length > 0 && (
          <div className="mt-20 md:mt-28 flex justify-center">
            <Link to="/catalog" 
              className="group border border-[#0D1B38] text-[#0D1B38] px-14 py-5 hover:bg-[#0D1B38] hover:text-white transition-all duration-700 uppercase tracking-[0.3em] text-[11px] font-black flex items-center gap-5 shadow-2xl hover:-translate-y-2">
              Browse Full Universe
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
