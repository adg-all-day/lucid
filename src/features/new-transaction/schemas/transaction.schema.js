// Zod schemas for the new transaction form.
// These mirror the shape of the form state from NewTransactionScreen
// so react-hook-form can validate everything in one shot.

import { z } from 'zod';

// Each counterparty has a ton of fields -- email/role/name are required,
// everything else is optional or has sensible defaults.
export const counterpartySchema = z.object({
  email: z.string().min(1, 'Email is required').email('Valid email required'),
  phoneCode: z.string().default('+234'),
  phone: z.string().optional().default(''),
  role: z.string().min(1, 'Role is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().default(''),
  lastName: z.string().min(1, 'Last name is required'),
  notifyEmail: z.boolean().default(true),
  notifyText: z.boolean().default(false),
  signatureRequired: z.boolean().default(false),
  signatureUri: z.string().nullable().optional(),
  collapsed: z.boolean().default(false),
  accessCode: z.string().optional().default(''),
  requirePhotoId: z.boolean().default(false),
  privateMessage: z.string().max(1000).optional().default(''),
  permissions: z.object({
    addCounterparty: z.boolean().default(false),
    deleteCounterparty: z.boolean().default(false),
    uploadDocuments: z.boolean().default(false),
    deleteDocuments: z.boolean().default(false),
    addSettlement: z.boolean().default(false),
    editSettlement: z.boolean().default(false),
  }).default({}),
});

// Settlement amounts -- can be fixed or percentage.
// due_from and due_to are counterparty emails (not names!).
export const settlementSchema = z.object({
  description: z.string().optional().default(''),
  currency: z.string().default('USD'),
  value: z.string().min(1, 'Value is required'),
  isFixed: z.boolean().default(true),
  dueFrom: z.string().min(1, 'Due from is required'),
  dueTo: z.string().min(1, 'Due to is required'),
  collapsed: z.boolean().default(false),
});

// Pretty simple -- just a description and an optional file attachment
export const documentSchema = z.object({
  description: z.string().optional().default(''),
  file: z.any().nullable().optional(),
  collapsed: z.boolean().default(false),
});

// The top-level form schema that ties everything together.
// At least 2 counterparties and 1 settlement are required by the backend.
export const newTransactionSchema = z.object({
  transactionType: z.string().min(1, 'Transaction type is required'),
  description: z.string().min(1, 'Description is required'),
  currency: z.string().default('USD'),
  transactionValue: z.string().min(1, 'Transaction value is required'),
  closingDate: z
    .date()
    .nullable()
    .refine((value) => value instanceof Date, 'Closing date is required'),
  insertNumbering: z.boolean().default(false),
  emailSubject: z.string().optional().default(''),
  emailMessage: z.string().optional().default(''),
  counterparties: z.array(counterpartySchema).min(2, 'At least 2 counterparties required'),
  documents: z.array(documentSchema),
  settlements: z.array(settlementSchema).min(1, 'At least 1 settlement required'),
});
