
import { Proposal, ProposalStatus, ProposalSectionType } from '../../types';
import { STORAGE_KEYS, getJSON, setJSON } from '../storage';

export const listProposals = (): Proposal[] => {
  return getJSON<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
};

export const getProposal = (id: string): Proposal | undefined => {
  return listProposals().find(p => p.id === id);
};

export const saveProposal = (proposal: Proposal) => {
  const all = listProposals();
  const exists = all.findIndex(p => p.id === proposal.id);
  const updated = exists >= 0 
    ? all.map(p => p.id === proposal.id ? proposal : p)
    : [proposal, ...all];
  setJSON(STORAGE_KEYS.PROPOSALS, updated);
};

export const createProposalDraft = (params: { jobId?: string; jobName?: string; clientName?: string; estimateId?: string; totalValue?: number }): Proposal => {
  const newProposal: Proposal = {
    id: `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    estimateId: params.estimateId || '',
    estimateVersion: 1,
    clientName: params.clientName || 'Unnamed Client',
    address: '', // To be filled from job or manually
    status: ProposalStatus.DRAFT,
    createdDate: new Date().toISOString().split('T')[0],
    totalValue: params.totalValue || 0,
    depositRequired: (params.totalValue || 0) * 0.5,
    sections: [
      { id: '1', type: ProposalSectionType.HERO, title: 'Cover', isVisible: true, content: { title: 'Outdoor Project', tagline: 'A Custom Vision' } },
      { id: '2', type: ProposalSectionType.WELCOME, title: 'Introduction', isVisible: true, content: { text: 'Thank you for considering us for your project.' } },
      { id: '3', type: ProposalSectionType.SCOPE, title: 'Project Scope', isVisible: true, content: {} },
      { id: '4', type: ProposalSectionType.INVESTMENT, title: 'Investment Summary', isVisible: true, content: {} },
      { id: '5', type: ProposalSectionType.SIGNATURE, title: 'Acceptance', isVisible: true, content: {} }
    ],
    alternates: []
  };
  
  saveProposal(newProposal);
  return newProposal;
};
