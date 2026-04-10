
export enum UserRole {
  OWNER = 'OWNER',
  OFFICE = 'OFFICE',
  FIELD_LEAD = 'FIELD_LEAD',
  CREW = 'CREW',
  SUB = 'SUB'
}

export enum AppMode {
  OPS = 'OPS',
  KB = 'KB'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

// --- SYSTEM SETTINGS V1 (CANONICAL) ---
export interface FinancialBrain {
  currency: 'CAD' | 'USD';
  tax: { enabled: boolean; ratePercent: number };
  overhead: {
    mode: 'monthly_overhead' | 'overhead_per_billable_hour';
    monthlyOverhead: number | null;
    billableHoursPerMonth: number | null;
    overheadPerBillableHour: number | null;
  };
  labor: {
    laborBurdenPercent: number;
    defaultCrewEfficiencyPercent: number;
  };
  pricingRules: {
    tradeOnly: true;
    markupMode: 'target_margin' | 'markup';
    targetMarginPercent: number | null;
    markupPercent: number | null;
    minimumJobPrice: number | null;
    contingencyPercent: number | null;
  };
  rounding: {
    lineItemRounding: "none" | "nearest_0.05" | "nearest_0.10" | "nearest_1" | "nearest_5" | "nearest_10";
    totalRounding: "none" | "nearest_1" | "nearest_5" | "nearest_10";
  };
  computed: {
    computedOverheadPerBillableHour: number;
    recommendedLaborCostMultiplier: number;
    lastComputedAtISO: string;
  };
}

export interface EmployeeV2 {
  id: string;
  status: 'active' | 'inactive';
  name: string;
  role: 'owner' | 'office' | 'field_lead' | 'installer' | 'laborer' | 'subcontractor';
  employmentType: 'hourly' | 'salary' | 'subcontract';
  defaultBillable: boolean;
  pay: {
    baseRate: number | null;
    salaryAnnual: number | null;
    subcontractRate: number | null;
  };
  burden: {
    burdenPercentOverride: number | null;
  };
  loadedCost: {
    loadedRate: number | null;
    lastComputedAtISO: string;
  };
  permissions: {
    appRole: 'owner' | 'office' | 'field_lead' | 'crew';
    canApproveChangeOrders: boolean;
    canViewFinancials: boolean;
  };
  notes: string;
}

export interface CrewHR {
  employees: EmployeeV2[];
  defaults: {
    standardShiftHours: number;
    overtimeRule: { enabled: boolean; startsAfterHours: number; multiplier: number };
  };
}

export interface SynkOpsSettingsV1 {
  version: number;
  updatedAtISO: string;
  company: {
    name: string;
    ownerName: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  financialBrain: FinancialBrain;
  crewHR: CrewHR;
}

// --- KNOWLEDGE BASE ---
export interface KBEntry {
  id: string;
  type: 'kb_entry';
  title: string;
  categoryPath: string;
  tags: string[];
  markdown: string;
  lastUpdated: string;
  author: string;
}

// --- CATALOG & PRICING ---
export type PricingTier = 'trade' | 'retail' | string;
export type UMNormalized = "EA" | "SQFT" | "LNFT" | "TON" | "YD" | "BAG" | "PALLET" | "HOUR" | "TRIP" | "OTHER";

export interface CatalogItem {
  id: string;
  vendorId: string;
  pricebookId: string;
  categoryId?: string;
  itemType: "product" | "service";
  brand?: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  umNormalized: UMNormalized;
  department: string;
  vendorSku?: string;
  leadTime?: string;
  tierPrices: Record<string, number | null | undefined>;
  pricing: { tradePrice: number; retailPrice: number };
  status: "active" | "discontinued";
  searchableText: string;
  createdAtISO: string;
  updatedAtISO: string;
  visibility: { isFavorite: boolean };
  packInfoText?: string;
  tags: string[];
  synonyms: string[];
  usage?: { useCount: number; lastUsedAt: string };
  taxCategory?: "materials" | "delivery" | "equipment" | "labor" | "service";
  updatedAt?: string;
  effectiveDate?: string;
  variants?: any[];
}

export interface CostCode {
  id: string;
  code: string;
  name: string;
  division: string;
  order: number;
}

// --- CRM & PROJECTS ---
export enum LeadStatus { 
  NEW = 'NEW', CONTACTED = 'CONTACTED', SITE_VISIT_BOOKED = 'SITE_VISIT_BOOKED', 
  SITE_VISIT_DONE = 'SITE_VISIT_DONE', ESTIMATE_IN_PROGRESS = 'ESTIMATE_IN_PROGRESS', 
  QUOTE_SENT = 'QUOTE_SENT', FOLLOW_UP_DUE = 'FOLLOW_UP_DUE', WON = 'WON', LOST = 'LOST' 
}

export interface Lead { 
  id: string; createdDate: string; source: string; clientName: string; phone: string; 
  email: string; address: string; projectType: string; budgetRange: string; 
  timeline: string; notes: string; status: LeadStatus; nextActionDate?: string; 
}

export enum JobStatus { 
  DRAFT = 'DRAFT', READY_TO_SCHEDULE = 'READY_TO_SCHEDULE', 
  SCHEDULED_PREP_PENDING = 'SCHEDULED_PREP_PENDING', READY_TO_START = 'READY_TO_START', 
  IN_PROGRESS = 'IN_PROGRESS', WAITING_BLOCKED = 'WAITING_BLOCKED', 
  PUNCHLIST = 'PUNCHLIST', COMPLETED = 'COMPLETED', CLOSED = 'CLOSED', WARRANTY = 'WARRANTY' 
}

export interface Job { 
  id: string; leadId?: string; clientName: string; address: string; status: JobStatus; 
  crewIds: string[]; fieldLeadId: string; startDate?: string; targetEndDate?: string; 
  budgetTotal: number; progressPercent: number; 
  metrics: { 
    plannedLaborHours: number; 
    actualLaborHours: number; 
    plannedUnits: number; 
    actualUnitsCompleted: number;
    plannedDays: number;
    actualDaysElapsed: number;
  }; 
  locatesConfirmed: boolean;
  materialsOrdered: boolean;
  depositPaid: boolean;
  planUploaded: boolean;
  hidePricingFromField?: boolean;
  warnings?: string[];
  gateOverrides?: Record<string, boolean>;
  siteLat?: number;
  siteLng?: number;
  geofenceRadiusMeters?: number;
}

// --- INVOICING ---
export enum InvoiceStatus { 
  DRAFT = 'DRAFT', SENT = 'SENT', PAID = 'PAID', OVERDUE = 'OVERDUE', VOID = 'VOID',
  PARTIALLY_PAID = 'PARTIALLY_PAID', READY_TO_SEND = 'READY_TO_SEND'
}

export enum InvoiceType { DEPOSIT = 'DEPOSIT', PROGRESS = 'PROGRESS', FINAL = 'FINAL', CHANGE_ORDER = 'CHANGE_ORDER' }

export interface InvoiceLineItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  unitPrice: number;
  taxable: boolean;
  total: number;
}

export interface Invoice { 
  id: string; invoiceNumber: string; jobId: string; jobName: string; clientName: string; 
  total: number; balance: number; status: InvoiceStatus; issueDate: string; createdAt: string; 
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  type: InvoiceType;
  address?: string;
  updatedAt?: string;
  voidReason?: string;
  notesClient?: string;
  notesInternal?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'e-transfer' | 'cash' | 'cheque' | 'credit card' | 'bank transfer' | 'other';
  reference?: string;
}

// --- ESTIMATES & PROPOSALS ---
export enum EstimateStatus { DRAFT = 'DRAFT', SENT = 'SENT', ACCEPTED = 'ACCEPTED', DECLINED = 'DECLINED' }
export enum BuildSystem { STANDARD = 'STANDARD', PERMEABLE = 'PERMEABLE' }
export enum AccessCondition { NORMAL = 'NORMAL', RESTRICTED = 'RESTRICTED' }

export interface EstimateLineItem { id: string; name: string; qty: number; unitCost: number; total: number; }

export interface EstimateBlock {
  id: string;
  category: string;
  name: string;
  qty: number;
  unit: string;
  materials: EstimateLineItem[];
  laborHours: number;
  equipmentHours: number;
  subCost: number;
  clientNotes: string;
  internalNotes: string;
}

export interface Estimate {
  id: string;
  version: number;
  status: EstimateStatus;
  clientName: string;
  address: string;
  projectType: string;
  buildSystem: BuildSystem;
  accessConditions: AccessCondition;
  blocks: EstimateBlock[];
  createdDate: string;
  totalValue: number;
  depositRequired: number;
}

export enum ProposalStatus { DRAFT = 'DRAFT', SENT = 'SENT', VIEWED = 'VIEWED', ACCEPTED = 'ACCEPTED', DECLINED = 'DECLINED' }
export enum ProposalSectionType { HERO = 'HERO', WELCOME = 'WELCOME', PROJECT_UNDERSTANDING = 'PROJECT_UNDERSTANDING', SCOPE = 'SCOPE', MATERIALS = 'MATERIALS', PROCESS = 'PROCESS', TIMELINE = 'TIMELINE', INVESTMENT = 'INVESTMENT', WARRANTY = 'WARRANTY', SIGNATURE = 'SIGNATURE' }

export interface ProposalSection { id: string; type: ProposalSectionType; title: string; isVisible: boolean; content: any; }

export interface Proposal {
  id: string;
  estimateId: string;
  estimateVersion: number;
  clientName: string;
  address: string;
  status: ProposalStatus;
  createdDate: string;
  sentDate?: string;
  totalValue: number;
  depositRequired: number;
  sections: ProposalSection[];
  alternates: any[];
}

// --- CALENDAR & SCHEDULE ---
export enum CalendarEventType { JOB = 'JOB', SITE_VISIT = 'SITE_VISIT' }
export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  jobId?: string;
  crewId?: string;
  leadId?: string;
  address?: string;
  notes?: string;
  color?: string;
}

