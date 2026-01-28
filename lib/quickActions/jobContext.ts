
import { Job, CalendarEvent, CalendarEventType } from '../../types';
import { getJSON } from '../storage';

export const getTodayScheduleItems = (userId?: string): CalendarEvent[] => {
  const events = getJSON<CalendarEvent[]>('synkops_schedule_v1', []);
  const today = new Date().toISOString().split('T')[0];
  
  return events.filter(e => {
    const isToday = e.start.startsWith(today);
    const isJob = e.type === CalendarEventType.JOB;
    const isAssigned = userId ? e.crewId === userId : true; // Simplified: check crew assignment
    return isToday && isJob && isAssigned;
  });
};

export const resolveJobContext = (
  todaySchedule: CalendarEvent[],
  onPrompt: (options: Job[]) => void,
  onResolved: (job: Job) => void
) => {
  const allJobs = getJSON<Job[]>('synkops_jobs_v1', []);
  
  // If exactly 1 job today, auto-resolve
  if (todaySchedule.length === 1) {
    const job = allJobs.find(j => j.id === todaySchedule[0].jobId);
    if (job) {
      onResolved(job);
      return;
    }
  }

  // If multiple jobs today, filter jobs list to just those IDs
  if (todaySchedule.length > 1) {
    const relevantIds = todaySchedule.map(s => s.jobId);
    const options = allJobs.filter(j => relevantIds.includes(j.id));
    onPrompt(options);
    return;
  }

  // If no jobs today, show all active jobs as options
  const activeJobs = allJobs.filter(j => !['CLOSED', 'COMPLETED'].includes(j.status));
  onPrompt(activeJobs);
};
