import { useState, useEffect, useRef } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye, Upload, Loader2, Tags, Layers, AlertCircle, ExternalLink, Sparkles, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db, storage, isMockMode } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const DEFAULT_VIDEOS = [
  'https://dl.dropboxusercontent.com/scl/fi/687aazjfn2rfo6ju5lhc1/Women-s_suit_promotional_202604031753-ezremove.mp4?rlkey=ic8vrq3ryp2pue7jj6iukmkod&raw=1',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-indian-dress-walking-41007-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-off-her-indian-dress-41014-large.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [key, setKey] = useState(0);
  
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
    setKey(k => k + 1);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { store: settings, heroVideos: heroVideos, categories: categories, updatedAt: new Date().toISOString() });
      showToast('Brand synchronized!', 'success');
    } catch (error) { showToast('Permission error.', 'error'); } 
    finally { setLoading(false); }
  };

  if (fetching) return <div className="h-[60vh] flex flex-col items-center justify-center p-10"><Loader2 className="animate-spin text-[#0D1B38]/20 mb-4" size={32} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-48">
      {/* HEADER SECTION - SLEEKER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between bg-white rounded-[2rem] p-8 shadow-sm border border-border mt-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#0D1B38] text-white rounded-[1rem] flex items-center justify-center shadow-lg"><SettingsIcon size={24} /></div>
          <div>
            <h1 className="text-2xl font-serif text-text mb-0.5">Control Center</h1>
            <p className="text-[8px] text-muted tracking-[0.4em] uppercase font-black opacity-60">Global Brand Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-full border border-border self-start md:self-center mt-4 md:mt-0">
           <div className="w-2 h-2 bg-green-500 rounded-full" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0D1B38]/50">Live Sync Engaged</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-soft border border-border">
          <div className="pb-10 mb-16 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
               <h2 className="text-xl font-serif text-text mb-2 flex items-center gap-3"><Video size={20} className="text-primary"/> Film Exhibition</h2>
               <p className="text-xs text-muted font-light leading-relaxed">Update the background films of your storefront heritage strip.</p>
            </div>
            <button type="button" onClick={() => setKey(k => k + 1)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/40 hover:text-primary transition-all">
               <RefreshCcw size={14} /> Refresh Previews
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {heroVideos.slice(0, 3).map((url, i) => (
              <div key={`${i}-${key}`} className="flex flex-col gap-6 animate-fade-in group" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="aspect-[3/4] bg-black rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/5 transition-transform duration-700 group-hover:-translate-y-2">
                  <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90" />
                  <div className="absolute top-8 left-8 text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">FILM {i+1}</div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute -top-2 left-6 px-3 bg-white text-[8px] font-black uppercase tracking-[0.3em] text-primary/60 z-10">Smart Link</div>
                    <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border border-border rounded-2xl group focus-within:border-primary transition-all shadow-sm">
                      <LinkIcon size={16} className="text-muted group-focus-within:text-primary transition-all" />
                      <input type="text" value={url} onChange={(e) => handleVideoLinkChange(i, e.target.value)} placeholder="Paste Link" className="bg-transparent w-full text-[10px] font-black tracking-[0.1em] outline-none text-[#0D1B38]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Save Button - SLEEKER */}
        <div className="sticky bottom-10 left-0 right-0 z-40 mx-auto max-w-sm">
          <button type="submit" disabled={loading}
            className="w-full relative overflow-hidden flex items-center justify-center gap-6 py-6 bg-[#0D1B38] text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={24} className="animate-spin" /> : (
              <div className="flex items-center gap-4">
                 <span>Synchronize Brand</span>
                 <Save size={18} />
              </div>
            )}
          </button>
        </div>
      </form>
      
      <style>{`
        .shadow-soft {
          box-shadow: 0 40px 120px -30px rgba(0,0,0,0.02);
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
