import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../../api/client';
import { extractCollection, extractPayload } from '../../../api/utils/responseParsers';
import { queryKeys } from '../../../constants/queryKeys';
import useUserStore from '../../../stores/userStore';
import {
  StepAcceptanceIcon,
  StepAgreementIcon,
  StepDeliveryIcon,
  StepDisbursementIcon,
  StepEscrowIcon,
} from '../../../icons';
import { STAGE_LABELS } from '../utils/constants';

const STEP_ICONS = [
  StepAgreementIcon,
  StepEscrowIcon,
  StepDeliveryIcon,
  StepAcceptanceIcon,
  StepDisbursementIcon,
];

const STAGE_TO_CHEVRON = {
  DRAFT: 0,
  STAGING: 0,
  AWAITING_SIGNATURES: 0,
  AWAITING_FUNDS: 1,
  AWAITING_DISBURSEMENT: 2,
  COMPLETED: 4,
};

export default function useTransactionDetailViewModel(id) {
  const userEmail = useUserStore((state) => state.email);
  const transactionQuery = useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: async () => {
      const res = await client.get(`/transactions/${id}`);
      return extractPayload(res);
    },
    enabled: !!id,
  });
  const statementQuery = useQuery({
    queryKey: queryKeys.settlementStatement(id),
    queryFn: async () => {
      const res = await client.get(`/transactions/${id}/settlement`);
      return extractPayload(res);
    },
    enabled: !!id,
  });
  const historyQuery = useQuery({
    queryKey: queryKeys.transactionHistory(id),
    queryFn: async () => {
      const res = await client.get(`/transactions/${id}/history`);
      return extractCollection(res);
    },
    enabled: !!id,
  });
  const transaction = transactionQuery.data;

  const stepData = useMemo(() => {
    const stage = transaction?.current_stage || transaction?.status;
    const currentStageIndex = STAGE_TO_CHEVRON[stage] ?? -1;

    return STAGE_LABELS.map((label, index) => ({
      label,
      completed: index < currentStageIndex,
      active: index === currentStageIndex,
      renderIcon: (color) => {
        const Icon = STEP_ICONS[index];
        const iconSize = index === 0 ? 18 : index === STEP_ICONS.length - 1 ? 32 : 20;
        return <Icon size={iconSize} color={color} />;
      },
    }));
  }, [transaction]);

  const counterparties = transaction?.counterparties || [];
  const documents = transaction?.documents || [];
  const settlements = transaction?.settlements || [];

  const totalDue = useMemo(
    () =>
      settlements.reduce((sum, settlement) => {
        if (settlement.amount_type === 'percentage') {
          return sum + ((settlement.value || 0) / 100) * (transaction?.amount || 0);
        }

        return sum + (settlement.actual_amount || settlement.value || 0);
      }, 0),
    [settlements, transaction?.amount],
  );

  const myRole = useMemo(
    () =>
      counterparties.find(
        (item) => item.email?.toLowerCase() === userEmail?.toLowerCase(),
      ),
    [counterparties, userEmail],
  );

  const emailToName = useMemo(() => {
    const names = {};
    counterparties.forEach((counterparty) => {
      if (counterparty.email) {
        names[counterparty.email.toLowerCase()] = `${counterparty.first_name || ''} ${counterparty.last_name || ''}`.trim();
      }
    });
    return names;
  }, [counterparties]);

  return {
    transactionQuery,
    statementQuery,
    historyQuery,
    transaction,
    counterparties,
    documents,
    settlements,
    totalDue,
    myRole,
    emailToName,
    stepData,
  };
}
