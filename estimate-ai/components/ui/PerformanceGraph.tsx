'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface PerformanceGraphProps {
  color?: string;
  points?: number[];
  height?: number;
}

export function PerformanceGraph({ 
  color = '#2563EB', 
  points = [30, 45, 35, 60, 55, 80, 75, 95, 90, 100],
  height = 150 
}: PerformanceGraphProps) {
  const pathData = useMemo(() => {
    const width = 400;
    const step = width / (points.length - 1);
    
    return points.reduce((acc, p, i) => {
      const x = i * step;
      const y = height - (p / 100) * height;
      return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, '');
  }, [points, height]);

  const areaData = useMemo(() => {
    return `${pathData} L 400 ${height} L 0 ${height} Z`;
  }, [pathData, height]);

  return (
    <div className="relative w-full h-[150px] overflow-hidden">
      <svg
        viewBox={`0 0 400 ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaData}
          fill="url(#lineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {points.map((p, i) => {
          const x = i * (400 / (points.length - 1));
          const y = height - (p / 100) * height;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
            />
          );
        })}
      </svg>
    </div>
  );
}