export interface Crew { id: string; name: string; color: string; leadId: string; memberIds: string[]; }

// --- LOGS & TRACKING ---
export enum LogStatus { DRAFT = 'DRAFT', SUBMITTED = 'SUBMITTED' }
export interface LogProductionEntry { unitId: string; unitName: string; planned: number; completedToday: number; }
export interface DailyLog {
  id: string;
  jobId: string;
  date: string;
  status: LogStatus;
  fieldLeadId: string;
  crewIds: string[];
  startTime: string;
  endTime: string;
  lunchMinutes: number;
  weather: string;
  siteConditions: string[];
  workCompleted: string[];
  production: LogProductionEntry[];
  equipmentIds: string[];
  clientSpokeWith: boolean;
  clientInteractionNotes: string;
  tomorrowPlan: string;
  tomorrowStatus: 'CONTINUE' | 'WAITING' | 'DECISION';
  photos: string[];
  submittedAt?: string;
}

export interface TimeClockEntry { id: string; jobId: string; userId: string; userName: string; type: 'check_in' | 'check_out'; timestamp: string; }

export interface AppNotification {
  id: string;
  type: string;
  jobId?: string;
  permitId?: string;
  referenceId?: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  priority?: 'normal' | 'urgent';
  timestamp?: string;
  createdAtISO?: string;
  read?: boolean;
  dismissed?: boolean;
}

