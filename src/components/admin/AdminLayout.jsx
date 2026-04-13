import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell 
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import ProtectedRoute from '../ProtectedRoute';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('tr_admin');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <ProtectedRoute>
      <div className="flex bg-bg min-h-screen font-sans">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-[100] w-64 bg-[#0D1B38] transform transition-transform duration-500 ease-[cubic-bezier(0.4, 0, 0.2, 1)] ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.3)]' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col border-r border-white/5`}>
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
            <BrandLogo dark={true} className="scale-75 origin-left" />
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          <nav className="p-6 space-y-3 flex-grow overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive && item.path !== '#' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <span className="opacity-70">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-6 border-t border-white/5">
            <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 w-full rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="sticky top-0 z-60 h-20 bg-white/90 backdrop-blur-xl border-b border-[#0D1B38]/5 flex items-center justify-between px-6 sm:px-10 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-text hover:text-primary">
              <Menu size={24} />
            </button>
            <div className="hidden md:block font-serif text-lg font-medium text-text">
              Admin Portal
            </div>
            <div className="flex items-center gap-5 ml-auto md:ml-0">
              {/* NOTIFICATION BELL REMOVED */}
              <div className="flex items-center gap-2 border-l border-border pl-5">
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold font-serif text-sm">
                  TR
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-text leading-none">Admin User</span>
                  <span className="text-xs text-muted mt-1 leading-none">Manager</span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-4 sm:p-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-[#0D1B38]/60 backdrop-blur-md z-[90] md:hidden transition-opacity duration-500" onClick={() => setIsSidebarOpen(false)} />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
