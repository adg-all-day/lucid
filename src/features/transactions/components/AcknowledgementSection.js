import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

export default function AcknowledgementSection({
  counterparties,
  myRole,
  theme,
  isDark,
  styles,
}) {
  return (
    <View style={[styles.sectionContainer, { paddingTop: 28 }]}>
      <Text style={[styles.sectionTitle, { color: isDark ? theme.text : Colors.primary }]}>
        Acknowledgement and Acceptance
      </Text>

      <View style={[styles.acknowledgementCard, { backgroundColor: theme.primary10 }]}>
        <Text style={[styles.acknowledgementText, { color: theme.text }]}>
          By signing below, [{counterparties[0]?.first_name || 'Buyer'}&apos;s Name], the [{myRole?.role ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1) : 'Role'}], acknowledges having read, understood, and agreed to the terms outlined in the attached Transaction Documents and Settlement Statement. The undersigned confirms their acceptance of the provisions described herein as binding and enforceable.{' '}
          <Text style={styles.termsLink}>Terms and Conditions</Text>.
        </Text>

        {counterparties.length > 0 ? (
          <Text style={[styles.signerName, { color: theme.text }]}>
            {counterparties[0].first_name} {counterparties[0].last_name}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.signatureBtn}>
          <Text style={styles.signatureBtnText}>Insert Signature</Text>
        </TouchableOpacity>

        <View style={styles.signatureLine} />

        <View style={styles.byRow}>
          <Text style={[styles.byLabel, { color: theme.text }]}>By:</Text>
          <View style={styles.byInput}>
            <Text style={[styles.byPlaceholder, { color: theme.text }]}>Buyers&apos; Name Placeholder</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.declineBtn}>
          <Text style={styles.declineBtnText}>Decline Signing</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
