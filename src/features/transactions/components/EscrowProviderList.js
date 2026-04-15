import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';

export default function EscrowProviderList({ providers, selectedId, onSelect, cardMode = false }) {
  if (cardMode) {
    return (
      <View style={styles.cardGrid}>
        {providers.map((provider) => {
          const selected = selectedId === provider.id;

          return (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              activeOpacity={0.85}
              onPress={() => onSelect(provider.id)}
            >
              <View style={[styles.radio, selected && styles.radioActive]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={[styles.providerLogo, { color: provider.color }]}>{provider.logo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.listWrap}>
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator contentContainerStyle={styles.listContent}>
        {providers.map((provider) => {
          const selected = selectedId === provider.id;

          return (
            <TouchableOpacity
              key={provider.id}
              style={styles.listRow}
              activeOpacity={0.85}
              onPress={() => onSelect(provider.id)}
            >
              <View style={[styles.bankMark, { backgroundColor: provider.color || Colors.primary }]}>
                <Ionicons name={provider.icon || 'business'} size={9} color={Colors.white} />
              </View>
              <Text style={styles.bankName}>{provider.name}</Text>
              <View style={[styles.radio, selected && styles.radioActive]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    maxHeight: 138,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 22,
  },
  listContent: {
    paddingRight: 6,
  },
  listRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    gap: 10,
  },
  bankMark: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    flex: 1,
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  radio: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 26,
    marginBottom: 72,
  },
  providerCard: {
    width: '23%',
    minWidth: 83,
    height: 32,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 5,
  },
  providerLogo: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
  },
});
