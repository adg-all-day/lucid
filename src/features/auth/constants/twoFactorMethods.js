export const FALLBACK_TWO_FACTOR_OPTIONS = [
  {
    value: 'authenticator',
    title: 'Authenticator App',
    description: 'Get one-time codes from your authorised authenticator app',
  },
  {
    value: 'sms',
    title: 'SMS or WhatsApp',
    description: "We'll send a code to the number registered to your account",
  },
  {
    value: 'email',
    title: 'Email Address',
    description: "We'll send a code to email address registered to your account",
  },
];

export const TWO_FACTOR_METHOD_LABELS = {
  authenticator: {
    title: 'Authenticator App',
    description: 'Get one-time codes from your authorised authenticator app',
  },
  sms: {
    title: 'SMS or WhatsApp',
    description: "We'll send a code to the number registered to your account",
  },
  email: {
    title: 'Email Address',
    description: "We'll send a code to email address registered to your account",
  },
  recovery_code: {
    title: 'Recovery Code',
    description: 'Use one of the recovery codes saved on your device',
  },
};

export function mapTwoFactorMethods(apiMethods) {
  if (Array.isArray(apiMethods) && apiMethods.length > 0) {
    return apiMethods.map((method) => ({
      value: method,
      title: TWO_FACTOR_METHOD_LABELS[method]?.title || method,
      description: TWO_FACTOR_METHOD_LABELS[method]?.description || '',
    }));
  }

  return FALLBACK_TWO_FACTOR_OPTIONS;
}
