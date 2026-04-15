// Language & regional settings — loads /profile/regional + /profile/regional/template
// and lets the user edit each field via dropdown (PickerModal) or manual text entry.
// Save/Cancel is driven from the SettingsScreen footer via an imperative ref.

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';
import OutlinedField from '../../../components/OutlinedField';
import PickerModal from '../../../components/PickerModal';
import SectionHeading from './SectionHeading';
import {
  LanguageGlobeIcon,
  CountryWorldIcon,
  NumberHashIcon,
  NameUserIcon,
} from '../../../icons';
import {
  useRegionalSettings,
  useRegionalTemplate,
  useSaveRegionalSettings,
} from '../../../api/queries/regional';
import { changeAppLanguage } from '../../../i18n';
import { getLanguageLabel } from '../../../i18n/languageUtils';
import useUserStore from '../../../stores/userStore';
import { getSettingsSectionCardBackground } from '../utils/sectionCardStyle';

const EMPTY = {
  country_code: '',
  country_name: '',
  currency_code: '',
  currency_name: '',
  language: '',
  timezone: '',
  telephone_code: '',
  date_format: '',
  number_separator: '',
  decimal_separator: '',
  full_name_format: '',
  initials_format: '',
};

const FALLBACK_NAME_FORMATS = [
  'FirstName MiddleName LastName',
  'FirstName LastName',
  'LastName FirstName',
  'FN MN LN',
  'FN LN',
  'LN FN',
];

function mapServer(data) {
  if (!data) return { ...EMPTY };
  const src = data.data || data;
  return {
    country_code: src.country_code || '',
    country_name: src.country_name || '',
    currency_code: src.currency_code || '',
    currency_name: src.currency_name || '',
    language: src.language || '',
    timezone: src.timezone || '',
    telephone_code: src.telephone_code || '',
    date_format: src.date_format || '',
    number_separator: src.number_separator || '',
    decimal_separator: src.decimal_separator || '',
    full_name_format: src.full_name_format || '',
    initials_format: src.initials_format || '',
  };
}

function IconTitle({ IconComponent, title, description, theme }) {
  return (
    <View style={styles.iconTitle}>
      <View style={{ marginTop: 2 }}>
        <IconComponent size={20} color={theme.text} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.iconTitleText, { color: theme.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.iconTitleDesc, { color: theme.textSecondary }]}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
}

function DropdownField({ label, value, onOpenPicker, disabled }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <OutlinedField label={label} bgColor={theme.cardBgSolid}>
      <TouchableOpacity
        onPress={onOpenPicker}
        disabled={disabled}
        activeOpacity={0.7}
        style={[styles.fieldBox, { backgroundColor: theme.cardBgSolid, borderColor: theme.divider }]}
      >
        <Text
          style={[styles.input, { color: value ? theme.text : theme.textSecondary }]}
          numberOfLines={1}
        >
          {value || t('common.select')}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
      </TouchableOpacity>
    </OutlinedField>
  );
}

function PreviewField({ label, value }) {
  const theme = useTheme();
  return (
    <OutlinedField label={label} bgColor={theme.cardBgSolid}>
      <View style={[styles.previewBox, { backgroundColor: theme.cardBgSolid, borderColor: theme.divider }]}>
        <Text style={[styles.previewText, { color: theme.text }]}>{value}</Text>
      </View>
    </OutlinedField>
  );
}

const SEPARATOR_KEYS = {
  ',': 'comma',
  '.': 'dot',
  ' ': 'space',
  "'": 'apostrophe',
  '_': 'underscore',
};

function separatorLabel(raw, t) {
  const s = String(raw ?? '');
  const trimmed = s.trim();
  const key = trimmed === '' && s.length ? ' ' : trimmed;
  const nameKey = SEPARATOR_KEYS[key];
  const name = nameKey ? t(`settings.languageRegion.separators.${nameKey}`) : '';
  if (name) return `${name} (${key === ' ' ? '␣' : key})`;
  return s || '—';
}

function toItems(list, labelFn, valueFn) {
  if (!Array.isArray(list)) return [];
  return list.map((raw, i) => ({
    label: labelFn ? labelFn(raw) : String(raw),
    value: valueFn ? valueFn(raw) : String(raw),
    raw,
    _k: i,
  }));
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value))));
}

