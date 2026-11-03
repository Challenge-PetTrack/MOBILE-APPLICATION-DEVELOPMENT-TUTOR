import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { formatDate } from "@/utils/date";
import type { VacinaCatalogoItem } from "@/constants/catalogos";
import type { VacinaRegistro } from "@/types/models";

interface VacinaItemProps {
  vacina: VacinaCatalogoItem;
  registro?: VacinaRegistro;
  onToggle: () => void;
  disabled?: boolean;
}

export default function VacinaItem({ vacina, registro, onToggle, disabled }: VacinaItemProps) {
  const { colors } = useTheme();
  const isTomada = registro?.tomada === true;

  return (
    <View
      style={[
        s.card,
        { backgroundColor: colors.surface, borderLeftColor: isTomada ? "#10b981" : "#ef4444" },
      ]}
    >
      <View style={s.header}>
        <View
          style={[
            s.iconBox,
            { backgroundColor: isTomada ? "#10b98120" : "#ef444420" },
          ]}
        >
          <Ionicons name="medkit" size={24} color={isTomada ? "#10b981" : "#ef4444"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.nome, { color: colors.text }]}>{vacina.nome}</Text>
          <Text style={[s.recomendacao, { color: colors.textMuted }]}>
            Recomendação: {vacina.recomendacao}
          </Text>
        </View>
        <View style={[s.badge, { backgroundColor: isTomada ? "#d1fae5" : "#fee2e2" }]}>
          <Text style={[s.badgeText, { color: isTomada ? "#065f46" : "#991b1b" }]}>
            {isTomada ? "Em dia" : "Pendente"}
          </Text>
        </View>
      </View>

      <Text style={[s.descricao, { color: colors.textSecondary }]}>{vacina.descricao}</Text>

      {isTomada && (
        <View style={[s.datesRow, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[s.dateText, { color: colors.textSecondary }]}>
            Aplicada em: <Text style={{ fontWeight: "700", color: colors.text }}>{formatDate(registro?.dataAplicacao)}</Text>
          </Text>
          {registro?.proximaDose && (
            <Text style={[s.dateText, { color: colors.textSecondary }]}>
              Reforço: <Text style={{ fontWeight: "700", color: "#10b981" }}>{formatDate(registro.proximaDose)}</Text>
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[s.button, { backgroundColor: isTomada ? colors.surfaceSecondary : "#10b981" }]}
        onPress={onToggle}
        disabled={disabled}
      >
        <Ionicons
          name={isTomada ? "close-circle-outline" : "checkmark-circle-outline"}
          size={18}
          color={isTomada ? colors.textSecondary : "#fff"}
          style={{ marginRight: 6 }}
        />
        <Text style={[s.buttonText, { color: isTomada ? colors.textSecondary : "#fff" }]}>
          {isTomada ? "Desmarcar Aplicação" : "Registrar Aplicação Hoje"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  nome: { fontSize: 16, fontWeight: "bold" },
  recomendacao: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  descricao: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  dateText: { fontSize: 12 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { fontWeight: "bold", fontSize: 14 },
});
