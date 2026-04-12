// Transaction-related constants pulled out of the screen files.
// Keeps the screens cleaner and makes it easy to tweak labels/statuses
// without hunting through JSX.

// -- Home Screen tab filtering --

// The tabs shown at the top of the transaction list
export const TABS = [
  'All Transactions',
  'Action Required',
  'Open',
  'Closed',
];

export const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom' },
];

export const SORT_FIELD_OPTIONS = [
  { value: 'type', label: 'Transaction type' },
  { value: 'description', label: 'Transaction description' },
  { value: 'amount', label: 'Transaction value' },
  { value: 'closing_date', label: 'Closing date' },
  { value: 'created_at', label: 'Creation date' },
  { value: 'status', label: 'Status' },
];

// Handy groupings for the stats cards
export const OPEN_STATUSES = [
  'STAGING',
  'DRAFT',
  'AWAITING_FUNDS',
  'AWAITING_SIGNATURES',
  'AWAITING_DISBURSEMENT',
];

export const CLOSED_STATUSES = ['VOIDED', 'COMPLETED', 'CLOSED'];

// Which API statuses belong under each tab. null means "show everything".
export const STATUS_MAP = {
  'All Transactions': null,
  'Action Required': ['AWAITING_SIGNATURES', 'AWAITING_FUNDS'],
  Open: OPEN_STATUSES,
  'Closed': ['VOIDED', 'CLOSED'],
};

// -- Transaction Detail stepper --

// The order here matters! It drives the progress stepper on the detail screen.
// Each index lines up across all three arrays so stage 0 is STAGING / Agreement / document icon, etc.
export const STAGE_ORDER = [
  'STAGING',
  'AWAITING_SIGNATURES',
  'AWAITING_FUNDS',
  'AWAITING_DISBURSEMENT',
  'COMPLETED',
];

export const STAGE_LABELS = [
  'Agreement',
  'Escrow',
  'Delivery',
  'Acceptance',
  'Disbursement',
];

export const STAGE_ICONS = [
  'document-text-outline',
  'lock-closed-outline',
  'time-outline',
  'checkbox-outline',
  'wallet-outline',
];
