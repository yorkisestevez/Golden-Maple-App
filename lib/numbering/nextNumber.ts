
import { getGlobalSettings } from '../settings';

export const getNextNumber = (type: string): string => {
  const settings = getGlobalSettings();
  const profile = settings.profiles.find(p => p.id === settings.activeProfileId);
  if (!profile) return `${type.toUpperCase()}-001`;

  const seq = profile.numbering.sequences[type];
  if (!seq) return `${type.toUpperCase()}-001`;

  const num = seq.current;
  const padded = String(num).padStart(seq.padding, '0');
  
  return `${seq.prefix}${padded}`;
};
