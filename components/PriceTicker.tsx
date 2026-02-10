import React from 'react';
import { PriceData } from '../types';

interface PriceTickerProps {
  prices: PriceData;
  loading: boolean;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ prices, loading }) => {
  return (
    <div className="sticky-ticker h-9 flex items-center overflow-hidden border-b border-black bg-[#F4F1EA]">
      <div className="bg-black text-[#FCFBF9] h-full flex items-center px-4 text-[10px] font-black uppercase tracking-widest z-10 shrink-0">
        Live Wire
      </div>
      <div className="whitespace-nowrap animate-marquee-fast flex items-center gap-12 px-8 text-[11px] font-bold tracking-[0.15em] uppercase italic text-black">
        <div className="flex items-center gap-8">
          <span>SPOT GOLD 24K: ₹{prices.gold24k.toLocaleString()}</span>
          <span className="opacity-30">/</span>
          <span>SILVER INDEX: ₹{prices.silver.toLocaleString()}</span>
          <span className="opacity-30">/</span>
          <span>POT MARKET VOL: NORMAL</span>
          <span className="opacity-30">/</span>
          <span>ABIDS RETAIL: STEADY</span>
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex items-center gap-8">
          <span>SPOT GOLD 24K: ₹{prices.gold24k.toLocaleString()}</span>
          <span className="opacity-30">/</span>
          <span>SILVER INDEX: ₹{prices.silver.toLocaleString()}</span>
          <span className="opacity-30">/</span>
          <span>POT MARKET VOL: NORMAL</span>
          <span className="opacity-30">/</span>
          <span>ABIDS RETAIL: STEADY</span>
        </div>
      </div>
    </div>
  );
};