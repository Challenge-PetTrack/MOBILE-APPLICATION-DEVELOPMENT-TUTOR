import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useVetDashboardMetrics } from "@/hooks/useClinica";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime, formatMonthYear } from "@/utils/date";

export default function FinanceiroVetScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const {
    concluidasMes,
    consultasMesCount,
    faturamentoMes,
    valorPadrao,
    isLoading,
    isError,
    refetch,
  } = useVetDashboardMetrics();

  if (isLoading) return <LoadingScreen message="Calculando faturamento..." />;
  if (isError) return <ErrorScreen onRetry={refetch} />;

  return (
    <View style={s.container}>
      <Header title="Financeiro Clínico" />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.monthTitle}>{formatMonthYear()}</Text>

        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Faturamento de Consultas Concluídas</Text>
          <Text style={s.heroValue}>{formatCurrency(faturamentoMes)}</Text>
          <View style={s.heroStatsRow}>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{consultasMesCount}</Text>
              <Text style={s.heroStatText}>Atendimentos</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{formatCurrency(valorPadrao)}</Text>
              <Text style={s.heroStatText}>Valor Padrão</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Detalhamento do Mês</Text>
        {concluidasMes.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyText}>
              Nenhuma consulta concluída neste mês até o momento.
            </Text>
          </View>
        ) : (
          concluidasMes.map((c) => {
            const valorItem = c.valor && c.valor > 0 ? c.valor : valorPadrao;
            return (
              <View key={c.id} style={s.itemCard}>
                <View style={s.itemIcon}>
                  <Ionicons name="checkmark-done" size={20} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemPet}>{c.petNome}</Text>
                  <Text style={s.itemMeta}>
                    Tutor: {c.tutorNome} • {formatDateTime(c.dataHora)}
                  </Text>
                </View>
                <Text style={s.itemValue}>{formatCurrency(valorItem)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    monthTitle: { fontSize: 16, fontWeight: "700", color: colors.textSecondary, marginBottom: 12 },
    heroCard: {
      backgroundColor: "#0d9488",
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
    },
    heroLabel: { color: "#ccfbf1", fontSize: 13, fontWeight: "600" },
    heroValue: { color: "#fff", fontSize: 34, fontWeight: "bold", marginTop: 6 },
    heroStatsRow: {
      flexDirection: "row",
      marginTop: 18,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.2)",
    },
    heroStat: { flex: 1 },
    heroDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 14 },
    heroStatNum: { color: "#fff", fontSize: 17, fontWeight: "bold" },
    heroStatText: { color: "#ccfbf1", fontSize: 12, marginTop: 2 },
    sectionTitle: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: 12 },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
    },
    emptyText: { color: colors.textMuted, fontSize: 14, marginTop: 10, textAlign: "center" },
    itemCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      elevation: 2,
    },
    itemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#d1fae5",
      justifyContent: "center",
      alignItems: "center",
    },
    itemPet: { fontSize: 15, fontWeight: "bold", color: colors.text },
    itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    itemValue: { fontSize: 15, fontWeight: "bold", color: "#10b981" },
  });
}
