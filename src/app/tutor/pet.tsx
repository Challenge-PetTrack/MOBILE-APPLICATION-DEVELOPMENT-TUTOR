import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import PetCard from "@/components/PetCard";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useDeletePet, useExportPetRg, useTutorPets } from "@/hooks/usePets";
import { useTutorVacinas } from "@/hooks/useVacinas";
import { useTutorConsultas } from "@/hooks/useConsultas";
import {
  useCreateDiarioEntrada,
  useDeleteDiarioEntrada,
  usePetDiario,
} from "@/hooks/useDiario";
import { useImagePicker } from "@/hooks/useImagePicker";
import { VACINAS_NOMES } from "@/constants/catalogos";
import { formatDate, formatDateTime } from "@/utils/date";
import type { Pet } from "@/types/models";

export default function PetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const petsQuery = useTutorPets();
  const vacinasQuery = useTutorVacinas();
  const consultasQuery = useTutorConsultas();
  const deletePet = useDeletePet();
  const exportRg = useExportPetRg();
  const { selectImage } = useImagePicker();

  const [fichaPet, setFichaPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<"ficha" | "diario">("ficha");
  const [nota, setNota] = useState("");
  const [fotoNota, setFotoNota] = useState<string | null>(null);

  const diarioQuery = usePetDiario(fichaPet?.id);
  const createDiario = useCreateDiarioEntrada();
  const deleteDiario = useDeleteDiarioEntrada();

  const vacinasDoPet = useMemo(
    () => (vacinasQuery.data ?? []).filter((v) => v.petId === fichaPet?.id && v.tomada),
    [vacinasQuery.data, fichaPet?.id]
  );

  const consultasDoPet = useMemo(
    () =>
      (consultasQuery.data ?? []).filter(
        (c) =>
          (c.petId && c.petId === fichaPet?.id) ||
          c.petNome.toLowerCase() === fichaPet?.nome.toLowerCase()
      ),
    [consultasQuery.data, fichaPet?.id, fichaPet?.nome]
  );

  const confirmarExclusao = (pet: Pet) => {
    Alert.alert(
      "Remover Pet",
      `Deseja remover ${pet.nome} e todos os seus registros médicos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => deletePet.mutate({ id: pet.id, tutorId: pet.tutorId }),
        },
      ]
    );
  };

  const handleSalvarNota = async () => {
    if ((!nota.trim() && !fotoNota) || !fichaPet) return;
    try {
      await createDiario.mutateAsync({
        petId: fichaPet.id,
        texto: nota,
        fotoUri: fotoNota,
      });
      setNota("");
      setFotoNota(null);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a anotação no diário.");
    }
  };

  if (petsQuery.isLoading) return <LoadingScreen message="Carregando seus pets..." />;
  if (petsQuery.isError) return <ErrorScreen onRetry={() => petsQuery.refetch()} />;

  const pets = petsQuery.data ?? [];

  return (
    <View style={s.container}>
      <Header
        title="Meus Pets"
        rightAction={
          <TouchableOpacity
            style={s.addHeaderBtn}
            onPress={() => router.push("/tutor/cadastro-pet")}
            accessibilityLabel="Cadastrar novo pet"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {pets.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title="Nenhum pet cadastrado"
          message="Cadastre seu primeiro pet para liberar vacinas, medicamentos, prontuário e RG em PDF."
          actionLabel="Cadastrar um Pet"
          onAction={() => router.push("/tutor/cadastro-pet")}
        />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              onEdit={() =>
                router.push({ pathname: "/tutor/editar-pet", params: { id: item.id } })
              }
              onDelete={() => confirmarExclusao(item)}
              onOpenFicha={() => {
                setFichaPet(item);
                setActiveTab("ficha");
              }}
            />
          )}
        />
      )}

      <Modal visible={!!fichaPet} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{fichaPet?.nome}</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={s.rgButton}
                  onPress={() =>
                    fichaPet &&
                    exportRg.mutate({
                      pet: fichaPet,
                      vacinas: (vacinasQuery.data ?? []).filter((v) => v.petId === fichaPet.id),
                    })
                  }
                >
                  <Ionicons name="id-card-outline" size={18} color="#fff" />
                  <Text style={s.rgButtonText}>RG PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFichaPet(null);
                    setNota("");
                    setFotoNota(null);
                  }}
                  style={s.closeModalButton}
                >
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.tabsContainer}>
              <TouchableOpacity
                style={[s.tab, activeTab === "ficha" && s.activeTab]}
                onPress={() => setActiveTab("ficha")}
              >
                <Text style={[s.tabText, activeTab === "ficha" && s.activeTabText]}>
                  Ficha Médica
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tab, activeTab === "diario" && s.activeTab]}
                onPress={() => setActiveTab("diario")}
              >
                <Text style={[s.tabText, activeTab === "diario" && s.activeTabText]}>
                  Diário
                </Text>
              </TouchableOpacity>
            </View>

            {fichaPet && activeTab === "ficha" && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {fichaPet.fotoUri && (
                  <View style={s.fichaPhotoContainer}>
                    <Image source={{ uri: fichaPet.fotoUri }} style={s.fichaPhoto} />
                  </View>
                )}

                <View style={s.fichaSection}>
                  <Text style={s.fichaSectionTitle}>Identificação</Text>
                  <Text style={s.fichaData}>
                    <Text style={s.fichaLabel}>Nome:</Text> {fichaPet.nome}
                  </Text>
                  <Text style={s.fichaData}>
                    <Text style={s.fichaLabel}>Espécie:</Text> {fichaPet.especie}
                  </Text>
                  <Text style={s.fichaData}>
                    <Text style={s.fichaLabel}>Raça:</Text> {fichaPet.raca || "Não informada"}
                  </Text>
                  <Text style={s.fichaData}>
                    <Text style={s.fichaLabel}>Idade:</Text>{" "}
                    {fichaPet.idade ? `${fichaPet.idade} anos` : "-"}
                  </Text>
                  <Text style={s.fichaData}>
                    <Text style={s.fichaLabel}>Peso:</Text>{" "}
                    {fichaPet.peso ? `${fichaPet.peso} kg` : "-"}
                  </Text>
                </View>

                <View style={s.fichaSection}>
                  <Text style={s.fichaSectionTitle}>Imunização Realizada</Text>
                  {vacinasDoPet.length > 0 ? (
                    vacinasDoPet.map((v) => (
                      <View key={v.id} style={s.vacinaRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={s.vacinaNome}>
                          {VACINAS_NOMES[v.vacinaId] ?? v.vacinaId}
                        </Text>
                        <Text style={s.vacinaData}>{formatDate(v.dataAplicacao)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={s.fichaEmptyText}>Nenhuma vacina registrada.</Text>
                  )}
                </View>

                <View style={s.fichaSection}>
                  <Text style={s.fichaSectionTitle}>Histórico Clínico</Text>
                  {consultasDoPet.length > 0 ? (
                    consultasDoPet.map((c) => (
                      <View key={c.id} style={s.historicoItem}>
                        <Text style={s.historicoDate}>
                          {formatDateTime(c.dataHora)} • {c.status.toUpperCase()}
                        </Text>
                        <Text style={s.historicoMotivo}>{c.motivo}</Text>
                        {c.diagnostico ? (
                          <Text style={s.historicoObs}>Diagnóstico: {c.diagnostico}</Text>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <Text style={s.fichaEmptyText}>Nenhuma consulta registrada.</Text>
                  )}
                </View>
              </ScrollView>
            )}

            {fichaPet && activeTab === "diario" && (
              <View style={{ flex: 1 }}>
                <View style={s.diarioInputContainer}>
                  <TextInput
                    style={s.diarioInput}
                    placeholder="Registre um momento ou observação de saúde..."
                    placeholderTextColor={colors.textMuted}
                    value={nota}
                    onChangeText={setNota}
                    multiline
                  />
                  {fotoNota && (
                    <View style={s.diarioPreviewContainer}>
                      <Image source={{ uri: fotoNota }} style={s.diarioPreview} />
                      <TouchableOpacity
                        onPress={() => setFotoNota(null)}
                        style={s.diarioPreviewRemove}
                      >
                        <Ionicons name="close-circle" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={s.diarioActions}>
                    <TouchableOpacity
                      onPress={async () => {
                        const uri = await selectImage("library");
                        if (uri) setFotoNota(uri);
                      }}
                      style={s.diarioBtnIcon}
                    >
                      <Ionicons name="image-outline" size={22} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSalvarNota}
                      style={s.diarioBtnSave}
                      disabled={createDiario.isPending}
                    >
                      <Text style={s.diarioBtnSaveText}>
                        {createDiario.isPending ? "Salvando..." : "Registrar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                >
                  {(diarioQuery.data ?? []).length === 0 ? (
                    <Text style={s.fichaEmptyText}>
                      O diário está vazio. Registre momentos e observações do seu pet!
                    </Text>
                  ) : (
                    (diarioQuery.data ?? []).map((item) => (
                      <View key={item.id} style={s.diarioCard}>
                        <View style={s.diarioCardHeader}>
                          <Text style={s.diarioDate}>{formatDateTime(item.data)}</Text>
                          <TouchableOpacity onPress={() => deleteDiario.mutate(item.id)}>
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                        {item.texto ? <Text style={s.diarioText}>{item.texto}</Text> : null}
                        {item.fotoUri ? (
                          <Image source={{ uri: item.fotoUri }} style={s.diarioImage} />
                        ) : null}
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addHeaderBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#4f46e5",
      justifyContent: "center",
      alignItems: "center",
    },
    listContainer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      height: "86%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: { fontSize: 22, fontWeight: "bold", color: colors.text },
    rgButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#10b981",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    rgButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    closeModalButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 4,
      marginBottom: 18,
    },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    activeTab: { backgroundColor: "#4f46e5" },
    tabText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
    activeTabText: { color: "#fff" },
    fichaPhotoContainer: { alignItems: "center", marginBottom: 18 },
    fichaPhoto: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: "#4f46e5" },
    fichaSection: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
    },
    fichaSectionTitle: { fontSize: 15, fontWeight: "bold", color: "#4f46e5", marginBottom: 10 },
    fichaData: { fontSize: 14, color: colors.text, marginBottom: 6 },
    fichaLabel: { fontWeight: "bold", color: colors.textSecondary },
    vacinaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    vacinaNome: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "600" },
    vacinaData: { fontSize: 12, color: colors.textMuted },
    historicoItem: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 8,
    },
    historicoDate: { fontSize: 12, color: "#0d9488", fontWeight: "700" },
    historicoMotivo: { fontSize: 14, color: colors.text, fontWeight: "600", marginTop: 2 },
    historicoObs: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    fichaEmptyText: { fontSize: 14, color: colors.textMuted, textAlign: "center", paddingVertical: 12 },
    diarioInputContainer: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
    },
    diarioInput: { minHeight: 56, fontSize: 15, color: colors.text, textAlignVertical: "top" },
    diarioPreviewContainer: { marginTop: 10, position: "relative", alignSelf: "flex-start" },
    diarioPreview: { width: 88, height: 88, borderRadius: 12 },
    diarioPreviewRemove: { position: "absolute", top: -8, right: -8 },
    diarioActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
    },
    diarioBtnIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    diarioBtnSave: {
      backgroundColor: "#4f46e5",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    diarioBtnSaveText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    diarioCard: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },
    diarioCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    diarioDate: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
    diarioText: { fontSize: 14, color: colors.text, lineHeight: 20 },
    diarioImage: { width: "100%", height: 170, borderRadius: 12, marginTop: 10 },
  });
}
