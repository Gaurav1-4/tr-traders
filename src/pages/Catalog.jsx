import { useState, useEffect, useMemo } from 'react';
import { Filter, Grid3X3, List, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { getProducts } from '../services/productService';

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

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

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
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'Price High-Low':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'Popular':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'Newest First':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [products, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Page Header */}
      <div className="bg-white border-b border-border py-8 md:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="text-2xl md:text-4xl font-serif font-normal text-text animate-fade-in">
            Our Collection
          </h1>
          <div className="w-10 h-[1px] bg-text/20 mx-auto"></div>
          <p className="text-muted tracking-wide text-sm font-light">
            Pieces crafted with elegance and tradition
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toolbar: Grid toggle | Count | Sort */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
          {/* Left: Grid toggles + mobile filter */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setGridCols(3)}
              className={`p-1.5 transition-colors ${gridCols === 3 ? 'text-text' : 'text-muted hover:text-text'}`}
              aria-label="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button 
              onClick={() => setGridCols(2)}
              className={`p-1.5 transition-colors ${gridCols === 2 ? 'text-text' : 'text-muted hover:text-text'}`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-text text-sm uppercase tracking-wider border border-border px-4 py-2 ml-2 hover:border-text transition-colors"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>

          {/* Center: product count */}
          <span className="text-sm text-muted font-medium hidden sm:block">
            <span className="text-text font-semibold">{filteredProducts.length}</span> products
          </span>

          {/* Right: Sort + Search */}
          <div className="flex items-center gap-4">
            <div className="w-48 sm:w-56">
              <SearchBar onSearch={setSearchQuery} />
            </div>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="appearance-none bg-transparent border border-border text-text text-sm px-4 py-2 pr-8 cursor-pointer hover:border-text transition-colors outline-none uppercase tracking-wider"
              >
                <option>Newest First</option>
                <option>Price Low-High</option>
                <option>Price High-Low</option>
                <option>Popular</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters}
            isOpen={isMobileFilterOpen}
            setIsOpen={setIsMobileFilterOpen}
          />

          {/* Product Grid */}
          <div className="flex-grow min-w-0">
            {loading ? (
              <div className={`grid gap-5 ${gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <SkeletonLoader count={6} />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-x-5 gap-y-10 ${
                gridCols === 3 
                  ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/40">
                  <Filter size={32} />
                </div>
                <h3 className="text-xl font-serif text-text">No pieces found</h3>
                <p className="text-muted max-w-sm text-sm">
                  We couldn't find any items matching your current filters. Try adjusting your search.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ category: 'All', fabric: 'All', sort: 'Newest First' });
                  }}
                  className="border border-text text-text px-8 py-3 uppercase tracking-widest text-[11px] font-bold hover:bg-text hover:text-white transition-colors"
                >
                  Clear All Filters
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
