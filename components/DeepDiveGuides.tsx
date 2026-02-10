import React from 'react';
import { Twitter, Facebook, Share2 } from 'lucide-react';

interface DeepDiveGuidesProps {
  guides: any[];
  onRead: (slug: string) => void;
}

export const DeepDiveGuides: React.FC<DeepDiveGuidesProps> = ({ guides, onRead }) => {
  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp', title: string, slug: string) => {
    const url = encodeURIComponent(`${window.location.origin}/#${slug}`);
    const text = encodeURIComponent(`Market update from Sonawale: ${title}`);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      {guides.map((guide) => (
        <article 
          key={guide.slug} 
          onClick={() => onRead(guide.slug)}
          className="flex flex-col md:flex-row gap-4 group border-b border-black/5 pb-6 last:border-0 cursor-pointer" 
          itemScope 
          itemType="https://schema.org/NewsArticle"
        >
          <meta itemProp="mainEntityOfPage" content={`https://sonawale.com/#${guide.slug}`} />
          <div className="md:w-1/4 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden border border-black/10 aspect-[16/10] md:aspect-square">
            <img 
              src={guide.featuredImage || `https://picsum.photos/seed/${guide.slug}/300/300`} 
              alt={guide.title}
              itemProp="image"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="md:w-3/4 flex flex-col">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#A52A2A] mb-1 utility-font">
              Report • <time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString('te-IN', { day: '2-digit', month: 'short' })}</time>
            </div>
            <h3 className="text-xl font-bold leading-tight mb-1 group-hover:underline telugu-headline" itemProp="headline">
              {guide.title}
            </h3>
            <p className="text-[12px] italic mb-1 opacity-70 telugu-text" itemProp="description">
              {guide.summary}
            </p>
            <div 
              className="text-[13px] leading-relaxed line-clamp-3 opacity-80 mb-2 telugu-text"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex flex-col" itemProp="author" itemScope itemType="https://schema.org/Person">
                <span className="text-[10px] font-bold telugu-headline underline decoration-1" itemProp="name">{guide.author.name}</span>
                <span className="text-[7px] uppercase tracking-tighter opacity-40 utility-font">{guide.author.role}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRead(guide.slug); }}
                  className="text-[9px] font-black uppercase tracking-widest border-b border-black utility-font hover:text-[#A52A2A] mr-2"
                >
                  Read
                </button>
                
                <div className="flex items-center gap-2 border-l border-black/10 pl-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare('twitter', guide.title, guide.slug); }}
                    className="p-1 hover:text-[#1DA1F2] transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter size={12} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare('facebook', guide.title, guide.slug); }}
                    className="p-1 hover:text-[#1877F2] transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook size={12} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare('whatsapp', guide.title, guide.slug); }}
                    className="p-1 hover:text-[#25D366] transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-whatsapp"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.8 8.5 8.5 0 0 1 5.3 1.4L22 3Z"/><path d="M17 10c-.2-.4-.5-.8-1-1.1s-1.1-.3-1.6-.1c-.4.2-.8.5-1.1 1-.2.3-.4.6-.7.8-.3.3-.6.5-1 .6-.3.1-.7.1-1-.1s-.6-.4-.8-.7c-.2-.3-.5-.5-.8-.7s-.7-.3-1-.2c-.4.1-.7.4-1 .7-.2.3-.3.7-.3 1.1s.1.8.4 1.1c.3.3.6.5 1 .6.3.1.7.1 1-.1.3-.2.6-.5.8-.8.3-.3.6-.5 1-.6.3-.1.7-.1 1 .1s.6.4.8.7c.2.3.5.5.8.7s.7.3 1 .2c.4-.1.7-.4 1-.7.2-.3.3-.7.3-1.1z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};