import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  const [whatsappNumber, setWhatsappNumber] = useState('919208275274');

  useEffect(() => {
    const loadSettings = async () => {
      // 1. Local first
      const savedSettings = localStorage.getItem('tr_traders_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
      }

      // 2. Cloud sync
      try {
        const { db, isMockMode } = await import('../services/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().whatsappNumber) {
            setWhatsappNumber(docSnap.data().whatsappNumber);
          }
        }
      } catch (err) { console.error(err); }
    };
    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    return () => window.removeEventListener('settingsUpdated', loadSettings);
  }, []);

  // Hide on admin routes (except login so we can get in)
  if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/catalog', icon: Search },
    { 
      name: 'Account', 
      path: '/admin/login', 
      icon: User
    },
    { 
      name: 'Saved', 
      path: '#',
      icon: Heart, 
      action: 'wishlist' 
    },
    { 
      name: 'WhatsApp', 
      path: 'whatsapp', 
      icon: MessageCircle,
      action: 'whatsapp'
    }
  ];

  return (
    <>
      {/* Spacer for bottom nav */}
      <div className="h-16 md:hidden"></div>
      
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden z-50 flex justify-around items-center px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path && !item.action;
          const Icon = item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => {
                if (item.action === 'whatsapp') {
                  window.open(`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20exploring%20your%20collection.`, "_blank");
                } else if (item.action === 'wishlist') {
                  window.dispatchEvent(new Event('openWishlist'));
                } else {
                  if (location.pathname !== item.path) {
                    navigate(item.path);
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }
              }}
              className={`flex flex-col items-center justify-center w-full h-full relative transition-colors duration-300 ${
                isActive ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-b-md"></span>
              )}
              
              <div className="relative">
                <Icon size={22} className={isActive ? 'fill-accent/10' : ''} />
                {item.action === 'wishlist' && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 font-medium">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-1 tracking-wide">{item.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default MobileNav;
