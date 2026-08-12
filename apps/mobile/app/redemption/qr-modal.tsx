import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '@/constants/DesignTokens';

type QRModalProps = {
  visible: boolean;
  onClose: () => void;
  couponCode: string;
  title: string;
  merchantName: string;
  expiresInSeconds?: number;
};

export default function QRRedemptionModal({
  visible,
  onClose,
  couponCode,
  title,
  merchantName,
  expiresInSeconds = 900
}: QRModalProps) {
  const [timeLeft] = useState(expiresInSeconds);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.eyebrow}>IN-PERSON CHECK-IN</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.merchant}>{merchantName}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>

          {/* QR Code Presentation */}
          <View style={styles.qrContainer}>
            <View style={styles.qrFrame}>
              <QRCode value={couponCode || 'PROMORANG-COUPON-SAMPLE'} size={180} color="#000000" backgroundColor="#FFFFFF" />
            </View>
            <Text style={styles.codeText}>{couponCode || 'PROM-8842-GOLD'}</Text>
          </View>

          {/* Expiry Clock Bar */}
          <View style={styles.clockBar}>
            <Ionicons name="time-outline" size={16} color="#FFD700" />
            <Text style={styles.clockText}>
              Expires in <Text style={styles.clockHighlight}>{minutes}:{seconds < 10 ? '0' : ''}{seconds}</Text>
            </Text>
          </View>

          {/* Action Button */}
          <Pressable onPress={onClose} style={styles.actionBtn}>
            <Text style={styles.actionText}>Done / Check-In Verified</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#131313', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTextWrap: { flex: 1 },
  eyebrow: { fontFamily: 'SpaceMono', color: '#FFD700', fontSize: 10, letterSpacing: 1 },
  title: { color: 'white', fontSize: 20, fontWeight: '900', marginTop: 4 },
  merchant: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222225', alignItems: 'center', justifyContent: 'center' },
  qrContainer: { alignItems: 'center', marginVertical: 12 },
  qrFrame: { padding: 16, backgroundColor: 'white', borderRadius: 20, shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  codeText: { fontFamily: 'SpaceMono', color: '#FFD700', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginTop: 16 },
  clockBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 12, paddingVertical: 10, marginVertical: 16, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  clockText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  clockHighlight: { color: '#FFD700', fontWeight: '900' },
  actionBtn: { backgroundColor: '#FFD700', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  actionText: { color: Colors.black, fontSize: 14, fontWeight: '900' }
});
