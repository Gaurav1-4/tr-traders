import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tags, AlertCircle, Eye, ChevronRight, Plus, Database, ShoppingCart } from 'lucide-react';
import { getProducts } from '../../services/productService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, categories: 0, active: 0, attention: 0, recentProducts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const prodData = await getProducts(true);
        const uniqueCats = new Set(prodData.map(p => p.category)).size;
        const active = prodData.filter(p => p.status === 'active').length;
        const attention = prodData.filter(p => p.stock === 'low_stock' || p.stock === 'out_of_stock' || p.status === 'hidden').length;
        const recent = [...prodData].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
        setStats({ total: prodData.length, categories: uniqueCats, active, attention, recentProducts: recent });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-32">
      
      {/* Header - clean and simple */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#0D1B38]">Dashboard</h2>
        <div className="flex gap-3">
          <Link to="/" className="px-5 py-2.5 border border-[#0D1B38]/15 text-[#0D1B38] text-xs font-semibold rounded-lg hover:bg-[#0D1B38]/5 transition-all">
            View Live Site
          </Link>
          <Link to="/admin/products/new" className="px-5 py-2.5 bg-[#0D1B38] text-white text-xs font-semibold rounded-lg hover:bg-black transition-all flex items-center gap-2">
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        {[
          { label: 'Total Products', val: stats.total, icon: <Package size={18}/> },
          { label: 'Active', val: stats.active, icon: <Eye size={18}/> },
          { label: 'Categories', val: stats.categories, icon: <Tags size={18}/> },
          { label: 'Needs Attention', val: stats.attention, icon: <AlertCircle size={18}/> },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#0D1B38]/8 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#F0EFEC] text-[#0D1B38] rounded-xl">{kpi.icon}</div>
            </div>
            <p className="text-xs font-medium text-[#0D1B38]/40 mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-[#0D1B38]">{loading ? '–' : kpi.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-[#0D1B38]/8 lg:col-span-2 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#0D1B38]/5 flex justify-between items-center">
            <h3 className="font-semibold text-[#0D1B38]">Recent Products</h3>
            <Link to="/admin/products" className="text-xs font-medium text-[#0D1B38]/40 hover:text-[#0D1B38] transition-colors">
              View All →
            </Link>
          </div>
          <div>
            {loading ? (
              <div className="p-12 text-center text-sm text-[#0D1B38]/30">Loading...</div>
            ) : stats.recentProducts.length > 0 ? (
              <ul className="divide-y divide-[#0D1B38]/5">
                {stats.recentProducts.map((p) => (
                  <li key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#FAF9F6]/50 transition-colors">
                    <div className="w-12 h-16 bg-[#F0EFEC] rounded-lg overflow-hidden shrink-0">
                      <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0D1B38] text-sm truncate">{p.name}</p>
                      <p className="text-xs text-[#0D1B38]/30 mt-0.5">{p.category} · ₹{p.price?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                      {p.status === 'active' ? 'Active' : 'Hidden'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-sm text-[#0D1B38]/20">No products yet</div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="bg-[#0D1B38] rounded-2xl text-white p-8">
            <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
            <p className="text-sm text-white/50 mb-6">Contact your design consultant for support.</p>
            <button className="w-full bg-white text-[#0D1B38] py-3 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-all">
              Get Support
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#0D1B38]/8 p-6">
            <h3 className="font-semibold text-[#0D1B38] mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/admin/products" className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF9F6] transition-all group">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-[#0D1B38]/30" />
                  <span className="text-sm font-medium text-[#0D1B38]/70">All Products</span>
                </div>
                <ChevronRight size={14} className="text-[#0D1B38]/15 group-hover:text-[#0D1B38]/40" />
              </Link>
              <Link to="/admin/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF9F6] transition-all group">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={16} className="text-[#0D1B38]/30" />
                  <span className="text-sm font-medium text-[#0D1B38]/70">Store Settings</span>
                </div>
                <ChevronRight size={14} className="text-[#0D1B38]/15 group-hover:text-[#0D1B38]/40" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
