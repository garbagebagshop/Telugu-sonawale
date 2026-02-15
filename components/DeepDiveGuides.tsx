
import React from 'react';
import { Twitter, Facebook } from 'lucide-react';
import { Guide } from '../types';

interface DeepDiveGuidesProps {
  guides: Guide[];
  onRead: (slug: string) => void;
}

export const DeepDiveGuides: React.FC<DeepDiveGuidesProps> = ({ guides, onRead }) => {
  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp', title: string, slug: string) => {
    const url = encodeURIComponent(`${window.location.origin}/#${slug}`);
    const text = encodeURIComponent(`Market update from Sonawale: ${title}`);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      {guides.map((guide, index) => (
        <article 
          key={guide.slug} 
          onClick={() => onRead(guide.slug)}
          className="flex flex-col md:flex-row gap-4 group border-b border-black/5 pb-6 last:border-0 cursor-pointer" 
          itemScope 
          itemType="https://schema.org/NewsArticle"
        >
          <meta itemProp="mainEntityOfPage" content={`${window.location.origin}/#${guide.slug}`} />
          <div className="md:w-1/4 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden border border-black/10 aspect-[16/10] md:aspect-square bg-gray-100">
            <img 
              src={guide.featuredImage || `https://picsum.photos/seed/${guide.slug}/400/400`} 
              alt={guide.imageAlt || guide.title}
              itemProp="image"
              width="400"
              height="400"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              // @ts-ignore
              fetchpriority={index === 0 ? "high" : "auto"}
            />
          </div>
          <div className="md:w-3/4 flex flex-col">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#A52A2A] mb-1 utility-font">
              Report • <time dateTime={new Date().toISOString()} itemProp="datePublished">{new Date().toLocaleDateString('te-IN', { day: '2-digit', month: 'short' })}</time>
            </div>
            <h3 className="text-xl font-bold leading-tight mb-1 group-hover:underline telugu-headline" itemProp="headline">
              {guide.title}
            </h3>
            <p className="text-[12px] italic mb-1 opacity-70 telugu-text" itemProp="description">
              {guide.summary}
            </p>
            <div 
              className="text-[13px] leading-relaxed line-clamp-2 opacity-80 mb-2 telugu-text"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex flex-col" itemProp="author" itemScope itemType="https://schema.org/Person">
                <span className="text-[10px] font-bold telugu-headline underline decoration-1" itemProp="name">{guide.author.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRead(guide.slug); }}
                  className="text-[9px] font-black uppercase tracking-widest border-b border-black utility-font hover:text-[#A52A2A]"
                >
                  Read Dispatch
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
