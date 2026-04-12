export const queryKeys = {
  transactionsRoot: ['transactions'],
  transactions: (params = {}) => ['transactions', params],
  transaction: (id) => ['transaction', id],
  transactionHistory: (id) => ['transactionHistory', id],
  settlementStatement: (id) => ['settlementStatement', id],
  activityLog: ['activityLog'],
};
