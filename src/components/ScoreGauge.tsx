import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export default function ScoreGauge({ score, maxScore = 100 }: ScoreGaugeProps) {
  const { colors } = useTheme();
  const color = score < 40 ? "#ef4444" : score < 80 ? "#f59e0b" : "#10b981";
  const message =
    score === 100
      ? "Perfeito! Seu pet está super feliz e saudável hoje!"
      : score >= 70
      ? "Muito bem! Ótima rotina diária de cuidados!"
      : score >= 40
      ? "Bom progresso, complete mais tarefas hoje!"
      : "Comece a registrar os cuidados de hoje do seu pet!";

  return (
    <View style={[s.container, { backgroundColor: colors.surface }]}>
      <View style={[s.circle, { borderColor: color }]}>
        <Text style={[s.scoreText, { color }]}>{score}</Text>
        <Text style={[s.maxText, { color: colors.textMuted }]}>/ {maxScore}</Text>
      </View>
      <Text style={[s.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  circle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreText: { fontSize: 44, fontWeight: "bold" },
  maxText: { fontSize: 15, fontWeight: "600" },
  message: { fontSize: 15, fontWeight: "600", textAlign: "center", lineHeight: 22 },
});
