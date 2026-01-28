import { STORAGE_KEYS, safeSetJSON } from "./storage";

export const PRESET_NAMES = {
  CONFIG: "synkops_config",
  SETTINGS: STORAGE_KEYS.SETTINGS,
  PRODUCTION_RATES: STORAGE_KEYS.PRODUCTION_RATES,
  ASSEMBLIES: STORAGE_KEYS.ASSEMBLIES,
} as const;

type PresetName = typeof PRESET_NAMES[keyof typeof PRESET_NAMES];

interface PresetRecord {
  name: PresetName;
  config: unknown;
}

const allowedPresetNames = new Set<string>(Object.values(PRESET_NAMES));

export const hydratePresets = async (): Promise<void> => {
  try {
    const response = await fetch("/.netlify/functions/presets");
    if (!response.ok) {
      throw new Error(`Presets request failed: ${response.status}`);
    }

    const rawText = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse presets response:", rawText);
      throw new Error("Failed to parse presets response");
    }

    const presets: PresetRecord[] = Array.isArray((data as any)?.presets)
      ? (data as any).presets
      : Array.isArray(data)
        ? (data as PresetRecord[])
        : [];

    presets.forEach((preset) => {
      if (!allowedPresetNames.has(preset.name)) return;
      safeSetJSON(preset.name, preset.config);
    });
  } catch (error) {
    console.error("Failed to hydrate presets:", error);
  }
};

export const savePreset = async (name: PresetName, config: unknown): Promise<void> => {
  try {
    const response = await fetch("/.netlify/functions/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, config }),
    });

    if (!response.ok) {
      throw new Error(`Preset save failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to save preset:", error);
  }
};
