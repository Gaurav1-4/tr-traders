import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const { showToast } = useToast();

  const loadWishlist = () => {
    try {
      const stored = localStorage.getItem('tr_traders_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      } else {
        setWishlist([]);
      }
    } catch (e) {
      console.warn("Could not load wishlist from localStorage");
    }
  };

  useEffect(() => {
    loadWishlist();

    const handleSync = () => loadWishlist();
    window.addEventListener('wishlist-updated', handleSync);
    return () => window.removeEventListener('wishlist-updated', handleSync);
  }, []);

  const toggleWishlist = (productId) => {
    try {
      const stored = localStorage.getItem('tr_traders_wishlist');
      let current = stored ? JSON.parse(stored) : [];
      
      const isRemoving = current.includes(productId);
      const next = isRemoving
        ? current.filter(id => id !== productId)
        : [...current, productId];
      
      localStorage.setItem('tr_traders_wishlist', JSON.stringify(next));
      setWishlist(next);

      // Notify other instances
      window.dispatchEvent(new Event('wishlist-updated'));

      // Provide feedback
      if (isRemoving) {
        showToast('Removed from wishlist');
      } else {
        showToast('Added to wishlist', 'success');
      }
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return { wishlist, toggleWishlist, isInWishlist };
};
