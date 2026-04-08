import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Heart,
  ArrowRight,
  ChevronDown,
  Play,
  Gift,
  Target,
  Sparkles,
  Crown,
  Clock,
  UserPlus,
  Wallet,
  GraduationCap,
  ChevronUp,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const tiers = [
  { name: 'Starter', price: 50, popular: false },
  { name: 'Growth', price: 100, popular: true },
  { name: 'Pro', price: 200, popular: false },
  { name: 'Elite', price: 500, popular: false },
];

const benefits = [
  { icon: DollarSign, title: 'Earn Team Bonuses', description: 'Get rewarded when your team succeeds' },
  { icon: GraduationCap, title: 'Free Training', description: 'Access our complete training library' },
  { icon: Users, title: 'Build Your Team', description: 'Grow a network of partners' },
  { icon: Shield, title: 'Full Support', description: 'Mentorship from top performers' },
];

const ranks = [
  { name: 'Partner', icon: '🌟', earnings: '$500-2K/mo' },
  { name: 'Rising Star', icon: '⭐', earnings: '$2K-5K/mo' },
  { name: 'Team Leader', icon: '🌙', earnings: '$5K-15K/mo' },
  { name: 'Director', icon: '🔮', earnings: '$15K-30K/mo' },
  { name: 'Executive', icon: '👑', earnings: '$30K-50K/mo' },
  { name: 'Diamond', icon: '💎', earnings: '$50K+/mo' },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Team Leader',
    quote: "Within 3 months I was earning more than my day job.",
    earnings: '$4,200/mo',
  },
  {
    name: 'Marcus J.',
    role: 'Director',
    quote: "The training helped me build a team of 50+ people.",
    earnings: '$12,500/mo',
  },
];

const faqs = [
  {
    q: 'How does it work?',
    a: 'Share Promorang with others. When they join and subscribe, you earn bonuses. Help your team succeed and earn ongoing rewards.',
  },
  {
    q: 'How much can I earn?',
    a: 'Earnings vary based on effort. Partners typically earn $500-$2,000/month starting out. Top performers earn $10,000-$50,000+ monthly.',
  },
  {
    q: 'Do I need experience?',
    a: 'No! We provide comprehensive training and mentorship. Many top earners started with zero experience.',
  },
  {
    q: 'How do I get paid?',
    a: 'Earnings are calculated weekly and paid after verification. Withdraw to bank, PayPal, or platform credits.',
  },
];

