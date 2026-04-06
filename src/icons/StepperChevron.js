import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Text from '../components/StyledText';
import Colors from '../constants/colors';

const CHEVRON_WIDTH = 74;
const CHEVRON_HEIGHT = 55;
const NOTCH = 10; // depth of the arrow notch

function ChevronShape({ fill, stroke, strokeWidth = 0, isFirst, isLast }) {
  const w = CHEVRON_WIDTH;
  const h = CHEVRON_HEIGHT;
  const n = NOTCH;
  const sw = strokeWidth;

  // Build path
  let d;
  const leftFlat = `M ${sw} ${sw} L ${w - n} ${sw} L ${w - sw} ${h / 2} L ${w - n} ${h - sw} L ${sw} ${h - sw} Z`;
  const leftNotch = `M ${sw} ${sw} L ${n} ${h / 2} L ${sw} ${h - sw} L ${w - n} ${h - sw} L ${w - sw} ${h / 2} L ${w - n} ${sw} Z`;
  const firstChevron = `M ${sw} ${sw} L ${w - n} ${sw} L ${w - sw} ${h / 2} L ${w - n} ${h - sw} L ${sw} ${h - sw} Z`;
  const lastChevron = `M ${sw} ${sw} L ${n} ${h / 2} L ${sw} ${h - sw} L ${w - sw} ${h - sw} L ${w - sw} ${sw} Z`;
  const middleChevron = leftNotch;

  if (isFirst) d = firstChevron;
  else if (isLast) d = lastChevron;
  else d = middleChevron;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path
        d={d}
        fill={fill}
        stroke={stroke || 'none'}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function StepperChevron({ steps }) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        let fill, stroke, strokeWidth, iconColor, labelColor;
        if (step.completed) {
          fill = Colors.primary + 'BF'; // 75% opacity
          stroke = undefined;
          strokeWidth = 0;
          iconColor = Colors.white;
          labelColor = Colors.primary;
        } else if (step.active) {
          fill = Colors.white;
          stroke = Colors.accent;
          strokeWidth = 2;
          iconColor = Colors.accent;
          labelColor = Colors.accent;
        } else {
          fill = '#D9D9D9';
          stroke = undefined;
          strokeWidth = 0;
          iconColor = '#707070';
          labelColor = Colors.gray;
        }

        return (
          <View key={index} style={[styles.stepItem, index > 0 && { marginLeft: -NOTCH }]}>
            <View style={styles.chevronWrapper}>
              <ChevronShape
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                isFirst={isFirst}
                isLast={isLast}
              />
              <View style={styles.iconOverlay}>
                {step.renderIcon(iconColor)}
              </View>
            </View>
            <Text style={[styles.label, { color: labelColor }]}>{step.label}</Text>
            {step.date ? (
              <Text style={styles.date}>{step.date}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  chevronWrapper: {
    width: CHEVRON_WIDTH,
    height: CHEVRON_HEIGHT,
    position: 'relative',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 2,
  },
});
