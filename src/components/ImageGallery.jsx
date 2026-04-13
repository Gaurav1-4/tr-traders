import { useState, useEffect } from 'react';

const ImageGallery = ({ images }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  
  const filtered = images?.filter(img => img && img.trim() !== '') || [];
  const safeMedia = filtered.length > 0 
    ? filtered 
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80'];

  const isVideo = (url) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.mp4') || 
           cleanUrl.endsWith('.webm') || 
           url.toLowerCase().includes('dropbox.com');
  };

  const handleThumbnailClick = (idx) => {
    if (idx === activeIdx) return;
    setFading(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setFading(false);
    }, 150);
  };

  const activeMedia = safeMedia[activeIdx];

  return (
    <div className="w-full space-y-4">
      <div className="w-full h-[420px] md:h-[600px] rounded-xl overflow-hidden bg-gray-100 relative shadow-inner">
        {isVideo(activeMedia) ? (
          <video
            key={activeMedia}
            src={activeMedia}
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-150 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <img
            src={activeMedia}
            alt="Product View"
            className={`w-full h-full object-cover transition-opacity duration-150 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}
          />
        )}
      </div>

      {safeMedia.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2">
          {safeMedia.map((url, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`flex-shrink-0 w-20 h-[72px] rounded-lg overflow-hidden border-2 transition-all ${
                activeIdx === idx ? 'border-accent p-0.5' : 'border-transparent hover:border-gray-300'
              }`}
            >
              {isVideo(url) ? (
                <video src={url} className="w-full h-full object-cover rounded-md" muted />
              ) : (
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