// --- PHOTOS ---
export enum PhotoCategory { BEFORE = 'BEFORE', DURING = 'DURING', AFTER = 'AFTER', CLOSEOUT = 'CLOSEOUT' }
export type PhotoAssignmentStatus = 'assigned' | 'needs_choice' | 'unassigned';
export interface CandidateJob { jobId: string; jobName: string; distanceMeters: number; fenceRadius: number; }
export interface Photo {
  id: string;
  jobId: string;
  jobName: string;
  address?: string;
  category: PhotoCategory;
  caption?: string;
  uploaderName: string;
  createdAt: string;
  dataUrl: string;
  mimeType: string;
  order: number;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  source: 'gps' | 'manual_pin' | 'unknown';
  placeId?: string;
  formattedAddress?: string;
  assignmentStatus: PhotoAssignmentStatus;
  candidateJobs?: CandidateJob[];
}

// --- CHANGE ORDERS ---
export enum ChangeOrderStatus { DRAFT = 'DRAFT', PENDING_APPROVAL = 'PENDING_APPROVAL', APPROVED = 'APPROVED', SENT = 'SENT', SIGNED = 'SIGNED', DECLINED = 'DECLINED', VOID = 'VOID' }
export enum ChangeOrderReason { CLIENT_REQUEST = 'CLIENT_REQUEST', UNFORESEEN_SITE_CONDITION = 'UNFORESEEN_SITE_CONDITION', ERROR_IN_DOCS = 'ERROR_IN_DOCS', MATERIAL_SUBSTITUTION = 'MATERIAL_SUBSTITUTION' }
export interface COLineItem { id: string; name: string; qty: number; unit: string; unitPrice: number; category: 'material' | 'labor' | 'equipment' | 'sub'; order: number; }
export enum COSectionType { HEADER = 'HEADER', REASON = 'REASON', SCOPE = 'SCOPE', PRICING = 'PRICING', SIGNATURE = 'SIGNATURE', NOTES = 'NOTES' }
export interface COSection { id: string; type: COSectionType; title: string; isVisible: boolean; isLocked: boolean; order: number; content: any; }
export interface ChangeOrder {
  id: string;
  coNumber: string;
  jobId: string;
  jobName: string;
  address: string;
  title: string;
  reason: ChangeOrderReason;
  description: string;
  pricingMode: 'fixed' | 'line_items';
  lineItems: COLineItem[];
  priceDelta: number;
  taxRate: number;
  taxIncluded: boolean;
  totalWithTax: number;
  daysImpact: number;
  scheduleAffected: boolean;
  status: ChangeOrderStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sections: COSection[];
  attachments: any[];
  signature?: { name: string; signedAt: string; method: 'typed'; ipPlaceholder: string; };
  invoicedAt?: string;
  invoiceId?: string;
}

