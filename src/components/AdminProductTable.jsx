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
    <div className="p-24 text-center">
       <div className="w-10 h-10 border-2 border-[#0D1B38]/10 border-t-[#0D1B38] rounded-full animate-spin mx-auto mb-4"></div>
       <p className="text-xs font-medium text-[#0D1B38]/40">Loading Inventory...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#0D1B38]/10 overflow-hidden shadow-sm">
      
      {/* Search & Filter Bar */}
      <div className="p-6 border-b border-[#0D1B38]/5 flex flex-col md:flex-row justify-between items-center bg-[#FAF9F6] gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D1B38]/30" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#0D1B38]/15 rounded-xl text-sm outline-none focus:border-[#0D1B38] transition-all"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)} 
              className="w-full bg-white border border-[#0D1B38]/15 px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <Link 
          to="/admin/products/new" 
          className="w-full md:w-auto bg-[#0D1B38] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-black transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FAF9F6] text-xs font-semibold text-[#0D1B38]/50 border-b border-[#0D1B38]/5">
              <th className="px-8 py-4">Image</th>
              <th className="px-8 py-4">Product Name</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4">Price</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0D1B38]/5">
            {paginatedProducts.map((p) => (
              <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors group">
                <td className="px-8 py-4">
                  <div className="w-12 h-16 bg-[#F0EFEC] rounded-lg overflow-hidden border border-[#0D1B38]/5">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-8 py-4">
                  <p className="font-semibold text-[#0D1B38] text-sm">{p.name}</p>
                </td>
                <td className="px-8 py-4 text-xs text-[#0D1B38]/60 font-medium">{p.category}</td>
                <td className="px-8 py-4 text-sm font-medium text-[#0D1B38]">₹{p.price?.toLocaleString() || 'Not Set'}</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handeToggleVisibility(p.id, p.status)} className={`p-2 rounded-lg border ${p.status === 'active' ? 'bg-white text-[#0D1B38]' : 'bg-[#0D1B38] text-white'}`} title={p.status === 'active' ? 'Hide Product' : 'Make Active'}>
                      {p.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <Link to={`/admin/products/edit/${p.id}`} className="p-2 bg-white text-blue-600 rounded-lg border border-border" title="Edit"><Edit2 size={16} /></Link>
                    <button onClick={() => handleDuplicate(p) } className="p-2 bg-white text-green-600 rounded-lg border border-border" title="Duplicate"><Copy size={16} /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-white text-red-500 rounded-lg border border-border" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="md:hidden divide-y divide-[#0D1B38]/5">
        {paginatedProducts.map((p) => (
          <div key={p.id} className="p-6 flex gap-6 items-start">
             <div className="w-20 h-28 bg-black rounded-xl overflow-hidden shrink-0 border border-border">
                <img src={p.images?.find(img => img && img.trim() !== '') || 'https://via.placeholder.com/400'} alt={p.name} className="w-full h-full object-cover opacity-80" />
             </div>
             <div className="flex-1 min-w-0 space-y-4">
                <div>
                   <h4 className="font-semibold text-[#0D1B38] truncate">{p.name}</h4>
                   <p className="text-[10px] text-[#0D1B38]/40 mt-1 font-medium">{p.category} &bull; ₹{p.price?.toLocaleString() || 'Not Set'}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handeToggleVisibility(p.id, p.status)} className={`p-2.5 rounded-lg border ${p.status === 'active' ? 'bg-white text-[#0D1B38] border-[#0D1B38]/10' : 'bg-[#0D1B38] text-white'}`}>
                      {p.status === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
                   </button>
                   <Link to={`/admin/products/edit/${p.id}`} className="flex-1 flex items-center justify-center gap-2 bg-[#FAF9F6] text-[#0D1B38] py-2.5 rounded-lg text-xs font-semibold border border-[#0D1B38]/10">
                      <Edit2 size={12} /> Edit
                   </Link>
                   <button onClick={() => handleDelete(p.id, p.name)} className="p-2.5 text-red-500 bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#0D1B38]/5 flex items-center justify-between bg-[#FAF9F6]">
          <p className="text-xs font-medium text-[#0D1B38]/40">
            {processedProducts.length} Items Total
          </p>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-[#0D1B38]/10 rounded-lg disabled:opacity-20 shadow-sm transition-all hover:-translate-x-0.5">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black tracking-[0.4em] text-[#0D1B38]/40">{String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-[#0D1B38]/10 rounded-lg disabled:opacity-20 shadow-sm transition-all hover:translate-x-0.5">
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
