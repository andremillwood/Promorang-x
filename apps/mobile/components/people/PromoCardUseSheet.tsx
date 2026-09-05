import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/DesignTokens';

type PromoCardUseSheetProps = {
  visible: boolean;
  onClose: () => void;
  holder: string;
  available: string;
  useCode: string;
};

function UseMark({ value }: { value: string }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const QRCode = require('react-native-qrcode-svg').default;
    return <QRCode value={value} size={176} />;
  } catch {
    return <Ionicons name="qr-code" size={176} color="#111" />;
  }
}

export function PromoCardUseSheet({
  visible,
  onClose,
  holder,
  available,
  useCode,
}: PromoCardUseSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <View>
              <Text style={styles.kicker}>IN STORE</Text>
              <Text style={styles.title}>Present to cashier</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={20} color={Colors.white} />
            </Pressable>
          </View>
          <Text style={styles.copy}>
            Show this code at a participating checkout to apply eligible PromoCard value. Pay any remainder normally.
          </Text>
          <View style={styles.qr}>
            <UseMark value={useCode} />
            <Text style={styles.code}>{useCode}</Text>
          </View>
          <Text style={styles.balance}>Available: {available}</Text>
          <Text style={styles.holder}>{holder}</Text>
          <Text style={styles.note}>Not a loan. No cash repayment. Offer and minimum spend are shown before checkout.</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.done}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    borderRadius: 28,
    backgroundColor: '#121217',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 22,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { color: '#F6D48A', fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
  title: { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 4 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 10 },
  qr: {
    marginTop: 18,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  code: { marginTop: 10, color: '#222', fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '800', letterSpacing: 1.4 },
  balance: { color: '#F6D48A', fontSize: 16, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  holder: { color: Colors.gray[400], fontSize: 12, textAlign: 'center', marginTop: 4 },
  note: { color: Colors.gray[500], fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 10 },
  done: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: Colors.black, fontSize: 14, fontWeight: '800' },
});
