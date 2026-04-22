'use client';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Home,
  Maximize2,
  Layers,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  Hammer,
  MapPin,
  Waves,
  Mountain,
  Building2,
  Ship,
  Sun,
  CloudRain,
  Snowflake,
  Weight,
  Square,
  CornerUpRight,
  MoreHorizontal,
  CircleDashed,
  Plus,
  X,
  User,
  Loader2,
  Send,
  Shield,
  Clock,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { DeckDiagram } from './DeckDiagram';

import { 
  DeckData, 
  DeckType, 
  Municipality, 
  SiteType, 
  SoilCondition, 
  BuildSeason, 
  IntendedLoad, 
  DeckShape, 
  BoardPattern, 
  RailingType, 
  StairType,
  MATERIAL_TIERS,
  FoundationType,
  INLITE_PRODUCTS
} from '@/lib/decking/types';
import { BrandedMaterialsList } from './BrandedMaterialsList';
import { calculateEstimate, EstimateResult } from '@/lib/decking/calculations';


// --- Components ---

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Setup', 'Design', 'Materials', 'Features', 'Estimate'];
  return (
    <div className="flex justify-between mb-12 relative px-4 max-w-3xl mx-auto">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-accent -translate-y-1/2 z-0" />
      {steps.map((step, i) => (
        <div key={step} className="relative z-10 flex flex-col items-center">
          <div className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
            i + 1 <= currentStep ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-brand-accent text-brand-text-secondary/40"
          )}>
            {i + 1 < currentStep ? <CheckCircle2 size={16} className="sm:w-5 sm:h-5" /> : <span className="number-font font-bold text-sm sm:text-base">{i + 1}</span>}
          </div>
          <span className={cn(
            "text-[10px] uppercase tracking-widest mt-2 font-bold transition-colors duration-500 hidden sm:inline",
            i + 1 <= currentStep ? "text-brand-gold" : "text-brand-text-secondary/20"
          )}>{step}</span>
        </div>
      ))}
    </div>
  );
};

const CardOption = ({ 
  selected, 
  onClick, 
  icon: Icon, 
  title, 
  description,
  badge
}: { 
  selected: boolean; 
  onClick: () => void; 
  icon?: any; 
  title: string; 
  description?: string;
  badge?: string;
  key?: React.Key;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-start p-5 rounded-3xl border-2 text-left transition-all duration-300 group relative overflow-hidden",
      selected 
        ? "bg-brand-gold/10 border-brand-gold shadow-[0_0_20px_rgba(212,176,106,0.15)]" 
        : "bg-white border-black/5 hover:border-brand-gold/30 hover:bg-brand-accent/20"
    )}
  >
    {badge && (
      <div className="absolute top-0 right-0 bg-brand-gold text-brand-text-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
        {badge}
      </div>
    )}
    <div className={cn(
      "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
      selected ? "bg-brand-gold text-brand-text-primary" : "bg-brand-accent text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-text-primary"
    )}>
      {Icon && <Icon size={24} />}
    </div>
    <h3 className={cn(
      "text-lg font-bold mb-1 transition-colors",
      selected ? "text-brand-gold" : "text-brand-text-primary"
    )}>{title}</h3>
    {description && <p className="text-xs text-brand-text-secondary/60 leading-relaxed">{description}</p>}
  </button>
);

