// All the static data arrays and default objects for the new transaction form.
// Pulled out of NewTransactionScreen so we can reuse them across smaller components.

// What kind of deal is this
export const TRANSACTION_TYPES = [
  { label: 'Domain Name', value: 'domain_name' },
  { label: 'Jewelry', value: 'jewelry' },
  { label: 'Currency Conversion', value: 'currency_conversion' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Sale', value: 'sale' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'General Merchandise', value: 'general_merchandise' },
  { label: 'Service Contract', value: 'service_contract' },
  { label: 'Intellectual Property', value: 'intellectual_property' },
  { label: 'Business Acquisition', value: 'business_acquisition' },
];

// Supported currencies with their symbols and short badge labels
export const CURRENCIES = [
  { label: 'NGN - Nigerian Naira (₦)', value: 'NGN', symbol: '₦', badge: 'NG ₦' },
  { label: 'USD - US Dollar ($)', value: 'USD', symbol: '$', badge: 'US $' },
  { label: 'EUR - Euro (€)', value: 'EUR', symbol: '€', badge: 'EU €' },
  { label: 'GBP - British Pound (£)', value: 'GBP', symbol: '£', badge: 'GB £' },
  { label: 'JPY - Japanese Yen (¥)', value: 'JPY', symbol: '¥', badge: 'JP ¥' },
  { label: 'CNY - Chinese Yuan (¥)', value: 'CNY', symbol: '¥', badge: 'CN ¥' },
  { label: 'CAD - Canadian Dollar (C$)', value: 'CAD', symbol: 'C$', badge: 'CA $' },
  { label: 'AUD - Australian Dollar (A$)', value: 'AUD', symbol: 'A$', badge: 'AU $' },
  { label: 'CHF - Swiss Franc (CHF)', value: 'CHF', symbol: 'CHF', badge: 'CH CHF' },
  { label: 'INR - Indian Rupee (₹)', value: 'INR', symbol: '₹', badge: 'IN ₹' },
  { label: 'BRL - Brazilian Real (R$)', value: 'BRL', symbol: 'R$', badge: 'BR R$' },
  { label: 'ZAR - South African Rand (R)', value: 'ZAR', symbol: 'R', badge: 'ZA R' },
  { label: 'KES - Kenyan Shilling (KSh)', value: 'KES', symbol: 'KSh', badge: 'KE KSh' },
  { label: 'GHS - Ghanaian Cedi (₵)', value: 'GHS', symbol: '₵', badge: 'GH ₵' },
  { label: 'XOF - West African CFA (CFA)', value: 'XOF', symbol: 'CFA', badge: 'WA CFA' },
  { label: 'XAF - Central African CFA (FCFA)', value: 'XAF', symbol: 'FCFA', badge: 'CA FCFA' },
  { label: 'EGP - Egyptian Pound (E£)', value: 'EGP', symbol: 'E£', badge: 'EG £' },
  { label: 'MAD - Moroccan Dirham (MAD)', value: 'MAD', symbol: 'MAD', badge: 'MA MAD' },
  { label: 'TZS - Tanzanian Shilling (TSh)', value: 'TZS', symbol: 'TSh', badge: 'TZ TSh' },
  { label: 'UGX - Ugandan Shilling (USh)', value: 'UGX', symbol: 'USh', badge: 'UG USh' },
  { label: 'RWF - Rwandan Franc (RF)', value: 'RWF', symbol: 'RF', badge: 'RW RF' },
  { label: 'ETB - Ethiopian Birr (Br)', value: 'ETB', symbol: 'Br', badge: 'ET Br' },
  { label: 'MXN - Mexican Peso (MX$)', value: 'MXN', symbol: 'MX$', badge: 'MX $' },
  { label: 'ARS - Argentine Peso (AR$)', value: 'ARS', symbol: 'AR$', badge: 'AR $' },
  { label: 'COP - Colombian Peso (COL$)', value: 'COP', symbol: 'COL$', badge: 'CO $' },
  { label: 'PEN - Peruvian Sol (S/)', value: 'PEN', symbol: 'S/', badge: 'PE S/' },
  { label: 'CLP - Chilean Peso (CLP$)', value: 'CLP', symbol: 'CLP$', badge: 'CL $' },
  { label: 'KRW - South Korean Won (₩)', value: 'KRW', symbol: '₩', badge: 'KR ₩' },
  { label: 'SGD - Singapore Dollar (S$)', value: 'SGD', symbol: 'S$', badge: 'SG $' },
  { label: 'HKD - Hong Kong Dollar (HK$)', value: 'HKD', symbol: 'HK$', badge: 'HK $' },
  { label: 'NZD - New Zealand Dollar (NZ$)', value: 'NZD', symbol: 'NZ$', badge: 'NZ $' },
  { label: 'SEK - Swedish Krona (kr)', value: 'SEK', symbol: 'kr', badge: 'SE kr' },
  { label: 'NOK - Norwegian Krone (kr)', value: 'NOK', symbol: 'kr', badge: 'NO kr' },
  { label: 'DKK - Danish Krone (kr)', value: 'DKK', symbol: 'kr', badge: 'DK kr' },
  { label: 'PLN - Polish Zloty (zł)', value: 'PLN', symbol: 'zł', badge: 'PL zł' },
  { label: 'CZK - Czech Koruna (Kč)', value: 'CZK', symbol: 'Kč', badge: 'CZ Kč' },
  { label: 'HUF - Hungarian Forint (Ft)', value: 'HUF', symbol: 'Ft', badge: 'HU Ft' },
  { label: 'THB - Thai Baht (฿)', value: 'THB', symbol: '฿', badge: 'TH ฿' },
  { label: 'MYR - Malaysian Ringgit (RM)', value: 'MYR', symbol: 'RM', badge: 'MY RM' },
  { label: 'PHP - Philippine Peso (₱)', value: 'PHP', symbol: '₱', badge: 'PH ₱' },
  { label: 'IDR - Indonesian Rupiah (Rp)', value: 'IDR', symbol: 'Rp', badge: 'ID Rp' },
  { label: 'VND - Vietnamese Dong (₫)', value: 'VND', symbol: '₫', badge: 'VN ₫' },
  { label: 'AED - UAE Dirham (AED)', value: 'AED', symbol: 'AED', badge: 'AE AED' },
  { label: 'SAR - Saudi Riyal (SAR)', value: 'SAR', symbol: 'SAR', badge: 'SA SAR' },
  { label: 'QAR - Qatari Riyal (QAR)', value: 'QAR', symbol: 'QAR', badge: 'QA QAR' },
  { label: 'KWD - Kuwaiti Dinar (KD)', value: 'KWD', symbol: 'KD', badge: 'KW KD' },
  { label: 'BHD - Bahraini Dinar (BD)', value: 'BHD', symbol: 'BD', badge: 'BH BD' },
  { label: 'OMR - Omani Rial (OMR)', value: 'OMR', symbol: 'OMR', badge: 'OM OMR' },
  { label: 'TWD - Taiwan Dollar (NT$)', value: 'TWD', symbol: 'NT$', badge: 'TW NT$' },
  { label: 'ILS - Israeli Shekel (₪)', value: 'ILS', symbol: '₪', badge: 'IL ₪' },
  { label: 'TRY - Turkish Lira (₺)', value: 'TRY', symbol: '₺', badge: 'TR ₺' },
  { label: 'RUB - Russian Ruble (₽)', value: 'RUB', symbol: '₽', badge: 'RU ₽' },
  { label: 'UAH - Ukrainian Hryvnia (₴)', value: 'UAH', symbol: '₴', badge: 'UA ₴' },
  { label: 'PKR - Pakistani Rupee (₨)', value: 'PKR', symbol: '₨', badge: 'PK ₨' },
  { label: 'BDT - Bangladeshi Taka (৳)', value: 'BDT', symbol: '৳', badge: 'BD ৳' },
  { label: 'LKR - Sri Lankan Rupee (Rs)', value: 'LKR', symbol: 'Rs', badge: 'LK Rs' },
];

// Country phone codes for the telephone field dropdown
export const PHONE_CODES = [
  { label: '🇳🇬 Nigeria (+234)', value: '+234' },
  { label: '🇺🇸 United States (+1)', value: '+1' },
  { label: '🇬🇧 United Kingdom (+44)', value: '+44' },
  { label: '🇮🇳 India (+91)', value: '+91' },
  { label: '🇨🇳 China (+86)', value: '+86' },
  { label: '🇯🇵 Japan (+81)', value: '+81' },
  { label: '🇩🇪 Germany (+49)', value: '+49' },
  { label: '🇫🇷 France (+33)', value: '+33' },
  { label: '🇮🇹 Italy (+39)', value: '+39' },
  { label: '🇪🇸 Spain (+34)', value: '+34' },
  { label: '🇿🇦 South Africa (+27)', value: '+27' },
  { label: '🇰🇪 Kenya (+254)', value: '+254' },
  { label: '🇬🇭 Ghana (+233)', value: '+233' },
  { label: '🇨🇮 Ivory Coast (+225)', value: '+225' },
  { label: '🇪🇬 Egypt (+20)', value: '+20' },
  { label: '🇲🇦 Morocco (+212)', value: '+212' },
  { label: '🇹🇿 Tanzania (+255)', value: '+255' },
  { label: '🇺🇬 Uganda (+256)', value: '+256' },
  { label: '🇷🇼 Rwanda (+250)', value: '+250' },
  { label: '🇪🇹 Ethiopia (+251)', value: '+251' },
  { label: '🇨🇦 Canada (+1)', value: '+1' },
  { label: '🇦🇺 Australia (+61)', value: '+61' },
  { label: '🇧🇷 Brazil (+55)', value: '+55' },
  { label: '🇲🇽 Mexico (+52)', value: '+52' },
  { label: '🇦🇪 UAE (+971)', value: '+971' },
  { label: '🇸🇦 Saudi Arabia (+966)', value: '+966' },
  { label: '🇰🇷 South Korea (+82)', value: '+82' },
  { label: '🇸🇬 Singapore (+65)', value: '+65' },
  { label: '🇵🇭 Philippines (+63)', value: '+63' },
  { label: '🇮🇩 Indonesia (+62)', value: '+62' },
  { label: '🇹🇭 Thailand (+66)', value: '+66' },
  { label: '🇵🇰 Pakistan (+92)', value: '+92' },
  { label: '🇧🇩 Bangladesh (+880)', value: '+880' },
  { label: '🇹🇷 Turkey (+90)', value: '+90' },
  { label: '🇵🇱 Poland (+48)', value: '+48' },
  { label: '🇺🇦 Ukraine (+380)', value: '+380' },
];

// Counterparty roles in the transaction
export const ROLES = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Peer', value: 'peer' },
];

