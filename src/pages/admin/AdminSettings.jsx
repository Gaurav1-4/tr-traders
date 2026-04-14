import { useState, useEffect } from 'react';
import { Save, Settings, Video, Trash2, Plus, Link as LinkIcon, RefreshCcw, ArrowLeft, ArrowRight, Loader2, Globe, Sparkles, Database, Package, XCircle, Tag } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { uploadFile } from '../../services/uploadService';
import { db, isMockMode } from '../../services/firebase';
import { doc, getDoc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { HERITAGE_COLLECTION } from '../../services/productService';

const DEFAULT_VIDEOS = [
  'https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const DEFAULT_CATEGORIES = ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Organza', 'Banarasi', 'Linen', 'Wool', 'Rayon', 'Velvet'];

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
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);
  const [newCategory, setNewCategory] = useState('');
  
  const [fabrics, setFabrics] = useState(['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Organza', 'Linen']);
  const [newFabric, setNewFabric] = useState('');
  
  const [colors, setColors] = useState([
    { name: 'Red', value: '#8b2252' },
    { name: 'Blue', value: '#1e40af' },
    { name: 'Green', value: '#166534' }
  ]);
  const [newColor, setNewColor] = useState({ name: '', value: '#000000' });

  useEffect(() => {
    const fetchSettings = async () => {
      setFetching(true);
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.heroVideos) setHeroVideos(data.heroVideos.slice(0, 3));
            if (data.categories && data.categories.length > 0) setCategories(data.categories);
            if (data.fabrics && data.fabrics.length > 0) setFabrics(data.fabrics);
            if (data.colors && data.colors.length > 0) setColors(data.colors);
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
    if (heroVideos.length >= 3) { showToast('Maximum 3 video slots allowed.', 'error'); return; }
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
        categories: categories.filter(c => c.trim()),
        fabrics: fabrics.filter(f => f.trim()),
        colors: colors.filter(c => c.name.trim()),
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

  const [uploadingSlots, setUploadingSlots] = useState({});

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingSlots(prev => ({ ...prev, [index]: true }));
    try {
      const downloadURL = await uploadFile(file, 'hero_videos');
      handleVideoLinkChange(index, downloadURL);
      showToast('Media uploaded to studio storage.', 'success');
    } catch (err) {
      showToast('Upload failed.', 'error');
    } finally {
      setUploadingSlots(prev => ({ ...prev, [index]: false }));
    }
  };

  if (fetching) return <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]"><Loader2 size={32} className="text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] pb-48 font-sans selection:bg-[#0D1B38] selection:text-white">

      <main className="max-w-7xl mx-auto px-10 pt-10 md:pt-16 uppercase-none">
         <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
               <h2 className="text-3xl font-bold text-[#0D1B38] mb-2">Store Settings</h2>
               <p className="text-sm font-medium text-[#0D1B38]/40">Manage your visual content and store information.</p>
            </div>
            
            <div className="flex justify-end">
               <button onClick={handleSave} disabled={loading} className="bg-[#0D1B38] text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-md disabled:opacity-30">
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'Save Changes'}
               </button>
            </div>
         </header>

         {/* STUDIO INFORMATION */}
         <section className="mb-40">
          <div className="flex items-center gap-3 mb-8 border-b border-[#0D1B38]/5 pb-4">
             <span className="text-xs font-bold text-[#0D1B38]/50 uppercase tracking-widest">Store Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-bold text-[#0D1B38]/30 uppercase tracking-widest mb-2 block">Store Name</label>
                   <input 
                      type="text" name="storeName" value={storeSettings.storeName} onChange={handleStoreSettingChange}
                      className="w-full bg-white border border-[#0D1B38]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D1B38] transition-all"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-[#0D1B38]/30 uppercase tracking-widest mb-2 block">WhatsApp (e.g. 919208275274)</label>
                   <input 
                      type="text" name="whatsappNumber" value={storeSettings.whatsappNumber} onChange={handleStoreSettingChange}
                      className="w-full bg-white border border-[#0D1B38]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D1B38] transition-all"
                   />
                </div>
             </div>
             <div>
                <label className="text-[10px] font-bold text-[#0D1B38]/30 uppercase tracking-widest mb-2 block">Store Address</label>
                <textarea 
                   name="address" rows="5" value={storeSettings.address} onChange={handleStoreSettingChange}
                   className="w-full bg-white border border-[#0D1B38]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D1B38] transition-all resize-none"
                />
             </div>
          </div>
       </section>

       {/* VIDEO SLOTS */}
       <section className="mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-[#0D1B38]/5 pb-4">
             <span className="text-xs font-bold text-[#0D1B38]/50 uppercase tracking-widest">Home Page Videos</span>
             <button onClick={addVideoSlot} className="text-[10px] font-bold uppercase tracking-widest bg-white border border-[#0D1B38]/10 py-2 px-6 rounded-lg hover:bg-[#FAF9F6] transition-all">
                Add Video
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

                    <div 
                        className="aspect-video bg-black rounded-[2.5rem] overflow-hidden relative shadow-[0_50px_130px_-30px_rgba(0,0,0,0.5)] transition-all duration-1000 group-hover:-translate-y-4 border border-white/5 cursor-pointer"
                        onClick={() => !uploadingSlots[i] && document.getElementById(`hero-upload-${i}`).click()}
                      >
                        {uploadingSlots[i] ? (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 p-12">
                              <Loader2 className="animate-spin text-white/20 mb-4" size={32} />
                              <span className="text-[10px] uppercase font-black tracking-widest text-white/10">Uploading to Studio Cloud...</span>
                           </div>
                        ) : (
                           <>
                              <video src={url} key={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-100 transition-opacity" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Plus size={32} className="text-white/50" />
                              </div>
                           </>
                        )}
                        <input id={`hero-upload-${i}`} type="file" className="hidden" accept="video/*,image/*" onChange={(e) => handleFileUpload(i, e.target.files[0])} />
                     </div>
                    
                    <div className="px-4">
                       <div className="relative group/input">
                          <input 
                            type="text" value={url} onChange={(e) => handleVideoLinkChange(i, e.target.value)}
                            placeholder="Exhibition Link (Dropbox)" 
                            className="w-full bg-transparent border-b border-[#0D1B38]/10 py-5 text-[10px] font-black tracking-[0.1em] outline-none focus:border-[#0D1B38] transition-all text-[#0D1B38]/60 uppercase placeholder:text-[#0D1B38]/10 font-mono"
                          />
                          <LinkIcon size={12} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 group-focus-within/input:opacity-100 transition-opacity" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </section>

         {/* CATEGORY MANAGEMENT */}
         <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 border-b border-[#0D1B38]/5 pb-4">
               <span className="text-xs font-bold text-[#0D1B38]/50 uppercase tracking-widest">Product Categories</span>
            </div>

            <div className="flex gap-4 mb-10">
               <input 
                  type="text" 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategory.trim()) {
                      e.preventDefault();
                      if (!categories.includes(newCategory.trim())) {
                        setCategories(prev => [...prev, newCategory.trim()]);
                      }
                      setNewCategory('');
                    }
                  }}
                  placeholder="New category name..."
                  className="flex-1 bg-white border border-[#0D1B38]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D1B38] transition-all"
               />
               <button 
                  type="button"
                  onClick={() => {
                    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                      setCategories(prev => [...prev, newCategory.trim()]);
                      setNewCategory('');
                    }
                  }}
                  className="px-6 py-2 bg-[#0D1B38] text-white rounded-lg text-xs font-semibold hover:bg-black transition-all"
               >
                  Add
               </button>
            </div>

            <div className="flex flex-wrap gap-2">
               {categories.map((cat, i) => (
                  <div key={cat} className="flex items-center gap-2 bg-[#FAF9F6] px-4 py-2 rounded-lg border border-[#0D1B38]/5 group">
                     <span className="text-xs font-medium text-[#0D1B38]/80">{cat}</span>
                     <button 
                        type="button" 
                        onClick={() => setCategories(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-[#0D1B38]/20 hover:text-red-500 transition-colors"
                     >
                        <XCircle size={14} />
                     </button>
                  </div>
               ))}
            </div>
            {categories.length === 0 && (
               <p className="text-xs text-[#0D1B38]/30 mt-4">No categories added yet.</p>
            )}
         </section>

         {/* FABRIC MANAGEMENT */}
         <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 border-b border-[#0D1B38]/5 pb-4">
               <span className="text-xs font-bold text-[#0D1B38]/50 uppercase tracking-widest">Global Fabrics</span>
            </div>

            <div className="flex gap-4 mb-10">
               <input 
                  type="text" 
                  value={newFabric} 
                  onChange={(e) => setNewFabric(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFabric.trim()) {
                      e.preventDefault();
                      if (!fabrics.includes(newFabric.trim())) {
                        setFabrics(prev => [...prev, newFabric.trim()]);
                      }
                      setNewFabric('');
                    }
                  }}
                  placeholder="New fabric name..."
                  className="flex-1 bg-white border border-[#0D1B38]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D1B38] transition-all"
               />
               <button 
                  type="button"
                  onClick={() => {
                    if (newFabric.trim() && !fabrics.includes(newFabric.trim())) {
                      setFabrics(prev => [...prev, newFabric.trim()]);
                      setNewFabric('');
                    }
                  }}
                  className="px-6 py-2 bg-[#0D1B38] text-white rounded-lg text-xs font-semibold hover:bg-black transition-all"
               >
                  Add
               </button>
            </div>

            <div className="flex flex-wrap gap-2">
               {fabrics.map((fab, i) => (
                  <div key={fab} className="flex items-center gap-2 bg-[#FAF9F6] px-4 py-2 rounded-lg border border-[#0D1B38]/5 group">
                     <span className="text-xs font-medium text-[#0D1B38]/80">{fab}</span>
                     <button 
                        type="button" 
                        onClick={() => setFabrics(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-[#0D1B38]/20 hover:text-red-500 transition-colors"
                     >
                        <XCircle size={14} />
                     </button>
                  </div>
               ))}
            </div>
         </section>

         {/* COLOR MANAGEMENT */}
         <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 border-b border-[#0D1B38]/5 pb-4">
               <span className="text-xs font-bold text-[#0D1B38]/50 uppercase tracking-widest">Global Colors</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
               <input 
                  type="text" 
                  value={newColor.name} 
                  onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Color name (e.g. Indigo Blue)..."
                  className="flex-1 bg-white border border-[#0D1B38]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D1B38] transition-all"
               />
               <input 
                  type="color" 
                  value={newColor.value} 
                  onChange={(e) => setNewColor(prev => ({ ...prev, value: e.target.value }))}
                  className="w-20 h-10 p-1 bg-white border border-[#0D1B38]/10 rounded-xl cursor-pointer"
               />
               <button 
                  type="button"
                  onClick={() => {
                    if (newColor.name.trim()) {
                      setColors(prev => [...prev, { ...newColor }]);
                      setNewColor({ name: '', value: '#000000' });
                    }
                  }}
                  className="px-8 py-2 bg-[#0D1B38] text-white rounded-lg text-xs font-semibold hover:bg-black transition-all"
               >
                  Add Color
               </button>
            </div>

            <div className="flex flex-wrap gap-6">
               {colors.map((col, i) => (
                  <div key={`${col.name}-${i}`} className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-[#0D1B38]/5 shadow-sm group">
                     <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: col.value }} />
                     <span className="text-xs font-bold text-[#0D1B38]/60 uppercase tracking-widest">{col.name}</span>
                     <button 
                        type="button" 
                        onClick={() => setColors(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-[#0D1B38]/10 hover:text-red-500 transition-colors"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
};

export default AdminSettings;
