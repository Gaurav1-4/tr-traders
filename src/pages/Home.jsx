import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// YOUR OFFICIAL PROMOTIONAL VIDEO (DIRECT LINK)
const OFFICIAL_PROMO = "https://www.dropbox.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&st=f46x37jg&raw=1";

const DEFAULT_VIDEOS = [
  OFFICIAL_PROMO,
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const DEFAULT_CATEGORIES = ['All', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [heroVideos, setHeroVideos] = useState(DEFAULT_VIDEOS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Use live videos if they overlap, otherwise stay with our default promo
            if (data.heroVideos && data.heroVideos.length > 0) {
               setHeroVideos([
                 data.heroVideos[0] || OFFICIAL_PROMO, 
                 data.heroVideos[1] || DEFAULT_VIDEOS[1], 
                 data.heroVideos[2] || DEFAULT_VIDEOS[2]
               ]);
            }
            if (data.categories) setCategories(['All', ...data.categories]);
          }
        }
      } catch (err) {
        console.warn("Cloud Sync Check: Using official fashion defaults.");
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.filter(p => activeCategory === 'All' || p.category === activeCategory).slice(0, 8));
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [activeCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-x-hidden">
      {/* ===== LUXURY VIDEO STRIP ===== */}
      <section className="w-full relative overflow-hidden border-b border-border bg-black">
        <div className="grid grid-cols-3">
          {heroVideos.map((url, i) => (
            <div key={i} className="relative aspect-[9/16] md:aspect-[3/4] overflow-hidden group border-r border-white/5 last:border-r-0">
               {videoErrors[i] ? (
                 <div className="w-full h-full bg-[#0D1B38] flex items-center justify-center p-6 text-center">
                    <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.4em]">Visual Heritage Pending</p>
                 </div>
               ) : (
                 <video autoPlay muted loop playsInline
                   className="w-full h-full object-cover opacity-90 transition-all duration-[6s] group-hover:scale-110 group-hover:opacity-100"
                   onEnded={(e) => { e.target.play(); }}
                   onError={() => { 
                      console.warn(`Streaming error on slot ${i}. Check Link: ${url}`);
                      setVideoErrors(p => ({...p, [i]: true})); 
                   }}
                 >
                   <source src={url} type="video/mp4" />
                 </video>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DYNAMIC CATEGORY STRIP ===== */}
      <section className="py-5 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-sm overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 flex space-x-12 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`relative flex-shrink-0 py-2 uppercase tracking-[0.3em] text-[10px] md:text-[11px] font-black transition-all hover:text-primary group ${
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
      </section>

      {/* ===== SIGNATURE COLLECTION ===== */}
      <section className="py-24 md:py-40 max-w-[1400px] mx-auto px-6 lg:px-16 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-24 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-light text-text tracking-tighter mb-8 italic">The Fine Art of Tradition</h2>
          <div className="w-20 h-0.5 bg-[#0D1B38]/20"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 md:gap-x-16 gap-y-20 md:gap-y-32">
          {loading ? (
             <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
             products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-48 text-center text-muted border border-dashed border-border/20 rounded-[4rem] bg-[#0D1B38]/[0.02]">
              <p className="font-serif text-3xl italic font-light opacity-30 uppercase tracking-[0.4em] leading-loose">
                Collection and Heritage <br/> Currently Curating...
              </p>
            </div>
          )}
        </div>

        <div className="mt-32 flex justify-center">
          <Link to="/catalog" className="group relative border-2 border-[#0D1B38] text-[#0D1B38] px-20 py-8 hover:bg-[#0D1B38] hover:text-white transition-all duration-1000 uppercase tracking-[0.5em] text-[13px] font-black shadow-[0_30px_70px_-15px_rgba(13,27,56,0.2)]">
            Explore Curated Works
            <ArrowRight size={20} className="inline ml-6 mb-1 group-hover:ml-10 transition-all duration-500" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
