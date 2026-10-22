import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Partial<Props>) {
  useEffect(() => {
    if (!navigation) {
      return;
    }
    const transition = setTimeout(() => {
      navigation.replace('Welcome');
    }, 450);

    return () => clearTimeout(transition);
  }, [navigation]);

  return (
    <View style={styles.container} accessible accessibilityLabel="Mantrix">
      <View style={styles.logoMark} accessibilityElementsHidden>
        <View style={styles.logoBar} />
        <View style={[styles.logoBar, styles.logoBarShort]} />
        <View style={[styles.logoBar, styles.logoBarAccent]} />
      </View>
      <Text style={styles.brand}>Mantrix</Text>
      <Text style={styles.caption}>Academic Navigator</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  logoMark: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    height: 42,
    justifyContent: 'center',
    marginBottom: 20,
    width: 58,
  },
  logoBar: {
    backgroundColor: '#F7FAFC',
    borderRadius: 5,
    height: 34,
    transform: [{ rotate: '-18deg' }],
    width: 13,
  },
  logoBarShort: {
    height: 25,
    transform: [{ rotate: '18deg' }],
  },
  logoBarAccent: {
    backgroundColor: '#14B8A6',
    height: 39,
    transform: [{ rotate: '18deg' }],
  },
  brand: {
    color: '#F7FAFC',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  caption: {
    color: '#B9D7D5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
    textTransform: 'uppercase',
  },
});
