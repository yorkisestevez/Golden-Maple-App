'use client';

import { useState, useCallback } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  label?: string;
}

export function Slider({ min, max, step, value, onChange, unit, label }: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          <span className="text-xl font-black tracking-tighter text-blue-600 italic">
            {value.toLocaleString()} {unit}
          </span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-slate-100"
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${percentage}%, #F1F5F9 ${percentage}%, #F1F5F9 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{min.toLocaleString()}</span>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{max.toLocaleString()}</span>
      </div>
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: ${isDragging ? '28px' : '24px'};
          height: ${isDragging ? '28px' : '24px'};
          border-radius: 10px;
          background: #2563EB;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          border: 4px solid white;
        }
        input[type='range']::-moz-range-thumb {
          width: ${isDragging ? '28px' : '24px'};
          height: ${isDragging ? '28px' : '24px'};
          border-radius: 10px;
          background: #2563EB;
          cursor: pointer;
          border: 4px solid white;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
}
