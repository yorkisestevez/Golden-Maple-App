
import React, { useState, useRef } from 'react';
import { User, Job, Photo, PhotoCategory, CandidateJob } from '../../types';
import { ICONS } from '../../constants';
import { getCurrentPosition, findCandidateJobs } from '../../lib/geo/utils';

interface PhotoUploadModalProps {
  user: User;
  jobs: Job[];
  onClose: () => void;
  onUpload: (photos: Photo[]) => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ user, jobs, onClose, onUpload }) => {
  const [step, setStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>(PhotoCategory.DURING);
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      captureLocation();
    }
  };

  const captureLocation = async () => {
    try {
      const pos = await getCurrentPosition();
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      });
    } catch (e) {
      console.warn("Failed to capture GPS coords", e);
    }
  };

  const processUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);

    const results: Photo[] = await Promise.all(selectedFiles.map((file, index) => {
      return new Promise<Photo>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let finalJobId = selectedJobId;
          let assignmentStatus: Photo['assignmentStatus'] = finalJobId ? 'assigned' : 'unassigned';
          let candidates: CandidateJob[] = [];

          // Assignment Logic (Non-Negotiable Order)
          if (!finalJobId && location) {
            // Find candidates within their geofences
            candidates = findCandidateJobs(location.lat, location.lng, jobs);
            
            if (candidates.length === 1) {
              finalJobId = candidates[0].jobId;
              assignmentStatus = 'assigned';
            } else if (candidates.length > 1) {
              assignmentStatus = 'needs_choice';
              // Leave finalJobId empty so user can resolve later
            } else {
              assignmentStatus = 'unassigned';
            }
          }

          const job = jobs.find(j => j.id === finalJobId);

          resolve({
            id: `img-${Math.random().toString(36).substr(2, 9)}`,
            jobId: finalJobId,
            jobName: job?.clientName || 'Unassigned Production',
            address: job?.address,
            category: selectedCategory,
            caption: caption,
            uploaderName: user.name,
            createdAt: new Date().toISOString(),
            dataUrl: reader.result as string,
            mimeType: file.type,
            order: index,
            lat: location?.lat,
            lng: location?.lng,
            accuracyMeters: location?.accuracy,
            source: location ? 'gps' : 'unknown',
            assignmentStatus: assignmentStatus,
            candidateJobs: candidates.slice(0, 3)
          });
        };
        reader.readAsDataURL(file);
      });
    }));

    onUpload(results);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 shrink-0 flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Production Proof</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Upload Pipeline Step {step}/2</p>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
              <ICONS.Plus className="rotate-45" size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Job Override</label>
                    {location ? (
                       <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ICONS.CheckCircle2 size={10}/> GPS LOCK: {location.accuracy.toFixed(0)}m
                       </span>
                    ) : (
                       <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ICONS.RefreshCcw size={10} className="animate-spin" /> ACQUIRING GPS...
                       </span>
                    )}
                  </div>
                  <select 
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Auto-Assign via Geofence...</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName} — {j.address}</option>)}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Classification</label>
                  <div className="grid grid-cols-2 gap-2">
                     {Object.values(PhotoCategory).map((cat: string) => (
                       <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat as PhotoCategory)}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all text-left truncate ${selectedCategory === cat ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                       >
                         {cat}
                       </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Note</label>
                  <textarea 
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none transition-all"
                    placeholder="Describe context for office review..."
                  />
               </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="aspect-video border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group"
               >
                  <div className="p-6 bg-slate-50 rounded-full text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                    <ICONS.Camera size={40} />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Select Production Photos</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Multi-capture enabled</p>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
               </div>

               {selectedFiles.length > 0 && (
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue ({selectedFiles.length})</span>
                       <button onClick={() => setSelectedFiles([])} className="text-[10px] font-black text-red-500 uppercase">Discard</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                       {selectedFiles.slice(0, 8).map((f, i) => (
                         <div key={i} className="aspect-square bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 p-2 text-center break-all overflow-hidden">
                            {f.name.substr(0, 10)}
                         </div>
                       ))}
                       {selectedFiles.length > 8 && <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center text-[10px] font-black text-white">+{selectedFiles.length - 8}</div>}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest"
            >
              Continue to Selection
            </button>
          ) : (
            <>
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
              >
                Back
              </button>
              <button 
                onClick={processUpload}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="flex-[2] py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3"
              >
                {isProcessing ? <ICONS.RefreshCcw className="animate-spin" size={16} /> : <ICONS.CheckCircle2 size={16} />}
                {isProcessing ? 'Processing...' : `Upload to Library`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
