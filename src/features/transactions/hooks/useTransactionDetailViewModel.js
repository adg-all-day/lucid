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
import { formatStepperDate } from '../utils/formatters';
import { STAGE_LABELS } from '../utils/constants';

const STEP_ICONS = [
  StepAgreementIcon,
  StepEscrowIcon,
  StepDeliveryIcon,
  StepAcceptanceIcon,
  StepDisbursementIcon,
];

const STAGE_NAME_TO_INDEX = {
  Agreement: 0,
  Escrow: 1,
  Delivery: 2,
  Fulfilment: 2,
  Acceptance: 3,
  Disbursement: 4,
};

function resolveDisplayStage(transaction) {
  if (transaction?.stage) {
    return transaction.stage;
  }

  const currentStage = transaction?.current_stage || transaction?.status;

  switch (currentStage) {
    case 'DRAFT':
    case 'STAGING':
    case 'AWAITING_SIGNATURES':
      return 'Agreement';
    case 'AWAITING_FUNDS':
      return 'Escrow';
    case 'AWAITING_FULFILMENT':
      return 'Delivery';
    case 'AWAITING_ACCEPTANCE':
      return 'Acceptance';
    case 'AWAITING_DISBURSEMENT':
      return 'Acceptance';
    case 'COMPLETED':
    case 'CLOSED':
      return 'Disbursement';
    case 'VOIDED':
      return 'Voided';
    default:
      return null;
  }
}

function findTimelineEntry(stageTimeline, stageName) {
  return (stageTimeline || []).find((entry) => entry.stage === stageName);
}

function getStepCompletionDates(transaction) {
  const stageTimeline = transaction?.stage_timeline || [];

  const agreementCompletedAt =
    findTimelineEntry(stageTimeline, 'AWAITING_SIGNATURES')?.exited_at ||
    findTimelineEntry(stageTimeline, 'AWAITING_FUNDS')?.entered_at;

  const escrowCompletedAt =
    findTimelineEntry(stageTimeline, 'AWAITING_FUNDS')?.exited_at ||
    findTimelineEntry(stageTimeline, 'AWAITING_FULFILMENT')?.entered_at ||
    findTimelineEntry(stageTimeline, 'AWAITING_ACCEPTANCE')?.entered_at;

  const deliveryCompletedAt =
    findTimelineEntry(stageTimeline, 'AWAITING_FULFILMENT')?.exited_at ||
    findTimelineEntry(stageTimeline, 'AWAITING_ACCEPTANCE')?.entered_at;

  const acceptanceCompletedAt =
    findTimelineEntry(stageTimeline, 'AWAITING_ACCEPTANCE')?.exited_at ||
    findTimelineEntry(stageTimeline, 'AWAITING_DISBURSEMENT')?.entered_at;

  const disbursementCompletedAt =
    findTimelineEntry(stageTimeline, 'AWAITING_DISBURSEMENT')?.exited_at ||
    findTimelineEntry(stageTimeline, 'COMPLETED')?.entered_at ||
    findTimelineEntry(stageTimeline, 'CLOSED')?.entered_at;

  return {
    Agreement: agreementCompletedAt ? formatStepperDate(agreementCompletedAt) : null,
    Escrow: escrowCompletedAt ? formatStepperDate(escrowCompletedAt) : null,
    Delivery: deliveryCompletedAt ? formatStepperDate(deliveryCompletedAt) : null,
    Acceptance: acceptanceCompletedAt ? formatStepperDate(acceptanceCompletedAt) : null,
    Disbursement: disbursementCompletedAt ? formatStepperDate(disbursementCompletedAt) : null,
  };
}

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
    const displayStage = resolveDisplayStage(transaction);
    const isVoided = displayStage === 'Voided';
    const activeIndex = isVoided ? -1 : (STAGE_NAME_TO_INDEX[displayStage] ?? -1);
    const completedThrough = activeIndex > 0 ? activeIndex - 1 : -1;
    const completionDates = getStepCompletionDates(transaction);

    return STAGE_LABELS.map((label, index) => ({
      label,
      completed: index <= completedThrough,
      active: index === activeIndex,
      date: index <= completedThrough ? completionDates[label] : null,
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
