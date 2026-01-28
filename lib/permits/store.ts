
import { PermitRecord, Job, AppNotification, PermitStatus } from '../../types';
import { getJSON, setJSON } from '../storage';

const STORAGE_KEY = 'synkops_permits_v1';
const NOTIFICATION_KEY = 'synkops_notifications_v1';

export const listPermitsByJob = (jobId: string): PermitRecord[] => {
  const all = getJSON<PermitRecord[]>(STORAGE_KEY, []);
  return all.filter(p => p.jobId === jobId);
};

export const createPermit = (jobId: string, data: Partial<PermitRecord>): PermitRecord => {
  const all = getJSON<PermitRecord[]>(STORAGE_KEY, []);
  const newPermit: PermitRecord = {
    id: `PERM-${Date.now()}`,
    jobId,
    title: data.title || 'New Permit',
    type: data.type || 'Other',
    authorityName: data.authorityName || '',
    status: data.status || 'required',
    priority: data.priority || 'normal',
    responsibility: data.responsibility || 'contractor',
    inspections: data.inspections || [],
    checklist: data.checklist || [],
    attachments: data.attachments || [],
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString(),
    createdBy: 'Current User', // Stub
    updatedBy: 'Current User', // Stub
    ...data
  } as PermitRecord;

  setJSON(STORAGE_KEY, [newPermit, ...all]);
  return newPermit;
};

export const updatePermit = (id: string, patch: Partial<PermitRecord>): void => {
  const all = getJSON<PermitRecord[]>(STORAGE_KEY, []);
  const updated = all.map(p => p.id === id ? { ...p, ...patch, updatedAtISO: new Date().toISOString() } : p);
  setJSON(STORAGE_KEY, updated);
};

export const deletePermit = (id: string): void => {
  const all = getJSON<PermitRecord[]>(STORAGE_KEY, []);
  setJSON(STORAGE_KEY, all.filter(p => p.id !== id));
};

export const computePermitAlerts = (jobs: Job[]): AppNotification[] => {
  const permits = getJSON<PermitRecord[]>(STORAGE_KEY, []);
  const now = new Date();
  const alerts: AppNotification[] = [];

  jobs.forEach(job => {
    if (!job.startDate) return;
    const start = new Date(job.startDate);
    const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    const jobPermits = permits.filter(p => p.jobId === job.id);
    
    // Rule: Job starts within 7 days and has missing approvals
    const blocking = jobPermits.filter(p => 
      ['required', 'applied', 'rejected', 'expired'].includes(p.status)
    );

    if (diffDays <= 7 && blocking.length > 0) {
      alerts.push({
        id: `ALRT-PERM-START-${job.id}`,
        type: 'permit_alert',
        jobId: job.id,
        severity: 'high',
        message: `${job.clientName}: Missing ${blocking.length} permit approvals (Starts in ${Math.ceil(diffDays)}d)`,
        createdAtISO: now.toISOString(),
        dismissed: false
      });
    }

    // Rule: Approved permit expiring within 14 days
    const expiring = jobPermits.filter(p => {
      if (p.status !== 'approved' || !p.expiresAtISO) return false;
      const exp = new Date(p.expiresAtISO);
      const expDiff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return expDiff <= 14 && expDiff > 0;
    });

    expiring.forEach(p => {
      alerts.push({
        id: `ALRT-PERM-EXP-${p.id}`,
        type: 'permit_alert',
        jobId: job.id,
        permitId: p.id,
        severity: 'medium',
        message: `${job.clientName}: Permit "${p.title}" expiring soon`,
        createdAtISO: now.toISOString(),
        dismissed: false
      });
    });
  });

  return alerts;
};
