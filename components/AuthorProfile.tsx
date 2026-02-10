
import React from 'react';

interface AuthorProfileProps {
  author: {
    name: string;
    role: string;
    bio: string;
    handle: string;
  };
}

export const AuthorProfile: React.FC<AuthorProfileProps> = ({ author }) => {
  return (
    <div className="mt-8 py-4 border-t-2 border-black flex flex-col md:flex-row gap-4 items-start">
      <div className="flex-grow">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-2">
          <h4 className="text-xl font-bold italic telugu-headline">{author.name}</h4>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#A52A2A] utility-font">{author.role}</span>
        </div>
        <p className="text-[13px] font-serif leading-relaxed opacity-80 mb-4 max-w-xl telugu-text">
          {author.bio}
        </p>
        <div className="flex items-center gap-4">
          <a href={`https://twitter.com/${author.handle.replace('@', '')}`} target="_blank" className="text-[8px] font-black uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white transition-all utility-font">
            Follow {author.handle}
          </a>
          <button className="text-[8px] font-black uppercase tracking-widest border-b border-black utility-font">Full Archive</button>
        </div>
      </div>
    </div>
  );
};
