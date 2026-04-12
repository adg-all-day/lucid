import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import useTheme from '../../../hooks/useTheme';
import ModalBlurBackdrop from '../../../components/ModalBlurBackdrop';

export default function TransactionOverlayShell({
  visible,
  position = 'center',
  dismissible = true,
  onClose,
  blurTarget = null,
  children,
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissible ? onClose : undefined}>
      <Pressable
        style={[
          styles.overlay,
          position === 'topRight' ? styles.overlayTopRight : styles.overlayCenter,
        ]}
        onPress={dismissible ? onClose : undefined}
      >
        <ModalBlurBackdrop isDark={theme.isDark} blurTarget={blurTarget} />
        <Pressable onPress={(event) => event.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    overflow: 'hidden',
  },
  overlayCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayTopRight: {
    justifyContent: 'flex-start',
    paddingTop: 172,
    paddingRight: 10,
    alignItems: 'flex-end',
  },
});
