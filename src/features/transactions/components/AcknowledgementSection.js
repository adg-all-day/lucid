import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useUserStore from '../../../stores/userStore';

export default function AcknowledgementSection({
  transaction,
  counterparties,
  myRole,
  theme,
  isDark,
  submitPending = false,
  onSubmit,
  styles,
}) {
  const userName = useUserStore((state) => state.name);
  const resolvedRole = myRole?.role
    ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1)
    : 'Participant';
  const signerName = userName || 'Current User';
  const effectiveStage = String(transaction?.current_stage || transaction?.status || '').toUpperCase();
  const isDraft = effectiveStage === 'DRAFT';

  return (
    <View style={[styles.sectionContainer, { paddingTop: 28 }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>
        Acknowledgement and Acceptance
      </Text>

      <View style={[styles.acknowledgementCard, { backgroundColor: theme.primary10 }]}>
        <Text style={[styles.acknowledgementText, { color: theme.text }]}>
          By signing below, {signerName}, the {resolvedRole}, acknowledges having read, understood, and agreed to the terms outlined in the attached Transaction Documents and Settlement Statement. The undersigned confirms their acceptance of the provisions described herein as binding and enforceable.{' '}
          <Text style={styles.termsLink}>Terms and Conditions</Text>.
        </Text>

        <Text style={[styles.signerName, { color: theme.text }]}>{signerName}</Text>

        <TouchableOpacity style={styles.signatureBtn}>
          <Text style={styles.signatureBtnText}>Insert Signature</Text>
        </TouchableOpacity>

        <View style={styles.signatureLine} />

        <View style={styles.byRow}>
          <Text style={[styles.byLabel, { color: theme.text }]}>By:</Text>
          <View style={styles.byInput}>
            <Text style={[styles.byPlaceholder, { color: theme.text }]}>{signerName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.declineBtn}>
          <Text style={styles.declineBtnText}>Decline Signing</Text>
        </TouchableOpacity>
      </View>

      {isDraft ? (
        <TouchableOpacity
          style={[styles.submitBtn, submitPending && { opacity: 0.7 }]}
          onPress={onSubmit}
          disabled={submitPending}
        >
          {submitPending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Submit</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
