import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { FormProvider } from 'react-hook-form';
import { useRouter } from 'expo-router';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import CloseIcon from '../../../icons/CloseIcon';
import { useCreateTransaction } from '../../../api/queries/transactions';
import useUserStore from '../../../stores/userStore';
import TransactionBasicFields from '../components/TransactionBasicFields';
import CounterpartyCard from '../components/CounterpartyCard';
import DocumentCard from '../components/DocumentCard';
import SettlementCard from '../components/SettlementCard';
import EmailMessageSection from '../components/EmailMessageSection';
import FormActions from '../components/FormActions';
import { useNewTransactionForm } from '../hooks/useNewTransactionForm';
import { useDocumentPicker } from '../hooks/useDocumentPicker';
import {
  initialCounterparty,
  initialDocument,
  initialSettlement,
} from '../utils/constants';
import { buildTransactionFormData } from '../utils/formDataBuilder';

function collectErrorMessages(value, path = '', messages = []) {
  if (!value || typeof value !== 'object') {
    return messages;
  }

  if (value.message) {
    messages.push(path ? `${path}: ${value.message}` : value.message);
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key === 'message' || key === 'type' || key === 'ref') {
      return;
    }

    const nextPath = path
      ? `${path}.${key}`.replace(/\.(\d+)\./g, ' $1 ').trim()
      : key;
    collectErrorMessages(child, nextPath, messages);
  });

  return messages;
}

export default function NewTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const userEmail = useUserStore((state) => state.email);
  const { form, counterpartyFields, documentFields, settlementFields } =
    useNewTransactionForm();
  const createTransaction = useCreateTransaction();
  const saveDraftMutation = useCreateTransaction();
  const { pickDocument } = useDocumentPicker();

  const counterparties = form.watch('counterparties');

  const counterpartyOptions = counterparties
    .filter((item) => item.email || item.firstName || item.lastName)
    .map((item) => ({
      label:
        [item.firstName, item.middleName, item.lastName]
          .filter(Boolean)
          .join(' ') || item.email,
      value: item.email,
    }));

  const handleInvalid = (errors) => {
    const messages = collectErrorMessages(errors).slice(0, 6);
    Alert.alert(
      'Validation Error',
      messages.length > 0 ? messages.join('\n') : 'Please check the form fields.',
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildTransactionFormData(values);
      const result = await createTransaction.mutateAsync({
        formData: payload,
        draft: false,
      });

      if (result?.error || result?.status === 'error' || result?.statusCode >= 400) {
        Alert.alert(
          'Error',
          result?.message || result?.error || 'Failed to create transaction.',
        );
        return;
      }

      Alert.alert('Success', 'Transaction created successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create transaction.',
      );
    }
  }, handleInvalid);

  const handleSaveDraft = form.handleSubmit(async (values) => {
    try {
      const payload = buildTransactionFormData({
        ...values,
        emailSubject: values.emailSubject || `Draft for ${userEmail || 'transaction'}`,
      });
      const result = await saveDraftMutation.mutateAsync({
        formData: payload,
        draft: true,
      });

      if (result?.error || result?.status === 'error' || result?.statusCode >= 400) {
        Alert.alert(
          'Error',
          result?.message || result?.error || 'Failed to save draft.',
        );
        return;
      }

      Alert.alert('Draft Saved', 'Transaction draft saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to save draft.',
      );
    }
  }, handleInvalid);

  const handlePickDocument = async (index) => {
    const file = await pickDocument();
    if (file) {
      form.setValue(`documents.${index}.file`, file, {
        shouldDirty: true,
      });
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={[styles.sheet, { backgroundColor: theme.modalBg }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <CloseIcon size={20} />
        </TouchableOpacity>

        <FormProvider {...form}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>New Transaction</Text>

            <TransactionBasicFields />

            <View style={styles.inlineToggle}>
              <Text style={[styles.inlineToggleLabel, { color: theme.text }]}>Insert Signing Order</Text>
              <TouchableOpacity
                style={[
                  styles.inlineToggleTrack,
                  form.watch('insertNumbering') && styles.inlineToggleTrackActive,
                ]}
                onPress={() =>
                  form.setValue('insertNumbering', !form.watch('insertNumbering'))
                }
              >
                <View
                  style={[
                    styles.inlineToggleThumb,
                    form.watch('insertNumbering') && styles.inlineToggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Counterparties</Text>
            {counterpartyFields.fields.map((field, index) => (
              <CounterpartyCard
                key={field.id}
                index={index}
                onRemove={() => {
                  if (counterpartyFields.fields.length <= 2) {
                    Alert.alert(
                      'Cannot Remove',
                      'At least two counterparties are required.',
                    );
                    return;
                  }
                  counterpartyFields.remove(index);
                }}
                onToggleCollapse={() => {
                  const current = form.getValues(`counterparties.${index}.collapsed`);
                  form.setValue(`counterparties.${index}.collapsed`, !current);
                }}
              />
            ))}
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.inputBg }]}
              onPress={() => counterpartyFields.append({ ...initialCounterparty })}
            >
              <Text style={styles.secondaryButtonText}>Add Counterparty</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Documents</Text>
            {documentFields.fields.map((field, index) => (
              <DocumentCard
                key={field.id}
                index={index}
                onRemove={() => documentFields.remove(index)}
                onPickDocument={handlePickDocument}
              />
            ))}
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.inputBg }]}
              onPress={() => documentFields.append({ ...initialDocument })}
            >
              <Text style={styles.secondaryButtonText}>Add Document</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Settlements</Text>
            {settlementFields.fields.map((field, index) => (
              <SettlementCard
                key={field.id}
                index={index}
                onRemove={() => {
                  if (settlementFields.fields.length <= 1) {
                    Alert.alert(
                      'Cannot Remove',
                      'At least one settlement is required.',
                    );
                    return;
                  }
                  settlementFields.remove(index);
                }}
                counterpartyNames={counterpartyOptions}
              />
            ))}
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.inputBg }]}
              onPress={() => settlementFields.append({ ...initialSettlement })}
            >
              <Text style={styles.secondaryButtonText}>Add Settlement</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Email Message</Text>
            <EmailMessageSection />

            <FormActions
              onDraft={handleSaveDraft}
              onSubmit={onSubmit}
              savingDraft={saveDraftMutation.isPending}
              submitting={createTransaction.isPending}
            />
          </ScrollView>
        </FormProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 3, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '93%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  inlineToggle: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineToggleLabel: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  inlineToggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  inlineToggleTrackActive: {
    backgroundColor: Colors.primaryLight,
  },
  inlineToggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
  },
  inlineToggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 22,
    marginBottom: 10,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});