const Visualizer = ({ data, onUpdate, activeLevel, estimate }: { data: DeckData, onUpdate: (updates: Partial<DeckData>) => void, activeLevel: number, estimate: EstimateResult }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragHandle, setDragHandle] = useState<string | null>(null);

  const getParams = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const padding = 60;
    const drawWidth = canvas.width - padding * 2;
    const drawHeight = canvas.height - padding * 2;
    
    const currentW = activeLevel === 1 ? data.width : data.width2;
    const currentL = activeLevel === 1 ? data.length : data.length2;
    const currentCW = activeLevel === 1 ? data.cutoutWidth : data.cutoutWidth2;
    const currentCL = activeLevel === 1 ? data.cutoutLength : data.cutoutLength2;
    
    const maxDim = Math.max(currentW, currentL, 10);
    const scale = Math.min(drawWidth / maxDim, drawHeight / maxDim);
    
    const w = currentW * scale;
    const l = currentL * scale;
    const cw = currentCW * scale;
    const cl = currentCL * scale;
    const startX = (canvas.width - w) / 2;
    const startY = (canvas.height - l) / 2;

    return { scale, startX, startY, w, l, cw, cl, canvas };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const params = getParams();
    if (!params) return;
    const { startX, startY, w, l, cw, cl } = params;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const handleSize = 15;
    
    if (data.shape === 'L-Shape') {
      // L-Shape handles
      if (Math.abs(mouseX - (startX + w)) < handleSize && Math.abs(mouseY - (startY + (l - cl) / 2)) < handleSize) {
        setDragHandle('right');
      } else if (Math.abs(mouseX - (startX + (w - cw) / 2)) < handleSize && Math.abs(mouseY - (startY + l)) < handleSize) {
        setDragHandle('bottom');
      } else if (Math.abs(mouseX - (startX + w - cw)) < handleSize && Math.abs(mouseY - (startY + l - cl / 2)) < handleSize) {
        setDragHandle('inner-vertical');
      } else if (Math.abs(mouseX - (startX + w - cw / 2)) < handleSize && Math.abs(mouseY - (startY + l - cl)) < handleSize) {
        setDragHandle('inner-horizontal');
      } else if (Math.abs(mouseX - startX) < handleSize && Math.abs(mouseY - (startY + l / 2)) < handleSize) {
        setDragHandle('left');
      } else if (Math.abs(mouseX - (startX + w / 2)) < handleSize && Math.abs(mouseY - startY) < handleSize) {
        setDragHandle('top');
      }
    } else {
      // Rectangle handles
      if (Math.abs(mouseX - (startX + w)) < handleSize && Math.abs(mouseY - (startY + l)) < handleSize) {
        setDragHandle('corner');
      } else if (Math.abs(mouseX - (startX + w/2)) < handleSize && Math.abs(mouseY - (startY + l)) < handleSize) {
        setDragHandle('bottom');
      } else if (Math.abs(mouseX - (startX + w)) < handleSize && Math.abs(mouseY - (startY + l/2)) < handleSize) {
        setDragHandle('right');
      } else if (Math.abs(mouseX - startX) < handleSize && Math.abs(mouseY - (startY + l/2)) < handleSize) {
        setDragHandle('left');
      } else if (Math.abs(mouseX - (startX + w/2)) < handleSize && Math.abs(mouseY - startY) < handleSize) {
        setDragHandle('top');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragHandle) return;
    const params = getParams();
    if (!params) return;
    const { scale, startX, startY, w, l } = params;

    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newW = Math.max(4, Math.round((mouseX - startX) / scale));
    const newL = Math.max(4, Math.round((mouseY - startY) / scale));

    if (dragHandle === 'corner') {
      onUpdate(activeLevel === 1 ? { width: newW, length: newL } : { width2: newW, length2: newL });
    } else if (dragHandle === 'bottom') {
      onUpdate(activeLevel === 1 ? { length: newL } : { length2: newL });
    } else if (dragHandle === 'right') {
      onUpdate(activeLevel === 1 ? { width: newW } : { width2: newW });
    } else if (dragHandle === 'left') {
      const newWidth = Math.max(4, Math.round((startX + w - mouseX) / scale));
      onUpdate(activeLevel === 1 ? { width: newWidth } : { width2: newWidth });
    } else if (dragHandle === 'top') {
      const newLength = Math.max(4, Math.round((startY + l - mouseY) / scale));
      onUpdate(activeLevel === 1 ? { length: newLength } : { length2: newLength });
    } else if (dragHandle === 'inner-vertical') {
      // mouseX determines the inner vertical line position: startX + w - cw
      // so new_cw = w - (mouseX - startX) / scale
      const currentW = activeLevel === 1 ? data.width : data.width2;
      const newCW = Math.max(1, Math.min(currentW - 1, Math.round(currentW - (mouseX - startX) / scale)));
      onUpdate(activeLevel === 1 ? { cutoutWidth: newCW } : { cutoutWidth2: newCW });
    } else if (dragHandle === 'inner-horizontal') {
      // mouseY determines the inner horizontal line position: startY + l - cl
      // so new_cl = l - (mouseY - startY) / scale
      const currentL = activeLevel === 1 ? data.length : data.length2;
      const newCL = Math.max(1, Math.min(currentL - 1, Math.round(currentL - (mouseY - startY) / scale)));
      onUpdate(activeLevel === 1 ? { cutoutLength: newCL } : { cutoutLength2: newCL });
    }
  };

  const handleMouseUp = () => {
    setDragHandle(null);
  };

  useEffect(() => {
    const params = getParams();
    if (!params) return;
    const { scale, startX, startY, w, l, cw, cl, canvas } = params;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw House Wall if Attached
    if (data.deckType === 'Attached') {
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX - 20, startY);
      ctx.lineTo(startX + w + 20, startY);
      ctx.stroke();
      
      ctx.fillStyle = '#111111';
      ctx.font = '10px Montserrat';
      ctx.fillText('HOUSE EXTERIOR WALL', startX + w/2 - 50, startY - 10);
    }

    // Draw Deck Shape
    ctx.strokeStyle = '#D4B06A';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(212, 176, 106, 0.05)';
    
    ctx.beginPath();
    if (data.shape === 'Rectangle') {
      ctx.rect(startX, startY, w, l);
    } else if (data.shape === 'L-Shape') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + w, startY);
      ctx.lineTo(startX + w, startY + l - cl);
      ctx.lineTo(startX + w - cw, startY + l - cl);
      ctx.lineTo(startX + w - cw, startY + l);
      ctx.lineTo(startX, startY + l);
      ctx.closePath();
    } else if (data.shape === 'Multi-corner') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + w, startY);
      ctx.lineTo(startX + w, startY + l * 0.7);
      ctx.lineTo(startX + w * 0.7, startY + l);
      ctx.lineTo(startX, startY + l);
      ctx.closePath();
    } else if (data.shape === 'Curved') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + w, startY);
      ctx.lineTo(startX + w, startY + l * 0.6);
      ctx.quadraticCurveTo(startX + w/2, startY + l, startX, startY + l * 0.6);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    // Draw Joists (faint dotted lines)
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    const jSpacing = (data.joistSpacing / 12) * scale;
    for (let x = startX + jSpacing; x < startX + w; x += jSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + l);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Board Pattern
    ctx.strokeStyle = 'rgba(212, 176, 106, 0.2)';
    const bSpacing = (6 / 12) * scale; // 6 inch boards
    if (data.pattern === 'Straight') {
      for (let y = startY + bSpacing; y < startY + l; y += bSpacing) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + w, y);
        ctx.stroke();
      }
    } else if (data.pattern === 'Diagonal') {
      for (let i = -l; i < w + l; i += bSpacing * 1.4) {
        ctx.beginPath();
        ctx.moveTo(startX + i, startY);
        ctx.lineTo(startX + i - l, startY + l);
        ctx.stroke();
      }
    }

    // Draw Breaker Boards
    if (estimate.breakerInfo?.required) {
      const positions = activeLevel === 1 ? estimate.breakerInfo.positions1 : estimate.breakerInfo.positions2;
      
      let breakerColor = '#506070'; // Composite default
      if (data.deckingMaterial === 'pine') breakerColor = '#6B5030';
      else if (data.deckingMaterial === 'cedar') breakerColor = '#5A4020';

      const boardPixelHeight = (5.5 / 12) * scale;
      
      positions.forEach(pos => {
        const canvas_y = startY + (pos * scale);
        
        let drawW = w;
        if (data.shape === 'L-Shape' && canvas_y > startY + l - cl) {
           drawW = w - cw;
        }

        if (canvas_y < startY + l) {
          ctx.fillStyle = breakerColor;
          ctx.beginPath();
          ctx.rect(startX, canvas_y - boardPixelHeight/2, drawW, boardPixelHeight);
          ctx.fill();
          
          ctx.fillStyle = '#C9922A';
          ctx.font = 'bold 10px Inter';
          ctx.fillText('B', startX + drawW + 5, canvas_y + 3);
          
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(201, 146, 42, 0.4)';
          ctx.moveTo(startX, canvas_y);
          ctx.lineTo(startX + drawW, canvas_y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // Draw Footings
    ctx.fillStyle = '#D4B06A';
    const footingCount = Math.max(4, Math.ceil((2 * (activeLevel === 1 ? data.width + data.length : data.width2 + data.length2)) / 8));
    const footingsPerRow = Math.ceil(footingCount / 2);
    for (let i = 0; i < footingsPerRow; i++) {
      const fx = startX + (i * (w / (footingsPerRow - 1)));
      ctx.beginPath();
      ctx.arc(fx, startY + l, 4, 0, Math.PI * 2);
      ctx.fill();
      if (data.deckType !== 'Attached') {
        ctx.beginPath();
        ctx.arc(fx, startY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Handles
    ctx.fillStyle = '#D4B06A';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    let handles: {x: number, y: number}[] = [];
    
    if (data.shape === 'L-Shape') {
      handles = [
        { x: startX + w, y: startY + (l - cl) / 2 }, // Right
        { x: startX + (w - cw) / 2, y: startY + l }, // Bottom
        { x: startX + w - cw, y: startY + l - cl / 2 }, // Inner vertical
        { x: startX + w - cw / 2, y: startY + l - cl }, // Inner horizontal
        { x: startX, y: startY + l / 2 }, // Left
        { x: startX + w / 2, y: startY } // Top
      ];
    } else {
      handles = [
        { x: startX + w, y: startY + l }, // Corner
        { x: startX + w/2, y: startY + l }, // Bottom
        { x: startX + w, y: startY + l/2 }, // Right
        { x: startX, y: startY + l/2 }, // Left
        { x: startX + w/2, y: startY } // Top
      ];
    }
    
    handles.forEach(h => {
      ctx.beginPath();
      ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Dimensions
    ctx.fillStyle = '#111111';
    ctx.font = '12px DM Mono';
    ctx.fillText(`${activeLevel === 1 ? data.width : data.width2} ft`, startX + w/2 - 15, startY - 10);
    
    ctx.save();
    ctx.translate(startX - 20, startY + l/2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${activeLevel === 1 ? data.length : data.length2} ft`, -15, 0);
    ctx.restore();
    
    if (data.shape === 'L-Shape') {
      // Draw cutout dimensions
      ctx.fillText(`${activeLevel === 1 ? data.cutoutWidth : data.cutoutWidth2} ft`, startX + w - cw/2 - 15, startY + l - cl - 10);
      
      ctx.save();
      ctx.translate(startX + w - cw - 20, startY + l - cl/2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${activeLevel === 1 ? data.cutoutLength : data.cutoutLength2} ft`, -15, 0);
      ctx.restore();
    }

  }, [data, activeLevel, estimate]);

  return (
    <div className="card-slate p-6 flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-widest text-brand-text-secondary mb-4 font-bold flex items-center gap-2">
        <Maximize2 size={12} /> Live Drafting View (Drag Handles to Resize)
      </div>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={300} 
        className={cn(
          "bg-brand-accent/20 rounded-3xl border border-black/5 touch-none",
          dragHandle ? "cursor-grabbing" : "cursor-crosshair"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
      <div className="grid grid-cols-4 gap-4 w-full mt-6">
        <div className="text-center">
          <div className="text-[10px] text-brand-text-secondary uppercase font-bold">Area</div>
          <div className="number-font text-brand-gold text-lg">
            {(() => {
              let a1 = data.width * data.length;
              if (data.shape === 'L-Shape') a1 -= data.cutoutWidth * data.cutoutLength;
              let a2 = data.levels > 1 ? data.width2 * data.length2 : 0;
              if (data.levels > 1 && data.shape === 'L-Shape') a2 -= data.cutoutWidth2 * data.cutoutLength2;
              return a1 + a2;
            })()} <span className="text-xs">sqft</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-brand-text-secondary uppercase font-bold">Perimeter</div>
          <div className="number-font text-brand-gold text-lg">
            {2 * (data.width + data.length) + (data.levels > 1 ? 2 * (data.width2 + data.length2) : 0)} <span className="text-xs">lf</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-brand-text-secondary uppercase font-bold">Est. Boards</div>
          <div className="number-font text-brand-gold text-lg">
            {(() => {
              let a1 = data.width * data.length;
              if (data.shape === 'L-Shape') a1 -= data.cutoutWidth * data.cutoutLength;
              let a2 = data.levels > 1 ? data.width2 * data.length2 : 0;
              if (data.levels > 1 && data.shape === 'L-Shape') a2 -= data.cutoutWidth2 * data.cutoutLength2;
              return Math.ceil((a1 + a2) / 5.5);
            })()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-brand-text-secondary uppercase font-bold">Est. Joists</div>
          <div className="number-font text-brand-gold text-lg">{Math.floor(data.width / (data.joistSpacing / 12)) + (data.levels > 1 ? Math.floor(data.width2 / (data.joistSpacing / 12)) : 0) + 1}</div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

import { type Contractor } from '@/lib/types';
import { type DeckingSettings, DEFAULT_DECK_DATA } from '@/lib/decking/types';

interface DeckingEstimatorShellProps {
  contractor: Contractor;
  settings: DeckingSettings;
  source?: 'website' | 'embed' | 'direct';
}

export function DeckingEstimatorShell({ contractor, settings, source = 'website' }: DeckingEstimatorShellProps) {
  const [step, setStep] = useState(1);
  const storageKey = `deckcraft-${contractor.slug}-draft`;

  // Lead capture state
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Save/resume state
  const [draftRestored, setDraftRestored] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [data, setData] = useState<DeckData>({
    deckType: 'Attached',
    municipality: 'Toronto',
    siteType: 'Standard',
    soilCondition: 'Unknown',
    buildSeason: 'Spring-Summer',
    intendedLoad: 'Standard',
    foundation: 'Concrete Piers',
    width: 16,
    length: 12,
    height: 36,
    cutoutWidth: 8,
    cutoutLength: 6,
    width2: 12,
    length2: 10,
    height2: 12,
    cutoutWidth2: 6,
    cutoutLength2: 5,
    shape: 'Rectangle',
    levels: 1,
    pattern: 'Straight',
    deckingMaterial: 'pine',
    framingSize: '2x10',
    boardWidth: 5.5,
    joistSpacing: 16,
    fasteningSystem: 'Face',
    pictureFrameRows: 0,
    hasInlay: false,
    inlayLf: 0,
    railingType: 'Aluminum',
    railingLf: 40,
    stairFlights: 1,
    stairWidth: 48,
    stairType: 'Straight',
    stairPosition: 'Front',
    stairOffset: 50,
    lightingSystem: {
      selectedItems: [],
      wireDistance: 20
    },
    benchLf: 0,
    privacySqft: 0,
    hasDrainage: false,
    hasDemo: false,
    pergolaSqft: 0,
    customerName: '',
    projectAddress: '',
    scopeOfWork: 'Professional installation of a custom outdoor deck system including framing, decking, and finishing as per selected specifications. All work to be completed to local building codes and industry best practices.'
  });

  const [activeLevel, setActiveLevel] = useState<1 | 2>(1);

  const estimate = useMemo(() => calculateEstimate(data, settings), [data, settings]);

  const handleOverride = (itemName: string, field: 'qty' | 'cost', value: number) => {
    const currentOverrides = data.customOverrides || {};
    const itemOverride = currentOverrides[itemName] || {};
    
    updateData({
      customOverrides: {
        ...currentOverrides,
        [itemName]: {
          ...itemOverride,
          [field]: value
        }
      }
    });
  };

  // --- Save & Resume ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.deckType === 'string') {
          setData(prev => ({ ...prev, ...parsed }));
          setDraftRestored(true);
          setTimeout(() => setDraftRestored(false), 4000);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [data, storageKey]);

  const handleStartFresh = () => {
    try { localStorage.removeItem(storageKey); } catch {}
    setData(DEFAULT_DECK_DATA);
    setStep(1);
    setLeadSubmitted(false);
    setValidationErrors({});
  };

  // --- Validation ---
  const validateStep = (s: number): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (s === 2) {
      const w = data.width, l = data.length, h = data.height;
      if (w <= 0 || w > 100) errors.width = 'Width must be 1–100 ft';
      if (l <= 0 || l > 100) errors.length = 'Length must be 1–100 ft';
      if (h <= 0 || h > 240) errors.height = 'Height must be 1–240 in';
    }
    if (s === 4) {
      if (data.stairFlights > 0 && data.stairWidth <= 0) errors.stairWidth = 'Stair width required';
    }
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const nextStep = () => {
    const { valid, errors } = validateStep(step);
    if (!valid) { setValidationErrors(errors); return; }
    setValidationErrors({});
    setStep(s => Math.min(s + 1, 5));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateData = (updates: Partial<DeckData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setValidationErrors({});
  };

  // --- Lead Capture ---
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      setLeadError('Name and phone number are required');
      return;
    }
    setLeadLoading(true);
    setLeadError('');
    try {
      const res = await fetch('/api/webhook/decking-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractor.id,
          name: leadName.trim(),
          phone: leadPhone.trim(),
          email: leadEmail.trim() || null,
          notes: leadNotes.trim() || null,
          source,
          estimate_mid: estimate.total,
          estimate_low: Math.round(estimate.total * 0.9),
          estimate_high: Math.round(estimate.total * 1.1),
          selected_features: [{ key: 'decking', label: `${data.width}x${data.length} ${data.shape} Deck`, qty: estimate.area, unit: 'sqft' }],
          breakdown: estimate.sections,
          decking_data: data,
          site_condition: data.siteType,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setLeadSubmitted(true);
    } catch {
      setLeadError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        ['--brand-bg' as string]: contractor.background_color || '#F9FAFB',
        ['--brand-card' as string]: contractor.card_color || '#FFFFFF',
        ['--brand-text' as string]: contractor.text_color || '#111827',
        ['--brand-accent' as string]: contractor.primary_color || '#2563EB',
        ['--brand-secondary' as string]: contractor.secondary_color || '#059669',
        backgroundColor: 'var(--brand-bg)',
        color: 'var(--brand-text)',
      }}
    >
      {/* Header */}
      <header className="py-8 px-6 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {contractor.logo_url ? (
              <img src={contractor.logo_url} alt={contractor.company_name} className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-[var(--brand-accent)] rounded-full flex items-center justify-center text-white shadow-sm">
                <Hammer size={24} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{contractor.company_name}</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">DeckCraft Pro Estimator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleStartFresh}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 font-bold transition-colors"
            >
              <RotateCcw size={12} /> Start Fresh
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <CircleDashed size={14} className="text-[var(--brand-accent)] animate-pulse" />
              DECKCRAFT_PRO
            </div>
          </div>
        </div>
      </header>

      {/* Draft Restored Toast */}
      <AnimatePresence>
        {draftRestored && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] bg-white border border-emerald-200 shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
          >
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="font-bold text-slate-700">Draft restored from your last session</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <StepIndicator currentStep={step} />

        <div className="min-h-[400px]">
          {/* STEP 1: Project Setup */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="card-slate p-8">
                <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><User className="text-brand-gold" /> 00. Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-2">Customer Name</label>
                    <input 
                      type="text" 
                      value={data.customerName} 
                      onChange={(e) => updateData({ customerName: e.target.value })}
                      className="input-field w-full"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-2">Project Address</label>
                    <input 
                      type="text" 
                      value={data.projectAddress} 
                      onChange={(e) => updateData({ projectAddress: e.target.value })}
                      className="input-field w-full"
                      placeholder="e.g. 123 Deck St, Toronto"
                    />
                  </div>
                </div>
              </div>

              <div className="card-slate p-8">
                <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Home className="text-brand-gold" /> 01. Deck Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CardOption 
                    selected={data.deckType === 'Attached'} 
                    onClick={() => updateData({ deckType: 'Attached' })}
                    icon={Home}
                    title="Attached"
                    description="Bolted to house ledger. Strongest connection."
                  />
                  <CardOption 
                    selected={data.deckType === 'Freestanding'} 
                    onClick={() => updateData({ deckType: 'Freestanding' })}
                    icon={Maximize2}
                    title="Freestanding"
                    description="Independent structure. No house connection."
                  />
                  <CardOption 
                    selected={data.deckType === 'Floating'} 
                    onClick={() => updateData({ deckType: 'Floating' })}
                    icon={Layers}
                    title="Floating"
                    description="Low-profile. Sits on deck blocks. Permit-free options."
                  />
                  <CardOption 
                    selected={data.deckType === 'Add-on'} 
                    onClick={() => updateData({ deckType: 'Add-on' })}
                    icon={Plus}
                    title="Add-on"
                    description="Addition to existing deck. Requires structural tie-in."
                  />
                </div>
              </div>

              {data.deckType === 'Add-on' && (
                <div className="card-slate p-8 bg-brand-gold/5 border-brand-gold/30">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Plus className="text-brand-gold" /> Add-on Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-2">Transition Labor ($)</label>
                      <input 
                        type="number" 
                        value={data.addOnTransitionLabor || 850} 
                        onChange={(e) => updateData({ addOnTransitionLabor: parseFloat(e.target.value) })}
                        className="input-field w-full"
                        placeholder="850"
                      />
                      <p className="text-[10px] text-brand-text-secondary/40 mt-1 italic">Leveling & Siding Prep</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-2">Structural Tie-in Hardware ($)</label>
                      <input 
                        type="number" 
                        value={data.addOnHardwareCost || 450} 
                        onChange={(e) => updateData({ addOnHardwareCost: parseFloat(e.target.value) })}
                        className="input-field w-full"
                        placeholder="450"
                      />
                      <p className="text-[10px] text-brand-text-secondary/40 mt-1 italic">Thru-bolts/SDWS screws</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block mb-2">Ledger Flashing (LF)</label>
                      <input 
                        type="number" 
                        value={data.addOnFlashingLf || data.width} 
                        onChange={(e) => updateData({ addOnFlashingLf: parseFloat(e.target.value) })}
                        className="input-field w-full"
                        placeholder={data.width.toString()}
                      />
                      <p className="text-[10px] text-brand-text-secondary/40 mt-1 italic">Connection width</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><MapPin className="text-brand-gold" /> 02. Municipality</h2>
                  <div className="space-y-3">
                    {(['Toronto', 'Barrie', 'Simcoe County', 'Burlington-Oakville', 'Rural-Other'] as Municipality[]).map(m => (
                      <button 
                        key={m}
                        onClick={() => updateData({ municipality: m })}
                        className={cn(
                          "w-full text-left px-6 py-3 rounded-full border transition-all font-bold",
                          data.municipality === m ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/60 hover:border-brand-gold/30"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Waves className="text-brand-gold" /> 03. Site Type</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Standard', 'Waterfront-Lakefront', 'Hillside', 'Urban Tight', 'Island-Ferry'] as SiteType[]).map(s => (
                      <button 
                        key={s}
                        onClick={() => updateData({ siteType: s })}
                        className={cn(
                          "text-xs px-3 py-4 rounded-3xl border transition-all flex flex-col items-center gap-2 text-center font-bold",
                          data.siteType === s ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/60 hover:border-brand-gold/30"
                        )}
                      >
                        {s === 'Standard' && <Building2 size={18} />}
                        {s === 'Waterfront-Lakefront' && <Waves size={18} />}
                        {s === 'Hillside' && <Mountain size={18} />}
                        {s === 'Urban Tight' && <Building2 size={18} />}
                        {s === 'Island-Ferry' && <Ship size={18} />}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Weight className="text-brand-gold" /> 04. Soil Condition</h2>
                  <div className="space-y-4">
                    <label className="text-xs text-brand-text-secondary/60 block font-bold uppercase tracking-widest">Select Soil Type</label>
                    <select 
                      value={data.soilCondition}
                      onChange={(e) => updateData({ soilCondition: e.target.value as SoilCondition })}
                      className="w-full input-field text-sm font-bold"
                    >
                      {['Unknown', 'Sandy', 'Clay', 'Shallow Bedrock', 'Fill'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Sun className="text-brand-gold" /> 05. Build Season</h2>
                  <div className="space-y-4">
                    <label className="text-xs text-brand-text-secondary/60 block font-bold uppercase tracking-widest">Planned Construction</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(['Spring-Summer', 'Fall', 'Winter'] as BuildSeason[]).map(s => (
                        <button 
                          key={s}
                          onClick={() => updateData({ buildSeason: s })}
                          className={cn(
                            "w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                            data.buildSeason === s ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40"
                          )}
                        >
                          {s === 'Spring-Summer' && <Sun size={14} />}
                          {s === 'Fall' && <CloudRain size={14} />}
                          {s === 'Winter' && <Snowflake size={14} />}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Weight className="text-brand-gold" /> 06. Intended Load</h2>
                  <div className="space-y-4">
                    <label className="text-xs text-brand-text-secondary/60 block font-bold uppercase tracking-widest">Usage Profile</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(['Standard', 'Heavy'] as IntendedLoad[]).map(l => (
                        <button 
                          key={l}
                          onClick={() => updateData({ intendedLoad: l })}
                          className={cn(
                            "w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                            data.intendedLoad === l ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-slate p-8 md:col-span-3 lg:col-span-1">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary"><Layers className="text-brand-gold" /> 07. Foundation</h2>
                  <div className="space-y-4">
                    <label className="text-xs text-brand-text-secondary/60 block font-bold uppercase tracking-widest">System Type</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(['Concrete Piers', 'Helical Piles', 'Deck Blocks'] as FoundationType[]).map(f => (
                        <button 
                          key={f}
                          onClick={() => updateData({ foundation: f })}
                          className={cn(
                            "w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                            data.foundation === f ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Dimensions & Shape */}
          {step === 2 && (
            <div
              
              
              
              
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="card-slate p-8">
                    <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">01. Dimensions</h2>
                    {data.levels > 1 && (
                      <div className="flex gap-4 mb-8">
                        {[1, 2].map(l => (
                          <button 
                            key={l}
                            onClick={() => setActiveLevel(l as 1 | 2)}
                            className={cn(
                              "px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all border-2",
                              activeLevel === l ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-gold hover:border-brand-gold/30"
                            )}
                          >
                            Level {l}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={cn("bg-brand-accent/20 p-6 rounded-3xl border", validationErrors.width ? "border-red-400" : "border-black/5")}>
                        <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">
                          {activeLevel === 1 ? 'Width (ft)' : 'L2 Width (ft)'}
                        </label>
                        <input
                          type="number"
                          value={activeLevel === 1 ? data.width : data.width2}
                          onChange={(e) => updateData(activeLevel === 1 ? { width: Number(e.target.value) } : { width2: Number(e.target.value) })}
                          className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold"
                        />
                        <div className="h-1 w-full bg-brand-accent mt-4 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold transition-all" style={{ width: `${((activeLevel === 1 ? data.width : data.width2) / 60) * 100}%` }} />
                        </div>
                        {validationErrors.width && <p className="text-xs text-red-500 mt-2 font-bold">{validationErrors.width}</p>}
                      </div>
                      <div className={cn("bg-brand-accent/20 p-6 rounded-3xl border", validationErrors.length ? "border-red-400" : "border-black/5")}>
                        <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">
                          {activeLevel === 1 ? 'Length (ft)' : 'L2 Length (ft)'}
                        </label>
                        <input
                          type="number"
                          value={activeLevel === 1 ? data.length : data.length2}
                          onChange={(e) => updateData(activeLevel === 1 ? { length: Number(e.target.value) } : { length2: Number(e.target.value) })}
                          className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold"
                        />
                        <div className="h-1 w-full bg-brand-accent mt-4 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold transition-all" style={{ width: `${((activeLevel === 1 ? data.length : data.length2) / 60) * 100}%` }} />
                        {validationErrors.length && <p className="text-xs text-red-500 mt-2 font-bold">{validationErrors.length}</p>}
                        </div>
                      </div>
                      <div className={cn("bg-brand-accent/20 p-6 rounded-3xl border", validationErrors.height ? "border-red-400" : "border-black/5")}>
                        <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">
                          {activeLevel === 1 ? 'Height (in)' : 'L2 Height (in)'}
                        </label>
                        <input
                          type="number"
                          value={activeLevel === 1 ? data.height : data.height2}
                          onChange={(e) => updateData(activeLevel === 1 ? { height: Number(e.target.value) } : { height2: Number(e.target.value) })}
                          className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold"
                        />
                        <div className="h-1 w-full bg-brand-accent mt-4 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold transition-all" style={{ width: `${((activeLevel === 1 ? data.height : data.height2) / 120) * 100}%` }} />
                        </div>
                        {validationErrors.height && <p className="text-xs text-red-500 mt-2 font-bold">{validationErrors.height}</p>}
                      </div>

                      {data.shape === 'L-Shape' && (
                        <>
                          <div className="bg-brand-accent/20 p-6 rounded-3xl border border-black/5">
                            <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">
                              {activeLevel === 1 ? 'Inner Width (ft)' : 'L2 Inner Width (ft)'}
                            </label>
                            <input 
                              type="number" 
                              value={activeLevel === 1 ? data.cutoutWidth : data.cutoutWidth2} 
                              onChange={(e) => updateData(activeLevel === 1 ? { cutoutWidth: Number(e.target.value) } : { cutoutWidth2: Number(e.target.value) })}
                              className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold"
                            />
                            <div className="h-1 w-full bg-brand-accent mt-4 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-gold transition-all" style={{ width: `${((activeLevel === 1 ? data.cutoutWidth : data.cutoutWidth2) / 60) * 100}%` }} />
                            </div>
                          </div>
                          <div className="bg-brand-accent/20 p-6 rounded-3xl border border-black/5">
                            <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">
                              {activeLevel === 1 ? 'Inner Length (ft)' : 'L2 Inner Length (ft)'}
                            </label>
                            <input 
                              type="number" 
                              value={activeLevel === 1 ? data.cutoutLength : data.cutoutLength2} 
                              onChange={(e) => updateData(activeLevel === 1 ? { cutoutLength: Number(e.target.value) } : { cutoutLength2: Number(e.target.value) })}
                              className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold"
                            />
                            <div className="h-1 w-full bg-brand-accent mt-4 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-gold transition-all" style={{ width: `${((activeLevel === 1 ? data.cutoutLength : data.cutoutLength2) / 60) * 100}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="card-slate p-8">
                    <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">02. Deck Shape</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <CardOption 
                        selected={data.shape === 'Rectangle'} 
                        onClick={() => updateData({ shape: 'Rectangle' })}
                        icon={Square}
                        title="Rectangle"
                      />
                      <CardOption 
                        selected={data.shape === 'L-Shape'} 
                        onClick={() => updateData({ shape: 'L-Shape' })}
                        icon={CornerUpRight}
                        title="L-Shape"
                      />
                      <CardOption 
                        selected={data.shape === 'Multi-corner'} 
                        onClick={() => updateData({ shape: 'Multi-corner' })}
                        icon={MoreHorizontal}
                        title="Multi-corner"
                      />
                      <CardOption 
                        selected={data.shape === 'Curved'} 
                        onClick={() => updateData({ shape: 'Curved' })}
                        icon={CircleDashed}
                        title="Curved"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-slate p-8">
                      <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">03. Number of Levels</h2>
                      <div className="flex gap-4">
                        {[1, 2, 3].map(l => (
                          <button 
                            key={l}
                            onClick={() => updateData({ levels: l })}
                            className={cn(
                              "flex-1 py-4 rounded-3xl border-2 transition-all number-font text-xl font-bold",
                              data.levels === l ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="card-slate p-8">
                      <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">04. Board Pattern</h2>
                      <div className="space-y-4">
                        <label className="text-xs text-brand-text-secondary/60 block font-bold uppercase tracking-widest">Select Layout</label>
                        <select 
                          value={data.pattern}
                          onChange={(e) => updateData({ pattern: e.target.value as BoardPattern })}
                          className="w-full input-field font-bold"
                        >
                          {['Straight', 'Diagonal', 'Picture Frame', 'Herringbone'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:sticky lg:top-32 h-fit space-y-6">
                  <Visualizer data={data} onUpdate={updateData} activeLevel={activeLevel} estimate={estimate} />
                  
                  {estimate.breakerInfo?.required && (
                    <div className="card-slate p-6 bg-brand-gold/5 border-brand-gold/30 flex gap-4 items-start">
                      <div className="text-brand-gold mt-1"><CheckCircle2 size={24} /></div>
                      <div>
                        <h4 className="font-bold text-brand-text-primary mb-2">Breaker Boards Included — Best Practice</h4>
                        <p className="text-xs text-brand-text-secondary/80 leading-relaxed">
                          Your deck depth exceeds the standard {estimate.breakerInfo.standardLength}ft board length. {estimate.breakerInfo.rows} breaker board row(s) will be installed at {estimate.breakerInfo.interval}ft intervals, eliminating visible butt joint seam lines across the deck surface. Blocking has been added to the framing beneath each breaker row to provide full bearing for both board ends.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Material Selection */}
          {step === 3 && (
            <div
              
              
              
              
              className="space-y-8"
            >
              <div className="card-slate p-8">
                <h2 className="text-2xl mb-8 flex items-center gap-3 font-bold text-brand-text-primary">01. Decking Surface</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {settings.materials.filter(m => !m.isHidden).map(m => (
                    <button
                      key={m.id}
                      onClick={() => updateData({ deckingMaterial: m.id })}
                      className={cn(
                        "bg-white p-6 text-left border-2 transition-all group rounded-3xl",
                        data.deckingMaterial === m.id ? "border-brand-gold bg-brand-gold/5 shadow-lg shadow-brand-gold/10" : "border-black/5 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-black/10">
                          <div 
                            className="w-full h-full bg-cover" 
                            style={{ 
                              backgroundImage: `url('https://picsum.photos/seed/${m.id}/100/100')`,
                              filter: m.isComposite ? 'grayscale(0.5)' : 'sepia(0.5)'
                            }} 
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-brand-text-secondary/40 tracking-widest">{m.tier}</div>
                          <div className="number-font text-brand-gold font-bold">{m.priceRange || `$${m.costPerSqft}/sqft`}</div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-brand-text-primary">{m.name}</h3>
                      <p className="text-xs text-brand-text-secondary/60 leading-relaxed">
                        {m.isComposite 
                          ? "Premium composite. Low maintenance, 25-50 year warranty, hidden fasteners." 
                          : "Natural wood. Requires staining, authentic feel, classic Ontario look."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">02. Board Width</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateData({ boardWidth: 5.5 })}
                      className={cn(
                        "py-6 rounded-3xl border-2 transition-all",
                        data.boardWidth === 5.5 ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="text-2xl font-bold number-font mb-1">5.5"</div>
                      <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Standard</div>
                    </button>
                    <button 
                      onClick={() => updateData({ boardWidth: 3.5 })}
                      className={cn(
                        "py-6 rounded-3xl border-2 transition-all",
                        data.boardWidth === 3.5 ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="text-2xl font-bold number-font mb-1">3.5"</div>
                      <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Narrow</div>
                    </button>
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">03. Picture Frame Border</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map(rows => (
                      <button 
                        key={rows}
                        onClick={() => updateData({ pictureFrameRows: rows as any })}
                        className={cn(
                          "py-6 rounded-3xl border-2 transition-all",
                          data.pictureFrameRows === rows ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                        )}
                      >
                        <div className="text-2xl font-bold number-font mb-1">{rows}</div>
                        <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">{rows === 0 ? 'None' : (rows === 1 ? 'Single' : 'Double')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">04. Joist Spacing</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateData({ joistSpacing: 16 })}
                      className={cn(
                        "py-6 rounded-3xl border-2 transition-all",
                        data.joistSpacing === 16 ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="text-2xl font-bold number-font mb-1">16" OC</div>
                      <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Standard</div>
                    </button>
                    <button 
                      onClick={() => updateData({ joistSpacing: 12 })}
                      className={cn(
                        "py-6 rounded-3xl border-2 transition-all",
                        data.joistSpacing === 12 ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="text-2xl font-bold number-font mb-1">12" OC</div>
                      <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Heavy Duty</div>
                    </button>
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">05. Fastening System</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateData({ fasteningSystem: 'Face' })}
                      className={cn(
                        "py-6 rounded-3xl border-2 transition-all",
                        data.fasteningSystem === 'Face' ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="text-xl font-bold mb-1">Face Screws</div>
                      <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Visible</div>
                    </button>
                    <button 
                      onClick={() => updateData({ fasteningSystem: 'Hidden' })}
                      className={cn(
                        "py-6 rounded-3xl border-2 transition-all",
                        data.fasteningSystem === 'Hidden' ? "bg-brand-gold/10 border-brand-gold text-brand-gold" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                      )}
                    >
                      <div className="text-xl font-bold mb-1">Hidden Clips</div>
                      <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Seamless</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-slate p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl flex items-center gap-3 font-bold text-brand-text-primary">06. Custom Inlay</h2>
                  <button 
                    onClick={() => updateData({ hasInlay: !data.hasInlay })}
                    className={cn(
                      "px-6 py-2 rounded-full text-xs font-bold transition-all",
                      data.hasInlay ? "bg-brand-gold text-brand-text-primary" : "bg-brand-accent text-brand-text-secondary/40"
                    )}
                  >
                    {data.hasInlay ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {data.hasInlay && (
                  <div className="bg-brand-accent/20 p-8 rounded-3xl border border-black/5">
                    <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">Linear Feet of Inlay Board</label>
                    <input 
                      type="number" 
                      value={data.inlayLf}
                      onChange={(e) => updateData({ inlayLf: Number(e.target.value) })}
                      className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold"
                    />
                    <p className="text-[10px] text-brand-text-secondary/40 mt-4 italic">Automatically adds ladder blocking to the framing estimate.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Features & Add-Ons */}
          {step === 4 && (
            <div
              
              
              
              
              className="space-y-8"
            >
              <div className="card-slate p-8">
                <h2 className="text-2xl mb-8 flex items-center gap-3 font-bold text-brand-text-primary">01. Railing System</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {(['None', 'Wood Picket', 'Aluminum', 'Cable', 'Glass Panels', 'Trex Select', 'Trex Transcend', 'Fortress AL13', 'TT Classic', 'TT Impression'] as RailingType[]).map(r => (
                    <CardOption 
                      key={r}
                      selected={data.railingType === r}
                      onClick={() => updateData({ railingType: r })}
                      title={r}
                      badge={r.includes('Trex') ? 'Composite' : (r.includes('Fortress') ? 'Aluminum' : undefined)}
                    />
                  ))}
                </div>
                {data.railingType !== 'None' && (
                  <div className="mt-8 flex flex-col md:flex-row items-center gap-8 bg-brand-accent/20 p-8 rounded-3xl border border-black/5">
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block">Linear Feet of Railing</label>
                        {data.railingLf === 0 && (
                          <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Auto-Calculated</span>
                        )}
                      </div>
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <input 
                            type="number" 
                            value={data.railingLf === 0 ? '' : data.railingLf}
                            placeholder={Math.ceil(estimate.calculatedRailingLf).toString()}
                            onChange={(e) => updateData({ railingLf: e.target.value === '' ? 0 : Number(e.target.value) })}
                            className="w-full bg-transparent text-4xl number-font text-brand-gold outline-none font-bold placeholder:text-brand-gold/30"
                          />
                        </div>
                        {data.railingLf > 0 && (
                          <button 
                            onClick={() => updateData({ railingLf: 0 })}
                            className="text-[10px] text-brand-gold hover:text-brand-gold-hover font-bold uppercase tracking-widest mb-2"
                          >
                            Reset to Auto
                          </button>
                        )}
                      </div>
                      <div className="h-1 w-full bg-brand-accent mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold transition-all" style={{ width: `${Math.min(100, ((data.railingLf || estimate.calculatedRailingLf) / 200) * 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-brand-text-secondary/40 mt-2 italic">
                        {data.railingLf === 0 
                          ? `Calculated based on ${data.deckType} perimeter (${Math.ceil(estimate.calculatedRailingLf)} LF total including stairs).`
                          : `Manual override active. Set to 0 to use auto-calculation.`}
                      </p>
                    </div>
                    {data.height > 24 && (
                      <div className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-6 py-4 rounded-2xl border border-brand-gold/20 flex flex-col gap-2 max-w-md">
                        <div className="flex items-center gap-4">
                          <Info size={20} className="shrink-0" /> 
                          <span>ONTARIO CODE: Guard required for decks &gt; 24" (600mm) above grade.</span>
                        </div>
                        <p className="text-[10px] opacity-80 leading-tight">If &gt; 71" (1800mm), railing must be 42" high. Ensure baluster spacing is &lt; 4" (100mm) for non-climbable standards.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">02. Stairs & Access</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-brand-accent/20 p-6 rounded-3xl border border-black/5">
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">Flights</label>
                      <input 
                        type="number" 
                        value={data.stairFlights}
                        onChange={(e) => updateData({ stairFlights: Number(e.target.value) })}
                        className="w-full bg-transparent text-3xl number-font text-brand-gold outline-none font-bold"
                        min="0" max="4"
                      />
                    </div>
                    <div className="bg-brand-accent/20 p-6 rounded-3xl border border-black/5">
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">Width (in)</label>
                      <input 
                        type="number" 
                        value={data.stairWidth}
                        onChange={(e) => updateData({ stairWidth: Number(e.target.value) })}
                        className="w-full bg-transparent text-3xl number-font text-brand-gold outline-none font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">Stair Type</label>
                      <div className="flex gap-2">
                        {(['Straight', 'Winder', 'Landing'] as StairType[]).map(t => (
                          <button 
                            key={t}
                            onClick={() => updateData({ stairType: t })}
                            className={cn(
                              "flex-1 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                              data.stairType === t ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {data.stairFlights > 0 && (
                      <div className="col-span-2 space-y-4 pt-4 border-t border-black/5">
                        <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold block">Stair Placement</label>
                        <div className="flex gap-2">
                          {(['Front', 'Left', 'Right', 'Back'] as const).map(pos => (
                            <button 
                              key={pos}
                              onClick={() => updateData({ stairPosition: pos })}
                              className={cn(
                                "flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                                data.stairPosition === pos ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                              )}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                        <div className="bg-brand-accent/20 p-6 rounded-3xl border border-black/5">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold">Position Offset</label>
                            <span className="text-brand-gold font-bold number-font">{data.stairOffset}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={data.stairOffset}
                            onChange={(e) => updateData({ stairOffset: Number(e.target.value) })}
                            className="w-full accent-brand-gold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">03. in-lite® Lighting System (12V)</h2>
                  <div className="space-y-6">
                    <div className="bg-brand-accent/10 p-6 rounded-3xl border border-black/5">
                      <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4 block">Add Lighting Products</label>
                      <select 
                        className="w-full p-4 rounded-2xl border-2 border-black/5 bg-white focus:border-brand-gold outline-none transition-all text-sm font-bold"
                        onChange={(e) => {
                          if (e.target.value) {
                            const productId = e.target.value;
                            const existing = data.lightingSystem.selectedItems.find(item => item.productId === productId);
                            if (!existing) {
                              updateData({
                                lightingSystem: {
                                  ...data.lightingSystem,
                                  selectedItems: [...data.lightingSystem.selectedItems, { productId, qty: 1 }]
                                }
                              });
                            }
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Select a product to add...</option>
                        {['Transformer', 'Recessed', 'Surface', 'Bollard', 'Accessory'].map(cat => (
                          <optgroup key={cat} label={cat}>
                            {INLITE_PRODUCTS.filter(p => p.category === cat).map(p => (
                              <option key={p.id} value={p.id}>{p.name} - ${p.cost}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      {data.lightingSystem.selectedItems.map((item, idx) => {
                        const product = INLITE_PRODUCTS.find(p => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <div key={item.productId} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                            <div className="flex-1">
                              <div className="text-sm font-bold text-brand-text-primary">{product.name}</div>
                              <div className="text-[10px] text-brand-text-secondary/60 uppercase tracking-widest">{product.category}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  const newItems = [...data.lightingSystem.selectedItems];
                                  if (newItems[idx].qty > 1) {
                                    newItems[idx].qty--;
                                    updateData({ lightingSystem: { ...data.lightingSystem, selectedItems: newItems } });
                                  } else {
                                    updateData({ lightingSystem: { ...data.lightingSystem, selectedItems: newItems.filter((_, i) => i !== idx) } });
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-brand-text-primary transition-colors font-bold"
                              >
                                -
                              </button>
                              <span className="number-font font-bold w-6 text-center">{item.qty}</span>
                              <button 
                                onClick={() => {
                                  const newItems = [...data.lightingSystem.selectedItems];
                                  newItems[idx].qty++;
                                  updateData({ lightingSystem: { ...data.lightingSystem, selectedItems: newItems } });
                                }}
                                className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-brand-text-primary transition-colors font-bold"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => {
                                updateData({
                                  lightingSystem: {
                                    ...data.lightingSystem,
                                    selectedItems: data.lightingSystem.selectedItems.filter((_, i) => i !== idx)
                                  }
                                });
                              }}
                              className="p-2 text-brand-text-secondary/40 hover:text-red-500 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        );
                      })}
                      {data.lightingSystem.selectedItems.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-black/5 rounded-3xl">
                          <p className="text-xs text-brand-text-secondary/40 font-bold uppercase tracking-widest">No lighting products selected</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-brand-accent/20 p-6 rounded-3xl border border-black/5">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] uppercase tracking-widest text-brand-text-secondary/40 font-bold">Wire Distance to Transformer (ft)</label>
                        <span className="text-brand-gold font-bold number-font">{data.lightingSystem.wireDistance} ft</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="200" 
                        step="10"
                        value={data.lightingSystem.wireDistance}
                        onChange={(e) => updateData({ lightingSystem: { ...data.lightingSystem, wireDistance: Number(e.target.value) } })}
                        className="w-full accent-brand-gold"
                      />
                    </div>
                  </div>
                </div>

                <div className="card-slate p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-3 font-bold text-brand-text-primary">04. Other Add-Ons</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-full bg-brand-accent/20 border border-black/5">
                      <div className="flex items-center gap-3">
                        <Layers size={20} className="text-brand-gold" />
                        <span className="text-sm font-bold text-brand-text-primary uppercase tracking-widest">Built-In Bench (lf)</span>
                      </div>
                      <input 
                        type="number" 
                        value={data.benchLf}
                        onChange={(e) => updateData({ benchLf: Number(e.target.value) })}
                        className="w-20 bg-white border-2 border-black/5 rounded-full px-4 py-2 text-right text-brand-gold text-sm font-bold outline-none focus:border-brand-gold"
                        placeholder="LF"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-full bg-brand-accent/20 border border-black/5">
                      <div className="flex items-center gap-3">
                        <Maximize2 size={20} className="text-brand-gold" />
                        <span className="text-sm font-bold text-brand-text-primary uppercase tracking-widest">Privacy Screen (sqft)</span>
                      </div>
                      <input 
                        type="number" 
                        value={data.privacySqft}
                        onChange={(e) => updateData({ privacySqft: Number(e.target.value) })}
                        className="w-20 bg-white border-2 border-black/5 rounded-full px-4 py-2 text-right text-brand-gold text-sm font-bold outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => updateData({ hasDrainage: !data.hasDrainage })}
                        className={cn(
                          "py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                          data.hasDrainage ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                        )}
                      >
                        Drainage System
                      </button>
                      <button 
                        onClick={() => updateData({ hasDemo: !data.hasDemo })}
                        className={cn(
                          "py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                          data.hasDemo ? "bg-brand-gold border-brand-gold text-brand-text-primary" : "bg-white border-black/5 text-brand-text-secondary/40 hover:border-brand-gold/30"
                        )}
                      >
                        Demo / Removal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Estimate Output */}
          {step === 5 && (
            <div
              
              
              
              className="space-y-8"
            >
              {/* Hero Card */}
              <div className="card-slate p-10 bg-gradient-to-br from-brand-accent/30 to-white relative overflow-hidden rounded-3xl border-2 border-brand-gold/20">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Calculator size={120} />
                </div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-brand-text-secondary/40 font-bold mb-2">Estimated Total Investment</div>
                    <div className="text-7xl font-bold text-brand-gold flex items-baseline gap-2">
                      <span className="text-3xl">$</span>
                      <RollingNumber value={estimate.total} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8">
                      <div>
                        <div className="text-[10px] text-brand-text-secondary/40 uppercase font-bold tracking-widest">Cost per sqft</div>
                        <div className="number-font text-xl text-brand-text-primary font-bold">${estimate.costPerSqft.toFixed(2)}</div>
                      </div>
                      <div className="w-px h-8 bg-black/5 hidden sm:block" />
                      <div>
                        <div className="text-[10px] text-brand-text-secondary/40 uppercase font-bold tracking-widest">Deck Area</div>
                        <div className="number-font text-xl text-brand-text-primary font-bold">{estimate.area} <span className="text-xs opacity-40">sqft</span></div>
                      </div>
                      <div className="w-px h-8 bg-black/5 hidden sm:block" />
                      <div>
                        <div className="text-[10px] text-brand-text-secondary/40 uppercase font-bold tracking-widest">Est. Man-Hours</div>
                        <div className="number-font text-xl text-brand-text-primary font-bold">{Math.ceil(estimate.manHours)} <span className="text-xs opacity-40">hrs</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-brand-text-secondary/40 font-bold mb-4">Compliance & Code Flags</h3>
                    {estimate.flags.map(f => (
                      <div key={f} className="flex items-center gap-3 bg-brand-gold/5 border border-brand-gold/20 p-3 rounded-xl text-brand-gold text-xs">
                        <AlertTriangle size={16} />
                        {f}
                      </div>
                    ))}
                    {estimate.flags.length === 0 && (
                      <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-600 text-xs">
                        <CheckCircle2 size={16} />
                        Standard Residential Build - No specific flags triggered.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deck Diagram */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-brand-text-primary flex items-center gap-2">
                    <Square size={20} className="text-brand-gold" /> Deck Visualization
                  </h3>
                </div>
                <DeckDiagram data={data} />
              </div>

              {/* Lead Capture Gate */}
              {!leadSubmitted && (
                <div className="relative">
                  {/* Blurred preview */}
                  <div className="blur-sm opacity-30 pointer-events-none max-h-[300px] overflow-hidden select-none" aria-hidden="true">
                    <div className="card-slate p-8 rounded-3xl border-2 border-black/5 bg-white space-y-4">
                      <div className="h-6 bg-slate-100 rounded w-1/3" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-2/3" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>

                  {/* Lead Capture Form */}
                  <div className="relative -mt-20 z-10">
                    <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-accent)] rounded-full -mr-16 -mt-16 opacity-10" />

                      <div className="relative text-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                          Get Your Full Breakdown
                        </h3>
                        <p className="text-slate-500 font-medium">
                          Enter your details to unlock the complete itemized estimate, material takeoff, and cost breakdown.
                        </p>
                      </div>

                      <form onSubmit={handleLeadSubmit} className="relative space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Name *</label>
                            <input
                              type="text"
                              placeholder="Your full name"
                              value={leadName}
                              onChange={(e) => setLeadName(e.target.value)}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Phone *</label>
                            <input
                              type="tel"
                              placeholder="(555) 123-4567"
                              value={leadPhone}
                              onChange={(e) => setLeadPhone(e.target.value)}
                              className="input-field"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Email (optional)</label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Project Vision (optional)</label>
                          <textarea
                            placeholder="Any details about your space, timeline, or specific ideas..."
                            rows={3}
                            value={leadNotes}
                            onChange={(e) => setLeadNotes(e.target.value)}
                            className="input-field resize-none"
                          />
                        </div>

                        {leadError && <p className="text-sm text-red-500 font-bold">{leadError}</p>}

                        <button
                          type="submit"
                          disabled={leadLoading}
                          className="w-full btn-primary flex items-center justify-center gap-2 py-5 text-sm disabled:opacity-50"
                        >
                          {leadLoading ? (
                            <><Loader2 size={18} className="animate-spin" /> Processing...</>
                          ) : (
                            <><Send size={18} /> UNLOCK FULL ESTIMATE</>
                          )}
                        </button>

                        <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2 flex-wrap">
                          <span className="flex items-center gap-1.5"><Shield size={14} /> Zero Obligation</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
                          <span>Professional Visit</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
                          <span>Detailed Bid</span>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Breakdown — revealed after lead capture */}
              {leadSubmitted && (
                <>
                {/* Lead Success */}
                <div className="rounded-[2.5rem] border border-emerald-100 bg-white shadow-xl p-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Estimate Unlocked</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    Your full breakdown is below. A project manager will reach out within 2 hours.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock size={14} /> Average Response: 42 Minutes
                  </div>
                </div>

              {/* Itemized Breakdown — hide Labour and Overhead from customer view */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-brand-text-primary">Itemized Estimate Breakdown</h2>
                {estimate.sections
                  .filter(section => !section.title.startsWith('Labour') && !section.title.startsWith('Overhead'))
                  .map((section, idx) => (
                    <CollapsibleSection key={idx} section={section} onOverride={handleOverride} />
                  ))}
              </div>

              {/* Total Investment Summary Card */}
              <div className="mt-12 p-8 rounded-3xl bg-brand-text-primary text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                    <h3 className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-bold mb-2">Final Summary</h3>
                    <p className="text-2xl font-bold">Total Project Investment</p>
                    <p className="text-white/40 text-xs mt-1">Includes all materials, labor, and professional installation.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-brand-gold flex items-baseline justify-end gap-2">
                      <span className="text-2xl">$</span>
                      <RollingNumber value={estimate.total || 0} />
                    </div>
                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-2">
                      Approximately ${estimate.costPerSqft.toFixed(2)} per sqft
                    </div>
                  </div>
                </div>
              </div>

              {/* Breaker Board Info Card */}
              {estimate.breakerInfo?.required && (
                <div className="card-slate p-6 bg-brand-gold/5 border-brand-gold/30 flex gap-4 items-start mt-12">
                  <div className="text-brand-gold mt-1"><CheckCircle2 size={24} /></div>
                  <div>
                    <h4 className="font-bold text-brand-text-primary mb-2">Breaker Boards Included — Best Practice</h4>
                    <p className="text-xs text-brand-text-secondary/80 leading-relaxed">
                      Your deck depth exceeds the standard {estimate.breakerInfo.standardLength}ft board length. {estimate.breakerInfo.rows} breaker board row(s) will be installed at {estimate.breakerInfo.interval}ft intervals, eliminating visible butt joint seam lines across the deck surface. Blocking has been added to the framing beneath each breaker row to provide full bearing for both board ends.
                    </p>
                  </div>
                </div>
              )}

              {/* Branded Materials List */}
              <BrandedMaterialsList data={data} materials={settings.materials} />
              </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 no-print">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-0 w-full sm:w-auto"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <div className="text-xs text-brand-text-secondary/20 uppercase tracking-widest font-bold text-center">
            Step {step} of 5
          </div>
          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(step).valid}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleStartFresh}
              className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw size={16} /> New Estimate
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-12 px-6 border-t border-black/5 text-center no-print">
        <p className="text-xs text-brand-text-secondary/20 font-mono tracking-widest">
          &copy; {new Date().getFullYear()} {contractor.company_name} · Powered by EstimateAI
        </p>
      </footer>
    </div>
  );
}

// --- Helper Components ---

const RollingNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * easeOutExpo);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const CollapsibleSection = ({ section, onOverride }: { section: any; onOverride: (itemName: string, field: 'qty' | 'cost', value: number) => void; key?: React.Key }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="card-slate overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <h3 className="font-serif text-lg text-brand-text-primary">{section.title}</h3>
            <p className="text-[10px] text-brand-text-secondary/40 uppercase font-bold tracking-widest">{section.items.length} Line Items</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-xl font-serif text-brand-gold">${Math.ceil(section.total).toLocaleString()}</div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronRight size={20} className="text-brand-text-secondary/20" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5"
          >
            <div className="p-6 space-y-4 bg-brand-accent/5">
              {section.description && (
                <div className="text-xs text-brand-text-secondary/60 mb-4 pb-4 border-b border-black/5 leading-relaxed">
                  {section.description}
                </div>
              )}
              <div className="grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-brand-text-secondary/40 tracking-widest mb-2 px-2">
                <div className="col-span-4">Item Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Labor</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {section.items.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center p-2 rounded-xl hover:bg-white/50 transition-colors group">
                  <div className="col-span-4">
                    <div className="font-medium text-brand-text-primary text-sm">{item.name}</div>
                    <div className="text-[10px] text-brand-text-secondary/40 uppercase font-bold">{item.spec}</div>
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-2">
                    <input 
                      type="number"
                      value={item.qty}
                      onChange={(e) => onOverride(item.name, 'qty', Number(e.target.value))}
                      className="w-full bg-white border border-black/5 rounded-lg px-2 py-1 text-right text-brand-gold text-xs font-bold outline-none focus:border-brand-gold/50"
                    />
                    <span className="text-[10px] text-brand-text-secondary/40 font-bold w-4">{item.unit}</span>
                  </div>
                  <div className="col-span-2 text-right text-xs text-brand-text-primary font-bold">
                    ${Math.ceil(item.unitPrice !== undefined ? item.unitPrice : (item.qty > 0 ? item.cost / item.qty : 0)).toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right text-xs text-brand-text-primary font-bold">
                    ${Math.ceil(item.laborCost || 0).toLocaleString()}
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-1">
                    <span className="text-brand-text-secondary/40 text-[10px]">$</span>
                    <input 
                      type="number"
                      value={Math.ceil(item.cost)}
                      onChange={(e) => onOverride(item.name, 'cost', Number(e.target.value))}
                      className="w-full bg-white border border-black/5 rounded-lg px-2 py-1 text-right text-brand-gold text-xs font-bold outline-none focus:border-brand-gold/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeckingEstimatorShell;
