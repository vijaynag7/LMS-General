import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function CoursesScreen() {
  const { session } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">My Courses</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {session
            ? "Course browsing, live classes, and downloads are coming in a later release — this build is a scaffold."
            : 'Sign in to see your enrolled courses.'}
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  centerText: {
    textAlign: 'center',
  },
});
