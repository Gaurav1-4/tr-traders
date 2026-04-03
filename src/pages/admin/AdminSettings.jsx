import { useState, useEffect, useRef } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye, Upload, Loader2, Tags, Layers, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, storage, isMockMode } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-indian-woman-posing-with-a-sari-41011-large.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  
  const [settings, setSettings] = useState({
    storeName: 'TR Traders',
    whatsappNumber: '919208275274',
    email: 'gauravgoyal2112007@gmail.com',
    address: 'Shori Cloth Market, Rohtak, Haryana (124001)',
  });

  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);
  const [categories, setCategories] = useState(['Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton']);

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
        console.error("Firebase settings error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleVideoLinkChange = (index, value) => {
    let cleanUrl = value.trim();
    
    // Gdrive conversion
    if (cleanUrl.includes('drive.google.com')) {
      const gmatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (gmatch) {
        cleanUrl = `https://drive.google.com/uc?export=download&id=${gmatch[1]}`;
        showToast('Converted for direct streaming!', 'success');
      }
    }
    // Advanced Dropbox conversion (?raw=1)
    if (cleanUrl.includes('dropbox.com')) {
      cleanUrl = cleanUrl.split('?')[0]; // Remove existing params
      const params = value.includes('?') ? value.split('?')[1].replace('dl=0', '').replace('dl=1', '') : '';
      cleanUrl = cleanUrl + '?' + (params ? params + '&' : '') + 'raw=1';
      cleanUrl = cleanUrl.replace('&&', '&').replace('?&', '?');
      showToast('Dropbox stream optimized!', 'success');
    }

    setHeroVideos(p => {
      const next = [...p];
      next[index] = cleanUrl;
      return next;
    });
  };

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIndex(index);
    setUploadProgress(prev => ({ ...prev, [index]: 0 }));
    try {
      const storageRef = ref(storage, `hero-videos/v-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', (snap) => {
        setUploadProgress(p => ({ ...p, [index]: Math.round((snap.bytesTransferred / snap.totalBytes) * 100) }));
      }, (err) => {
        setUploadingIndex(null);
        showToast('Region restricted. Please paste a Dropbox link below!', 'error');
      }, async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        handleVideoLinkChange(index, url);
        setUploadingIndex(null);
      });
    } catch (err) { setUploadingIndex(null); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { store: settings, heroVideos: heroVideos, categories: categories, updatedAt: new Date().toISOString() });
      showToast('Brand synchronized live!', 'success');
    } catch (error) { 
      showToast('Cloud connection error. Check your Firebase Rules.', 'error');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="h-[60vh] flex flex-col items-center justify-center gap-6 text-primary animate-pulse">Establishing Cinema Engine...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 pb-48">
      <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between bg-[#FDFCFB] rounded-[3rem] p-12 shadow-soft border border-border border-l-[12px] border-[#0D1B38]">
        <div className="flex items-center gap-10">
          <div className="w-16 h-16 bg-[#0D1B38] text-white rounded-3xl flex items-center justify-center shadow-2xl"><SettingsIcon size={32} /></div>
          <div>
            <h1 className="text-4xl font-serif text-text mb-2 tracking-tight">E-commerce Heritage</h1>
            <p className="text-[10px] text-muted tracking-[0.5em] uppercase font-black opacity-80">Connected to tr-traders-live-33109</p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-3 px-8 bg-black text-white rounded-full text-[10px] uppercase font-black tracking-widest shadow-2xl self-start md:self-center">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> Real-time Status
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-20">
        <div className="bg-white rounded-[4.5rem] p-16 md:p-24 shadow-soft border border-border">
          <div className="pb-16 mb-20 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-xl">
               <h2 className="text-3xl font-serif text-text mb-4 flex items-center gap-6"><Video size={40} className="text-primary"/> Film & Cinema Matrix</h2>
               <p className="text-lg text-muted font-light leading-relaxed">Update your storefront background films. Paste your Dropbox links, and our engine will **Auto-Refine** them for streaming.</p>
            </div>
            <div className="flex gap-4">
              <a href="https://dropbox.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#0D1B38] hover:bg-[#0D1B38] hover:text-white py-4 px-8 border-2 border-[#0D1B38] rounded-3xl transition-all shadow-xl">
                 <ExternalLink size={18} /> Dropbox
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {heroVideos.slice(0, 3).map((url, i) => (
              <div key={i} className="flex flex-col gap-10 group animate-fade-in" style={{animationDelay: `${i * 0.15}s`}}>
                <div className="aspect-[9/16] md:aspect-[3/4] bg-black rounded-[4rem] overflow-hidden relative shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] hover:shadow-primary/30 transition-all duration-1000 group-hover:-translate-y-5 border-2 border-white/5">
                  {uploadingIndex === i ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 bg-[#0D1B38]/95 backdrop-blur-3xl px-16">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress[i]}%` }} />
                      </div>
                      <span className="text-5xl font-black tracking-tighter text-white">{uploadProgress[i]}%</span>
                    </div>
                  ) : (
                    <video key={url} src={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 scale-[1.01]" />
                  )}
                  <div className="absolute top-10 left-10"><span className="text-[10px] font-black tracking-[0.6em] uppercase text-white/50">CINEMA {i+1}</span></div>
                </div>
                
                <div className="space-y-8 px-4">
                  <div className="relative">
                    <div className="absolute -top-3 left-8 px-4 bg-white text-[10px] font-black uppercase tracking-[0.3em] text-primary z-10 flex items-center gap-3">
                       <Sparkles size={14} className="animate-pulse" /> Auto-Correction
                    </div>
                    <div className="flex items-center gap-5 px-8 py-6 bg-gray-50 border border-border rounded-[2.5rem] group focus-within:border-primary transition-all duration-700 shadow-sm">
                      <LinkIcon size={20} className="text-muted group-focus-within:text-primary transition-colors" />
                      <input type="text" value={url} onChange={(e) => handleVideoLinkChange(i, e.target.value)} placeholder="Paste Dropbox Link" className="bg-transparent w-full text-[12px] font-black tracking-[0.15em] outline-none text-[#0D1B38] placeholder:text-muted/30" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Save Button */}
        <div className="sticky bottom-12 left-0 right-0 z-40 mx-8">
          <button type="submit" disabled={loading || uploadingIndex !== null}
            className="w-full group relative overflow-hidden flex items-center justify-center gap-10 py-10 bg-[#0D1B38] text-white rounded-[3rem] font-black uppercase tracking-[0.6em] text-[16px] shadow-[0_40px_100px_-20px_rgba(13,27,56,0.5)] hover:-translate-y-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={30} className="animate-spin" /> : (
              <>
                 Synchronize All Devices
                 <Save size={28} className="group-hover:rotate-12 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>
      </form>
      
      <style>{`
        .shadow-soft {
          box-shadow: 0 30px 90px -20px rgba(0,0,0,0.04);
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
