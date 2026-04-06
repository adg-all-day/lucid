// Sets up react-hook-form with our Zod schema and returns everything
// the screen needs to manage the form: the form object itself plus
// field array helpers for the dynamic lists (counterparties, docs, settlements).

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newTransactionSchema } from '../schemas/transaction.schema';
import { initialCounterparty, initialSettlement, initialDocument } from '../utils/constants';

export function useNewTransactionForm() {
  // The form starts with 2 blank counterparties, 1 doc slot, and 1 settlement.
  // This matches what NewTransactionScreen was doing with useState.
  const form = useForm({
    resolver: zodResolver(newTransactionSchema),
    defaultValues: {
      transactionType: '',
      description: '',
      currency: 'USD',
      transactionValue: '',
      closingDate: null,
      insertNumbering: false,
      emailSubject: '',
      emailMessage: '',
      counterparties: [
        { ...initialCounterparty },
        { ...initialCounterparty },
      ],
      documents: [
        { ...initialDocument },
      ],
      settlements: [
        { ...initialSettlement },
      ],
    },
  });

  // Field arrays give us append/remove/move for each dynamic list.
  // Way cleaner than the manual spread-and-setState approach.
  const counterpartyFields = useFieldArray({
    control: form.control,
    name: 'counterparties',
  });

  const documentFields = useFieldArray({
    control: form.control,
    name: 'documents',
  });

  const settlementFields = useFieldArray({
    control: form.control,
    name: 'settlements',
  });

  return {
    form,
    counterpartyFields,
    documentFields,
    settlementFields,
  };
}
