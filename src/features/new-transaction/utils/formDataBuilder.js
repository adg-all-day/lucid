// Builds the multipart FormData object that gets sent to the backend.
// The Go gin server expects dot notation like counterparties[0].email,
// not nested JSON -- so we have to manually append every single field.

import {
  COUNTERPARTY_STATIC_DEFAULTS,
  SETTLEMENT_STATIC_DEFAULTS,
  TRANSACTION_FORM_KEYS,
} from '../constants/formDataKeys';

const transactionField = (key) => TRANSACTION_FORM_KEYS[key];
const counterpartyField = (index, key) => `counterparties[${index}].${key}`;
const counterpartyPermissionField = (counterpartyIndex, permissionIndex, key) =>
  `counterparties[${counterpartyIndex}].permissions[${permissionIndex}].${key}`;
const settlementField = (index, key) => `settlements[${index}].${key}`;
const documentField = (index, key) => `documents[${index}].${key}`;

/**
 * Takes the validated form values and returns a FormData ready for the API.
 * This is a straight extraction from the original handleSubmit in NewTransactionScreen.
 *
 * Important: settlement due_from and due_to must be counterparty EMAILS, not names.
 * The backend returns a 500 if you send display names instead. The picker should
 * already be using email as the value, but just heads up if you're debugging.
 */
export function buildTransactionFormData(values) {
  const formData = new FormData();

  // Top-level transaction fields
  formData.append(transactionField('type'), values.transactionType);
  formData.append(transactionField('title'), '');
  formData.append(transactionField('description'), values.description);
  formData.append(transactionField('amount'), values.transactionValue || '0');
  formData.append(transactionField('currency'), values.currency);
  formData.append(transactionField('baseCurrency'), values.currency);

  // Closing date as ISO string, trimming the milliseconds like the original does
  const closingDateStr = values.closingDate
    ? values.closingDate.toISOString().replace('.000Z', 'Z')
    : new Date().toISOString().replace('.000Z', 'Z');
  formData.append(transactionField('closingDate'), closingDateStr);

  formData.append(transactionField('enforceSigningOrder'), values.insertNumbering ? 'true' : 'false');
  formData.append(transactionField('emailSubject'), values.emailSubject || '');
  formData.append(transactionField('emailMessage'), values.emailMessage || '');

  // These are hardcoded for now -- currency exchange isn't wired up yet
  formData.append(transactionField('isCurrencyExchange'), 'false');
  formData.append(transactionField('exchangeRate'), '0');
  formData.append(transactionField('platformMarkup'), '0');

  // Counterparties -- each field uses gin dot notation
  (values.counterparties || []).forEach((cp, i) => {
    formData.append(counterpartyField(i, 'email'), cp.email);
    formData.append(counterpartyField(i, 'first_name'), cp.firstName);
    formData.append(counterpartyField(i, 'middle_name'), cp.middleName || '');
    formData.append(counterpartyField(i, 'last_name'), cp.lastName);
    formData.append(counterpartyField(i, 'role'), cp.role);
    formData.append(counterpartyField(i, 'phone'), cp.phone ? `${cp.phoneCode}${cp.phone}` : '');
    formData.append(counterpartyField(i, 'notify_by_email'), cp.notifyEmail ? 'true' : 'false');
    formData.append(counterpartyField(i, 'notify_by_sms'), cp.notifyText ? 'true' : 'false');
    formData.append(counterpartyField(i, 'signature_required'), cp.signatureRequired ? 'true' : 'false');
    formData.append(counterpartyField(i, 'require_photo_id'), cp.requirePhotoId ? 'true' : 'false');
    formData.append(counterpartyField(i, 'signing_order'), String(i + 1));
    formData.append(counterpartyField(i, 'access_code'), cp.accessCode || '');
    formData.append(counterpartyField(i, 'private_message'), cp.privateMessage || '');

    // These are always the same for individual counterparties
    formData.append(counterpartyField(i, 'type'), COUNTERPARTY_STATIC_DEFAULTS.type);
    formData.append(counterpartyField(i, 'user_id'), COUNTERPARTY_STATIC_DEFAULTS.userId);
    formData.append(counterpartyField(i, 'amount'), COUNTERPARTY_STATIC_DEFAULTS.amount);
    formData.append(counterpartyField(i, 'address'), COUNTERPARTY_STATIC_DEFAULTS.address);
    formData.append(counterpartyField(i, 'business_name'), COUNTERPARTY_STATIC_DEFAULTS.businessName);

    // Permissions get their own nested array with gin dot notation
    const permKeys = Object.keys(cp.permissions || {});
    permKeys.forEach((key, pi) => {
      formData.append(counterpartyPermissionField(i, pi, 'permission'), key);
      formData.append(counterpartyPermissionField(i, pi, 'value'), cp.permissions[key] ? 'true' : 'false');
    });
  });

  // Settlements -- due_from/due_to are emails, not display names!
  (values.settlements || []).forEach((s, i) => {
    formData.append(settlementField(i, 'description'), s.description || '');
    formData.append(settlementField(i, 'value'), (s.value || '').replace(/[^0-9.]/g, '') || '0');
    formData.append(settlementField(i, 'amount_type'), s.isFixed ? 'fixed' : 'percentage');
    formData.append(settlementField(i, 'due_from'), s.dueFrom);
    formData.append(settlementField(i, 'due_to'), s.dueTo);
    formData.append(settlementField(i, 'id'), SETTLEMENT_STATIC_DEFAULTS.id);
  });

  // Documents -- field names are `name` + `file` on ingest (confirmed via API probe
  // against the Wizer backend). The Swagger lists `description`/`file_url`, but those
  // are the *response* shape; the server silently drops documents if you post with
  // those keys. See create-transaction-payload.pdf for the canonical example.
  (values.documents || []).forEach((doc, i) => {
    formData.append(documentField(i, 'name'), doc.description || '');
    if (doc.file) {
      formData.append(documentField(i, 'file'), {
        uri: doc.file.uri,
        name: doc.file.name,
        type: doc.file.mimeType || 'application/octet-stream',
      });
    }
  });

  return formData;
}
