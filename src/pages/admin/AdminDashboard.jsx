import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Tags, 
  AlertCircle, 
  Plus, 
  TrendingUp, 
  Eye, 
  ShoppingCart,
  MessageCircle,
  ChevronRight,
  Database
} from 'lucide-react';
import { getProducts } from '../../services/productService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    total: 0, 
    categories: 0,
    active: 0,
    attention: 0,
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const prodData = await getProducts(true);
        const uniqueCats = new Set(prodData.map(p => p.category)).size;
        
        const active = prodData.filter(p => p.status === 'active').length;
        const attention = prodData.filter(p => p.stock === 'low_stock' || p.stock === 'out_of_stock' || p.status === 'hidden').length;
        
        // Sort by newest for recent activity simulation
        const recent = [...prodData].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);

        setStats({ 
          total: prodData.length, 
          categories: uniqueCats,
          active,
          attention,
          recentProducts: recent
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-10 pt-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-7xl font-serif font-light italic tracking-tight text-[#0D1B38] mb-6">Studio Analytics</h2>
          <div className="w-16 h-px bg-[#0D1B38]/20 mb-6"></div>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-black text-[#0D1B38]/30 italic">Real-time Exhibition Pulse / Global Inventory Sync</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="px-8 py-4 border border-[#0D1B38]/10 text-[#0D1B38]/40 hover:text-[#0D1B38] hover:border-[#0D1B38] transition-all text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            Live Site
          </Link>
          <Link 
            to="/admin/products/new" 
            className="bg-[#0D1B38] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all"
          >
            Add Design
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
        {[
          { label: 'Total Designs', val: stats.total, icon: <Package size={20}/>, change: '+4 Today' },
          { label: 'Active in Showroom', val: stats.active, icon: <Eye size={20}/>, change: 'Live' },
          { label: 'Vault Categories', val: stats.categories, icon: <Tags size={20}/>, change: 'Curated' },
          { label: 'Focus Required', val: stats.attention, icon: <AlertCircle size={20}/>, change: 'Action' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-[#0D1B38]/5 group transition-all duration-700 hover:-translate-y-2">
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-[#FAF9F6] text-[#0D1B38] rounded-2xl group-hover:bg-[#0D1B38] group-hover:text-white transition-all duration-500">
                {kpi.icon}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-green-600/60">{kpi.change}</span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-[#0D1B38]/20 mb-2">{kpi.label}</p>
            <h3 className="text-4xl font-serif italic text-[#0D1B38]">{loading ? '-' : kpi.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-48">
        {/* Recent Activity */}
        <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-[#0D1B38]/5 lg:col-span-2 overflow-hidden">
          <div className="p-10 border-b border-[#0D1B38]/5 flex justify-between items-center bg-[#FAF9F6]/30">
            <h3 className="font-serif italic text-xl text-[#0D1B38]">Recent Showroom Additions</h3>
            <Link to="/admin/products" className="text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/30 hover:text-[#0D1B38] transition-colors">
              Full Archive
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-20 text-center text-[10px] uppercase font-black tracking-widest text-[#0D1B38]/10">Fetching Vault...</div>
            ) : stats.recentProducts.length > 0 ? (
              <ul className="divide-y divide-[#0D1B38]/5">
                {stats.recentProducts.map((p) => (
                  <li key={p.id} className="p-8 hover:bg-[#FAF9F6]/50 flex items-center gap-8 transition-colors">
                    <div className="w-16 h-20 bg-black rounded-xl overflow-hidden shadow-xl border border-white/5 shrink-0">
                      <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-lg text-[#0D1B38] italic truncate">{p.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#0D1B38]/20 mt-1">{p.category} &bull; {p.fabric}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#FAF9F6] border border-[#0D1B38]/5">
                        {p.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-20 text-center">
                <Package size={40} className="mx-auto text-[#0D1B38]/5 mb-6" />
                <p className="text-[10px] uppercase font-black tracking-widest text-[#0D1B38]/20">Archive Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Studio Assistance */}
        <div className="space-y-12">
          <div className="bg-[#0D1B38] rounded-[3rem] shadow-2xl text-white p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 transition-transform duration-1000 group-hover:scale-125"></div>
            <div className="relative z-10">
              <h3 className="font-serif text-3xl italic font-light mb-6">Concierge Support</h3>
              <p className="text-[12px] font-light text-white/50 mb-10 leading-relaxed uppercase tracking-widest">
                Access your dedicated design consultant for studio optimization and heritage scaling.
              </p>
              <button className="w-full bg-white text-[#0D1B38] py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">
                Speak with Agent
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-[#0D1B38]/5 p-10">
            <h3 className="font-serif italic text-xl text-[#0D1B38] mb-10">Studio Quicklinks</h3>
            <div className="space-y-4">
              <Link to="/admin/products" className="flex items-center justify-between p-6 rounded-2xl bg-[#FAF9F6] border border-transparent hover:border-[#0D1B38]/10 hover:bg-white transition-all group">
                <div className="flex items-center gap-6">
                  <div className="text-[#0D1B38]/30 group-hover:text-primary transition-colors">
                    <Database size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Master Archive</span>
                </div>
                <ChevronRight size={14} className="text-[#0D1B38]/10" />
              </Link>
              <Link to="/admin/settings" className="flex items-center justify-between p-6 rounded-2xl bg-[#FAF9F6] border border-transparent hover:border-[#0D1B38]/10 hover:bg-white transition-all group">
                <div className="flex items-center gap-6">
                  <div className="text-[#0D1B38]/30 group-hover:text-primary transition-colors">
                    <ShoppingCart size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Studio Settings</span>
                </div>
                <ChevronRight size={14} className="text-[#0D1B38]/10" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
