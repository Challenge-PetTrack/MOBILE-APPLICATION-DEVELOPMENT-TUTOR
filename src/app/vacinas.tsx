import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lista fixa de vacinas (Catálogo)
const CATALOGO_VACINAS = [
  { 
    id: "v10", 
    nome: "V8 / V10 (Múltipla Canina)", 
    descricao: "Protege contra Cinomose, Parvovirose, Hepatite Infecciosa, Adenovirose, Coronavirose, Parainfluenza e Leptospirose.", 
    recomendacao: "Cães" 
  },
  { 
    id: "raiva", 
    nome: "Antirrábica", 
    descricao: "Vacina obrigatória por lei. Protege contra o vírus da Raiva, uma doença fatal e transmissível para humanos.", 
    recomendacao: "Cães e Gatos" 
  },
  { 
    id: "gripe", 
    nome: "Gripe Canina (Tosse dos Canis)", 
    descricao: "Protege contra a Bordetella bronchiseptica e o vírus da Parainfluenza, que causam problemas respiratórios.", 
    recomendacao: "Cães" 
  },
  { 
    id: "giardia", 
    nome: "Giárdia", 
    descricao: "Ajuda na prevenção de infecções intestinais causadas pelo protozoário Giardia lamblia.", 
    recomendacao: "Cães" 
  },
  { 
    id: "leishmaniose", 
    nome: "Leishmaniose", 
    descricao: "Protege contra o calazar (Leishmaniose Visceral Canina), doença grave transmitida por mosquito.", 
    recomendacao: "Cães" 
  },
  { 
    id: "v5", 
    nome: "V4 / V5 (Múltipla Felina)", 
    descricao: "Protege contra Panleucopenia, Rinotraqueíte, Calicivirose, Clamidiose e Leucemia Felina (apenas na V5).", 
    recomendacao: "Gatos" 
  },
];

type VacinaStatus = {
  tomada: boolean;
  dataAplicacao?: string;
};

type Pet = {
  id: string;
  nome: string;
};

