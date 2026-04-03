import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight, Loader2 } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Your Google Drive Direct Link (Converted)
const PROD_VIDEO_1 = "https://drive.google.com/uc?export=download&id=1rwwvoV3M8Fat2u3UMYfG5igUqZHKtZzf";

const DEFAULT_VIDEOS = [
  PROD_VIDEO_1,
  'https://www.w3schools.com/html/movie.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

const DEFAULT_CATEGORIES = ['All', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
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
        console.error("Cloud settings error", err);
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
    console.warn(`Video ${index} failed: Check Gdrive Permissions.`);
    setVideoErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">

      {/* ===== 1. VIDEO STRIP ===== */}
      <section className="w-full relative shadow-inner overflow-hidden">
        <div className="grid gap-0 border-b border-white/5 grid-cols-3">
          {heroVideos.slice(0, 3).map((url, i) => (
            <div key={i} className="relative aspect-[9/16] md:aspect-[3/4] overflow-hidden bg-black/5 group border-r border-white/5 last:border-r-0">
              {videoErrors[i] && (
                <div className="absolute inset-0 bg-[#0D1B38] flex flex-col items-center justify-center p-4 text-center">
                   <p className="text-white/20 text-[8px] uppercase tracking-[0.3em] font-bold">Image Preview Mode</p>
                </div>
              )}
              {!videoErrors[i] && (
                <video autoPlay muted loop playsInline
                  className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105"
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

      {/* ===== 2. DYNAMIC CATEGORY STRIP ===== */}
      <section id="collection-start" className="py-4 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-sm overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 lg:space-x-12 overflow-x-auto no-scrollbar px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex-shrink-0 py-2 uppercase tracking-[0.25em] text-[10px] md:text-[11px] font-black transition-all hover:text-primary group ${
                  activeCategory === cat ? 'text-primary' : 'text-muted'
                }`}
              >
                {cat}
                <span className={`absolute bottom-0 left-0 h-[2.5px] bg-primary transition-all duration-500 rounded-full ${
                  activeCategory === cat ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Product Grid ===== */}
      <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-16 md:mb-24 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-light text-text tracking-tighter mb-6">Signature Selection</h2>
          <div className="w-20 h-px bg-primary/30"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 md:gap-x-12 gap-y-16 md:gap-y-24">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-muted border border-dashed border-border rounded-3xl">
              <p className="font-serif text-3xl italic font-light opacity-50">Curating Heritage...</p>
            </div>
          )}
        </div>
        
        {products.length > 0 && (
          <div className="mt-24 md:mt-32 flex justify-center">
            <Link to="/catalog" 
              className="group border-2 border-[#0D1B38] text-[#0D1B38] px-16 py-6 hover:bg-[#0D1B38] hover:text-white transition-all duration-700 uppercase tracking-[0.4em] text-[12px] font-black flex items-center gap-6 shadow-2xl hover:shadow-primary/20">
              The Full Gallery
              <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
