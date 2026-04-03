import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';
import { ArrowRight, Loader2 } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroVideos, setHeroVideos] = useState(DEFAULT_VIDEOS);
  const [categories, setCategories] = useState(['All', 'Sarees', 'Suits', 'Lehengas', 'Kurta Sets', 'Unstitched']);
  const [videoErrors, setVideoErrors] = useState({});
  const videoRefs = useRef([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.heroVideos && data.heroVideos.length > 0) setHeroVideos(data.heroVideos);
          }
        }
      } catch (err) { console.warn("Heritage Cloud Ready."); }
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

  // FORCE PLAY FOR ALL MOBILE DEVICES
  useEffect(() => {
    videoRefs.current.forEach(video => {
      if (video) {
        // Explicitly set muted again as some browsers forget it during re-renders
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Mobile Autoplay Blocked / User interaction needed or Low Power Mode active.");
          });
        }
      }
    });
  }, [heroVideos]);

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-x-hidden">
      
      {/* ===== SIGNATURE HERO REEL - DEEP FORCE MOBILE PLAY ===== */}
      <section className="w-full relative bg-black overflow-hidden border-b border-border h-[65vh] md:h-[85vh]">
        <div className={`w-full h-full ${heroVideos.length > 3 ? 'flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 md:px-0 gap-4 md:gap-0' : 'grid grid-cols-3'}`}>
          {heroVideos.map((url, i) => (
            <div key={i} className={`relative h-full overflow-hidden group bg-black transition-all duration-1000 ${heroVideos.length > 3 ? 'flex-shrink-0 w-[85vw] md:w-[33.33vw] snap-center border-r border-white/10' : 'w-full border-r border-white/5 last:border-r-0'}`}>
               
               {!videoErrors[i] ? (
                 <video 
                   ref={el => videoRefs.current[i] = el}
                   preload="auto"
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   webkit-playsinline="true"
                   onLoadedData={(e) => e.target.play()}
                   className="w-full h-full object-cover opacity-90 transition-all duration-[6s] group-hover:scale-105 group-hover:opacity-100"
                   onError={() => setVideoErrors(p => ({...p, [i]: true}))}
                 >
                   <source src={url} type="video/mp4" />
                 </video>
               ) : (
                 <div className="absolute inset-0 bg-[#0D1B38] flex items-center justify-center p-8 text-center">
                    <p className="text-white/10 text-[8px] uppercase font-black tracking-[0.5em]">Curating...</p>
                 </div>
               )}
               
               <div className="absolute inset-x-0 bottom-0 py-16 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 select-none hidden md:flex flex-col items-center">
                  <span className="text-white font-black text-[9px] uppercase tracking-[0.6em]">Heritage Piece {i+1}</span>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SIGNATURE CATEGORY STRIP ===== */}
      <section className="py-7 border-b border-border bg-white sticky top-[105px] md:top-[118px] z-30 shadow-xl overflow-hidden font-black">
        <div className="max-w-[1500px] mx-auto px-12 flex space-x-16 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button key={cat} className="relative flex-shrink-0 py-2 uppercase tracking-[0.4em] text-[10px] md:text-[11px] text-[#0D1B38]/30 hover:text-[#0D1B38] transition-all">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ===== EXHIBITION GALLERY ===== */}
      <section className="py-24 md:py-48 max-w-[1800px] mx-auto px-10 lg:px-24 w-full flex-grow bg-bg">
        <div className="flex flex-col items-center justify-center mb-36 text-center animate-fade-in px-4">
          <h1 className="text-7xl md:text-[11rem] font-serif font-light text-text tracking-tighter mb-12 italic leading-none opacity-95">Heritage</h1>
          <div className="w-40 h-0.5 bg-[#0D1B38]/10 mb-8"></div>
          <p className="max-w-2xl text-[#0D1B38]/40 text-[10px] md:text-[12px] uppercase tracking-[0.6em] font-black leading-loose">
             Curated authenticity for the global <br/> ethnic fashion visionary.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 md:gap-x-20 gap-y-28 md:gap-y-64">
          {loading ? (
             <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
             products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-80 text-center border border-dashed border-[#0D1B38]/5 rounded-[7rem] bg-[#0D1B38]/[0.01]">
              <p className="font-serif text-3xl italic font-light opacity-10 uppercase tracking-[0.4em] leading-relaxed">
                 Masterpieces <br/> in Creation...
              </p>
            </div>
          )}
        </div>

        <div className="mt-56 flex justify-center pb-24 px-4">
          <Link to="/catalog" className="w-full md:w-auto text-center group border-[3px] border-[#0D1B38] text-[#0D1B38] md:px-40 py-16 hover:bg-[#0D1B38] hover:text-white transition-all duration-1000 uppercase tracking-[0.8em] text-[15px] font-black shadow-2xl active:scale-95 block">
            Enter The Vault <ArrowRight size={24} className="inline ml-10 group-hover:translate-x-6 transition-all duration-700" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
