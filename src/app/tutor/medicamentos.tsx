import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { usePets } from "@/hooks/usePets";
import { useMedicamentos, useCreateMedicamento, useUpdateMedicamento, useDeleteMedicamento } from "@/hooks/useMedicamentos";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import EmptyState from "@/components/EmptyState";

export default function MedicamentosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  
  const { user } = useAuth();
  const { data: pets = [], isLoading: loadingPets, isError: errorPets } = usePets(user?.id);

  const [selectedPetId, setSelectedPetId] = useState<number | undefined>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  
  const { data: medicamentos = [], isLoading: loadingMed, isError: errorMed } = useMedicamentos(selectedPetId);
  const { mutate: createMed, isPending: isCreating } = useCreateMedicamento();
  const { mutate: updateMed, isPending: isUpdating } = useUpdateMedicamento();
  const { mutate: deleteMed, isPending: isDeleting } = useDeleteMedicamento();

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const openAddModal = () => {
    setEditingId(null);
    setNome("");
    setDosagem("");
    setFrequencia("");
    setDataInicio(new Date().toLocaleDateString('pt-BR'));
    setIsModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setNome(item.nome);
    setDosagem(item.dosagem || "");
    setFrequencia(item.frequencia || "");
    setDataInicio(item.dataInicio || new Date().toLocaleDateString('pt-BR'));
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!selectedPetId) return;
    
    const payload = {
      petId: selectedPetId,
      nome,
      tipo: 'medicamento', // Adicionado para satisfazer MedicamentoDTO
      dosagem,
      frequencia,
      dataInicio
    };

    if (editingId) {
      updateMed({ id: editingId, data: payload }, {
        onSuccess: () => setIsModalVisible(false)
      });
    } else {
      createMed(payload, {
        onSuccess: () => setIsModalVisible(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMed(id);
  };

  if (loadingPets) return <LoadingScreen message="Carregando pets..." />;
  if (errorPets) return <ErrorScreen message="Erro ao carregar pets" />;

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <EmptyState
        icon="paw-outline"
        message="Nenhum pet encontrado.\nCadastre um pet primeiro para organizar os medicamentos."
      />
      <TouchableOpacity 
        style={{ marginTop: 16, backgroundColor: '#8b5cf6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
        onPress={() => router.push("/tutor/cadastro-pet")}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cadastrar um Pet</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Medicamentos</Text>
        <TouchableOpacity onPress={openAddModal} style={s.addIconBtn}>
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={s.petSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petSelectorScroll}>
              {pets.map((pet: any) => {
                const isSelected = pet.id === selectedPetId;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[s.petPill, isSelected && s.petPillSelected]}
                    onPress={() => setSelectedPetId(pet.id)}
                  >
                    <Ionicons 
                      name="paw" 
                      size={16} 
                      color={isSelected ? "#fff" : colors.textSecondary} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[s.petPillText, isSelected && s.petPillTextSelected]}>
                      {pet.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {loadingMed ? (
            <LoadingScreen message="Carregando medicamentos..." />
          ) : errorMed ? (
            <ErrorScreen message="Erro ao carregar medicamentos" />
          ) : medicamentos.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <EmptyState
                icon="medical-outline"
                message="Sem medicamentos.\nEste pet não possui medicamentos cadastrados."
              />
              <TouchableOpacity 
                style={{ marginTop: 16, backgroundColor: '#ec4899', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
                onPress={openAddModal}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Adicionar Medicamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={medicamentos}
              keyExtractor={(item: any) => item.id.toString()}
              contentContainerStyle={s.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <View style={[s.iconContainer, { backgroundColor: '#ec489920' }]}>
                      <Ionicons name="medical" size={24} color="#ec4899" />
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={s.lembreteNome}>{item.nome}</Text>
                      {item.dosagem ? <Text style={s.intervaloTag}>Dosagem: {item.dosagem}</Text> : null}
                    </View>
                    <View style={s.actions}>
                      <TouchableOpacity onPress={() => openEditModal(item)} style={s.actionBtn}>
                        <Ionicons name="pencil" size={20} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => item.id && handleDelete(item.id)} style={s.actionBtn} disabled={isDeleting}>
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                          <Ionicons name="trash" size={20} color="#ef4444" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={s.datasBox}>
                    <View style={s.dataItem}>
                      <Text style={s.dataLabel}>Frequência:</Text>
                      <Text style={s.dataValue}>{item.frequencia || "-"}</Text>
                    </View>
                    <View style={s.dataDivider} />
                    <View style={s.dataItem}>
                      <Text style={s.dataLabel}>Início:</Text>
                      <Text style={[s.dataValue, { color: "#ec4899" }]}>{item.dataInicio || "-"}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editingId ? "Editar Medicamento" : "Novo Medicamento"}</Text>
            
            <TextInput style={s.input} placeholder="Nome do medicamento" placeholderTextColor={colors.textMuted} value={nome} onChangeText={setNome} />
            <TextInput style={s.input} placeholder="Dosagem (ex: 1 comprimido)" placeholderTextColor={colors.textMuted} value={dosagem} onChangeText={setDosagem} />
            <TextInput style={s.input} placeholder="Frequência (ex: a cada 12h)" placeholderTextColor={colors.textMuted} value={frequencia} onChangeText={setFrequencia} />
            <TextInput style={s.input} placeholder="Data de Início" placeholderTextColor={colors.textMuted} value={dataInicio} onChangeText={setDataInicio} />
            
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setIsModalVisible(false)} disabled={isCreating || isUpdating}>
                <Text style={s.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnSave]} onPress={handleSave} disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.modalBtnSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.background },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  addIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  title: { fontSize: 22, fontWeight: "bold", color: colors.text },
  petSelectorContainer: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  petSelectorScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  petPill: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceSecondary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "transparent" },
  petPillSelected: { backgroundColor: "#ec4899", borderColor: "#db2777", shadowColor: "#ec4899", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  petPillText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  petPillTextSelected: { color: "#fff" },
  listContainer: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 16 },
  cardInfo: { flex: 1 },
  lembreteNome: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 4 },
  intervaloTag: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
  actionBtn: { padding: 4 },
  datasBox: { flexDirection: "row", backgroundColor: colors.surfaceSecondary, borderRadius: 12, padding: 16 },
  dataItem: { flex: 1, alignItems: "center" },
  dataLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  dataValue: { fontSize: 15, fontWeight: "bold", color: colors.text },
  dataDivider: { width: 1, backgroundColor: colors.border },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 16, textAlign: "center" },
  input: { backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalBtnCancel: { backgroundColor: colors.surfaceSecondary },
  modalBtnCancelText: { color: colors.text, fontWeight: "bold", fontSize: 16 },
  modalBtnSave: { backgroundColor: "#ec4899" },
  modalBtnSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
