import { Link } from 'react-router-dom';
import { Plus, Package, Database, Globe } from 'lucide-react';
import AdminProductTable from '../../components/AdminProductTable';

const AdminProducts = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] pb-48">
      {/* ===== STUDIO NAV BAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#0D1B38]/5 mb-12">
         <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 bg-[#0D1B38] rounded-full animate-pulse" />
               <h1 className="text-sm font-black uppercase tracking-[0.5em] opacity-80">Inventory Studio</h1>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/30">
                  <Globe size={12} /> Sync Online
               </div>
               <Link 
                 to="/admin/products/new" 
                 className="bg-[#0D1B38] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl flex items-center gap-3"
               >
                 <Plus size={16} /> New Design
               </Link>
            </div>
         </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20">
         
         {/* ===== INTRODUCTION ===== */}
         <header className="mb-20">
            <h2 className="text-5xl md:text-8xl font-serif font-light tracking-tighter mb-6 italic leading-none">Exhibition Vault</h2>
            <div className="w-24 h-px bg-[#0D1B38]/20 mb-8"></div>
            <p className="max-w-2xl text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-black leading-loose text-[#0D1B38]/30">
               Manage the signature pieces within your heritage collection. <br/> 
               Every addition is curated for the global digital showroom.
            </p>
         </header>

         {/* ===== PRODUCT TABLE AREA ===== */}
         <section className="animate-fade-in transition-all duration-1000">
            <AdminProductTable />
         </section>

         {/* ===== FOOTER METADATA ===== */}
         <footer className="mt-40 pt-20 border-t border-[#0D1B38]/5 flex flex-col md:flex-row md:items-center justify-between gap-8 text-[#0D1B38]/20">
            <div className="flex items-center gap-12">
               <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.4em] font-black">Architecture</span>
                  <span className="text-[10px] font-serif italic">Global Inventory Native</span>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-[0.4em] font-black">Asset Status</span>
                  <span className="text-[10px] font-serif italic text-green-800/40">Secure & Verified</span>
               </div>
            </div>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-right">Heritage Vault Management © 2026</p>
         </footer>
      </main>
    </div>
  );
};

export default AdminProducts;
