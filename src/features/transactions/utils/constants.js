// Transaction-related constants pulled out of the screen files.
// Keeps the screens cleaner and makes it easy to tweak labels/statuses
// without hunting through JSX.

// -- Home Screen tab filtering --

// The tabs shown at the top of the transaction list
export const TABS = [
  { value: 'All Transactions', labelKey: 'transactions.tabs.all' },
  { value: 'Action Required', labelKey: 'transactions.tabs.actionRequired' },
  { value: 'Open', labelKey: 'transactions.tabs.open' },
  { value: 'Closed', labelKey: 'transactions.tabs.closed' },
];

export const DATE_FILTER_OPTIONS = [
  { value: 'all', labelKey: 'transactions.filters.all' },
  { value: '24h', labelKey: 'transactions.filters.last24Hours' },
  { value: '7d', labelKey: 'transactions.filters.last7Days' },
  { value: '30d', labelKey: 'transactions.filters.last30Days' },
  { value: '6m', labelKey: 'transactions.filters.last6Months' },
  { value: '12m', labelKey: 'transactions.filters.last12Months' },
  { value: 'custom', labelKey: 'transactions.filters.custom' },
];

export const SORT_FIELD_OPTIONS = [
  { value: 'type', labelKey: 'transactions.sort.transactionType' },
  { value: 'description', labelKey: 'transactions.sort.transactionDescription' },
  { value: 'amount', labelKey: 'transactions.sort.transactionValue' },
  { value: 'closing_date', labelKey: 'transactions.sort.closingDate' },
  { value: 'created_at', labelKey: 'transactions.sort.lastUpdatedDate' },
  { value: 'status', labelKey: 'transactions.sort.status' },
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
