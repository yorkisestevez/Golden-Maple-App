
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Job, User, UserRole, Photo, PhotoCategory } from '../../types';
import { ICONS } from '../../constants';
import PhotoUploadModal from './PhotoUploadModal';
import PhotoLightbox from './PhotoLightbox';

interface PhotosModuleProps {
  user: User;
  jobs: Job[];
}

const STORAGE_KEY = 'synkops_photos_v1';

const COMPLETENESS_TARGETS: Record<string, number> = {
  [PhotoCategory.BEFORE]: 2,
  [PhotoCategory.DURING]: 6,
  [PhotoCategory.AFTER]: 6,
  [PhotoCategory.CLOSEOUT]: 1,
};

const PhotosModule: React.FC<PhotosModuleProps> = ({ user, jobs }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<Photo['assignmentStatus'] | 'ALL'>('ALL');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  // Load photos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPhotos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse photos", e);
      }
    }
  }, []);

  const savePhotos = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPhotos));
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchesSearch = searchQuery === '' || 
        p.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.caption && p.caption.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesJob = selectedJobId === 'ALL' || p.jobId === selectedJobId;
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesAssignment = assignmentFilter === 'ALL' || p.assignmentStatus === assignmentFilter;
      return matchesSearch && matchesJob && matchesCategory && matchesAssignment;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [photos, searchQuery, selectedJobId, selectedCategory, assignmentFilter]);

  const unresolvedCount = useMemo(() => photos.filter(p => p.assignmentStatus === 'needs_choice').length, [photos]);

  const handleUpload = (newPhotos: Photo[]) => {
    savePhotos([...newPhotos, ...photos]);
    setIsUploadModalOpen(false);
  };

  const handleDelete = (id: string, e?: React.MouseEvent | React.DragEvent) => {
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    
    const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;
    if (!isAdmin) {
      alert("Permission Denied: Only Admins can permanently remove production media.");
      return;
    }

    if (window.confirm("Permanently delete this photo from the library? This cannot be undone.")) {
      const updatedPhotos = photos.filter(p => p.id !== id);
      savePhotos(updatedPhotos);
      setLightboxIndex(null);
    }
  };

  const handleUpdate = (updatedPhoto: Photo) => {
    savePhotos(photos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
  };

  const resolveAssignment = (photoId: string, jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const updated = photos.map(p => p.id === photoId ? {
      ...p,
      jobId: job.id,
      jobName: job.clientName,
      address: job.address,
      assignmentStatus: 'assigned' as const,
      candidateJobs: []
    } : p);
    savePhotos(updated);
  };

  // Drag Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('photoId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    setDraggedPhotoId(null);
    setIsOverTrash(false);
  };

  const onDropTrash = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('photoId');
    if (id) {
      handleDelete(id, e);
    }
    onDragEnd();
  };

  const setDraggedId = (id: string) => setDraggedPhotoId(id);

  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.OFFICE;

  return (
    <div className="flex flex-col h-full space-y-6 relative group/photos">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Photo Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium">Visual production tracking & site documentation.</p>
        </div>
        <div className="flex gap-2">
          {unresolvedCount > 0 && (
            <button 
              onClick={() => setAssignmentFilter('needs_choice')}
              className="flex items-center gap-2 bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-200 transition-all animate-pulse"
            >
              <ICONS.AlertCircle size={14} /> Resolve {unresolvedCount} Choices
            </button>
          )}
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
          >
            <ICONS.Camera size={18} /> Upload Photos
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 shrink-0 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by job or caption..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <select 
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer"
        >
          <option value="ALL">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName}</option>)}
        </select>

        <select 
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {Object.values(PhotoCategory).map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
           {['ALL', 'assigned', 'needs_choice', 'unassigned'].map(a => (
             <button 
              key={a}
              onClick={() => setAssignmentFilter(a as any)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${assignmentFilter === a ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {a.replace('_', ' ')}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12">
            {filteredPhotos.map((photo, idx) => (
              <div key={photo.id} className="flex flex-col gap-3">
                <div 
                  draggable
                  onDragStart={(e) => onDragStart(e, photo.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => setLightboxIndex(idx)}
                  className={`group relative aspect-square bg-slate-200 rounded-[28px] overflow-hidden border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-xl transition-all duration-300 ${draggedPhotoId === photo.id ? 'opacity-30 scale-95 grayscale' : ''}`}
                >
                  <img 
                    src={photo.dataUrl} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none" 
                  />
                  
                  {photo.assignmentStatus === 'needs_choice' && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white rounded-lg text-[8px] font-black uppercase shadow-lg z-10">
                       Conflict
                    </div>
                  )}

                  {photo.lat && (
                     <div className="absolute bottom-3 left-3 p-1.5 bg-white/90 rounded-lg shadow-md z-10" title="GPS Metadata Stamped">
                        <ICONS.MapPin size={10} className="text-emerald-600" />
                     </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest bg-emerald-500 w-fit px-2 py-0.5 rounded-md mb-2">
                      {photo.category}
                    </span>
                    <p className="text-white font-bold text-xs truncate mb-1">{photo.jobName}</p>
                    <p className="text-white/60 text-[10px] font-medium">{new Date(photo.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {photo.assignmentStatus === 'needs_choice' && photo.candidateJobs && (
                  <div className="bg-amber-50 p-4 rounded-3xl border border-amber-200 space-y-3 animate-in fade-in zoom-in-95">
                     <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest">Select Correct Job</p>
                     <div className="space-y-1">
                        {photo.candidateJobs.map(c => (
                          <button 
                            key={c.jobId}
                            onClick={() => resolveAssignment(photo.id, c.jobId)}
                            className="w-full p-2 bg-white hover:bg-amber-100 border border-amber-100 rounded-xl text-left text-[9px] font-bold text-slate-700 flex justify-between items-center transition-all group"
                          >
                             <span className="truncate pr-2">{c.jobName}</span>
                             <span className="text-[8px] opacity-40 group-hover:opacity-100">{c.distanceMeters}m</span>
                          </button>
                        ))}
                        <button 
                          onClick={() => handleUpdate({ ...photo, assignmentStatus: 'unassigned' })}
                          className="w-full p-2 text-center text-[8px] font-black uppercase text-amber-600/60 hover:text-amber-600"
                        >
                          Mark Unassigned
                        </button>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 border-2 border-dashed border-slate-200 rounded-[40px]">
             <div className="p-8 bg-slate-100 rounded-full">
                <ICONS.Camera size={48} />
             </div>
             <div className="text-center">
                <p className="font-black uppercase tracking-widest text-slate-900">No Photos Found</p>
                <p className="text-sm font-medium mt-1">Try adjusting filters or upload new production proof.</p>
             </div>
          </div>
        )}
      </div>

      {/* RECYCLE BIN / TRASH ZONE */}
      {(draggedPhotoId || isOverTrash) && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsOverTrash(true); }}
          onDragLeave={() => setIsOverTrash(false)}
          onDrop={onDropTrash}
          className={`fixed bottom-10 right-10 z-[50] flex flex-col items-center justify-center p-8 rounded-[40px] border-4 transition-all duration-300 animate-in zoom-in-50 slide-in-from-bottom-10 ${
            isOverTrash 
              ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_50px_rgba(220,38,38,0.5)]' 
              : 'bg-slate-900 border-slate-800 scale-100 shadow-2xl shadow-slate-900/40'
          }`}
        >
          <div className={`text-white transition-transform duration-500 ${isOverTrash ? 'scale-125 rotate-12' : 'animate-bounce'}`}>
            <ICONS.Trash2 size={48} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-white font-black text-xs uppercase tracking-[0.2em]">Drop to Remove</p>
            <p className="text-white/40 text-[9px] font-bold uppercase mt-1">Permanent Library Deletion</p>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <PhotoUploadModal 
          user={user} 
          jobs={jobs} 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={handleUpload} 
        />
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox 
          photos={filteredPhotos} 
          currentIndex={lightboxIndex} 
          user={user}
          jobs={jobs}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default PhotosModule;