// --- WARRANTY & SERVICE ---
export enum WarrantyStatus { NEW = 'NEW', SCHEDULED = 'SCHEDULED', IN_REPAIR = 'IN_REPAIR', RESOLVED = 'RESOLVED', CLOSED = 'CLOSED', DENIED = 'DENIED', PAID_OPTION = 'PAID_OPTION' }
export enum WarrantyPriority { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH' }
export enum IssueType { SETTLEMENT = 'SETTLEMENT', PAVER_FAILURE = 'PAVER_FAILURE', DRAINAGE_ISSUE = 'DRAINAGE_ISSUE', LIGHTING_ISSUE = 'LIGHTING_ISSUE', OTHER = 'OTHER' }
export interface WarrantyPolicy { id: string; name: string; durationMonths: number; coverageText: string; exclusionsText: string; }
export interface WarrantyRecord { id: string; jobId: string; startDate: string; endDate: string; policySnapshot: WarrantyPolicy; }
export enum DenialReason { THIRD_PARTY = 'THIRD_PARTY_INTERFERENCE', MAINTENANCE_LACK = 'LACK_OF_MAINTENANCE', ACT_OF_GOD = 'FORCE_MAJEURE', EXPIRED = 'WARRANTY_EXPIRED', OUT_OF_SCOPE = 'NOT_IN_ORIGINAL_CONTRACT' }
export enum ResolutionOutcome { COVERED_REPAIRED = 'COVERED_AND_REPAIRED', DENIED_PAID_FIX = 'DENIED_OFFERED_PAID_FIX', DENIED_NO_ACTION = 'DENIED_NO_ACTION', MINOR_OBSERVE = 'MINOR_MONITOR_AND_OBSERVE' }
export interface WarrantyCase {
  id: string;
  caseNumber: string;
  linkedJobId?: string;
  warrantyRecordId?: string;
  clientName: string;
  address: string;
  jobType?: string;
  issueType: IssueType;
  description: string;
  priority: WarrantyPriority;
  status: WarrantyStatus;
  warrantyValid: boolean;
  decision?: 'covered' | 'denied';
  denialReason?: DenialReason;
  closureNote?: string;
  outcome?: ResolutionOutcome;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitReport {
  id: string;
  caseId: string;
  date: string;
  arrival: string;
  departure: string;
  findings: { cause: 'install-related' | 'drainage-related' | 'soil-movement' | 'third-party' | 'client-maintenance' | 'unknown'; severity: 'minor' | 'moderate' | 'severe'; };
  workPerformed: string[];
  notes: string;
  photos: string[];
  createdBy?: string;
  createdAt?: string;
}

// --- VENDORS & PROCUREMENT ---
export type VendorType = 'supplier' | 'subcontractor' | 'rental' | 'disposal';
export interface Vendor {
  id: string;
  name: string;
  vendorTypes: VendorType[];
  tags: string[];
  region: string;
  active: boolean;
  defaultTier: string;
  compliance: { approved: boolean; doNotAssign: boolean };
  insurance?: { provider: string; policyNumber: string; expiryDate: string };
  wsib?: { number: string; expiryDate: string };
  catalog?: CatalogItem[];
  createdAtISO: string;
  updatedAtISO: string;
}

export interface Pricebook { id: string; vendorId: string; name: string; effectiveDateISO: string; sourceType: "paste" | "csv" | "api"; status: "active" | "archived" | "draft"; createdAtISO: string; updatedAtISO: string; }
export enum POStatus { DRAFT = 'DRAFT', ORDERED = 'ORDERED', PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED', RECEIVED = 'RECEIVED', CANCELLED = 'CANCELLED' }
export interface POLineItem { id: string; name: string; qty: number; unit: string; unitPrice: number; receivedQty: number; }
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  jobId: string;
  jobName: string;
  status: POStatus;
  items: POLineItem[];
  deliveryType: 'pickup' | 'delivery';
  requestedWindow: string;
  createdAt: string;
  updatedAt: string;
  totalValue: number;
}

export interface Delivery { id: string; poId: string; status: 'scheduled' | 'en_route' | 'delivered'; estimatedArrival: string; }
export interface SubAssignment { id: string; jobId: string; vendorId: string; status: 'requested' | 'confirmed' | 'active' | 'completed'; }
export interface VendorContact { id: string; vendorId: string; name: string; role: string; email: string; phone: string; }

// --- PERMITS ---
export type PermitStatus = 'required' | 'applied' | 'approved' | 'rejected' | 'expired' | 'not_needed';
export interface PermitChecklistItem { id: string; label: string; status: 'pending' | 'done'; }
export interface PermitRecord {
  id: string;
  jobId: string;
  title: string;
  type: string;
  authorityName: string;
  permitNumber?: string;
  status: PermitStatus;
  priority: 'low' | 'normal' | 'high';
  responsibility: 'contractor' | 'client' | 'shared';
  dueByISO?: string;
  appliedAtISO?: string;
  approvedAtISO?: string;
  expiresAtISO?: string;
  inspections: any[];
  checklist: PermitChecklistItem[];
  attachments: any[];
  createdAtISO: string;
  updatedAtISO: string;
  createdBy: string;
  updatedBy: string;
}

// --- TEMPLATES ---
export type TemplateType = 'proposal' | 'change_order' | 'warranty_policy' | 'daily_log';
export type DocSectionType = 'header' | 'summary' | 'scope' | 'materials' | 'pricing' | 'terms' | 'acceptance';
export interface DocSection { id: string; type: DocSectionType; title: string; enabled: boolean; locked: boolean; content: string; variablesUsed: string[]; style: { emphasis: 'normal' | 'callout' | 'fineprint' }; order: number; }
export interface DocTemplatePayload {
  brand?: { companyName: string };
  sections: DocSection[];
  jobType?: string;
  requiredPhotoMin?: number;
  requiredPhotoCategories?: string[];
  productionRows?: { key: string, label: string, unit: string }[];
  policyName?: string;
  durationMonths?: number;
  coverageText?: string;
  exclusionsText?: string;
  defaultDecisionPosture?: string;
}
export interface TemplateVersion { versionId: string; versionNumber: number; createdAt: string; createdBy: string; payload: DocTemplatePayload; }
export type TemplateStatus = 'draft' | 'published' | 'archived';
export interface TemplateBase {
  id: string;
  type: TemplateType;
  name: string;
  status: TemplateStatus;
  isDefault: boolean;
  jobType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  publishedAt?: string;
  versions: TemplateVersion[];
}

// --- DATA CENTER & ANALYTICS ---
export interface UsageRecord { useCount: number; lastUsedAt: string; }
export interface VisitNote { id: string; jobId: string; jobName: string; author: string; content: string; createdAt: string; }

// --- CART ---
export interface CartLine { id: string; addedAtISO: string; catalogItemId: string; vendorId: string; pricebookId: string; name: string; um: string; tier: string; qty: number; unitPrice: number; extended: number; notes?: string; }

// --- MATERIAL REQUEST ---
export interface MaterialRequestItem { id: string; name: string; qty: number; unit: string; }
export interface MaterialRequest {
  id: string;
  jobId: string;
  jobName: string;
  requestedBy: string;
  requestedById: string;
  requestedAt: string;
  neededBy: string;
  deliveryType: 'delivery' | 'pickup';
  location: string;
  priority: 'normal' | 'urgent';
  items: MaterialRequestItem[];
  status: 'submitted' | 'ordered' | 'received';
}

// --- GLOBAL CONFIG & ANALYTICS TYPES ---

/**
 * CompanyConfig is the application state for global parameters used in logic.
 */
export interface CompanyConfig {
  name: string;
  hstPercent: number;
  depositPercent: number;
  warrantyPeriod?: string;
  laborRates: {
    crew: number;
    lead: number;
    operator: number;
  };
  markupRules: {
    materials: number;
    subs: number;
  };
  googleCalendarConnected?: boolean;
  currency: 'CAD' | 'USD' | string;
  taxEnabled: boolean;
  roundingRule: "none" | "nearest_1" | "nearest_5" | "nearest_10";
  minJobSize: number;
}

export type ProductionUnit = UMNormalized;

export interface ProductionRate {
  id: string;
  taskName: string;
  category: string;
  unit: ProductionUnit;
  baseUnitsPerHour: number;
  complexityMultipliers: {
    normal: number;
    complex: number;
    restricted: number;
  };
  updatedAt: string;
}

export interface AssemblyItem {
  catalogItemId: string;
  name: string;
  qtyPerUnit: number;
  unit: string;
}

export interface Assembly {
  id: string;
  name: string;
  jobType: string;
  unit: string;
  items: AssemblyItem[];
  defaultDifficulty: 'normal' | 'complex' | 'restricted';
  createdAt: string;
  updatedAt: string;
}

export interface CatalogCategory {
  id: string;
  vendorId?: string;
  parentId?: string;
  name: string;
  order: number;
  categoryType: string;
  tags: string[];
}

export type GoogleStatus = 'connected' | 'disconnected' | 'error';

export interface GoogleIntegrationSettings {
  enabled: boolean;
  status: GoogleStatus;
  connectedEmail?: string;
  enabledServices: {
    calendar: boolean;
    gmail: boolean;
    drive: boolean;
    sheets: boolean;
    contacts: boolean;
    maps: boolean;
  };
  calendar: {
    calendarId?: string;
    syncMode: 'manual' | 'one-way' | 'two-way';
  };
  drive: {
    rootFolderId?: string;
  };
  sheets: {
    spreadsheetId?: string;
  };
  contacts: {
    syncMode: 'import' | 'sync';
  };
  lastHealthCheckAt?: string;
  lastError?: string;
}

export type RoundingStep = 'none' | '1' | '5' | '10' | '25' | '100';
export type LineItemRounding = "none" | "nearest_0.05" | "nearest_0.10" | "nearest_1" | "nearest_5" | "nearest_10";

export interface FinancialRules {
  currencyCode: string;
  taxEnabled: boolean;
  taxName: string;
  taxRatePercent: number;
  taxInclusivePricing: boolean;
  taxRoundingRule: string;
  taxAppliesTo: {
    materials: boolean;
    labor: boolean;
    subs: boolean;
    equipment: boolean;
    logistics: boolean;
  };
  rounding: {
    totalsTo: RoundingStep;
    roundLineItems: boolean;
  };
  deposit: {
    percent: number;
  };
  minJobSize: number;
}

export interface EstimatingSettings {
  overhead: {
    allocationMethod: 'perBillableHour' | 'percentOfLabor' | 'percentOfRevenue';
    fixedCategories: { id: string; name: string; amount: number }[];
    expectedBillableHoursPerPeriod: number;
    utilizationPercent: number;
  };
  labor: {
    burdenPercentDefault: number;
    salaryHoursPerYear: number;
  };
  pricingStrategy: {
    mode: 'markup' | 'margin';
    markupMaterialsPercent: number;
    markupLaborPercent: number;
    markupSubPercent: number;
    markupEquipmentPercent: number;
    targetGrossMarginPercent: number;
    targetNetProfitPercent: number;
    contingencyPercent: number;
    includeOverheadInCost: boolean;
  };
}

export interface BusinessProfile {
  id?: string;
  business: {
    displayName: string;
    ownerName: string;
  };
  branding: {
    appName: string;
    accentColor: string;
  };
  financial: FinancialRules;
  estimating: EstimatingSettings;
  integrations: {
    google: GoogleIntegrationSettings;
  };
  permissions: {
    employees: (EmployeeV2 & { loadedCostRate: number })[];
  };
}