export default function VacinasScreen() {
  const router = useRouter();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  
  // Estado que guarda as vacinas por pet: { [petId]: { [vacinaId]: VacinaStatus } }
  const [registros, setRegistros] = useState<Record<string, Record<string, VacinaStatus>>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar pets cadastrados
      const petsData = await AsyncStorage.getItem("@pets");
      let loadedPets: Pet[] = [];
      if (petsData) {
        loadedPets = JSON.parse(petsData);
        setPets(loadedPets);
      }

      // Carregar os registros de vacinas
      const vacinasData = await AsyncStorage.getItem("@vacinas_por_pet");
      if (vacinasData) {
        setRegistros(JSON.parse(vacinasData));
      }

      // Se houver pets e nenhum selecionado, seleciona o primeiro
      if (loadedPets.length > 0) {
        setSelectedPetId(prev => {
          // Mantém o pet selecionado se ele ainda existir, senão pega o primeiro
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

  const toggleStatus = async (vacinaId: string) => {
    if (!selectedPetId) return;

    try {
      const petRegistros = registros[selectedPetId] || {};
      const isTomadaAtualmente = petRegistros[vacinaId]?.tomada;
      
      const novosRegistros = {
        ...registros,
        [selectedPetId]: {
          ...petRegistros,
          [vacinaId]: {
            tomada: !isTomadaAtualmente,
            dataAplicacao: !isTomadaAtualmente ? new Date().toLocaleDateString('pt-BR') : undefined
          }
        }
      };

      await AsyncStorage.setItem("@vacinas_por_pet", JSON.stringify(novosRegistros));
      setRegistros(novosRegistros);
    } catch (error) {
      console.error("Erro ao salvar vacina", error);
    }
  };

  const renderVacina = ({ item }: { item: typeof CATALOGO_VACINAS[0] }) => {
    if (!selectedPetId) return null;
    
    const petRegistros = registros[selectedPetId] || {};
    const status = petRegistros[item.id];
    const isTomada = status?.tomada === true;

    return (
      <View style={[styles.card, isTomada ? styles.cardTomada : styles.cardPendente]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="medkit" 
              size={24} 
              color={isTomada ? "#10b981" : "#ef4444"} 
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.vacinaNome}>{item.nome}</Text>
            <Text style={styles.recomendacaoTag}>{item.recomendacao}</Text>
          </View>
        </View>
        
        <Text style={styles.vacinaDescricao}>{item.descricao}</Text>

        <View style={styles.cardFooter}>
          {isTomada ? (
            <View style={styles.dataContainer}>
              <Ionicons name="calendar-outline" size={16} color="#4b5563" />
              <Text style={styles.dataTexto}>Aplicada: {status.dataAplicacao}</Text>
            </View>
          ) : (
            <View style={styles.dataContainer}>
              <Ionicons name="time-outline" size={16} color="#ef4444" />
              <Text style={[styles.dataTexto, { color: "#ef4444" }]}>Pendente</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.btnAction, isTomada ? styles.btnDesmarcar : styles.btnMarcar]}
            onPress={() => toggleStatus(item.id)}
          >
            <Text style={[styles.btnActionText, isTomada ? { color: "#4b5563" } : { color: "#fff" }]}>
              {isTomada ? "Desfazer" : "Registrar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="paw-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyTitle}>Nenhum pet encontrado</Text>
      <Text style={styles.emptySubtitle}>Cadastre um pet primeiro para gerenciar suas vacinas.</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/cadastro")}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.addButtonText}>Cadastrar um Pet</Text>
      </TouchableOpacity>
    </View>
  );

  const petRegistros = selectedPetId ? (registros[selectedPetId] || {}) : {};
  const tomadasCount = Object.values(petRegistros).filter(r => r.tomada).length;
  const pendentesCount = CATALOGO_VACINAS.length - tomadasCount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.title}>Carteira de Vacinas</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : pets.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Seletor de Pets */}
          <View style={styles.petSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSelectorScroll}>
              {pets.map(pet => {
                const isSelected = pet.id === selectedPetId;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.petPill, isSelected && styles.petPillSelected]}
                    onPress={() => setSelectedPetId(pet.id)}
                  >
                    <Ionicons 
                      name="paw" 
                      size={16} 
                      color={isSelected ? "#fff" : "#4b5563"} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.petPillText, isSelected && styles.petPillTextSelected]}>
                      {pet.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={CATALOGO_VACINAS}
            keyExtractor={item => item.id}
            renderItem={renderVacina}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.summaryContainer}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryNumber}>{tomadasCount}</Text>
                  <Text style={styles.summaryLabel}>Aplicadas</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryBox}>
                  <Text style={[styles.summaryNumber, { color: "#ef4444" }]}>{pendentesCount}</Text>
                  <Text style={styles.summaryLabel}>Pendentes</Text>
                </View>
              </View>
            }
          />
        </>
      )}
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
    paddingBottom: 16,
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
  petSelectorContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  petSelectorScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  petPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  petPillSelected: {
    backgroundColor: "#ef4444",
    borderColor: "#dc2626",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  petPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  petPillTextSelected: {
    color: "#fff",
  },
  listContainer: {
    padding: 24,
    paddingTop: 20,
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
    backgroundColor: "#ef4444",
    flexDirection: "row",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#ef4444",
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
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryBox: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10b981",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTomada: {
    borderLeftColor: "#10b981",
  },
  cardPendente: {
    borderLeftColor: "#ef4444",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  vacinaNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  recomendacaoTag: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "600",
    marginTop: 4,
  },
  vacinaDescricao: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dataTexto: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 6,
    fontWeight: "500",
  },
  btnAction: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btnMarcar: {
    backgroundColor: "#ef4444",
  },
  btnDesmarcar: {
    backgroundColor: "#f3f4f6",
  },
  btnActionText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
