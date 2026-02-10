import React from 'react';

interface DeepDiveGuidesProps {
  guides: any[];
  onRead: (slug: string) => void;
}

export const DeepDiveGuides: React.FC<DeepDiveGuidesProps> = ({ guides, onRead }) => {
  const handleShare = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    const tweetText = encodeURIComponent(`Market update from Sonawale: ${title}`);
    const tweetUrl = encodeURIComponent('https://sonawale.com');
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
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
              <div className="flex gap-4">
                <button 
                  onClick={() => onRead(guide.slug)}
                  className="text-[9px] font-black uppercase tracking-widest border-b border-black utility-font hover:text-[#A52A2A]"
                >
                  Read
                </button>
                <button 
                  onClick={(e) => handleShare(e, guide.title)}
                  className="text-[9px] font-black uppercase tracking-widest border-b border-black hover:text-[#A52A2A] utility-font"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};