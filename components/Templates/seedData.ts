
import { TemplateBase } from '../../types';

export const SEED_TEMPLATES: TemplateBase[] = [
  {
    id: 'tmpl-prop-hardscape',
    type: 'proposal',
    name: 'Hardscape Installation Master',
    status: 'published',
    isDefault: true,
    jobType: 'hardscape',
    tags: ['hardscape', 'premium'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System',
    updatedBy: 'System',
    versions: [{
      versionId: 'v1',
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      createdBy: 'System',
      payload: {
        brand: { companyName: 'SynkOps' },
        sections: [
          { id: 'sec-1', type: 'header', title: 'COVER PAGE', enabled: true, locked: true, order: 0, content: 'PROPOSAL: {{jobType}} PROJECT\nFOR: {{clientName}}', style: { emphasis: 'normal' }, variablesUsed: [] },
          { id: 'sec-2', type: 'scope', title: 'PROJECT SCOPE', enabled: true, locked: false, order: 1, content: 'This proposal outlines the professional installation for the property located at {{jobAddress}}.', style: { emphasis: 'normal' }, variablesUsed: [] },
          { id: 'sec-3', type: 'pricing', title: 'INVESTMENT', enabled: true, locked: false, order: 2, content: 'Base Contract Value: {{priceTotal}}', style: { emphasis: 'normal' }, variablesUsed: [] },
          { id: 'sec-4', type: 'terms', title: 'TERMS & WARRANTY', enabled: true, locked: false, order: 3, content: 'Standard 5-Year Workmanship Warranty applies to all hardscape units.', style: { emphasis: 'normal' }, variablesUsed: [] },
          { id: 'sec-5', type: 'acceptance', title: 'ACCEPTANCE', enabled: true, locked: true, order: 4, content: 'By signing below, you accept the terms of this agreement.', style: { emphasis: 'normal' }, variablesUsed: [] }
        ]
      }
    }]
  },
  {
    id: 'tmpl-log-hardscape',
    type: 'daily_log',
    name: 'Hardscape Daily Production',
    status: 'published',
    isDefault: true,
    jobType: 'hardscape',
    tags: ['field'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System',
    updatedBy: 'System',
    versions: [{
      versionId: 'v1',
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      createdBy: 'System',
      payload: {
        jobType: 'hardscape',
        requiredPhotoMin: 3,
        requiredPhotoCategories: ['Base Prep', 'Progress', 'Cleanup'],
        productionRows: [
          { key: 'pavers_sqft', label: 'Pavers Installed', unit: 'SQFT' },
          { key: 'excavation_yards', label: 'Soil Excavated', unit: 'Yards' }
        ],
        // Fix: Added missing sections property to satisfy DocTemplatePayload interface
        sections: []
      }
    }]
  },
  {
    id: 'tmpl-warranty-standard',
    type: 'warranty_policy',
    name: '5-Year Hardscape Settlement Policy',
    status: 'published',
    isDefault: true,
    jobType: 'hardscape',
    tags: ['legal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System',
    updatedBy: 'System',
    versions: [{
      versionId: 'v1',
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      createdBy: 'System',
      payload: {
        policyName: '5-Year Workmanship Warranty',
        durationMonths: 60,
        coverageText: 'Warrants against settlement or sinking of units installed.',
        exclusionsText: 'Does not cover third-party disturbance or improper drainage maintenance.',
        defaultDecisionPosture: 'Presumed Covered (Pending Inspection)',
        // Fix: Added missing sections property to satisfy DocTemplatePayload interface
        sections: []
      }
    }]
  }
];