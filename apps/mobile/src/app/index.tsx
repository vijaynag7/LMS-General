import * as React from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function HomeScreen() {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;
  return session ? <WelcomeScreen /> : <LoginScreen />;
}

function LoginScreen() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          EduSaaS
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Sign in
        </ThemedText>

        {!isSupabaseConfigured && (
          <ThemedText type="small" style={styles.warning}>
            Supabase isn&apos;t configured yet — copy apps/mobile/.env.example to .env.
          </ThemedText>
        )}

        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        {error && (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        )}
        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function WelcomeScreen() {
  const { session, signOut } = useAuth();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>
        <ThemedText type="default">{session?.user.email}</ThemedText>
        <ThemedText type="small" style={styles.warning}>
          Course browsing and live classes are coming in a later release — this build is a scaffold.
        </ThemedText>
        <Pressable style={styles.button} onPress={() => signOut()}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            Sign out
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8884',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6D28D9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
  warning: {
    textAlign: 'center',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
});
