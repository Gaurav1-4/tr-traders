import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight, Loader2 } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// THE ULTIMATE BULLETPROOF DROPBOX STREAMING LINK
const PROMO_1 = "https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1";

const DEFAULT_VIDEOS = [
  PROMO_1,
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroVideos, setHeroVideos] = useState(DEFAULT_VIDEOS);
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
            if (data.heroVideos && data.heroVideos.length > 0) {
              setHeroVideos([
                data.heroVideos[0] || DEFAULT_VIDEOS[0],
                data.heroVideos[1] || DEFAULT_VIDEOS[1],
                data.heroVideos[2] || DEFAULT_VIDEOS[2],
              ]);
            }
            if (data.categories) setCategories(['All', ...data.categories]);
          }
        }
      } catch (err) { console.warn("Heritage Cloud Sync: Using internal curation."); }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.slice(0, 8));
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-x-hidden">
      
      {/* ===== CINEMATIC TALL VIDEO STRIP ===== */}
      <section className="w-full relative bg-black overflow-hidden border-b border-border h-[65vh] md:h-[85vh]">
        <div className="grid grid-cols-3 h-full">
          {heroVideos.map((url, i) => (
            <div key={i} className="relative h-full overflow-hidden group border-r border-white/10 last:border-r-0 bg-black">
               {videoErrors[i] ? (
                 <div className="absolute inset-0 bg-[#0D1B38] flex flex-col items-center justify-center p-12 text-center">
                    <p className="text-white/10 text-[10px] uppercase font-black tracking-[0.5em] leading-relaxed">Visual Production <br/> Unavailable</p>
                 </div>
               ) : (
                 <video 
                   preload="auto"
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   key={`${url}-${i}`}
                   className="w-full h-full object-cover opacity-80 transition-all duration-[8s] group-hover:scale-105 group-hover:opacity-100"
                   onError={() => setVideoErrors(p => ({...p, [i]: true}))}
                 >
                   <source src={url} type="video/mp4" />
                 </video>
               )}
               
               <div className="absolute inset-x-0 bottom-0 py-20 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 select-none">
                  <div className="flex flex-col items-center text-white gap-4">
                     <span className="text-[10px] font-black tracking-[0.6em] uppercase">Autumn 2026 Collection</span>
                     <div className="w-12 h-px bg-white/50"></div>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Brand Floating Logo (Subtle Background Effect) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 select-none overflow-hidden h-full">
           <div className="text-white/[0.03] font-serif text-[35vw] tracking-tighter uppercase italic -rotate-12 translate-y-10 whitespace-nowrap">Tr Traders</div>
        </div>
      </section>

      {/* ===== DYNAMIC CATEGORY NAVIGATION ===== */}
      <section className="py-7 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-xl overflow-hidden font-black">
        <div className="max-w-[1500px] mx-auto px-12 flex space-x-16 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.slice(0, 10).map((cat) => (
            <button key={cat} className="relative flex-shrink-0 py-2 uppercase tracking-[0.4em] text-[10px] md:text-[11px] text-[#0D1B38]/30 hover:text-[#0D1B38] transition-all hover:translate-x-2">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ===== SIGNATURE EXHIBITION ===== */}
      <section className="py-24 md:py-48 max-w-[1600px] mx-auto px-8 lg:px-20 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-36 text-center animate-fade-in px-4">
          <h1 className="text-6xl md:text-[10rem] font-serif font-light text-text tracking-tighter mb-12 italic leading-none">Couture Heritage</h1>
          <div className="w-48 h-0.5 bg-[#0D1B38]/10 mb-12"></div>
          <p className="max-w-2xl text-[#0D1B38]/40 text-[10px] md:text-[12px] uppercase tracking-[0.6em] font-black leading-loose">
             Mastering the fusion of Rohtak craftsmanship <br/> with visionary 2026 designer legacy.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 md:gap-x-24 gap-y-28 md:gap-y-56">
          {loading ? (
             <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
             products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-60 text-center text-muted border border-dashed border-[#0D1B38]/5 rounded-[6rem] bg-[#0D1B38]/[0.01]">
              <p className="font-serif text-4xl italic font-light opacity-10 uppercase tracking-[0.4em] leading-relaxed">
                 Masterpieces <br/> Arriving Shortly...
              </p>
            </div>
          )}
        </div>

        <div className="mt-56 flex justify-center pb-24">
          <Link to="/catalog" className="group relative border-[3px] border-[#0D1B38] text-[#0D1B38] px-36 py-14 hover:bg-[#0D1B38] hover:text-white transition-all duration-1000 uppercase tracking-[0.8em] text-[15px] font-black shadow-[0_60px_150px_-30px_rgba(13,27,56,0.6)] active:scale-95 hover:-translate-y-4">
            Enter The Vault <ArrowRight size={24} className="inline ml-10 group-hover:translate-x-6 transition-all duration-700" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
