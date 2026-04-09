export const TRANSACTION_FORM_KEYS = {
  type: 'type',
  title: 'title',
  description: 'description',
  amount: 'amount',
  currency: 'currency',
  baseCurrency: 'base_currency',
  closingDate: 'closing_date',
  enforceSigningOrder: 'enforce_signing_order',
  emailSubject: 'email_subject',
  emailMessage: 'email_message',
  isCurrencyExchange: 'is_currency_exchange',
  exchangeRate: 'exchange_rate',
  platformMarkup: 'platform_markup',
};

export const COUNTERPARTY_STATIC_DEFAULTS = {
  type: 'individual',
  userId: '0',
  amount: '0',
  address: '',
  businessName: '',
};

export const SETTLEMENT_STATIC_DEFAULTS = {
  id: '0',
};
