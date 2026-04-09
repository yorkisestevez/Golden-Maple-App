'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Service, PricingConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function PricingEnginePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: servicesData }, { data: configData }] = await Promise.all([
        supabase.from('services').select('*').eq('contractor_id', user.id).order('display_order'),
        supabase.from('pricing_config').select('*').eq('contractor_id', user.id).single(),
      ]);

      if (servicesData) setServices(servicesData as Service[]);
      if (configData) setConfig(configData as PricingConfig);
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setMessage('');

    const supabase = createClient();
    const { error } = await supabase
      .from('pricing_config')
      .update({
        crew_rate_per_day: config.crew_rate_per_day,
        crew_multiplier: config.crew_multiplier,
        tier_good_multiplier: config.tier_good_multiplier,
        tier_better_multiplier: config.tier_better_multiplier,
        tier_best_multiplier: config.tier_best_multiplier,
        tier_good_label: config.tier_good_label,
        tier_good_desc: config.tier_good_desc,
        tier_better_label: config.tier_better_label,
        tier_better_desc: config.tier_better_desc,
        tier_best_label: config.tier_best_label,
        tier_best_desc: config.tier_best_desc,
        site_standard_add_days: config.site_standard_add_days,
        site_moderate_add_days: config.site_moderate_add_days,
        site_complex_add_days: config.site_complex_add_days,
        rounding_increment: config.rounding_increment,
        minimum_estimate: config.minimum_estimate,
        show_hst: config.show_hst,
        hst_rate: config.hst_rate,
        currency: config.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    setMessage(error ? 'Failed to save' : 'Pricing config saved!');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveService = async (service: Service) => {
    const supabase = createClient();
    const { id, contractor_id, created_at, ...updateData } = service;
    await supabase.from('services').update(updateData).eq('id', id);
  };

  const updateService = (id: string, field: string, value: number | string | boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const updateConfig = (field: string, value: number | string | boolean) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF63]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F2EEE7]">Pricing Engine</h1>
        <p className="text-[#A89F91] mt-1">Configure your rates, tiers, and service pricing</p>
      </div>

      {/* Global Config */}
      {config && (
        <Card variant="bordered" className="space-y-4">
          <h2 className="text-lg font-semibold text-[#F2EEE7]">Global Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="crew_rate"
              label="Crew Rate / Day ($)"
              type="number"
              value={config.crew_rate_per_day}
              onChange={(e) => updateConfig('crew_rate_per_day', Number(e.target.value))}
            />
            <Input
              id="crew_multiplier"
              label="Crew Multiplier"
              type="number"
              step="0.05"
              value={config.crew_multiplier}
              onChange={(e) => updateConfig('crew_multiplier', Number(e.target.value))}
            />
            <Input
              id="rounding"
              label="Rounding Increment ($)"
              type="number"
              value={config.rounding_increment}
              onChange={(e) => updateConfig('rounding_increment', Number(e.target.value))}
            />
            <Input
              id="minimum"
              label="Minimum Estimate ($)"
              type="number"
              value={config.minimum_estimate}
              onChange={(e) => updateConfig('minimum_estimate', Number(e.target.value))}
            />
            <Input
              id="hst_rate"
              label="Tax Rate"
              type="number"
              step="0.01"
              value={config.hst_rate}
              onChange={(e) => updateConfig('hst_rate', Number(e.target.value))}
            />
            <Input
              id="currency"
              label="Currency"
              value={config.currency}
              onChange={(e) => updateConfig('currency', e.target.value)}
            />
          </div>

          <h3 className="text-sm font-semibold text-[#A89F91] mt-4">Tier Multipliers</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="tier_good"
              label={config.tier_good_label}
              type="number"
              step="0.05"
              value={config.tier_good_multiplier}
              onChange={(e) => updateConfig('tier_good_multiplier', Number(e.target.value))}
            />
            <Input
              id="tier_better"
              label={config.tier_better_label}
              type="number"
              step="0.05"
              value={config.tier_better_multiplier}
              onChange={(e) => updateConfig('tier_better_multiplier', Number(e.target.value))}
            />
            <Input
              id="tier_best"
              label={config.tier_best_label}
              type="number"
              step="0.05"
              value={config.tier_best_multiplier}
              onChange={(e) => updateConfig('tier_best_multiplier', Number(e.target.value))}
            />
          </div>

          <Button onClick={handleSaveConfig} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Config
          </Button>
          {message && <p className="text-sm text-green-400">{message}</p>}
        </Card>
      )}

      {/* Services */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#F2EEE7]">Services</h2>
        {services.map((service) => (
          <Card key={service.id} variant="bordered">
            <button
              type="button"
              className="w-full flex items-center justify-between"
              onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                <span className="font-medium text-[#F2EEE7]">{service.label}</span>
                <span className="text-sm text-[#A89F91]">({service.unit})</span>
              </div>
              {expandedService === service.id ? (
                <ChevronUp className="w-5 h-5 text-[#A89F91]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#A89F91]" />
              )}
            </button>

            {expandedService === service.id && (
              <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id={`${service.id}-label`}
                    label="Label"
                    value={service.label}
                    onChange={(e) => updateService(service.id, 'label', e.target.value)}
                  />
                  <Input
                    id={`${service.id}-unit`}
                    label="Unit"
                    value={service.unit}
                    onChange={(e) => updateService(service.id, 'unit', e.target.value)}
                  />
                </div>

                <h4 className="text-sm font-semibold text-[#A89F91]">Material Costs (per {service.unit})</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs text-[#A89F91]">Good</span>
                    <Input
                      id={`${service.id}-mat-good-low`}
                      type="number"
                      placeholder="Low"
                      value={service.mat_cost_good_low}
                      onChange={(e) => updateService(service.id, 'mat_cost_good_low', Number(e.target.value))}
                    />
                    <Input
                      id={`${service.id}-mat-good-high`}
                      type="number"
                      placeholder="High"
                      value={service.mat_cost_good_high}
                      onChange={(e) => updateService(service.id, 'mat_cost_good_high', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-[#A89F91]">Better</span>
                    <Input
                      id={`${service.id}-mat-better-low`}
                      type="number"
                      placeholder="Low"
                      value={service.mat_cost_better_low}
                      onChange={(e) => updateService(service.id, 'mat_cost_better_low', Number(e.target.value))}
                    />
                    <Input
                      id={`${service.id}-mat-better-high`}
                      type="number"
                      placeholder="High"
                      value={service.mat_cost_better_high}
                      onChange={(e) => updateService(service.id, 'mat_cost_better_high', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-[#A89F91]">Best</span>
                    <Input
                      id={`${service.id}-mat-best-low`}
                      type="number"
                      placeholder="Low"
                      value={service.mat_cost_best_low}
                      onChange={(e) => updateService(service.id, 'mat_cost_best_low', Number(e.target.value))}
                    />
                    <Input
                      id={`${service.id}-mat-best-high`}
                      type="number"
                      placeholder="High"
                      value={service.mat_cost_best_high}
                      onChange={(e) => updateService(service.id, 'mat_cost_best_high', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#A89F91]">
                    <input
                      type="checkbox"
                      checked={service.is_active}
                      onChange={(e) => updateService(service.id, 'is_active', e.target.checked)}
                      className="rounded"
                    />
                    Active
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveService(service)}
                  >
                    <Save className="w-3 h-3 mr-1" /> Save Service
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
