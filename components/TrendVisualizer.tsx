import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceData } from '../types.ts';
import { COLORS } from '../constants.ts';

interface TrendVisualizerProps {
  prices: PriceData;
}

export const TrendVisualizer: React.FC<TrendVisualizerProps> = ({ prices }) => {
  const data = useMemo(() => {
    const points = [];
    const base = prices.gold24k;
    for (let i = 0; i < 7; i++) {
      points.push({
        day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
        price: Math.round(base - (3 - i) * 150 + (Math.random() - 0.5) * 100),
      });
    }
    return points;
  }, [prices.gold24k]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#ccc" />
          <XAxis 
            dataKey="day" 
            axisLine={{ stroke: '#000', strokeWidth: 1 }} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }} 
          />
          <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
          <Tooltip 
            cursor={{ stroke: '#000', strokeWidth: 1 }}
            contentStyle={{ 
              backgroundColor: '#000', 
              color: '#fff', 
              fontSize: '10px',
              border: 'none',
              borderRadius: '0'
            }} 
          />
          <Area 
            type="stepAfter" 
            dataKey="price" 
            stroke="#000" 
            strokeWidth={2}
            fill="#eee" 
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};