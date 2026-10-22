import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingPlaceholderScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>NEXT STEP</Text>
      <Text style={styles.title}>Your setup starts in the next batch.</Text>
      <Text style={styles.description}>
        Onboarding is not implemented yet. This temporary route confirms that
        the Welcome call to action is connected.
      </Text>
      <Text onPress={() => navigation.goBack()} style={styles.back}>
        ← Back to Welcome
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAFC',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: '#17324D',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
    marginTop: 14,
  },
  description: {
    color: '#5D7182',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 18,
  },
  back: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 32,
  },
});
