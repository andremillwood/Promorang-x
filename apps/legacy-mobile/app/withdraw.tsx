import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { useWalletStore } from '@/store/walletStore';
import { DollarSign, CreditCard, Smartphone } from 'lucide-react-native';
import colors from '@/constants/colors';
import { safeBack } from '@/lib/navigation';

export default function WithdrawScreen() {
  const router = useRouter();
  const { balance, withdraw, isLoading } = useWalletStore();

  const [activeMethod, setActiveMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [errors, setErrors] = useState({
    amount: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      amount: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
    };

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue)) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (amountValue <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
      isValid = false;
    } else if (amountValue > balance) {
      newErrors.amount = 'Amount exceeds your available balance';
      isValid = false;
    }

    if (activeMethod === 'bank') {
      if (!accountName) {
        newErrors.accountName = 'Account name is required';
        isValid = false;
      }

      if (!accountNumber) {
        newErrors.accountNumber = 'Account number is required';
        isValid = false;
      }

      if (!bankName) {
        newErrors.bankName = 'Bank name is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleWithdraw = async () => {
    if (!validateForm()) return;

    try {
      await withdraw(parseFloat(amount), activeMethod);
      Alert.alert(
        'Withdrawal Initiated',
        `Your withdrawal of $${amount} has been initiated and will be processed soon.`,
        [{ text: 'OK', onPress: () => safeBack(router) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    }
  };

  const methods = [
    { key: 'bank', label: 'Bank Transfer' },
    { key: 'paypal', label: 'PayPal' },
    { key: 'crypto', label: 'Cryptocurrency' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Withdraw Funds</Text>

        <TabBar
          tabs={methods}
          activeTab={activeMethod}
          onTabChange={setActiveMethod}
          variant="pills"
          containerStyle={styles.methodTabs}
        />

        <Input
          label="Amount to Withdraw"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          leftIcon={<DollarSign size={20} color={colors.darkGray} />}
          error={errors.amount}
        />

        {activeMethod === 'bank' && (
          <>
            <Input
              label="Account Name"
              placeholder="Enter account holder name"
              value={accountName}
              onChangeText={setAccountName}
              error={errors.accountName}
            />

            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              error={errors.accountNumber}
            />

            <Input
              label="Bank Name"
              placeholder="Enter bank name"
              value={bankName}
              onChangeText={setBankName}
              error={errors.bankName}
            />
          </>
        )}

        {activeMethod === 'paypal' && (
          <Input
            label="PayPal Email"
            placeholder="Enter PayPal email address"
            keyboardType="email-address"
            leftIcon={<CreditCard size={20} color={colors.darkGray} />}
          />
        )}

        {activeMethod === 'crypto' && (
          <Input
            label="Wallet Address"
            placeholder="Enter cryptocurrency wallet address"
            leftIcon={<Smartphone size={20} color={colors.darkGray} />}
          />
        )}

        <Text style={styles.feeNote}>
          Note: A small processing fee may apply depending on the withdrawal method.
        </Text>

        <Button
          title="Withdraw Funds"
          onPress={handleWithdraw}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          style={styles.withdrawButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
    padding: 16,
  },
  balanceCard: {
    marginBottom: 16,
    alignItems: 'center',
    padding: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
  },
  formCard: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  methodTabs: {
    marginBottom: 16,
  },
  feeNote: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  withdrawButton: {
    width: '100%',
  },
});