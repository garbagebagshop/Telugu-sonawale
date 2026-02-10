
import React, { useMemo } from 'react';

interface SEOScorecardProps {
  title: string;
  content: string;
}

export const SEOPlugin: React.FC<SEOScorecardProps> = ({ title, content }) => {
  const analysis = useMemo(() => {
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const checks = [
      { name: 'Headline Strength', pass: title.length > 40, tip: 'Aim for 40-70 characters for Discover cards.' },
      { name: 'Content Depth', pass: wordCount > 300, tip: 'Minimum 300 words recommended for topical authority.' },
      { name: 'Semantic Links', pass: content.includes('href='), tip: 'Add internal links to boost semantic connectivity.' },
      { name: 'Focus Keywords', pass: title.toLowerCase().includes('hyderabad') || title.toLowerCase().includes('gold'), tip: 'Include "Hyderabad" or "Gold" in the H1.' },
      { name: 'Readability', pass: content.length > 0 && content.split('.').length > wordCount / 15, tip: 'Use shorter sentences for better mobile clarity.' }
    ];

    const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
    
    return { score, checks };
  }, [title, content]);

  const getScoreColor = (s: number) => {
    if (s > 80) return '#166534'; // Green
    if (s > 50) return '#854d0e'; // Yellow
    return '#991b1b'; // Red
  };

  return (
    <div className="bg-white border-l border-black p-6 w-80 h-full sticky top-0 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-widest">SEO Scorecard</h3>
        <div 
          className="text-2xl font-black p-2 border-2 border-black" 
          style={{ color: getScoreColor(analysis.score), borderColor: getScoreColor(analysis.score) }}
        >
          {analysis.score}
        </div>
      </div>

      <div className="space-y-6">
        {analysis.checks.map((check, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${check.pass ? 'bg-green-600' : 'bg-red-600 animate-pulse'}`} />
              <span className="text-[11px] font-black uppercase tracking-tight">{check.name}</span>
            </div>
            {!check.pass && (
              <p className="text-[10px] italic opacity-60 leading-tight pl-4 border-l border-black/10">
                {check.tip}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-dotted border-black">
        <h4 className="text-[9px] font-black uppercase mb-2 opacity-40">AEO Optimization Tag</h4>
        <div className="p-2 bg-gray-50 border border-black/5 text-[9px] font-mono break-all">
          {`<meta itemprop="headline" content="${title.slice(0, 30)}...">`}
        </div>
      </div>
    </div>
  );
};
