import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';

function getFieldColors(theme, isFocused, hasValue) {
  const borderColor = hasValue || isFocused
    ? Colors.primary
    : theme.isDark
      ? 'rgba(255,255,255,0.2)'
      : '#E3E3E3';

  return {
    borderColor,
    backgroundColor: theme.inputBg,
    textColor: theme.text,
    placeholderColor: theme.textSecondary,
    iconColor: theme.iconMuted,
  };
}

export default function AuthField({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  icon,
  trailing,
  keyboardType,
  autoCapitalize = 'none',
  autoFocus = false,
  highlighted = false,
  trailingContainerStyle,
  labelStyle,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }, labelStyle]}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          const colors = getFieldColors(theme, isFocused, Boolean(value?.length));

          return (
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor,
              },
              isFocused && styles.inputWrapActive,
              isFocused && !theme.isDark && styles.inputWrapActiveShadow,
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textColor }]}
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              placeholderTextColor={colors.placeholderColor}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              autoFocus={autoFocus}
            />
            {icon ? (
              <View style={styles.iconWrap}>
                <Ionicons name={icon} size={18} color={colors.iconColor} />
              </View>
            ) : null}
            {trailing ? (
              <TouchableOpacity style={[styles.iconWrap, trailingContainerStyle]}>{trailing}</TouchableOpacity>
            ) : null}
          </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrap: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapActive: {
    borderColor: Colors.primary,
  },
  inputWrapActiveShadow: {
    boxShadow: '0px 0px 5px 0px #2375C1CC',
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: '100%',
    fontFamily: 'Satoshi-Regular',
  },
  iconWrap: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
