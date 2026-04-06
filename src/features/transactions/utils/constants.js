// Transaction-related constants pulled out of the screen files.
// Keeps the screens cleaner and makes it easy to tweak labels/statuses
// without hunting through JSX.

// -- Home Screen tab filtering --

// The tabs shown at the top of the transaction list
export const TABS = [
  'All Transactions',
  'Staging',
  'Signed',
  'Disbursed',
  'Closed',
];

// Which API statuses belong under each tab. null means "show everything".
export const STATUS_MAP = {
  'All Transactions': null,
  'Staging': ['STAGING', 'DRAFT'],
  'Signed': ['AWAITING_FUNDS', 'AWAITING_SIGNATURES'],
  'Disbursed': ['AWAITING_DISBURSEMENT'],
  'Closed': ['VOIDED', 'COMPLETED', 'CLOSED'],
};

// Handy groupings for the stats cards
export const OPEN_STATUSES = [
  'STAGING',
  'DRAFT',
  'AWAITING_FUNDS',
  'AWAITING_SIGNATURES',
  'AWAITING_DISBURSEMENT',
];

export const CLOSED_STATUSES = ['VOIDED', 'COMPLETED', 'CLOSED'];

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
