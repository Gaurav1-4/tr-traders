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
      setTimeout(() => {
        const localPreviewUrl = URL.createObjectURL(file);
        handleVideoChange(index, localPreviewUrl);
        setUploadingIndex(null);
      }, 1000);
      return;
    }

    try {
      // Direct upload
      const storageRef = ref(storage, `hero-videos/v-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [index]: Math.round(progress) }));
        },
        (error) => {
          console.error("Upload Error Details:", error);
          if (error.code === 'storage/unauthorized') {
            showToast('Permission Denied! Please check Step 1: Set Storage Rules to "if true"', 'error');
          } else {
            showToast(`Upload failed: ${error.message || 'Unknown error'}`, 'error');
          }
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
      showToast('Storage not initialized. Check your Firebase console.', 'error');
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
      showToast('Live site updated successfully!', 'success');
    } catch (error) {
      showToast('Sync failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return <div className="h-[60vh] flex items-center justify-center text-muted animate-pulse font-serif italic uppercase tracking-[0.2em] text-xs">Authenticating Brand Sync...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-32 px-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-3xl border border-border shadow-soft gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0D1B38] rounded-2xl flex items-center justify-center text-white shadow-xl">
            <SettingsIcon size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-text">Store Experience</h1>
            <p className="text-[9px] text-muted uppercase tracking-[0.4em] font-black">Powered by TR TRADERS Cloud</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center">
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Online & Ready</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-12">

        {/* ===== VIDEO GRID MANAGER ===== */}
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-border overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <Video size={24} className="text-primary" />
            <h2 className="text-xl font-serif text-text">Hero Video Grid</h2>
          </div>
          <p className="text-sm text-muted mb-8 border-b border-border pb-4 font-light">
            Keep videos under <span className="font-bold text-text">10MB</span> for the fastest customer experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {heroVideos.slice(0, 3).map((url, index) => (
              <div key={index} className="space-y-6">
                <div className="aspect-[9/16] md:aspect-[3/4] bg-[#000] rounded-3xl overflow-hidden relative shadow-2xl group border border-white/5">
                  {uploadingIndex === index ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 bg-[#0D1B38]/90 backdrop-blur-md px-10">
                      <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-white transition-all duration-300"
                          style={{ width: `${uploadProgress[index] || 2}%` }}
                        />
                      </div>
                      <span className="text-[18px] font-black tracking-widest">{uploadProgress[index] || 0}%</span>
                      <span className="text-[8px] uppercase font-bold tracking-[0.3em] opacity-50 animate-pulse">Synchronizing</span>
                    </div>
                  ) : url ? (
                    <video src={url} muted loop playsInline autoPlay className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-[3s]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0D1B38]/5"><Video size={48} className="text-[#0D1B38]/10" /></div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <label className="block w-full">
                    <input type="file" accept="video/*" className="hidden" 
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploadingIndex !== null}
                    />
                    <div className="flex items-center justify-center gap-2 py-4 bg-[#0D1B38] text-white hover:bg-black transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl cursor-pointer hover:-translate-y-1 active:translate-y-0">
                      <Upload size={14} /> Replace Video
                    </div>
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-border rounded-2xl group focus-within:border-[#0D1B38] transition-all">
                    <LinkIcon size={14} className="text-muted group-focus-within:text-[#0D1B38]" />
                    <input type="url" value={url} onChange={(e) => handleVideoChange(index, e.target.value)} 
                      placeholder="Paste .mp4 link" className="w-full text-[10px] outline-none bg-transparent font-bold tracking-widest" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== COLLECTION MANAGER ===== */}
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Tags size={24} className="text-primary" />
            <h2 className="text-xl font-serif text-text">Collection Navigation</h2>
          </div>
          <p className="text-sm text-muted mb-8 border-b border-border pb-4 font-light">
            Renaming a collection here will update the shop menu for all customers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
            {categories.map((cat, index) => (
              <div key={index} className="flex gap-2 group animate-fade-up" style={{animationDelay: `${index * 0.05}s`}}>
                <div className="flex-1 bg-white border border-border rounded-2xl flex items-center px-5 group-focus-within:border-[#0D1B38] shadow-sm transition-all hover:shadow-md">
                   <input
                     type="text"
                     value={cat}
                     onChange={(e) => handleCategoryChange(index, e.target.value)}
                     className="w-full py-4 bg-transparent outline-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#0D1B38]"
                   />
                </div>
                {categories.length > 1 && (
                  <button type="button" onClick={() => removeCategory(index)}
                    className="p-3 text-red-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all border border-border hover:border-red-500 shadow-sm">
                     <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {categories.length < 12 && (
              <button type="button" onClick={addCategory}
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-muted hover:border-[#0D1B38] hover:text-[#0D1B38] transition-all hover:bg-gray-50 group py-4">
                <Plus size={20} className="transition-transform group-hover:rotate-90" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add New Collection</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Save Button */}
        <div className="sticky bottom-8 left-0 right-0 z-40">
          <div className="bg-[#0D1B38] p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="hidden md:block">
              <p className="text-white text-lg font-serif italic">Push all updates live?</p>
              <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] mt-2">Will reflect on all devices globally</p>
            </div>
            <button type="submit" disabled={loading || uploadingIndex !== null}
              className="group flex items-center justify-center gap-5 px-14 py-6 bg-white text-[#0D1B38] rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#FAF7F4] transition-all shadow-2xl hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 w-full md:w-auto">
              {loading ? <Loader2 size={24} className="animate-spin text-[#0D1B38]" /> : (
                <>
                  Publish Live Site
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
      
      <style>{`
        .shadow-soft {
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
