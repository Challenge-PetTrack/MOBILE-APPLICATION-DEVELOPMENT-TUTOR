import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
}

export default function EmptyState({ icon = 'paw-outline', message }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Ionicons name={icon} size={64} color={colors.textMuted} />
      <Text style={[s.text, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
