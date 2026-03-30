// mock data for the home screen... most of this is placeholder stuff
// suggezt: replace the hardcoded name with data from /profile endpoint
export const userData = {
  name: 'Chibuikem',
  avatar: null,
};

export const statsData = [
  { id: '1', icon: 'transfer', library: 'custom', label: 'All\nTransactions', countKey: 'all' },
  { id: '2', icon: 'user-time', library: 'custom', label: 'Action\nRequired', countKey: 'actionRequired' },
  { id: '3', icon: 'unlock', library: 'custom', label: 'Open\nTransactions', countKey: 'open' },
  { id: '4', icon: 'lock', library: 'custom', label: 'Closed\nTransactions', countKey: 'closed' },
];

export const transactions = [
  {
    id: '1',
    type: 'Real Estate',
    description: 'Purchase of Property at Lekki',
    amount: 88888888.0,
    role: 'Buyer',
    participants: 'John Wayne Doe + 2 more',
    closingDate: 'Jul 12, 2012 08:00 AM',
    daysLeft: 4,
    status: 'Pending',
    date: 'Fri. Jul 12, 2012',
    time: '8:00 AM',
    transactionId: '1771919259e7bea3a8',
    transactionValue: 88888888.0,
    closingDateFull: '25 February 2026 (1:00AM)',
    statusSteps: [
      { label: 'Agreement', date: 'Jun. 23, 2024\n8:00AM', completed: true },
      { label: 'Escrow', date: 'Jun. 23, 2024\n8:00AM', completed: true },
      { label: 'Delivery', date: '', completed: false, active: true },
      { label: 'Acceptance', date: '', completed: false },
      { label: 'Disbursement', date: '', completed: false },
    ],
    counterparties: [
      {
        name: 'Chibuikem Okonkwo',
        role: 'Buyer',
        email: 'chibuikemokonkwo@wizerco...',
        actionRequired: true,
      },
      {
        name: 'Lovelace Filson',
        role: 'Seller',
        email: 'lovelace.filson2@teml.net',
        actionRequired: false,
      },
    ],
    documents: [
      { id: '1', name: 'Purchase Agreement' },
      { id: '2', name: 'Non-Disclosure Agreement' },
    ],
    payment: {
      amount: 5616000.0,
      label: 'Balance Due from [Buyer]:',
    },
  },
  {
    id: '2',
    type: 'Real Estate',
    description: 'Purchase of Property at Lekki',
    amount: 88888888.0,
    role: 'Buyer',
    participants: 'John Wayne Doe + 2 more',
    closingDate: 'Jul 12, 2012 08:00 AM',
    daysLeft: 4,
    status: 'Pending',
    date: 'Fri. Jul 12, 2012',
    time: '8:00 AM',
  },
  {
    id: '3',
    type: 'Real Estate',
    description: 'Purchase of Property at Lekki',
    amount: 88888888.0,
    role: 'Buyer',
    participants: 'John Wayne Doe + 2 more',
    closingDate: 'Jul 12, 2012 08:00 AM',
    daysLeft: 4,
    status: 'Pending',
    date: 'Fri. Jul 12, 2012',
    time: '8:00 AM',
  },
];

export const activityLog = [
  {
    id: '1',
    date: 'Jul 12, 2012 01:20PM',
    activity: 'Successful Transfer',
    device: 'Windows',
    browser: 'Microsoft Edge',
    ip: '102.88.115.21',
    expanded: true,
  },
  {
    id: '2',
    date: 'Jul 12, 2012 01:20PM',
    activity: 'Successful Transfer',
    expanded: false,
  },
  {
    id: '3',
    date: 'Jul 12, 2012 01:20PM',
    activity: 'Successful Transfer',
    expanded: false,
  },
  {
    id: '4',
    date: 'Jul 12, 2012 01:20PM',
    activity: 'Successful Transfer',
    expanded: false,
  },
  {
    id: '5',
    date: 'Jul 12, 2012 01:20PM',
    activity: 'Successful Transfer',
    expanded: false,
  },
];
