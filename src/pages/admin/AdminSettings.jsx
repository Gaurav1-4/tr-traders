import { useState, useEffect } from 'react';
import { Save, Settings, Video, Trash2, Plus, Link as LinkIcon, RefreshCcw, ArrowLeft, ArrowRight, Loader2, Monitor, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, isMockMode } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    let cleanUrl = value.trim();
    if (cleanUrl.includes('drive.google.com')) {
      const gmatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (gmatch) cleanUrl = `https://drive.google.com/uc?export=download&id=${gmatch[1]}`;
    }
    if (cleanUrl.includes('dropbox.com')) {
      cleanUrl = cleanUrl.split('?')[0];
      const params = value.includes('?') ? value.split('?')[1].replace('dl=0', '').replace('dl=1', '') : '';
      cleanUrl = cleanUrl + '?' + (params ? params + '&' : '') + 'raw=1';
      cleanUrl = cleanUrl.replace('&&', '&').replace('?&', '?');
    }
    setHeroVideos(p => {
      const next = [...p];
      next[index] = cleanUrl;
      return next;
    });
  };

  const addVideoSlot = () => {
    setHeroVideos(p => [...p, '']);
    showToast('New Exhibition Slot Created', 'success');
  };

  const removeVideoSlot = (index) => {
    if (heroVideos.length <= 1) {
      showToast('Minimum 1 slot mandatory.', 'error');
      return;
    }
    setHeroVideos(p => p.filter((_, i) => i !== index));
    setRefreshKey(k => k + 1);
  };

  const moveSlot = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= heroVideos.length) return;
    const next = [...heroVideos];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setHeroVideos(next);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { heroVideos, updatedAt: new Date().toISOString() }, { merge: true });
      showToast('Brand Synchronized Globally', 'success');
    } catch (error) { 
      showToast('Permission Denied (Firebase)', 'error');
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
       <Loader2 className="animate-spin text-[#0D1B38]/20 mb-4" size={40} />
       <p className="text-[10px] uppercase font-black tracking-[0.6em] text-[#0D1B38]/30">Connecting Studio Cloud</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] font-sans selection:bg-[#0D1B38] selection:text-white pb-32">
      
      {/* ===== STUDIO NAV BAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#0D1B38]/5">
         <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 bg-[#0D1B38] rounded-full animate-pulse" />
               <h1 className="text-sm font-black uppercase tracking-[0.5em] opacity-80">Heritage Workshop</h1>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/30">
                  <Globe size={12} /> Live Sync Active
               </div>
               <button onClick={handleSave} disabled={loading}
                 className="bg-[#0D1B38] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl disabled:opacity-30">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Synchronize'}
               </button>
            </div>
         </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20">
         
         {/* ===== INTRODUCTION ===== */}
         <header className="mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tighter mb-6 italic italic-none">Cinema Control</h2>
            <div className="w-20 h-px bg-[#0D1B38]/20 mb-8"></div>
            <p className="max-w-2xl text-[11px] md:text-[12px] uppercase tracking-[0.5em] font-black leading-loose text-[#0D1B38]/40">
               Manage the dynamic exhibition reel of your digital storefront. <br/> 
               Every change is broadcasted across all devices instantly.
            </p>
         </header>

         {/* ===== EXHIBITION SLOTS ===== */}
         <div className="space-y-32">
            
            <section>
               <div className="flex items-center justify-between mb-12 border-b border-[#0D1B38]/5 pb-8">
                  <div className="flex items-center gap-6">
                     <Video size={24} className="opacity-20" />
                     <h3 className="text-xl font-serif">Exhibition Reel</h3>
                  </div>
                  <button type="button" onClick={addVideoSlot}
                    className="flex items-center gap-4 py-4 px-8 border border-[#0D1B38]/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0D1B38] hover:text-white transition-all shadow-sm">
                     <Plus size={16} /> New Exhibition Slot
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-x-12 md:gap-y-24">
                 {heroVideos.map((url, i) => (
                   <div key={`${i}-${refreshKey}`} className="animate-fade-in group" style={{ animationDelay: `${i * 0.1}s` }}>
                     
                     {/* SLOT TOOLBAR */}
                     <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-2.5 border border-[#0D1B38]/5 shadow-sm group-hover:border-[#0D1B38]/20 transition-all">
                        <div className="flex items-center gap-1">
                           <button type="button" onClick={() => moveSlot(i, -1)} disabled={i === 0}
                             className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-0">
                             <ArrowLeft size={16} />
                           </button>
                           <button type="button" onClick={() => moveSlot(i, 1)} disabled={i === heroVideos.length - 1}
                             className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-0">
                             <ArrowRight size={16} />
                           </button>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.4em] text-[#0D1B38]/20">SLOT {String(i+1).padStart(2, '0')}</span>
                        <button type="button" onClick={() => removeVideoSlot(i)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                     </div>

                     {/* CINEMA CARD */}
                     <div className="aspect-[3/4] bg-[#000] rounded-[2.5rem] overflow-hidden relative shadow-[0_45px_100px_-20px_rgba(13,27,56,0.25)] border border-[#0D1B38]/5 transition-transform duration-1000 group-hover:-translate-y-3 group-hover:shadow-[0_60px_130px_-20px_rgba(13,27,56,0.4)]">
                        <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100 duration-1000" />
                        
                        {/* Status Beacon */}
                        <div className="absolute top-8 right-8 mix-blend-difference">
                           {!url ? <ShieldCheck size={16} className="text-white/20" /> : <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />}
                        </div>
                     </div>

                     {/* INPUT FIELD - MINIMALIST */}
                     <div className="mt-8 px-4">
                        <div className="relative group/input">
                           <input 
                             type="text" 
                             value={url} 
                             onChange={(e) => handleVideoLinkChange(i, e.target.value)}
                             placeholder="Exhibition Direct Link (Dropbox / Gdrive)"
                             className="w-full bg-transparent border-b-2 border-[#0D1B38]/10 py-5 text-[11px] font-black tracking-[0.1em] outline-none focus:border-[#0D1B38] transition-all placeholder:text-[#0D1B38]/10 text-[#0D1B38]"
                           />
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                              <LinkIcon size={14} className="text-[#0D1B38]/10 group-focus-within/input:text-[#0D1B38] transition-colors" />
                           </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </section>
         </div>

         {/* ===== FOOTER METADATA ===== */}
         <footer className="mt-40 pt-20 border-t border-[#0D1B38]/5 flex flex-col md:flex-row md:items-center justify-between gap-8 text-[#0D1B38]/20">
            <div className="flex items-center gap-12">
               <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.4em] font-black">Architecture</span>
                  <span className="text-[10px] font-serif italic">Tr Traders Cloud Native</span>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.4em] font-black">Last Sync</span>
                  <span className="text-[10px] font-serif italic">Recently Published</span>
               </div>
            </div>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-right">Rohtak Heritage © 2026</p>
         </footer>

      </main>

      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(13, 27, 56, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(13, 27, 56, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
