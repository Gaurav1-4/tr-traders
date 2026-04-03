import { useState, useEffect, useRef } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye, Upload, Loader2, Tags, Layers, AlertCircle, ExternalLink, Sparkles, RefreshCcw, X, ArrowLeft, ArrowRight } from 'lucide-react';
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

  const addVideoSlot = () => {
    setHeroVideos(p => [...p, '']);
    showToast('New Slot Added!', 'success');
  };

  const removeVideoSlot = (index) => {
    if (heroVideos.length <= 1) {
      showToast('Minimum 1 slot required.', 'error');
      return;
    }
    setHeroVideos(p => p.filter((_, i) => i !== index));
    setKey(k => k + 1);
  };

  const moveSlot = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= heroVideos.length) return;
    const next = [...heroVideos];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setHeroVideos(next);
    setKey(k => k + 1);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { store: settings, heroVideos: heroVideos, categories: categories, updatedAt: new Date().toISOString() });
      showToast('Luxury Presence Updated!', 'success');
    } catch (error) { showToast('Sync failed.', 'error'); } 
    finally { setLoading(false); }
  };

  if (fetching) return <div className="h-[60vh] flex flex-col items-center justify-center p-10"><Loader2 className="animate-spin text-[#0D1B38]/10 mb-4" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-10 pb-48">
      {/* HEADER SECTION */}
      <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between bg-white rounded-[3rem] p-10 shadow-sm border border-border mt-10">
        <div className="flex items-center gap-10">
          <div className="w-16 h-16 bg-[#0D1B38] text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl scale-110"><SettingsIcon size={32} /></div>
          <div>
            <h1 className="text-3xl font-serif text-text mb-1 tracking-tight">Cinema Heritage</h1>
            <p className="text-[10px] text-muted tracking-[0.5em] uppercase font-black opacity-60">Infinite Reel Experience</p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-3 px-8 bg-[#0D1B38] text-white rounded-full text-[10px] uppercase font-black tracking-widest shadow-2xl self-start md:self-center mt-6 md:mt-0">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Heritage Sync Online
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-20">
        <div className="bg-white rounded-[4.5rem] p-16 md:p-24 shadow-soft border border-border">
          <div className="pb-12 mb-20 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
               <h2 className="text-3xl font-serif text-text mb-4 flex flex-col md:flex-row md:items-center gap-6 justify-center md:justify-start">
                  <Video size={36} className="text-primary mx-auto md:mx-0"/> Film Management
               </h2>
               <p className="text-base text-muted font-light leading-relaxed">Customize your 2026 heritage reel. Add slots, remove links, or reorder your story with the controls below.</p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <button type="button" onClick={() => setKey(k => k + 1)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#0D1B38]/30 hover:text-primary transition-all">
                 <RefreshCcw size={16} /> Previews
              </button>
              <button type="button" onClick={addVideoSlot} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-[#0D1B38] text-white py-5 px-10 rounded-[2rem] hover:bg-black transition-all shadow-2xl hover:-translate-y-1 active:scale-95">
                 <Plus size={18} /> Add Film Slot
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
            {heroVideos.map((url, i) => (
              <div key={`${i}-${key}`} className="flex flex-col gap-8 animate-fade-in group relative" style={{animationDelay: `${i * 0.1}s`}}>
                
                {/* TOOLBAR */}
                <div className="flex items-center justify-between px-6 bg-gray-50 rounded-full py-2 border border-border">
                   <div className="flex items-center gap-3">
                      <button type="button" onClick={() => moveSlot(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-primary disabled:opacity-0 transition-colors">
                         <ArrowLeft size={14} />
                      </button>
                      <button type="button" onClick={() => moveSlot(i, 1)} disabled={i === heroVideos.length - 1} className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-primary disabled:opacity-0 transition-colors">
                         <ArrowRight size={14} />
                      </button>
                   </div>
                   <span className="text-[10px] font-black tracking-widest text-muted/30">SLOT {i+1}</span>
                   <button type="button" onClick={() => removeVideoSlot(i)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>

                <div className="aspect-[3/4] bg-black rounded-[3.5rem] overflow-hidden relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] group-hover:shadow-primary/30 transition-all duration-1000 group-hover:-translate-y-4 border border-white/5">
                  <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100 duration-1000" />
                  <div className="absolute top-10 left-10 text-white/20 text-[9px] font-black uppercase tracking-[0.5em] select-none">Exhibition {i+1}</div>
                </div>
                
                <div className="space-y-6 px-4">
                  <div className="relative">
                    <div className="absolute -top-3 left-8 px-4 bg-white text-[9px] font-black uppercase tracking-[0.3em] text-primary z-10 flex items-center gap-3">
                       <Sparkles size={14} /> Refinement Link
                    </div>
                    <div className="flex items-center gap-5 px-8 py-5 bg-gray-50 border border-border rounded-[2.5rem] group focus-within:border-primary transition-all duration-700 shadow-sm">
                      <LinkIcon size={18} className="text-muted group-focus-within:text-primary transition-all" />
                      <input type="text" value={url} onChange={(e) => handleVideoLinkChange(i, e.target.value)} placeholder="Paste link here" className="bg-transparent w-full text-[11px] font-black tracking-[0.1em] outline-none text-[#0D1B38]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Sync Button */}
        <div className="sticky bottom-12 left-0 right-0 z-40 mx-auto max-w-lg">
          <button type="submit" disabled={loading}
            className="w-full relative overflow-hidden flex flex-col items-center justify-center gap-1 py-10 bg-[#0D1B38] text-white rounded-[4rem] font-black uppercase tracking-[0.6em] text-[15px] shadow-[0_50px_120px_rgba(13,27,56,0.6)] hover:-translate-y-4 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={32} className="animate-spin" /> : (
              <>
                 <span>Synchronize Experience</span>
                 <p className="text-[10px] opacity-40 font-black tracking-[0.4em] mt-2">All devices will update live</p>
              </>
            )}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
