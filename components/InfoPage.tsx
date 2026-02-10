import React, { useMemo, useEffect, useRef, useState } from 'react';
import { PAGE_CONTENT } from '../constants/pageContent.ts';
import { Twitter, Facebook } from 'lucide-react';

interface InfoPageProps {
  slug: string;
  onBack: () => void;
  guides?: any[];
  onRead?: (slug: string) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ slug, onBack, guides = [], onRead }) => {
  const [displayedCount, setDisplayedCount] = useState(4);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Resolution logic: Determine if it's a static page or a dynamic article
  const currentGuide = guides.find(g => g.slug === slug);
  const staticPage = PAGE_CONTENT[slug];

  const page = useMemo(() => {
    if (staticPage) {
      return staticPage;
    }
    if (currentGuide) {
      return {
        title: currentGuide.title,
        subtitle: `${currentGuide.author.name} • ${currentGuide.author.role}`,
        content: currentGuide.content
      };
    }
    return null;
  }, [staticPage, currentGuide]);

  const isArticle = !!currentGuide;

  // Thematic similarity logic
  const allRelated = useMemo(() => {
    if (!isArticle || !currentGuide) return [];
    
    const currentKeywords = currentGuide.title.toLowerCase().split(' ');
    
    return guides
      .filter(g => g.slug !== slug)
      .map(g => {
        const targetKeywords = g.title.toLowerCase().split(' ');
        const score = targetKeywords.filter(k => k.length > 3 && currentKeywords.includes(k)).length;
        return { ...g, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [slug, guides, isArticle, currentGuide]);

  const displayedRelated = allRelated.slice(0, displayedCount);

  // Infinite scroll observer for related content
  useEffect(() => {
    if (!isArticle) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < allRelated.length) {
          setTimeout(() => {
            setDisplayedCount(prev => prev + 4);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [allRelated.length, displayedCount, isArticle]);

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp', title: string, itemSlug: string) => {
    const url = encodeURIComponent(`${window.location.origin}/#${itemSlug}`);
    const text = encodeURIComponent(`Market update from Sonawale: ${title}`);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (!page) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black mb-4 uppercase utility-font tracking-tighter italic">Dispatch Missing</h2>
        <p className="text-sm opacity-50 mb-8 telugu-text">క్షమించండి, ఈ సమాచారం అందుబాటులో లేదు.</p>
        <button 
          onClick={onBack} 
          className="border-2 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all utility-font"
      >
        ← తిరిగి హోమ్ పేజీకి
      </button>

      <article>
        <header className="border-b-[3px] border-black pb-8 mb-8">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 telugu-headline leading-tight">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-lg md:text-xl italic opacity-60 font-serif telugu-text">
              {page.subtitle}
            </p>
          )}
        </header>

        {/* Content with HTML rendering and Typography support */}
        <div 
          className="telugu-text prose prose-lg prose-black max-w-none mb-20"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>

      {/* Related Content & Infinite Scroll Section - Only for Articles */}
      {isArticle && allRelated.length > 0 && (
        <section className="mt-24 border-t-4 border-black pt-16">
          <div className="flex items-center justify-between mb-12 border-b border-black/10 pb-4">
            <h3 className="text-2xl font-black uppercase tracking-tight utility-font telugu-text font-bold">
              మరింత చదవండి (Recommended for You)
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 utility-font">
              Market Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
            {displayedRelated.map((article, idx) => (
              <div 
                key={article.slug}
                onClick={() => onRead?.(article.slug)}
                className="cursor-pointer group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="aspect-[16/9] overflow-hidden border border-black mb-4 grayscale group-hover:grayscale-0 transition-all duration-700 relative">
                   <img 
                    src={article.featuredImage || `https://picsum.photos/seed/${article.slug}/600/338`} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare('twitter', article.title, article.slug); }}
                      className="p-1.5 bg-white border border-black hover:bg-black hover:text-white"
                    >
                      <Twitter size={10} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare('facebook', article.title, article.slug); }}
                      className="p-1.5 bg-white border border-black hover:bg-black hover:text-white"
                    >
                      <Facebook size={10} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 utility-font">
                    {article.author.name}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-30 utility-font">
                    {new Date().toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <h4 className="font-bold text-xl leading-tight telugu-headline group-hover:underline mb-2">
                  {article.title}
                </h4>
                <p className="text-sm opacity-70 telugu-text line-clamp-2 italic">
                  {article.summary}
                </p>
                
                <div className="mt-4 pt-4 border-t border-dotted border-black/20 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest utility-font group-hover:text-[#A52A2A] transition-colors">
                    Read Story →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-12">
            {displayedCount < allRelated.length ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 utility-font">
                  Fetching More Dispatches...
                </span>
              </div>
            ) : (
              <div className="text-center opacity-30 italic py-12 border-t border-dotted border-black/10 w-full">
                <p className="text-xs telugu-text">మీరు అన్ని సంబంధిత వార్తలను చదివారు.</p>
                <p className="text-[9px] font-black uppercase tracking-widest utility-font mt-2">End of Market Feed</p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mt-16 pt-8 border-t border-black/10 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 utility-font">
          సోనావాలే డైలీ న్యూస్ & బులియన్ రిజిస్ట్రీ • 2026
        </p>
      </div>
    </div>
  );
};