// drag to reorder counterparties.. uses gesture handler + reanimated
import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const SPRING_CONFIG = { damping: 20, stiffness: 200 };

export default function DraggableCounterpartyList({
  data,
  renderItem,
  onReorder,
  itemHeight,
  firstItemFixed = true,
}) {
  const [heights, setHeights] = useState({});
  const draggingIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);

  const getItemOffset = useCallback(
    (index) => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += (heights[i] || itemHeight) + 14; // 14 = marginBottom
      }
      return offset;
    },
    [heights, itemHeight]
  );

  const handleLayout = useCallback((index, height) => {
    setHeights((prev) => {
      if (prev[index] === height) return prev;
      return { ...prev, [index]: height };
    });
  }, []);

  const handleReorder = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex !== toIndex && toIndex >= 0 && toIndex < data.length) {
        onReorder(fromIndex, toIndex);
      }
    },
    [data.length, onReorder]
  );

  return (
    <View style={{ position: 'relative' }}>
      {data.map((item, index) => (
        <DraggableItem
          key={index}
          index={index}
          totalItems={data.length}
          draggingIndex={draggingIndex}
          dragY={dragY}
          heights={heights}
          itemHeight={itemHeight}
          onLayout={handleLayout}
          onReorder={handleReorder}
          getItemOffset={getItemOffset}
          firstItemFixed={firstItemFixed}
        >
          {renderItem(item, index)}
        </DraggableItem>
      ))}
    </View>
  );
}

function DraggableItem({
  children,
  index,
  totalItems,
  draggingIndex,
  dragY,
  heights,
  itemHeight,
  onLayout,
  onReorder,
  getItemOffset,
  firstItemFixed = true,
}) {
  const startY = useSharedValue(0);
  const isDraggable = firstItemFixed ? index > 0 : true;
  const minIndex = firstItemFixed ? 1 : 0;

  const gesture = Gesture.Pan()
    .enabled(isDraggable)
    .activateAfterLongPress(200)
    .onStart(() => {
      draggingIndex.value = index;
      startY.value = 0;
      dragY.value = 0;
    })
    .onUpdate((e) => {
      dragY.value = e.translationY;
    })
    .onEnd(() => {
      const currentItemH = (heights[index] || itemHeight) + 14;
      const moved = Math.round(dragY.value / currentItemH);
      const newIndex = Math.max(minIndex, Math.min(totalItems - 1, index + moved));
      draggingIndex.value = -1;
      dragY.value = 0;
      if (newIndex !== index) {
        runOnJS(onReorder)(index, newIndex);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isDragging = draggingIndex.value === index;
    return {
      zIndex: isDragging ? 100 : 1,
      elevation: isDragging ? 10 : 0,
      opacity: isDragging ? 0.9 : 1,
      transform: [
        {
          translateY: isDragging ? dragY.value : withSpring(0, SPRING_CONFIG),
        },
        {
          scale: isDragging ? withSpring(1.02, SPRING_CONFIG) : withSpring(1, SPRING_CONFIG),
        },
      ],
      shadowColor: isDragging ? '#000' : 'transparent',
      shadowOffset: { width: 0, height: isDragging ? 4 : 0 },
      shadowOpacity: isDragging ? 0.2 : 0,
      shadowRadius: isDragging ? 8 : 0,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      onLayout={(e) => onLayout(index, e.nativeEvent.layout.height)}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
