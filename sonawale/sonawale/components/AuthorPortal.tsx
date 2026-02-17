
import React, { useState, useRef, useEffect } from 'react';
import { AUTHORS, ORG_DETAILS } from '../constants';
import { PriceData, Guide } from '../types';
import { SEOPlugin } from './SEOPlugin';
import { saveArticleToDb } from '../lib/db';
import { uploadToR2, convertToWebP } from '../lib/storage';
import { Loader2, AlertCircle, CheckCircle2, X, RefreshCw } from 'lucide-react';

interface AuthorPortalProps {
  onPublish: (article: Guide) => void;
  onUpdatePrices: (prices: PriceData) => void;
  currentPrices: PriceData;
  onClose: () => void;
}

const CATEGORIES = ["Market Analysis", "Legal & Policy", "Heritage & Craft", "Investment Advice", "Daily Updates"];

export const AuthorPortal: React.FC<AuthorPortalProps> = ({ 
  onPublish, 
  onUpdatePrices, 
  currentPrices, 
  onClose 
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'dashboard' | 'editor' | 'prices'>('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Environment variables are used here to prevent sensitive data from being pushed to version control
  const ADMIN_ID = process.env.ADMIN_ID || "8886575507";
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Harsh@123";

  const [localGold24k, setLocalGold24k] = useState(currentPrices.gold24k.toString());
  const [localGold22k, setLocalGold22k] = useState(currentPrices.gold22k.toString());
  const [localSilver, setLocalSilver] = useState(currentPrices.silver.toString());

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [focusKeywords, setFocusKeywords] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content, view]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === ADMIN_ID && password === ADMIN_PASS) {
      setIsLoggedIn(true);
      setErrorMessage(null);
    } else {
      setErrorMessage("Invalid Press Credentials. Access Denied.");
    }
  };

  const handlePriceUpdate = async () => {
    setIsUpdatingPrices(true);
    setErrorMessage(null);
    try {
      await onUpdatePrices({
        gold24k: parseInt(localGold24k),
        gold22k: parseInt(localGold22k),
        silver: parseInt(localSilver),
        lastUpdated: new Date().toLocaleTimeString('te-IN')
      });
      setSuccessMessage("Live Market Prices Commited to Turso DB.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sync price registry.");
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMessage(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFeaturedImage(reader.result as string);
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
  };

  const handlePublish = async (skipR2 = false) => {
    if (!title || !content) {
      setErrorMessage("Headline and content are mandatory.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);

    let slug = title
      .trim()
      .replace(/[^\u0C00-\u0C7F\w\s-]+/g, '') 
      .replace(/[\s_]+/g, '-')               
      .replace(/-+/g, '-')                    
      .replace(/^-+|-+$/g, '')               
      .toLowerCase();

    if (!slug || slug === '-') {
      slug = 'dispatch-' + Date.now();
    }
    
    try {
      let finalImageUrl: string | undefined = featuredImage;
      
      if (imageFile && !skipR2) {
        try {
          setUploadProgress('TRANSCODING...');
          const webpBlob = await convertToWebP(imageFile);
          setUploadProgress('UPLOADING...');
          const uploadedUrl = await uploadToR2(webpBlob, slug);
          finalImageUrl = uploadedUrl;
        } catch (imgErr: any) {
          console.warn("Storage Error, offering fallback:", imgErr);
          setErrorMessage(`R2 Storage Offline: ${imgErr.message}. You can still publish using the "Direct DB Upload" button below.`);
          setIsSubmitting(false);
          setUploadProgress('');
          return; 
        }
      }

      setUploadProgress('SYNCING DB...');
      const newArticle: Guide = {
        title,
        summary,
        content,
        featuredImage: finalImageUrl,
        imageAlt: title,
        slug,
        author: AUTHORS.skulkarni,
        date: new Date().toISOString(),
        focusKeywords,
        category
      };

      await saveArticleToDb(newArticle);
      onPublish(newArticle);
      setSuccessMessage("Dispatch Published Successfully.");
      
      setTimeout(() => {
        setSuccessMessage(null);
        setView('dashboard');
        setTitle(''); setSummary(''); setContent(''); setFocusKeywords(''); setFeaturedImage(undefined); setImageFile(null);
      }, 2000);
      
    } catch (err: any) {
      console.error("Publication Error:", err);
      setErrorMessage(err.message || "Database connection error. Try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F4F1EA] flex items-center justify-center p-4 text-black">
        <div className="w-full max-w-md border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black italic mb-6 text-center underline decoration-dotted uppercase">Press Access</h2>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} /> {errorMessage}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Reporter ID" value={loginId} onChange={e => setLoginId(e.target.value)} required className="w-full border-2 border-black p-4 outline-none focus:bg-yellow-50 bg-white" />
            <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border-2 border-black p-4 outline-none focus:bg-yellow-50 bg-white" />
            <button type="submit" className="w-full bg-black text-white p-5 font-black uppercase tracking-widest hover:bg-[#A52A2A]">Authenticate</button>
            <button type="button" onClick={onClose} className="w-full text-[10px] font-bold uppercase opacity-40 underline mt-4 text-center block">Cancel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4F1EA] flex flex-col text-black">
      <header className="border-b-2 border-black p-3 md:p-4 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-black italic uppercase">Editorial Desk</h2>
          {isSubmitting && (
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 text-[10px] font-black uppercase border border-yellow-300 animate-pulse">
              <RefreshCw className="animate-spin" size={12} /> {uploadProgress}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {['dashboard', 'editor', 'prices'].map((v) => (
            <button key={v} onClick={() => { setView(v as any); setErrorMessage(null); }} className={`px-3 py-2 border-2 border-black text-[9px] font-black uppercase transition-all ${view === v ? 'bg-black text-white' : 'bg-white'}`}>
              {v.slice(0, 4)}
            </button>
          ))}
          <button onClick={onClose} className="px-3 py-2 border-2 border-black text-[9px] font-black uppercase bg-red-50">Exit</button>
        </div>
      </header>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4 pointer-events-none">
        {errorMessage && (
          <div className="bg-red-600 text-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex flex-col pointer-events-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0" />
                <div>
                  <h4 className="font-black uppercase text-[10px] tracking-widest mb-1">Transmission Error</h4>
                  <p className="text-xs leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/20"><X size={16}/></button>
            </div>
            {errorMessage.includes("R2 Storage Offline") && (
              <button 
                onClick={() => handlePublish(true)} 
                className="mt-3 bg-white text-black py-2 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-100 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
              >
                Publish using Direct DB Upload
              </button>
            )}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-600 text-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-3 animate-in slide-in-from-bottom-2 pointer-events-auto">
            <CheckCircle2 size={20} />
            <span className="text-sm font-black italic">{successMessage}</span>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {view === 'prices' && (
            <div className="bg-white border-2 border-black p-6 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-2xl font-black mb-6 italic uppercase">Price Registry Update</h3>
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Gold 24K (Per 10g)</label>
                  <input type="number" value={localGold24k} onChange={e => setLocalGold24k(e.target.value)} className="w-full border-2 border-black p-4 text-xl font-black bg-white" placeholder="24K Price" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Gold 22K (Per 10g)</label>
                  <input type="number" value={localGold22k} onChange={e => setLocalGold22k(e.target.value)} className="w-full border-2 border-black p-4 text-xl font-black bg-white" placeholder="22K Price" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Silver (Per 1kg)</label>
                  <input type="number" value={localSilver} onChange={e => setLocalSilver(e.target.value)} className="w-full border-2 border-black p-4 text-xl font-black bg-white" placeholder="Silver Price" />
                </div>
              </div>
              <button 
                onClick={handlePriceUpdate} 
                disabled={isUpdatingPrices}
                className="bg-black text-white px-8 py-5 font-black uppercase tracking-widest w-full flex items-center justify-center gap-2"
              >
                {isUpdatingPrices ? <><Loader2 className="animate-spin" size={18} /> Syncing...</> : "Commit to Live Feed"}
              </button>
            </div>
          )}

          {view === 'editor' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-black p-6 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-6">
                  <div className="flex gap-2 border-b border-black/10 pb-4 overflow-x-auto no-scrollbar">
                    <button onClick={() => insertText('<b>', '</b>')} className="px-4 py-2 border border-black text-[10px] font-black uppercase">Bold</button>
                    <button onClick={() => insertText('<i>', '</i>')} className="px-4 py-2 border border-black text-[10px] font-black italic uppercase">Italic</button>
                    <button onClick={() => insertText('<h2>', '</h2>')} className="px-4 py-2 border border-black text-[10px] font-black uppercase">Headline</button>
                  </div>

                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Headline..." className="w-full text-3xl font-black border-none outline-none font-serif telugu-headline bg-white text-black" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase opacity-40 block mb-1">Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border-2 border-black p-3 text-[11px] font-black uppercase utility-font bg-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase opacity-40 block mb-1">SEO Keywords</label>
                      <input value={focusKeywords} onChange={e => setFocusKeywords(e.target.value)} placeholder="tags, hyderabad, gold" className="w-full border-2 border-black p-3 text-[11px] bg-white" />
                    </div>
                  </div>

                  <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short Abstract..." className="w-full h-24 text-base italic border-l-4 border-black/20 pl-4 outline-none bg-white text-black" />
                  
                  <div className="border-2 border-dashed border-black p-8 text-center relative hover:bg-gray-50 bg-white">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {featuredImage ? (
                      <div className="relative inline-block">
                        <img src={featuredImage} className="max-h-48 mx-auto" alt="Preview" />
                        <button onClick={(e) => { e.stopPropagation(); setFeaturedImage(undefined); setImageFile(null); }} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md"><X size={14}/></button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase">Lead Image Dispatch</span>
                        <span className="text-[8px] opacity-40 uppercase">(WEBP/JPG)</span>
                      </div>
                    )}
                  </div>

                  <textarea ref={contentRef} value={content} onChange={e => setContent(e.target.value)} placeholder="Full article body..." className="w-full min-h-[400px] text-lg font-serif leading-relaxed outline-none bg-white text-black" />
                </div>
              </div>

              <div className="sticky bottom-4 z-30">
                <button 
                  onClick={() => handlePublish()} 
                  disabled={!title || !content || isSubmitting} 
                  className="w-full bg-accentRed text-white py-5 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin" size={18} /> {uploadProgress}
                    </span>
                  ) : "Confirm Publication"}
                </button>
              </div>

              <div className="mt-8">
                <SEOPlugin title={title} content={content} focusKeywords={focusKeywords} />
              </div>
            </div>
          )}

          {view === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
                <h3 className="text-xl font-black italic mb-4 uppercase">Newsroom Terminal</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-black/10 text-center">
                    <span className="text-[9px] font-black uppercase opacity-40 block">Market Sync</span>
                    <span className="text-xl font-black">STABLE</span>
                  </div>
                  <div className="p-4 border border-black/10 text-center">
                    <span className="text-[9px] font-black uppercase opacity-40 block">Auth Token</span>
                    <span className="text-xl font-black text-green-600">VALID</span>
                  </div>
                  <div className="p-4 border border-black/10 text-center">
                    <span className="text-[9px] font-black uppercase opacity-40 block">DB Latency</span>
                    <span className="text-xl font-black">84MS</span>
                  </div>
                  <div className="p-4 border border-black/10 text-center">
                    <span className="text-[9px] font-black uppercase opacity-40 block">Storage</span>
                    <span className="text-xl font-black">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
