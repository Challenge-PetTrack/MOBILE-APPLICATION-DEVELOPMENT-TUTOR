import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import PetSelectorBar from "@/components/PetSelectorBar";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useTutorPets } from "@/hooks/usePets";
import {
  computeDoseSchedule,
  useCreateMedicamento,
  useDeleteMedicamento,
  useRegistrarCuidado,
  useRegistrarDoseMedicamento,
  useToggleMedicamentoAtivo,
  useTutorCuidados,
  useTutorMedicamentos,
} from "@/hooks/useMedicamentos";
import { CATALOGO_CUIDADOS, FREQUENCIAS_MEDICAMENTO } from "@/constants/catalogos";
import { formatDate, formatDateTime, isValidTime, maskTime } from "@/utils/date";
import type { CuidadoPreventivo, Pet } from "@/types/models";

const EMPTY_PETS: Pet[] = [];

export default function MedicamentosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string; medId?: string; tab?: string }>();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const petsQuery = useTutorPets();
  const medsQuery = useTutorMedicamentos();
  const cuidadosQuery = useTutorCuidados();

  const createMed = useCreateMedicamento();
  const registrarDose = useRegistrarDoseMedicamento();
  const toggleAtivo = useToggleMedicamentoAtivo();
  const deleteMed = useDeleteMedicamento();
  const registrarCuidado = useRegistrarCuidado();

  const pets = petsQuery.data ?? EMPTY_PETS;
  const medsData = medsQuery.data;
  const cuidadosData = cuidadosQuery.data;

  const routeKey = `${params.petId ?? ""}:${params.medId ?? ""}:${params.tab ?? ""}`;
  const [petOverride, setPetOverride] = useState<{ key: string; petId: string } | null>(null);
  const [tabOverride, setTabOverride] = useState<{
    key: string;
    tab: "tratamentos" | "preventivos";
  } | null>(null);

  const selectedPetId = useMemo(() => {
    const candidate =
      petOverride && petOverride.key === routeKey ? petOverride.petId : params.petId ?? null;
    if (candidate && pets.some((p) => p.id === candidate)) return candidate;
    return pets[0]?.id ?? null;
  }, [pets, petOverride, params.petId, routeKey]);

  const setSelectedPetId = (petId: string) => setPetOverride({ key: routeKey, petId });

  const activeTab: "tratamentos" | "preventivos" =
    tabOverride && tabOverride.key === routeKey
      ? tabOverride.tab
      : params.tab === "preventivos"
      ? "preventivos"
      : "tratamentos";

  const setActiveTab = (tab: "tratamentos" | "preventivos") =>
    setTabOverride({ key: routeKey, tab });

  // Modal de novo medicamento
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [frequenciaHoras, setFrequenciaHoras] = useState<number>(8);
  const [horarioInicial, setHorarioInicial] = useState("08:00");
  const [observacao, setObservacao] = useState("");

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const medsDoPet = useMemo(
    () => (medsData ?? []).filter((m) => m.petId === selectedPetId),
    [medsData, selectedPetId]
  );

  const cuidadosMap = useMemo(() => {
    const map = new Map<string, CuidadoPreventivo>();
    (cuidadosData ?? [])
      .filter((c) => c.petId === selectedPetId)
      .forEach((c) => map.set(c.tipo, c));
    return map;
  }, [cuidadosData, selectedPetId]);

  const handleCriarMedicamento = async () => {
    if (!selectedPet) return;
    if (!nome.trim() || !dosagem.trim()) {
      Alert.alert("Atenção", "Informe o nome do medicamento e a dosagem.");
      return;
    }
    if (!isValidTime(horarioInicial)) {
      Alert.alert("Horário inválido", "Informe um horário válido no formato HH:MM (ex.: 08:00).");
      return;
    }

    try {
      await createMed.mutateAsync({
        pet: selectedPet,
        nome,
        dosagem,
        frequenciaHoras,
        horarioInicial,
        observacao,
      });
      setNome("");
      setDosagem("");
      setObservacao("");
      setHorarioInicial("08:00");
      setFrequenciaHoras(8);
      setModalVisible(false);
      Alert.alert(
        "Lembretes agendados!",
        `As notificações diárias das doses de ${nome.trim()} foram configuradas automaticamente.`
      );
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o medicamento.");
    }
  };

  if (petsQuery.isLoading || medsQuery.isLoading || cuidadosQuery.isLoading) {
    return <LoadingScreen message="Carregando medicamentos e lembretes..." />;
  }
  if (petsQuery.isError || medsQuery.isError || cuidadosQuery.isError) {
    return (
      <ErrorScreen
        onRetry={() => {
          petsQuery.refetch();
          medsQuery.refetch();
          cuidadosQuery.refetch();
        }}
      />
    );
  }

  return (
    <View style={s.container}>
      <Header
        title="Medicamentos"
        rightAction={
          pets.length > 0 && activeTab === "tratamentos" ? (
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Adicionar medicamento"
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {pets.length === 0 ? (
        <EmptyState
          icon="medical-outline"
          title="Nenhum pet encontrado"
          message="Cadastre um pet primeiro para agendar medicamentos e cuidados preventivos."
          actionLabel="Cadastrar um Pet"
          onAction={() => router.push("/tutor/cadastro-pet")}
        />
      ) : (
        <>
          <PetSelectorBar
            pets={pets}
            selectedPetId={selectedPetId}
            onSelect={setSelectedPetId}
            accentColor="#ec4899"
          />

          <View style={s.tabsBar}>
            <TouchableOpacity
              style={[s.tabBtn, activeTab === "tratamentos" && s.tabBtnActive]}
              onPress={() => setActiveTab("tratamentos")}
            >
              <Text style={[s.tabText, activeTab === "tratamentos" && s.tabTextActive]}>
                Tratamentos ({medsDoPet.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tabBtn, activeTab === "preventivos" && s.tabBtnActive]}
              onPress={() => setActiveTab("preventivos")}
            >
              <Text style={[s.tabText, activeTab === "preventivos" && s.tabTextActive]}>
                Preventivos
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {activeTab === "tratamentos" ? (
              medsDoPet.length === 0 ? (
                <View style={s.emptyCard}>
                  <Ionicons name="notifications-outline" size={44} color="#ec4899" />
                  <Text style={s.emptyTitle}>Nenhum tratamento cadastrado</Text>
                  <Text style={s.emptyText}>
                    Adicione medicamentos com horário e frequência para receber alertas automáticos nas horas das doses.
                  </Text>
                  <TouchableOpacity style={s.primaryBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={s.primaryBtnText}>Novo Medicamento</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                medsDoPet.map((med) => {
                  const horarios = computeDoseSchedule(med.horarioInicial, med.frequenciaHoras);
                  const highlighted = params.medId === med.id;
                  return (
                    <View
                      key={med.id}
                      style={[
                        s.card,
                        highlighted && s.cardHighlighted,
                        !med.ativo && { opacity: 0.65 },
                      ]}
                    >
                      <View style={s.cardTop}>
                        <View style={s.medIconBox}>
                          <Ionicons name="medical" size={22} color="#ec4899" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.medName}>{med.nome}</Text>
                          <Text style={s.medSub}>
                            {med.dosagem} • a cada {med.frequenciaHoras}h
                          </Text>
                        </View>
                        <Switch
                          value={med.ativo}
                          onValueChange={() => toggleAtivo.mutate(med)}
                          trackColor={{ false: colors.border, true: "#fbcfe8" }}
                          thumbColor={med.ativo ? "#ec4899" : colors.surfaceSecondary}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              "Excluir Medicamento",
                              `Deseja excluir ${med.nome} e cancelar seus lembretes?`,
                              [
                                { text: "Cancelar", style: "cancel" },
                                {
                                  text: "Excluir",
                                  style: "destructive",
                                  onPress: () => deleteMed.mutate(med.id),
                                },
                              ]
                            )
                          }
                          style={{ padding: 6 }}
                        >
                          <Ionicons name="trash-outline" size={19} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      <View style={s.scheduleRow}>
                        {horarios.map((h) => (
                          <View key={h} style={s.timeBadge}>
                            <Ionicons name="alarm-outline" size={13} color="#ec4899" />
                            <Text style={s.timeBadgeText}>{h}</Text>
                          </View>
                        ))}
                      </View>

                      {med.observacao ? (
                        <Text style={s.obsText}>{med.observacao}</Text>
                      ) : null}

                      <Text style={s.lastDoseText}>
                        Última dose administrada:{" "}
                        <Text style={{ fontWeight: "700", color: colors.text }}>
                          {med.ultimaDose ? formatDateTime(med.ultimaDose) : "Ainda não registrada"}
                        </Text>
                      </Text>

                      <TouchableOpacity
                        style={s.doseBtn}
                        onPress={() => registrarDose.mutate(med)}
                        disabled={registrarDose.isPending}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={s.doseBtnText}>Registrar Dose Administrada Agora</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )
            ) : (
              CATALOGO_CUIDADOS.map((item) => {
                const status = cuidadosMap.get(item.id);
                return (
                  <View key={item.id} style={s.card}>
                    <View style={s.cardTop}>
                      <View
                        style={[
                          s.medIconBox,
                          { backgroundColor: `${item.color}20` },
                        ]}
                      >
                        <Ionicons name={item.icone} size={22} color={item.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.medName}>{item.nome}</Text>
                        <Text style={s.medSub}>Intervalo: a cada {item.intervaloDias} dias</Text>
                      </View>
                    </View>

                    <View style={s.preventivoDates}>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={s.dateLabel}>Última aplicação</Text>
                        <Text style={s.dateValue}>
                          {status ? formatDate(status.ultimaAplicacao) : "Nunca"}
                        </Text>
                      </View>
                      <View style={s.verticalDivider} />
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={s.dateLabel}>Próxima dose</Text>
                        <Text style={[s.dateValue, { color: item.color }]}>
                          {status ? formatDate(status.proximaAplicacao) : "Pendente"}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[s.doseBtn, { backgroundColor: item.color }]}
                      onPress={() =>
                        selectedPet &&
                        registrarCuidado.mutate({
                          pet: selectedPet,
                          tipo: item.id,
                          intervaloDias: item.intervaloDias,
                        })
                      }
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={s.doseBtnText}>Registrar Aplicação Hoje</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Novo Medicamento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.label}>Medicamento *</Text>
              <TextInput
                style={s.input}
                placeholder="Ex.: Amoxicilina, Prednisolona..."
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
              />

              <Text style={s.label}>Dosagem *</Text>
              <TextInput
                style={s.input}
                placeholder="Ex.: 1 comprimido (250 mg) ou 5 ml"
                placeholderTextColor={colors.textMuted}
                value={dosagem}
                onChangeText={setDosagem}
              />

              <Text style={s.label}>Frequência das Doses</Text>
              <View style={s.freqRow}>
                {FREQUENCIAS_MEDICAMENTO.map((f) => {
                  const active = frequenciaHoras === f.value;
                  return (
                    <TouchableOpacity
                      key={f.value}
                      style={[s.freqChip, active && s.freqChipActive]}
                      onPress={() => setFrequenciaHoras(f.value)}
                    >
                      <Text style={[s.freqChipText, active && { color: "#fff" }]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.label}>Horário da 1ª Dose (HH:MM) *</Text>
              <TextInput
                style={s.input}
                placeholder="08:00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={horarioInicial}
                onChangeText={(txt) => setHorarioInicial(maskTime(txt))}
              />

              <Text style={s.label}>Observações (opcional)</Text>
              <TextInput
                style={[s.input, { height: 72, textAlignVertical: "top" }]}
                placeholder="Ex.: Dar junto com a ração..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={observacao}
                onChangeText={setObservacao}
              />

              <TouchableOpacity
                style={s.primaryBtn}
                onPress={handleCriarMedicamento}
                disabled={createMed.isPending}
              >
                <Ionicons name="notifications-outline" size={18} color="#fff" />
                <Text style={s.primaryBtnText}>
                  {createMed.isPending ? "Salvando..." : "Salvar e Agendar Lembretes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
      backgroundColor: "#ec4899",
      justifyContent: "center",
      alignItems: "center",
    },
    tabsBar: {
      flexDirection: "row",
      marginHorizontal: 24,
      marginBottom: 16,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 14,
      padding: 4,
    },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    tabBtnActive: { backgroundColor: "#ec4899" },
    tabText: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
    tabTextActive: { color: "#fff" },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 28,
      alignItems: "center",
    },
    emptyTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 12 },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 6,
      marginBottom: 20,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      elevation: 2,
    },
    cardHighlighted: { borderWidth: 2, borderColor: "#ec4899" },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    medIconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#ec489920",
      justifyContent: "center",
      alignItems: "center",
    },
    medName: { fontSize: 17, fontWeight: "bold", color: colors.text },
    medSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    scheduleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
    timeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#ec489918",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    timeBadgeText: { fontSize: 13, fontWeight: "bold", color: "#ec4899" },
    obsText: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
    lastDoseText: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
    doseBtn: {
      backgroundColor: "#ec4899",
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
    doseBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    preventivoDates: {
      flexDirection: "row",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    verticalDivider: { width: 1, backgroundColor: colors.border },
    dateLabel: { fontSize: 12, color: colors.textMuted },
    dateValue: { fontSize: 15, fontWeight: "bold", color: colors.text, marginTop: 2 },
    primaryBtn: {
      backgroundColor: "#ec4899",
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 24,
      maxHeight: "88%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
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
    freqRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    freqChip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
    },
    freqChipActive: { backgroundColor: "#ec4899" },
    freqChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  });
}
