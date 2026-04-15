import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must contain 8 characters'),
    repeatPassword: z.string().min(1, 'Retype your password'),
  })
  .refine((values) => values.password === values.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords must match',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const passwordChangeSchema = z
  .object({
    password: z.string().min(8, 'Password must contain 8 characters'),
    repeatPassword: z.string().min(1, 'Retype your password'),
  })
  .refine((values) => values.password === values.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords must match',
  });

export const authenticatedPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must contain 8 characters'),
    repeatPassword: z.string().min(1, 'Retype your password'),
  })
  .refine((values) => values.currentPassword !== values.password, {
    path: ['password'],
    message: 'New password cannot be old password',
  })
  .refine((values) => values.password === values.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords must match',
  });

export const createAuthenticatedPasswordChangeSchema = (t) =>
  z
    .object({
      currentPassword: z.string().min(1, t('auth.changePassword.currentPasswordRequired')),
      password: z.string().min(8, t('auth.passwordRules.length')),
      repeatPassword: z.string().min(1, t('auth.changePassword.repeatPasswordRequired')),
    })
    .refine((values) => values.currentPassword !== values.password, {
      path: ['password'],
      message: t('auth.changePassword.newPasswordCannotBeOld'),
    })
    .refine((values) => values.password === values.repeatPassword, {
      path: ['repeatPassword'],
      message: t('auth.changePassword.passwordsMustMatch'),
    });

export const twoFactorMethodSchema = z.object({
  method: z.enum(['authenticator', 'sms', 'email', 'recovery_code']),
});

export const twoFactorCodeSchema = z.object({
  code: z.string().min(1, 'Enter your verification code'),
});

export const recoveryCodeSchema = z.object({
  code: z.string().min(1, 'Enter your recovery code'),
});

export const passwordChecks = [
  {
    key: 'length',
    label: 'Password must contain 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    key: 'upper',
    label: 'Password must contain an upper case letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lower',
    label: 'Password must contain a lower case letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'number',
    label: 'Password must contain a symbol',
    test: (value) => /[0-9]/.test(value),
  },
  {
    key: 'special',
    label: 'Password must contain a special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];
