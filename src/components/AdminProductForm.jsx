import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UploadCloud, X, Image as ImageIcon, Tag, DollarSign, 
  Archive, LayoutList, Check, ArrowLeft, Loader2, Sparkles, Globe, Layers
} from 'lucide-react';
import { useToast } from './Toast';
import { addProduct, updateProduct } from '../services/productService';

const CATEGORIES = ['Sarees', 'Kurta Sets', 'Suits', 'Unstitched', 'Lehengas', 'Casual', 'Formal', 'Bridal', 'Festive', 'Winter', 'Cotton'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom', 'Unstitched'];

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
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    occasion: initialData?.occasion || [],
    images: initialData?.images?.length ? [...initialData.images, '', '', ''].slice(0, 4) : ['', '', '', '']
  });

  const [colorInput, setColorInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
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
      if (isEdit && initialData?.id) {
        await updateProduct(initialData.id, formData);
        showToast('Heritage design updated.', 'success');
      } else {
        await addProduct(formData);
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
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 animate-fade-in sm:pb-32">
      
      {/* ===== MASTERPIECE DETAILS (MAIN PANEL) ===== */}
      <div className="flex-1 space-y-12">
        <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-soft border border-[#0D1B38]/5">
           <div className="mb-12 border-b border-[#0D1B38]/5 pb-8 flex items-center gap-6">
              <span className="text-[10px] font-black tracking-[0.5em] text-[#0D1B38]/20 uppercase">Specification Sheet</span>
           </div>
           
           <div className="space-y-12">
              <div className="relative group">
                 <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-4 block">Design Title</label>
                 <input 
                    required name="name" value={formData.name} onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-[#0D1B38]/5 py-6 text-2xl md:text-4xl font-serif italic outline-none focus:border-[#0D1B38] transition-all placeholder:text-[#0D1B38]/5"
                    placeholder="e.g. Royal Blue Silk Set"
                 />
              </div>

              <div className="relative group">
                 <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-4 block">Story & Craftsmanship</label>
                 <textarea 
                    required name="description" rows="4" value={formData.description} onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-[#0D1B38]/5 py-6 text-sm font-light tracking-wide leading-relaxed outline-none focus:border-[#0D1B38] transition-all placeholder:text-[#0D1B38]/5 resize-none"
                    placeholder="Describe the heritage journey of this piece..."
                 />
              </div>
           </div>
        </div>

        {/* EXHIBITION STILLS (MEDIA) */}
        <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-soft border border-[#0D1B38]/5">
           <h3 className="text-xl font-serif mb-12 flex items-center gap-4"><ImageIcon className="opacity-10" /> Exhibition Stills</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {formData.images.map((url, idx) => (
                <div key={idx} className="space-y-6">
                   <div className="aspect-[3/4] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative group">
                      {url ? (
                        <>
                           <img src={url} alt={`Still ${idx+1}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                           <button type="button" onClick={() => handleImageUrlChange(idx, '')} className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                           <UploadCloud className="text-white/10 mb-4" size={24} />
                           <span className="text-[8px] uppercase font-black tracking-[0.4em] text-white/20">Empty Reel</span>
                        </div>
                      )}
                   </div>
                   <input 
                      type="url" value={url} onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder="Paste Image URL"
                      className="w-full bg-transparent border-b border-[#0D1B38]/5 py-3 text-[9px] font-black tracking-widest outline-none focus:border-[#0D1B38] transition-all uppercase placeholder:text-[#0D1B38]/10"
                   />
                </div>
              ))}
           </div>
        </div>

        {/* HERITAGE ATTRIBUTES */}
        <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-soft border border-[#0D1B38]/5">
           <h3 className="text-xl font-serif mb-12 flex items-center gap-4"><Layers className="opacity-10" /> Heritage Attributes</h3>
           <div className="space-y-12">
              <div>
                 <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-8 block">Universal Sizing</label>
                 <div className="flex flex-wrap gap-4">
                    {SIZES.map(size => (
                      <button key={size} type="button" onClick={() => handleSizeToggle(size)}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.sizes.includes(size) ? 'bg-[#0D1B38] text-white shadow-xl scale-110' : 'bg-[#FAF9F6] text-[#0D1B38]/30 border border-[#0D1B38]/5'
                        }`}>
                        {size}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div>
                    <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-4 block">Signature Colors (Enter)</label>
                    <div className="flex flex-wrap gap-3 mb-6">
                       {formData.colors.map(c => (
                         <span key={c} className="bg-[#FAF9F6] border border-[#0D1B38]/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            {c} <button type="button" onClick={() => removeColor(c)} className="opacity-30"><X size={12}/></button>
                         </span>
                       ))}
                    </div>
                    <input type="text" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={handleAddColor}
                      className="w-full bg-transparent border-b border-[#0D1B38]/5 py-4 text-[10px] font-black tracking-widest outline-none focus:border-[#0D1B38] transition-all uppercase"
                      placeholder="Add Color..."
                    />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-4 block">Fabric Heritage</label>
                    <input name="fabric" value={formData.fabric} onChange={handleChange} required
                       className="w-full bg-transparent border-b border-[#0D1B38]/5 py-4 text-[11px] font-black tracking-widest outline-none focus:border-[#0D1B38] transition-all uppercase"
                       placeholder="e.g. Pure Georgette"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ===== HERITAGE ORGANIZATION (SIDE PANEL) ===== */}
      <div className="w-full lg:w-96 space-y-10">
         <div className="bg-white p-12 rounded-[4rem] shadow-soft border border-[#0D1B38]/5 space-y-12 sticky top-32">
            <div>
               <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-4 block">Asset Valuation</label>
               <div className="flex items-center gap-4 border-b border-[#0D1B38]/10 py-4">
                  <span className="text-2xl font-serif text-[#0D1B38]/20">₹</span>
                  <input type="number" name="price" value={formData.price} onChange={handleChange}
                    className="w-full bg-transparent text-3xl font-serif outline-none placeholder:text-[#0D1B38]/5"
                    placeholder="PoA"
                  />
               </div>
            </div>

            <div>
               <label className="text-[10px] uppercase font-black tracking-[0.4em] text-[#0D1B38]/30 mb-4 block">Vault Category</label>
               <select name="category" value={formData.category} onChange={handleChange}
                 className="w-full bg-[#FAF9F6] border border-[#0D1B38]/5 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            <div className="pt-8 border-t border-[#0D1B38]/5 space-y-6">
               <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full transition-all relative ${formData.featured ? 'bg-[#0D1B38]' : 'bg-[#FAF9F6] border border-border'}`}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.featured ? 'left-6 bg-white' : 'left-1 bg-[#0D1B38]/20'}`} />
                     <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="hidden" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Highlight in Exhibition</span>
               </label>
            </div>

            <div className="pt-12">
               <button type="submit" disabled={loading}
                 className="w-full bg-[#0D1B38] text-white py-8 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:-translate-y-2 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                  {loading ? <Loader2 size={24} className="animate-spin" /> : (
                    <>
                       Synchronize <Check size={20} />
                    </>
                  )}
               </button>
               <button type="button" onClick={() => navigate('/admin/products')} className="w-full py-6 text-[9px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/20 hover:text-red-400 transition-colors">Discard Draft</button>
            </div>
         </div>
      </div>
    </form>
  );
};

export default AdminProductForm;