function formatNameFormatLabel(value, t) {
  const replacements = [
    ['MiddleName', t('settings.languageRegion.nameTokens.middleName')],
    ['FirstName', t('settings.languageRegion.nameTokens.firstName')],
    ['LastName', t('settings.languageRegion.nameTokens.lastName')],
    ['MN', t('settings.languageRegion.nameTokens.mn')],
    ['FN', t('settings.languageRegion.nameTokens.fn')],
    ['LN', t('settings.languageRegion.nameTokens.ln')],
  ];

  return replacements.reduce(
    (label, [token, replacement]) => label.split(token).join(replacement),
    String(value || ''),
  );
}

const LanguageRegionSection = forwardRef(function LanguageRegionSection(_props, ref) {
  const { t } = useTranslation();
  const theme = useTheme();
  const sectionCardBackground = getSettingsSectionCardBackground(theme);
  const userId = useUserStore((state) => state.id);
  const userEmail = useUserStore((state) => state.email);
  const { data: settingsData, isLoading: loadingSettings } = useRegionalSettings();
  const { data: templateData, isLoading: loadingTemplate } = useRegionalTemplate();
  const saveMutation = useSaveRegionalSettings();

  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [picker, setPicker] = useState(null); // { field, items, title }

  useEffect(() => {
    if (!settingsData) return;
    const mapped = mapServer(settingsData);
    setForm(mapped);
    setInitialForm(mapped);
  }, [settingsData]);

  useImperativeHandle(ref, () => ({
    async save() {
      try {
        const result = await saveMutation.mutateAsync(form);
        await changeAppLanguage(form.language, userId || userEmail);
        setInitialForm(form);
        return {
          ok: true,
          title: t('common.saved'),
          message: result?.message || result?.data?.message || t('settings.languageRegion.savedMessage'),
        };
      } catch (error) {
        return {
          ok: false,
          title: t('common.error'),
          message:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            t('settings.languageRegion.saveError'),
        };
      }
    },
    reset() {
      setForm(initialForm);
    },
  }), [form, initialForm, saveMutation, t, userEmail, userId]);

  const tpl = templateData?.data || templateData || {};

  const languageItems = useMemo(
    () => toItems(tpl.languages, getLanguageLabel, (language) => String(language)),
    [tpl.languages],
  );
  const countryItems = useMemo(
    () =>
      toItems(
        tpl.countries,
        (c) => c?.name || '',
        (c) => c?.code || c?.name || '',
      ),
    [tpl.countries],
  );
  const timezoneItems = useMemo(() => toItems(tpl.timezones), [tpl.timezones]);
  const dateFormatItems = useMemo(() => toItems(tpl.date_formats), [tpl.date_formats]);
  const currencyItems = useMemo(
    () =>
      toItems(
        tpl.currencies,
        (c) => (c?.symbol ? `${c.symbol}  ${c.code} — ${c.name}` : `${c.code} — ${c.name}`),
        (c) => c?.code || '',
      ),
    [tpl.currencies],
  );
  const telephoneItems = useMemo(() => toItems(tpl.telephone_codes), [tpl.telephone_codes]);
  const numSepItems = useMemo(
    () => toItems(tpl.number_separators, (value) => separatorLabel(value, t), (v) => String(v)),
    [tpl.number_separators, t],
  );
  const decSepItems = useMemo(
    () => toItems(tpl.decimal_separators, (value) => separatorLabel(value, t), (v) => String(v)),
    [tpl.decimal_separators, t],
  );
  const allNameFormatValues = useMemo(
    () =>
      uniqueValues([
        ...(Array.isArray(tpl.name_formats) ? tpl.name_formats : []),
        form.full_name_format,
        form.initials_format,
        ...FALLBACK_NAME_FORMATS,
      ]),
    [form.full_name_format, form.initials_format, tpl.name_formats],
  );
  const allNameFormats = useMemo(
    () => toItems(allNameFormatValues, (value) => formatNameFormatLabel(value, t), (value) => String(value)),
    [allNameFormatValues, t],
  );
  const fullNameItems = useMemo(
    () => allNameFormats.filter((it) => /FirstName|MiddleName|LastName/.test(it.value)),
    [allNameFormats],
  );
  const initialsItems = useMemo(
    () => allNameFormats.filter((it) => !/FirstName|MiddleName|LastName/.test(it.value)),
    [allNameFormats],
  );

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openPicker = (field, items, title) => {
    setPicker({ field, items, title });
  };

  const handleSelect = (item) => {
    if (!picker) return;
    const { field } = picker;
    if (field === 'country') {
      const raw = item.raw || {};
      setForm((prev) => ({
        ...prev,
        country_code: raw.code || '',
        country_name: raw.name || item.label,
      }));
    } else if (field === 'currency') {
      const raw = item.raw || {};
      setForm((prev) => ({
        ...prev,
        currency_code: raw.code || item.value,
        currency_name: raw.name || '',
      }));
    } else {
      setField(field, item.value);
    }
  };

  const numberPreview = useMemo(() => {
    const thou = form.number_separator || ',';
    const dec = form.decimal_separator || '.';
    return `8${thou}888${thou}888${dec}88`;
  }, [form.number_separator, form.decimal_separator]);

  const sampleFirstName = t('settings.languageRegion.sampleName.firstName');
  const sampleMiddleName = t('settings.languageRegion.sampleName.middleName');
  const sampleLastName = t('settings.languageRegion.sampleName.lastName');
  const SAMPLE_NAME = useMemo(
    () => ({
      FirstName: sampleFirstName,
      MiddleName: sampleMiddleName,
      LastName: sampleLastName,
      FN: sampleFirstName,
      MN: sampleMiddleName,
      LN: sampleLastName,
    }),
    [sampleFirstName, sampleMiddleName, sampleLastName],
  );
  const SAMPLE_INITIALS = useMemo(
    () => ({
      FirstName: sampleFirstName.slice(0, 1),
      MiddleName: sampleMiddleName.slice(0, 1),
      LastName: sampleLastName.slice(0, 1),
      FN: sampleFirstName.slice(0, 1),
      MN: sampleMiddleName.slice(0, 1),
      LN: sampleLastName.slice(0, 1),
    }),
    [sampleFirstName, sampleMiddleName, sampleLastName],
  );

  const applyNameFormat = (fmt, map) => {
    if (!fmt) return '';
    const keys = Object.keys(map).sort((a, b) => b.length - a.length);
    let out = fmt;
    keys.forEach((k) => {
      out = out.split(k).join(map[k]);
    });
    return out;
  };

  const fullNamePreview = useMemo(() => {
    const rendered = applyNameFormat(form.full_name_format, SAMPLE_NAME);
    return rendered || `${sampleFirstName} ${sampleMiddleName} ${sampleLastName}`;
  }, [SAMPLE_NAME, form.full_name_format, sampleFirstName, sampleLastName, sampleMiddleName]);

  const initialsPreview = useMemo(() => {
    const rendered = applyNameFormat(form.initials_format, SAMPLE_INITIALS);
    return rendered || `${sampleFirstName.slice(0, 1)}${sampleMiddleName.slice(0, 1)}${sampleLastName.slice(0, 1)}`;
  }, [SAMPLE_INITIALS, form.initials_format, sampleFirstName, sampleLastName, sampleMiddleName]);

  const loading = loadingSettings || loadingTemplate;

  return (
    <View>
      <SectionHeading title={t('settings.languageRegion.title')} />

      {loading ? (
        <View style={[styles.card, { backgroundColor: sectionCardBackground, alignItems: 'center' }]}>
          <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 24 }} />
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: sectionCardBackground }]}>
          <IconTitle
            IconComponent={LanguageGlobeIcon}
            title={t('settings.languageRegion.language')}
            description={t('settings.languageRegion.languageDescription')}
            theme={theme}
          />
          <DropdownField
            label={t('settings.languageRegion.languagePreference')}
            value={getLanguageLabel(form.language)}
            onOpenPicker={() => openPicker('language', languageItems, t('settings.languageRegion.selectLanguage'))}
          />

          <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

          <IconTitle
            IconComponent={CountryWorldIcon}
            title={t('settings.languageRegion.countrySettings')}
            description={t('settings.languageRegion.countrySettingsDescription')}
            theme={theme}
          />
          <DropdownField
            label={t('settings.languageRegion.country')}
            value={form.country_name}
            onOpenPicker={() => openPicker('country', countryItems, t('settings.languageRegion.country'))}
          />
          <View style={styles.pairRow}>
            <View style={{ flex: 1 }}>
              <DropdownField
                label={t('settings.languageRegion.timeZone')}
                value={form.timezone}
                onOpenPicker={() => openPicker('timezone', timezoneItems, t('settings.languageRegion.timeZone'))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropdownField
                label={t('settings.languageRegion.dateTimeFormat')}
                value={form.date_format}
                onOpenPicker={() => openPicker('date_format', dateFormatItems, t('settings.languageRegion.dateTimeFormat'))}
              />
            </View>
          </View>
          <View style={styles.pairRow}>
            <View style={{ flex: 1 }}>
              <DropdownField
                label={t('settings.languageRegion.currency')}
                value={form.currency_code ? (form.currency_name ? `${form.currency_code} — ${form.currency_name}` : form.currency_code) : form.currency_name}
                onOpenPicker={() => openPicker('currency', currencyItems, t('settings.languageRegion.currency'))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropdownField
                label={t('settings.languageRegion.telephoneCode')}
                value={form.telephone_code}
                onOpenPicker={() => openPicker('telephone_code', telephoneItems, t('settings.languageRegion.telephoneCode'))}
              />
            </View>
          </View>

          <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

          <IconTitle
            IconComponent={NumberHashIcon}
            title={t('settings.languageRegion.numberFormat')}
            description={t('settings.languageRegion.numberFormatDescription')}
            theme={theme}
          />
          <View style={styles.pairRow}>
            <View style={{ flex: 1 }}>
              <DropdownField
                label={t('settings.languageRegion.numberSeparator')}
                value={form.number_separator ? separatorLabel(form.number_separator, t) : ''}
                onOpenPicker={() => openPicker('number_separator', numSepItems, t('settings.languageRegion.numberSeparator'))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DropdownField
                label={t('settings.languageRegion.decimalSeparator')}
                value={form.decimal_separator ? separatorLabel(form.decimal_separator, t) : ''}
                onOpenPicker={() => openPicker('decimal_separator', decSepItems, t('settings.languageRegion.decimalSeparator'))}
              />
            </View>
          </View>
          <PreviewField label={t('settings.languageRegion.preview')} value={numberPreview} />

          <View style={[styles.innerDivider, { backgroundColor: theme.divider }]} />

          <IconTitle
            IconComponent={NameUserIcon}
            title={t('settings.languageRegion.nameFormat')}
            description={t('settings.languageRegion.nameFormatDescription')}
            theme={theme}
          />
          <DropdownField
            label={t('settings.languageRegion.fullName')}
            value={form.full_name_format ? formatNameFormatLabel(form.full_name_format, t) : ''}
            onOpenPicker={() => openPicker('full_name_format', fullNameItems, t('settings.languageRegion.fullName'))}
          />
          <DropdownField
            label={t('settings.languageRegion.initials')}
            value={form.initials_format ? formatNameFormatLabel(form.initials_format, t) : ''}
            onOpenPicker={() => openPicker('initials_format', initialsItems, t('settings.languageRegion.initials'))}
          />

          <OutlinedField label={t('settings.languageRegion.preview')} bgColor={theme.cardBgSolid}>
            <View style={[styles.namePreview, { backgroundColor: theme.cardBgSolid, borderColor: theme.divider }]}>
              <View style={styles.namePreviewCell}>
                <Text style={[styles.namePreviewValue, { color: theme.text }]}>{fullNamePreview}</Text>
                <View style={[styles.namePreviewLine, { backgroundColor: theme.divider }]} />
                <Text style={[styles.namePreviewCaption, { color: theme.textSecondary }]}>{t('settings.languageRegion.fullName')}</Text>
              </View>
              <View style={[styles.namePreviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.namePreviewCell}>
                <Text style={[styles.namePreviewValue, { color: theme.text }]}>{initialsPreview}</Text>
                <View style={[styles.namePreviewLine, { backgroundColor: theme.divider }]} />
                <Text style={[styles.namePreviewCaption, { color: theme.textSecondary }]}>{t('settings.languageRegion.initials')}</Text>
              </View>
            </View>
          </OutlinedField>
        </View>
      )}

      <PickerModal
        visible={!!picker}
        onClose={() => setPicker(null)}
        onSelect={handleSelect}
        items={picker?.items || []}
        title={picker?.title}
        searchable
      />
    </View>
  );
});

export default LanguageRegionSection;

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 14,
  },
  iconTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconTitleDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 34,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    margin: 0,
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 34,
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 14,
  },
  pairRow: {
    flexDirection: 'row',
    gap: 10,
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
  },
  namePreview: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 14,
  },
  namePreviewCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  namePreviewValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  namePreviewLine: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginTop: 6,
    marginBottom: 6,
  },
  namePreviewCaption: {
    fontSize: 11,
  },
  namePreviewDivider: {
    width: StyleSheet.hairlineWidth,
  },
});
