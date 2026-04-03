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

  // REAL-TIME CINEMA SYNC 
  useEffect(() => {
    if (isMockMode) return;
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.heroVideos && data.heroVideos.length > 0) {
          const refinedLinks = data.heroVideos.map(v => (v && v.includes('dropbox.com') && !v.includes('raw=1')) ? v.split('?')[0] + '?raw=1' : v).filter(v => v);
          if (refinedLinks.length > 0) setHeroVideos(refinedLinks);
        }
      }
    });
    return () => unsub();
  }, []);

  // SEQUENTIAL VIDEO LOADING
  useEffect(() => {
    const t1 = setTimeout(() => setActiveVideoIndices(p => [...p, 1]), 800);
    const t2 = setTimeout(() => { setActiveVideoIndices(heroVideos.map((_, i) => i)); }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [heroVideos]);

  // UNIFIED PRODUCT SYNC (NEVER EMPTY)
  useEffect(() => {
    if (isMockMode) { setProducts(HERITAGE_COLLECTION.slice(0, 8)); setLoading(false); return; }
    const q = query(collection(db, "products"), limit(12));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProducts(HERITAGE_COLLECTION.slice(0, 8));
      } else {
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetched.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setProducts(fetched.filter(p => p.status === 'active').slice(0, 8));
      }
      setLoading(false);
    }, () => {
      setProducts(HERITAGE_COLLECTION.slice(0, 8));
      setLoading(false);
    });
    return () => unsub();
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

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-x-hidden">
      
      {/* SIGNATURE HERO REEL */}
      <section className="w-full relative bg-black overflow-hidden border-b border-border h-[65vh] md:h-[85vh]">
        <div className={`w-full h-full ${heroVideos.length > 3 ? 'flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory' : 'grid grid-cols-3'}`}>
          {heroVideos.map((url, i) => (
            <div key={`${url}-${i}`} className={`relative h-full overflow-hidden group bg-[#0D1B38] transition-all duration-1000 ${heroVideos.length > 3 ? 'flex-shrink-0 w-[85vw] md:w-[33.33vw] snap-center border-r border-white/10' : 'w-full border-r border-white/5 last:border-r-0'}`}>
               {activeVideoIndices.includes(i) && !videoErrors[i] ? (
                 <video 
                   ref={el => videoRefs.current[i] = el}
                   src={url} preload={i === 0 ? "auto" : "metadata"} autoPlay muted loop playsInline webkit-playsinline="true"
                   className={`w-full h-full object-cover transition-all opacity-0 duration-[1.5s] ${activeVideoIndices.includes(i) ? 'opacity-90' : ''} group-hover:scale-105 group-hover:opacity-100`}
                   onError={() => setVideoErrors(p => ({...p, [i]: true}))}
                 />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0D1B38]">
                    <VideoIcon className="text-white/5 mb-4 animate-pulse" size={40} />
                    <p className="text-white/5 text-[8px] uppercase font-black tracking-[1em]">Collection Piece {i+1}</p>
                 </div>
               )}
            </div>
          ))}
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
