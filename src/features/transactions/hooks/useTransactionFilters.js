// Custom hook that handles filtering the transaction list by tab and search text.
// Keeps the filtering logic out of the screen component so it's easier to
// test and reason about.

import { useMemo } from 'react';
import { STATUS_MAP } from '../utils/constants';

/**
 * Filters transactions based on the active tab and search text.
 *
 * @param {Array} transactions - the full list of transactions from the API
 * @param {string} activeTab - which tab is selected (e.g. 'Staging', 'Closed')
 * @param {string} searchText - what the user typed in the search bar
 * @returns {Array} the filtered list, ready to render
 */
export default function useTransactionFilters(transactions, activeTab, searchText) {
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // First check: does this transaction belong under the selected tab?
      const statusFilter = STATUS_MAP[activeTab];
      if (statusFilter && !statusFilter.includes(t.status)) return false;

      // Second check: does it match what the user searched for?
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          (t.description || '').toLowerCase().includes(search) ||
          (t.type || '').toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [transactions, activeTab, searchText]);

  return filtered;
}
