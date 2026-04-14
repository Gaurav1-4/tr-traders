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
  Bell,
  Globe 
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
          <nav className="p-6 space-y-2 flex-grow overflow-y-auto no-scrollbar">
            <div className="mb-6 text-[10px] uppercase font-semibold tracking-widest text-white/30 px-4">Menu</div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive ? 'bg-white text-[#0D1B38] shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-6 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative">
          <header className="h-16 bg-[#FAF9F6] border-b border-[#0D1B38]/8 flex items-center justify-between px-6 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[#0D1B38] hover:text-primary">
              <Menu size={22} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-[#0D1B38]">TR TRADERS Admin</h1>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-xs font-medium text-[#0D1B38]/50">Admin</span>
               <div className="w-9 h-9 bg-[#0D1B38] text-white rounded-lg flex items-center justify-center font-bold text-sm">
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
