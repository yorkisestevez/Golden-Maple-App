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
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[var(--brand-muted,#A89F91)]">{label}</span>
          <span className="text-lg font-semibold text-[var(--brand-accent,#D4AF63)]">
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
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--brand-accent, #D4AF63) 0%, var(--brand-accent, #D4AF63) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[var(--brand-muted,#A89F91)]/50">{min.toLocaleString()}</span>
        <span className="text-xs text-[var(--brand-muted,#A89F91)]/50">{max.toLocaleString()}</span>
      </div>
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: ${isDragging ? '24px' : '20px'};
          height: ${isDragging ? '24px' : '20px'};
          border-radius: 50%;
          background: var(--brand-accent, #D4AF63);
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        input[type='range']::-moz-range-thumb {
          width: ${isDragging ? '24px' : '20px'};
          height: ${isDragging ? '24px' : '20px'};
          border-radius: 50%;
          background: var(--brand-accent, #D4AF63);
          cursor: pointer;
          border: none;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
