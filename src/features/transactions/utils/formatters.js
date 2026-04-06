// Shared formatting helpers for transactions.
// These were originally scattered across HomeScreen and TransactionDetailScreen,
// so we pulled them into one place to keep things consistent.

import Colors from '../../../constants/colors';

// All the currency symbols we currently support. If we add more currencies
// later, just drop them in here and every screen picks them up automatically.
const CURRENCY_SYMBOLS = {
  USD: '$',
  NGN: '₦',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  INR: '₹',
  KES: 'KSh',
  GHS: '₵',
  ZAR: 'R',
  CNY: '¥',
};

/**
 * Turns an API type like 'sale_of_goods' into 'Sale Of Goods'.
 * Used in both the transaction list and the detail breadcrumb.
 */
export const formatType = (type) => {
  if (!type) return '';
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Formats a monetary amount with the right currency symbol.
 *
 * The "full" version: if the amount is falsy (like 0 or null) and the
 * transaction has settlements, we aggregate those instead. This handles
 * currency exchange transactions where the headline amount is 0 but the
 * settlement breakdowns have the real numbers.
 *
 * Pass `transaction` as null/undefined for the simple case (e.g. list view).
 */
export const formatAmount = (amount, currency, transaction = null) => {
  // Figure out which currency to use. The detail screen sometimes falls back
  // to quote or base currency when the main currency field is empty.
  const effectiveCurrency =
    currency ||
    transaction?.quote_currency ||
    transaction?.base_currency ||
    'USD';

  const sym = CURRENCY_SYMBOLS[effectiveCurrency] || (effectiveCurrency + ' ');

  // If the amount is empty/zero and we have settlement data, sum those up
  let effectiveAmount = amount;
  if (!effectiveAmount && transaction?.settlements?.length) {
    effectiveAmount = transaction.settlements.reduce((sum, s) => {
      if (s.amount_type === 'percentage') {
        // Percentage settlements store the %, not the dollar value
        return sum + ((s.value || 0) / 100) * (transaction.amount || 0);
      }
      return sum + (s.actual_amount || s.value || 0);
    }, 0);
  }

  return `${sym}${(effectiveAmount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  })}`;
};

/**
 * Long date format used on the transaction detail screen.
 * Example: "12 January 2026 (1:00PM)"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const h = d.getHours();
  const m = d.getMinutes();
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} (${
    h % 12 || 12
  }:${m.toString().padStart(2, '0')}${h >= 12 ? 'PM' : 'AM'})`;
};

/**
 * Short date for the transaction list cards.
 * Example: "Fri. Jan 12, 2026"
 */
export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[d.getDay()]}. ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/**
 * Closing date format with time, shown next to the calendar icon.
 * Example: "Jan 12, 2026 8:00 AM"
 */
export const formatClosingDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${
    h % 12 || 12
  }:${m.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Just the time portion, for the right side of transaction cards.
 * Example: "8:00 AM"
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Converts API status codes into something readable.
 * AWAITING_DISBURSEMENT -> "Awaiting Disbursement", etc.
 */
export const getStatusLabel = (status) => {
  const map = {
    STAGING: 'Staging',
    DRAFT: 'Draft',
    AWAITING_SIGNATURES: 'Awaiting Signatures',
    AWAITING_FUNDS: 'Awaiting Funds',
    AWAITING_DISBURSEMENT: 'Awaiting Disbursement',
    VOIDED: 'Voided',
    COMPLETED: 'Completed',
    CLOSED: 'Closed',
  };
  return map[status] || status;
};

/**
 * Pick the right color for a transaction status badge.
 * Red for voided, green for done, orange/pending for everything else.
 */
export const getStatusColor = (status) => {
  if (status === 'VOIDED') return Colors.error;
  if (status === 'COMPLETED' || status === 'CLOSED') return Colors.success;
  return Colors.pending;
};

/**
 * How many days until the closing date? Negative means overdue.
 * Returns null if there's no closing date set.
 */
export const getDaysLeft = (closingDate) => {
  if (!closingDate) return null;
  const now = new Date();
  const close = new Date(closingDate);
  const diff = Math.ceil((close - now) / (1000 * 60 * 60 * 24));
  return diff;
};

/**
 * Turns API action codes like 'review_settlement' into readable labels.
 * e.g. 'review_settlement' -> 'Review Settlement'
 */
export const formatActionLabel = (action) => {
  if (!action) return '';
  return action
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};
