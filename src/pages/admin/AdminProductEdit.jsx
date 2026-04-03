import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Loader2, Sparkles } from 'lucide-react';
import AdminProductForm from '../../components/AdminProductForm';
import { getProductById } from '../../services/productService';

const AdminProductEdit = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const product = await getProductById(id);
          setInitialData(product);
        } catch (err) {
          setError('Failed to synchronize heritage data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
       <Loader2 className="animate-spin text-primary opacity-20 mb-4" size={40} />
       <p className="text-[10px] uppercase font-black tracking-[0.5em] text-[#0D1B38]/20">Authenticating Masterpiece...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1B38] pb-48 font-sans selection:bg-[#0D1B38] selection:text-white">
      {/* ===== STUDIO NAV ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#0D1B38]/5 mb-12">
         <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <Link to="/admin/products" className="text-[#0D1B38]/30 hover:text-black transition-colors"><ArrowLeft size={20}/></Link>
               <h1 className="text-xs font-black uppercase tracking-[0.6em] opacity-30">Designer Specification</h1>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/30">
               <Globe size={12} /> Live Inventory Sync
            </div>
         </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20">
         <header className="mb-20">
            <h2 className="text-5xl md:text-8xl font-serif font-light tracking-tighter mb-6 italic leading-none">
              {isEdit ? 'Refine Design' : 'Curate Masterpiece'}
            </h2>
            <div className="w-20 h-px bg-[#0D1B38]/20 mb-8"></div>
            <p className="max-w-2xl text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-black leading-loose text-[#0D1B38]/40">
               {isEdit ? 'Update the details and story of this signature creation.' : 'Introduce a new designer piece to your digital heritage vault.'}
            </p>
         </header>

         {error ? (
           <div className="bg-red-50 p-12 rounded-[3rem] border border-red-100 text-center animate-fade-in">
              <p className="text-red-800 font-serif text-2xl italic mb-8">{error}</p>
              <Link to="/admin/products" className="inline-block bg-[#0D1B38] text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest">Return to Vault</Link>
           </div>
         ) : (
           <AdminProductForm initialData={initialData} isEdit={isEdit} />
         )}
      </main>
    </div>
  );
};

export default AdminProductEdit;
