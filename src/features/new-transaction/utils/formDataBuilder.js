// Builds the multipart FormData object that gets sent to the backend.
// The Go gin server expects dot notation like counterparties[0].email,
// not nested JSON -- so we have to manually append every single field.

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
  formData.append('type', values.transactionType);
  formData.append('title', '');
  formData.append('description', values.description);
  formData.append('amount', values.transactionValue || '0');
  formData.append('currency', values.currency);
  formData.append('base_currency', values.currency);

  // Closing date as ISO string, trimming the milliseconds like the original does
  const closingDateStr = values.closingDate
    ? values.closingDate.toISOString().replace('.000Z', 'Z')
    : new Date().toISOString().replace('.000Z', 'Z');
  formData.append('closing_date', closingDateStr);

  formData.append('enforce_signing_order', values.insertNumbering ? 'true' : 'false');
  formData.append('email_subject', values.emailSubject || '');
  formData.append('email_message', values.emailMessage || '');

  // These are hardcoded for now -- currency exchange isn't wired up yet
  formData.append('is_currency_exchange', 'false');
  formData.append('exchange_rate', '0');
  formData.append('platform_markup', '0');

  // Counterparties -- each field uses gin dot notation
  (values.counterparties || []).forEach((cp, i) => {
    formData.append(`counterparties[${i}].email`, cp.email);
    formData.append(`counterparties[${i}].first_name`, cp.firstName);
    formData.append(`counterparties[${i}].middle_name`, cp.middleName || '');
    formData.append(`counterparties[${i}].last_name`, cp.lastName);
    formData.append(`counterparties[${i}].role`, cp.role);
    formData.append(`counterparties[${i}].phone`, cp.phone ? `${cp.phoneCode}${cp.phone}` : '');
    formData.append(`counterparties[${i}].notify_by_email`, cp.notifyEmail ? 'true' : 'false');
    formData.append(`counterparties[${i}].notify_by_sms`, cp.notifyText ? 'true' : 'false');
    formData.append(`counterparties[${i}].signature_required`, cp.signatureRequired ? 'true' : 'false');
    formData.append(`counterparties[${i}].require_photo_id`, cp.requirePhotoId ? 'true' : 'false');
    formData.append(`counterparties[${i}].signing_order`, String(i + 1));
    formData.append(`counterparties[${i}].access_code`, cp.accessCode || '');
    formData.append(`counterparties[${i}].private_message`, cp.privateMessage || '');

    // These are always the same for individual counterparties
    formData.append(`counterparties[${i}].type`, 'individual');
    formData.append(`counterparties[${i}].user_id`, '0');
    formData.append(`counterparties[${i}].amount`, '0');
    formData.append(`counterparties[${i}].address`, '');
    formData.append(`counterparties[${i}].business_name`, '');

    // Permissions get their own nested array with gin dot notation
    const permKeys = Object.keys(cp.permissions || {});
    permKeys.forEach((key, pi) => {
      formData.append(`counterparties[${i}].permissions[${pi}].permission`, key);
      formData.append(`counterparties[${i}].permissions[${pi}].value`, cp.permissions[key] ? 'true' : 'false');
    });
  });

  // Settlements -- due_from/due_to are emails, not display names!
  (values.settlements || []).forEach((s, i) => {
    formData.append(`settlements[${i}].description`, s.description || '');
    formData.append(`settlements[${i}].value`, (s.value || '').replace(/[^0-9.]/g, '') || '0');
    formData.append(`settlements[${i}].amount_type`, s.isFixed ? 'fixed' : 'percentage');
    formData.append(`settlements[${i}].due_from`, s.dueFrom);
    formData.append(`settlements[${i}].due_to`, s.dueTo);
    formData.append(`settlements[${i}].id`, '0');
  });

  // Documents -- file gets attached as a multipart upload if present
  (values.documents || []).forEach((doc, i) => {
    formData.append(`documents[${i}].description`, doc.description || '');
    if (doc.file) {
      formData.append(`documents[${i}].file_url`, {
        uri: doc.file.uri,
        name: doc.file.name,
        type: doc.file.mimeType || 'application/octet-stream',
      });
    }
  });

  return formData;
}
