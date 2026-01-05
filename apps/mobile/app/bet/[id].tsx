import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useBetStore } from '@/store/betStore';
import colors from '@/constants/colors';

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bets, myBets, placeBet, isLoading } = useBetStore();
  const [betAmount, setBetAmount] = useState('10');
  const [prediction, setPrediction] = useState(true); // true = will reach target, false = won't reach
  const [placing, setPlacing] = useState(false);

  // Find the bet in either bets or myBets
  const bet = [...bets, ...myBets].find(b => b.id === id);
  const isPlaced = myBets.some(b => b.id === id);

  if (!bet) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Bet not found</Text>
      </View>
    );
  }

  const progress = bet.currentValue / bet.target.value;
  const timeLeft = new Date(bet.expiresAt).getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '#E1306C';
      case 'tiktok':
        return '#000000';
      case 'twitter':
        return '#1DA1F2';
      case 'facebook':
        return '#4267B2';
      default:
        return colors.darkGray;
    }
  };

  const handlePlaceBet = async () => {
    if (isNaN(Number(betAmount)) || Number(betAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bet amount.');
      return;
    }

    setPlacing(true);
    try {
      await placeBet(bet.id, Number(betAmount), prediction);
      Alert.alert('Success', 'Your bet has been placed successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to place bet. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleCreatorPress = () => {
    router.push(`/profile/${bet.creator.id}`);
  };

  const calculatePotentialWinnings = () => {
    const amount = Number(betAmount) || 0;
    return (amount * bet.odds).toFixed(2);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{bet.title}</Text>
          <View
            style={[
              styles.platformBadge,
              { backgroundColor: getPlatformColor(bet.target.platform) },
            ]}
          >
            <Text style={styles.platformText}>{bet.target.platform}</Text>
          </View>
        </View>

        <View style={styles.creatorContainer}>
          <Avatar
            source={bet.creator.avatar}
            size="md"
            name={bet.creator.name}
          />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{bet.creator.name}</Text>
            <Text style={styles.creatorRole}>Bet Creator</Text>
          </View>
          <Button
            title="View Profile"
            variant="outline"
            size="sm"
            onPress={handleCreatorPress}
          />
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{bet.description}</Text>

        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {bet.currentValue.toLocaleString()} / {bet.target.value.toLocaleString()} {bet.target.metric}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <ProgressBar progress={progress} height={8} />
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <DollarSign size={20} color={colors.success} />
            <Text style={styles.metaLabel}>Pool</Text>
            <Text style={styles.metaValue}>${bet.pool}</Text>
          </View>
          <View style={styles.metaItem}>
            <TrendingUp size={20} color={colors.primary} />
            <Text style={styles.metaLabel}>Odds</Text>
            <Text style={styles.metaValue}>{bet.odds}x</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={20} color={colors.darkGray} />
            <Text style={styles.metaLabel}>Participants</Text>
            <Text style={styles.metaValue}>{bet.participants}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.timeContainer}>
          <Clock size={20} color={daysLeft <= 1 ? colors.error : colors.warning} />
          <Text style={[
            styles.timeText,
            { color: daysLeft <= 1 ? colors.error : colors.warning }
          ]}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left to place your bet
          </Text>
        </View>
      </Card>

      {!isPlaced && (
        <Card style={styles.betCard}>
          <Text style={styles.betTitle}>Place Your Bet</Text>
          
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionLabel}>Your Prediction:</Text>
            <View style={styles.predictionButtons}>
              <Button
                title="Will Reach"
                variant={prediction ? "primary" : "outline"}
                size="sm"
                onPress={() => setPrediction(true)}
                style={[styles.predictionButton, prediction && styles.activePrediction]}
              />
              <Button
                title="Won't Reach"
                variant={!prediction ? "primary" : "outline"}
                size="sm"
                onPress={() => setPrediction(false)}
                style={[styles.predictionButton, !prediction && styles.activePrediction]}
              />
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Bet Amount:</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={betAmount}
                onChangeText={setBetAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
              />
            </View>
          </View>

          <View style={styles.winningsContainer}>
            <Text style={styles.winningsLabel}>Potential Winnings:</Text>
            <Text style={styles.winningsValue}>${calculatePotentialWinnings()}</Text>
          </View>

          <Button
            title="Place Bet"
            onPress={handlePlaceBet}
            variant="primary"
            size="lg"
            isLoading={placing}
            style={styles.betButton}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  notFound: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: colors.darkGray,
  },
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  platformText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  creatorRole: {
    fontSize: 12,
    color: colors.darkGray,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}10`,
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  betCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
  },
  betTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  predictionContainer: {
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  predictionButtons: {
    flexDirection: 'row',
  },
  predictionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activePrediction: {
    backgroundColor: colors.primary,
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    color: colors.darkGray,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 18,
    color: colors.black,
  },
  winningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  winningsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  winningsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  betButton: {
    width: '100%',
  },
});