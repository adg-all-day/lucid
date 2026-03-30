// new transactions screen
// create a new transaction
//checkback01 fix document upload, currentyl does not work


import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import Text from '../components/StyledText';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { createTransaction } from '../constants/api';
import PickerModal from '../components/PickerModal';
import CounterpartyFilterIcon from '../components/CounterpartyFilterIcon';
import CounterpartyTrashIcon from '../components/CounterpartyTrashIcon';
import CounterpartyCollapseIcon from '../components/CounterpartyCollapseIcon';
import DraggableCounterpartyList from '../components/DraggableCounterpartyList';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import PhotoIdIcon from '../components/PhotoIdIcon';
import OutlinedField from '../components/OutlinedField';
import CloseIcon from '../components/CloseIcon';

// --- Data constants ---

const TRANSACTION_TYPES = [
  { label: 'Domain Name', value: 'domain_name' },
  { label: 'Jewelry', value: 'jewelry' },
  { label: 'Currency Conversion', value: 'currency_conversion' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Sale', value: 'sale' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'General Merchandise', value: 'general_merchandise' },
  { label: 'Service Contract', value: 'service_contract' },
  { label: 'Intellectual Property', value: 'intellectual_property' },
  { label: 'Business Acquisition', value: 'business_acquisition' },
];

const CURRENCIES = [
  { label: 'NGN - Nigerian Naira (₦)', value: 'NGN', symbol: '₦', badge: 'NG ₦' },
  { label: 'USD - US Dollar ($)', value: 'USD', symbol: '$', badge: 'US $' },
  { label: 'EUR - Euro (€)', value: 'EUR', symbol: '€', badge: 'EU €' },
  { label: 'GBP - British Pound (£)', value: 'GBP', symbol: '£', badge: 'GB £' },
  { label: 'JPY - Japanese Yen (¥)', value: 'JPY', symbol: '¥', badge: 'JP ¥' },
  { label: 'CNY - Chinese Yuan (¥)', value: 'CNY', symbol: '¥', badge: 'CN ¥' },
  { label: 'CAD - Canadian Dollar (C$)', value: 'CAD', symbol: 'C$', badge: 'CA $' },
  { label: 'AUD - Australian Dollar (A$)', value: 'AUD', symbol: 'A$', badge: 'AU $' },
  { label: 'CHF - Swiss Franc (CHF)', value: 'CHF', symbol: 'CHF', badge: 'CH CHF' },
  { label: 'INR - Indian Rupee (₹)', value: 'INR', symbol: '₹', badge: 'IN ₹' },
  { label: 'BRL - Brazilian Real (R$)', value: 'BRL', symbol: 'R$', badge: 'BR R$' },
  { label: 'ZAR - South African Rand (R)', value: 'ZAR', symbol: 'R', badge: 'ZA R' },
  { label: 'KES - Kenyan Shilling (KSh)', value: 'KES', symbol: 'KSh', badge: 'KE KSh' },
  { label: 'GHS - Ghanaian Cedi (₵)', value: 'GHS', symbol: '₵', badge: 'GH ₵' },
  { label: 'XOF - West African CFA (CFA)', value: 'XOF', symbol: 'CFA', badge: 'WA CFA' },
  { label: 'XAF - Central African CFA (FCFA)', value: 'XAF', symbol: 'FCFA', badge: 'CA FCFA' },
  { label: 'EGP - Egyptian Pound (E£)', value: 'EGP', symbol: 'E£', badge: 'EG £' },
  { label: 'MAD - Moroccan Dirham (MAD)', value: 'MAD', symbol: 'MAD', badge: 'MA MAD' },
  { label: 'TZS - Tanzanian Shilling (TSh)', value: 'TZS', symbol: 'TSh', badge: 'TZ TSh' },
  { label: 'UGX - Ugandan Shilling (USh)', value: 'UGX', symbol: 'USh', badge: 'UG USh' },
  { label: 'RWF - Rwandan Franc (RF)', value: 'RWF', symbol: 'RF', badge: 'RW RF' },
  { label: 'ETB - Ethiopian Birr (Br)', value: 'ETB', symbol: 'Br', badge: 'ET Br' },
  { label: 'MXN - Mexican Peso (MX$)', value: 'MXN', symbol: 'MX$', badge: 'MX $' },
  { label: 'ARS - Argentine Peso (AR$)', value: 'ARS', symbol: 'AR$', badge: 'AR $' },
  { label: 'COP - Colombian Peso (COL$)', value: 'COP', symbol: 'COL$', badge: 'CO $' },
  { label: 'PEN - Peruvian Sol (S/)', value: 'PEN', symbol: 'S/', badge: 'PE S/' },
  { label: 'CLP - Chilean Peso (CLP$)', value: 'CLP', symbol: 'CLP$', badge: 'CL $' },
  { label: 'KRW - South Korean Won (₩)', value: 'KRW', symbol: '₩', badge: 'KR ₩' },
  { label: 'SGD - Singapore Dollar (S$)', value: 'SGD', symbol: 'S$', badge: 'SG $' },
  { label: 'HKD - Hong Kong Dollar (HK$)', value: 'HKD', symbol: 'HK$', badge: 'HK $' },
  { label: 'NZD - New Zealand Dollar (NZ$)', value: 'NZD', symbol: 'NZ$', badge: 'NZ $' },
  { label: 'SEK - Swedish Krona (kr)', value: 'SEK', symbol: 'kr', badge: 'SE kr' },
  { label: 'NOK - Norwegian Krone (kr)', value: 'NOK', symbol: 'kr', badge: 'NO kr' },
  { label: 'DKK - Danish Krone (kr)', value: 'DKK', symbol: 'kr', badge: 'DK kr' },
  { label: 'PLN - Polish Zloty (zł)', value: 'PLN', symbol: 'zł', badge: 'PL zł' },
  { label: 'CZK - Czech Koruna (Kč)', value: 'CZK', symbol: 'Kč', badge: 'CZ Kč' },
  { label: 'HUF - Hungarian Forint (Ft)', value: 'HUF', symbol: 'Ft', badge: 'HU Ft' },
  { label: 'THB - Thai Baht (฿)', value: 'THB', symbol: '฿', badge: 'TH ฿' },
  { label: 'MYR - Malaysian Ringgit (RM)', value: 'MYR', symbol: 'RM', badge: 'MY RM' },
  { label: 'PHP - Philippine Peso (₱)', value: 'PHP', symbol: '₱', badge: 'PH ₱' },
  { label: 'IDR - Indonesian Rupiah (Rp)', value: 'IDR', symbol: 'Rp', badge: 'ID Rp' },
  { label: 'VND - Vietnamese Dong (₫)', value: 'VND', symbol: '₫', badge: 'VN ₫' },
  { label: 'AED - UAE Dirham (AED)', value: 'AED', symbol: 'AED', badge: 'AE AED' },
  { label: 'SAR - Saudi Riyal (SAR)', value: 'SAR', symbol: 'SAR', badge: 'SA SAR' },
  { label: 'QAR - Qatari Riyal (QAR)', value: 'QAR', symbol: 'QAR', badge: 'QA QAR' },
  { label: 'KWD - Kuwaiti Dinar (KD)', value: 'KWD', symbol: 'KD', badge: 'KW KD' },
  { label: 'BHD - Bahraini Dinar (BD)', value: 'BHD', symbol: 'BD', badge: 'BH BD' },
  { label: 'OMR - Omani Rial (OMR)', value: 'OMR', symbol: 'OMR', badge: 'OM OMR' },
  { label: 'TWD - Taiwan Dollar (NT$)', value: 'TWD', symbol: 'NT$', badge: 'TW NT$' },
  { label: 'ILS - Israeli Shekel (₪)', value: 'ILS', symbol: '₪', badge: 'IL ₪' },
  { label: 'TRY - Turkish Lira (₺)', value: 'TRY', symbol: '₺', badge: 'TR ₺' },
  { label: 'RUB - Russian Ruble (₽)', value: 'RUB', symbol: '₽', badge: 'RU ₽' },
  { label: 'UAH - Ukrainian Hryvnia (₴)', value: 'UAH', symbol: '₴', badge: 'UA ₴' },
  { label: 'PKR - Pakistani Rupee (₨)', value: 'PKR', symbol: '₨', badge: 'PK ₨' },
  { label: 'BDT - Bangladeshi Taka (৳)', value: 'BDT', symbol: '৳', badge: 'BD ৳' },
  { label: 'LKR - Sri Lankan Rupee (Rs)', value: 'LKR', symbol: 'Rs', badge: 'LK Rs' },
];

const PHONE_CODES = [
  { label: '🇳🇬 Nigeria (+234)', value: '+234' },
  { label: '🇺🇸 United States (+1)', value: '+1' },
  { label: '🇬🇧 United Kingdom (+44)', value: '+44' },
  { label: '🇮🇳 India (+91)', value: '+91' },
  { label: '🇨🇳 China (+86)', value: '+86' },
  { label: '🇯🇵 Japan (+81)', value: '+81' },
  { label: '🇩🇪 Germany (+49)', value: '+49' },
  { label: '🇫🇷 France (+33)', value: '+33' },
  { label: '🇮🇹 Italy (+39)', value: '+39' },
  { label: '🇪🇸 Spain (+34)', value: '+34' },
  { label: '🇿🇦 South Africa (+27)', value: '+27' },
  { label: '🇰🇪 Kenya (+254)', value: '+254' },
  { label: '🇬🇭 Ghana (+233)', value: '+233' },
  { label: '🇨🇮 Ivory Coast (+225)', value: '+225' },
  { label: '🇪🇬 Egypt (+20)', value: '+20' },
  { label: '🇲🇦 Morocco (+212)', value: '+212' },
  { label: '🇹🇿 Tanzania (+255)', value: '+255' },
  { label: '🇺🇬 Uganda (+256)', value: '+256' },
  { label: '🇷🇼 Rwanda (+250)', value: '+250' },
  { label: '🇪🇹 Ethiopia (+251)', value: '+251' },
  { label: '🇨🇦 Canada (+1)', value: '+1' },
  { label: '🇦🇺 Australia (+61)', value: '+61' },
  { label: '🇧🇷 Brazil (+55)', value: '+55' },
  { label: '🇲🇽 Mexico (+52)', value: '+52' },
  { label: '🇦🇪 UAE (+971)', value: '+971' },
  { label: '🇸🇦 Saudi Arabia (+966)', value: '+966' },
  { label: '🇰🇷 South Korea (+82)', value: '+82' },
  { label: '🇸🇬 Singapore (+65)', value: '+65' },
  { label: '🇵🇭 Philippines (+63)', value: '+63' },
  { label: '🇮🇩 Indonesia (+62)', value: '+62' },
  { label: '🇹🇭 Thailand (+66)', value: '+66' },
  { label: '🇵🇰 Pakistan (+92)', value: '+92' },
  { label: '🇧🇩 Bangladesh (+880)', value: '+880' },
  { label: '🇹🇷 Turkey (+90)', value: '+90' },
  { label: '🇵🇱 Poland (+48)', value: '+48' },
  { label: '🇺🇦 Ukraine (+380)', value: '+380' },
];

const ROLES = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Peer', value: 'peer' },
];

