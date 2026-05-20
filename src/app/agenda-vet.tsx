import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

const AGENDAMENTOS_MOCK = [
  { id: "m1", horario: "09:00", tutor: "Maria Silva", pet: "Bolinha", motivo: "Consulta de Rotina", status: "concluido", origem: "interno", data: "Hoje" },
  { id: "m2", horario: "10:30", tutor: "João Souza", pet: "Rex", motivo: "Retorno Vacina V10", status: "pendente", origem: "interno", data: "Hoje" },
];

export default function AgendaVet() {
  const router = useRouter();
  const { colors } = useTheme();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAgenda();
    }, [])
  );

  const loadAgenda = async () => {
    try {
      const data = await AsyncStorage.getItem("@agenda_consultas");
      const doTutor = data ? JSON.parse(data) : [];

      // Misturar mock com os reais dos tutores
      const todos = [
        ...AGENDAMENTOS_MOCK,
        ...doTutor.map((a: any) => ({
          ...a,
          tutor: a.tutorNome,
          data: a.data,
          status: "pendente",
        }))
      ];

      // Ordenar por horário
      todos.sort((a, b) => a.horario.localeCompare(b.horario));
      setAgendamentos(todos);

      // Marcar como visto
      await AsyncStorage.setItem("@agenda_visto_count", doTutor.length.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Agenda do Dia</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.dateContainer}>
          <Ionicons name="calendar" size={24} color="#8b5cf6" />
          <Text style={s.dateText}>{hoje}</Text>
        </View>

        {agendamentos.map(a => (
          <View key={a.id} style={[s.card, a.origem === "tutor" && s.cardTutor]}>
            <View style={s.timeColumn}>
              <Text style={s.timeText}>{a.horario}</Text>
              <View style={[s.statusDot, { backgroundColor: a.status === "concluido" ? "#10b981" : "#f59e0b" }]} />
            </View>
            <View style={s.infoColumn}>
              {a.origem === "tutor" && (
                <View style={s.newBadge}>
                  <Text style={s.newBadgeText}>Novo ✨</Text>
                </View>
              )}
              <View style={s.infoRow}>
                <Ionicons name="paw" size={16} color={colors.textSecondary} />
                <Text style={s.petName}>{a.pet}</Text>
              </View>
              <View style={s.infoRow}>
                <Ionicons name="person" size={16} color={colors.textMuted} />
                <Text style={s.tutorName}>{a.tutor}</Text>
              </View>
              <Text style={s.motivoText}>{a.motivo}</Text>
            </View>
            <TouchableOpacity style={s.actionButton}>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}

        {agendamentos.length === 0 && (
          <View style={s.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={s.emptyText}>Nenhum agendamento para hoje</Text>
          </View>
        )}

        <TouchableOpacity style={s.fabButton}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={s.fabText}>Novo Agendamento</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background,
    },
    backButton: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    content: { paddingHorizontal: 24 },
    dateContainer: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.isDark ? "#3d2d6e" : "#ede9fe",
      padding: 16, borderRadius: 16, marginBottom: 24,
    },
    dateText: { fontSize: 16, fontWeight: "bold", color: "#7c3aed", marginLeft: 12, textTransform: "capitalize" },
    card: {
      flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16,
      padding: 16, marginBottom: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    cardTutor: { borderWidth: 1, borderColor: "#8b5cf6" },
    timeColumn: {
      alignItems: "center", justifyContent: "center",
      borderRightWidth: 1, borderRightColor: colors.borderLight,
      paddingRight: 16, marginRight: 16,
    },
    timeText: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 8 },
    statusDot: { width: 12, height: 12, borderRadius: 6 },
    infoColumn: { flex: 1, justifyContent: "center" },
    newBadge: { backgroundColor: "#8b5cf6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 },
    newBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
    infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    petName: { fontSize: 16, fontWeight: "bold", color: colors.text, marginLeft: 8 },
    tutorName: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    motivoText: { fontSize: 13, color: "#8b5cf6", fontWeight: "500", marginTop: 4 },
    actionButton: { justifyContent: "center", paddingLeft: 8 },
    emptyContainer: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
    emptyText: { marginTop: 16, fontSize: 16, color: colors.textMuted },
    fabButton: {
      backgroundColor: "#8b5cf6", flexDirection: "row", alignItems: "center",
      justifyContent: "center", paddingVertical: 16, borderRadius: 16,
      marginTop: 16, marginBottom: 16,
      shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    fabText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  });
}
