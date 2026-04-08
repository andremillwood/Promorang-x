import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft, Chrome, User, Briefcase, Star } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import colors from '@/constants/colors';
import { safeBack } from '@/lib/navigation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, demoLogin, isLoading } = useAuthStore();
  const { setMaturityState } = useMaturityStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for expo-auth-session logic
    Alert.alert('Google Auth', 'Google login integration coming in next step!');
  };

  const handleDemoLogin = async (type: 'creator' | 'investor' | 'advertiser' | 'operator' | 'merchant' | 'matrix' | 'samplingMerchant' | 'activeSampling' | 'graduatedMerchant' | 'state0' | 'state1' | 'state2' | 'state3') => {
    try {
      await demoLogin(type);

      // Set maturity state for state demo logins
      if (type === 'state0') {
        setMaturityState(UserMaturityState.FIRST_TIME);
        router.replace('/start' as any);
      } else if (type === 'state1') {
        setMaturityState(UserMaturityState.ACTIVE);
        router.replace('/today' as any);
      } else if (type === 'state2') {
        setMaturityState(UserMaturityState.REWARDED);
        router.replace('/today' as any);
      } else if (type === 'state3') {
        setMaturityState(UserMaturityState.POWER_USER);
        router.replace('/today' as any);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Demo Choice Failed', error.message || 'Error occurred');
    }
  };

  const handleBack = () => {
    safeBack(router);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.black} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to your Promorang account to continue
            </Text>
          </View>

          {/* Demo Login Buttons (Parity with Web) */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Platform Roles:</Text>
            <View style={styles.demoGrid}>
              <TouchableOpacity
                style={[styles.demoBtn, { borderColor: colors.primary }]}
                onPress={() => handleDemoLogin('creator')}
              >
                <User size={18} color={colors.primary} />
                <Text style={styles.demoBtnText}>Creator</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { borderColor: '#8B5CF6' }]}
                onPress={() => handleDemoLogin('investor')}
              >
                <Star size={18} color="#8B5CF6" />
                <Text style={styles.demoBtnText}>Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { borderColor: '#F59E0B' }]}
                onPress={() => handleDemoLogin('advertiser')}
              >
                <Briefcase size={18} color="#F59E0B" />
                <Text style={styles.demoBtnText}>Brand</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Merchant Sampling Program */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Merchant Sampling:</Text>
            <View style={styles.demoGrid}>
              <TouchableOpacity
                style={[styles.demoBtn, { borderColor: '#10B981' }]}
                onPress={() => handleDemoLogin('samplingMerchant' as any)}
              >
                <User size={16} color="#10B981" />
                <Text style={styles.demoBtnText}>New</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { borderColor: '#3B82F6' }]}
                onPress={() => handleDemoLogin('activeSampling' as any)}
              >
                <Star size={16} color="#3B82F6" />
                <Text style={styles.demoBtnText}>Active</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { borderColor: '#8B5CF6' }]}
                onPress={() => handleDemoLogin('graduatedMerchant' as any)}
              >
                <Briefcase size={16} color="#8B5CF6" />
                <Text style={styles.demoBtnText}>Grad</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Maturity States (UX Testing) */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Maturity States (UX Testing):</Text>
            <View style={styles.stateGrid}>
              {[0, 1, 2, 3].map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[styles.stateBtn, { borderColor: '#3B82F6' }]}
                  onPress={() => handleDemoLogin(`state${state}` as any)}
                >
                  <Text style={styles.stateBtnText}>S{state}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.stateHint}>Test progressive disclosure</Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            onPress={handleGoogleLogin}
            variant="outline"
            size="lg"
            leftIcon={<Chrome size={20} color="#EA4335" />}
            style={styles.googleButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or use email</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.darkGray} />}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Lock size={20} color={colors.darkGray} />}
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={styles.button}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGray,
  },
  demoSection: {
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: colors.white,
    gap: 6,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '500',
  },
  googleButton: {
    marginBottom: 8,
  },
  formContainer: {
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
  },
  button: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  signupText: {
    fontSize: 14,
    color: colors.darkGray,
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  // Maturity State Buttons
  stateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stateBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: colors.white,
  },
  stateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  stateHint: {
    fontSize: 10,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
});