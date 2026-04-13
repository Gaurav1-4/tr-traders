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
    <div className="bg-white rounded-[3rem] shadow-soft border border-[#0D1B38]/5 overflow-hidden flex flex-col transition-all duration-1000">
      
      {/* Search & Filter Bar - PROFESSIONAL */}
      <div className="p-8 border-b border-[#0D1B38]/5 flex flex-col md:flex-row justify-between items-center bg-[#FAF9F6] gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0D1B38]/20 group-focus-within:text-[#0D1B38] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search Signature Collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-transparent border-b-2 border-[#0D1B38]/5 text-[11px] font-black tracking-[0.1em] outline-none focus:border-[#0D1B38] transition-all uppercase placeholder:text-[#0D1B38]/10"
            />
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[#0D1B38]/5 shadow-sm">
                <Filter size={14} className="text-[#0D1B38]/20" />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-[10px] font-black tracking-widest uppercase outline-none bg-transparent">
                   {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>
        </div>

        <Link 
          to="/admin/products/new" 
          className="bg-[#0D1B38] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center gap-3"
        >
          <Plus size={16} /> Add New Piece
        </Link>
      </div>

      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#FAF9F6] text-[9px] uppercase tracking-[0.3em] text-[#0D1B38]/40 border-b border-[#0D1B38]/5">
              <th className="px-8 py-6 font-black w-32">Visual</th>
              <th className="px-8 py-6 font-black">Design Name</th>
              <th className="px-8 py-6 font-black">Heritage Category</th>
              <th className="px-8 py-6 font-black">Valuation</th>
              <th className="px-8 py-6 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0D1B38]/5">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="relative w-20 h-24 bg-black rounded-2xl overflow-hidden shadow-xl border border-[#0D1B38]/5">
                      <img src={p.image || p.images?.find(img => img && img.trim() !== '') || 'https://via.placeholder.com/400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-serif text-lg text-[#0D1B38] mb-1 italic">{p.name}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/30 flex items-center gap-2">
                       <Sparkles size={10}/> Heritage Collection
                    </p>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black tracking-widest uppercase opacity-60">
                    {p.category}
                  </td>
                  <td className="px-8 py-6 font-serif text-lg text-[#0D1B38]">
                    {p.price ? `₹${p.price.toLocaleString()}` : <span className="opacity-20 italic">PoA</span>}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handeToggleVisibility(p.id, p.status)} title="Toggle Visibility" className="p-3 bg-white rounded-xl border border-[#0D1B38]/5 shadow-sm hover:scale-110 transition-all">
                        {p.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => handleDuplicate(p)} title="Duplicate Piece" className="p-3 bg-white rounded-xl border border-[#0D1B38]/5 shadow-sm hover:scale-110 transition-all text-amber-600">
                        <Copy size={16} />
                      </button>
                      <Link to={`/admin/products/edit/${p.id}`} title="Edit Piece" className="p-3 bg-white rounded-xl border border-[#0D1B38]/5 shadow-sm hover:scale-110 transition-all text-blue-500">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} title="Delete Piece" className="p-3 bg-white rounded-xl border border-[#0D1B38]/5 shadow-sm hover:scale-110 transition-all text-red-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-32 text-center">
                   <Package size={48} className="mx-auto text-[#0D1B38]/10 mb-6" strokeWidth={1} />
                   <p className="font-serif text-4xl italic font-light opacity-10 uppercase tracking-[0.4em]">Empty Exhibition</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - SLEEK */}
      {totalPages > 1 && (
        <div className="p-8 border-t border-[#0D1B38]/5 flex items-center justify-between bg-[#FAF9F6]">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/20">
            {processedProducts.length} Pieces Authenticated
          </p>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 bg-white border border-[#0D1B38]/5 rounded-xl disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black tracking-widest text-[#0D1B38]/50">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 bg-white border border-[#0D1B38]/5 rounded-xl disabled:opacity-30">
              <ChevronRight size={16} />
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
