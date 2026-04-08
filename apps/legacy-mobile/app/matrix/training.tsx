import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Lock,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import colors from '@/constants/colors';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  is_required: boolean;
  is_completed: boolean;
  is_locked: boolean;
  score?: number;
}

const mockModules: TrainingModule[] = [
  {
    id: '1',
    title: 'Matrix Fundamentals',
    description: 'Learn the basics of the Promorang Matrix compensation system',
    duration_minutes: 30,
    is_required: true,
    is_completed: true,
    is_locked: false,
    score: 95,
  },
  {
    id: '2',
    title: 'Recruiting Best Practices',
    description: 'How to effectively recruit and onboard new team members',
    duration_minutes: 45,
    is_required: true,
    is_completed: true,
    is_locked: false,
    score: 88,
  },
  {
    id: '3',
    title: 'Support & Retention',
    description: 'Strategies for supporting your team and maintaining retention',
    duration_minutes: 40,
    is_required: false,
    is_completed: true,
    is_locked: false,
    score: 92,
  },
  {
    id: '4',
    title: 'Leadership Development',
    description: 'Advanced leadership skills for building a successful team',
    duration_minutes: 60,
    is_required: false,
    is_completed: false,
    is_locked: false,
  },
  {
    id: '5',
    title: 'Compliance & Ethics',
    description: 'Understanding compliance requirements and ethical practices',
    duration_minutes: 25,
    is_required: true,
    is_completed: true,
    is_locked: false,
    score: 100,
  },
  {
    id: '6',
    title: 'Advanced Compensation',
    description: 'Deep dive into rank advancement and bonus structures',
    duration_minutes: 50,
    is_required: false,
    is_completed: false,
    is_locked: true,
  },
];

export default function MatrixTraining() {
  const router = useRouter();
  const [modules] = useState<TrainingModule[]>(mockModules);

  const completedCount = modules.filter(m => m.is_completed).length;
  const requiredCompleted = modules.filter(m => m.is_required && m.is_completed).length;
  const requiredTotal = modules.filter(m => m.is_required).length;
  const progress = completedCount / modules.length;

  const handleModulePress = (module: TrainingModule) => {
    if (module.is_locked) return;
    // Navigate to module detail/video player
    console.log('Open module:', module.id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Header */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressIcon}>
            <Award size={24} color={colors.primary} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Training Progress</Text>
            <Text style={styles.progressSubtitle}>
              {completedCount} of {modules.length} modules completed
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={progress} 
          height={10} 
          progressColor={colors.primary}
          style={styles.progressBar}
        />
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={styles.progressStatText}>
              {requiredCompleted}/{requiredTotal} Required
            </Text>
          </View>
          <View style={styles.progressStat}>
            <Clock size={16} color={colors.darkGray} />
            <Text style={styles.progressStatText}>
              ~{modules.filter(m => !m.is_completed).reduce((acc, m) => acc + m.duration_minutes, 0)} min remaining
            </Text>
          </View>
        </View>
      </Card>

      {/* Modules List */}
      <Text style={styles.sectionTitle}>Training Modules</Text>
      
      {modules.map((module) => (
        <TouchableOpacity
          key={module.id}
          onPress={() => handleModulePress(module)}
          disabled={module.is_locked}
          activeOpacity={0.7}
        >
          <Card style={StyleSheet.flatten([styles.moduleCard, module.is_locked && styles.lockedCard])}>
            <View style={styles.moduleHeader}>
              <View style={[
                styles.moduleIcon,
                module.is_completed && styles.completedIcon,
                module.is_locked && styles.lockedIcon,
              ]}>
                {module.is_locked ? (
                  <Lock size={20} color={colors.darkGray} />
                ) : module.is_completed ? (
                  <CheckCircle size={20} color="#fff" />
                ) : (
                  <Play size={20} color={colors.primary} />
                )}
              </View>
              <View style={styles.moduleInfo}>
                <View style={styles.moduleTitleRow}>
                  <Text style={[styles.moduleTitle, module.is_locked && styles.lockedText]}>
                    {module.title}
                  </Text>
                  {module.is_required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.moduleDescription, module.is_locked && styles.lockedText]}>
                  {module.description}
                </Text>
                <View style={styles.moduleMeta}>
                  <Clock size={12} color={colors.darkGray} />
                  <Text style={styles.moduleMetaText}>{module.duration_minutes} min</Text>
                  {module.is_completed && module.score && (
                    <>
                      <Text style={styles.moduleMetaDot}>•</Text>
                      <Text style={styles.moduleScore}>Score: {module.score}%</Text>
                    </>
                  )}
                </View>
              </View>
              {!module.is_locked && (
                <ChevronRight size={20} color={colors.darkGray} />
              )}
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  progressCard: {
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfo: {
    marginLeft: 12,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  progressSubtitle: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 2,
  },
  progressBar: {
    marginBottom: 12,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressStatText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  moduleCard: {
    padding: 16,
    marginBottom: 12,
  },
  lockedCard: {
    opacity: 0.6,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    backgroundColor: colors.success,
  },
  lockedIcon: {
    backgroundColor: colors.lightGray,
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  lockedText: {
    color: colors.darkGray,
  },
  requiredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  moduleDescription: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 6,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  moduleMetaDot: {
    color: colors.darkGray,
    marginHorizontal: 4,
  },
  moduleScore: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  bottomSpacer: {
    height: 40,
  },
});
