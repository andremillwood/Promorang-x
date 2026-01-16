import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, ArrowLeft, Tag, Shield, CheckCircle } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { safeBack } from '@/lib/navigation';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!name) {
      newErrors.name = 'Full Name is required';
      isValid = false;
    }

    if (!username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp(name, email, password, referralCode, username);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Sign Up Failed', 'Could not create account. Please try again.');
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Promorang and start earning from your social media presence
          </Text>
        </View>

        {/* Social Shield Value Prop */}
        <View style={styles.socialShieldBanner}>
          <View style={styles.socialShieldIconContainer}>
            <Shield size={20} color="#10B981" />
          </View>
          <View style={styles.socialShieldContent}>
            <Text style={styles.socialShieldTitle}>Social Shield Protection Included</Text>
            <Text style={styles.socialShieldDescription}>
              Your earnings are protected when content underperforms. Algorithm changes? We cover the difference.
            </Text>
            <View style={styles.socialShieldFeatures}>
              <View style={styles.socialShieldFeature}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.socialShieldFeatureText}>Auto-protection</Text>
              </View>
              <View style={styles.socialShieldFeature}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.socialShieldFeatureText}>No claims</Text>
              </View>
              <View style={styles.socialShieldFeature}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.socialShieldFeatureText}>All members</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={colors.darkGray} />}
            error={errors.name}
          />

          <Input
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={<User size={20} color={colors.darkGray} />}
            error={errors.username}
          />

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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={20} color={colors.darkGray} />}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            leftIcon={<Lock size={20} color={colors.darkGray} />}
            error={errors.confirmPassword}
          />

          <Input
            label="Referral Code (Optional)"
            placeholder="Enter referral code if you have one"
            value={referralCode}
            onChangeText={setReferralCode}
            leftIcon={<Tag size={20} color={colors.darkGray} />}
          />
        </View>

        <Button
          title="Sign Up"
          onPress={handleSignUp}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          style={styles.button}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
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
  content: {
    flex: 1,
    padding: 24,
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
  formContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: colors.darkGray,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  // Social Shield Styles
  socialShieldBanner: {
    flexDirection: 'row',
    backgroundColor: '#10B98110',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  socialShieldIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialShieldContent: {
    flex: 1,
  },
  socialShieldTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  socialShieldDescription: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 8,
    lineHeight: 16,
  },
  socialShieldFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialShieldFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialShieldFeatureText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
});