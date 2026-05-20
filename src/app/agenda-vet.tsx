import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Alert, Image, TextInput
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

// Agendamentos mock para dias variados
const AGENDAMENTOS_MOCK = [
  { id: "m1", horario: "09:00", tutor: "Maria Silva", pet: "Bolinha", motivo: "Consulta de Rotina", status: "concluido", origem: "interno", dataOffset: 0 },
  { id: "m2", horario: "10:30", tutor: "João Souza", pet: "Rex", motivo: "Retorno Vacina V10", status: "pendente", origem: "interno", dataOffset: 0 },
  { id: "m3", horario: "14:00", tutor: "Ana Costa", pet: "Mia", motivo: "Dermatite Suspeita", status: "pendente", origem: "interno", dataOffset: 0 },
  { id: "m4", horario: "08:30", tutor: "Carlos Dias", pet: "Thor", motivo: "Avaliação Pré-Cirúrgica", status: "pendente", origem: "interno", dataOffset: 1 },
  { id: "m5", horario: "11:00", tutor: "Fernanda Lima", pet: "Luna", motivo: "Consulta de Rotina", status: "pendente", origem: "interno", dataOffset: 1 },
  { id: "m6", horario: "15:30", tutor: "Roberto Santos", pet: "Duke", motivo: "Vacinas Anuais", status: "pendente", origem: "interno", dataOffset: 2 },
  { id: "m7", horario: "09:30", tutor: "Juliana Rocha", pet: "Mel", motivo: "Castração", status: "pendente", origem: "interno", dataOffset: -1 },
  { id: "m8", horario: "16:00", tutor: "Pedro Alves", pet: "Bob", motivo: "Check-up Geral", status: "concluido", origem: "interno", dataOffset: -1 },
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatarData(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function formatarDataLonga(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function AgendaVet() {
  const router = useRouter();
  const { colors } = useTheme();
  const hoje = new Date();

  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [agendamentosDoDia, setAgendamentosDoDia] = useState<any[]>([]);
  const [detalheVisible, setDetalheVisible] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacaoVet, setObservacaoVet] = useState("");

  // Semana exibida: 7 dias a partir de 3 dias atrás
  const semana = Array.from({ length: 7 }, (_, i) => addDays(hoje, i - 2));

  useFocusEffect(
    useCallback(() => {
      carregarDia(diaSelecionado);
    }, [diaSelecionado])
  );

  const carregarDia = async (dia: Date) => {
    try {
      const data = await AsyncStorage.getItem("@agenda_consultas");
      const doTutor = data ? JSON.parse(data) : [];

      // Mock: mapear offset para datas reais
      const mockComData = AGENDAMENTOS_MOCK.map(m => ({
        ...m,
        dataReal: addDays(hoje, m.dataOffset),
      })).filter(m => isSameDay(m.dataReal, dia));

      // Reais dos tutores: filtrar pela data digitada
      const reais = doTutor
        .filter((a: any) => {
          if (!a.data) return false;
          // Tentar parsear a data do tutor (pode ser DD/MM/AAAA)
          const parts = a.data.split("/");
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            return isSameDay(d, dia);
          }
          return false;
        })
        .map((a: any) => ({
          ...a,
          tutor: a.tutorNome,
          status: a.status || "pendente",
          dataReal: dia,
        }));

      const todos = [...mockComData, ...reais].sort((a, b) => a.horario.localeCompare(b.horario));
      setAgendamentosDoDia(todos);

      // Marcar como visto
      await AsyncStorage.setItem("@agenda_visto_count", doTutor.length.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const abrirDetalhe = (agendamento: any) => {
    setAgendamentoSelecionado(agendamento);
    setNovoStatus(agendamento.status);
    setObservacaoVet(agendamento.observacaoVet || "");
    setDetalheVisible(true);
  };

  const salvarDetalhe = async () => {
    if (!agendamentoSelecionado) return;

    try {
      // Se for agendamento do tutor, atualizar no AsyncStorage
      if (agendamentoSelecionado.origem === "tutor" || agendamentoSelecionado.tutorId) {
        const data = await AsyncStorage.getItem("@agenda_consultas");
        if (data) {
          const agenda = JSON.parse(data);
          const idx = agenda.findIndex((a: any) => a.id === agendamentoSelecionado.id);
          if (idx !== -1) {
            agenda[idx] = { ...agenda[idx], status: novoStatus, observacaoVet };
            await AsyncStorage.setItem("@agenda_consultas", JSON.stringify(agenda));
          }
        }
      }

      setDetalheVisible(false);
      carregarDia(diaSelecionado);
      Alert.alert("Salvo!", "Agendamento atualizado com sucesso.");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Agenda</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Seletor de Dias — Scroll Horizontal */}
      <View style={s.weekStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekScroll}>
          {semana.map((dia, i) => {
            const isHoje = isSameDay(dia, hoje);
            const isSel = isSameDay(dia, diaSelecionado);
            return (
              <TouchableOpacity
                key={i}
                style={[s.dayPill, isSel && s.dayPillSelected, isHoje && !isSel && s.dayPillHoje]}
                onPress={() => setDiaSelecionado(dia)}
              >
                <Text style={[s.dayWeek, isSel && s.dayTextSelected]}>
                  {dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase()}
                </Text>
                <Text style={[s.dayNum, isSel && s.dayTextSelected]}>{dia.getDate()}</Text>
                {isHoje && <View style={[s.hojeDot, isSel && { backgroundColor: "#fff" }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Título do Dia */}
      <View style={s.diaHeader}>
        <Text style={s.diaTitle}>{formatarDataLonga(diaSelecionado)}</Text>
        <View style={s.countBadge}>
          <Text style={s.countBadgeText}>{agendamentosDoDia.length} consulta(s)</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {agendamentosDoDia.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={s.emptyText}>Nenhum agendamento para este dia</Text>
          </View>
        ) : (
          agendamentosDoDia.map((a, i) => (
            <TouchableOpacity key={a.id || i} style={[s.card, a.origem === "tutor" && s.cardTutor]} onPress={() => abrirDetalhe(a)} activeOpacity={0.85}>
              <View style={s.timeColumn}>
                <Text style={s.timeText}>{a.horario}</Text>
                <View style={[s.statusDot, { backgroundColor: a.status === "concluido" ? "#10b981" : a.status === "cancelado" ? "#ef4444" : "#f59e0b" }]} />
              </View>
              <View style={s.infoColumn}>
                {a.origem === "tutor" && (
                  <View style={s.newBadge}>
                    <Text style={s.newBadgeText}>Solicitado ✨</Text>
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
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={s.fabButton}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={s.fabText}>Novo Agendamento</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de Detalhe do Agendamento */}
      <Modal visible={detalheVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Detalhes da Consulta</Text>
              <TouchableOpacity onPress={() => setDetalheVisible(false)} style={s.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {agendamentoSelecionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info do Agendamento */}
                <View style={s.detalheInfoCard}>
                  <View style={s.detalheRow}>
                    <Ionicons name="time" size={20} color="#8b5cf6" />
                    <Text style={s.detalheLabel}>Horário</Text>
                    <Text style={s.detalheValue}>{agendamentoSelecionado.horario} — {formatarData(diaSelecionado)}</Text>
                  </View>
                  <View style={s.detalheDivider} />
                  <View style={s.detalheRow}>
                    <Ionicons name="paw" size={20} color="#0d9488" />
                    <Text style={s.detalheLabel}>Paciente</Text>
                    <Text style={s.detalheValue}>{agendamentoSelecionado.pet}</Text>
                  </View>
                  <View style={s.detalheDivider} />
                  <View style={s.detalheRow}>
                    <Ionicons name="person" size={20} color="#f59e0b" />
                    <Text style={s.detalheLabel}>Tutor</Text>
                    <Text style={s.detalheValue}>{agendamentoSelecionado.tutor}</Text>
                  </View>
                  <View style={s.detalheDivider} />
                  <View style={s.detalheRow}>
                    <Ionicons name="clipboard" size={20} color="#ec4899" />
                    <Text style={s.detalheLabel}>Motivo</Text>
                    <Text style={[s.detalheValue, { flex: 1 }]}>{agendamentoSelecionado.motivo}</Text>
                  </View>
                </View>

                {/* Alterar Status */}
                <Text style={s.sectionLabel}>Status da Consulta</Text>
                <View style={s.statusSelector}>
                  {["pendente", "concluido", "cancelado"].map(st => (
                    <TouchableOpacity
                      key={st}
                      style={[s.statusOption, novoStatus === st && s.statusOptionSelected(st)]}
                      onPress={() => setNovoStatus(st)}
                    >
                      <View style={[s.statusDot2, { backgroundColor: st === "concluido" ? "#10b981" : st === "cancelado" ? "#ef4444" : "#f59e0b" }]} />
                      <Text style={[s.statusOptionText, novoStatus === st && { color: "#fff" }]}>
                        {st === "concluido" ? "Concluído" : st === "cancelado" ? "Cancelado" : "Pendente"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Observação do Veterinário */}
                <Text style={s.sectionLabel}>Observação / Diagnóstico</Text>
                <TextInput
                  style={s.obsInput}
                  placeholder="Escreva sua observação ou diagnóstico aqui..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={observacaoVet}
                  onChangeText={setObservacaoVet}
                />

                <View style={s.modalActions}>
                  <TouchableOpacity style={s.cancelarBtn} onPress={() => setDetalheVisible(false)}>
                    <Text style={s.cancelarText}>Fechar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.salvarBtn} onPress={salvarDetalhe}>
                    <Text style={s.salvarText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.background,
    },
    backButton: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    weekStrip: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    weekScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    dayPill: {
      alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16,
      minWidth: 58, backgroundColor: colors.surfaceSecondary,
    },
    dayPillSelected: { backgroundColor: "#8b5cf6" },
    dayPillHoje: { borderWidth: 2, borderColor: "#8b5cf6" },
    dayTextSelected: { color: "#fff" },
    dayWeek: { fontSize: 11, fontWeight: "700", color: colors.textMuted, marginBottom: 4 },
    dayNum: { fontSize: 18, fontWeight: "bold", color: colors.text },
    hojeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8b5cf6", marginTop: 3 },
    diaHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 },
    diaTitle: { fontSize: 16, fontWeight: "bold", color: colors.text, textTransform: "capitalize", flex: 1 },
    countBadge: { backgroundColor: colors.isDark ? "#3d2d6e" : "#ede9fe", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    countBadgeText: { color: "#7c3aed", fontSize: 12, fontWeight: "bold" },
    content: { paddingHorizontal: 24 },
    card: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 16,
      padding: 16, marginBottom: 14,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    cardTutor: { borderWidth: 1.5, borderColor: "#8b5cf6" },
    timeColumn: { alignItems: "center", borderRightWidth: 1, borderRightColor: colors.borderLight, paddingRight: 14, marginRight: 14 },
    timeText: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: 8 },
    statusDot: { width: 12, height: 12, borderRadius: 6 },
    infoColumn: { flex: 1 },
    newBadge: { backgroundColor: "#8b5cf6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 },
    newBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
    infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    petName: { fontSize: 16, fontWeight: "bold", color: colors.text, marginLeft: 8 },
    tutorName: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    motivoText: { fontSize: 13, color: "#8b5cf6", fontWeight: "500", marginTop: 4 },
    emptyContainer: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
    emptyText: { marginTop: 16, fontSize: 16, color: colors.textMuted },
    fabButton: {
      backgroundColor: "#8b5cf6", flexDirection: "row", alignItems: "center",
      justifyContent: "center", paddingVertical: 16, borderRadius: 16, marginTop: 16,
      shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    fabText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 },

    // Modal Detalhe
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: {
      backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
      padding: 28, paddingBottom: 40, maxHeight: "90%",
    },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    closeBtn: { padding: 4, backgroundColor: colors.surfaceSecondary, borderRadius: 12 },
    detalheInfoCard: {
      backgroundColor: colors.surfaceSecondary, borderRadius: 16, padding: 16, marginBottom: 24,
    },
    detalheRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    detalheLabel: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginLeft: 12, width: 80 },
    detalheValue: { fontSize: 15, fontWeight: "500", color: colors.text, marginLeft: 8 },
    detalheDivider: { height: 1, backgroundColor: colors.borderLight },
    sectionLabel: { fontSize: 14, fontWeight: "700", color: colors.textSecondary, marginBottom: 12 },
    statusSelector: { flexDirection: "row", gap: 10, marginBottom: 24 },
    statusOption: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceSecondary,
      borderWidth: 1, borderColor: colors.border,
    },
    statusOptionSelected: (st: string) => ({
      backgroundColor: st === "concluido" ? "#10b981" : st === "cancelado" ? "#ef4444" : "#f59e0b",
      borderColor: "transparent",
    }),
    statusOptionText: { fontSize: 13, fontWeight: "600", color: colors.text, marginLeft: 6 },
    statusDot2: { width: 10, height: 10, borderRadius: 5 },
    obsInput: {
      backgroundColor: colors.inputBackground, borderRadius: 14, padding: 16, fontSize: 15,
      color: colors.text, borderWidth: 1, borderColor: colors.border,
      height: 110, textAlignVertical: "top", marginBottom: 24,
    },
    modalActions: { flexDirection: "row", gap: 12 },
    cancelarBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.surfaceSecondary, alignItems: "center" },
    cancelarText: { color: colors.text, fontWeight: "600", fontSize: 16 },
    salvarBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#8b5cf6", alignItems: "center" },
    salvarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });
}
