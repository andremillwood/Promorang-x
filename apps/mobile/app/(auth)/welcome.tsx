import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  TrendingUp, 
  DollarSign, 
  Gift, 
  Users, 
  ChevronRight, 
  Eye,
  Zap,
  Target,
  BarChart3,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Diamond,
  ArrowRight,
  Check,
  Globe,
  Shield,
  Coins
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

// Persona types matching web marketing
type PersonaType = 'creator' | 'shopper' | 'investor' | 'merchant';

interface Persona {
  id: PersonaType;
  label: string;
  emoji: string;
  headline: string;
  highlight: string;
  subheadline: string;
  features: { icon: any; title: string; description: string }[];
  gradient: [string, string];
  stats: { value: string; label: string }[];
}

const PERSONAS: Persona[] = [
  {
    id: 'creator',
    label: 'Creator',
    emoji: '🎨',
    headline: 'Monetize Your',
    highlight: 'Influence',
    subheadline: 'Turn your audience into revenue with high-engagement Drops and viral campaigns.',
    gradient: ['#8B5CF6', '#EC4899'],
    features: [
      { icon: Zap, title: 'Complete Drops', description: 'Quick tasks, instant gems' },
      { icon: DollarSign, title: 'Earn Real Money', description: 'Keep 80% of what you make' },
      { icon: Trophy, title: 'Climb Leaderboards', description: 'Compete for bonus rewards' },
    ],
    stats: [
      { value: '$1,247', label: 'Avg Monthly' },
      { value: '127K+', label: 'Creators' },
      { value: '80%', label: 'You Keep' },
    ],
  },
  {
    id: 'shopper',
    label: 'Shopper',
    emoji: '🛍️',
    headline: 'Shop with',
    highlight: 'Rewards',
    subheadline: 'Earn points through engagement and redeem them for exclusive deals.',
    gradient: ['#10B981', '#3B82F6'],
    features: [
      { icon: Gift, title: 'Exclusive Coupons', description: 'Deals you won\'t find elsewhere' },
      { icon: Coins, title: 'Earn While Shopping', description: 'Points on every purchase' },
      { icon: Star, title: 'VIP Access', description: 'Early drops & flash sales' },
    ],
    stats: [
      { value: '50%', label: 'Avg Savings' },
      { value: '2,400+', label: 'Brands' },
      { value: '∞', label: 'Rewards' },
    ],
  },
  {
    id: 'investor',
    label: 'Investor',
    emoji: '📈',
    headline: 'Invest in',
    highlight: 'Viral Content',
    subheadline: 'Trade social capital and predict viral trends for maximum returns.',
    gradient: ['#3B82F6', '#8B5CF6'],
    features: [
      { icon: BarChart3, title: 'Content Shares', description: 'Own pieces of viral content' },
      { icon: Target, title: 'Forecasts', description: 'Predict & profit from trends' },
      { icon: TrendingUp, title: 'Auto-Invest', description: 'AI-powered portfolio growth' },
    ],
    stats: [
      { value: '32%', label: 'Avg ROI' },
      { value: '$2.4M', label: 'Volume' },
      { value: '24/7', label: 'Markets' },
    ],
  },
  {
    id: 'merchant',
    label: 'Business',
    emoji: '💼',
    headline: 'Scale Your',
    highlight: 'Brand',
    subheadline: 'Deploy word-of-mouth campaigns at scale with precision analytics.',
    gradient: ['#F59E0B', '#EF4444'],
    features: [
      { icon: Users, title: 'Micro-Influencers', description: 'Access 127K+ creators' },
      { icon: Globe, title: 'Viral Campaigns', description: 'Organic reach at scale' },
      { icon: Shield, title: 'Brand Safety', description: 'AI-powered content moderation' },
    ],
    stats: [
      { value: '10x', label: 'ROI vs Ads' },
      { value: '89%', label: 'Engagement' },
      { value: '48hr', label: 'Launch Time' },
    ],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { enterGuestMode, setHasSeenWelcome } = useAuthStore();
  const [activePersona, setActivePersona] = useState<PersonaType>('creator');
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const persona = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

  useEffect(() => {
    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePersonaChange = async (newPersona: PersonaType) => {
    await haptics.selection();
    
    // Fade out
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setActivePersona(newPersona);
      // Fade in
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const handleGetStarted = async () => {
    await haptics.medium();
    setHasSeenWelcome(true);
    router.push('/(auth)/signup');
  };

  const handleLogin = async () => {
    await haptics.light();
    setHasSeenWelcome(true);
    router.push('/(auth)/login');
  };

  const handleGuestMode = async () => {
    await haptics.light();
    setHasSeenWelcome(true);
    enterGuestMode();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={persona.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background Blur Effects */}
        <View style={styles.bgBlur1} />
        <View style={styles.bgBlur2} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.brandName}>Promorang</Text>
          </View>

          {/* Persona Switcher */}
          <View style={styles.personaSwitcher}>
            <Text style={styles.personaLabel}>I am a...</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.personaScroll}
            >
              {PERSONAS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personaChip,
                    activePersona === p.id && styles.personaChipActive
                  ]}
                  onPress={() => handlePersonaChange(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.personaEmoji}>{p.emoji}</Text>
                  <Text style={[
                    styles.personaChipText,
                    activePersona === p.id && styles.personaChipTextActive
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dynamic Hero Content */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <Text style={styles.headline}>
              {persona.headline}{'\n'}
              <Text style={styles.headlineHighlight}>{persona.highlight}</Text>
            </Text>
            <Text style={styles.subheadline}>{persona.subheadline}</Text>
          </Animated.View>

          {/* Live Stats */}
          <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
            {persona.stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Features */}
          <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
            {persona.features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color="#FFF" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={20} color="rgba(255,255,255,0.5)" />
              </View>
            ))}
          </Animated.View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <View style={styles.avatarStack}>
              {['🧑‍🎨', '👩‍💼', '🧑‍💻', '👨‍🎤'].map((emoji, i) => (
                <View key={i} style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0 }]}>
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.socialProofText}>
              <Text style={styles.socialProofHighlight}>127,000+</Text> people are already earning
            </Text>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGetStarted}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>
                  Start as {persona.label}
                </Text>
                <ArrowRight size={22} color={persona.gradient[0]} />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>I have an account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              activeOpacity={0.7}
            >
              <Eye size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.guestButtonText}>Explore as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Shield size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.trustBadgeText}>Bank-level Security</Text>
            </View>
            <View style={styles.trustBadge}>
              <Globe size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.trustBadgeText}>Global Platform</Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  bgBlur1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bgBlur2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  // Persona Switcher
  personaSwitcher: {
    marginBottom: 24,
  },
  personaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textAlign: 'center',
  },
  personaScroll: {
    paddingHorizontal: 0,
    gap: 8,
  },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  personaChipActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  personaEmoji: {
    fontSize: 18,
  },
  personaChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  personaChipTextActive: {
    color: '#FFFFFF',
  },
  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 12,
  },
  headlineHighlight: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  subheadline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  // Features
  featuresSection: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  // Social Proof
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  socialProofText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  socialProofHighlight: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // CTA Section
  ctaSection: {
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  // Trust Badges
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
});