import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Pet = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  peso: string;
  createdAt: string;
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
      const savedPets = await AsyncStorage.getItem("@pets");
      if (savedPets) {
        setPets(JSON.parse(savedPets));
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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="paw" size={24} color="#4f46e5" />
          <Text style={styles.petName}>{item.nome}</Text>
        </View>
        <TouchableOpacity onPress={() => removePet(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Espécie:</Text>
          <Text style={styles.infoValue}>{item.especie}</Text>
        </View>
        {item.raca ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Raça:</Text>
            <Text style={styles.infoValue}>{item.raca}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          {item.idade ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Idade</Text>
              <Text style={styles.infoBoxValue}>{item.idade} anos</Text>
            </View>
          ) : null}
          {item.peso ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Peso</Text>
              <Text style={styles.infoBoxValue}>{item.peso} kg</Text>
            </View>
          ) : null}
        </View>
        
        <TouchableOpacity style={styles.fichaButton} onPress={() => abrirFicha(item)}>
          <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.fichaButtonText}>Gerar Ficha Clínica</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Pets</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : pets.length > 0 ? (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPetCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptySubtitle}>Você ainda não possui nenhum pet na sua lista.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/cadastro")}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Cadastrar um Pet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Ficha Clínica */}
      <Modal visible={!!fichaPet} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico Veterinário</Text>
              <TouchableOpacity onPress={fecharFicha} style={styles.closeModalButton}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {fichaPet && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.fichaSection}>
                  <Text style={styles.fichaSectionTitle}>Dados do Pet</Text>
                  <Text style={styles.fichaData}><Text style={styles.fichaLabel}>Nome:</Text> {fichaPet.nome}</Text>
                  <Text style={styles.fichaData}><Text style={styles.fichaLabel}>Espécie:</Text> {fichaPet.especie}</Text>
                  <Text style={styles.fichaData}><Text style={styles.fichaLabel}>Raça:</Text> {fichaPet.raca || "Não informada"}</Text>
                  <Text style={styles.fichaData}><Text style={styles.fichaLabel}>Idade:</Text> {fichaPet.idade || "-"} anos</Text>
                  <Text style={styles.fichaData}><Text style={styles.fichaLabel}>Peso:</Text> {fichaPet.peso || "-"} kg</Text>
                </View>

                <View style={styles.fichaSection}>
                  <Text style={styles.fichaSectionTitle}>Imunização Realizada</Text>
                  {getVacinasTomadas(fichaPet.id).length > 0 ? (
                    getVacinasTomadas(fichaPet.id).map((v, i) => (
                      <View key={i} style={styles.vacinaFichaItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={styles.vacinaFichaNome}>{v.nome}</Text>
                        <Text style={styles.vacinaFichaData}>{v.data}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.fichaEmptyText}>Nenhuma vacina registrada para este pet.</Text>
                  )}
                </View>

                <View style={styles.fichaFooter}>
                  <Text style={styles.fichaFooterText}>Gerado via PetTrack App</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
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
    color: "#1a1a2e",
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
    color: "#4b5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
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
    backgroundColor: "#fff",
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
    borderBottomColor: "#f3f4f6",
    paddingBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 12,
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
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  infoBoxLabel: {
    fontSize: 12,
    color: "#6b7280",
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
    backgroundColor: "#fff",
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
    color: "#1a1a2e",
  },
  closeModalButton: {
    padding: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
  },
  fichaSection: {
    marginBottom: 24,
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  fichaSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  fichaData: {
    fontSize: 15,
    color: "#1f2937",
    marginBottom: 8,
  },
  fichaLabel: {
    fontWeight: "600",
    color: "#6b7280",
  },
  vacinaFichaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vacinaFichaNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  vacinaFichaData: {
    fontSize: 13,
    color: "#6b7280",
  },
  fichaEmptyText: {
    fontSize: 14,
    color: "#9ca3af",
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
    color: "#9ca3af",
    fontWeight: "500",
  },
});
