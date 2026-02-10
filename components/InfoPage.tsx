import React from 'react';
import { PAGE_CONTENT } from '../constants/pageContent.ts';

interface InfoPageProps {
  slug: string;
  onBack: () => void;
  guides?: any[];
}

export const InfoPage: React.FC<InfoPageProps> = ({ slug, onBack, guides = [] }) => {
  // Try to find in static pages first, then in dynamic guides
  let page = PAGE_CONTENT[slug];
  
  if (!page) {
    const guide = guides.find(g => g.slug === slug);
    if (guide) {
      page = {
        title: guide.title,
        subtitle: `${guide.author.name} • ${guide.author.role}`,
        content: guide.content
      };
    }
  }

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

      <div 
        className="telugu-text text-lg md:text-xl leading-relaxed space-y-6 prose prose-black max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      <div className="mt-16 pt-8 border-t border-black/10 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 utility-font">
          సోనావాలే డైలీ న్యూస్ & బులియన్ రిజిస్ట్రీ • 2026
        </p>
      </div>
    </div>
  );
};