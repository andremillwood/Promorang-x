import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const NativeOnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'merchant' | 'creator'>('consumer');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WELCOME TO PROMORANG</Text>
          <Text style={styles.title}>Choose Your Experience</Text>
          <Text style={styles.subtitle}>Select your primary goal to unlock your first instant reward.</Text>
        </View>

        <View style={styles.roleGrid}>
          {/* Consumer */}
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'consumer' && styles.roleCardActive]}
            onPress={() => setSelectedRole('consumer')}
          >
            <Ionicons name="compass" size={28} color="#a855f7" />
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Local Explorer</Text>
              <Text style={styles.roleDesc}>Discover drops & earn instant cashback nearby.</Text>
            </View>
          </TouchableOpacity>

          {/* Merchant */}
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'merchant' && styles.roleCardActiveMerchant]}
            onPress={() => setSelectedRole('merchant')}
          >
            <Ionicons name="storefront" size={28} color="#f59e0b" />
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Local Merchant</Text>
              <Text style={styles.roleDesc}>Fill off-peak hours & launch tipping drops.</Text>
            </View>
          </TouchableOpacity>

          {/* Creator */}
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'creator' && styles.roleCardActiveCreator]}
            onPress={() => setSelectedRole('creator')}
          >
            <Ionicons name="sparkles" size={28} color="#f43f5e" />
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Creator & Host</Text>
              <Text style={styles.roleDesc}>Share-to-Earn (Promoshare) with 15% commissions.</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={onComplete}>
          <Text style={styles.submitText}>Start Exploring & Claim Bonus</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
  },
  eyebrow: {
    color: '#a855f7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 6,
  },
  roleGrid: {
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    borderColor: '#a855f7',
    backgroundColor: '#2e1065',
  },
  roleCardActiveMerchant: {
    borderColor: '#f59e0b',
    backgroundColor: '#451a03',
  },
  roleCardActiveCreator: {
    borderColor: '#f43f5e',
    backgroundColor: '#4c0519',
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
