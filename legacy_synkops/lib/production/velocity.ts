
import { Job, DailyLog } from '../../types';

export interface ProductionForecast {
  estimatedCompletion: Date;
  efficiencyScore: number; // 0-100
  atRisk: boolean;
  currentVelocityUnitsPerHour: number;
}

export const computeProductionForecast = (job: Job, logs: DailyLog[]): ProductionForecast | null => {
  if (job.metrics.actualLaborHours === 0 || job.progressPercent === 0) return null;

  // Use historical average from logs or current metric state
  const laborBurned = job.metrics.actualLaborHours;
  const progressReached = job.progressPercent;
  
  const progressPerLaborHour = progressReached / laborBurned;
  const remainingProgress = 100 - progressReached;
  
  const estimatedRemainingHours = remainingProgress / progressPerLaborHour;
  
  // Predict date assuming 8-hour crew days
  const workDaysRemaining = Math.ceil(estimatedRemainingHours / 8);
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + workDaysRemaining);

  // Efficiency calculation (Baseline is original planned budget)
  const totalProjectedHours = laborBurned + estimatedRemainingHours;
  const efficiencyScore = (job.metrics.plannedLaborHours / totalProjectedHours) * 100;

  return {
    estimatedCompletion: finishDate,
    efficiencyScore,
    atRisk: efficiencyScore < 90,
    currentVelocityUnitsPerHour: job.metrics.actualUnitsCompleted / laborBurned
  };
};
