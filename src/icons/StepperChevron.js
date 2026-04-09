import React, { useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Text from '../components/StyledText';
import Colors from '../constants/colors';

const MAX_CHEVRON_WIDTH = 73;
const MIN_CHEVRON_WIDTH = 60;
const MAX_NOTCH = 12;
const MIN_NOTCH = 10;
const CHEVRON_ASPECT_RATIO = 1.925;

function ChevronShape({ fill, stroke, strokeWidth = 0, opacity = 1, isFirst, isLast, width, height, notch }) {
  const w = width;
  const h = height;
  const n = notch;
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
        opacity={opacity}
      />
    </Svg>
  );
}

export default function StepperChevron({ steps }) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const stepCount = Math.max(steps.length, 1);

  const { chevronWidth, chevronHeight, notch, columnWidth } = useMemo(() => {
    const fallbackWidth = screenWidth - 48;
    const availableWidth = Math.max(containerWidth || fallbackWidth, stepCount * MIN_CHEVRON_WIDTH);
    const computedColumnWidth = Math.floor(availableWidth / stepCount);
    const computedWidth = Math.floor((availableWidth + MAX_NOTCH * (stepCount - 1)) / stepCount);
    const width = Math.max(MIN_CHEVRON_WIDTH, Math.min(MAX_CHEVRON_WIDTH, computedWidth));
    const height = Math.round(width / CHEVRON_ASPECT_RATIO);
    const dynamicNotch = Math.max(MIN_NOTCH, Math.min(MAX_NOTCH, Math.round(width * 0.14)));

    return {
      chevronWidth: width,
      chevronHeight: height,
      notch: dynamicNotch,
      columnWidth: computedColumnWidth,
    };
  }, [containerWidth, screenWidth, stepCount]);

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth && nextWidth !== containerWidth) {
          setContainerWidth(nextWidth);
        }
      }}
    >
      {steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        let fill, stroke, strokeWidth, opacity, iconColor, labelColor;
        if (step.completed) {
          fill = '#8487D5';
          stroke = '#8487D5';
          strokeWidth = 2;
          opacity = 1;
          iconColor = Colors.white;
          labelColor = Colors.primary;
        } else if (step.active) {
          fill = Colors.white;
          stroke = Colors.accent;
          strokeWidth = 2;
          opacity = 1;
          iconColor = Colors.accent;
          labelColor = Colors.accent;
        } else {
          fill = '#D9D9D9';
          stroke = '#D9D9D9';
          strokeWidth = 2;
          opacity = 1;
          iconColor = '#707070';
          labelColor = Colors.gray;
        }

        return (
          <View key={index} style={[styles.stepItem, { width: columnWidth }]}>
            <View
              style={[
                styles.chevronWrapper,
                { width: chevronWidth, height: chevronHeight },
                index > 0 && { marginLeft: -(notch - 4) },
              ]}
            >
              <ChevronShape
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
                isFirst={isFirst}
                isLast={isLast}
                width={chevronWidth}
                height={chevronHeight}
                notch={notch}
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
  },
  chevronWrapper: {
    position: 'relative',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  },
});
