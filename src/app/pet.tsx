import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView, Image } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";

type Pet = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  peso: string;
  createdAt: string;
  fotoUri?: string | null;
  userId?: string;
};

const VACINAS_MAP: Record<string, string> = {
  v10: "V8 / V10 (Múltipla Canina)",
  raiva: "Antirrábica",
  gripe: "Gripe Canina",
  giardia: "Giárdia",
  leishmaniose: "Leishmaniose",
  v5: "V4 / V5 (Múltipla Felina)",
};

export default function PetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [pets, setPets] = useState<Pet[]>([]);
  const [vacinasRecord, setVacinasRecord] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [fichaPet, setFichaPet] = useState<Pet | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);

      const savedPets = await AsyncStorage.getItem("@pets");
      if (savedPets) {
        const allPets = JSON.parse(savedPets);
        setPets(allPets.filter((p: any) => p.userId === user.id));
      } else {
        setPets([]);
      }

      const vacinasData = await AsyncStorage.getItem("@vacinas_por_pet");
      if (vacinasData) {
        setVacinasRecord(JSON.parse(vacinasData));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const removePet = async (id: string) => {
    try {
      const updatedPets = pets.filter(pet => pet.id !== id);
      await AsyncStorage.setItem("@pets", JSON.stringify(updatedPets));
      setPets(updatedPets);
    } catch (error) {
      console.error("Erro ao remover pet:", error);
    }
  };

  const abrirFicha = (pet: Pet) => {
    setFichaPet(pet);
  };

  const fecharFicha = () => {
    setFichaPet(null);
  };

  const getVacinasTomadas = (petId: string) => {
    const registrosPet = vacinasRecord[petId] || {};
    const tomadas = [];
    for (const [vacinaId, status] of Object.entries<any>(registrosPet)) {
      if (status.tomada) {
        tomadas.push({ nome: VACINAS_MAP[vacinaId] || vacinaId, data: status.dataAplicacao });
      }
    }
    return tomadas;
  };

  const renderPetCard = ({ item }: { item: Pet }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.cardTitleContainer}>
          {item.fotoUri ? (
            <Image source={{ uri: item.fotoUri }} style={s.petAvatar} />
          ) : (
            <View style={s.petAvatarPlaceholder}>
              <Ionicons name="paw" size={22} color="#4f46e5" />
            </View>
          )}
          <Text style={s.petName}>{item.nome}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity onPress={() => router.push({ pathname: "/editar-pet", params: { id: item.id } })} style={s.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removePet(item.id)} style={s.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={s.cardBody}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Espécie:</Text>
          <Text style={s.infoValue}>{item.especie}</Text>
        </View>
        {item.raca ? (
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Raça:</Text>
            <Text style={s.infoValue}>{item.raca}</Text>
          </View>
        ) : null}
        <View style={s.row}>
          {item.idade ? (
            <View style={s.infoBox}>
              <Text style={s.infoBoxLabel}>Idade</Text>
              <Text style={s.infoBoxValue}>{item.idade} anos</Text>
            </View>
          ) : null}
          {item.peso ? (
            <View style={s.infoBox}>
              <Text style={s.infoBoxLabel}>Peso</Text>
              <Text style={s.infoBoxValue}>{item.peso} kg</Text>
            </View>
          ) : null}
        </View>
        
        <TouchableOpacity style={s.fichaButton} onPress={() => abrirFicha(item)}>
          <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={s.fichaButtonText}>Gerar Ficha Clínica</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Meus Pets</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : pets.length > 0 ? (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPetCard}
          contentContainerStyle={s.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={s.emptyContainer}>
          <Ionicons name="sad-outline" size={64} color={colors.textMuted} />
          <Text style={s.emptyTitle}>Nenhum pet cadastrado</Text>
          <Text style={s.emptySubtitle}>Você ainda não possui nenhum pet na sua lista.</Text>
          <TouchableOpacity style={s.addButton} onPress={() => router.push("/cadastro")}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.addButtonText}>Cadastrar um Pet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Ficha Clínica */}
      <Modal visible={!!fichaPet} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Histórico Veterinário</Text>
              <TouchableOpacity onPress={fecharFicha} style={s.closeModalButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {fichaPet && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Foto do pet na ficha */}
                {fichaPet.fotoUri && (
                  <View style={s.fichaPhotoContainer}>
                    <Image source={{ uri: fichaPet.fotoUri }} style={s.fichaPhoto} />
                  </View>
                )}
                <View style={s.fichaSection}>
                  <Text style={s.fichaSectionTitle}>Dados do Pet</Text>
                  <Text style={s.fichaData}><Text style={s.fichaLabel}>Nome:</Text> {fichaPet.nome}</Text>
                  <Text style={s.fichaData}><Text style={s.fichaLabel}>Espécie:</Text> {fichaPet.especie}</Text>
                  <Text style={s.fichaData}><Text style={s.fichaLabel}>Raça:</Text> {fichaPet.raca || "Não informada"}</Text>
                  <Text style={s.fichaData}><Text style={s.fichaLabel}>Idade:</Text> {fichaPet.idade || "-"} anos</Text>
                  <Text style={s.fichaData}><Text style={s.fichaLabel}>Peso:</Text> {fichaPet.peso || "-"} kg</Text>
                </View>

                <View style={s.fichaSection}>
                  <Text style={s.fichaSectionTitle}>Imunização Realizada</Text>
                  {getVacinasTomadas(fichaPet.id).length > 0 ? (
                    getVacinasTomadas(fichaPet.id).map((v, i) => (
                      <View key={i} style={s.vacinaFichaItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={s.vacinaFichaNome}>{v.nome}</Text>
                        <Text style={s.vacinaFichaData}>{v.data}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={s.fichaEmptyText}>Nenhuma vacina registrada para este pet.</Text>
                  )}
                </View>

                <View style={s.fichaFooter}>
                  <Text style={s.fichaFooterText}>Gerado via PetTrack App</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  listContainer: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: "#4f46e5",
    flexDirection: "row",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 16,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#4f46e5",
    marginRight: 4,
  },
  petAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  fichaPhotoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  fichaPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#4f46e5",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  infoBoxLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoBoxValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  fichaButton: {
    backgroundColor: "#10b981", // Verde saúde
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  fichaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    height: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  closeModalButton: {
    padding: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
  },
  fichaSection: {
    marginBottom: 24,
    backgroundColor: colors.surfaceSecondary,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fichaSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  fichaData: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  fichaLabel: {
    fontWeight: "600",
    color: colors.textSecondary,
  },
  vacinaFichaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vacinaFichaNome: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  vacinaFichaData: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  fichaEmptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  fichaFooter: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  fichaFooterText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
