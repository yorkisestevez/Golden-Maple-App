
import React, { useState } from 'react';
import { User, Vendor, Pricebook, CatalogItem, CatalogCategory } from '../../../types';
import { ICONS } from '../../../constants';
import { STORAGE_KEYS, safeGetJSON, safeSetJSON, uid, nowISO, parseNumberSafe } from '../../../lib/storage';
import { normalizeUnit, buildSearchableText, findOrCreateCategoryByPath } from '../../../lib/catalog/store';

interface ImportWizardProps {
  user: User;
  vendor: Vendor | null;
  onComplete: () => void;
  onCancel: () => void;
}

const ImportWizard: React.FC<ImportWizardProps> = ({ vendor, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [pricebookName, setPricebookName] = useState(`Trade Price Book ${new Date().getFullYear()}`);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const handleParse = () => {
    // Parser for Spreadsheet Paste (Tab) or CSV (Comma)
    // HEADER: name,unitOfMeasure,tradePrice,retailPrice,category,brand,packInfoText,tags,synonyms,itemType,taxCategory
    const rows = rawText.split('\n')
      .filter(l => l.trim() !== '' && !l.startsWith('name,'))
      .map(line => {
        const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return {
          name: parts[0]?.replace(/"/g, '').trim() || '',
          unit: parts[1]?.trim() || 'EA',
          trade: parseNumberSafe(parts[2]),
          retail: parseNumberSafe(parts[3]),
          categoryPath: parts[4]?.replace(/"/g, '').trim() || 'General',
          brand: parts[5]?.replace(/"/g, '').trim() || '',
          pack: parts[6]?.replace(/"/g, '').trim() || '',
          tags: parts[7]?.replace(/"/g, '').split('|').filter(Boolean) || [],
          synonyms: parts[8]?.replace(/"/g, '').split('|').filter(Boolean) || [],
          itemType: (parts[9]?.replace(/"/g, '').toLowerCase() === 'service' ? 'service' : 'product') as any,
          taxCat: parts[10]?.replace(/"/g, '').trim() || 'materials'
        };
      })
      .filter(r => r.name);
    setParsedRows(rows);
    setStep(3);
  };

  const commit = () => {
    if (!vendor) return;
    const pbId = uid('PB');
    const pb: Pricebook = {
      id: pbId,
      vendorId: vendor.id,
      name: pricebookName,
      effectiveDateISO: effectiveDate,
      sourceType: "paste",
      status: "active",
      createdAtISO: nowISO(),
      updatedAtISO: nowISO()
    };

    const pbs = safeGetJSON<Pricebook[]>(STORAGE_KEYS.PRICEBOOKS, []);
    safeSetJSON(STORAGE_KEYS.PRICEBOOKS, [pb, ...pbs.map(p => p.vendorId === vendor.id ? { ...p, status: "archived" as const } : p)]);

    const existingItems = safeGetJSON<CatalogItem[]>(STORAGE_KEYS.CATALOG, []);
    const newItems: CatalogItem[] = parsedRows.map(r => {
      const catId = findOrCreateCategoryByPath(r.categoryPath);
      
      return {
        id: uid('ITEM'),
        vendorId: vendor.id,
        pricebookId: pbId,
        categoryId: catId,
        department: r.categoryPath.split('>')[0].trim(),
        itemType: r.itemType,
        brand: r.brand,
        name: r.name,
        unitOfMeasure: r.unit,
        umNormalized: normalizeUnit(r.unit),
        packInfoText: r.pack,
        tierPrices: { trade: r.trade, retail: r.retail },
        pricing: { tradePrice: r.trade, retailPrice: r.retail },
        tags: r.tags,
        synonyms: r.synonyms,
        status: "active",
        taxCategory: r.taxCat,
        searchableText: buildSearchableText({ name: r.name, brand: r.brand, unitOfMeasure: r.unit, packInfoText: r.pack, tags: r.tags, synonyms: r.synonyms }),
        visibility: { isFavorite: false },
        createdAtISO: nowISO(),
        updatedAtISO: nowISO()
      } as CatalogItem;
    });

    safeSetJSON(STORAGE_KEYS.CATALOG, [...existingItems, ...newItems]);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400">
            <ICONS.Plus className="rotate-45" size={28} />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Trade Catalog Import</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Processing Data for {vendor?.name}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12 no-scrollbar flex justify-center bg-slate-50/30">
        <div className="w-full max-w-4xl">
          {step === 1 && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-10 animate-in slide-in-from-bottom-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Version Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Book Name</label>
                    <input value={pricebookName} onChange={e => setPricebookName(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Effective Date</label>
                    <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold" />
                 </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all">Proceed to Data Entry</button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Bulk Import</h3>
                <p className="text-sm font-medium text-slate-400 mt-1 italic">Paste rows from Excel (Name | UM | Trade | Retail | Path | Brand | Pack | Tags | Synonyms | Type | TaxCat)</p>
              </div>

              <textarea 
                value={rawText} 
                onChange={e => setRawText(e.target.value)}
                className="w-full h-96 p-8 bg-slate-50 border border-slate-200 rounded-[40px] font-mono text-[10px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner"
                placeholder={`name,unitOfMeasure,tradePrice,retailPrice,category,brand,packInfoText,tags,synonyms,itemType,taxCategory`}
              />

              <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest">Back</button>
                 <button onClick={handleParse} disabled={!rawText} className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all">Parse Paste Buffer</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-right-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Review {parsedRows.length} Rows</h3>
              <div className="max-h-[500px] overflow-y-auto no-scrollbar border border-slate-100 rounded-[32px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0"><tr className="text-[10px] font-black uppercase text-slate-400"><th className="px-8 py-5">Product</th><th className="px-4 py-5">Trade</th><th className="px-8 py-5">Path</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {parsedRows.map((r, i) => (
                      <tr key={i}>
                        <td className="px-8 py-4 text-xs font-black text-slate-900 uppercase truncate max-w-[200px]">{r.name}</td>
                        <td className="px-4 py-4 text-xs font-black text-emerald-600">${r.trade.toFixed(2)}</td>
                        <td className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.categoryPath}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setStep(2)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest">Back</button>
                 <button onClick={commit} className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Import to {vendor?.name}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportWizard;
