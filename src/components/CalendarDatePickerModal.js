import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './StyledText';
import Colors from '../constants/colors';
import useTheme from '../hooks/useTheme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatHeaderDate(date) {
  const month = MONTHS[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  return `${month} ${day}, ${date.getFullYear()}`;
}

function buildCalendarDays(visibleMonth) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < offset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function CalendarDatePickerModal({
  visible,
  value,
  onCancel,
  onConfirm,
  minimumDate,
}) {
  const theme = useTheme();
  const sheetBackgroundColor = theme.isDark ? '#2B2B2B' : theme.cardBg;
  const sheetBorderColor = theme.isDark ? 'rgba(255,255,255,0.08)' : theme.divider;
  const today = useMemo(() => startOfDay(new Date()), []);
  const normalizedMinimumDate = minimumDate ? startOfDay(minimumDate) : null;
  const initialValue = value ? startOfDay(value) : today;
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialValue.getFullYear(), initialValue.getMonth(), 1),
  );

  useEffect(() => {
    if (!visible) return;
    const nextValue = value ? startOfDay(value) : today;
    setSelectedDate(nextValue);
    setVisibleMonth(new Date(nextValue.getFullYear(), nextValue.getMonth(), 1));
  }, [visible, value, today]);

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  const canGoToPreviousMonth = useMemo(() => {
    if (!normalizedMinimumDate) return true;
    const previousMonthLastDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      0,
    );
    return previousMonthLastDay >= normalizedMinimumDate;
  }, [normalizedMinimumDate, visibleMonth]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: sheetBackgroundColor, borderColor: sheetBorderColor },
          ]}
        >
          <Text style={[styles.label, { color: theme.textSecondary }]}>SELECT DATE</Text>
          <Text style={[styles.selectedText, { color: theme.text }]}>
            {selectedDate ? formatHeaderDate(selectedDate) : '__ __'}
          </Text>

          <View style={styles.monthRow}>
            <TouchableOpacity
              style={styles.monthButton}
              disabled={!canGoToPreviousMonth}
              onPress={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={canGoToPreviousMonth ? theme.iconMuted : theme.divider}
              />
            </TouchableOpacity>

            <Text style={[styles.monthText, { color: theme.text }]}>
              {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                )
              }
            >
              <Ionicons name="chevron-forward" size={18} color={theme.iconMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((day, index) => (
              <Text key={`${day}-${index}`} style={[styles.weekday, { color: theme.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const disabled = normalizedMinimumDate
                ? startOfDay(day) < normalizedMinimumDate
                : false;
              const selected = isSameDay(day, selectedDate);

              return (
                <Pressable
                  key={day.toISOString()}
                  style={({ pressed }) => [
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                    pressed && !disabled && styles.dayCellPressed,
                  ]}
                  hitSlop={4}
                  disabled={disabled}
                  onPress={() => setSelectedDate(startOfDay(day))}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: disabled ? theme.divider : theme.textSecondary },
                      selected && { color: Colors.primary },
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.footerAction}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(selectedDate)}>
              <Text style={styles.footerAction}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 352,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 18,
  },
  selectedText: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 20,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(91, 95, 199, 0.10)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayCellPressed: {
    backgroundColor: 'rgba(91, 95, 199, 0.05)',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 28,
  },
  footerAction: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
