
import React, { useState, useEffect } from 'react';
import { User, UserRole, Job, Photo, PhotoCategory } from '../../types';
import { ICONS } from '../../constants';

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  user: User;
  jobs: Job[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (id: string) => void;
  onUpdate: (photo: Photo) => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ 
  photos, currentIndex, user, jobs, onClose, onNext, onPrev, onDelete, onUpdate 
}) => {
  const photo = photos[currentIndex];
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  if (!photo) return null;

  const handleCategoryChange = (cat: PhotoCategory) => {
    onUpdate({ ...photo, category: cat });
    setIsEditing(false);
  };

  const handleJobChange = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      onUpdate({ ...photo, jobId: job.id, jobName: job.clientName, address: job.address });
      setIsEditing(false);
    }
  };

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;
  const isLead = user.role === UserRole.FIELD_LEAD;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950 animate-in fade-in duration-300 overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between p-6 bg-slate-900/40 backdrop-blur-md shrink-0 border-b border-white/5 z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-95"
          >
            <ICONS.Plus className="rotate-45" size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white tracking-tight">{photo.jobName}</h2>
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded">
                {photo.category}
              </span>
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              Captured {new Date(photo.createdAt).toLocaleString()} by {photo.uploaderName || 'Unknown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(isAdmin || isLead) && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${isEditing ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <ICONS.FileEdit size={18} /> Edit Metadata
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => onDelete(photo.id)}
              className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
            >
              <ICONS.Trash2 size={18} />
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEW */}
      <div className="flex-1 relative flex items-center justify-center p-8 group">
        <button 
          onClick={onPrev}
          className="absolute left-8 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          <ICONS.ChevronRight className="rotate-180" size={32} />
        </button>

        <img 
          src={photo.dataUrl} 
          alt={photo.caption} 
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
        />

        <button 
          onClick={onNext}
          className="absolute right-8 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          <ICONS.ChevronRight size={32} />
        </button>

        {isEditing && (
           <div className="absolute top-8 right-8 w-80 bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Edit Logic</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Re-Categorize</label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Fixed: explicitly type cat as string to fix mapping errors */}
                    {Object.values(PhotoCategory).map((cat: string) => (
                      <button 
                        key={cat} 
                        onClick={() => handleCategoryChange(cat as PhotoCategory)}
                        className={`p-2 rounded-lg text-[9px] font-black uppercase text-left truncate transition-all ${photo.category === cat ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                   <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Move to Different Job</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                       {jobs.map(j => (
                         <button 
                           key={j.id} 
                           onClick={() => handleJobChange(j.id)}
                           className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all border ${photo.jobId === j.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-inner' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                         >
                           {j.clientName}
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>
           </div>
        )}
      </div>

      {/* CAPTION OVERLAY */}
      {photo.caption && !isEditing && (
        <div className="p-8 bg-slate-900/60 backdrop-blur-sm border-t border-white/5">
          <div className="max-w-2xl mx-auto flex gap-4">
             <ICONS.MessageSquare className="text-emerald-500 shrink-0" size={20} />
             <p className="text-white text-lg font-medium leading-relaxed italic">{photo.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoLightbox;
