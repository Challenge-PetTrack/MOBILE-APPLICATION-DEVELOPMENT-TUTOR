import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";

const CATALOGO_LEMBRETES = [
  { id: "antipulgas", nome: "Antipulgas e Carrapatos", icone: "bug", intervaloDias: 30, color: "#ec4899" },
  { id: "vermifugo", nome: "Vermífugo", icone: "medical", intervaloDias: 90, color: "#8b5cf6" },
  { id: "banho", nome: "Banho e Tosa", icone: "water", intervaloDias: 15, color: "#0ea5e9" },
  { id: "checkup", nome: "Check-up Anual", icone: "heart", intervaloDias: 365, color: "#10b981" }
];

type LembreteStatus = {
  ultimaAplicacao: string;
  proximaAplicacao: string;
};

type Pet = {
  id: string;
  nome: string;
};

export default function MedicamentosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  
  // Estado: { [petId]: { [lembreteId]: LembreteStatus } }
  const [registros, setRegistros] = useState<Record<string, Record<string, LembreteStatus>>>({});
  const [loading, setLoading] = useState(true);

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

      const petsData = await AsyncStorage.getItem("@pets");
      let loadedPets: Pet[] = [];
      if (petsData) {
        const allPets = JSON.parse(petsData);
        loadedPets = allPets.filter((p: any) => p.userId === user.id);
        setPets(loadedPets);
      }

      const lembretesData = await AsyncStorage.getItem("@lembretes_por_pet");
      if (lembretesData) {
        setRegistros(JSON.parse(lembretesData));
      }

      if (loadedPets.length > 0) {
        setSelectedPetId(prev => {
          const petExists = loadedPets.find(p => p.id === prev);
          return petExists ? prev : loadedPets[0].id;
        });
      } else {
        setSelectedPetId(null);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const registrarAplicacao = async (lembreteId: string, intervaloDias: number) => {
    if (!selectedPetId) return;

    try {
      const petRegistros = registros[selectedPetId] || {};
      
      const hoje = new Date();
      const proxima = new Date();
      proxima.setDate(hoje.getDate() + intervaloDias);

      const novosRegistros = {
        ...registros,
        [selectedPetId]: {
          ...petRegistros,
          [lembreteId]: {
            ultimaAplicacao: hoje.toLocaleDateString('pt-BR'),
            proximaAplicacao: proxima.toLocaleDateString('pt-BR')
          }
        }
      };

      await AsyncStorage.setItem("@lembretes_por_pet", JSON.stringify(novosRegistros));
      setRegistros(novosRegistros);
    } catch (error) {
      console.error("Erro ao salvar lembrete", error);
    }
  };

  const renderLembrete = ({ item }: { item: typeof CATALOGO_LEMBRETES[0] }) => {
    if (!selectedPetId) return null;
    
    const petRegistros = registros[selectedPetId] || {};
    const status = petRegistros[item.id];

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={[s.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icone as any} size={24} color={item.color} />
          </View>
          <View style={s.cardInfo}>
            <Text style={s.lembreteNome}>{item.nome}</Text>
            <Text style={s.intervaloTag}>A cada {item.intervaloDias} dias</Text>
          </View>
        </View>

        <View style={s.datasBox}>
          <View style={s.dataItem}>
            <Text style={s.dataLabel}>Última Vez:</Text>
            <Text style={s.dataValue}>{status ? status.ultimaAplicacao : "Nunca"}</Text>
          </View>
          <View style={s.dataDivider} />
          <View style={s.dataItem}>
            <Text style={s.dataLabel}>Próxima:</Text>
            <Text style={[s.dataValue, { color: item.color }]}>{status ? status.proximaAplicacao : "Pendente"}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[s.btnAction, { backgroundColor: item.color }]}
          onPress={() => registrarAplicacao(item.id, item.intervaloDias)}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={s.btnActionText}>Registrar Hoje</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <Ionicons name="paw-outline" size={64} color={colors.textMuted} />
      <Text style={s.emptyTitle}>Nenhum pet encontrado</Text>
      <Text style={s.emptySubtitle}>Cadastre um pet primeiro para organizar os medicamentos.</Text>
      <TouchableOpacity style={s.addButton} onPress={() => router.push("/tutor/cadastro-pet")}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={s.addButtonText}>Cadastrar um Pet</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Lembretes</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : pets.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={s.petSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petSelectorScroll}>
              {pets.map(pet => {
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

          <FlatList
            data={CATALOGO_LEMBRETES}
            keyExtractor={item => item.id}
            renderItem={renderLembrete}
            contentContainerStyle={s.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
    paddingBottom: 16,
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
  petSelectorContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  petSelectorScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  petPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  petPillSelected: {
    backgroundColor: "#ec4899", // Rosa de Medicamentos
    borderColor: "#db2777",
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  petPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  petPillTextSelected: {
    color: "#fff",
  },
  listContainer: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
    backgroundColor: "#ec4899",
    flexDirection: "row",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  lembreteNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  intervaloTag: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  datasBox: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dataItem: {
    flex: 1,
    alignItems: "center",
  },
  dataLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
  },
  dataDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  btnAction: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnActionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