// Blank counterparty with all fields zeroed out. We spread this when adding new ones.
export const initialCounterparty = {
  email: '',
  phoneCode: '+234',
  phone: '',
  role: '',
  firstName: '',
  middleName: '',
  lastName: '',
  notifyEmail: true,
  notifyText: false,
  signatureRequired: false,
  collapsed: false,
  accessCode: '',
  requirePhotoId: false,
  privateMessage: '',
  permissions: {
    addCounterparty: false,
    deleteCounterparty: false,
    uploadDocuments: false,
    deleteDocuments: false,
    addSettlement: false,
    editSettlement: false,
  },
};

// Default settlement row when adding a new one
export const initialSettlement = {
  description: '',
  currency: 'USD',
  value: '',
  isFixed: true,
  dueFrom: '',
  dueTo: '',
  collapsed: false,
};

// Default document row
export const initialDocument = {
  description: '',
  file: null,
  collapsed: false,
};

// Handy helpers that a few components need

// Gets the short badge text for a currency code (e.g. "US $" for "USD")
export const getCurrencyDisplay = (currencyValue) => {
  const c = CURRENCIES.find((cur) => cur.value === currencyValue);
  return c ? c.badge : currencyValue;
};

// Turns snake_case into Title Case for display
export const formatType = (type) => {
  if (!type) return '';
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Formats a Date object as dd/mm/yyyy
export const formatDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};
