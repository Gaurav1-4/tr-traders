import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-serif font-medium">Our Legacy</h1>
          <p className="font-accent italic text-xl md:text-2xl text-primary">Stitching traditions since 1995</p>
        </div>

        {/* Storefront Image */}
        <div className="aspect-video md:aspect-[21/9] bg-surface border border-[#0D1B38]/10 overflow-hidden rounded-[2.5rem] shadow-2xl animate-fade-in">
          <img 
            src="/images/shop-front.jpg" 
            alt="TR TRADERS Storefront" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-gray mx-auto text-text space-y-6">
          <p className="leading-relaxed">
            Welcome to <strong className="font-serif font-medium text-black">TR TRADERS</strong>, your premier destination for exquisite ladies' ethnic wear. Founded with a passion for preserving traditional craftsmanship while embracing modern elegance, we have grown from a modest wholesale supplier to a trusted name across the city.
          </p>
          <p className="leading-relaxed">
            Our journey began over two decades ago in the bustling wholesale fabric markets. Through an unwavering commitment to quality and an innate understanding of fabrics like Banarasi silk, pure cotton, chiffon, and velvet, we earned the loyalty of countless boutiques and retailers. Today, we bring that same wholesale excellence directly to your wardrobe.
          </p>
          
          <h2 className="text-2xl font-serif font-medium text-black mt-12 mb-4">Our Craftsmanship</h2>
          <p className="leading-relaxed">
            Every piece curated at TR Traders tells a story. We work intimately with artisans who have mastered the art of Zardozi, threadwork, and block printing over generations. Whether you are looking for an intricately woven bridal ensemble, a breezy cotton suit for daily wear, or a sophisticated velvet kurta for the winter festivities, our collection ensures you stand out with grace.
          </p>

          <h2 className="text-2xl font-serif font-medium text-black mt-12 mb-4">The Promise of Elegance</h2>
          <p className="leading-relaxed">
            We believe that every woman deserves to feel luxurious without compromise. That's why we maintain a zero-compromise policy on fabric purity and stitching standards. Our latest transition into the online catalog space is designed to give you a seamless viewing experience of our newest arrivals. 
          </p>
          <p className="leading-relaxed italic mt-8 border-l-4 border-primary pl-4 text-muted">
            "Though our catalogue is online, our service remains deeply personal. Each purchase begins with a conversation—ensuring that what you receive is exactly what you envisioned."
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
