
import React, { useState, useEffect } from 'react';
import { PriceTicker } from './components/PriceTicker';
import { PriceDashboard } from './components/PriceDashboard';
import { TrendVisualizer } from './components/TrendVisualizer';
import { DeepDiveGuides } from './components/DeepDiveGuides';
import { AuthorProfile } from './components/AuthorProfile';
import { AuthorPortal } from './components/AuthorPortal';
import { InfoPage } from './components/InfoPage';
import { Calculator } from './components/Calculator';
import { FAQSection } from './components/FAQSection';
import { PriceData, Guide } from './types';
import { HYDERABAD_MARKET_AVERAGES, AUTHORS, GUIDES as INITIAL_GUIDES, ORG_DETAILS } from './constants';
import { initDb, fetchArticles, fetchLatestPrices, savePriceUpdate, fetchPriceHistory } from './lib/db';
import { generateRssFeed } from './lib/rss';
import { generateSitemap } from './lib/sitemap';

const App: React.FC = () => {
  const [prices, setPrices] = useState<PriceData>({
    gold24k: HYDERABAD_MARKET_AVERAGES.gold24k,
    gold22k: HYDERABAD_MARKET_AVERAGES.gold22k,
    silver: HYDERABAD_MARKET_AVERAGES.silver,
    lastUpdated: new Date().toLocaleTimeString('te-IN'),
  });

  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthorPortal, setShowAuthorPortal] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [dynamicGuides, setDynamicGuides] = useState<Guide[]>(INITIAL_GUIDES);
  const [showRss, setShowRss] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'rss.xml') {
        setShowRss(true);
        setShowSitemap(false);
        setCurrentPage(null);
      } else if (hash === 'sitemap.xml') {
        setShowSitemap(true);
        setShowRss(false);
        setCurrentPage(null);
      } else if (hash) {
        setShowRss(false);
        setShowSitemap(false);
        setCurrentPage(hash);
      } else {
        setShowRss(false);
        setShowSitemap(false);
        setCurrentPage(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    const loadData = async () => {
      setLoading(true);
      await initDb();
      
      const [dbArticles, latestPrices, history] = await Promise.all([
        fetchArticles(),
        fetchLatestPrices(),
        fetchPriceHistory(7)
      ]);
      
      setDynamicGuides([...dbArticles, ...INITIAL_GUIDES]);
      
      if (latestPrices) {
        setPrices(latestPrices);
      }
      
      if (history.length > 0) {
        setPriceHistory(history);
      } else {
        // Fallback for empty DB
        const mockHistory = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
          time: day,
          price: (latestPrices?.gold24k || HYDERABAD_MARKET_AVERAGES.gold24k) - (100 * (6 - i))
        }));
        setPriceHistory(mockHistory);
      }
      
      setLoading(false);
    };

    loadData();
    
    const siteSchemaId = 'generic-site-schema';
    if (!document.getElementById(siteSchemaId)) {
      const siteSchema = [
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${ORG_DETAILS.url}/#organization`,
          "name": ORG_DETAILS.name,
          "url": ORG_DETAILS.url,
          "logo": { "@type": "ImageObject", "url": ORG_DETAILS.logo },
          "description": ORG_DETAILS.description,
          "sameAs": ORG_DETAILS.sameAs
        },
        {
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": ORG_DETAILS.name,
          "@id": `${ORG_DETAILS.url}/#localbusiness`,
          "url": ORG_DETAILS.url,
          "telephone": ORG_DETAILS.telephone,
          "address": { "@type": "PostalAddress", ...ORG_DETAILS.address },
          "geo": { "@type": "GeoCoordinates", ...ORG_DETAILS.geo }
        }
      ];
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = siteSchemaId;
      script.text = JSON.stringify(siteSchema);
      document.head.appendChild(script);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleUpdatePrices = async (newPrices: PriceData) => {
    try {
      await savePriceUpdate({
        gold24k: newPrices.gold24k,
        gold22k: newPrices.gold22k,
        silver: newPrices.silver
      });
      
      setPrices(newPrices);
      
      // Refresh history to include new point
      const history = await fetchPriceHistory(7);
      setPriceHistory(history);
      
      localStorage.setItem('sonawale_current_prices', JSON.stringify(newPrices));
    } catch (err) {
      console.error("Failed to sync prices to DB:", err);
      alert("Error updating live feed. Please check connection.");
    }
  };

  const handleNavigate = (slug: string) => {
    window.location.hash = slug;
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  if (showRss) {
    const rssXml = generateRssFeed(dynamicGuides);
    return (
      <div className="p-8 font-mono text-sm whitespace-pre-wrap bg-white text-black min-h-screen">
        <div className="mb-4 flex justify-between border-b pb-4">
          <h1 className="font-bold">RSS 2.0 Syndication Feed</h1>
          <button onClick={handleBack} className="underline">Back to Main Site</button>
        </div>
        {rssXml}
      </div>
    );
  }

  if (showSitemap) {
    const sitemapXml = generateSitemap(dynamicGuides);
    return (
      <div className="p-8 font-mono text-sm whitespace-pre-wrap bg-white text-black min-h-screen">
        <div className="mb-4 flex justify-between border-b pb-4">
          <h1 className="font-bold">Sitemap XML (Schema 0.9)</h1>
          <button onClick={handleBack} className="underline">Back to Main Site</button>
        </div>
        {sitemapXml}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-[1400px] mx-auto bg-[#F4F1EA] md:border-x border-black/20 overflow-x-hidden text-black">
      <PriceTicker prices={prices} loading={loading} />

      {showAuthorPortal && (
        <AuthorPortal 
          onPublish={(art) => setDynamicGuides([art, ...dynamicGuides])} 
          onUpdatePrices={handleUpdatePrices}
          currentPrices={prices}
          onClose={() => setShowAuthorPortal(false)} 
        />
      )}

      <div role="alert" className="bg-[#A52A2A] text-white py-1.5 px-4 text-[10px] font-black uppercase tracking-[0.2em] flex justify-between items-center utility-font shadow-inner overflow-hidden">
        <span className="telugu-text font-bold truncate pr-4 text-[11px]">ముఖ్య వార్తలు: హైదరాబాద్ బులియన్ మార్కెట్‌లో ధరల స్థిరీకరణ</span>
        <span className="shrink-0 whitespace-nowrap opacity-80">FLASH • {prices.lastUpdated}</span>
      </div>

      <header className="py-8 px-4 text-center mx-auto w-full max-w-4xl cursor-pointer" onClick={handleBack}>
        <div className="flex justify-between items-end text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b-2 border-black pb-1 utility-font">
          <span className="telugu-text font-bold">దినపత్రిక</span>
          <span className="hidden xs:inline">Vol. 102 • No. 14</span>
          <time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString('te-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-9xl font-bold masthead-title tracking-tighter leading-none">
            SONAWALE
          </h1>
          <div className="text-lg md:text-2xl font-black mt-1 mb-2 tracking-[0.1em] telugu-headline italic opacity-80">(తెలుగు)</div>
        </div>
      </header>

      <main className="px-4 md:px-8 pb-12 flex-grow">
        {currentPage ? (
          <InfoPage 
            slug={currentPage} 
            onBack={handleBack} 
            guides={dynamicGuides}
            onRead={handleNavigate}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <article className="lg:col-span-8 space-y-10">
              <section className="border-b-[3px] border-black pb-10">
                <div className="flex items-center gap-2 mb-4 text-[#A52A2A] text-[10px] font-black uppercase tracking-widest utility-font">
                  <span className="bg-[#A52A2A] text-white px-1.5 py-0.5 telugu-text font-bold">ప్రత్యేక నివేదిక</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] mb-6 telugu-headline">
                  రెండవ త్రైమాసికంలో భారీగా పెరగనున్న బంగారం దిగుమతులు: హైదరాబాద్ వ్యాపారుల అంచనా
                </h2>
                <div className="flex items-center gap-4 text-xs font-bold mb-8 italic opacity-70 telugu-text border-l-2 border-black/10 pl-4">
                  <span>రచన: <span className="underline">{AUTHORS.skulkarni.name}</span></span>
                  <span className="opacity-30">•</span>
                  <span className="utility-font uppercase text-[9px] tracking-widest">పాట్ మార్కెట్ బ్యూరో</span>
                </div>
                <div className="telugu-text">
                  <p className="text-xl leading-relaxed drop-cap">
                    అంతర్జాతీయ మార్కెట్‌లో బంగారం ధరలు నిలకడగా ఉండటంతో, హైదరాబాద్‌లోని అబిడ్స్ మరియు సికింద్రాబాద్ వ్యాపార కేంద్రాలలో కొత్త స్టాక్ రాక పెరిగింది. చిన్న తరహా నగల వ్యాపారులకు ప్రభుత్వ నిర్ణయాలు సానుకూలంగా మారనున్నాయని విశ్లేషకులు భావిస్తున్నారు.
                  </p>
                </div>
                <AuthorProfile author={AUTHORS.skulkarni} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-1">
                  <h3 className="text-2xl font-bold italic telugu-headline">తాజా వార్తా ప్రవాహం</h3>
                </div>
                {loading ? (
                   <div className="space-y-8">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 animate-pulse border border-black/5" />
                      ))}
                   </div>
                ) : (
                  <DeepDiveGuides guides={dynamicGuides} onRead={handleNavigate} />
                )}
              </section>
            </article>

            <aside className="lg:col-span-4 lg:border-l lg:border-black/20 lg:pl-8 space-y-12">
              <div className="sticky top-6 space-y-12">
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-3 py-1.5 inline-block mb-6 utility-font font-bold">మార్కెట్ సారాంశం</h3>
                  <PriceDashboard prices={prices} loading={loading} />
                </section>

                <section className="bg-white/50 border border-black p-5 shadow-sm">
                  <h3 className="text-xl font-bold italic mb-5 telugu-headline border-b border-black/10 pb-1">ధరల గమనం (7 రోజులు)</h3>
                  <div className="h-[200px]">
                    <TrendVisualizer history={priceHistory} />
                  </div>
                </section>

                <Calculator prices={prices} />
                <FAQSection />

                <div className="p-6 border-2 border-dotted border-black bg-white/40 group text-center">
                  <h4 className="text-[11px] font-black uppercase mb-3 utility-font font-bold">రిపోర్టర్ పోర్టల్</h4>
                  <button onClick={() => setShowAuthorPortal(true)} className="w-full text-[11px] font-black uppercase border-2 border-black px-4 py-4 hover:bg-black hover:text-[#F4F1EA] transition-all utility-font shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]">లాగిన్ / LOGIN</button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t-2 border-black mx-4 py-12 bg-[#F4F1EA]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12 telugu-text">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-3xl font-bold mb-6 telugu-headline border-b-2 border-black/10 pb-1">సోనావాలే</h3>
            <p className="text-[15px] opacity-90 leading-relaxed italic">{ORG_DETAILS.description}</p>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase mb-6 utility-font tracking-[0.2em] border-b border-black/20 pb-1">ముఖ్య విభాగాలు</h4>
            <ul className="text-[13px] space-y-2 font-bold underline decoration-dotted underline-offset-4">
              <li><button onClick={() => handleNavigate('today-gold')}>నేటి బంగారం ధరలు</button></li>
              <li><button onClick={() => handleNavigate('bis-guide')}>BIS హాల్‌మార్క్ గైడ్</button></li>
              <li><a href="#rss.xml" className="text-orange-700 font-black">RSS FEED</a></li>
              <li><a href="#sitemap.xml" className="text-blue-800 font-black uppercase text-[10px]">Sitemap XML</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase mb-6 utility-font tracking-[0.2em] border-b border-black/20 pb-1">సంస్థ సమాచారం</h4>
            <ul className="text-[13px] space-y-2 font-bold underline decoration-dotted underline-offset-4">
              <li><button onClick={() => handleNavigate('about')}>మా గురించి</button></li>
              <li><button onClick={() => handleNavigate('contact')}>సంప్రదించండి</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase mb-6 utility-font tracking-[0.2em] border-b border-black/20 pb-1">లీగల్</h4>
            <ul className="text-[13px] space-y-2 font-bold underline decoration-dotted underline-offset-4">
              <li><button onClick={() => handleNavigate('privacy')}>ప్రైవసీ పాలసీ</button></li>
              <li><button onClick={() => handleNavigate('terms')}>నిబంధనలు</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-black/20 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
          <p>© {new Date().getFullYear()} సోనావాలే డైలీ న్యూస్. హైదరాబాదులో తయారైంది.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
