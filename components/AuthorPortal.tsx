import React, { useState, useRef } from 'react';
import { AUTHORS } from '../constants';
import { PriceData, Guide } from '../types';
import { SEOPlugin } from './SEOPlugin';

interface AuthorPortalProps {
  onPublish: (article: Guide) => void;
  onUpdatePrices: (prices: PriceData) => void;
  currentPrices: PriceData;
  onClose: () => void;
}

type PriceFieldTuple = [string, string, (val: string) => void];

export const AuthorPortal: React.FC<AuthorPortalProps> = ({ 
  onPublish, 
  onUpdatePrices, 
  currentPrices, 
  onClose 
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'dashboard' | 'editor' | 'prices' | 'team'>('dashboard');
  
  const ADMIN_ID = "8886575507";
  const ADMIN_PASS = "Harsh@123";

  const [localGold24k, setLocalGold24k] = useState(currentPrices.gold24k.toString());
  const [localGold22k, setLocalGold22k] = useState(currentPrices.gold22k.toString());
  const [localSilver, setLocalSilver] = useState(currentPrices.silver.toString());

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === ADMIN_ID && password === ADMIN_PASS) {
      setIsLoggedIn(true);
    } else {
      alert("Invalid Press Credentials. Unauthorized access logged.");
    }
  };

  const handlePriceUpdate = () => {
    onUpdatePrices({
      gold24k: parseInt(localGold24k),
      gold22k: parseInt(localGold22k),
      silver: parseInt(localSilver),
      lastUpdated: new Date().toLocaleTimeString('te-IN')
    });
    alert("Live Market Prices Updated Successfully.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    setContent(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handlePublish = () => {
    if (title && content) {
      const newArticle: Guide = {
        title,
        summary,
        content,
        featuredImage: featuredImage || `https://picsum.photos/seed/${Math.random()}/600/400`,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        author: AUTHORS.skulkarni,
        date: new Date().toISOString()
      };
      onPublish(newArticle);
      setView('dashboard');
      setTitle('');
      setSummary('');
      setContent('');
      setFeaturedImage(null);
      alert('Article broadcasted to public feed.');
    }
  };

  const priceFields: PriceFieldTuple[] = [
    ['24K Gold', localGold24k, setLocalGold24k],
    ['22K Gold', localGold22k, setLocalGold22k],
    ['Silver 1kg', localSilver, setLocalSilver]
  ];

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F4F1EA] flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black my-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black italic mb-2 tracking-tighter">Editorial Terminal</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-40">Secure Admin Entry Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase mb-1.5 tracking-wider">Reporter ID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required 
                className="w-full border-2 border-black p-4 text-base bg-white text-black focus:bg-yellow-50 outline-none rounded-none" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase mb-1.5 tracking-wider">Passkey</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full border-2 border-black p-4 text-base bg-white text-black focus:bg-yellow-50 outline-none rounded-none" 
              />
            </div>
            <button type="submit" className="w-full bg-black text-white p-5 font-black uppercase tracking-widest hover:bg-[#A52A2A] transition-all active:translate-y-1">
              Initialize Console
            </button>
            <button type="button" onClick={onClose} className="w-full text-[11px] font-bold uppercase opacity-40 mt-6 underline text-center decoration-dotted underline-offset-4">
              Return to Public Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4F1EA] flex flex-col text-black overflow-hidden">
      <header className="border-b-2 border-black p-3 md:p-5 flex flex-col md:flex-row justify-between items-center bg-white gap-4 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter">Sonawale Admin <span className="text-[10px] font-bold uppercase not-italic bg-black text-white px-2 py-1 ml-2 tracking-widest">Console</span></h2>
        <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
          <button onClick={() => setView('dashboard')} className={`flex-1 md:flex-none text-[11px] font-black uppercase px-4 py-2.5 border-2 border-black transition-all ${view === 'dashboard' ? 'bg-black text-white shadow-none translate-y-0.5' : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>Feed</button>
          <button onClick={() => setView('editor')} className={`flex-1 md:flex-none text-[11px] font-black uppercase px-4 py-2.5 border-2 border-black transition-all ${view === 'editor' ? 'bg-black text-white shadow-none translate-y-0.5' : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>Write</button>
          <button onClick={() => setView('prices')} className={`flex-1 md:flex-none text-[11px] font-black uppercase px-4 py-2.5 border-2 border-black transition-all ${view === 'prices' ? 'bg-black text-white shadow-none translate-y-0.5' : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>Prices</button>
          <button onClick={onClose} className="flex-1 md:flex-none text-[11px] font-black uppercase px-4 py-2.5 border-2 border-black bg-red-50 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Exit</button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto p-4 md:p-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          <div className="flex-grow bg-white border-2 border-black p-5 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            {view === 'dashboard' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-4xl font-black mb-6 border-b-2 border-black pb-3 italic">Editorial Status</h3>
                <div className="space-y-4">
                  <div className="p-6 border-2 border-black bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight">Global Bullion Connectivity</h4>
                      <p className="text-[11px] opacity-50 uppercase tracking-widest font-bold">Live Dispatch • S. Kulkarni</p>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-green-100 text-green-800 px-3 py-1.5 border border-green-800">System Active</span>
                  </div>
                </div>
              </div>
            )}

            {view === 'prices' && (
              <div className="animate-in slide-in-from-bottom-6 duration-300">
                <h3 className="text-4xl font-black mb-8 border-b-2 border-black pb-3 italic text-center md:text-left">Price Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {priceFields.map(([label, val, setter]: PriceFieldTuple, idx: number) => (
                    <div key={idx} className="space-y-2 text-black">
                      <label className="text-[11px] font-black uppercase tracking-widest">{label}</label>
                      <input 
                        type="number" 
                        value={val} 
                        onChange={(e) => setter(e.target.value)} 
                        className="w-full border-2 border-black p-4 text-2xl font-black rounded-none bg-white text-black outline-none focus:bg-yellow-50 shadow-inner" 
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handlePriceUpdate} className="bg-black text-white px-8 py-5 font-black uppercase tracking-[0.2em] w-full hover:bg-[#A52A2A] transition-colors shadow-[4px_4px_0px_0px_rgba(165,42,42,0.3)]">
                  Update Public Ledger
                </button>
              </div>
            )}

            {view === 'editor' && (
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-6 duration-300">
                <h3 className="text-4xl font-black border-b-2 border-black pb-3 italic">Draft Dispatch</h3>
                
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest opacity-40">Featured Media Card</label>
                  <div className="border-4 border-dashed border-black p-8 text-center cursor-pointer bg-white hover:bg-gray-50 transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    {featuredImage ? (
                      <div className="relative inline-block">
                        <img src={featuredImage} alt="Preview" className="max-h-64 mx-auto border-2 border-black shadow-lg" />
                        <span className="absolute -top-3 -right-3 bg-black text-white text-[9px] px-2 py-1 font-black">IMAGE LOADED</span>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-[11px] font-black uppercase italic text-black">Click to Upload News Cover (1200x675)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Article Headline..." 
                    className="w-full text-3xl md:text-5xl font-black border-none outline-none font-serif tracking-tighter placeholder:opacity-10 bg-transparent text-black"
                  />
                  
                  <textarea 
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="News Abstract (displayed on home)..." 
                    className="w-full text-lg md:text-xl font-serif italic border-none outline-none resize-none h-24 border-l-4 border-black/10 pl-5 placeholder:opacity-20 bg-transparent text-black"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2 border-b-2 border-black pb-3 overflow-x-auto no-scrollbar pt-2">
                    <button onClick={() => insertText('<b>', '</b>')} className="shrink-0 px-4 py-2 border-2 border-black text-[11px] font-black uppercase bg-white text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5">Bold</button>
                    <button onClick={() => insertText('<i>', '</i>')} className="shrink-0 px-4 py-2 border-2 border-black text-[11px] font-black uppercase bg-white text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5">Italic</button>
                    <button onClick={() => insertText('<a href="#">', '</a>')} className="shrink-0 px-4 py-2 border-2 border-black text-[11px] font-black uppercase bg-white text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5">Link</button>
                    <button onClick={() => insertText('<h2>', '</h2>')} className="shrink-0 px-4 py-2 border-2 border-black text-[11px] font-black uppercase bg-white text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5">H2</button>
                  </div>
                  <textarea 
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Full dispatch body (HTML supported)..." 
                    className="w-full min-h-[400px] text-lg md:text-2xl font-serif leading-relaxed border-none outline-none resize-none placeholder:opacity-10 bg-transparent text-black"
                  />
                </div>

                <button 
                  onClick={handlePublish}
                  disabled={!title || !content}
                  className="bg-[#A52A2A] text-white px-8 py-6 font-black uppercase tracking-[0.3em] w-full disabled:opacity-20 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all active:bg-black"
                >
                  Broadcast to Feed
                </button>
              </div>
            )}
          </div>

          {view === 'editor' && (
            <div className="hidden lg:block w-80 shrink-0">
              <SEOPlugin title={title} content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};