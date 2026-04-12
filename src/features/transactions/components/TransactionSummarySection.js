import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import {
  AvatarIcon,
  CalendarIcon,
  EyeCrossedIcon,
  EyeOpenIcon,
  OrderIdIcon,
  VerticalDotsIcon,
} from '../../../icons';
import { formatAmount, formatDate, formatType } from '../utils/formatters';

export default function TransactionSummarySection({
  transaction,
  amountHidden,
  setAmountHidden,
  myRole,
  theme,
  isDark,
  onOpenActions,
  styles,
}) {
  return (
    <>
      <Text style={[styles.breadcrumb, { color: isDark ? theme.text : Colors.primary }]}>
        {formatType(transaction.type)}
      </Text>

      <View style={styles.summaryTopRow}>
        <View style={styles.idRow}>
          <OrderIdIcon size={16} color={isDark ? theme.icon : Colors.primary} />
          <Text style={[styles.transactionId, { color: isDark ? theme.text : Colors.primary }]}>
            {transaction.reference}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionsBtn,
            {
              backgroundColor: isDark ? theme.actionButtonBg : theme.cardBg,
              borderColor: isDark ? theme.actionButtonBg : Colors.border,
            },
          ]}
          onPress={onOpenActions}
        >
          <Text style={[styles.actionsBtnText, { color: isDark ? theme.actionButtonText : Colors.primary }]}>
            Actions
          </Text>
          <VerticalDotsIcon color={isDark ? theme.icon : Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: isDark ? '#5B5FC780' : '#5B5FC7' }]}>
        <View style={styles.amountRow}>
          <Text style={[styles.amountText, { color: Colors.white }]}>
            {amountHidden ? '••••••••' : formatAmount(transaction.amount, transaction.currency, transaction)}
          </Text>
          <TouchableOpacity onPress={() => setAmountHidden((value) => !value)} style={{ marginLeft: 10 }}>
            {amountHidden ? (
              <EyeCrossedIcon size={18} color={Colors.white} />
            ) : (
              <EyeOpenIcon size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.valueLabel, { color: Colors.white }]}>
          Transaction Value
        </Text>

        <Text
          style={[styles.descriptionText, { color: Colors.white }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {transaction.description}
        </Text>

        <View style={styles.closingRow}>
          <View style={styles.closingLeft}>
            <View style={{ marginTop: -4 }}>
              <CalendarIcon size={20} color={Colors.white} />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.closingDateValue, { color: Colors.white }]}>
                {formatDate(transaction.closing_date)}
              </Text>
              <Text style={[styles.closingDateLabel, { color: Colors.white }]}>
                Closing Date
              </Text>
            </View>
          </View>
          <View style={styles.roleRow}>
            <AvatarIcon size={20} color={Colors.white} />
            <View style={styles.roleSection}>
              <Text style={[styles.roleValue, { color: Colors.white }]}>
                {myRole?.role ? myRole.role.charAt(0).toUpperCase() + myRole.role.slice(1) : 'Participant'}
              </Text>
              <Text style={[styles.roleLabel, { color: Colors.white }]}>
                Role
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
