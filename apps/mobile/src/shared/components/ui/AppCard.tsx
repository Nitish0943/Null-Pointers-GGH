import { View, type ViewProps } from 'react-native';

import { cardStyles } from '../../theme/cardStyles';

export function AppCard({ style, ...props }: ViewProps) {
  return <View {...props} style={[cardStyles.base, style]} />;
}
