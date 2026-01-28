
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>}
      <input 
        className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300 ${error ? 'border-red-500 bg-red-50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[9px] font-bold text-red-500 uppercase px-1">{error}</p>}
    </div>
  );
};

export default Input;
