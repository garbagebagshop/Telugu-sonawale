
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendVisualizerProps {
  history: Array<{ time: string; price: number; fullDate?: string }>;
}

export const TrendVisualizer: React.FC<TrendVisualizerProps> = ({ history }) => {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history}>
          <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#ccc" />
          <XAxis 
            dataKey="time" 
            axisLine={{ stroke: '#000', strokeWidth: 1 }} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }} 
          />
          <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
          <Tooltip 
            cursor={{ stroke: '#000', strokeWidth: 1 }}
            contentStyle={{ 
              backgroundColor: '#000', 
              color: '#fff', 
              fontSize: '10px',
              border: 'none',
              borderRadius: '0'
            }} 
            formatter={(value: number) => [`₹${value.toLocaleString()}`, '24K Gold']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#000" 
            strokeWidth={2}
            fill="#eee" 
            fillOpacity={0.8}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
