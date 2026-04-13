import { useState, useEffect } from 'react';

const ImageGallery = ({ images }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  
  // Ensure we have at least 1 image to avoid crashes and filter empty ones
  const filtered = images?.filter(img => img && img.trim() !== '') || [];
  
  const safeImages = filtered.length > 0 
    ? filtered 
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80'];

  const handleThumbnailClick = (idx) => {
    if (idx === activeIdx) return;
    
    // Trigger fade out
    setFading(true);
    
    // Wait for fade out, change image, trigger fade in
    setTimeout(() => {
      setActiveIdx(idx);
      setFading(false);
    }, 150);
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      <div className="w-full h-[420px] md:h-[500px] rounded-xl overflow-hidden bg-gray-100 relative">
        <img
          src={safeImages[activeIdx]}
          alt="Product View"
          className={`w-full h-full object-cover transition-opacity duration-150 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`flex-shrink-0 w-20 h-[72px] rounded-lg overflow-hidden border-2 transition-all ${
                activeIdx === idx ? 'border-accent p-0.5' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover rounded-md" 
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
