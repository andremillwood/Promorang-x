import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Clock, DollarSign, Users } from 'lucide-react-native';
import { Transaction } from '@/types';
import colors from '@/constants/colors';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
}) => {
  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'earning':
        return <ArrowDownLeft size={20} color={colors.success} />;
      case 'withdrawal':
        return <ArrowUpRight size={20} color={colors.primary} />;
      case 'investment':
        return <DollarSign size={20} color={colors.info} />;
      case 'referral':
        return <Users size={20} color={colors.success} />;
      default:
        return <DollarSign size={20} color={colors.darkGray} />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.darkGray;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{getTypeIcon()}</View>
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.metaContainer}>
          <View style={styles.dateContainer}>
            <Clock size={12} color={colors.darkGray} />
            <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor()}20` },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor() }]}
            >
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          {
            color:
              transaction.type === 'withdrawal'
                ? colors.error
                : colors.success,
          },
        ]}
      >
        {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});