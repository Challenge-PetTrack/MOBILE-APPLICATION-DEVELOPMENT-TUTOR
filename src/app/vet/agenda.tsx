import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Alert, Image, TextInput, ActivityIndicator
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useEventosClinicos, useUpdateEventoClinico } from "@/hooks/useEventosClinicos";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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
  const { user } = useAuth();
  const hoje = new Date();

  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [detalheVisible, setDetalheVisible] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacaoVet, setObservacaoVet] = useState("");
  const [anexos, setAnexos] = useState<string[]>([]);

  // ─── Dados da API via TanStack Query ──────────────────────────────────
  const { data: eventos, isLoading, isError, refetch } = useEventosClinicos();
  const updateMutation = useUpdateEventoClinico();

  // Semana exibida: 7 dias a partir de 2 dias atrás
  const semana = Array.from({ length: 7 }, (_, i) => addDays(hoje, i - 2));

  // ✅ Loading state
  if (isLoading) return <LoadingScreen message="Carregando agenda..." />;
  // ✅ Error state
  if (isError) return <ErrorScreen message="Erro ao carregar a agenda." onRetry={refetch} />;

  // Filtrar eventos do dia selecionado
  const agendamentosDoDia = (eventos || [])
    .filter((e: any) => {
      if (!e.data) return false;
      try {
        const eventDate = new Date(e.data);
        return isSameDay(eventDate, diaSelecionado);
      } catch {
        return false;
      }
    })
    .sort((a: any, b: any) => (a.data || "").localeCompare(b.data || ""));

  const abrirDetalhe = async (agendamento: any) => {
    setAgendamentoSelecionado(agendamento);
    setNovoStatus(agendamento.status || "pendente");
    setObservacaoVet(agendamento.prescricao || agendamento.diagnostico || "");

    // Load attachments (local feature)
    try {
      const anexosData = await AsyncStorage.getItem(`@anexos_consulta_${agendamento.id}`);
      if (anexosData) setAnexos(JSON.parse(anexosData));
      else setAnexos([]);
    } catch {
      setAnexos([]);
    }

    setDetalheVisible(true);
  };

  const salvarDetalhe = async () => {
    if (!agendamentoSelecionado) return;

    updateMutation.mutate(
      {
        id: agendamentoSelecionado.id,
        data: {
          status: novoStatus as any,
          prescricao: observacaoVet,
          diagnostico: observacaoVet,
        },
      },
      {
        onSuccess: async () => {
          // Salvar anexos localmente (fotos não vão para a API)
          await AsyncStorage.setItem(
            `@anexos_consulta_${agendamentoSelecionado.id}`,
            JSON.stringify(anexos)
          );
          setDetalheVisible(false);
          Alert.alert("Salvo!", "Agendamento atualizado com sucesso.");
        },
        onError: () => {
          Alert.alert("Erro", "Não foi possível salvar.");
        },
      }
    );
  };

  const pickAnexo = async () => {
    if (anexos.length >= 3) {
      Alert.alert("Limite", "Máximo de 3 anexos por consulta.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setAnexos([...anexos, result.assets[0].uri]);
    }
  };

  const removerAnexo = (index: number) => {
    const novaLista = [...anexos];
    novaLista.splice(index, 1);
    setAnexos(novaLista);
  };

  const gerarReceita = async () => {
    if (!agendamentoSelecionado) return;
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1f2937; }
              .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
              .title { color: #8b5cf6; font-size: 28px; font-weight: bold; margin: 0; }
              .subtitle { font-size: 16px; margin-top: 5px; color: #4b5563; }
              .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 10px; margin-bottom: 30px; }
              .info-row { margin-bottom: 5px; font-size: 14px; }
              .label { font-weight: bold; }
              .content { min-height: 400px; }
              .presc-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;}
              .signature { margin-top: 50px; text-align: center; }
              .line { border-top: 1px solid #1f2937; width: 250px; margin: 0 auto 10px auto; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Receituário Veterinário</h1>
              <p class="subtitle">Clínica PetTrack</p>
            </div>
            
            <div class="info-box">
              <div class="info-row"><span class="label">Paciente:</span> ${agendamentoSelecionado.petNome || agendamentoSelecionado.pet || 'N/A'}</div>
              <div class="info-row"><span class="label">Tutor:</span> ${agendamentoSelecionado.tutorNome || agendamentoSelecionado.tutor || 'N/A'}</div>
              <div class="info-row"><span class="label">Data:</span> ${formatarDataLonga(diaSelecionado)}</div>
            </div>
            
            <div class="content">
              <div class="presc-title">Prescrição e Recomendações:</div>
              <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${observacaoVet || "Sem prescrições no momento."}</p>
            </div>
            
            <div class="signature">
              <div class="line"></div>
              <div>${user?.nome || "Médico(a) Veterinário(a)"}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">CRMV: Não informado</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Compartilhar Receita' });
    } catch (error) {
      console.error(error);
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
          agendamentosDoDia.map((a: any, i: number) => (
            <TouchableOpacity key={a.id || i} style={[s.card, a.origem === "tutor" && s.cardTutor]} onPress={() => abrirDetalhe(a)} activeOpacity={0.85}>
              <View style={s.timeColumn}>
                <Text style={s.timeText}>{a.data ? new Date(a.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</Text>
                <View style={[s.statusDot, { backgroundColor: a.status === "concluido" ? "#10b981" : a.status === "cancelado" ? "#ef4444" : "#f59e0b" }]} />
              </View>
              <View style={s.infoColumn}>
                <View style={s.infoRow}>
                  <Ionicons name="paw" size={16} color={colors.textSecondary} />
                  <Text style={s.petName}>{a.petNome || a.pet || "Paciente"}</Text>
                </View>
                <View style={s.infoRow}>
                  <Ionicons name="person" size={16} color={colors.textMuted} />
                  <Text style={s.tutorName}>{a.tutorNome || a.tutor || "Tutor"}</Text>
                </View>
                <Text style={s.motivoText}>{a.descricao || a.tipo || a.motivo || "Consulta"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={s.fabButton} onPress={() => router.push("/vet/nova-consulta")}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={s.fabText}>Nova Consulta</Text>
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
                    <Text style={s.detalheLabel}>Data</Text>
                    <Text style={s.detalheValue}>{formatarData(diaSelecionado)}</Text>
                  </View>
                  <View style={s.detalheDivider} />
                  <View style={s.detalheRow}>
                    <Ionicons name="paw" size={20} color="#0d9488" />
                    <Text style={s.detalheLabel}>Paciente</Text>
                    <Text style={s.detalheValue}>{agendamentoSelecionado.petNome || agendamentoSelecionado.pet || "N/A"}</Text>
                  </View>
                  <View style={s.detalheDivider} />
                  <View style={s.detalheRow}>
                    <Ionicons name="person" size={20} color="#f59e0b" />
                    <Text style={s.detalheLabel}>Tutor</Text>
                    <Text style={s.detalheValue}>{agendamentoSelecionado.tutorNome || agendamentoSelecionado.tutor || "N/A"}</Text>
                  </View>
                  <View style={s.detalheDivider} />
                  <View style={s.detalheRow}>
                    <Ionicons name="clipboard" size={20} color="#ec4899" />
                    <Text style={s.detalheLabel}>Motivo</Text>
                    <Text style={[s.detalheValue, { flex: 1 }]}>{agendamentoSelecionado.descricao || agendamentoSelecionado.tipo || "Consulta"}</Text>
                  </View>
                </View>

                {/* Alterar Status */}
                <Text style={s.sectionLabel}>Status da Consulta</Text>
                <View style={s.statusSelector}>
                  {["pendente", "concluido", "cancelado"].map(st => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        s.statusOption, 
                        novoStatus === st && (st === 'concluido' ? s.statusOptionSelected_concluido : st === 'cancelado' ? s.statusOptionSelected_cancelado : s.statusOptionSelected_pendente)
                      ]}
                      onPress={() => setNovoStatus(st)}
                    >
                      <View style={[s.statusDot2, { backgroundColor: st === "concluido" ? "#10b981" : st === "cancelado" ? "#ef4444" : "#f59e0b" }]} />
                      <Text style={[s.statusOptionText, novoStatus === st && { color: "#fff" }]}>
                        {st === "concluido" ? "Concluído" : st === "cancelado" ? "Cancelado" : "Pendente"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Observação / Diagnóstico */}
                <Text style={s.sectionLabel}>Prescrição / Observação</Text>
                <TextInput
                  style={s.obsInput}
                  placeholder="Escreva sua prescrição ou diagnóstico aqui..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={observacaoVet}
                  onChangeText={setObservacaoVet}
                />

                {/* Anexos Fotográficos */}
                <View style={s.anexoHeader}>
                  <Text style={[s.sectionLabel, { marginBottom: 0 }]}>Anexos ({anexos.length}/3)</Text>
                  <TouchableOpacity onPress={pickAnexo}>
                    <Ionicons name="camera" size={24} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
                
                {anexos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.anexosContainer}>
                    {anexos.map((uri, idx) => (
                      <View key={idx} style={s.anexoItem}>
                        <Image source={{ uri }} style={s.anexoImg} />
                        <TouchableOpacity style={s.anexoRemove} onPress={() => removerAnexo(idx)}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity style={s.receitaBtn} onPress={gerarReceita}>
                  <Ionicons name="document-text" size={20} color="#fff" />
                  <Text style={s.receitaBtnText}>Gerar Receita em PDF</Text>
                </TouchableOpacity>

                <View style={s.modalActions}>
                  <TouchableOpacity style={s.cancelarBtn} onPress={() => setDetalheVisible(false)}>
                    <Text style={s.cancelarText}>Fechar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.salvarBtn, updateMutation.isPending && { opacity: 0.6 }]}
                    onPress={salvarDetalhe}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={s.salvarText}>Salvar</Text>
                    )}
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
    statusOptionSelected_pendente: { backgroundColor: "#f59e0b", borderColor: "transparent" },
    statusOptionSelected_concluido: { backgroundColor: "#10b981", borderColor: "transparent" },
    statusOptionSelected_cancelado: { backgroundColor: "#ef4444", borderColor: "transparent" },
    statusOptionText: { fontSize: 13, fontWeight: "600", color: colors.text, marginLeft: 6 },
    statusDot2: { width: 10, height: 10, borderRadius: 5 },
    obsInput: {
      backgroundColor: colors.inputBackground, borderRadius: 14, padding: 16, fontSize: 15,
      color: colors.text, borderWidth: 1, borderColor: colors.border,
      height: 110, textAlignVertical: "top", marginBottom: 24,
    },
    modalActions: { flexDirection: "row", gap: 12, marginTop: 16 },
    cancelarBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.surfaceSecondary, alignItems: "center" },
    cancelarText: { color: colors.text, fontWeight: "600", fontSize: 16 },
    salvarBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#8b5cf6", alignItems: "center" },
    salvarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    anexoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    anexosContainer: { flexDirection: "row", marginBottom: 24 },
    anexoItem: { position: "relative", marginRight: 12 },
    anexoImg: { width: 80, height: 80, borderRadius: 12 },
    anexoRemove: { position: "absolute", top: -6, right: -6, backgroundColor: "#ef4444", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    receitaBtn: { flexDirection: "row", backgroundColor: "#0f766e", padding: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    receitaBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  });
}
