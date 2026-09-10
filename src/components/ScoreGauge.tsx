import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  pesoAtual?: string;
  vacinasTomadas?: number;
}

export default function ScoreGauge({ pesoAtual, vacinasTomadas = 0 }: Props) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  // Calcula um score básico (fictício) de 0 a 100
  const baseScore = 40;
  const vacinaScore = Math.min(vacinasTomadas * 15, 45); // até 45 pts por vacinas
  const pesoScore = pesoAtual ? 15 : 0; // 15 pts se peso estiver preenchido
  const totalScore = baseScore + vacinaScore + pesoScore;

  const getScoreColor = () => {
    if (totalScore >= 80) return "#10b981"; // Verde (Excelente)
    if (totalScore >= 60) return "#f59e0b"; // Amarelo (Atenção)
    return "#ef4444"; // Vermelho (Precisa de cuidados)
  };

  const getScoreLabel = () => {
    if (totalScore >= 80) return "Excelente";
    if (totalScore >= 60) return "Bom";
    return "Atenção";
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Pet Score (Saúde)</Text>
      
      <View style={s.row}>
        {/* Gráfico circular fake */}
        <View style={s.gaugeContainer}>
          <View style={[s.gaugeCircle, { borderColor: getScoreColor() }]}>
            <Text style={[s.scoreValue, { color: getScoreColor() }]}>{totalScore}</Text>
            <Text style={s.scoreMax}>/100</Text>
          </View>
        </View>

        {/* Métricas */}
        <View style={s.metricsContainer}>
          <View style={s.metricItem}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" style={s.metricIcon} />
            <Text style={s.metricText}>{vacinasTomadas} Vacina(s)</Text>
          </View>
          <View style={s.metricItem}>
            <Ionicons name="scale" size={16} color="#3b82f6" style={s.metricIcon} />
            <Text style={s.metricText}>{pesoAtual ? `${pesoAtual} kg` : "Não inf."}</Text>
          </View>
          <View style={s.metricItem}>
            <Ionicons name="fitness" size={16} color={getScoreColor()} style={s.metricIcon} />
            <Text style={[s.metricText, { color: getScoreColor(), fontWeight: "bold" }]}>
              {getScoreLabel()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreMax: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },
  metricsContainer: {
    flex: 1,
    paddingLeft: 24,
    gap: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricIcon: {
    marginRight: 8,
  },
  metricText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
