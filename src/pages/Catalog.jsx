import { useState, useEffect, useMemo } from 'react';
import { Filter, Grid3X3, List, ChevronDown, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts, HERITAGE_COLLECTION } from '../services/productService';
import { db, isMockMode } from '../services/firebase';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    fabric: 'All',
    sort: 'Newest First'
  });

  // REAL-TIME CATALOG SYNC (NEVER EMPTY)
  useEffect(() => {
    if (isMockMode) {
      setProducts(HERITAGE_COLLECTION.map((p, i) => ({ ...p, id: `h${i}` })));
      setLoading(false);
      return;
    }

    const q = query(collection(db, "products"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to memory if cloud is empty so catalog looks professional
        setProducts(HERITAGE_COLLECTION.map((p, i) => ({ ...p, id: `h${i}` })));
      } else {
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetched);
      }
      setLoading(false);
    }, () => {
      // Emergency memory fallback on error
      setProducts(HERITAGE_COLLECTION.map((p, i) => ({ ...p, id: `h${i}` })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Active status only for customer view
    result = result.filter(p => p.status === 'active');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q))
      );
    }

    if (filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.fabric !== 'All') {
      result = result.filter(p => p.fabric === filters.fabric);
    }

    switch (filters.sort) {
      case 'Price Low-High':
        result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'Price High-Low':
        result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'Popular':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'Newest First':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return result;
  }, [products, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Page Header */}
      <div className="bg-white border-b border-border py-12 md:py-20 overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-10 text-center space-y-6 relative z-10">
          <h1 className="text-4xl md:text-7xl font-serif font-light text-text animate-fade-in tracking-tighter italic">
            Heritage Gallery
          </h1>
          <div className="w-16 h-[1px] bg-text/20 mx-auto"></div>
          <p className="text-[#0D1B38]/30 uppercase tracking-[0.6em] text-[10px] md:text-[11px] font-black">
            Couture Tradition . Digital Exhibition
          </p>
        </div>
        <Sparkles className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-[0.03] scale-[8]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-10">
          <div className="flex items-center gap-6 order-2 md:order-1">
             <div className="flex items-center gap-2 border border-border/40 rounded-full px-4 py-2 bg-white/50">
               <button onClick={() => setGridCols(3)} className={`p-2 transition-all ${gridCols === 3 ? 'text-primary' : 'text-gray-300 hover:text-text'}`}><Grid3X3 size={18} /></button>
               <button onClick={() => setGridCols(2)} className={`p-2 transition-all ${gridCols === 2 ? 'text-primary' : 'text-gray-300 hover:text-text'}`}><List size={18} /></button>
             </div>
             <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#0D1B38]/30">
               <span className="text-[#0D1B38] font-black">{filteredProducts.length}</span> Masterpieces
             </span>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto order-1 md:order-2">
             <div className="flex-grow md:w-64">
               <SearchBar onSearch={setSearchQuery} />
             </div>
             <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="appearance-none bg-white border border-border/40 text-[10px] font-black uppercase tracking-widest px-8 py-3 pr-12 cursor-pointer outline-none rounded-full"
                >
                  <option>Newest First</option>
                  <option>Price Low-High</option>
                  <option>Price High-Low</option>
                  <option>Popular</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="lg:w-72">
             <FilterSidebar 
               filters={filters} setFilters={setFilters}
               isOpen={isMobileFilterOpen} setIsOpen={setIsMobileFilterOpen}
             />
          </div>

          {/* Product Grid */}
          <div className="flex-grow min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                <SkeletonLoader count={6} />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-x-10 gap-y-24 ${
                gridCols === 3 ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-48 text-center bg-white rounded-[4rem] border border-dashed border-[#0D1B38]/5">
                <Sparkles size={40} className="text-primary/10 mb-8" />
                <h3 className="text-2xl font-serif italic mb-4">No Pieces Found</h3>
                <p className="text-muted text-[11px] uppercase tracking-widest mb-10">Adjust your criteria to reveal other masterpieces.</p>
                <button
                  onClick={() => { setSearchQuery(''); setFilters({ category: 'All', fabric: 'All', sort: 'Newest First' }); }}
                  className="bg-[#0D1B38] text-white px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95"
                >
                  Clear Exhibition Store
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
