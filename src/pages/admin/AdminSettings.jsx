import { useState, useEffect, useRef } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye, Upload, Loader2, Tags, Layers } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, storage, isMockMode } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

const DEFAULT_CATEGORIES = ['Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  
  const [settings, setSettings] = useState({
    storeName: 'TR Traders',
    whatsappNumber: '919208275274',
    email: 'contact@trtraders.com',
    address: 'Shori Cloth Market, Rohtak, Haryana (124001)',
    currency: 'INR',
  });

  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);

  useEffect(() => {
    const fetchSettings = async () => {
      setFetching(true);
      try {
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.store) setSettings(data.store);
            if (data.heroVideos) setHeroVideos(data.heroVideos);
            if (data.categories) setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error("Firebase settings fetch error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      showToast('Video too large (Max 100MB)', 'error');
      return;
    }

    setUploadingIndex(index);
    setUploadProgress(prev => ({ ...prev, [index]: 0 }));

    if (isMockMode) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
        if (progress >= 100) {
          clearInterval(interval);
          const localPreviewUrl = URL.createObjectURL(file);
          handleVideoChange(index, localPreviewUrl);
          setUploadingIndex(null);
          showToast('Mock Upload Complete!', 'success');
        }
      }, 300);
      return;
    }

    try {
      const storageRef = ref(storage, `hero-videos/v-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [index]: Math.round(progress) }));
        },
        (error) => {
          console.error(error);
          showToast('Upload failed. Check your internet connection.', 'error');
          setUploadingIndex(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleVideoChange(index, downloadURL);
          showToast('Sync Successful!', 'success');
          setUploadingIndex(null);
        }
      );
    } catch (err) {
      showToast('Error initializing upload.', 'error');
      setUploadingIndex(null);
    }
  };

  const handleVideoChange = (index, value) => {
    setHeroVideos(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleCategoryChange = (index, value) => {
    setCategories(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addCategory = () => {
    if (categories.length < 12) setCategories(prev => [...prev, 'New Category']);
  };

  const removeCategory = (index) => {
    if (categories.length > 1) setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isMockMode) {
        const docRef = doc(db, 'settings', 'global');
        await setDoc(docRef, {
          store: settings,
          heroVideos: heroVideos.filter(v => v.trim() !== ''),
          categories: categories.filter(c => c.trim() !== ''),
          updatedAt: new Date().toISOString()
        });
      }
      localStorage.setItem('tr_traders_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('settingsUpdated'));
      showToast('Live site updated successfully!', 'success');
    } catch (error) {
      showToast('Sync failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return <div className="h-[60vh] flex items-center justify-center text-muted animate-pulse font-serif">Connecting to TR TRADERS Cloud...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-32">
      <div className="mb-10 flex items-center justify-between bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-medium text-text">Store Experience</h1>
            <p className="text-xs text-muted uppercase tracking-widest font-bold">Manage your global brand presence</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] uppercase font-bold tracking-[0.15em] border border-green-100 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Cloud Syncing
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">

        {/* ===== VIDEO MANAGER WITH PROGRESS BAR ===== */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Video size={24} className="text-primary" />
            <h2 className="text-xl font-serif text-text">Hero Video Grid</h2>
          </div>
          <p className="text-sm text-muted mb-8 border-b border-border pb-4">
            Changes reflect instantly on all customer phones and laptops. Max file size: 100MB. Recommended size: under 10MB.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {heroVideos.slice(0, 3).map((url, index) => (
              <div key={index} className="space-y-5">
                <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-black/5 group">
                  {uploadingIndex === index ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 bg-black/60 backdrop-blur-sm px-6">
                      <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress[index] || 0}%` }}
                        />
                      </div>
                      <span className="text-[14px] font-black tracking-widest">{uploadProgress[index] || 0}%</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Synchronizing...</span>
                    </div>
                  ) : url ? (
                    <>
                      <video src={url} muted loop playsInline autoPlay className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-[2s]" />
                      <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white text-[8px] uppercase tracking-widest px-2 py-1 rounded-md border border-white/10">Active</div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Video size={48} className="text-white" /></div>
                  )}
                </div>
                
                <div className="space-y-3 px-1">
                  <label className="block w-full">
                    <input type="file" accept="video/*" className="hidden" 
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploadingIndex !== null}
                    />
                    <div className="flex items-center justify-center gap-2 py-3 bg-[#0D1B38] text-white hover:bg-black transition-all rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg cursor-pointer">
                      <Upload size={14} /> Upload Video
                    </div>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
                       <LinkIcon size={12} />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                      placeholder="Paste .mp4 link"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-[10px] outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== COLLECTION EDITOR ===== */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Tags size={24} className="text-primary" />
            <h2 className="text-xl font-serif text-text">Global Collections</h2>
          </div>
          <p className="text-sm text-muted mb-8 border-b border-border pb-4">
            Manage your product categories. Renaming here will update all menus globally.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {categories.map((cat, index) => (
              <div key={index} className="flex gap-2 group animate-fade-in">
                <div className="flex-1 bg-gray-50 border border-border rounded-xl flex items-center px-4 group-focus-within:border-primary transition-all shadow-sm">
                   <input
                     type="text"
                     value={cat}
                     onChange={(e) => handleCategoryChange(index, e.target.value)}
                     className="w-full py-3 bg-transparent outline-none text-xs font-bold uppercase tracking-widest text-text"
                   />
                </div>
                {categories.length > 1 && (
                  <button type="button" onClick={() => removeCategory(index)}
                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                     <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {categories.length < 12 && (
              <button type="button" onClick={addCategory}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-all hover:bg-primary-light">
                <Plus size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Collection</span>
              </button>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-[#0D1B38] p-8 rounded-3xl shadow-2xl">
          <div className="hidden sm:block">
            <p className="text-white text-base font-serif italic">"Tradition meets technology."</p>
            <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Changes are synced to all customer devices</p>
          </div>
          <button type="submit" disabled={loading || uploadingIndex !== null}
            className="flex items-center gap-4 px-12 py-5 bg-white text-[#0D1B38] rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-[#FAF7F4] transition-all shadow-2xl hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 w-full sm:w-auto justify-center">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Push Updates Live
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
