import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MobilePromoCardProps {
  availableBalance?: number;
  monthlyLimit?: number;
  tier?: string;
  cycleDaysRemaining?: number;
  onScanPress?: () => void;
}

const { width } = Dimensions.get("window");

export const MobilePromoCard: React.FC<MobilePromoCardProps> = ({
  availableBalance = 45.0,
  monthlyLimit = 50.0,
  tier = "Platinum Tier",
  cycleDaysRemaining = 14,
  onScanPress,
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* 3D Black Card Surface */}
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="card" size={18} color="#000" />
            </View>
            <View>
              <Text style={styles.brandTitle}>PROMORANG CARD</Text>
              <Text style={styles.tierSubtitle}>{tier}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => {
              setShowQRModal(true);
              if (onScanPress) onScanPress();
            }}
          >
            <Ionicons name="qr-code-outline" size={16} color="#FFB800" />
            <Text style={styles.qrButtonText}>In-Store QR</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>ACTIVE SPENDING POWER</Text>
          <View style={styles.amountRow}>
            <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)}</Text>
            <Text style={styles.limitText}>of ${monthlyLimit.toFixed(2)} limit</Text>
          </View>
          <View style={styles.acceptedRow}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.acceptedText}>Accepted at 35+ partner venues</Text>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>CARD NUMBER</Text>
            <Text style={styles.cardNumber}>•••• •••• •••• 8842</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.footerLabel}>CYCLE RESETS</Text>
            <Text style={styles.resetDays}>{cycleDaysRemaining} Days</Text>
          </View>
        </View>
      </View>

      {/* In-Store QR Modal */}
      <Modal visible={showQRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Present to Cashier</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeBox}>
              <Ionicons name="qr-code" size={180} color="#000" />
              <Text style={styles.qrCardNumber}>•••• •••• •••• 8842</Text>
            </View>

            <Text style={styles.modalBalance}>
              Available Credit: ${availableBalance.toFixed(2)}
            </Text>
            <Text style={styles.modalInstructions}>
              Cashier scans this code to apply your PromoCard discount. Settle remainder with regular payment.
            </Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#0D0D11",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 0, 0.3)",
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFB800",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  tierSubtitle: {
    color: "#FFB800",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  qrButtonText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  balanceContainer: {
    marginVertical: 20,
  },
  balanceLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  balanceAmount: {
    color: "#FFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
  },
  limitText: {
    color: "#888",
    fontSize: 12,
  },
  acceptedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  acceptedText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 14,
  },
  footerLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardNumber: {
    color: "#CCC",
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  resetDays: {
    color: "#FFB800",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: width - 48,
    backgroundColor: "#121217",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  qrCodeBox: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginVertical: 10,
  },
  qrCardNumber: {
    color: "#333",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 8,
  },
  modalBalance: {
    color: "#FFB800",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 14,
  },
  modalInstructions: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 16,
  },
  doneButton: {
    backgroundColor: "#FFF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
});
