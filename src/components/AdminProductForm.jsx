import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UploadCloud, X, Image as ImageIcon, Tag, DollarSign, 
  Archive, LayoutList, Check, ArrowLeft, Loader2, Sparkles, Globe, Layers
} from 'lucide-react';
import { useToast } from './Toast';
import { addProduct, updateProduct } from '../services/productService';

const DEFAULT_CATEGORIES = ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Organza', 'Banarasi', 'Linen', 'Wool', 'Rayon', 'Velvet'];

const AdminProductForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { db, isMockMode } = await import('../services/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().categories && docSnap.data().categories.length > 0) {
            setCategories(docSnap.data().categories);
          }
        }
      } catch (err) { console.error(err); }
    };
    loadCategories();
  }, []);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Cotton',
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
        <div className="flex-1 space-y-12">
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-[#0D1B38]/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0D1B38] opacity-10"></div>
             
             <div className="space-y-12">
                <div className="relative">
                   <label className="text-[10px] uppercase font-black tracking-widest text-[#0D1B38]/40 mb-3 block">Product Name</label>
                   <input 
                      required name="name" value={formData.name} onChange={handleChange}
                      className="w-full bg-[#FAF9F6] px-6 py-4 rounded-xl text-xl font-serif italic outline-none border border-transparent focus:border-[#0D1B38]/10 transition-all"
                      placeholder="e.g. Royal Blue Banarasi Saree"
                   />
                </div>

                <div className="relative">
                   <label className="text-[10px] uppercase font-black tracking-widest text-[#0D1B38]/40 mb-3 block">Description / Product Story</label>
                   <textarea 
                      required name="description" rows="4" value={formData.description} onChange={handleChange}
                      className="w-full bg-[#FAF9F6] px-6 py-4 rounded-xl text-[14px] font-light leading-relaxed outline-none border border-transparent focus:border-[#0D1B38]/10 transition-all resize-none"
                      placeholder="Tell the story of this dress... what makes it special?"
                   />
                </div>
             </div>
          </div>

          {/* Photos/Videos */}
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-[#0D1B38]/5">
             <div className="mb-10 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-[#0D1B38]/40 uppercase">Product Media (Images or Videos)</span>
                <ImageIcon className="opacity-10" size={18} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="space-y-4">
                     <div className="aspect-[3/4] bg-[#FAF9F6] rounded-2xl overflow-hidden border border-[#0D1B38]/5 relative group">
                        {url ? (
                          <>
                             {url.toLowerCase().includes('mp4') || url.toLowerCase().includes('webm') || url.toLowerCase().includes('dropbox.com') ? (
                               <video src={url} key={url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                             ) : (
                               <img src={url} alt="Preview" className="w-full h-full object-cover" />
                             )}
                             <button type="button" onClick={() => handleImageUrlChange(idx, '')} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors"><X size={12}/></button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center group-hover:bg-[#0D1B38]/5 transition-colors">
                             <UploadCloud className="opacity-10 mb-2" size={24} />
                             <span className="text-[8px] uppercase font-black tracking-widest opacity-20">Slot {idx+1} Empty</span>
                          </div>
                        )}
                     </div>
                     <input 
                        type="url" value={url} onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        placeholder="PASTE LINK HERE"
                        className="w-full bg-[#FAF9F6] px-4 py-3 rounded-xl text-[9px] font-black tracking-widest outline-none border border-transparent focus:border-[#0D1B38]/10 transition-all"
                     />
                  </div>
                ))}
             </div>
             <p className="text-[8px] text-[#0D1B38]/20 mt-6 uppercase font-black tracking-widest text-center">Tip: Use Dropbox links ending in ?raw=1 for best results</p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-[380px] space-y-8">
           <div className="bg-[#0D1B38] p-10 rounded-[2.5rem] text-white shadow-2xl space-y-12">
              <div>
                 <label className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-4 block">Price (Rupees)</label>
                 <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <span className="text-2xl font-serif text-white/20 italic">₹</span>
                    <input type="number" name="price" value={formData.price} onChange={handleChange}
                      className="w-full bg-transparent text-3xl font-serif outline-none placeholder:text-white/5"
                      placeholder="0.00"
                    />
                 </div>
              </div>

              <div className="space-y-8">
                <div className="group">
                   <label className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-3 block">Select Category</label>
                   <select name="category" value={formData.category} onChange={handleChange}
                     className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all">
                      {categories.map(c => <option key={c} value={c} className="bg-[#0D1B38] text-white">{c}</option>)}
                   </select>
                </div>

                <div className="group">
                   <label className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-3 block">Fabric Type (Material)</label>
                   <input name="fabric" value={formData.fabric} onChange={handleChange} required
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all"
                      placeholder="e.g. Pure Silk / Chiffon"
                   />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                 <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Show on Home Page?</span>
                    <div className={`w-12 h-6 rounded-full transition-all relative ${formData.featured ? 'bg-white' : 'bg-white/10'}`}>
                       <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.featured ? 'left-7 bg-[#0D1B38]' : 'left-1 bg-white/20'}`} />
                       <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="hidden" />
                    </div>
                 </label>
              </div>

              <div className="pt-8 flex flex-col gap-4">
                 <button type="submit" disabled={loading}
                   className="w-full bg-white text-[#0D1B38] py-6 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                         Save & Publish <Check size={16} />
                      </>
                    )}
                 </button>
                 <button type="button" onClick={() => navigate('/admin/products')} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
