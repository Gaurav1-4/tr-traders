import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts, HERITAGE_COLLECTION } from '../services/productService';
import { ArrowRight, Loader2, Sparkles, Video as VideoIcon } from 'lucide-react';
import { db, isMockMode } from '../services/firebase';
import { doc, getDoc, onSnapshot, collection, query, limit } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroVideos, setHeroVideos] = useState(DEFAULT_VIDEOS);
  const [videoErrors, setVideoErrors] = useState({});
  const [activeVideoIndices, setActiveVideoIndices] = useState([0]); 
  const videoRefs = useRef([]);

  // 🎥 REAL-TIME CINEMA SYNC 
  useEffect(() => {
    if (isMockMode) return;
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.heroVideos) && data.heroVideos.length > 0) {
            const refinedLinks = data.heroVideos
              .filter(v => v && typeof v === 'string' && v.trim() !== '')
              .map(v => (v.includes('dropbox.com') && !v.includes('raw=1')) ? v.split('?')[0] + '?raw=1' : v);
            
            if (refinedLinks.length > 0) {
              setHeroVideos(refinedLinks);
            }
          }
        }
      }, (err) => {
        console.error("Firebase settings sync failed.", err);
      });
      return () => unsub();
    } catch (err) {
      console.error("Cinematic sync error:", err);
    }
  }, []);

  // 🏎️ PARALLEL ACCELERATED LOADING
  useEffect(() => {
    // Enable all videos immediately for parallel handshake
    setActiveVideoIndices(heroVideos.map((_, i) => i));
  }, [heroVideos]);

  // 🏛️ UNIFIED PRODUCT SYNC (NEVER EMPTY)
  useEffect(() => {
    setLoading(true);
    if (isMockMode) { setProducts(HERITAGE_COLLECTION.slice(0, 8)); setLoading(false); return; }

    const safetyTimer = setTimeout(() => {
      setProducts(HERITAGE_COLLECTION.slice(0, 8));
      setLoading(false);
    }, 5000);

    const q = query(collection(db, "products"), limit(12));
    const unsub = onSnapshot(q, (snapshot) => {
      clearTimeout(safetyTimer);
      if (snapshot.empty) {
        setProducts(HERITAGE_COLLECTION.slice(0, 8));
      } else {
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetched.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setProducts(fetched.filter(p => p.status === 'active').slice(0, 8));
      }
      setLoading(false);
    }, () => {
      clearTimeout(safetyTimer);
      setProducts(HERITAGE_COLLECTION.slice(0, 8));
      setLoading(false);
    });
    return () => {
      clearTimeout(safetyTimer);
      unsub();
    };
  }, []);

  // MOBILE AUTOPLAY FORCE
  useEffect(() => {
    const playAll = () => {
      videoRefs.current.forEach((v, idx) => {
        if (v && activeVideoIndices.includes(idx)) { v.muted = true; v.play()?.catch(() => {}); }
      });
    };
    playAll();
    const actions = ['touchstart', 'click', 'scroll'];
    actions.forEach(a => window.addEventListener(a, playAll, { once: true }));
    return () => actions.forEach(a => window.removeEventListener(a, playAll));
  }, [heroVideos, activeVideoIndices]);

  // Cap videos at exactly 3 max (Hard Limit)
  const displayVideos = heroVideos.slice(0, 3);
  const videoCount = displayVideos.length;

  // Collage grid class based on video count
  const getCollageClass = () => {
    if (videoCount <= 3) return 'grid grid-cols-3';
    if (videoCount === 4) return 'hero-collage-4';
    return 'hero-collage-5';
  };

  const getItemClass = (index) => {
    if (videoCount <= 3) return 'w-full';
    if (videoCount === 4) {
      if (index === 0) return 'collage-4-hero';
      return 'collage-4-item';
    }
    // 5 videos
    if (index < 3) return 'collage-5-top';
    return 'collage-5-bottom';
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-x-hidden">
      
      {/* SIGNATURE HERO REEL */}
      <section className="w-full relative bg-black overflow-hidden border-b border-border h-[65vh] md:h-[90vh]">
        <div className={`w-full h-full ${getCollageClass()}`}>
          {displayVideos.map((url, i) => {
            const isActive = activeVideoIndices.includes(i);
            const hasError = videoErrors[i];
            
            return (
              <div key={`${url}-${i}`} className={`relative overflow-hidden group bg-black border-r border-white/5 last:border-r-0 transition-all duration-1000 ${getItemClass(i)}`}>
                 {!hasError ? (
                   <>
                     <video 
                       ref={el => videoRefs.current[i] = el}
                       src={url} 
                       preload="auto" 
                       autoPlay 
                       muted 
                       loop 
                       playsInline 
                       className={`w-full h-full object-cover transition-all duration-[1s] ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-105`}
                       onCanPlay={() => !isActive && setActiveVideoIndices(prev => prev.includes(i) ? prev : [...prev, i])}
                       onError={() => setVideoErrors(p => ({...p, [i]: true}))}
                     />
                     
                     {/* Signature Loading Layer */}
                     <div className={`absolute inset-0 bg-[#0D1B38] transition-opacity duration-1000 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="w-full h-full flex flex-col items-center justify-center">
                           <Loader2 className="text-white/10 animate-spin mb-4" size={20} />
                           <span className="text-[8px] uppercase tracking-[0.5em] text-white/10">Loading Legacy</span>
                        </div>
                     </div>
                     <div className={`absolute top-10 left-10 z-10 pointer-events-none hidden md:block transition-all duration-1000 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/50 mb-2 font-sans">TR Traders Editorial</span>
                          <div className="w-16 h-px bg-white/30"></div>
                        </div>
                     </div>
                     <div className="absolute bottom-12 left-12 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-6 group-hover:translate-y-0">
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.8em] font-sans border border-white/30 px-10 py-5 rounded-full backdrop-blur-xl">View Collection</span>
                     </div>
                   </>
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0D1B38]">
                      <VideoIcon className="text-white/5 mb-4 animate-pulse" size={40} />
                      <p className="text-white/5 text-[8px] uppercase font-black tracking-[1em]">Media Piece {i+1}</p>
                   </div>
                 )}
              </div>
            );
          })}
        </div>
        
        {/* SCROLL INDICATOR - HIDDEN ON MOBILE */}
        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-white/40 pointer-events-none animate-bounce">
           <span className="text-[9px] uppercase tracking-[0.5em] font-black">Scroll</span>
           <div className="w-px h-10 bg-white/20"></div>
        </div>
      </section>

      {/* EXHIBITION GALLERY */}
      <section className="py-24 md:py-40 max-w-[1500px] mx-auto px-6 lg:px-24 w-full flex-grow bg-bg">
        <div className="mb-24 h-px bg-[#0D1B38]/5"></div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 md:gap-x-16 gap-y-24 md:gap-y-48">
          {loading ? (
             <SkeletonLoader count={4} />
          ) : products.length > 0 ? (
             products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-40 text-center border border-dashed border-[#0D1B38]/5 rounded-3xl bg-[#0D1B38]/[0.01]"><p className="font-serif text-3xl italic font-light opacity-10">Collections in Creation...</p></div>
          )}
        </div>

        <div className="mt-40 flex justify-center pb-24 px-4">
          <Link to="/catalog" className="w-full md:w-auto text-center group border-2 border-[#0D1B38] text-[#0D1B38] md:px-24 py-8 hover:bg-[#0D1B38] hover:text-white transition-all duration-500 uppercase tracking-[0.4em] text-[12px] font-black active:scale-95 block">
            Shop Collection <ArrowRight size={18} className="inline ml-6 group-hover:translate-x-3 transition-all duration-300" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
