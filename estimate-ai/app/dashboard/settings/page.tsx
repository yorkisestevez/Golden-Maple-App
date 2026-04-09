'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Contractor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Save, Loader2, Upload, Image } from 'lucide-react';

export default function SettingsPage() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setContractor(data as Contractor);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!contractor) return;
    setSaving(true);
    setMessage('');

    const supabase = createClient();
    const { error } = await supabase
      .from('contractors')
      .update({
        company_name: contractor.company_name,
        slug: contractor.slug,
        phone: contractor.phone,
        website: contractor.website,
        logo_url: contractor.logo_url,
        primary_color: contractor.primary_color,
        secondary_color: contractor.secondary_color,
        background_color: contractor.background_color,
        card_color: contractor.card_color,
        text_color: contractor.text_color,
        headline_font: contractor.headline_font,
        body_font: contractor.body_font,
        notification_email: contractor.notification_email,
        webhook_url: contractor.webhook_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractor.id);

    if (error) {
      setMessage('Failed to save settings');
    } else {
      setMessage('Settings saved successfully!');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contractor) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `logos/${contractor.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(path);

      setContractor({ ...contractor, logo_url: publicUrl });
    } catch {
      setMessage('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field: keyof Contractor, value: string) => {
    if (!contractor) return;
    setContractor({ ...contractor, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF63]" />
      </div>
    );
  }

  if (!contractor) return null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F2EEE7]">Brand Settings</h1>
        <p className="text-[#A89F91] mt-1">Customize how your estimator looks to homeowners</p>
      </div>

      {/* Company Info */}
      <Card variant="bordered" className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F2EEE7]">Company Info</h2>
        <Input
          id="company_name"
          label="Company Name"
          value={contractor.company_name}
          onChange={(e) => updateField('company_name', e.target.value)}
        />
        <Input
          id="slug"
          label="URL Slug"
          value={contractor.slug}
          onChange={(e) => updateField('slug', e.target.value)}
        />
        <Input
          id="phone"
          label="Phone"
          value={contractor.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <Input
          id="website"
          label="Website"
          value={contractor.website || ''}
          onChange={(e) => updateField('website', e.target.value)}
        />
        <Input
          id="notification_email"
          label="Lead Notification Email"
          type="email"
          value={contractor.notification_email || ''}
          onChange={(e) => updateField('notification_email', e.target.value)}
        />
        <Input
          id="webhook_url"
          label="Webhook URL (CRM Integration)"
          placeholder="https://your-crm.com/webhook"
          value={contractor.webhook_url || ''}
          onChange={(e) => updateField('webhook_url', e.target.value)}
        />
      </Card>

      {/* Branding */}
      <Card variant="bordered" className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F2EEE7]">Branding</h2>
        <div>
          <label className="block text-sm font-medium text-[#A89F91] mb-1.5">Logo</label>
          <div className="flex items-center gap-4">
            {contractor.logo_url ? (
              <img src={contractor.logo_url} alt="Logo" className="h-12 w-auto object-contain rounded bg-white/5 p-1" />
            ) : (
              <div className="h-12 w-12 rounded bg-white/5 flex items-center justify-center">
                <Image className="w-6 h-6 text-[#A89F91]" />
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-[#F2EEE7] transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload Logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
          <Input
            id="logo_url"
            label="Or paste a URL"
            placeholder="https://example.com/logo.png"
            value={contractor.logo_url || ''}
            onChange={(e) => updateField('logo_url', e.target.value)}
            className="mt-3"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#A89F91] mb-1.5">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={contractor.primary_color}
                onChange={(e) => updateField('primary_color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                id="primary_color"
                value={contractor.primary_color}
                onChange={(e) => updateField('primary_color', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A89F91] mb-1.5">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={contractor.secondary_color}
                onChange={(e) => updateField('secondary_color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                id="secondary_color"
                value={contractor.secondary_color}
                onChange={(e) => updateField('secondary_color', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A89F91] mb-1.5">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={contractor.background_color}
                onChange={(e) => updateField('background_color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                id="background_color"
                value={contractor.background_color}
                onChange={(e) => updateField('background_color', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A89F91] mb-1.5">Card Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={contractor.card_color}
                onChange={(e) => updateField('card_color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                id="card_color"
                value={contractor.card_color}
                onChange={(e) => updateField('card_color', e.target.value)}
              />
            </div>
          </div>
        </div>
        <Input
          id="headline_font"
          label="Headline Font (Google Fonts)"
          placeholder="Cormorant Garamond"
          value={contractor.headline_font}
          onChange={(e) => updateField('headline_font', e.target.value)}
        />
        <Input
          id="body_font"
          label="Body Font (Google Fonts)"
          placeholder="Jost"
          value={contractor.body_font}
          onChange={(e) => updateField('body_font', e.target.value)}
        />
      </Card>

      {message && (
        <p className={`text-sm ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  );
}