const getCurrencyDisplay = (currencyValue) => {
  const c = CURRENCIES.find((cur) => cur.value === currencyValue);
  return c ? c.badge : currencyValue;
};

const formatType = (type) => {
  if (!type) return '';
  return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const initialCounterparty = {
  email: '',
  phoneCode: '+234',
  phone: '',
  role: '',
  firstName: '',
  middleName: '',
  lastName: '',
  notifyEmail: true,
  notifyText: false,
  signatureRequired: false,
  signatureUri: null,
  collapsed: false,
  accessCode: '',
  requirePhotoId: false,
  privateMessage: '',
  permissions: {
    addCounterparty: false,
    deleteCounterparty: false,
    uploadDocuments: false,
    deleteDocuments: false,
    addSettlement: false,
    editSettlement: false,
  },
};

export default function NewTransactionScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false);

  const [transactionType, setTransactionType] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [transactionValue, setTransactionValue] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [closingDateObj, setClosingDateObj] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [insertNumbering, setInsertNumbering] = useState(false);
  const [counterparties, setCounterparties] = useState([
    { ...initialCounterparty },
    { ...initialCounterparty },
  ]);
  const [documents, setDocuments] = useState([{ id: '1', description: '', file: null, collapsed: false }]);
  const [settlements, setSettlements] = useState([
    { id: '1', description: '', currency: 'USD', value: '', isFixed: true, dueFrom: '', dueTo: '', collapsed: false },
  ]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // modal visibility states... theres alot of them because each picker needs its own
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showPhoneCodePicker, setShowPhoneCodePicker] = useState(false);
  const [activePhoneCodeIndex, setActivePhoneCodeIndex] = useState(0);
  const [showSettlementCurrencyPicker, setShowSettlementCurrencyPicker] = useState(false);
  const [activeSettlementIndex, setActiveSettlementIndex] = useState(0);
  const [showDueFromPicker, setShowDueFromPicker] = useState(false);
  const [activeDueFromIndex, setActiveDueFromIndex] = useState(0);
  const [showDueToPicker, setShowDueToPicker] = useState(false);
  const [activeDueToIndex, setActiveDueToIndex] = useState(0);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  const counterpartyNames = counterparties
    .filter((cp) => cp.email || cp.firstName || cp.lastName)
    .map((cp) => ({
      label: [cp.firstName, cp.middleName, cp.lastName].filter(Boolean).join(' ') || cp.email,
      value: cp.email,
    }));

  // handles form submission.. builds multipart formdata
  // backend uses gin dot notation like counterparties[0].email (not bracket notation)
  const handleSubmit = async () => {
    // Validation
    const missing = [];
    if (!transactionType) missing.push('Transaction Type');
    if (!description.trim()) missing.push('Description');
    if (!transactionValue.trim()) missing.push('Transaction Value');
    if (!closingDateObj) missing.push('Closing Date');

    counterparties.forEach((cp, i) => {
      const label = `Counterparty ${i + 1}`;
      if (!cp.firstName.trim()) missing.push(`${label} First Name`);
      if (!cp.lastName.trim()) missing.push(`${label} Last Name`);
      if (!cp.email.trim()) missing.push(`${label} Email`);
      if (!cp.role) missing.push(`${label} Role`);
    });

    settlements.forEach((s, i) => {
      const label = `Settlement ${i + 1}`;
      if (!s.value.trim()) missing.push(`${label} Value`);
      if (!s.dueFrom) missing.push(`${label} Due From`);
      if (!s.dueTo) missing.push(`${label} Due To`);
    });

    if (missing.length > 0) {
      Alert.alert('Missing Fields', `Please fill in the following:\n\n${missing.join('\n')}`);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', transactionType);
      formData.append('title', '');
      formData.append('description', description);
      formData.append('amount', transactionValue || '0');
      formData.append('currency', currency);
      formData.append('base_currency', currency);
      formData.append('closing_date', closingDateObj ? closingDateObj.toISOString().replace('.000Z', 'Z') : new Date().toISOString().replace('.000Z', 'Z'));
      formData.append('enforce_signing_order', insertNumbering ? 'true' : 'false');
      formData.append('email_subject', emailSubject);
      formData.append('email_message', emailMessage);
      formData.append('is_currency_exchange', 'false');
      formData.append('exchange_rate', '0');
      formData.append('platform_markup', '0');

      counterparties.forEach((cp, i) => {
        formData.append(`counterparties[${i}].email`, cp.email);
        formData.append(`counterparties[${i}].first_name`, cp.firstName);
        formData.append(`counterparties[${i}].middle_name`, cp.middleName);
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
        formData.append(`counterparties[${i}].type`, 'individual');
        formData.append(`counterparties[${i}].user_id`, '0');
        formData.append(`counterparties[${i}].amount`, '0');
        formData.append(`counterparties[${i}].address`, '');
        formData.append(`counterparties[${i}].business_name`, '');

        // Permissions
        const permKeys = Object.keys(cp.permissions || {});
        permKeys.forEach((key, pi) => {
          formData.append(`counterparties[${i}].permissions[${pi}].permission`, key);
          formData.append(`counterparties[${i}].permissions[${pi}].value`, cp.permissions[key] ? 'true' : 'false');
        });
      });

      // settlement due_from and due_to must be emails not names.. backend returns 500 otherwise
      settlements.forEach((s, i) => {
        formData.append(`settlements[${i}].description`, s.description);
        formData.append(`settlements[${i}].value`, s.value.replace(/[^0-9.]/g, '') || '0');
        formData.append(`settlements[${i}].amount_type`, s.isFixed ? 'fixed' : 'percentage');
        formData.append(`settlements[${i}].due_from`, s.dueFrom);
        formData.append(`settlements[${i}].due_to`, s.dueTo);
        formData.append(`settlements[${i}].id`, '0');
      });

      documents.forEach((doc, i) => {
        formData.append(`documents[${i}].description`, doc.description);
        if (doc.file) {
          formData.append(`documents[${i}].file_url`, {
            uri: doc.file.uri,
            name: doc.file.name,
            type: doc.file.mimeType || 'application/octet-stream',
          });
        }
      });

      const result = await createTransaction(formData);
      console.log('Create transaction response:', JSON.stringify(result));
      if (result.error || result.status === 'error' || result.statusCode >= 400) {
        Alert.alert('Error', result.message || result.error || 'Failed to create transaction.');
      } else {
        Alert.alert('Success', 'Transaction created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create transaction. Please try again.');
      console.error('Create transaction error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const updateCounterparty = (index, field, value) => {
    const updated = [...counterparties];
    updated[index] = { ...updated[index], [field]: value };
    setCounterparties(updated);
  };

  const updateSettlement = (index, field, value) => {
    const updated = [...settlements];
    updated[index] = { ...updated[index], [field]: value };
    setSettlements(updated);
  };

  const updateDocument = (index, field, value) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    setDocuments(updated);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setClosingDateObj(selectedDate);
      setClosingDate(formatDate(selectedDate));
    }
  };

  // suggezt: document upload dosent actually save to the backend yet... needs investigation
  const pickDocument = async (docIndex) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/bmp',
        ],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        updateDocument(docIndex, 'file', {
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mimeType: asset.mimeType,
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickSignature = async (cpIndex) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateCounterparty(cpIndex, 'signatureUri', result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick signature image');
    }
  };

  const renderDragDots = () => (
    <View style={styles.dragDotsContainer}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.dragDotsRow}>
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
        </View>
      ))}
    </View>
  );

  // renders a single counterparty card with all its fields
  const renderCounterparty = (cp, index) => (
    <View key={index} style={styles.counterpartyCard}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.counterpartyProgressBar}>
          {renderDragDots()}
        </View>
        <View style={{ flex: 1, padding: 14, paddingLeft: 0 }}>
      <View style={styles.counterpartyHeader}>
        <View style={styles.counterpartyNumber}>
          <Text style={styles.counterpartyNumberText}>{index + 1}</Text>
        </View>
        {cp.collapsed && cp.firstName ? (
          <Text style={styles.collapsedName} numberOfLines={1}>
            {cp.firstName} {cp.lastName ? cp.lastName.charAt(0) + '.' : ''}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => {}}>
          <CounterpartyFilterIcon size={45} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={() => {
            const updated = counterparties.filter((_, i) => i !== index);
            setCounterparties(updated);
          }}
        >
          <CounterpartyTrashIcon size={45} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={() => updateCounterparty(index, 'collapsed', !cp.collapsed)}
        >
          <CounterpartyCollapseIcon size={45} collapsed={cp.collapsed} />
        </TouchableOpacity>
        </View>
      </View>

      {!cp.collapsed && (<>
      <OutlinedField label="Email" bgColor="white">
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0 }]}
            value={cp.email}
            onChangeText={(v) => updateCounterparty(index, 'email', v)}
            placeholder="Email"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </OutlinedField>

      <OutlinedField label="Telephone (Optional)" bgColor="white">
        <View style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.phoneCode}
            onPress={() => {
              setActivePhoneCodeIndex(index);
              setShowPhoneCodePicker(true);
            }}
          >
            <Text style={styles.phoneCodeText}>{cp.phoneCode}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.gray} />
          </TouchableOpacity>
          <View style={styles.phoneDivider} />
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0 }]}
            value={cp.phone}
            onChangeText={(v) => updateCounterparty(index, 'phone', v)}
            placeholder="(0) 8041234567"
            keyboardType="phone-pad"
          />
        </View>
      </OutlinedField>

      <OutlinedField label="Role" bgColor="white">
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => {
            setActiveRoleIndex(index);
            setShowRolePicker(true);
          }}
        >
          <Text style={cp.role ? styles.dropdownText : styles.dropdownPlaceholder}>
            {cp.role ? formatType(cp.role) : 'Select Role'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray} />
        </TouchableOpacity>
      </OutlinedField>

      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          <OutlinedField label="First Name" bgColor="white">
            <TextInput
              style={styles.input}
              value={cp.firstName}
              onChangeText={(v) => updateCounterparty(index, 'firstName', v)}
            />
          </OutlinedField>
        </View>
      </View>

      <OutlinedField label="Middle Name" bgColor="white">
        <TextInput
          style={styles.input}
          value={cp.middleName}
          onChangeText={(v) => updateCounterparty(index, 'middleName', v)}
        />
      </OutlinedField>

      <OutlinedField label="Last Name" bgColor="white">
        <TextInput
          style={styles.input}
          value={cp.lastName}
          onChangeText={(v) => updateCounterparty(index, 'lastName', v)}
        />
      </OutlinedField>

      <Text style={styles.inputLabel}>Notify Counterparty By:</Text>
      <View style={styles.checkboxRow}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateCounterparty(index, 'notifyEmail', !cp.notifyEmail)}
        >
          <Ionicons
            name={cp.notifyEmail ? 'checkbox' : 'square-outline'}
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.checkboxLabel}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateCounterparty(index, 'notifyText', !cp.notifyText)}
        >
          <Ionicons
            name={cp.notifyText ? 'checkbox' : 'square-outline'}
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.checkboxLabel}>Text Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.signatureRow}>
          <Text style={styles.signatureLabel}>Signature Required</Text>
          <TouchableOpacity
            onPress={() => updateCounterparty(index, 'signatureRequired', !cp.signatureRequired)}
          >
            <Ionicons
              name={cp.signatureRequired ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
        {cp.signatureRequired && (
          <View style={styles.signatureUploadArea}>
            {cp.signatureUri ? (
              <View style={styles.signatureThumbnailRow}>
                <Image source={{ uri: cp.signatureUri }} style={styles.signatureThumbnail} />
                <TouchableOpacity
                  style={styles.signatureRemoveBtn}
                  onPress={() => updateCounterparty(index, 'signatureUri', null)}
                >
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signatureUploadBtn}
                onPress={() => pickSignature(index)}
              >
                <Ionicons name="image-outline" size={20} color={Colors.primary} />
                <Text style={styles.signatureUploadText}>Upload Signature</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {index > 0 && (
        <>
          {/* Security */}
          <View style={{ marginVertical: 12 }} />
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Security</Text>
            <TouchableOpacity onPress={() => {
              updateCounterparty(index, 'accessCode', '');
              updateCounterparty(index, 'requirePhotoId', false);
              updateCounterparty(index, 'privateMessage', '');
            }}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.securityNote}>
            Provide this Access Code to the counterparty for access this transaction
          </Text>

          <OutlinedField label="Access Code (Optional)" bgColor="white">
            <TextInput
              style={styles.input}
              value={cp.accessCode}
              onChangeText={(v) => updateCounterparty(index, 'accessCode', v)}
            />
          </OutlinedField>

          <TouchableOpacity>
            <Text style={styles.linkText}>Generate Access Code for Me</Text>
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <PhotoIdIcon size={18} />
              <Text style={styles.toggleLabel}>Require Photo ID verification</Text>
            </View>
            <Switch
              value={cp.requirePhotoId}
              onValueChange={(v) => updateCounterparty(index, 'requirePhotoId', v)}
              trackColor={{ false: Colors.grayMedium, true: Colors.primaryLight }}
              thumbColor={cp.requirePhotoId ? Colors.primary : Colors.grayMedium}
            />
          </View>

          <OutlinedField label="Private Message (0/1000)" bgColor="white">
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cp.privateMessage}
              onChangeText={(v) => updateCounterparty(index, 'privateMessage', v)}
              multiline
              numberOfLines={3}
              placeholder="Enter private message..."
            />
          </OutlinedField>

          {/* Permissions */}
          <View style={{ marginVertical: 12 }} />
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { fontSize: 16, color: Colors.black, fontWeight: '400' }]}>Permissions</Text>
          </View>
          <Text style={[styles.securityNote, { color: Colors.black }]}>
            Actions this Counterparty can perform on this transaction
          </Text>

          <View style={styles.permissionsGrid}>
            {[
              ['addCounterparty', 'Add Counterparty'],
              ['deleteCounterparty', 'Delete Counterparty'],
              ['uploadDocuments', 'Upload Documents'],
              ['deleteDocuments', 'Delete Documents'],
              ['addSettlement', 'Add Settlement'],
              ['editSettlement', 'Edit Settlement'],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={styles.permissionItem}
                onPress={() => {
                  const updated = [...counterparties];
                  updated[index] = {
                    ...updated[index],
                    permissions: { ...updated[index].permissions, [key]: !updated[index].permissions[key] },
                  };
                  setCounterparties(updated);
                }}
              >
                <Ionicons
                  name={cp.permissions[key] ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={Colors.gray}
                />
                <Text style={styles.permissionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      </>)}
        </View>
      </View>
    </View>
  );

  const renderDocument = (doc, index) => (
    <View key={doc.id} style={styles.documentCard}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.counterpartyProgressBar}>
          {renderDragDots()}
        </View>
        <View style={{ flex: 1, padding: doc.collapsed ? 4 : 14, paddingLeft: 0 }}>
          <View style={[styles.counterpartyHeader, { marginBottom: doc.collapsed ? 0 : 8 }]}>
            {doc.collapsed && doc.description ? (
              <Text style={styles.collapsedName} numberOfLines={1}>{doc.description}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginLeft: 8 }}
              onPress={() => {
                const updated = documents.filter((_, i) => i !== index);
                setDocuments(updated);
              }}
            >
              <CounterpartyTrashIcon size={45} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 8 }}
              onPress={() => updateDocument(index, 'collapsed', !doc.collapsed)}
            >
              <CounterpartyCollapseIcon size={45} collapsed={doc.collapsed} />
            </TouchableOpacity>
            </View>
          </View>

          {!doc.collapsed && (<>
            <View style={styles.documentHeader}>
              <Text style={styles.documentNumber}>{index + 1}.</Text>
              <View style={{ flex: 1 }}>
                <OutlinedField label="Description" bgColor="white">
                  <TextInput
                    style={styles.input}
                    value={doc.description}
                    onChangeText={(v) => updateDocument(index, 'description', v)}
                    placeholder="Description"
                  />
                </OutlinedField>
              </View>
            </View>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(index)}>
              <Ionicons name="document-outline" size={20} color={Colors.primary} />
              <Text style={styles.uploadBtnText}> Upload File </Text>
            </TouchableOpacity>
            {doc.file && (
              <Text style={styles.fileNameText} numberOfLines={1}>{doc.file.name}</Text>
            )}
            <Text style={styles.uploadHint}>
              Supported formats: .pdf, .jpeg, .png, .docx, .bmp{'\n'}Maximum file size: 10 MB
            </Text>
          </>)}
        </View>
      </View>
    </View>
  );

  const renderSettlement = (settlement, index) => (
    <View key={settlement.id} style={styles.settlementCard}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.counterpartyProgressBar}>
          {renderDragDots()}
        </View>
        <View style={{ flex: 1, padding: settlement.collapsed ? 4 : 14, paddingLeft: 0 }}>
          <View style={[styles.counterpartyHeader, { marginBottom: settlement.collapsed ? 0 : 8 }]}>
            {settlement.collapsed && settlement.description ? (
              <Text style={styles.collapsedName} numberOfLines={1}>{settlement.description}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginLeft: 8 }}
              onPress={() => {
                const updated = settlements.filter((_, i) => i !== index);
                setSettlements(updated);
              }}
            >
              <CounterpartyTrashIcon size={45} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 8 }}
              onPress={() => updateSettlement(index, 'collapsed', !settlement.collapsed)}
            >
              <CounterpartyCollapseIcon size={45} collapsed={settlement.collapsed} />
            </TouchableOpacity>
            </View>
          </View>

          {!settlement.collapsed && (<>
            <View style={styles.settlementHeader}>
              <Text style={styles.documentNumber}>{index + 1}.</Text>
              <View style={{ flex: 1 }}>
                <OutlinedField label="Description" bgColor="white">
                  <TextInput
                    style={styles.input}
                    value={settlement.description}
                    onChangeText={(v) => updateSettlement(index, 'description', v)}
                    placeholder="Description"
                  />
                </OutlinedField>
              </View>
            </View>

            <View style={styles.settlementFields}>
              <OutlinedField label="Value" bgColor="white">
              {settlement.isFixed ? (
                <View style={styles.valueRow}>
                  <TouchableOpacity
                    style={styles.currencyBadge}
                    onPress={() => {
                      setActiveSettlementIndex(index);
                      setShowSettlementCurrencyPicker(true);
                    }}
                  >
                    <Text style={styles.currencyText}>{getCurrencyDisplay(settlement.currency)}</Text>
                    <Ionicons name="chevron-down" size={14} color={Colors.gray} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    value={settlement.value}
                    onChangeText={(v) => updateSettlement(index, 'value', v)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <View style={styles.valueRow}>
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyText}>%</Text>
                    <Ionicons name="chevron-down" size={14} color={Colors.gray} />
                  </View>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    value={settlement.value}
                    onChangeText={(v) => updateSettlement(index, 'value', v)}
                    placeholder="0%"
                    keyboardType="numeric"
                  />
                </View>
              )}
              </OutlinedField>

              <TouchableOpacity
                style={styles.pillToggleRow}
                onPress={() => updateSettlement(index, 'isFixed', !settlement.isFixed)}
              >
                <Text style={[styles.pillToggleText, settlement.isFixed && styles.pillToggleTextActive]}>Fixed Amount</Text>
                <View style={styles.pillTrack}>
                  <View style={[styles.pillThumb, !settlement.isFixed && styles.pillThumbRight]} />
                </View>
                <Text style={[styles.pillToggleText, !settlement.isFixed && styles.pillToggleTextActive]}>Percentage</Text>
              </TouchableOpacity>

              <OutlinedField label="Due From" bgColor="white">
                <TouchableOpacity
                  style={styles.dropdownInput}
                  onPress={() => {
                    setActiveDueFromIndex(index);
                    setShowDueFromPicker(true);
                  }}
                >
                  <Text style={settlement.dueFrom ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {settlement.dueFrom || 'Select counterparty'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.gray} />
                </TouchableOpacity>
              </OutlinedField>

              <OutlinedField label="Due To" bgColor="white">
                <TouchableOpacity
                  style={styles.dropdownInput}
                  onPress={() => {
                    setActiveDueToIndex(index);
                    setShowDueToPicker(true);
                  }}
                >
                  <Text style={settlement.dueTo ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {settlement.dueTo || 'Select counterparty'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.gray} />
                </TouchableOpacity>
              </OutlinedField>
            </View>
          </>)}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.dimBackground} onPress={() => navigation.goBack()} />
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <CloseIcon size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Transaction Type */}
        <OutlinedField label="Transaction Type">
          <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowTypePicker(true)}>
            <Text style={transactionType ? styles.dropdownText : styles.dropdownPlaceholder}>
              {transactionType ? formatType(transactionType) : 'Select Transaction Type'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.gray} />
          </TouchableOpacity>
        </OutlinedField>

        {/* Description */}
        <OutlinedField label="Description">
          <TextInput
            style={styles.input}
            placeholder="Enter Description"
            value={description}
            onChangeText={setDescription}
          />
        </OutlinedField>

        {/* Transaction Value + Closing Date */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <OutlinedField label="Transaction Value">
              <View style={styles.valueRow}>
                <TouchableOpacity
                  style={styles.currencyBadge}
                  onPress={() => setShowCurrencyPicker(true)}
                >
                  <Text style={styles.currencyText}>{getCurrencyDisplay(currency)}</Text>
                  <Ionicons name="chevron-down" size={14} color={Colors.gray} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, fontSize: 12, minHeight: 0, paddingVertical: 0 }]}
                  placeholder="88,888,888,888.00"
                  value={transactionValue}
                  onChangeText={setTransactionValue}
                  keyboardType="numeric"
                />
              </View>
            </OutlinedField>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 0.7 }}>
            <OutlinedField label="Closing Date">
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setShowDatePicker(true)}
            >
              <Text style={closingDate ? styles.dropdownText : styles.dropdownPlaceholder}>
                {closingDate || 'dd/mm/yyyy'}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
              </TouchableOpacity>
            </OutlinedField>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={closingDateObj || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Counterparties */}
        <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 20 }]}>Counterparties</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Insert Numbering for Signing Order</Text>
          <Switch
            value={insertNumbering}
            onValueChange={setInsertNumbering}
            trackColor={{ false: Colors.grayMedium, true: Colors.primaryLight }}
            thumbColor={insertNumbering ? Colors.primary : Colors.grayMedium}
          />
        </View>

        <DraggableCounterpartyList
          data={counterparties}
          renderItem={renderCounterparty}
          itemHeight={200}
          onReorder={(from, to) => {
            if (from === 0 || to === 0) return;
            const updated = [...counterparties];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            setCounterparties(updated);
          }}
        />

        <TouchableOpacity
          style={styles.addBtnBoxed}
          onPress={() => setCounterparties([...counterparties, { ...initialCounterparty }])}
        >
          <Text style={styles.addBtnText}>+ Add Counterparty</Text>
        </TouchableOpacity>

        {/* Upload Transaction Documents */}
        <Text style={[styles.sectionTitle, { color: Colors.primary, marginTop: 20, fontSize: 14 }]}>
          Upload Transaction Documents
        </Text>

        <DraggableCounterpartyList
          data={documents}
          renderItem={renderDocument}
          itemHeight={200}
          firstItemFixed={false}
          onReorder={(from, to) => {
            const updated = [...documents];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            setDocuments(updated);
          }}
        />

        <TouchableOpacity
          style={styles.addBtnBoxed}
          onPress={() =>
            setDocuments([...documents, { id: String(Date.now()), description: '', file: null, collapsed: false }])
          }
        >
          <Text style={styles.addBtnText}>+ Add Transaction Document</Text>
        </TouchableOpacity>

        {/* Settlements */}
        <Text style={[styles.sectionTitle, { color: Colors.primary, marginTop: 20, fontSize: 14 }]}>Settlements</Text>

        <DraggableCounterpartyList
          data={settlements}
          renderItem={renderSettlement}
          itemHeight={200}
          firstItemFixed={false}
          onReorder={(from, to) => {
            const updated = [...settlements];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            setSettlements(updated);
          }}
        />

        <View style={styles.settlementActionsRow}>
          <TouchableOpacity
            style={styles.addBtnBoxed}
            onPress={() =>
              setSettlements([
                ...settlements,
                {
                  id: String(Date.now()),
                  description: '',
                  currency: 'USD',
                  value: '',
                  isFixed: true,
                  dueFrom: '',
                  dueTo: '',
                  collapsed: false,
                },
              ])
            }
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.addBtnText, { fontSize: 22, marginRight: 4 }]}>+</Text>
              <Text style={styles.addBtnText}>Add Settlement</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtnBoxed, { alignSelf: 'stretch', justifyContent: 'center' }]}>
            <Text style={[styles.addBtnText, { color: Colors.primary }]}>
              View Settlement Statement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email Message */}
        <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: 14, fontWeight: '700' }]}>Email Message</Text>

        <View style={styles.emailCard}>
          <OutlinedField label="Email Subject" bgColor="#F5F5F5">
            <TextInput
              style={[styles.input, { backgroundColor: Colors.white }]}
              value={emailSubject}
              onChangeText={setEmailSubject}
              placeholder=""
            />
          </OutlinedField>

          <OutlinedField label="Email Message" bgColor="#F5F5F5">
            <TextInput
              style={[styles.input, styles.textArea, { minHeight: 115, backgroundColor: Colors.white }]}
              value={emailMessage}
              onChangeText={setEmailMessage}
              multiline
              numberOfLines={4}
              placeholder=""
            />
          </OutlinedField>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.draftBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.draftBtnText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.submitBtnText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Modals */}
      <PickerModal
        visible={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelect={(item) => setTransactionType(item.value)}
        items={TRANSACTION_TYPES}
        title="Select Transaction Type"
      />
      <PickerModal
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={(item) => setCurrency(item.value)}
        items={CURRENCIES}
        title="Select Currency"
        searchable
      />
      <PickerModal
        visible={showPhoneCodePicker}
        onClose={() => setShowPhoneCodePicker(false)}
        onSelect={(item) => {
          updateCounterparty(activePhoneCodeIndex, 'phoneCode', item.value);
        }}
        items={PHONE_CODES}
        title="Select Country Code"
        searchable
      />
      <PickerModal
        visible={showSettlementCurrencyPicker}
        onClose={() => setShowSettlementCurrencyPicker(false)}
        onSelect={(item) => {
          updateSettlement(activeSettlementIndex, 'currency', item.value);
        }}
        items={CURRENCIES}
        title="Select Currency"
        searchable
      />
      <PickerModal
        visible={showDueFromPicker}
        onClose={() => setShowDueFromPicker(false)}
        onSelect={(item) => {
          updateSettlement(activeDueFromIndex, 'dueFrom', item.value);
        }}
        items={counterpartyNames}
        title="Select Due From"
      />
      <PickerModal
        visible={showDueToPicker}
        onClose={() => setShowDueToPicker(false)}
        onSelect={(item) => {
          updateSettlement(activeDueToIndex, 'dueTo', item.value);
        }}
        items={counterpartyNames}
        title="Select Due To"
      />
      <PickerModal
        visible={showRolePicker}
        onClose={() => setShowRolePicker(false)}
        onSelect={(item) => {
          updateCounterparty(activeRoleIndex, 'role', item.value);
        }}
        items={ROLES}
        title="Select Role"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
  },
  dimBackground: {
    height: 50,
  },
  modalCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.black,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: Colors.gray,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.black,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  currencyText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.black,
  },
  counterpartyCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  counterpartyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  counterpartyNumber: {
    width: 50,
    height: 45,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterpartyNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  collapsedName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 10,
    flex: 1,
    flexShrink: 1,
  },
  counterpartyProgressBar: {
    width: 20,
    backgroundColor: '#EFEEFA',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragDotsContainer: {
    gap: 4,
  },
  dragDotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5C6E8',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  searchIcon: {
    width: 45,
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  phoneCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  phoneCodeText: {
    fontSize: 14,
    color: Colors.black,
  },
  phoneDivider: {
    width: 1,
    height: 17,
    backgroundColor: Colors.border,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.black,
  },
  signatureSection: {
    marginTop: 8,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primaryLight,
    gap: 10,
  },
  signatureLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  signatureUploadArea: {
    marginTop: 8,
  },
  signatureUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 5,
    paddingVertical: 12,
  },
  signatureUploadText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  signatureThumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signatureThumbnail: {
    width: 80,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    resizeMode: 'contain',
  },
  signatureRemoveBtn: {
    padding: 4,
  },
  securityNote: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 10,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  permissionLabel: {
    fontSize: 13,
    color: Colors.black,
  },
  addBtn: {
    marginTop: 12,
  },
  addBtnBoxed: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  documentCard: {
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  documentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 28,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    borderStyle: 'dashed',
    paddingVertical: 10,
    marginTop: 8,
  },
  uploadBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  fileNameText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  settlementCard: {
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  settlementFields: {
    marginLeft: 20,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  settlementActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  settlementActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  pillToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  pillToggleText: {
    fontSize: 13,
    color: Colors.gray,
  },
  pillToggleTextActive: {
    color: Colors.black,
    fontWeight: '500',
  },
  pillTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pillThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  pillThumbRight: {
    alignSelf: 'flex-end',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emailCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    padding: 12,
    paddingTop: 4,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  draftBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  draftBtnText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 13,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 13,
  },
});
