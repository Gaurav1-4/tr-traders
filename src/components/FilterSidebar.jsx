import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronUp } from 'lucide-react';

const DEFAULT_CATEGORIES = ['All', 'Cotton', 'Silk', 'Georgette', 'Chiffon', 'Organza', 'Banarasi', 'Linen', 'Wool', 'Rayon', 'Velvet'];
const FABRICS = ['All', 'Cotton', 'Silk', 'Georgette', 'Chiffon', 'Linen', 'Wool', 'Banarasi'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Red', value: '#8b2252' },
  { name: 'Blue', value: '#1e40af' },
  { name: 'Green', value: '#166534' },
  { name: 'Pink', value: '#e8b4b8' },
  { name: 'Yellow', value: '#d4a017' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'White', value: '#f5f0e8' },
  { name: 'Purple', value: '#7e14ff' },
];
const SORTS = ['Newest First', 'Price Low-High', 'Price High-Low', 'Popular'];

const FilterSection = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 py-4">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-text">{title}</span>
        <ChevronUp size={16} className={`text-muted transition-transform duration-200 ${open ? '' : 'rotate-180'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[400px] mt-4' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
};

const FilterSidebar = ({ filters, setFilters, isOpen, setIsOpen }) => {
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
            setCategories(['All', ...docSnap.data().categories]);
          }
        }
      } catch (err) { console.error(err); }
    };
    loadCategories();
    window.addEventListener('settingsUpdated', loadCategories);
    return () => window.removeEventListener('settingsUpdated', loadCategories);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      fabric: 'All',
      sort: 'Newest First'
    });
  };

  const SidebarContent = () => (
    <div>
      {/* Mobile header */}
      <div className="flex items-center justify-between lg:hidden pb-4 mb-4 border-b border-border">
        <h2 className="text-lg font-serif font-medium text-text">Filters</h2>
        <button onClick={() => setIsOpen(false)} className="text-muted hover:text-text p-1">
          <X size={20} />
        </button>
      </div>

      {/* Price */}
      <FilterSection title="Price" defaultOpen={true}>
        <div className="space-y-2">
          {[
            { label: 'Under ₹1,000', val: '0-1000' },
            { label: '₹1,000 – ₹2,500', val: '1000-2500' },
            { label: '₹2,500 – ₹5,000', val: '2500-5000' },
            { label: 'Above ₹5,000', val: '5000+' },
          ].map(opt => (
            <label key={opt.val} className="flex items-center gap-3 cursor-pointer group py-1">
              <input type="checkbox" className="w-4 h-4 accent-[#0D1B38] rounded-sm" />
              <span className="text-sm text-muted group-hover:text-text transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Discounts */}
      <FilterSection title="Discounts">
        <div className="space-y-2">
          {['10% and above', '20% and above', '30% and above', '50% and above'].map(d => (
            <label key={d} className="flex items-center gap-3 cursor-pointer group py-1">
              <input type="checkbox" className="w-4 h-4 accent-[#0D1B38] rounded-sm" />
              <span className="text-sm text-muted group-hover:text-text transition-colors">{d}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category" defaultOpen={true}>
        <div className="space-y-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilterChange('category', cat)}
              className={`block w-full text-left py-1.5 text-sm transition-colors ${
                filters.category === cat ? 'text-text font-medium' : 'text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              className="size-pill-filter"
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3">
          {COLORS.map(c => (
            <button
              key={c.name}
              title={c.name}
              className="filter-color-swatch"
              style={{ backgroundColor: c.value, border: c.name === 'White' ? '1px solid #d4c5b0' : undefined }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Fabric */}
      <FilterSection title="Fabric">
        <div className="space-y-1">
          {FABRICS.map(fabric => (
            <button
              key={fabric}
              onClick={() => handleFilterChange('fabric', fabric)}
              className={`block w-full text-left py-1.5 text-sm transition-colors ${
                filters.fabric === fabric ? 'text-text font-medium' : 'text-muted hover:text-text'
              }`}
            >
              {fabric}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Clear */}
      <button
        onClick={clearFilters}
        className="w-full mt-6 py-3 border border-border text-text text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-text hover:bg-text hover:text-white transition-all"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[240px] flex-shrink-0">
        <div className="sticky top-[160px]">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex items-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full bg-white h-[85vh] rounded-t-2xl shadow-2xl flex flex-col animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="p-6 overflow-y-auto flex-grow mt-4 pb-32">
              <SidebarContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-white flex gap-4">
              <button onClick={clearFilters} className="flex-1 py-3 border border-text text-text uppercase tracking-widest text-[11px] font-semibold">
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} className="flex-[2] py-3 bg-[#0D1B38] text-white uppercase tracking-widest text-[11px] font-semibold">
                Apply Filters
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
