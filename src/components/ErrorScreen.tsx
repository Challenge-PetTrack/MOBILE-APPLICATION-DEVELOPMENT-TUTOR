import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({
  message = 'Erro ao carregar dados. Verifique sua conexão.',
  onRetry,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={56} color="#ef4444" />
      <Text style={[s.title, { color: colors.text }]}>Ops!</Text>
      <Text style={[s.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={s.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={s.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
