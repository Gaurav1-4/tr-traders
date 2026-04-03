import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Using professional high-performance fashion video links for testing
const DEFAULT_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-indian-woman-posing-with-a-sari-41011-large.mp4',
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
  
  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);
  const [categories, setCategories] = useState(['All', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton']);
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.heroVideos && data.heroVideos.length > 0) setHeroVideos(data.heroVideos);
            if (data.categories) setCategories(['All', ...data.categories]);
          }
        }
      } catch (err) {
        console.error("Cloud settings fetch failed (Database not created yet)", err);
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

  return (
    <div className="flex flex-col min-h-screen bg-bg">

      {/* ===== 1. VIDEO STRIP (Horizontal) ===== */}
      <section className="w-full relative shadow-inner overflow-hidden border-b border-border">
        <div className="grid gap-0 grid-cols-3">
          {heroVideos.slice(0, 3).map((url, i) => (
            <div key={i} className="relative aspect-[9/16] md:aspect-[3/4] overflow-hidden bg-black group border-r border-white/10 last:border-r-0">
              {videoErrors[i] && (
                <img src={fallbackImages[i % fallbackImages.length]} alt="" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
              )}
              {!videoErrors[i] && (
                <video autoPlay muted loop playsInline
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                  onError={() => handleVideoError(i)}
                >
                  <source src={url} type="video/mp4" />
                </video>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. DYNAMIC CATEGORY STRIP ===== */}
      <section id="collection-start" className="py-5 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-sm overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-10 overflow-x-auto no-scrollbar px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex-shrink-0 py-1 uppercase tracking-[0.3em] text-[10px] md:text-[11px] font-black transition-all hover:text-primary group ${
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
      <section className="py-20 md:py-32 max-w-[1400px] mx-auto px-6 lg:px-12 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-light text-text tracking-tighter mb-8">Selected Couture</h2>
          <div className="w-16 h-0.5 bg-primary/20"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-12 gap-y-16 md:gap-y-28">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-40 text-center text-muted border border-dashed border-border/20 rounded-[3rem] bg-surface/50 backdrop-blur-sm">
              <p className="font-serif text-2xl italic font-light opacity-40 uppercase tracking-widest">Awaiting our latest arrival...</p>
            </div>
          )}
        </div>
        
        {products.length > 0 && (
          <div className="mt-32 flex justify-center">
            <Link to="/catalog" 
              className="group border border-[#0D1B38] text-[#0D1B38] px-16 py-6 hover:bg-[#0D1B38] hover:text-white transition-all duration-700 uppercase tracking-[0.4em] text-[12px] font-black flex items-center gap-6 shadow-2xl">
              Explore the Catalog
              <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
