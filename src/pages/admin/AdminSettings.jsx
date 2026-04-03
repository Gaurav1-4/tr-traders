import { useState, useEffect } from 'react';
import { Save, Settings, Video, Trash2, Plus, Link as LinkIcon, RefreshCcw, ArrowLeft, ArrowRight, Loader2, Globe, Sparkles, Database, Package } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, isMockMode } from '../../services/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import { HERITAGE_COLLECTION } from '../../services/productService';

const DEFAULT_VIDEOS = [
  'https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      setFetching(true);
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.heroVideos) setHeroVideos(data.heroVideos);
          }
        }
      } catch (err) { console.error(err); } 
      finally { setFetching(false); }
    };
    fetchSettings();
  }, []);

  const handleVideoLinkChange = (index, value) => {
    setHeroVideos(p => {
      const next = [...p];
      next[index] = value.trim();
      return next;
    });
  };

  const seedProducts = async () => {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const product of HERITAGE_COLLECTION) {
        const newDocRef = doc(collection(db, 'products'));
        batch.set(newDocRef, { ...product, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      showToast('Heritage Collection Restored!', 'success', 3000);
      window.location.href = '/admin/products';
    } catch (err) {
      showToast('Database Blocked (Rules)', 'error');
    } finally { setSeeding(false); }
  };

  const addVideoSlot = () => { setHeroVideos(p => [...p, '']); };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { heroVideos, updatedAt: new Date().toISOString() }, { merge: true });
      showToast('Reel Synchronized Successfully', 'success');
    } catch (error) { showToast('Sync failed.', 'error'); } 
    finally { setLoading(false); }
  };

  if (fetching) return <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]"><Loader2 size={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] pb-48 font-sans selection:bg-[#0D1B38] selection:text-white">
      {/* ===== STUDIO NAV ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#0D1B38]/5 mb-12">
         <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
            <h1 className="text-xs font-black uppercase tracking-[0.6em] opacity-30">Heritage Workshop</h1>
            <div className="flex items-center gap-10">
               <button onClick={handleSave} disabled={loading} className="bg-[#0D1B38] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Synchronize Presence'}
               </button>
            </div>
         </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10">
         <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
               <h2 className="text-5xl md:text-8xl font-serif font-light tracking-tighter mb-8 italic leading-none">Studio Controls</h2>
               <div className="w-24 h-px bg-[#0D1B38]/20 mb-8"></div>
               <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-black text-[#0D1B38]/30 leading-loose">
                  Curate the cinema exhibit and restore heritage pieces to the digital showroom.
               </p>
            </div>
            
            {/* HERITAGE COLLECTION RE-SEEDER */}
            <div className="bg-[#0D1B38]/[0.02] p-8 border border-dashed border-[#0D1B38]/10 rounded-[3rem] text-center md:text-left">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0D1B38]/30 mb-6">Masterpiece Restoration</p>
               <button onClick={seedProducts} disabled={seeding}
                 className="flex items-center gap-6 px-10 py-5 bg-white border border-[#0D1B38]/10 rounded-2xl shadow-sm hover:shadow-xl transition-all group active:scale-95 disabled:opacity-50">
                  <Package className="text-primary group-hover:scale-125 transition-transform" />
                  <div className="text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Restore Originals</p>
                     <p className="text-[9px] opacity-40 font-serif italic uppercase tracking-tighter">Seed 5 Signature Suit Sets</p>
                  </div>
                  {seeding && <Loader2 className="animate-spin text-primary ml-4" size={16} />}
               </button>
            </div>
         </header>

         {/* CINEMA GRID */}
         <section className="mb-40">
            <div className="flex items-center justify-between mb-16 border-b border-[#0D1B38]/5 pb-8">
               <div className="flex items-center gap-6">
                  <Video size={24} className="opacity-10" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#0D1B38]/40">Visual Exhibition Reel</span>
               </div>
               <button onClick={addVideoSlot} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all flex items-center gap-3">
                  <Plus size={16} /> Add Slot
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
               {heroVideos.map((url, i) => (
                 <div key={`${i}-${refreshKey}`} className="flex flex-col gap-8 animate-fade-in group" style={{animationDelay: `${i*0.1}s`}}>
                    <div className="aspect-[3/4] bg-black rounded-[2.5rem] overflow-hidden relative shadow-[0_50px_130px_-30px_rgba(0,0,0,0.5)] transition-all duration-1000 group-hover:-translate-y-4 border border-white/5">
                       <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" />
                       <div className="absolute top-8 left-8 text-white/20 text-[8px] font-black uppercase tracking-[0.6em]">REEL {i+1}</div>
                    </div>
                    <div className="px-4">
                       <input 
                         type="text" 
                         value={url} 
                         onChange={(e) => handleVideoLinkChange(i, e.target.value)}
                         placeholder="Paste link" 
                         className="w-full bg-transparent border-b border-[#0D1B38]/10 py-5 text-[10px] font-black tracking-[0.1em] outline-none focus:border-[#0D1B38] transition-all text-[#0D1B38]/60 uppercase placeholder:text-[#0D1B38]/10"
                       />
                    </div>
                 </div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
};

export default AdminSettings;
