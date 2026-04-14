import { Link } from 'react-router-dom';
import { Plus, Package, Database, Globe } from 'lucide-react';
import AdminProductTable from '../../components/AdminProductTable';

const AdminProducts = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] pb-48">

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20">
         
         <header className="mb-12">
            <h2 className="text-3xl font-bold text-[#0D1B38] mb-2">Products Portfolio</h2>
            <p className="text-sm font-medium text-[#0D1B38]/40">Manage your collection and inventory status.</p>
         </header>

         {/* ===== PRODUCT TABLE AREA ===== */}
         <section className="animate-fade-in transition-all duration-1000">
            <AdminProductTable />
         </section>

         <footer className="mt-20 pt-10 border-t border-[#0D1B38]/5 flex flex-col md:flex-row md:items-center justify-between gap-6 text-[#0D1B38]/30">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Status</span>
               <span className="text-xs font-medium text-green-700/60">System Online</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">TR TRADERS Admin © 2026</p>
         </footer>
      </main>
    </div>
  );
};

export default AdminProducts;
