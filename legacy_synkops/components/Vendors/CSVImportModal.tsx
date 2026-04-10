
import React, { useState } from 'react';
import { CatalogItem } from '../../types';
import { ICONS } from '../../constants';
import { STORAGE_KEYS, getJSON, setJSON } from '../../lib/storage';
import { normalizeUnit } from '../../lib/catalog/store';

const CSVImportModal: React.FC<{ vendorId: string; onImport: () => void; onClose: () => void }> = ({ vendorId, onImport, onClose }) => {
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      setCsvData(rows.filter(r => r.some(c => c !== '')));
      setStep(2);
    };
    reader.readAsText(file);
  };

  const commitImport = () => {
    setIsProcessing(true);
    // Simplified mapping logic for prototype
    // Fixed: Corrected property mapping to match updated CatalogItem interface and ensured all required fields like umNormalized are provided.
    const newItems: CatalogItem[] = csvData.slice(1).map(row => ({
      id: `CI-${Math.random().toString(36).substr(2, 9)}`,
      vendorId,
      pricebookId: 'PB-IMPORT',
      categoryId: 'CAT-IMPORT',
      itemType: 'product',
      name: row[0] || 'Unknown Product',
      department: row[1] || 'Bulk Aggregates',
      brand: row[3],
      unitOfMeasure: row[4] || 'Each',
      umNormalized: normalizeUnit(row[4] || 'Each'),
      variants: [],
      tierPrices: {
        trade: parseFloat(row[5]) || 0,
        retail: parseFloat(row[6]) || 0
      },
      searchableText: `${row[0]} ${row[1]} ${row[3]}`.toLowerCase(),
      tags: [],
      synonyms: [],
      status: 'active',
      createdAtISO: new Date().toISOString(),
      updatedAtISO: new Date().toISOString(),
      effectiveDate: new Date().toISOString(),
      pricing: {
        tradePrice: parseFloat(row[5]) || 0,
        retailPrice: parseFloat(row[6]) || 0
      },
      visibility: { isFavorite: false },
      // Fix: Added missing lastUsedAt property to satisfy UsageRecord interface
      usage: { useCount: 0, lastUsedAt: new Date().toISOString() },
      updatedAt: new Date().toISOString()
    }));

    const existing = getJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
    setJSON(STORAGE_KEYS.CATALOG, [...existing, ...newItems]);
    
    setTimeout(() => {
      onImport();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Import Price List</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
        </div>

        <div className="p-10">
          {step === 1 ? (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Truck size={32} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">Upload CSV Price List</p>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mt-2">Format: Name, Dept, Cat, Brand, UM, TradePrice, RetailPrice</p>
              </div>
              <label className="inline-block px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                Select CSV File
                <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
              </label>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="max-h-60 overflow-auto border border-slate-100 rounded-2xl no-scrollbar">
                <table className="w-full text-[10px] font-bold">
                  <thead className="bg-slate-50 sticky top-0 uppercase tracking-widest text-slate-400">
                    <tr>{csvData[0].map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {csvData.slice(1, 6).map((row, i) => (
                      <tr key={i}>{row.map((c, j) => <td key={j} className="px-4 py-3 truncate max-w-[100px]">{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                 <ICONS.AlertCircle size={18} className="text-blue-500" />
                 <p className="text-xs text-blue-700 font-bold uppercase tracking-tight">Ready to import {csvData.length - 1} products into the {vendorId} catalog.</p>
              </div>
              <button 
                onClick={commitImport}
                disabled={isProcessing}
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
              >
                {isProcessing ? <ICONS.RefreshCcw className="animate-spin" /> : 'Confirm Import'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;