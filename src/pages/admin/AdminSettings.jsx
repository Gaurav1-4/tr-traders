import { useState, useEffect } from 'react';
import { Save, Settings, Video, Trash2, Plus, Link as LinkIcon, RefreshCcw, ArrowLeft, ArrowRight, Loader2, Globe, Sparkles, Database, Package, XCircle } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, isMockMode } from '../../services/firebase';
import { doc, getDoc, setDoc, collection, writeBatch } from 'firebase/firestore';
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
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'TR TRADERS',
    whatsappNumber: '919208275274',
    address: 'Shori Cloth Market\nRohtak, Haryana (124001)'
  });
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
            setStoreSettings({
              storeName: data.storeName || 'TR TRADERS',
              whatsappNumber: data.whatsappNumber || '919208275274',
              address: data.address || 'Shori Cloth Market\nRohtak, Haryana (124001)'
            });
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

  const handleStoreSettingChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings(prev => ({ ...prev, [name]: value }));
  };


  const addVideoSlot = () => {
    if (heroVideos.length >= 5) { showToast('Maximum 5 video slots allowed.', 'error'); return; }
    setHeroVideos(p => [...p, '']);
  };

  const removeVideoSlot = (index) => {
    if (heroVideos.length <= 1) { showToast('Minimum 1 slot mandatory.', 'error'); return; }
    setHeroVideos(p => p.filter((_, i) => i !== index));
    setRefreshKey(k => k + 1);
  };

  const moveSlot = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= heroVideos.length) return;
    const next = [...heroVideos];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setHeroVideos(next);
    setRefreshKey(k => k + 1);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate links first
      const cleaned = heroVideos.map(v => v.trim()).filter(v => v);
      if (cleaned.length === 0) {
        showToast('Please add at least one valid video link.', 'error');
        setLoading(false);
        return;
      }

      const docRef = doc(db, 'settings', 'global');
      const payload = { 
        heroVideos: cleaned, 
        ...storeSettings,
        updatedAt: new Date().toISOString() 
      };
      
      await setDoc(docRef, payload, { merge: true });
      
      // Update local storage too for immediate UI feedback (consistent with other components)
      localStorage.setItem('tr_traders_settings', JSON.stringify(storeSettings));
      window.dispatchEvent(new Event('settingsUpdated'));

      showToast('Exhibition & Studio Defaults Updated!', 'success');
    } catch (error) { 
      console.error("Firebase Save Error:", error);
      showToast(`Save failed: ${error.message}`, 'error'); 
    } 
    finally { setLoading(false); }
  };

  if (fetching) return <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]"><Loader2 size={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] pb-48 font-sans selection:bg-[#0D1B38] selection:text-white">

      <main className="max-w-7xl mx-auto px-10">
         <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
               <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tighter mb-6">Studio Defaults</h2>
               <div className="w-16 h-px bg-[#0D1B38]/20 mb-6"></div>
               <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-black text-[#0D1B38]/30">
                  Manage your visual presence and showcase video gallery.
               </p>
            </div>
            
            <div className="flex justify-end">
               <button onClick={handleSave} disabled={loading} className="bg-[#0D1B38] text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl disabled:opacity-30">
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'Save Exhibition'}
               </button>
            </div>
         </header>

         {/* STUDIO INFORMATION */}
         <section className="mb-40">
            <div className="flex items-center gap-6 mb-16 border-b border-[#0D1B38]/5 pb-8">
               <Sparkles size={20} className="opacity-10" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/40">Studio Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
               <div className="space-y-12">
                  <div className="group">
                     <label className="text-[9px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/20 mb-4 block">Store Name</label>
                     <input 
                        type="text" name="storeName" value={storeSettings.storeName} onChange={handleStoreSettingChange}
                        className="w-full bg-transparent border-b border-[#0D1B38]/10 py-4 text-xl font-serif italic outline-none focus:border-[#0D1B38] transition-all"
                     />
                  </div>
                  <div className="group">
                     <label className="text-[9px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/20 mb-4 block">WhatsApp Number (e.g. 919208275274)</label>
                     <input 
                        type="text" name="whatsappNumber" value={storeSettings.whatsappNumber} onChange={handleStoreSettingChange}
                        className="w-full bg-transparent border-b border-[#0D1B38]/10 py-4 text-xl font-serif italic outline-none focus:border-[#0D1B38] transition-all"
                     />
                  </div>
               </div>
               <div className="group">
                  <label className="text-[9px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/20 mb-4 block">Studio Address</label>
                  <textarea 
                     name="address" rows="5" value={storeSettings.address} onChange={handleStoreSettingChange}
                     className="w-full bg-transparent border-b border-[#0D1B38]/10 py-4 text-xl font-serif italic outline-none focus:border-[#0D1B38] transition-all resize-none"
                  />
               </div>
            </div>
         </section>

         {/* VIDEO SLOTS */}
         <section className="mb-40">
            <div className="flex items-center justify-between mb-16 border-b border-[#0D1B38]/5 pb-8">
               <div className="flex items-center gap-6">
                  <Video size={20} className="opacity-10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/40">Video Feed</span>
               </div>
               <button onClick={addVideoSlot} className="text-[9px] font-black uppercase tracking-widest border border-[#0D1B38]/10 py-3 px-8 rounded-full hover:bg-[#0D1B38] hover:text-white transition-all shadow-sm">
                  Add Video Slot
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-y-24">
               {heroVideos.map((url, i) => (
                 <div key={`${i}-${refreshKey}`} className="flex flex-col gap-8 animate-fade-in group" style={{animationDelay: `${i*0.05}s`}}>
                    
                    {/* RESTORED TOOLBAR */}
                    <div className="flex items-center justify-between px-6 py-2 bg-white rounded-full border border-[#0D1B38]/5 shadow-sm">
                       <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveSlot(i, -1)} disabled={i === 0} className="w-8 h-8 flex items-center justify-center text-[#0D1B38]/30 hover:text-black transition-colors disabled:opacity-0"><ArrowLeft size={14}/></button>
                          <button type="button" onClick={() => moveSlot(i, 1)} disabled={i === heroVideos.length - 1} className="w-8 h-8 flex items-center justify-center text-[#0D1B38]/30 hover:text-black transition-colors disabled:opacity-0"><ArrowRight size={14}/></button>
                       </div>
                       <span className="text-[8px] font-black tracking-[0.4em] opacity-20 uppercase">Piece {i+1}</span>
                       <button type="button" onClick={() => removeVideoSlot(i)} className="w-8 h-8 flex items-center justify-center text-red-100 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>

                    <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden relative shadow-[0_50px_130px_-30px_rgba(0,0,0,0.5)] transition-all duration-1000 group-hover:-translate-y-4 border border-white/5">
                       <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" />
                    </div>
                    
                    <div className="px-4">
                       <div className="relative group/input">
                          <input 
                            type="text" value={url} onChange={(e) => handleVideoLinkChange(i, e.target.value)}
                            placeholder="Exhibition Link (Dropbox)" 
                            className="w-full bg-transparent border-b border-[#0D1B38]/10 py-5 text-[10px] font-black tracking-[0.1em] outline-none focus:border-[#0D1B38] transition-all text-[#0D1B38]/60 uppercase placeholder:text-[#0D1B38]/10"
                          />
                          <LinkIcon size={12} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 group-focus-within/input:opacity-100 transition-opacity" />
                       </div>
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
