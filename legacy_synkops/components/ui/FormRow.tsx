
import React from 'react';

interface FormRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  border?: boolean;
}

const FormRow: React.FC<FormRowProps> = ({ label, description, children, border = true }) => {
  return (
    <div className={`py-6 flex flex-col md:flex-row md:items-center gap-6 ${border ? 'border-b border-slate-100' : ''} last:border-0`}>
      <div className="md:w-64 shrink-0">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{label}</h4>
        {description && <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default FormRow;
