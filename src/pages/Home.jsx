import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { getProducts } from '../services/productService';
import { ArrowRight, Wifi, WifiOff, Volume2 } from 'lucide-react';
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
          }
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
    <div className="flex flex-col min-h-screen bg-bg overflow-x-hidden">
      
      {/* ===== CINEMATIC TALL VIDEO STRIP ===== */}
      <section className="w-full relative bg-black overflow-hidden border-b border-border min-h-[70vh] md:h-[85vh]">
        <div className="absolute top-8 right-8 z-50">
           {cloudSynced === true ? (
             <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 text-[9px] uppercase tracking-widest text-white font-black">
                <Wifi size={12} className="text-green-500" /> Live Heritage Sync
             </div>
           ) : (
             <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 text-[9px] uppercase tracking-widest text-white font-black opacity-50">
                <WifiOff size={12} className="text-amber-500" /> Offline Mode
             </div>
           )}
        </div>

        <div className="grid grid-cols-3 h-full">
          {heroVideos.map((url, i) => (
            <div key={i} className="relative h-full overflow-hidden group border-r border-white/10 last:border-r-0 bg-black">
               {videoErrors[i] ? (
                 <div className="absolute inset-0 bg-[#0D1B38] flex flex-col items-center justify-center p-12 text-center">
                    <p className="text-white/10 text-[10px] uppercase font-black tracking-[0.5em] leading-relaxed">Visual Transmission <br/> Fragmented</p>
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
               
               {/* Editorial Overlay */}
               <div className="absolute inset-x-0 bottom-0 py-20 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="flex flex-col items-center text-white gap-4">
                     <span className="text-[9px] font-black tracking-[0.6em] uppercase">Autumn 2026</span>
                     <div className="w-10 h-px bg-white/40"></div>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Brand Floating Logo (Subtle) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
           <div className="text-white/5 font-serif text-[15vw] tracking-tighter uppercase select-none italic">Tr Traders</div>
        </div>
      </section>

      {/* ===== DYNAMIC CATEGORY NAVIGATION ===== */}
      <section className="py-6 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-xl overflow-hidden font-black">
        <div className="max-w-[1500px] mx-auto px-12 flex space-x-16 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.slice(0, 10).map((cat) => (
            <button key={cat} className="relative flex-shrink-0 py-2 uppercase tracking-[0.4em] text-[10px] md:text-[11px] text-[#0D1B38]/40 hover:text-[#0D1B38] transition-all hover:-translate-y-1">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ===== HERITAGE EXHIBITION ===== */}
      <section className="py-24 md:py-48 max-w-[1600px] mx-auto px-8 lg:px-20 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-32 text-center animate-fade-in px-4">
          <h1 className="text-5xl md:text-8xl font-serif font-light text-text tracking-tighter mb-10 italic leading-none">Couture Artistry</h1>
          <div className="w-32 h-0.5 bg-[#0D1B38]/10 mb-10"></div>
          <p className="max-w-xl text-[#0D1B38]/50 text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-black leading-loose">
             Experience the delicate fusion of Rohtak heritage <br/> and contemporary visionary design.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 md:gap-x-20 gap-y-24 md:gap-y-48">
          {loading ? (
             <div className="col-span-full h-96 bg-gray-50 flex items-center justify-center rounded-[4rem]">
                <Loader2 className="animate-spin text-[#0D1B38]/10" size={48} />
             </div>
          ) : products.length > 0 ? (
             products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-60 text-center text-muted border border-dashed border-[#0D1B38]/5 rounded-[6rem] bg-[#0D1B38]/[0.01]">
              <p className="font-serif text-4xl italic font-light opacity-20 uppercase tracking-[0.4em] leading-relaxed">
                 Masterpieces <br/> Arriving Shortly...
              </p>
            </div>
          )}
        </div>

        <div className="mt-48 flex justify-center">
          <Link to="/catalog" className="group relative border-[3px] border-[#0D1B38] text-[#0D1B38] px-32 py-10 hover:bg-[#0D1B38] hover:text-white transition-all duration-1000 uppercase tracking-[0.7em] text-[14px] font-black shadow-[0_40px_100px_-20px_rgba(13,27,56,0.3)] hover:-translate-y-4">
            Enter The Vault <ArrowRight size={22} className="inline ml-10 group-hover:translate-x-6 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
