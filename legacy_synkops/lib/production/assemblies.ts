
import { Assembly, AssemblyItem } from '../../types';
import { STORAGE_KEYS, getJSON, setJSON } from '../storage';
import { savePreset, PRESET_NAMES } from '../presets';

export const listAssemblies = (): Assembly[] => {
  return getJSON<Assembly[]>(STORAGE_KEYS.ASSEMBLIES, []);
};

export const getAssembly = (id: string): Assembly | undefined => {
  return listAssemblies().find(a => a.id === id);
};

export const saveAssembly = (assembly: Assembly) => {
  const all = listAssemblies();
  const updated = all.find(a => a.id === assembly.id)
    ? all.map(a => a.id === assembly.id ? assembly : a)
    : [...all, assembly];
  setJSON(STORAGE_KEYS.ASSEMBLIES, updated);
  void savePreset(PRESET_NAMES.ASSEMBLIES, updated);
};

export const deleteAssembly = (id: string) => {
  const all = listAssemblies();
  const updated = all.filter(a => a.id !== id);
  setJSON(STORAGE_KEYS.ASSEMBLIES, updated);
  void savePreset(PRESET_NAMES.ASSEMBLIES, updated);
};
