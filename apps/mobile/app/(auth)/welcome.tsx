import { Image } from 'expo-image';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/(auth)/login' as any);
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.appName}>Promorang</Text>
        </View>

        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80' }}
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Share, Earn, Grow</Text>
          <Text style={styles.subtitle}>
            Complete tasks, back viral content, and earn rewards on the ultimate
            social monetization platform.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            style={styles.button}
          />
          <Button
            title="Sign Up"
            onPress={handleSignUp}
            variant="outline"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
  },
  heroContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 16,
  },
});