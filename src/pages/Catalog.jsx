import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid3X3, List, ChevronDown, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts, HERITAGE_COLLECTION } from '../services/productService';
import { db, isMockMode } from '../services/firebase';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    fabric: 'All',
    color: 'All',
    sort: 'Newest First'
  });

  // Sync category filter with URL params (from Navbar clicks)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setFilters(prev => ({ ...prev, category: cat }));
  }, [searchParams]);

  // UNIFIED CATALOG SYNC (NEVER EMPTY)
  useEffect(() => {
    if (isMockMode) { setProducts(HERITAGE_COLLECTION); setLoading(false); return; }
    const q = query(collection(db, "products"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProducts(HERITAGE_COLLECTION);
      } else {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoading(false);
    }, () => {
      setProducts(HERITAGE_COLLECTION);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Professional Filter: Always active, case-insensitive mapping
    result = result.filter(p => !p.status || p.status === 'active');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q))
      );
    }

    if (filters.category !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.fabric !== 'All') {
      result = result.filter(p => p.fabric?.toLowerCase() === filters.fabric.toLowerCase());
    }

    if (filters.color !== 'All') {
      result = result.filter(p => 
        p.colors && p.colors.some(c => 
          c.toLowerCase().includes(filters.color.toLowerCase())
        )
      );
    }

    switch (filters.sort) {
      case 'Price Low-High': result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)); break;
      case 'Price High-Low': result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)); break;
      case 'Popular': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      case 'Newest First':
      default: result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
    }

    return result;
  }, [products, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-white border-b border-border py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto px-10 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif font-light text-text tracking-tighter italic">
            The Collection
          </h1>
          <div className="w-12 h-px bg-text/10 mx-auto"></div>
          <p className="text-[#0D1B38]/30 uppercase tracking-[0.4em] text-[10px] md:text-[11px] font-black">
            Curated Showroom . Exclusive Access
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-12 pb-48">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-10">
          <div className="flex items-center gap-8 order-2 md:order-1">
             <div className="flex items-center gap-2 border border-border/40 rounded-full px-4 py-2 bg-white/50 shadow-sm">
               <button onClick={() => setGridCols(3)} className={`p-2 transition-all ${gridCols === 3 ? 'text-[#0D1B38]' : 'text-gray-300'}`}><Grid3X3 size={18} /></button>
               <button onClick={() => setGridCols(2)} className={`p-2 transition-all ${gridCols === 2 ? 'text-[#0D1B38]' : 'text-gray-300'}`}><List size={18} /></button>
             </div>
             <span className="text-[10px] uppercase font-black tracking-widest text-[#0D1B38]/30">
               <span className="text-[#0D1B38]">{filteredProducts.length}</span> Masterpieces
             </span>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto order-1 md:order-2">
             <div className="flex-grow md:w-64"><SearchBar onSearch={setSearchQuery} /></div>
             <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="appearance-none bg-white border border-border/40 text-[10px] font-black uppercase tracking-widest px-8 py-3.5 pr-12 cursor-pointer outline-none rounded-sm"
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

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-72">
             <FilterSidebar filters={filters} setFilters={setFilters} isOpen={isMobileFilterOpen} setIsOpen={setIsMobileFilterOpen} />
          </div>
          <div className="flex-grow min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-12"><SkeletonLoader count={6} /></div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-x-12 gap-y-32 ${gridCols === 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="py-48 text-center bg-white border border-dashed border-[#0D1B38]/5 rounded-[4rem]">
                <h3 className="text-3xl font-serif italic mb-6">No pieces match your search</h3>
                <button onClick={() => { setSearchQuery(''); setFilters({ category: 'All', fabric: 'All', color: 'All', sort: 'Newest First' }); }} className="text-[10px] font-black uppercase tracking-[0.4em] bg-[#0D1B38] text-white px-12 py-4 shadow-2xl transition-all active:scale-95">Reset Exhibition</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
