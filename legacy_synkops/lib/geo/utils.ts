
import { Job, CandidateJob } from '../../types';

/**
 * Calculates distance between two GPS coordinates in meters using Haversine formula.
 */
export const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Finds candidate jobs within their geofence radius for a given coordinate.
 */
export const findCandidateJobs = (lat: number, lng: number, jobs: Job[]): CandidateJob[] => {
  const DEFAULT_FENCE = 120; // 120 meters

  return jobs
    .filter(job => job.siteLat && job.siteLng)
    .map(job => {
      const distance = calculateDistanceMeters(lat, lng, job.siteLat!, job.siteLng!);
      return {
        jobId: job.id,
        jobName: job.clientName,
        distanceMeters: Math.round(distance),
        fenceRadius: job.geofenceRadiusMeters || DEFAULT_FENCE
      };
    })
    .filter(candidate => candidate.distanceMeters <= candidate.fenceRadius)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
};

/**
 * Requests the current GPS position from the browser.
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
};
