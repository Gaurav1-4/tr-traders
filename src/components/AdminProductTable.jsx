import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit2, Copy, Trash2, Eye, EyeOff, Search, 
  Filter, ArrowUpDown, ChevronLeft, ChevronRight, Package, Sparkles, Plus, Globe
} from 'lucide-react';
import { getProducts, deleteProduct, updateProduct, addProduct } from '../services/productService';
import { useToast } from './Toast';

const AdminProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(true);
      setProducts(data);
    } catch (error) {
      showToast('Inventory cloud sync error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently remove masterpiece "${name}"?`)) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        showToast('Inventory Updated');
      } catch (err) {
        showToast('Error deleting', 'error');
      }
    }
  };

  const handeToggleVisibility = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await updateProduct(id, { status: newStatus });
      setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast(`Masterpiece is now ${newStatus}`);
    } catch (err) { showToast('Sync error', 'error'); }
  };

  const handleDuplicate = async (product) => {
    try {
      const { id, ...rest } = product;
      const duplicatedData = {
        ...rest,
        name: `${product.name} (Copy)`,
        status: 'hidden', // Default to hidden for duplicated items
        createdAt: new Date().toISOString()
      };
      const newProduct = await addProduct(duplicatedData);
      setProducts([newProduct, ...products]);
      showToast('Masterpiece Duplicated & Hidden', 'success');
    } catch (err) {
      showToast('Duplication failed', 'error');
    }
  };

  const processedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [products, search, categoryFilter, sortConfig]);

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const paginatedProducts = processedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="p-24 text-center flex flex-col items-center">
       <Loader2Icon />
       <p className="text-[10px] uppercase font-black tracking-[0.5em] text-[#0D1B38]/30 mt-6">Indexing Heritage Inventory...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-[#0D1B38]/5 overflow-hidden flex flex-col transition-all duration-1000">
      
      {/* Search & Filter Bar - CURATED */}
      <div className="p-10 border-b border-[#0D1B38]/5 flex flex-col md:flex-row justify-between items-center bg-[#FAF9F6] gap-10">
        <div className="flex flex-col md:flex-row items-center gap-10 w-full md:w-auto">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0D1B38]/10 group-focus-within:text-[#0D1B38] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search Signature Collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-transparent border-b border-[#0D1B38]/10 text-[10px] font-black tracking-[0.2em] outline-none focus:border-[#0D1B38] transition-all uppercase placeholder:text-[#0D1B38]/10"
            />
          </div>
          
          <div className="flex gap-6 items-center">
             <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-2xl border border-[#0D1B38]/5 shadow-sm">
                <Filter size={14} className="text-[#0D1B38]/20" />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-[10px] font-black tracking-widest uppercase outline-none bg-transparent cursor-pointer">
                   {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>
        </div>

        <Link 
          to="/admin/products/new" 
          className="w-full md:w-auto bg-[#0D1B38] text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 hover:-translate-y-1"
        >
          <Plus size={18} /> Add New Piece
        </Link>
      </div>

      <div className="overflow-x-auto min-h-[500px] no-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#FAF9F6] text-[9px] uppercase tracking-[0.4em] text-[#0D1B38]/40 border-b border-[#0D1B38]/5">
              <th className="px-12 py-8 font-black w-40">Visual Representation</th>
              <th className="px-12 py-8 font-black">Design Nomenclature</th>
              <th className="px-12 py-8 font-black text-center">Heritage Tier</th>
              <th className="px-12 py-8 font-black">Valuation</th>
              <th className="px-12 py-8 font-black text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0D1B38]/5">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                  <td className="px-12 py-8">
                    <div className="relative w-24 h-32 bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#0D1B38]/5">
                      <img src={p.image || p.images?.find(img => img && img.trim() !== '') || 'https://via.placeholder.com/400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] opacity-90" />
                      {p.featured && (
                        <div className="absolute top-2 left-2 px-3 py-1 bg-white text-[#0D1B38] text-[8px] font-black uppercase tracking-widest rounded-full shadow-2xl">Featured</div>
                      )}
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="space-y-2">
                       <p className="font-serif text-xl text-[#0D1B38] italic font-light tracking-tight">{p.name}</p>
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/20 flex items-center gap-3">
                          <Sparkles size={10} className="text-primary"/> {p.fabric || 'Heritage Textile'} &bull; {p.id}
                       </p>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-center">
                    <span className="px-6 py-2 bg-[#FAF9F6] border border-[#0D1B38]/5 rounded-full text-[9px] font-black tracking-widest uppercase text-[#0D1B38]/40">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-12 py-8 font-serif text-xl text-[#0D1B38] italic">
                    {p.price ? `₹${p.price.toLocaleString()}` : <span className="opacity-20">Price on Request</span>}
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => handeToggleVisibility(p.id, p.status)} title="Toggle Visibility" className={`p-4 rounded-xl border transition-all shadow-sm ${p.status === 'active' ? 'bg-white text-[#0D1B38] border-[#0D1B38]/5' : 'bg-[#0D1B38] text-white border-transparent'}`}>
                        {p.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => handleDuplicate(p)} title="Duplicate Masterpiece" className="p-4 bg-white text-primary rounded-xl border border-[#0D1B38]/5 shadow-sm hover:bg-primary-light transition-all">
                        <Copy size={16} />
                      </button>
                      <Link to={`/admin/products/edit/${p.id}`} title="Edit Piece" className="p-4 bg-white text-blue-600 rounded-xl border border-[#0D1B38]/5 shadow-sm hover:bg-blue-50 transition-all">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} title="Remove Piece" className="p-4 bg-white text-red-400 rounded-xl border border-[#0D1B38]/5 shadow-sm hover:bg-red-50 hover:text-red-600 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-12 py-48 text-center">
                   <Package size={64} className="mx-auto text-[#0D1B38]/5 mb-8" strokeWidth={1} />
                   <p className="font-serif text-3xl italic font-light text-[#0D1B38]/10 uppercase tracking-[0.5em]">Collections are Empty</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - MINIMALIST */}
      {totalPages > 1 && (
        <div className="p-10 border-t border-[#0D1B38]/5 flex items-center justify-between bg-[#FAF9F6]">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#0D1B38]/20">
            Current EXHIBITION: {processedProducts.length} SIGNATURES
          </p>
          <div className="flex items-center gap-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 bg-white border border-[#0D1B38]/5 rounded-xl disabled:opacity-20 shadow-sm transition-all hover:-translate-x-1">
              <ChevronLeft size={18} />
            </button>
            <span className="text-[10px] font-black tracking-[0.4em] text-[#0D1B38]/40">{String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 bg-white border border-[#0D1B38]/5 rounded-xl disabled:opacity-20 shadow-sm transition-all hover:translate-x-1">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Loader2Icon = () => (
  <div className="w-12 h-12 border-2 border-[#0D1B38]/5 border-t-[#0D1B38] rounded-full animate-spin"></div>
);

export default AdminProductTable;
