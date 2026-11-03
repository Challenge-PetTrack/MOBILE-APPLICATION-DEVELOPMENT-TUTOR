import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import type { Pet } from "@/types/models";

interface PetCardProps {
  pet: Pet;
  onEdit: () => void;
  onDelete: () => void;
  onOpenFicha: () => void;
}

export default function PetCard({ pet, onEdit, onDelete, onOpenFicha }: PetCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[s.card, { backgroundColor: colors.surface }]}>
      <View style={[s.cardHeader, { borderBottomColor: colors.borderLight }]}>
        <View style={s.titleRow}>
          {pet.fotoUri ? (
            <Image source={{ uri: pet.fotoUri }} style={s.avatar} />
          ) : (
            <View style={s.avatarPlaceholder}>
              <Ionicons name="paw" size={22} color="#4f46e5" />
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[s.petName, { color: colors.text }]} numberOfLines={1}>
              {pet.nome}
            </Text>
            <Text style={[s.petSub, { color: colors.textSecondary }]}>
              {pet.especie}
              {pet.raca ? ` • ${pet.raca}` : ""}
            </Text>
          </View>
        </View>

        <View style={s.actions}>
          <TouchableOpacity onPress={onEdit} style={s.editBtn} accessibilityLabel="Editar pet">
            <Ionicons name="pencil-outline" size={20} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={s.deleteBtn} accessibilityLabel="Excluir pet">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.metricsRow}>
        <View style={[s.metricBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[s.metricLabel, { color: colors.textMuted }]}>Idade</Text>
          <Text style={[s.metricValue, { color: colors.text }]}>
            {pet.idade ? `${pet.idade} anos` : "Não inf."}
          </Text>
        </View>
        <View style={[s.metricBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[s.metricLabel, { color: colors.textMuted }]}>Peso</Text>
          <Text style={[s.metricValue, { color: colors.text }]}>
            {pet.peso ? `${pet.peso} kg` : "Não inf."}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={s.fichaButton} onPress={onOpenFicha}>
        <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={s.fichaButtonText}>Ficha Clínica, Diário & RG</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 14,
  },
  titleRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#4f46e5" },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  petName: { fontSize: 19, fontWeight: "bold" },
  petSub: { fontSize: 13, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  editBtn: { padding: 8, backgroundColor: "#ecfdf5", borderRadius: 12 },
  deleteBtn: { padding: 8, backgroundColor: "#fef2f2", borderRadius: 12 },
  metricsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  metricBox: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignItems: "center" },
  metricLabel: { fontSize: 12, fontWeight: "600" },
  metricValue: { fontSize: 15, fontWeight: "bold", marginTop: 2 },
  fichaButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  fichaButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
