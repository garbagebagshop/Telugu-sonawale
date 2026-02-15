import React, { useMemo, useEffect, useRef, useState } from 'react';
import { PAGE_CONTENT } from '../constants/pageContent';
import { ORG_DETAILS } from '../constants';
import { Twitter, Facebook, Share2, ArrowRight, Loader2 } from 'lucide-react';
import { Guide } from '../types';
import { Breadcrumbs } from './Breadcrumbs';

interface InfoPageProps {
  slug: string;
  onBack: () => void;
  guides?: Guide[];
  onRead?: (slug: string) => void;
}

interface PageData {
  title: string;
  subtitle?: string;
  content: string;
  summary: string;
  author: any;
  featuredImage: string | null;
  imageAlt?: string;
  category?: string;
}

interface RelatedArticle extends Guide {
  score: number;
}

export const InfoPage: React.FC<InfoPageProps> = ({ slug, onBack, guides = [], onRead }) => {
  const [displayedCount, setDisplayedCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const currentGuide = guides.find((g: Guide) => g.slug === slug);
  const staticPage = PAGE_CONTENT[slug];

  const page = useMemo<PageData | null>(() => {
    if (staticPage) {
      return {
        ...staticPage,
        featuredImage: (staticPage as any).featuredImage || null,
        imageAlt: staticPage.title,
        author: null,
        summary: staticPage.title,
        category: "Information"
      };
    }
    if (currentGuide) {
      return {
        title: currentGuide.title,
        subtitle: `${currentGuide.author.name} • ${currentGuide.author.role}`,
        content: currentGuide.content,
        summary: currentGuide.summary,
        author: currentGuide.author,
        featuredImage: currentGuide.featuredImage || `https://picsum.photos/seed/${currentGuide.slug}/1200/675`,
        imageAlt: currentGuide.imageAlt || currentGuide.title,
        category: currentGuide.category || "Market Analysis"
      };
    }
    return null;
  }, [staticPage, currentGuide]);

  const isArticle = !!currentGuide;

  useEffect(() => {
    if (!page) return;
    
    // SEO: Browser Metadata
    document.title = `${page.title} | సోనావాలే హైదరాబాద్`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', page.summary || page.title);

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && currentGuide?.focusKeywords) {
      metaKeywords.setAttribute('content', currentGuide.focusKeywords);
    }

    // Schema Management
    const schemaId = 'dynamic-seo-schema';
    let script = document.getElementById(schemaId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const datePublished = currentGuide?.date || new Date().toISOString();
    const canonicalUrl = `${ORG_DETAILS.url}/#${slug}`;

    const primarySchema: any = {
      "@context": "https://schema.org",
      "@type": isArticle ? "NewsArticle" : "WebPage",
      "@id": `${ORG_DETAILS.url}/#article-${slug}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "headline": page.title,
      "description": page.summary,
      "image": {
        "@type": "ImageObject",
        "url": page.featuredImage || ORG_DETAILS.logo,
        "width": 1200,
        "height": 675
      },
      "datePublished": datePublished,
      "dateModified": datePublished,
      "author": (isArticle && page.author) ? {
        "@type": "Person",
        "name": page.author.name,
        "jobTitle": page.author.jobTitle,
        "url": `${ORG_DETAILS.url}/#author-${page.author.handle.replace('@','')}`,
        "sameAs": page.author.sameAs || []
      } : { 
        "@id": `${ORG_DETAILS.url}/#organization` 
      },
      "publisher": { "@id": `${ORG_DETAILS.url}/#organization` },
      "articleBody": page.content.replace(/<[^>]*>?/gm, ''),
      "articleSection": page.category,
      "inLanguage": "te-IN"
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "హోమ్", "item": ORG_DETAILS.url },
        { "@type": "ListItem", "position": 2, "name": page.category, "item": `${ORG_DETAILS.url}/#category-${page.category?.toLowerCase().replace(/\s+/g, '-')}` },
        { "@type": "ListItem", "position": 3, "name": page.title, "item": canonicalUrl }
      ]
    };

    script.text = JSON.stringify([primarySchema, breadcrumbSchema]);

    // Reset scroll to top on page change
    window.scrollTo(0, 0);

    return () => { 
      document.title = 'Sonawale | Hyderabad Live Gold & Silver Registry'; 
    };
  }, [page, slug, isArticle, currentGuide]);

  const allRelated = useMemo<RelatedArticle[]>(() => {
    if (!isArticle || !currentGuide) return [];
    
    const currentKeywords = (currentGuide.focusKeywords || currentGuide.title)
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(k => k.length > 3);
      
    return guides
      .filter((g: Guide) => g.slug !== slug)
      .map((g: Guide) => {
        const targetText = (g.title + ' ' + (g.focusKeywords || '')).toLowerCase();
        const score = currentKeywords.filter(k => targetText.includes(k)).length;
        return { ...g, score };
      })
      .sort((a, b) => b.score - a.score || new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [slug, guides, isArticle, currentGuide]);

  const displayedRelated = allRelated.slice(0, displayedCount);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!isArticle || displayedCount >= allRelated.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate network delay for smooth UX
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(prev + 6, allRelated.length));
            setIsLoadingMore(false);
          }, 600);
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [allRelated.length, displayedCount, isArticle, isLoadingMore]);

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp', title: string, itemSlug: string) => {
    const url = encodeURIComponent(`${window.location.origin}/#${itemSlug}`);
    const text = encodeURIComponent(`Market Update: ${title}`);
    let shareUrl = '';
    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Breadcrumbs items={[
        { label: page.category || "నివేదికలు" },
        { label: page.title, active: true }
      ]} />

      <article itemScope itemType="https://schema.org/NewsArticle">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-[#A52A2A] text-[10px] font-black uppercase tracking-widest utility-font">
            <span className="bg-[#A52A2A] text-white px-2 py-0.5 telugu-text font-bold">తాజా నివేదిక</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold telugu-headline leading-[1.1] tracking-tighter text-black mb-6" itemProp="headline">
            {page.title}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-y-2 border-black py-6 mb-8">
            <div className="flex items-center gap-3">
              {isArticle && page.author && (
                <>
                  <img src={page.author.avatar} alt={page.author.name} className="w-10 h-10 rounded-full border-2 border-black/5" />
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black uppercase utility-font tracking-tight">{page.author.name}</span>
                    <span className="text-[9px] opacity-60 uppercase font-bold utility-font">{page.author.jobTitle}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 mt-6 md:mt-0">
              <span className="text-[10px] font-black uppercase opacity-40 utility-font tracking-widest">Share Dispatch</span>
              <button onClick={() => handleShare('twitter', page.title, slug)} className="hover:text-[#1DA1F2] transition-colors"><Twitter size={16} /></button>
              <button onClick={() => handleShare('facebook', page.title, slug)} className="hover:text-[#1877F2] transition-colors"><Facebook size={16} /></button>
              <button onClick={() => handleShare('whatsapp', page.title, slug)} className="hover:text-[#25D366] transition-colors"><Share2 size={16} /></button>
            </div>
          </div>

          {page.featuredImage && (
            <figure className="mb-12 border-2 border-black overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
              <img 
                src={page.featuredImage} 
                alt={page.imageAlt || page.title} 
                className="w-full h-full object-cover aspect-video md:aspect-[21/9]" 
                loading="eager"
              />
              <figcaption className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] py-2 px-4 italic flex justify-between utility-font">
                <span>REPORTER ARCHIVE: {slug.toUpperCase()}</span>
                <span>© SONAWALE NETWORK</span>
              </figcaption>
            </figure>
          )}
        </header>

        <div 
          className="telugu-text prose prose-lg md:prose-xl prose-black max-w-none mb-24 drop-cap selection:bg-yellow-200" 
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </article>

      {isArticle && allRelated.length > 0 && (
        <section className="mt-24 border-t-4 border-black pt-16">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black italic telugu-headline border-b-4 border-black pb-1">సంబంధిత వార్తా ప్రవాహం</h3>
            <span className="text-[10px] font-black uppercase utility-font opacity-40">More in {page.category}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {displayedRelated.map((article) => (
              <div 
                key={article.slug} 
                onClick={() => onRead?.(article.slug)} 
                className="cursor-pointer group flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden border-2 border-black mb-4 bg-gray-100 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] group-hover:shadow-none transition-all">
                   <img 
                     src={article.featuredImage || `https://picsum.photos/seed/${article.slug}/600/338`} 
                     alt={article.title} 
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                   />
                   <div className="absolute top-2 left-2 bg-black text-white text-[8px] px-2 py-1 font-black uppercase tracking-widest utility-font">
                     {article.category || 'MARKET'}
                   </div>
                </div>
                <h4 className="font-bold text-2xl telugu-headline group-hover:underline mb-3 leading-tight decoration-2 underline-offset-4">{article.title}</h4>
                <p className="text-[14px] opacity-70 telugu-text line-clamp-2 leading-relaxed mb-4">{article.summary}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase utility-font opacity-40">
                    {new Date(article.date || Date.now()).toLocaleDateString('te-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreRef} className="py-24 flex flex-col items-center justify-center w-full">
            {displayedCount < allRelated.length ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={32} className="animate-spin opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 utility-font">Syncing More Reports...</span>
              </div>
            ) : (
              <div className="w-full text-center border-t border-black/10 pt-8">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 utility-font">End of Dispatch</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Static page return footer */}
      {!isArticle && (
        <div className="mt-20 pt-10 border-t-2 border-black text-center">
          <button 
            onClick={onBack}
            className="px-8 py-4 border-2 border-black font-black uppercase tracking-widest utility-font hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            మరల హోమ్ పేజీకి
          </button>
        </div>
      )}
    </div>
  );
};
