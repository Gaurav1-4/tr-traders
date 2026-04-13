import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Clock, Instagram } from 'lucide-react';

const Footer = () => {
  const [settings, setSettings] = useState({
    storeName: 'TR TRADERS',
    whatsappNumber: '919208275274',
    address: 'Shori Cloth Market\nRohtak, Haryana (124001)'
  });

  useEffect(() => {
    const loadSettings = async () => {
      // 1. Load defaults/localStorage first for instant UI
      const savedSettings = localStorage.getItem('tr_traders_settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }

      // 2. Fetch from Firebase for global sync
      try {
        const { db, isMockMode } = await import('../services/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const cloudSettings = {
              storeName: data.storeName || 'TR TRADERS',
              whatsappNumber: data.whatsappNumber || '919208275274',
              address: data.address || 'Shori Cloth Market\nRohtak, Haryana (124001)'
            };
            setSettings(cloudSettings);
            localStorage.setItem('tr_traders_settings', JSON.stringify(cloudSettings));
          }
        }
      } catch (err) { console.error('Settings sync error:', err); }
    };

    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    return () => window.removeEventListener('settingsUpdated', loadSettings);
  }, []);

  return (
    <footer className="bg-[#0D1B38] text-gray-400 mt-auto">
      
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="block">
              <div className="flex items-center gap-3">
                <img src="/images/tr-traders-logo.png" alt="TR TRADERS" className="h-12 w-auto object-contain p-1 bg-[#0D1B38] rounded-md border border-white/10"/>
                <div>
                  <div className="font-serif text-lg text-white tracking-[0.1em]">{settings.storeName.toUpperCase()}</div>
                  <div className="text-[11px] text-white/30 tracking-wider">Premium Ethnic Wear</div>
                </div>
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed font-light">
              Bringing the finest handcrafted ethnic wear from India's best artisans directly to you.
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp text-white px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-green-600 transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp Us
            </a>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-white text-[12px] uppercase tracking-[0.2em] font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/catalog" className="text-sm text-white/50 hover:text-white transition-colors">Browse All</Link></li>
              <li><Link to="/catalog?sort=newest" className="text-sm text-white/50 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/about" className="text-sm text-white/50 hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/admin/login" className="text-sm text-white/50 hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-5">
            <h4 className="text-white text-[12px] uppercase tracking-[0.2em] font-semibold">Collections</h4>
            <ul className="space-y-3">
              <li><Link to="/catalog?category=Bridal" className="text-sm text-white/50 hover:text-white transition-colors">Bridal Collection</Link></li>
              <li><Link to="/catalog?category=Festive" className="text-sm text-white/50 hover:text-white transition-colors">Festive Wear</Link></li>
              <li><Link to="/catalog?category=Casual" className="text-sm text-white/50 hover:text-white transition-colors">Casual Everyday</Link></li>
              <li><Link to="/catalog?category=Cotton" className="text-sm text-white/50 hover:text-white transition-colors">Pure Cotton Suits</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="text-white text-[12px] uppercase tracking-[0.2em] font-semibold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-white/30 flex-shrink-0 mt-0.5" />
                <span className="text-white/50">{settings.address.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <MessageCircle size={16} className="text-white/30 flex-shrink-0" />
                <span className="text-white/50">+{settings.whatsappNumber.slice(0, 2)} {settings.whatsappNumber.slice(2, 7)} {settings.whatsappNumber.slice(7)}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-white/30 flex-shrink-0" />
                <span className="text-white/50">Usually responds within 1 hour</span>
              </li>
            </ul>
            <div className="flex gap-3 pt-1">
              <a href="https://www.instagram.com/t.r_trader/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-full text-white/40 hover:text-white hover:border-white/30 transition-all">
                <Instagram size={16} />
              </a>
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-full text-white/40 hover:text-whatsapp hover:border-whatsapp/30 transition-all">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/5 py-5 text-center">
        <p className="text-[11px] text-white/25 tracking-wider">
          © {new Date().getFullYear()} {settings.storeName.toUpperCase()} · All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
