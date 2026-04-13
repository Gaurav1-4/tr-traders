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
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Exhibition Vault', path: '/admin/products', icon: <Package size={18} /> },
    { name: 'Studio Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <ProtectedRoute>
      <div className="flex bg-[#FAF9F6] min-h-screen font-sans">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#0D1B38] transform transition-transform duration-500 ease-[cubic-bezier(0.4, 0, 0.2, 1)] ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.3)]' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col border-r border-white/5`}>
          <div className="flex items-center justify-between h-32 px-10 border-b border-white/5">
            <BrandLogo dark={true} className="scale-100 origin-left" />
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white hover:text-primary">
              <X size={24} />
            </button>
          </div>
          <nav className="p-10 space-y-4 flex-grow overflow-y-auto no-scrollbar">
            <div className="mb-10 text-[9px] uppercase font-black tracking-[0.4em] text-white/20">Navigation</div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-6 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? 'bg-white text-[#0D1B38] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] scale-105' : 'text-white/30 hover:bg-white/5 hover:text-white hover:translate-x-2'}`}
              >
                <span className={({ isActive }) => isActive ? 'text-primary' : 'opacity-40'}>{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-10 border-t border-white/5 space-y-6">
            <div className="text-[8px] uppercase tracking-[0.4em] text-white/10 text-center">Version 4.2.0 Secure</div>
            <button onClick={handleLogout} className="flex items-center justify-center gap-4 px-6 py-5 w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-500/5 hover:bg-red-500/20 transition-all border border-red-500/10">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-32 bg-[#FAF9F6] border-b border-[#0D1B38]/5 flex items-center justify-between px-10 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[#0D1B38] hover:text-primary">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex flex-col">
              <h1 className="font-serif text-2xl font-light italic text-[#0D1B38] tracking-tight">TR Studio Console</h1>
              <span className="text-[8px] uppercase tracking-[0.5em] font-black text-[#0D1B38]/20">Legacy Management System</span>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0D1B38]">Gaurav Goyal</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#0D1B38]/20 flex items-center gap-2"><Globe size={8}/> Global Admin</span>
               </div>
               <div className="w-14 h-14 bg-[#0D1B38] text-white rounded-[1.2rem] flex items-center justify-center font-black font-serif text-xl shadow-2xl">
                 G
               </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar pb-32">
            <Outlet />
          </main>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-[#0D1B38]/70 backdrop-blur-md z-[90] md:hidden transition-opacity duration-500" onClick={() => setIsSidebarOpen(false)} />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