export default function JoinGrowthPartners() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#7c3aed', '#a855f7', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.badge}>
          <Sparkles size={14} color="#7c3aed" />
          <Text style={styles.badgeText}>Growth Partner Program</Text>
        </View>
        
        <Text style={styles.heroTitle}>
          Build Your Future.{'\n'}Help Others Succeed.
        </Text>
        
        <Text style={styles.heroSubtitle}>
          Join thousands earning meaningful income by sharing Promorang with their network.
        </Text>
        
        <View style={styles.heroButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/auth/register?ref=matrix')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight size={18} color="#7c3aed" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Play size={18} color="#fff" />
            <Text style={styles.secondaryButtonText}>Watch Video</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>15K+</Text>
            <Text style={styles.heroStatLabel}>Partners</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>$4.2M+</Text>
            <Text style={styles.heroStatLabel}>Paid Monthly</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>89%</Text>
            <Text style={styles.heroStatLabel}>Retention</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Join?</Text>
        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <benefit.icon size={24} color="#7c3aed" />
              </View>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How It Works */}
      <View style={[styles.section, styles.sectionGray]}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          {[
            { step: 1, title: 'Join', desc: 'Choose your tier' },
            { step: 2, title: 'Learn', desc: 'Complete training' },
            { step: 3, title: 'Share', desc: 'Invite others' },
            { step: 4, title: 'Earn', desc: 'Get weekly bonuses' },
          ].map((item, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{item.step}</Text>
              </View>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Earning Potential */}
      <LinearGradient
        colors={['#581c87', '#7c3aed', '#a855f7']}
        style={styles.earningsSection}
      >
        <Text style={styles.earningsTitle}>Your Earning Potential</Text>
        <Text style={styles.earningsSubtitle}>
          Advance through ranks as you grow your team
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ranksScroll}
        >
          {ranks.map((rank, index) => (
            <View key={index} style={styles.rankCard}>
              <Text style={styles.rankIcon}>{rank.icon}</Text>
              <Text style={styles.rankName}>{rank.name}</Text>
              <Text style={styles.rankEarnings}>{rank.earnings}</Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Tier</Text>
        <Text style={styles.sectionSubtitle}>Start at any level. Upgrade anytime.</Text>
        
        <View style={styles.tiersContainer}>
          {tiers.map((tier, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tierCard,
                selectedTier === index && styles.tierCardSelected,
                tier.popular && styles.tierCardPopular,
              ]}
              onPress={() => setSelectedTier(index)}
            >
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}
              <Text style={styles.tierName}>{tier.name}</Text>
              <View style={styles.tierPriceRow}>
                <Text style={styles.tierPrice}>${tier.price}</Text>
                <Text style={styles.tierPeriod}>/mo</Text>
              </View>
              {selectedTier === index && (
                <CheckCircle size={20} color="#7c3aed" style={styles.tierCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <Button
          title="Get Started Now"
          onPress={() => router.push('/auth/register?ref=matrix')}
          variant="primary"
          style={styles.ctaButton}
        />
      </View>

      {/* Testimonials */}
      <View style={[styles.section, styles.sectionGray]}>
        <Text style={styles.sectionTitle}>Real Partners. Real Results.</Text>
        
        {testimonials.map((testimonial, index) => (
          <Card key={index} style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={styles.testimonialAvatar}>
                <Text style={styles.testimonialInitial}>
                  {testimonial.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.testimonialName}>{testimonial.name}</Text>
                <Text style={styles.testimonialRole}>{testimonial.role}</Text>
              </View>
            </View>
            <Text style={styles.testimonialQuote}>"{testimonial.quote}"</Text>
            <View style={styles.testimonialEarnings}>
              <TrendingUp size={16} color="#16a34a" />
              <Text style={styles.testimonialEarningsText}>{testimonial.earnings}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Questions</Text>
        
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              {expandedFaq === index ? (
                <ChevronUp size={20} color={colors.darkGray} />
              ) : (
                <ChevronDown size={20} color={colors.darkGray} />
              )}
            </View>
            {expandedFaq === index && (
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Final CTA */}
      <LinearGradient
        colors={['#7c3aed', '#a855f7']}
        style={styles.finalCta}
      >
        <Text style={styles.finalCtaTitle}>Ready to Start?</Text>
        <Text style={styles.finalCtaSubtitle}>
          Join thousands building their dream life with Promorang.
        </Text>
        <TouchableOpacity 
          style={styles.finalCtaButton}
          onPress={() => router.push('/auth/register?ref=matrix')}
        >
          <Text style={styles.finalCtaButtonText}>Become a Partner</Text>
          <ArrowRight size={18} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={styles.finalCtaDisclaimer}>
          No commitment. Cancel anytime. 30-day guarantee.
        </Text>
      </LinearGradient>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Income Disclaimer: Results vary based on individual effort. 
          Promorang does not guarantee specific income levels.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    padding: 24,
  },
  sectionGray: {
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  benefitCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    padding: 16,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 12,
    color: colors.darkGray,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  stepItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.darkGray,
    textAlign: 'center',
  },
  earningsSection: {
    padding: 24,
  },
  earningsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  earningsSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  ranksScroll: {
    paddingRight: 24,
  },
  rankCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
  },
  rankIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  rankName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  rankEarnings: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  tiersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  tierCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  tierCardSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
  },
  tierCardPopular: {
    borderColor: '#7c3aed',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -30,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  tierPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.black,
  },
  tierPeriod: {
    fontSize: 14,
    color: colors.darkGray,
  },
  tierCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ctaButton: {
    backgroundColor: '#7c3aed',
  },
  testimonialCard: {
    padding: 16,
    marginBottom: 12,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testimonialInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  testimonialName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  testimonialRole: {
    fontSize: 12,
    color: '#7c3aed',
  },
  testimonialQuote: {
    fontSize: 14,
    color: colors.darkGray,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  testimonialEarnings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testimonialEarningsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 12,
    lineHeight: 20,
  },
  finalCta: {
    padding: 32,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  finalCtaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  finalCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  finalCtaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
  },
  finalCtaDisclaimer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  disclaimer: {
    padding: 16,
    backgroundColor: '#1f2937',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 100,
  },
});
