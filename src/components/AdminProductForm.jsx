import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UploadCloud, X, Image as ImageIcon, Tag, DollarSign, 
  Archive, LayoutList, Check, ArrowLeft, Loader2, Sparkles, Globe, Layers
} from 'lucide-react';
import { useToast } from './Toast';
import { addProduct, updateProduct } from '../services/productService';

const CATEGORIES = ['Sarees', 'Kurta Sets', 'Suits', 'Unstitched', 'Lehengas', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];

const AdminProductForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Suits',
    fabric: initialData?.fabric || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    status: initialData?.status || 'active',
    stock: initialData?.stock || 'in_stock',
    featured: initialData?.featured || false,
    colors: initialData?.colors || [],
    occasion: initialData?.occasion || [],
    images: initialData?.images?.length ? [...initialData.images, '', ''].slice(0, 3) : ['', '', '']
  });

  const [colorInput, setColorInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddColor = (e) => {
    if (e.key === 'Enter' && colorInput.trim()) {
      e.preventDefault();
      if (!formData.colors.includes(colorInput.trim())) {
        setFormData(prev => ({ ...prev, colors: [...prev.colors, colorInput.trim()] }));
      }
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== colorToRemove) }));
  };

  const handleImageUrlChange = (index, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = value.trim();
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cleanedData = {
        ...formData,
        images: formData.images.filter(img => img && img.trim() !== '')
      };
      
      if (isEdit && initialData?.id) {
        await updateProduct(initialData.id, cleanedData);
        showToast('Heritage design updated.', 'success');
      } else {
        await addProduct(cleanedData);
        showToast('New masterpiece published.', 'success');
      }
      navigate('/admin/products');
    } catch (error) {
      showToast('Masterpiece synchronization error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-10 pt-20">
      <header className="mb-20">
        <h2 className="text-4xl md:text-7xl font-serif font-light italic tracking-tight text-[#0D1B38] mb-6">
          {isEdit ? 'Refine Masterpiece' : 'Publish Design'}
        </h2>
        <div className="w-20 h-px bg-[#0D1B38]/20 mb-8"></div>
        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30">Studio Entry Portal / Collection Management</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-20 animate-fade-in pb-48">
        {/* Main Panel */}
        <div className="flex-1 space-y-20">
          <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-[#0D1B38]/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20"></div>
             <div className="mb-16 border-b border-[#0D1B38]/5 pb-8">
                <span className="text-[10px] font-black tracking-[0.4em] text-[#0D1B38]/20 uppercase">Core Specification</span>
             </div>
             
             <div className="space-y-16">
                <div className="relative group">
                   <label className="text-[9px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/20 mb-4 block">Design Title</label>
                   <input 
                      required name="name" value={formData.name} onChange={handleChange}
                      className="w-full bg-transparent border-b border-[#0D1B38]/10 py-6 text-2xl md:text-4xl font-serif italic outline-none focus:border-[#0D1B38] transition-all placeholder:text-[#0D1B38]/5"
                      placeholder="Enter Signature Name..."
                   />
                </div>

                <div className="relative group">
                   <label className="text-[9px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/20 mb-4 block">Craftsmanship Narrative</label>
                   <textarea 
                      required name="description" rows="5" value={formData.description} onChange={handleChange}
                      className="w-full bg-transparent border-b border-[#0D1B38]/10 py-6 text-[15px] font-light tracking-wide leading-relaxed outline-none focus:border-[#0D1B38] transition-all placeholder:text-[#0D1B38]/5 resize-none"
                      placeholder="Describe the heritage journey of this piece..."
                   />
                </div>
             </div>
          </div>

          {/* Exhibition Stills */}
          <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-[#0D1B38]/5">
             <div className="mb-16 flex items-center justify-between border-b border-[#0D1B38]/5 pb-8">
                <span className="text-[10px] font-black tracking-[0.4em] text-[#0D1B38]/20 uppercase">Exhibition Stills</span>
                <ImageIcon className="opacity-10" size={20} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="space-y-8">
                     <div className="aspect-[3/4] bg-[#FAF9F6] rounded-[2rem] overflow-hidden shadow-2xl border border-[#0D1B38]/5 relative group transition-all duration-700 hover:-translate-y-4">
                        {url ? (
                          <>
                             {url.toLowerCase().includes('mp4') || url.toLowerCase().includes('webm') || url.toLowerCase().includes('dropbox.com') ? (
                               <video src={url} key={url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                             ) : (
                               <img src={url} alt={`Still ${idx+1}`} className="w-full h-full object-cover" />
                             )}
                             <button type="button" onClick={() => handleImageUrlChange(idx, '')} className="absolute top-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[#0D1B38] p-2 rounded-full shadow-2xl"><X size={14}/></button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                             <UploadCloud className="text-[#0D1B38]/5 mb-6" size={32} />
                             <span className="text-[8px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/20">Empty Reel</span>
                          </div>
                        )}
                     </div>
                     <input 
                        type="url" value={url} onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        placeholder="PASTE URL"
                        className="w-full bg-transparent border-b border-[#0D1B38]/10 py-4 text-[9px] font-black tracking-[0.2em] outline-none focus:border-[#0D1B38] transition-all uppercase placeholder:text-[#0D1B38]/10"
                     />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-[400px] space-y-12">
           <div className="bg-[#0D1B38] p-12 rounded-[3rem] text-white shadow-2xl space-y-16 sticky top-12 border border-white/5">
              <div>
                 <label className="text-[9px] uppercase font-black tracking-[0.4em] text-white/30 mb-6 block">Asset Valuation</label>
                 <div className="flex items-center gap-6 border-b border-white/10 pb-6 focus-within:border-white transition-colors">
                    <span className="text-3xl font-serif text-white/20 italic">₹</span>
                    <input type="number" name="price" value={formData.price} onChange={handleChange}
                      className="w-full bg-transparent text-4xl font-serif outline-none placeholder:text-white/5 italic"
                      placeholder="PoA"
                    />
                 </div>
              </div>

              <div className="space-y-10">
                <div className="group">
                   <label className="text-[9px] uppercase font-black tracking-[0.4em] text-white/30 mb-4 block">Vault Category</label>
                   <select name="category" value={formData.category} onChange={handleChange}
                     className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all appearance-none">
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0D1B38] text-white">{c}</option>)}
                   </select>
                </div>

                <div className="group">
                   <label className="text-[9px] uppercase font-black tracking-[0.4em] text-white/30 mb-4 block">Fabric Heritage</label>
                   <input name="fabric" value={formData.fabric} onChange={handleChange} required
                      className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all"
                      placeholder="E.G. PURE SILK"
                   />
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-8">
                 <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">Showcase Highlight</span>
                    <div className={`w-14 h-7 rounded-full transition-all relative ${formData.featured ? 'bg-primary shadow-[0_0_20px_rgba(126,20,255,0.4)]' : 'bg-white/10'}`}>
                       <div className={`absolute top-1 w-5 h-5 rounded-full transition-all shadow-xl ${formData.featured ? 'left-8 bg-white' : 'left-1 bg-white/20'}`} />
                       <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="hidden" />
                    </div>
                 </label>
              </div>

              <div className="pt-10 flex flex-col gap-6">
                 <button type="submit" disabled={loading}
                   className="w-full bg-white text-[#0D1B38] py-8 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:-translate-y-2 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : (
                      <>
                         Publish Piece <Check size={20} />
                      </>
                    )}
                 </button>
                 <button type="button" onClick={() => navigate('/admin/products')} className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-red-400 transition-colors">Discard Edition</button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
