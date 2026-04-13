import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../services/productService';
import ImageGallery from '../components/ImageGallery';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { MessageCircle, Share2, Heart, ShieldCheck, Truck, ArrowLeft, Ruler } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [whatsappNumber, setWhatsappNumber] = useState('919208275274');
  const [storeName, setStoreName] = useState('TR TRADERS');

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
        const allProducts = await getProducts();
        setRelatedProducts(allProducts.filter(p => p.category === data?.category && p.id !== id).slice(0, 4));

        // Load Settings
        const savedSettings = localStorage.getItem('tr_traders_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
          if (parsed.storeName) setStoreName(parsed.storeName);
        }

        // Cloud sync
        const { db, isMockMode } = await import('../services/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        if (!isMockMode) {
          const docRef = doc(db, 'settings', 'global');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const settingsData = docSnap.data();
            if (settingsData.whatsappNumber) setWhatsappNumber(settingsData.whatsappNumber);
            if (settingsData.storeName) setStoreName(settingsData.storeName);
          }
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="min-h-screen bg-bg pt-40 px-10"><SkeletonLoader count={1} className="h-96" /></div>;

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <h2 className="text-3xl font-serif mb-8 italic">Piece Not Found</h2>
        <Link to="/catalog" className="text-[#0D1B38] font-black uppercase tracking-[0.4em] text-[10px]">Return to Gallery</Link>
      </div>
    </div>
  );

  const saved = isInWishlist(product.id);
  const waMessage = `Hi ${storeName}! I am interested in your ${product.name} (ID: ${product.id}). Can you provide more details?`;
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen bg-bg pb-32 pt-24 md:pt-40">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* SIMPLE BREADCRUMB */}
        <Link to="/catalog" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/30 hover:text-[#0D1B38] transition-all mb-16">
          <ArrowLeft size={16} /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-start">
          
          {/* IMAGE PERFORMANCE GALLERY */}
          <div className="lg:col-span-12 xl:col-span-7">
            <ImageGallery images={product.images?.slice(0, 3)} />
          </div>

          {/* RAZOR-SHARP SPECIFICATION SHEET */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col pt-4">
            <div className="space-y-10 border-b border-[#0D1B38]/5 pb-12 mb-12">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#0D1B38]/20">{product.category}</span>
                     <button onClick={() => toggleWishlist(product.id)} className={`transition-all ${saved ? 'text-red-500' : 'text-[#0D1B38]/10 hover:text-red-400'}`}>
                        <Heart size={24} className={saved ? 'fill-red-500' : ''} />
                     </button>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-serif font-light text-[#0D1B38] tracking-tighter italic leading-none">{product.name}</h1>
               </div>

               <div className="flex items-center justify-between">
                  {product.price ? (
                    <p className="text-3xl font-serif text-[#0D1B38] italic italic tracking-tighter">₹{product.price.toLocaleString('en-IN')}</p>
                  ) : (
                    <p className="text-xl font-serif italic text-muted/40">Price on Request</p>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0D1B38]/30 px-6 py-2 border border-[#0D1B38]/5 rounded-full">{product.fabric || 'Heritage Silk'}</span>
               </div>
            </div>

            {/* DESCRIPTION & DEETS */}
            <div className="space-y-12 mb-16">
               <p className="text-[#0D1B38]/50 text-[14px] leading-relaxed max-w-lg font-light">
                 {product.description || "A masterfully tailored signature piece from our collection. Blending cultural heritage with modern silhouettes."}
               </p>

               {/* REMOVED SIZE SELECTION AS PRODUCTS ARE UNSTITCHED */}
            </div>

            {/* PRIMARY BUSINESS ACTION */}
            <div className="space-y-8">
               <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full h-20 bg-[#0D1B38] text-white flex items-center justify-center gap-6 group hover:translate-y-[-4px] active:translate-y-0 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(13,27,56,0.3)] hover:shadow-[0_45px_75px_-20px_rgba(13,27,56,0.4)]">
                  <MessageCircle size={24} className="group-hover:scale-125 transition-transform duration-500" />
                  <span className="text-[12px] font-black uppercase tracking-[0.5em]">Direct Inquiry</span>
               </a>
               
               <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-4 text-[#0D1B38]/20">
                     <ShieldCheck size={20} />
                     <span className="text-[9px] uppercase font-black tracking-widest">Quality Assurance</span>
                  </div>
                  <div className="flex items-center gap-4 text-[#0D1B38]/20">
                     <Truck size={20} />
                     <span className="text-[9px] uppercase font-black tracking-widest">Pan-India Freight</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RELATED Curation */}
        {relatedProducts.length > 0 && (
          <div className="mt-64 border-t border-[#0D1B38]/5 pt-32">
            <div className="flex items-baseline justify-between mb-20">
               <h2 className="text-4xl md:text-6xl font-serif font-light text-[#0D1B38] tracking-tighter italic">Recommended</h2>
               <Link to="/catalog" className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0D1B38]/30 hover:text-[#0D1B38]">See Full Gallery</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
              {relatedProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
