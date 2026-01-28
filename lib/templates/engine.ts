
import { TemplateBase, TemplateType } from '../../types';
import { STORAGE_KEYS, getJSON } from '../storage';

const TEMPLATES_KEY = 'synkops_templates_v1';

export const listTemplates = (type?: TemplateType, filters?: { status?: string; jobType?: string; query?: string }): TemplateBase[] => {
  const all = getJSON<TemplateBase[]>(TEMPLATES_KEY, []);
  return all.filter(t => {
    if (type && t.type !== type) return false;
    if (filters?.status && t.status !== filters.status) return false;
    if (filters?.jobType && t.jobType !== filters.jobType) return false;
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
    }
    return true;
  });
};

export const getTemplate = (id: string, versionId?: string): TemplateBase | undefined => {
  const all = getJSON<TemplateBase[]>(TEMPLATES_KEY, []);
  return all.find(t => t.id === id);
};

export const renderTemplate = (content: string, context: Record<string, any>): string => {
  if (!content) return '';
  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, variable) => {
    return context[variable] !== undefined ? String(context[variable]) : '—';
  });
};

export const validateTemplate = (template: TemplateBase): string[] => {
  const errors: string[] = [];
  if (!template.name) errors.push('Template name is required.');
  if (template.versions.length === 0) errors.push('Template must have at least one version.');
  return errors;
};

export const resolveVariables = (content: string): string[] => {
  const matches = content.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
  const vars = new Set<string>();
  for (const match of matches) {
    vars.add(match[1]);
  }
  return Array.from(vars);
};
