'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_DECKING_SETTINGS } from '@/lib/decking/seed-settings';
import { MATERIAL_TIERS, type MaterialTier, type Municipality, type DeckingSettings } from '@/lib/decking/types';
import { Hammer, Save, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function DeckingSettingsPage() {
  const [settings, setSettings] = useState<DeckingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ materials: true });

  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('decking_settings')
      .select('*')
      .eq('contractor_id', user.id)
      .single();

    if (data) {
      setSettingsId(data.id);
      setSettings({
        materials: data.materials || MATERIAL_TIERS,
        crewRates: data.crew_rates || DEFAULT_DECKING_SETTINGS.crewRates,
        permitFees: data.permit_fees || DEFAULT_DECKING_SETTINGS.permitFees,
        engineeringFee: data.engineering_fee || 1500,
        railingCosts: data.railing_costs || DEFAULT_DECKING_SETTINGS.railingCosts,
        stairTreadCosts: data.stair_tread_costs || DEFAULT_DECKING_SETTINGS.stairTreadCosts,
        wasteFactors: data.waste_factors || DEFAULT_DECKING_SETTINGS.wasteFactors,
        isEnabled: data.is_enabled,
      });
    }
    setLoading(false);
  };

  const enableDeckingEstimator = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('decking_settings')
      .insert({
        contractor_id: user.id,
        materials: MATERIAL_TIERS,
        crew_rates: DEFAULT_DECKING_SETTINGS.crewRates,
        permit_fees: DEFAULT_DECKING_SETTINGS.permitFees,
        engineering_fee: DEFAULT_DECKING_SETTINGS.engineeringFee,
        railing_costs: DEFAULT_DECKING_SETTINGS.railingCosts,
        stair_tread_costs: DEFAULT_DECKING_SETTINGS.stairTreadCosts,
        waste_factors: DEFAULT_DECKING_SETTINGS.wasteFactors,
        is_enabled: true,
      })
      .select()
      .single();

    if (data) {
      setSettingsId(data.id);
      setSettings(DEFAULT_DECKING_SETTINGS);
    }
  };

  const saveSettings = async () => {
    if (!settings || !settingsId) return;
    setSaving(true);

    await supabase
      .from('decking_settings')
      .update({
        materials: settings.materials,
        crew_rates: settings.crewRates,
        permit_fees: settings.permitFees,
        engineering_fee: settings.engineeringFee,
        railing_costs: settings.railingCosts,
        stair_tread_costs: settings.stairTreadCosts,
        waste_factors: settings.wasteFactors,
        is_enabled: settings.isEnabled,
      })
      .eq('id', settingsId);

    setSaving(false);
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Hammer className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">DeckCraft Pro Estimator</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Enable the DeckCraft Pro decking calculator for your customers. Features a 6-step wizard with Ontario-specific pricing, live deck diagrams, material takeoffs, and PDF proposals.
        </p>
        <button
          onClick={enableDeckingEstimator}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Enable DeckCraft Pro
        </button>
      </div>
    );
  }

  const SectionHeader = ({ title, sectionKey }: { title: string; sectionKey: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full py-4 px-6 bg-slate-50 rounded-xl font-bold text-slate-800 hover:bg-slate-100 transition-colors"
    >
      {title}
      {expandedSections[sectionKey] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hammer className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">DeckCraft Pro Settings</h1>
            <p className="text-sm text-slate-500">Configure your decking estimator pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSettings({ ...settings, isEnabled: !settings.isEnabled })}
            className="flex items-center gap-2 text-sm font-bold"
          >
            {settings.isEnabled ? (
              <><ToggleRight className="w-8 h-8 text-green-500" /> Enabled</>
            ) : (
              <><ToggleLeft className="w-8 h-8 text-slate-400" /> Disabled</>
            )}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Crew Rates */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Crew Day Rates (per municipality)" sectionKey="crewRates" />
        {expandedSections.crewRates && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(settings.crewRates) as Municipality[]).map(municipality => (
              <div key={municipality}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{municipality}</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    value={settings.crewRates[municipality]}
                    onChange={(e) => setSettings({
                      ...settings,
                      crewRates: { ...settings.crewRates, [municipality]: Number(e.target.value) },
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                  />
                  <span className="text-xs text-slate-400">/day</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permit Fees */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Permit Fees (per municipality)" sectionKey="permitFees" />
        {expandedSections.permitFees && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(settings.permitFees) as Municipality[]).map(municipality => (
              <div key={municipality}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{municipality}</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    value={settings.permitFees[municipality]}
                    onChange={(e) => setSettings({
                      ...settings,
                      permitFees: { ...settings.permitFees, [municipality]: Number(e.target.value) },
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engineering Fee */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Engineering Fee" sectionKey="engineering" />
        {expandedSections.engineering && (
          <div className="p-6">
            <div className="max-w-xs">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Structural Engineering Review</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  value={settings.engineeringFee}
                  onChange={(e) => setSettings({ ...settings, engineeringFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Waste Factors */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Waste Factors (per pattern)" sectionKey="waste" />
        {expandedSections.waste && (
          <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(settings.wasteFactors).map(([pattern, factor]) => (
              <div key={pattern}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{pattern}</label>
                <input
                  type="number"
                  step="0.01"
                  value={factor as number}
                  onChange={(e) => setSettings({
                    ...settings,
                    wasteFactors: { ...settings.wasteFactors, [pattern]: Number(e.target.value) },
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Materials */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <SectionHeader title={`Materials (${settings.materials.filter(m => !m.isHidden).length} visible)`} sectionKey="materials" />
        {expandedSections.materials && (
          <div className="p-6 space-y-3">
            {settings.materials.map((material, idx) => (
              <div key={material.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                <button
                  onClick={() => {
                    const updated = [...settings.materials];
                    updated[idx] = { ...updated[idx], isHidden: !updated[idx].isHidden };
                    setSettings({ ...settings, materials: updated });
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${material.isHidden ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-600'}`}
                >
                  {material.isHidden ? 'H' : 'V'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{material.name}</div>
                  <div className="text-xs text-slate-400">{material.tier}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">$/sqft</span>
                  <input
                    type="number"
                    step="0.01"
                    value={material.costPerSqft}
                    onChange={(e) => {
                      const updated = [...settings.materials];
                      updated[idx] = { ...updated[idx], costPerSqft: Number(e.target.value) };
                      setSettings({ ...settings, materials: updated });
                    }}
                    className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-sm font-bold text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
