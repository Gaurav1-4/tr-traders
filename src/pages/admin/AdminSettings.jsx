import { useState, useEffect, useRef } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye, Upload, Loader2, Tags, Layers, AlertCircle, ExternalLink, Sparkles, RefreshCcw } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, storage, isMockMode } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://www.dropbox.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&st=f46x37jg&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [key, setKey] = useState(0); // For forcing re-renders of videos
  
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
    setKey(k => k + 1); // Force preview reload
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { store: settings, heroVideos: heroVideos, categories: categories, updatedAt: new Date().toISOString() });
      showToast('Universe Synchronized!', 'success');
    } catch (error) { 
      showToast('Check Project Permissions (Rules)', 'error');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="h-[60vh] flex flex-col items-center justify-center p-10 text-center animate-fade-in"><Loader2 className="animate-spin text-primary mb-6" size={48} /><p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted">Awaiting TR TRADERS LIVE Cloud Connection...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-48">
      <div className="mb-20 flex flex-col md:flex-row md:items-center justify-between bg-white rounded-[3.5rem] p-12 shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-border mt-10">
        <div className="flex items-center gap-10">
          <div className="w-16 h-16 bg-[#0D1B38] text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl scale-110"><SettingsIcon size={32} /></div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-text mb-2 tracking-tighter">Cinema Portal</h1>
            <p className="text-[10px] text-muted tracking-[0.6em] uppercase font-black opacity-60">tr-traders-live-33109</p>
          </div>
        </div>
        <div className="flex items-center gap-6 self-start md:self-center mt-6 md:mt-0">
           <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-green-700">Cloud Sync Active</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-20">
        <div className="bg-white rounded-[5rem] p-16 md:p-28 shadow-soft border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[15px] bg-[#0D1B38]" />
          
          <div className="pb-16 mb-24 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-12 text-center md:text-left">
            <div className="max-w-2xl">
               <h2 className="text-4xl font-serif text-text mb-4">Hero Exhibition</h2>
               <p className="text-lg text-muted font-light leading-relaxed max-w-lg">Manage the 3 primary films that introduce your brand heritage. For security, please use direct stream links.</p>
            </div>
            <button type="button" onClick={() => setKey(k => k + 1)} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#0D1B38] hover:text-primary transition-all py-3 border-b-2 border-[#0D1B38]/10 hover:border-primary">
               <RefreshCcw size={18} /> Reload Previews
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {heroVideos.slice(0, 3).map((url, i) => (
              <div key={`${i}-${key}`} className="flex flex-col gap-10 animate-fade-in" style={{animationDelay: `${i * 0.2}s`}}>
                <div className="aspect-[9/16] md:aspect-[3/4] bg-black rounded-[4.5rem] overflow-hidden relative shadow-[0_60px_130px_-30px_rgba(0,0,0,1)] border-4 border-[#0D1B38]/5">
                  <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover transition-opacity duration-1000 opacity-90 group-hover:opacity-100" />
                  <div className="absolute top-12 left-12 text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">FILM {i+1}</div>
                </div>
                
                <div className="space-y-8 px-6">
                  <div className="relative group">
                    <div className="absolute -top-3 left-8 px-4 bg-white text-[10px] font-black uppercase tracking-[0.4em] text-primary z-10 flex items-center gap-3">
                       <Sparkles size={16} /> Heritage Engine
                    </div>
                    <div className="flex items-center gap-6 px-10 py-7 bg-gray-50 border border-border shadow-sm rounded-[3rem] focus-within:border-primary transition-all duration-700">
                      <LinkIcon size={24} className="text-muted group-focus-within:text-primary transition-all duration-500" />
                      <input type="text" value={url} onChange={(e) => handleVideoLinkChange(i, e.target.value)} placeholder="Paste Direct .mp4 Link" className="bg-transparent w-full text-[12px] font-black tracking-[0.1em] outline-none text-[#0D1B38] placeholder:text-muted/20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Sync Button */}
        <div className="sticky bottom-16 left-0 right-0 z-40 mx-4 md:mx-auto max-w-5xl">
          <button type="submit" disabled={loading}
            className="w-full relative overflow-hidden flex items-center justify-center gap-10 py-10 bg-[#0D1B38] text-white rounded-[4rem] font-black uppercase tracking-[0.6em] text-[16px] shadow-[0_40px_100px_-20px_rgba(13,27,56,0.5)] hover:-translate-y-2 transition-all active:scale-95 disabled:opacity-50 border border-white/5">
            {loading ? <Loader2 size={32} className="animate-spin text-white" /> : (
              <div className="flex flex-col items-center gap-1">
                 <span>PUBLISH WORLDWIDE</span>
                 <span className="text-[9px] opacity-40 font-black tracking-[0.6em]">Instant Heritage Synchronization</span>
              </div>
            )}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>
      </form>
      
      <style>{`
        .shadow-soft {
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.03);
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
