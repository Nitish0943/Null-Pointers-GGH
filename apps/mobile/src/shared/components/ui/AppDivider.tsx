import { StyleSheet, View } from 'react-native';

export function AppDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#D9E3E9',
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
