import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import {
  useClinicaConsultas,
  useExportReceita,
  useUpdateConsultaVet,
} from "@/hooks/useConsultas";
import { useClinicaVet } from "@/hooks/useClinica";
import { useImagePicker } from "@/hooks/useImagePicker";
import {
  addDays,
  formatDateTime,
  formatLongDate,
  formatTime,
  isSameDay,
} from "@/utils/date";
import { parseCurrency } from "@/utils/currency";
import type { Clinica, Consulta, ConsultaStatus } from "@/types/models";

const EMPTY_CONSULTAS: Consulta[] = [];

const STATUS_OPTIONS: { value: ConsultaStatus; label: string; color: string }[] = [
  { value: "pendente", label: "Pendente", color: "#f59e0b" },
  { value: "confirmada", label: "Confirmada", color: "#2563eb" },
  { value: "concluida", label: "Concluída", color: "#10b981" },
  { value: "cancelada", label: "Cancelada", color: "#ef4444" },
];

export default function AgendaVetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultaId?: string; data?: string }>();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const consultasQuery = useClinicaConsultas();
  const clinicaQuery = useClinicaVet();

  const hoje = useMemo(() => new Date(), []);
  const [modoFiltro, setModoFiltro] = useState<"dia" | "pendentes">("dia");
  const [manualDia, setManualDia] = useState<Date | null>(null);
  const [manualSelecionada, setManualSelecionada] = useState<Consulta | null>(null);
  const [dismissedParamId, setDismissedParamId] = useState<string | null>(null);

  const semana = useMemo(
    () => Array.from({ length: 10 }, (_, i) => addDays(hoje, i - 2)),
    [hoje]
  );

  const todasConsultas = consultasQuery.data ?? EMPTY_CONSULTAS;

  const deepLinkedConsulta = useMemo(() => {
    if (!params.consultaId || dismissedParamId === params.consultaId) return null;
    return todasConsultas.find((c) => c.id === params.consultaId) ?? null;
  }, [dismissedParamId, params.consultaId, todasConsultas]);

  const selecionada = manualSelecionada ?? deepLinkedConsulta;

  const diaSelecionado = useMemo(() => {
    if (manualDia) return manualDia;
    if (deepLinkedConsulta) return new Date(deepLinkedConsulta.dataHora);
    if (params.data) return new Date(params.data);
    return hoje;
  }, [deepLinkedConsulta, hoje, manualDia, params.data]);

  const fecharDetalhe = () => {
    setManualSelecionada(null);
    if (params.consultaId) setDismissedParamId(params.consultaId);
  };

  const consultasExibidas = useMemo(() => {
    if (modoFiltro === "pendentes") {
      return [...todasConsultas]
        .filter((c) => c.status === "pendente" || c.status === "confirmada")
        .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
    }
    return [...todasConsultas]
      .filter((c) => isSameDay(new Date(c.dataHora), diaSelecionado))
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }, [todasConsultas, modoFiltro, diaSelecionado]);

  const pendentesTotal = useMemo(
    () => todasConsultas.filter((c) => c.status === "pendente").length,
    [todasConsultas]
  );

  if (consultasQuery.isLoading) return <LoadingScreen message="Carregando agenda clínica..." />;
  if (consultasQuery.isError) return <ErrorScreen onRetry={() => consultasQuery.refetch()} />;

  return (
    <View style={s.container}>
      <Header
        title="Agenda Clínica"
        rightAction={
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => router.push("/vet/nova-consulta")}
            accessibilityLabel="Nova consulta"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <View style={s.filterTabs}>
        <TouchableOpacity
          style={[s.filterTab, modoFiltro === "dia" && s.filterTabActive]}
          onPress={() => setModoFiltro("dia")}
        >
          <Text style={[s.filterTabText, modoFiltro === "dia" && s.filterTabTextActive]}>
            Por Dia
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, modoFiltro === "pendentes" && s.filterTabActive]}
          onPress={() => setModoFiltro("pendentes")}
        >
          <Text
            style={[
              s.filterTabText,
              modoFiltro === "pendentes" && s.filterTabTextActive,
            ]}
          >
            Aguardando / Confirmadas ({pendentesTotal} pendente{pendentesTotal === 1 ? "" : "s"})
          </Text>
        </TouchableOpacity>
      </View>

      {modoFiltro === "dia" && (
        <>
          <View style={s.weekStrip}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.weekScroll}
            >
              {semana.map((dia, idx) => {
                const isHoje = isSameDay(dia, hoje);
                const isSel = isSameDay(dia, diaSelecionado);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      s.dayPill,
                      isSel && s.dayPillSelected,
                      isHoje && !isSel && s.dayPillHoje,
                    ]}
                    onPress={() => setManualDia(dia)}
                  >
                    <Text style={[s.dayWeek, isSel && s.dayTextSelected]}>
                      {dia
                        .toLocaleDateString("pt-BR", { weekday: "short" })
                        .replace(".", "")
                        .toUpperCase()}
                    </Text>
                    <Text style={[s.dayNum, isSel && s.dayTextSelected]}>{dia.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={s.diaHeader}>
            <Text style={s.diaTitle}>{formatLongDate(diaSelecionado)}</Text>
            <Text style={s.countText}>{consultasExibidas.length} consulta(s)</Text>
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {consultasExibidas.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name="calendar-outline" size={56} color={colors.textMuted} />
            <Text style={s.emptyText}>Nenhum agendamento encontrado para este filtro.</Text>
          </View>
        ) : (
          consultasExibidas.map((c) => {
            const stOpt = STATUS_OPTIONS.find((o) => o.value === c.status) ?? STATUS_OPTIONS[0];
            return (
              <TouchableOpacity
                key={c.id}
                style={[s.card, { borderLeftColor: stOpt.color }]}
                onPress={() => setManualSelecionada(c)}
                activeOpacity={0.85}
              >
                <View style={s.timeColumn}>
                  <Text style={s.timeText}>{formatTime(c.dataHora)}</Text>
                  <Text style={[s.statusSmall, { color: stOpt.color }]}>{stOpt.label}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {c.origem === "tutor" && c.status === "pendente" && (
                    <View style={s.newBadge}>
                      <Text style={s.newBadgeText}>Solicitado pelo Tutor</Text>
                    </View>
                  )}
                  <Text style={s.petName}>{c.petNome}</Text>
                  <Text style={s.tutorName}>Tutor: {c.tutorNome}</Text>
                  <Text style={s.motivoText} numberOfLines={2}>
                    {c.motivo}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!selecionada} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          {selecionada && (
            <ProntuarioModalContent
              key={selecionada.id}
              consulta={selecionada}
              clinica={clinicaQuery.data}
              colors={colors}
              styles={s}
              onClose={fecharDetalhe}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

interface ProntuarioModalProps {
  consulta: Consulta;
  clinica: Clinica | null | undefined;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
  onClose: () => void;
}

function ProntuarioModalContent({
  consulta,
  clinica,
  colors,
  styles: s,
  onClose,
}: ProntuarioModalProps) {
  const updateConsulta = useUpdateConsultaVet();
  const exportReceita = useExportReceita();
  const { selectImage } = useImagePicker();

  const [novoStatus, setNovoStatus] = useState<ConsultaStatus>(consulta.status);
  const [diagnostico, setDiagnostico] = useState(consulta.diagnostico ?? "");
  const [prescricao, setPrescricao] = useState(
    consulta.prescricao || consulta.observacaoVet || ""
  );
  const [valorInput, setValorInput] = useState(
    String(consulta.valor ?? clinica?.valorConsulta ?? 150)
  );
  const [anexos, setAnexos] = useState<string[]>(consulta.anexos ?? []);

  const handleSalvarDetalhe = async () => {
    const parsedValor = parseCurrency(valorInput);

    try {
      await updateConsulta.mutateAsync({
        id: consulta.id,
        status: novoStatus,
        diagnostico,
        prescricao,
        observacaoVet: prescricao,
        anexos,
        valor: Number.isFinite(parsedValor) && parsedValor > 0 ? parsedValor : undefined,
      });
      onClose();
      Alert.alert(
        "Prontuário salvo!",
        "As informações foram sincronizadas com o tutor em tempo real."
      );
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a consulta.");
    }
  };

  const handleAdicionarAnexo = async () => {
    if (anexos.length >= 3) {
      Alert.alert("Limite atingido", "É permitido anexar até 3 imagens por consulta.");
      return;
    }
    const uri = await selectImage("library");
    if (uri) setAnexos((prev) => [...prev, uri]);
  };

  return (
    <View style={s.modalBox}>
      <View style={s.modalHeader}>
        <Text style={s.modalTitle}>Prontuário da Consulta</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.infoSummary}>
          <Text style={s.infoLine}>
            <Text style={s.infoLabel}>Paciente:</Text> {consulta.petNome}
          </Text>
          <Text style={s.infoLine}>
            <Text style={s.infoLabel}>Tutor(a):</Text> {consulta.tutorNome}
          </Text>
          <Text style={s.infoLine}>
            <Text style={s.infoLabel}>Data/Hora:</Text> {formatDateTime(consulta.dataHora)}
          </Text>
          <Text style={s.infoLine}>
            <Text style={s.infoLabel}>Motivo:</Text> {consulta.motivo}
          </Text>
        </View>

        <Text style={s.fieldLabel}>Status do Atendimento</Text>
        <View style={s.statusGrid}>
          {STATUS_OPTIONS.map((opt) => {
            const active = novoStatus === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[s.statusOption, active && { backgroundColor: opt.color }]}
                onPress={() => setNovoStatus(opt.value)}
              >
                <Text style={[s.statusOptionText, active && { color: "#fff" }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.fieldLabel}>Diagnóstico Clínico</Text>
        <TextInput
          style={s.input}
          placeholder="Descreva o diagnóstico..."
          placeholderTextColor={colors.textMuted}
          value={diagnostico}
          onChangeText={setDiagnostico}
        />

        <Text style={s.fieldLabel}>Prescrição e Recomendações</Text>
        <TextInput
          style={[s.input, s.textArea]}
          placeholder="Medicamentos, posologia e orientações..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={prescricao}
          onChangeText={setPrescricao}
        />

        <Text style={s.fieldLabel}>Valor da Consulta (R$)</Text>
        <TextInput
          style={s.input}
          placeholder="150,00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={valorInput}
          onChangeText={setValorInput}
        />

        <View style={s.anexosHeader}>
          <Text style={s.fieldLabel}>Anexos / Exames ({anexos.length}/3)</Text>
          <TouchableOpacity onPress={handleAdicionarAnexo} style={s.anexoAddBtn}>
            <Ionicons name="camera-outline" size={16} color="#8b5cf6" />
            <Text style={s.anexoAddText}>Anexar</Text>
          </TouchableOpacity>
        </View>

        {anexos.length > 0 && (
          <View style={s.anexosRow}>
            {anexos.map((uri, idx) => (
              <View key={idx} style={s.anexoItem}>
                <Image source={{ uri }} style={s.anexoImg} />
                <TouchableOpacity
                  style={s.anexoRemove}
                  onPress={() => setAnexos((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={s.pdfBtn}
          onPress={() =>
            exportReceita.mutate({
              consulta: {
                ...consulta,
                diagnostico,
                prescricao,
                observacaoVet: prescricao,
              },
              clinica: clinica ?? undefined,
            })
          }
        >
          <Ionicons name="document-text-outline" size={18} color="#8b5cf6" />
          <Text style={s.pdfBtnText}>Gerar Receituário em PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.saveBtn}
          onPress={handleSalvarDetalhe}
          disabled={updateConsulta.isPending}
        >
          <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />
          <Text style={s.saveBtnText}>
            {updateConsulta.isPending ? "Salvando..." : "Salvar Alterações"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#8b5cf6",
      justifyContent: "center",
      alignItems: "center",
    },
    filterTabs: {
      flexDirection: "row",
      marginHorizontal: 24,
      marginBottom: 14,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 14,
      padding: 4,
    },
    filterTab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
    filterTabActive: { backgroundColor: "#8b5cf6" },
    filterTabText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
    filterTabTextActive: { color: "#fff" },
    weekStrip: { marginBottom: 14 },
    weekScroll: { paddingHorizontal: 24, gap: 8 },
    dayPill: {
      width: 56,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayPillSelected: { backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" },
    dayPillHoje: { borderColor: "#8b5cf6" },
    dayWeek: { fontSize: 11, fontWeight: "700", color: colors.textMuted },
    dayNum: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 2 },
    dayTextSelected: { color: "#fff" },
    diaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    diaTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      textTransform: "capitalize",
      flex: 1,
    },
    countText: { fontSize: 13, fontWeight: "bold", color: "#8b5cf6" },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    emptyContainer: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 36,
      alignItems: "center",
      marginTop: 12,
    },
    emptyText: { color: colors.textMuted, fontSize: 14, marginTop: 10, textAlign: "center" },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderLeftWidth: 4,
      elevation: 2,
    },
    timeColumn: { alignItems: "center", minWidth: 64 },
    timeText: { fontSize: 16, fontWeight: "bold", color: colors.text },
    statusSmall: { fontSize: 11, fontWeight: "700", marginTop: 4 },
    newBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#ede9fe",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginBottom: 4,
    },
    newBadgeText: { fontSize: 10, fontWeight: "bold", color: "#6d28d9" },
    petName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    tutorName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    motivoText: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 24,
      maxHeight: "90%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    infoSummary: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
      gap: 4,
    },
    infoLine: { fontSize: 13, color: colors.text },
    infoLabel: { fontWeight: "bold", color: colors.textSecondary },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 6,
    },
    statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    statusOption: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    statusOptionText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    textArea: { height: 96, textAlignVertical: "top" },
    anexosHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    anexoAddBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: "#ede9fe",
    },
    anexoAddText: { color: "#6d28d9", fontWeight: "bold", fontSize: 12 },
    anexosRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    anexoItem: { position: "relative" },
    anexoImg: { width: 76, height: 76, borderRadius: 12 },
    anexoRemove: { position: "absolute", top: -6, right: -6 },
    pdfBtn: {
      borderWidth: 1.5,
      borderColor: "#8b5cf6",
      borderRadius: 14,
      paddingVertical: 13,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    pdfBtnText: { color: "#8b5cf6", fontWeight: "bold", fontSize: 14 },
    saveBtn: {
      backgroundColor: "#8b5cf6",
      borderRadius: 14,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  });
}
