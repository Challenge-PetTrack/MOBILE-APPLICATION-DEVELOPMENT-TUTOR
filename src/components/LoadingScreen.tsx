import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = 'Carregando...' }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={[s.text, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
  },
});
