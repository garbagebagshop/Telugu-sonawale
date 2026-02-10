import React, { useMemo, useEffect, useRef, useState } from 'react';
import { PAGE_CONTENT } from '../constants/pageContent.ts';
import { ORG_DETAILS } from '../constants.ts';
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

  // Resolution logic for content
  const currentGuide = guides.find(g => g.slug === slug);
  const staticPage = PAGE_CONTENT[slug];

  const page = useMemo(() => {
    if (staticPage) {
      return {
        ...staticPage,
        featuredImage: (staticPage as any).featuredImage || null
      };
    }
    if (currentGuide) {
      return {
        title: currentGuide.title,
        subtitle: `${currentGuide.author.name} • ${currentGuide.author.role}`,
        content: currentGuide.content,
        summary: currentGuide.summary,
        author: currentGuide.author,
        featuredImage: currentGuide.featuredImage || `https://picsum.photos/seed/${currentGuide.slug}/1200/675`
      };
    }
    return null;
  }, [staticPage, currentGuide]);

  const isArticle = !!currentGuide;

  // SEO & Schema Injection for Article/Person
  useEffect(() => {
    if (!page) return;

    // Update Meta
    document.title = `${page.title} | Sonawale Hyderabad`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const summaryText = (page as any).summary || page.title;
    if (metaDesc) metaDesc.setAttribute('content', summaryText);

    const schemaId = 'dynamic-article-schema';
    let script = document.getElementById(schemaId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const newsSchema = {
      "@context": "https://schema.org",
      "@type": isArticle ? "NewsArticle" : "WebPage",
      "@id": `${ORG_DETAILS.url}/#article-${slug}`,
      "headline": page.title,
      "image": [page.featuredImage || ORG_DETAILS.logo],
      "datePublished": new Date().toISOString(), 
      "dateModified": new Date().toISOString(),
      "author": isArticle ? {
        "@type": "Person",
        "@id": `${ORG_DETAILS.url}/#author-${(page as any).author.handle.replace('@','')}`,
        "name": (page as any).author.name,
        "jobTitle": (page as any).author.jobTitle || (page as any).author.role,
        "url": `${ORG_DETAILS.url}/#author-${(page as any).author.handle.replace('@','')}`,
        "sameAs": (page as any).author.sameAs || []
      } : {
        "@id": `${ORG_DETAILS.url}/#organization`
      },
      "publisher": {
        "@id": `${ORG_DETAILS.url}/#organization`
      },
      "description": summaryText,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${ORG_DETAILS.url}/#${slug}`
      },
      "isAccessibleForFree": "True",
      "inLanguage": "te-IN"
    };

    script.text = JSON.stringify(newsSchema);

    return () => {
      document.title = 'Sonawale | Hyderabad Live Gold & Silver Registry';
    };
  }, [page, slug, isArticle]);

  // Infinite Scroll Related Items Logic
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

  useEffect(() => {
    if (!isArticle) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < allRelated.length) {
          setTimeout(() => {
            setDisplayedCount(prev => prev + 2);
          }, 400);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
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
        <h2 className="text-2xl font-black mb-4 uppercase utility-font tracking-tighter italic text-black">Dispatch Missing</h2>
        <p className="text-sm opacity-50 mb-8 telugu-text">క్షమించండి, ఈ సమాచారం అందుబాటులో లేదు.</p>
        <button onClick={onBack} className="border-2 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 py-12" itemScope itemType="https://schema.org/NewsArticle">
      <nav className="mb-8 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all utility-font group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> తిరిగి హోమ్ పేజీకి
        </button>
        <div className="hidden sm:flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-40 utility-font">
          <span className="cursor-pointer hover:underline" onClick={onBack}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={onBack}>Archives</span>
          <span>/</span>
          <span className="text-black truncate max-w-[150px]">{slug}</span>
        </div>
      </nav>

      <article>
        <header className="mb-12 relative">
          <div className="flex items-center gap-2 mb-4 text-[#A52A2A] text-[10px] font-black uppercase tracking-widest utility-font">
            <span className="bg-[#A52A2A] text-white px-2 py-0.5 telugu-text font-bold">తాజా సమాచారం</span>
            <span className="telugu-text font-bold opacity-60" itemProp="articleSection">/ {isArticle ? 'Bullion Feed' : 'Static Archive'}</span>
          </div>
          
          <div className="border-l-[12px] border-black pl-6 md:pl-10 mb-8">
            <h1 className="text-4xl md:text-7xl font-bold telugu-headline leading-[1.1] tracking-tighter text-black mb-4" itemProp="headline">
              {page.title}
            </h1>
            <div className="h-1.5 w-32 bg-[#A52A2A] mt-2 mb-6"></div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-y-2 border-black py-5 mb-10 bg-white/30 px-2">
            {page.subtitle && (
              <p className="text-base md:text-lg italic font-serif telugu-text opacity-90 font-bold" itemProp="alternativeHeadline">
                {page.subtitle}
              </p>
            )}
            <div className="flex items-center gap-4 border-l-0 md:border-l md:border-black/20 md:pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest utility-font opacity-40 whitespace-nowrap">Broadcast:</span>
              <div className="flex gap-4">
                <button onClick={() => handleShare('twitter', page.title, slug)} className="hover:text-[#1DA1F2] transition-colors"><Twitter size={16} strokeWidth={2.5} /></button>
                <button onClick={() => handleShare('facebook', page.title, slug)} className="hover:text-[#1877F2] transition-colors"><Facebook size={16} strokeWidth={2.5} /></button>
              </div>
            </div>
          </div>

          {page.featuredImage && (
            <div className="mb-14 relative group">
              <div className="absolute inset-0 bg-black/5 translate-x-3 translate-y-3 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="border-2 border-black overflow-hidden bg-white">
                <img 
                  src={page.featuredImage} 
                  alt={page.title} 
                  itemProp="image"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 aspect-video md:aspect-[21/9]"
                />
              </div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-40 utility-font text-right flex justify-end items-center gap-2">
                <span className="h-px w-8 bg-black/20"></span>
                MARKET ARCHIVE IMAGE • {new Date().getFullYear()}
              </div>
            </div>
          )}
        </header>

        <div 
          className="telugu-text prose prose-lg md:prose-xl prose-black max-w-none mb-24 drop-cap"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>

      {isArticle && allRelated.length > 0 && (
        <section className="mt-32 border-t-[6px] border-black pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 border-b-2 border-black pb-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight utility-font telugu-text font-bold text-black">మరింత సమాచారం</h3>
              <p className="text-sm font-bold opacity-40 italic mt-1">Recommended market analysis continues below...</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 utility-font">Live Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {displayedRelated.map((article, idx) => (
              <div 
                key={article.slug}
                onClick={() => onRead?.(article.slug)}
                className="cursor-pointer group flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${(idx % 2) * 150}ms` }}
              >
                <div className="aspect-[16/9] overflow-hidden border-2 border-black mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-all">
                   <img src={article.featuredImage || `https://picsum.photos/seed/${article.slug}/600/338`} alt={article.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button onClick={(e) => { e.stopPropagation(); handleShare('twitter', article.title, article.slug); }} className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Twitter size={12} strokeWidth={3} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleShare('facebook', article.title, article.slug); }} className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Facebook size={12} strokeWidth={3} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#A52A2A] text-white px-2 py-1 utility-font">{article.author.name}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30 utility-font border-l border-black/20 pl-3">{new Date().toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="font-bold text-2xl leading-tight telugu-headline group-hover:underline mb-3 text-black">{article.title}</h4>
                <p className="text-base opacity-75 telugu-text line-clamp-3 italic leading-relaxed mb-6">{article.summary}</p>
                <div className="mt-auto pt-4 border-t border-black/10 flex justify-between items-center group/btn">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] utility-font group-hover/btn:text-[#A52A2A] transition-colors">పూర్తి కథనం →</span>
                  <div className="w-10 h-0.5 bg-black/10 group-hover/btn:w-20 group-hover/btn:bg-[#A52A2A] transition-all"></div>
                </div>
              </div>
            ))}
          </div>

          <div ref={loadMoreRef} className="py-24 flex flex-col items-center justify-center mt-12 w-full">
            {displayedCount < allRelated.length ? (
              <div className="flex flex-col items-center gap-4 animate-bounce">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 utility-font">Loading More Archives</span>
              </div>
            ) : (
              <div className="text-center w-full px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-black to-transparent opacity-20 mb-8"></div>
                <p className="text-sm telugu-text font-bold italic opacity-40">మీరు ప్రస్తుత నివేదికలన్నీ చదివారు.</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] utility-font mt-3 opacity-30">End of Editorial Dispatch</p>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-8 text-[9px] font-black uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all">Back to Top</button>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mt-16 pt-10 border-t border-black/10 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 utility-font text-black">
          SONAWALE BULLION REGISTRY • HYDERABAD • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
