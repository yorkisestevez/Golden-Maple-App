
import { getJSON, STORAGE_KEYS } from '../storage';
import { getActiveProfile } from '../settings';

export interface ReportContext {
  currency: string;
  taxName: string;
  startDate: Date;
  endDate: Date;
}

export const getReportContext = (range: string): ReportContext => {
  const profile = getActiveProfile();
  const now = new Date();
  let start = new Date();
  
  switch (range) {
    case 'THIS_MONTH': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case 'LAST_MONTH': start = new Date(now.getFullYear(), now.getMonth() - 1, 1); break;
    case 'THIS_QUARTER': start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); break;
    case 'YTD': start = new Date(now.getFullYear(), 0, 1); break;
    default: start = new Date(now.setDate(now.getDate() - 90)); // Last 90 days default
  }

  return {
    // Fixed: Using currencyCode from profile.financial as defined in FinancialRules interface
    currency: profile.financial.currencyCode || 'USD',
    taxName: profile.financial.taxName || 'Tax',
    startDate: start,
    endDate: new Date()
  };
};

export const fetchData = <T>(key: string): T[] => getJSON<T[]>(key, []);

export const filterByDate = <T>(items: T[], dateField: keyof T, start: Date, end: Date): T[] => {
  return items.filter(item => {
    const d = new Date(item[dateField] as unknown as string);
    return d >= start && d <= end;
  });
};

export const sumBy = <T>(items: T[], field: keyof T): number => {
  return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
};

export const groupBy = <T>(items: T[], key: keyof T): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const val = String(item[key]);
    if (!acc[val]) acc[val] = [];
    acc[val].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
