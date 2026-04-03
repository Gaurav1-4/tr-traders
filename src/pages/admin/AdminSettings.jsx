import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Store, Settings as SettingsIcon, Video, Trash2, Plus, Link as LinkIcon, Eye } from 'lucide-react';
import { useToast } from '../../components/Toast';

const DEFAULT_VIDEOS = [
  'https://videos.pexels.com/video-files/4620563/4620563-uhd_1440_2560_30fps.mp4',
  'https://videos.pexels.com/video-files/5710432/5710432-uhd_1440_2560_30fps.mp4',
  'https://videos.pexels.com/video-files/4620571/4620571-uhd_1440_2560_30fps.mp4',
];

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'TR Traders',
    whatsappNumber: '919876543210',
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
            Add video URLs for the landing page hero section. Videos auto-play muted in a grid below the logo. Supports MP4 links (YouTube/Vimeo links won't work — use direct <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">.mp4</code> URLs).
          </p>

          <div className="space-y-4">
            {heroVideos.map((url, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                    <LinkIcon size={12} className="text-gray-400" />
                    Video {index + 1}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleVideoChange(index, e.target.value)}
                    placeholder="Paste direct .mp4 video URL..."
                    className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                  {/* Preview */}
                  {url.trim() && (
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-xs">
                      <video
                        src={url}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                        <Eye size={10} /> Preview
                      </div>
                    </div>
                  )}
                </div>
                {heroVideos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoSlot(index)}
                    className="mt-7 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove video"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {heroVideos.length < 5 && (
            <button
              type="button"
              onClick={addVideoSlot}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <Plus size={16} />
              Add Another Video
            </button>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Use 3 videos for the best look. Videos from <a href="https://www.pexels.com/videos/" target="_blank" rel="noopener noreferrer" className="underline">Pexels</a> work great — right-click a video → "Copy video address" to get the direct .mp4 URL.
            </p>
          </div>
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
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
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
                placeholder="919876543210"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
              <p className="text-xs text-muted">Include country code without + (e.g., 9198...)</p>
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

        {/* Save */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 focus:ring-4 focus:ring-accent/20 transition-all shadow-sm">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
