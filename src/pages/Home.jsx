import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight, Wifi, WifiOff } from 'lucide-react';
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
  const [cloudSynced, setCloudSynced] = useState(null);
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
            setCloudSynced(true);
          } else { setCloudSynced(true); }
        }
      } catch (err) { setCloudSynced(false); }
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
    <div className="flex flex-col min-h-screen bg-bg">
      <section className="w-full relative bg-black overflow-hidden border-b border-border">
        <div className="absolute top-4 right-4 z-50">
           {cloudSynced === true ? (
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30 text-[8px] uppercase tracking-widest text-green-400 font-black">
                <Wifi size={10} /> Heritage Sync Active
             </div>
           ) : cloudSynced === false ? (
             <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-500/30 text-[8px] uppercase tracking-widest text-amber-400 font-black">
                <WifiOff size={10} /> Local Heritage Mode
             </div>
           ) : null}
        </div>

        <div className="grid grid-cols-3">
          {heroVideos.map((url, i) => (
            <div key={i} className="relative aspect-[9/16] md:aspect-[3/4] overflow-hidden group border-r border-white/5 last:border-r-0 bg-black">
               {videoErrors[i] ? (
                 <div className="absolute inset-0 bg-[#0D1B38] flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.4em]">Visual Heritage Unavailable</p>
                 </div>
               ) : (
                 <video 
                   preload="auto"
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   key={`${url}-${i}`}
                   className="w-full h-full object-cover opacity-90 transition-all duration-[5s] group-hover:scale-110 group-hover:opacity-100"
                   onError={() => {
                     setVideoErrors(prev => ({...prev, [i]: true}));
                   }}
                 >
                   <source src={url} type="video/mp4" />
                 </video>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-5 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-sm overflow-hidden font-black">
        <div className="max-w-[1400px] mx-auto px-12 flex space-x-12 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button key={cat} className="relative flex-shrink-0 py-2 uppercase tracking-[0.3em] text-[10px] md:text-[11px] text-muted hover:text-primary transition-all">
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-40 max-w-[1400px] mx-auto px-6 lg:px-16 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-24 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-light text-text tracking-tighter mb-8 italic">The Curator Collection</h1>
          <div className="w-20 h-px bg-[#0D1B38]/20"></div>
          <p className="mt-8 text-[11px] uppercase tracking-[0.6em] text-muted font-black">Rohtak, India 2026</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 md:gap-x-16 gap-y-24 md:gap-y-40">
          {loading ? (
             <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
             products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-48 text-center text-muted border border-dashed border-border/20 rounded-[4rem] bg-[#0D1B38]/[0.02]">
              <p className="font-serif text-3xl italic font-light opacity-30 uppercase tracking-[0.4em] leading-loose">
                Curating Elegance...
              </p>
            </div>
          )}
        </div>

        <div className="mt-40 flex justify-center">
          <Link to="/catalog" className="group relative border-[1.5px] border-[#0D1B38] text-[#0D1B38] px-24 py-8 hover:bg-[#0D1B38] hover:text-white transition-all duration-1000 uppercase tracking-[0.6em] text-[13px] font-black shadow-2xl flex items-center gap-8">
            The Exhibition <ArrowRight size={20} className="group-hover:translate-x-4 transition-transform duration-500" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
