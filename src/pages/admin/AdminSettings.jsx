import { useState, useEffect, useRef } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye, Upload, Loader2 } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { storage, isMockMode } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const DEFAULT_VIDEOS = [
  'https://videos.pexels.com/video-files/4620563/4620563-uhd_1440_2560_30fps.mp4',
  'https://videos.pexels.com/video-files/5710432/5710432-uhd_1440_2560_30fps.mp4',
  'https://videos.pexels.com/video-files/4620571/4620571-uhd_1440_2560_30fps.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRef = useRef(null);
  
  const [settings, setSettings] = useState({
    storeName: 'TR Traders',
    whatsappNumber: '919208275274',
    email: 'contact@trtraders.com',
    address: '123 Heritage Lane, Chandni Chowk, Delhi 110006',
    currency: 'INR',
  });

  const [heroVideos, setHeroVideos] = useState([...DEFAULT_VIDEOS]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('tr_traders_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedVideos = localStorage.getItem('tr_traders_hero_videos');
    if (savedVideos) {
      const parsed = JSON.parse(savedVideos);
      if (Array.isArray(parsed) && parsed.length > 0) setHeroVideos(parsed);
    }
  }, []);

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (optional, e.g., 20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      showToast('Video too large (Max 20MB)', 'error');
      return;
    }

    if (!file.type.startsWith('video/')) {
      showToast('Please upload a video file (.mp4, etc.)', 'error');
      return;
    }

    setUploadingIndex(index);

    if (isMockMode) {
      // Simulate upload in mock mode
      setTimeout(() => {
        showToast('Direct upload requires Firebase API keys. Using local preview.', 'info');
        const localPreviewUrl = URL.createObjectURL(file);
        handleVideoChange(index, localPreviewUrl);
        setUploadingIndex(null);
      }, 1500);
      return;
    }

    try {
      const storageRef = ref(storage, `hero-videos/video-${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error(error);
          showToast('Upload failed. Check Firebase permissions.', 'error');
          setUploadingIndex(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleVideoChange(index, downloadURL);
          showToast('Video uploaded successfully!', 'success');
          setUploadingIndex(null);
        }
      );
    } catch (err) {
      console.error(err);
      showToast('Error initializing upload', 'error');
      setUploadingIndex(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (index, value) => {
    setHeroVideos(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addVideoSlot = () => {
    if (heroVideos.length < 5) setHeroVideos(prev => [...prev, '']);
  };

  const removeVideoSlot = (index) => {
    if (heroVideos.length > 1) setHeroVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      localStorage.setItem('tr_traders_settings', JSON.stringify(settings));

      const validVideos = heroVideos.filter(v => v.trim() !== '');
      localStorage.setItem('tr_traders_hero_videos', JSON.stringify(validVideos.length > 0 ? validVideos : DEFAULT_VIDEOS));

      window.dispatchEvent(new Event('settingsUpdated'));
      showToast('Settings saved successfully!');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <SettingsIcon size={28} className="text-primary" />
        <h1 className="text-2xl font-serif font-medium text-text">Store Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ===== HERO VIDEOS SECTION ===== */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg text-text font-serif font-medium mb-2 flex items-center gap-2">
            <Video size={20} className="text-primary" />
            Hero Videos
          </h2>
          <p className="text-sm text-muted mb-5 border-b border-border pb-4">
            Upload videos for the landing page hero section. They will play automagically. Best results with 3 or more videos.
          </p>

          <div className="space-y-6">
            {heroVideos.map((url, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 relative group">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left: Preview */}
                  <div className="w-full md:w-48 aspect-[9/16] md:aspect-[3/4] bg-black rounded-lg overflow-hidden relative shadow-inner">
                    {uploadingIndex === index ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 bg-black/40">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Uploading...</span>
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
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Video size={40} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Right: Controls */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Video Slot {index + 1}</span>
                         {heroVideos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVideoSlot(index)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                         )}
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* URL input */}
                        <div className="flex items-center gap-2 bg-white border border-border rounded-lg p-1 px-3">
                          <LinkIcon size={14} className="text-gray-400 flex-shrink-0" />
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleVideoChange(index, e.target.value)}
                            placeholder="Video URL or upload file..."
                            className="w-full py-1.5 text-xs outline-none bg-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-px bg-border flex-grow"></div>
                          <span className="text-[10px] uppercase text-muted font-bold tracking-widest">OR</span>
                          <div className="h-px bg-border flex-grow"></div>
                        </div>

                        {/* File upload trigger */}
                        <label className="cursor-pointer group/btn">
                          <input 
                            type="file" 
                            accept="video/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, index)}
                            disabled={uploadingIndex !== null}
                          />
                          <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-primary text-primary hover:bg-primary-light transition-all rounded-lg text-xs font-bold tracking-widest uppercase">
                            <Upload size={14} />
                            Upload Video File
                          </div>
                        </label>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted italic mt-4">
                      Direct upload uses cloud storage. MP4 format is recommended.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addVideoSlot}
            className="mt-6 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-muted hover:border-primary hover:text-primary transition-all group"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Add Video Slot</span>
          </button>
        </div>

        {/* General Store Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg text-text font-serif font-medium mb-5 border-b border-border pb-3">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Store size={16} className="text-gray-400"/> Store Name
              </label>
              <input type="text" name="storeName" value={settings.storeName} onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <span className="text-gray-400 font-bold">₹</span> Currency
              </label>
              <select name="currency" value={settings.currency} onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg text-text font-serif font-medium mb-5 border-b border-border pb-3">
            Contact Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Phone size={16} className="text-gray-400"/> WhatsApp Number
              </label>
              <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Mail size={16} className="text-gray-400"/> Store Email
              </label>
              <input type="email" name="email" value={settings.email} onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <MapPin size={16} className="text-gray-400"/> Physical Address
              </label>
              <textarea name="address" rows="3" value={settings.address} onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading || uploadingIndex !== null}
            className="flex items-center gap-2 px-8 py-3.5 bg-accent text-white rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-accent/90 focus:ring-4 focus:ring-accent/20 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Push Changes Live
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
