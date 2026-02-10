
import React, { useState, useEffect } from 'react';
import { PriceTicker } from './components/PriceTicker.tsx';
import { PriceDashboard } from './components/PriceDashboard.tsx';
import { TrendVisualizer } from './components/TrendVisualizer.tsx';
import { DeepDiveGuides } from './components/DeepDiveGuides.tsx';
import { AuthorProfile } from './components/AuthorProfile.tsx';
import { AuthorPortal } from './components/AuthorPortal.tsx';
import { InfoPage } from './components/InfoPage.tsx';
import { Calculator } from './components/Calculator.tsx';
import { FAQSection } from './components/FAQSection.tsx';
import { PriceData } from './types.ts';
import { HYDERABAD_MARKET_AVERAGES, AUTHORS, GUIDES as INITIAL_GUIDES, ORG_DETAILS } from './constants.ts';

const App: React.FC = () => {
  const [prices, setPrices] = useState<PriceData>({
    gold24k: HYDERABAD_MARKET_AVERAGES.gold24k,
    gold22k: HYDERABAD_MARKET_AVERAGES.gold22k,
    silver: HYDERABAD_MARKET_AVERAGES.silver,
    lastUpdated: new Date().toLocaleTimeString('te-IN'),
  });

  const [loading, setLoading] = useState(true);
  const [showAuthorPortal, setShowAuthorPortal] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [dynamicGuides, setDynamicGuides] = useState(INITIAL_GUIDES);

  useEffect(() => {
    const savedArticles = localStorage.getItem('sonawale_custom_articles');
    const savedPrices = localStorage.getItem('sonawale_current_prices');
    
    if (savedArticles) {
      const parsed = JSON.parse(savedArticles);
      setDynamicGuides([...parsed, ...INITIAL_GUIDES]);
    }
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    }
    setLoading(false);
    
    // Inject Multi-Entity Global Schema (Organization, LocalBusiness, WebSite)
    const siteSchema = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${ORG_DETAILS.url}/#organization`,
        "name": ORG_DETAILS.name,
        "url": ORG_DETAILS.url,
        "logo": {
          "@type": "ImageObject",
          "url": ORG_DETAILS.logo
        },
        "description": ORG_DETAILS.description,
        "sameAs": ORG_DETAILS.sameAs
      },
      {
        "@context": "https://schema.org",
        "@type": "FinancialService",
        "name": ORG_DETAILS.name,
        "image": ORG_DETAILS.logo,
        "@id": `${ORG_DETAILS.url}/#localbusiness`,
        "url": ORG_DETAILS.url,
        "telephone": ORG_DETAILS.telephone,
        "priceRange": ORG_DETAILS.priceRange,
        "address": {
          "@type": "PostalAddress",
          ...ORG_DETAILS.address
        },
        "geo": {
          "@type": "GeoCoordinates",
          ...ORG_DETAILS.geo
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "10:30",
          "closes": "20:30"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${ORG_DETAILS.url}/#website`,
        "name": "Sonawale Hyderabad",
        "url": ORG_DETAILS.url,
        "publisher": { "@id": `${ORG_DETAILS.url}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${ORG_DETAILS.url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "te-IN"
      }
    ];

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'generic-site-schema';
    script.text = JSON.stringify(siteSchema);
    document.head.appendChild(script);

    // Person Schemas for Authors
    Object.values(AUTHORS).forEach(author => {
      const authorId = author.handle.replace('@', '');
      const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${ORG_DETAILS.url}/#author-${authorId}`,
        "name": author.name,
        "jobTitle": author.jobTitle || author.role,
        "description": author.bio,
        "image": author.avatar,
        "url": `${ORG_DETAILS.url}/#author-${authorId}`,
        "sameAs": author.sameAs || [],
        "worksFor": { "@id": `${ORG_DETAILS.url}/#organization` }
      };
      const personScript = document.createElement('script');
      personScript.type = 'application/ld+json';
      personScript.id = `author-schema-${authorId}`;
      personScript.text = JSON.stringify(personSchema);
      document.head.appendChild(personScript);
    });

    return () => {
      const ids = ['generic-site-schema', ...Object.values(AUTHORS).map(a => `author-schema-${a.handle.replace('@', '')}`)];
      ids.forEach(id => {
        const existing = document.getElementById(id);
        if (existing) document.head.removeChild(existing);
      });
    };
  }, []);

  const generateRSS = () => {
    const items = dynamicGuides.map(g => `
      <item>
        <title>${g.title}</title>
        <link>${ORG_DETAILS.url}/#${g.slug}</link>
        <description>${g.summary}</description>
        <pubDate>${new Date().toUTCString()}</pubDate>
      </item>`).join('');
    
    const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
      <channel>
        <title>${ORG_DETAILS.name}</title>
        <link>${ORG_DETAILS.url}</link>
        <description>Hyderabad Live Gold &amp; Silver Price Registry</description>
        ${items}
      </channel>
      </rss>`;
    
    const blob = new Blob([rssContent], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleNewArticle = (article: any) => {
    const updated = [article, ...dynamicGuides];
    setDynamicGuides(updated);
    const customOnly = updated.filter(a => !INITIAL_GUIDES.some(ig => ig.slug === a.slug));
    localStorage.setItem('sonawale_custom_articles', JSON.stringify(customOnly));
  };

  const handleUpdatePrices = (newPrices: PriceData) => {
    setPrices(newPrices);
    localStorage.setItem('sonawale_current_prices', JSON.stringify(newPrices));
  };

  const handleNavigate = (slug: string) => {
    setCurrentPage(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1400px] mx-auto bg-[#F4F1EA] md:border-x border-black/20 overflow-x-hidden">
      <PriceTicker prices={prices} loading={loading} />

      {showAuthorPortal && (
        <AuthorPortal 
          onPublish={handleNewArticle} 
          onUpdatePrices={handleUpdatePrices}
          currentPrices={prices}
          onClose={() => setShowAuthorPortal(false)} 
        />
      )}

      {/* Breaking Bar */}
      <div role="alert" className="bg-[#A52A2A] text-white py-1.5 px-4 text-[10px] font-black uppercase tracking-[0.2em] flex justify-between items-center utility-font shadow-inner">
        <span className="telugu-text font-bold truncate pr-4 text-[11px]">ముఖ్య వార్తలు: హైదరాబాద్ బులియన్ మార్కెట్‌లో ధరల స్థిరీకరణ</span>
        <span className="hidden sm:inline shrink-0 whitespace-nowrap">Flash • {prices.lastUpdated}</span>
      </div>

      <header className="py-8 px-4 text-center mx-auto w-full max-w-4xl cursor-pointer" onClick={() => setCurrentPage(null)}>
        <div className="flex justify-between items-end text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-4 border-b-2 border-black pb-1 utility-font text-black">
          <span className="telugu-text font-bold">దినపత్రిక</span>
          <span className="hidden xs:inline">Market Vol. 102 • No. 14</span>
          <time dateTime={new Date().toISOString()} className="font-black">
            {new Date().toLocaleDateString('te-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </time>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-9xl font-bold masthead-title tracking-tighter leading-none text-black break-words">
            SONAWALE
          </h1>
          <div className="text-lg md:text-2xl font-black mt-1 mb-2 tracking-[0.1em] telugu-headline italic text-black/80">(తెలుగు)</div>
        </div>
        <p className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.6em] uppercase opacity-70 utility-font telugu-text max-w-xs mx-auto text-black">
          హైదరాబాద్ బులియన్ మరియు వార్తా నివేదిక
        </p>
      </header>

      <main className="px-4 md:px-8 pb-12 flex-grow">
        {currentPage ? (
          <InfoPage 
            slug={currentPage} 
            onBack={() => setCurrentPage(null)} 
            guides={dynamicGuides}
            onRead={handleNavigate}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <article className="lg:col-span-8 space-y-10" itemScope itemType="https://schema.org/NewsArticle">
              <meta itemProp="datePublished" content={new Date().toISOString()} />
              <meta itemProp="publisher" content={ORG_DETAILS.name} />
              
              <section className="border-b-[3px] border-black pb-10">
                <div className="flex items-center gap-2 mb-4 text-[#A52A2A] text-[10px] font-black uppercase tracking-widest utility-font">
                  <span className="bg-[#A52A2A] text-white px-1.5 py-0.5 telugu-text font-bold">ప్రత్యేక</span> <span className="telugu-text font-bold">నివేదిక</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] mb-6 telugu-headline text-black" itemProp="headline">
                  రెండవ త్రైమాసికంలో భారీగా పెరగనున్న బంగారం దిగుమతులు: హైదరాబాద్ వ్యాపారుల అంచనా
                </h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold mb-8 italic opacity-70 telugu-text border-l-2 border-black/10 pl-4 text-black">
                  <span itemProp="author" itemScope itemType="https://schema.org/Person">
                    రచన: <span itemProp="name" className="underline underline-offset-2">{AUTHORS.skulkarni.name}</span>
                  </span>
                  <span className="opacity-30">•</span>
                  <span className="utility-font uppercase text-[9px] tracking-widest font-bold">పాట్ మార్కెట్ బ్యూరో</span>
                </div>
                <div itemProp="articleBody" className="telugu-text text-black">
                  <p className="text-xl leading-relaxed first-letter:text-7xl sm:first-letter:text-8xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.7] first-letter:font-serif first-letter:text-black">
                    అంతర్జాతీయ మార్కెట్‌లో బంగారం ధరలు నిలకడగా ఉండటంతో, హైదరాబాద్‌లోని అబిడ్స్ మరియు సికింద్రాబాద్ వ్యాపార కేంద్రాలలో కొత్త స్టాక్ రాక పెరిగింది. చిన్న తరహా నగల వ్యాపారులకు ప్రభుత్వ నిర్ణయాలు సానుకూలంగా మారనున్నాయని విశ్లేషకులు భావిస్తున్నారు.
                  </p>
                  <p className="mt-6 text-xl leading-relaxed opacity-90">
                    HUID రిజిస్ట్రీ గణాంకాల ప్రకారం, గత నెలతో పోలిస్తే హాల్‌మార్క్ చేసిన ఆభరణాల విక్రయాలు 14% పెరిగాయి. దీనితో 22 క్యారెట్ల బంగారంపై వినియోగదారుల నమ్మకం మరింత బలపడిందని స్పష్టమవుతోంది.
                  </p>
                </div>
                
                <AuthorProfile author={AUTHORS.skulkarni} />
              </section>

              <section aria-labelledby="news-wire-heading">
                <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-1">
                  <h3 id="news-wire-heading" className="text-2xl sm:text-3xl font-bold italic telugu-headline inline-block text-black">తాజా వార్తా ప్రవాహం</h3>
                  <button onClick={generateRSS} title="Subscribe to RSS" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-[#A52A2A] text-black">
                    {/* Removed 'size' prop as it is not a valid SVG attribute in standard React JSX */}
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6.503 20.752c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm15.497 2.001c0-10.493-8.507-19-19-19v3.018c8.828 0 15.982 7.155 15.982 15.982h3.018zm-7.986 0c0-6.082-4.919-11.001-11.014-11.001v3.018c4.411 0 7.996 3.585 7.996 7.983h3.018z"/></svg>
                    RSS Feed
                  </button>
                </div>
                <DeepDiveGuides guides={dynamicGuides} onRead={handleNavigate} />
              </section>
            </article>

            <aside className="lg:col-span-4 lg:border-l lg:border-black/20 lg:pl-8 space-y-12">
              <div className="sticky top-12 space-y-12">
                <section aria-labelledby="market-summary-heading">
                  <h3 id="market-summary-heading" className="text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-3 py-1.5 inline-block mb-6 utility-font telugu-text font-bold">
                    మార్కెట్ సారాంశం
                  </h3>
                  <PriceDashboard prices={prices} loading={loading} />
                  <p className="text-[9px] mt-3 font-bold opacity-50 utility-font uppercase telugu-text text-center tracking-widest text-black">చివరి అప్డేట్: {prices.lastUpdated}</p>
                </section>

                <section className="bg-white/50 border border-black p-5 shadow-sm">
                  <h3 className="text-xl font-bold italic mb-5 telugu-headline border-b border-black/10 pb-1 text-black">ధరల గమనం (7 రోజులు)</h3>
                  <div className="h-[200px]">
                    <TrendVisualizer prices={prices} />
                  </div>
                </section>

                <section>
                  <Calculator prices={prices} />
                </section>

                <section className="bg-white border-2 border-black p-6">
                  <FAQSection />
                </section>

                <div className="p-6 border-2 border-dotted border-black bg-white/40 group">
                  <h4 className="text-[11px] font-black uppercase mb-3 utility-font telugu-text font-bold text-center text-black">రిపోర్టర్ పోర్టల్</h4>
                  <p className="text-[13px] leading-relaxed opacity-80 telugu-text mb-6 text-center italic text-black">
                    వార్తలు మరియు ధరలను నవీకరించడానికి మీ ఐడి తో లాగిన్ అవ్వండి.
                  </p>
                  <button 
                    onClick={() => setShowAuthorPortal(true)}
                    className="w-full text-[11px] font-black uppercase border-2 border-black px-4 py-4 hover:bg-black hover:text-[#F4F1EA] transition-all utility-font tracking-[0.2em] telugu-text font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    లాగిన్ / LOGIN
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t-2 border-black mx-4 py-12 bg-[#F4F1EA]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12 telugu-text">
          <div className="md:col-span-1">
            <h3 className="text-3xl font-bold mb-6 telugu-headline border-b-2 border-black/10 pb-1 text-black">సోనావాలే</h3>
            <p className="text-[15px] opacity-90 leading-relaxed italic text-black">
              {ORG_DETAILS.description}
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase mb-6 utility-font tracking-[0.2em] border-b border-black/20 pb-1 text-black">ముఖ్య విభాగాలు</h4>
            <ul className="text-[14px] space-y-3 opacity-90 font-bold text-black">
              <li><button onClick={() => handleNavigate('today-gold')} className="hover:underline text-left w-full transition-all hover:translate-x-1">నేటి బంగారం ధరలు</button></li>
              <li><button onClick={() => handleNavigate('silver-analysis')} className="hover:underline text-left w-full transition-all hover:translate-x-1">వెండి విశ్లేషణ</button></li>
              <li><button onClick={() => handleNavigate('pot-market')} className="hover:underline text-left w-full transition-all hover:translate-x-1">పాట్ మార్కెట్ రిపోర్ట్</button></li>
              <li><button onClick={() => handleNavigate('abids-retail')} className="hover:underline text-left w-full transition-all hover:translate-x-1">అబిడ్స్ రిటైల్ అప్డేట్స్</button></li>
              <li><button onClick={() => handleNavigate('bis-guide')} className="hover:underline text-left w-full transition-all hover:translate-x-1">BIS హాల్‌మార్క్ గైడ్</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase mb-6 utility-font tracking-[0.2em] border-b border-black/20 pb-1 text-black">సంస్థ సమాచారం</h4>
            <ul className="text-[14px] space-y-3 opacity-90 font-bold text-black">
              <li><button onClick={() => handleNavigate('about')} className="hover:underline text-left w-full transition-all hover:translate-x-1">మా గురించి</button></li>
              <li><button onClick={() => handleNavigate('contact')} className="hover:underline text-left w-full transition-all hover:translate-x-1">సంప్రదించండి</button></li>
              <li><button onClick={() => handleNavigate('editorial-policy')} className="hover:underline text-left w-full transition-all hover:translate-x-1">ఎడిటోరియల్ విధానం</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase mb-6 utility-font tracking-[0.2em] border-b border-black/20 pb-1 text-black">లీగల్</h4>
            <ul className="text-[14px] space-y-3 opacity-90 font-bold text-black">
              <li><button onClick={() => handleNavigate('disclaimer')} className="hover:underline text-left w-full transition-all hover:translate-x-1">నిరాకరణ</button></li>
              <li><button onClick={() => handleNavigate('privacy')} className="hover:underline text-left w-full transition-all hover:translate-x-1">ప్రైవసీ పాలసీ</button></li>
              <li><button onClick={() => handleNavigate('terms')} className="hover:underline text-left w-full transition-all hover:translate-x-1">నిబంధనలు</button></li>
              <li><button onClick={() => setShowAuthorPortal(true)} className="text-[#A52A2A] hover:underline font-black mt-4 block">అడ్మిన్ లాగిన్ / ADMIN</button></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-black/20 text-center text-[10px] font-black uppercase tracking-[0.3em] utility-font opacity-60 text-black">
          <p>© {new Date().getFullYear()} సోనావాలే డైలీ న్యూస్. హైదరాబాదులో తయారైంది.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
