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
  const [uploadingIndex, setUploadingIndex] = useState(null);
  
  const [settings, setSettings] = useState({
    storeName: 'TR Traders',
    whatsappNumber: '919208275274',
    email: 'contact@trtraders.com',
    address: '123 Heritage Lane, Chandni Chowk, Delhi 110006',
    currency: 'INR',
  });

  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);

  // Load from Firestore
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

    if (file.size > 50 * 1024 * 1024) {
      showToast('Video too large (Max 50MB)', 'error');
      return;
    }

    setUploadingIndex(index);

    if (isMockMode) {
      setTimeout(() => {
        const localPreviewUrl = URL.createObjectURL(file);
        handleVideoChange(index, localPreviewUrl);
        setUploadingIndex(null);
      }, 1500);
      return;
    }

    try {
      const storageRef = ref(storage, `hero-videos/v-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          showToast('Upload failed.', 'error');
          setUploadingIndex(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleVideoChange(index, downloadURL);
          showToast('Uploaded to Cloud!', 'success');
          setUploadingIndex(null);
        }
      );
    } catch (err) {
      showToast('Error uploading.', 'error');
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
      
      // Save local fallback
      localStorage.setItem('tr_traders_settings', JSON.stringify(settings));
      localStorage.setItem('tr_traders_hero_videos', JSON.stringify(heroVideos));
      localStorage.setItem('tr_traders_categories', JSON.stringify(categories));
      
      window.dispatchEvent(new Event('settingsUpdated'));
      showToast('Global settings updated and synced across all devices!', 'success');
    } catch (error) {
      showToast('Failed to sync. Please check your internet.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return <div className="h-[60vh] flex items-center justify-center text-muted"><Loader2 className="animate-spin mr-2" /> Connecting to cloud...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon size={28} className="text-primary" />
          <h1 className="text-2xl font-serif font-medium text-text">Store Settings</h1>
        </div>
        <div className="bg-primary-light text-primary text-[link] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
          Cloud Synced
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* ===== COLLECTION CATEGORIES SECTION ===== */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg text-text font-serif font-medium mb-2 flex items-center gap-2">
            <Tags size={20} className="text-primary" />
            Collection Categories
          </h2>
          <p className="text-sm text-muted mb-6 border-b border-border pb-4">
            Manage the list of collections visible to your customers (e.g., Casual, Formal, Bridal). These will appear in your home navigation and product filters globally.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {categories.map((cat, index) => (
              <div key={index} className="flex gap-2 group">
                <div className="flex-1 bg-gray-50 border border-border rounded-lg flex items-center px-3 group-focus-within:border-primary transition-colors">
                   <input
                     type="text"
                     value={cat}
                     onChange={(e) => handleCategoryChange(index, e.target.value)}
                     className="w-full py-2.5 bg-transparent outline-none text-sm font-medium"
                   />
                </div>
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                     <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {categories.length < 12 && (
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest p-2 hover:bg-primary-light rounded-lg transition-all"
            >
              <Plus size={16} /> Add Another Collection
            </button>
          )}
        </div>

        {/* ===== HERO VIDEOS SECTION ===== */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg text-text font-serif font-medium mb-2 flex items-center gap-2">
            <Video size={20} className="text-primary" />
            Hero Video Manager
          </h2>
          <p className="text-sm text-muted mb-5 border-b border-border pb-4">
            Update the 3 main videos on your homepage. New videos reflect on all customers' devices instantly upon saving.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroVideos.map((url, index) => (
              <div key={index} className="space-y-4">
                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative shadow-lg">
                  {uploadingIndex === index ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 bg-black/40">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-[10px] tracking-widest font-bold">UPLOADING...</span>
                    </div>
                  ) : url ? (
                    <video
                      src={url}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30"><Video size={40} className="text-white" /></div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploadingIndex !== null}
                    />
                    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-primary-light text-primary hover:bg-primary hover:text-white transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                      <Upload size={14} /> Upload Video
                    </div>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-border rounded-lg">
                    <LinkIcon size={12} className="text-gray-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                      placeholder="Paste .mp4 link"
                      className="w-full text-[10px] outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg text-text font-serif font-medium mb-5 border-b border-border pb-3 flex items-center gap-2">
            <Store size={20} className="text-primary" /> Store Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Whatsapp Contact</label>
              <input type="text" value={settings.whatsappNumber} onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted">Business Email</label>
              <input type="email" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm" />
            </div>
          </div>
        </div>

        {/* Final Sync */}
        <div className="flex justify-end pt-8">
          <button type="submit" disabled={loading || uploadingIndex !== null}
            className="flex items-center gap-3 px-10 py-5 bg-[#0D1B38] text-white rounded-xl font-bold uppercase tracking-[0.25em] text-[11px] hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Push Update to Devices
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
