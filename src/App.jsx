import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import IntroAnimation from './components/IntroAnimation';
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLayout from './components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import WishlistModal from './components/WishlistModal';

import './App.css';

const UserLayout = () => {
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    // Listen for custom event from MobileNav to open wishlist
    const handleOpenWishlist = () => setIsWishlistOpen(true);
    window.addEventListener('openWishlist', handleOpenWishlist);
    return () => window.removeEventListener('openWishlist', handleOpenWishlist);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <IntroAnimation />
      <Navbar onOpenWishlist={() => setIsWishlistOpen(true)} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
};



function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductEdit />} />
            <Route path="products/edit/:id" element={<AdminProductEdit />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
