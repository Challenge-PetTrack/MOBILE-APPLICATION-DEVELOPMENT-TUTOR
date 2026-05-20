import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView, Image } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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
  const [activeTab, setActiveTab] = useState<"ficha" | "diario">("ficha");
  const [diario, setDiario] = useState<any[]>([]);
  const [nota, setNota] = useState("");
  const [fotoNota, setFotoNota] = useState<string | null>(null);

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

  const abrirFicha = async (pet: Pet) => {
    setFichaPet(pet);
    setActiveTab("ficha");
    // Load diary
    try {
      const stored = await AsyncStorage.getItem(`@diario_${pet.id}`);
      if (stored) setDiario(JSON.parse(stored));
      else setDiario([]);
    } catch (e) {}
  };

  const fecharFicha = () => {
    setFichaPet(null);
    setNota("");
    setFotoNota(null);
  };

  const gerarRG = async (pet: Pet) => {
    try {
      const vacinasTomadas = getVacinasTomadas(pet.id);
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; background-color: #f3f4f6; padding: 40px; display: flex; justify-content: center; }
              .card { background-color: white; border-radius: 20px; padding: 30px; width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid #4f46e5; }
              .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
              .title { color: #4f46e5; font-size: 24px; font-weight: bold; margin: 0; }
              .subtitle { color: #6b7280; font-size: 14px; margin-top: 5px; }
              .photo-container { display: flex; justify-content: center; margin-bottom: 20px; }
              .photo { width: 120px; height: 120px; border-radius: 60px; object-fit: cover; border: 4px solid #10b981; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 16px; }
              .label { color: #6b7280; font-weight: bold; }
              .value { color: #1f2937; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
              .vacina-badge { display: inline-block; background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin: 4px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1 class="title">Registro Geral do Pet</h1>
                <p class="subtitle">República Federativa do PetTrack</p>
              </div>
              <div class="photo-container">
                ${pet.fotoUri ? `<img src="${pet.fotoUri}" class="photo" />` : `<div class="photo" style="background-color: #e5e7eb; display:flex; align-items:center; justify-content:center; color:#9ca3af;">Sem Foto</div>`}
              </div>
              <div class="info-row"><span class="label">Nome:</span><span class="value">${pet.nome}</span></div>
              <div class="info-row"><span class="label">Espécie:</span><span class="value">${pet.especie}</span></div>
              <div class="info-row"><span class="label">Raça:</span><span class="value">${pet.raca || 'N/A'}</span></div>
              <div class="info-row"><span class="label">Idade:</span><span class="value">${pet.idade ? pet.idade + ' anos' : 'N/A'}</span></div>
              <div class="info-row"><span class="label">Peso:</span><span class="value">${pet.peso ? pet.peso + ' kg' : 'N/A'}</span></div>
              <div class="info-row"><span class="label">Data de Emissão:</span><span class="value">${new Date().toLocaleDateString('pt-BR')}</span></div>
              
              <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                <span class="label" style="display:block; margin-bottom: 10px;">Vacinas em dia:</span>
                <div>
                  ${vacinasTomadas.length > 0 ? vacinasTomadas.map(v => `<span class="vacina-badge">${v.nome}</span>`).join('') : '<span class="value" style="font-size:14px;">Nenhuma vacina registrada.</span>'}
                </div>
              </div>
              
              <div class="footer">Este documento é gerado pelo PetTrack App e tem fins recreativos/informativos.</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Compartilhar RG do Pet' });
    } catch (error) {
      console.error(error);
    }
  };

  const salvarNotaDiario = async () => {
    if (!nota.trim() && !fotoNota) return;
    if (!fichaPet) return;

    try {
      const novaNota = {
        id: Date.now().toString(),
        texto: nota,
        foto: fotoNota,
        data: new Date().toISOString(),
      };
      const novaLista = [novaNota, ...diario];
      await AsyncStorage.setItem(`@diario_${fichaPet.id}`, JSON.stringify(novaLista));
      setDiario(novaLista);
      setNota("");
      setFotoNota(null);
    } catch (e) {
      console.error(e);
    }
  };

  const pickDiarioImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setFotoNota(result.assets[0].uri);
    }
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
          <TouchableOpacity onPress={() => router.push({ pathname: "/tutor/editar-pet", params: { id: item.id } })} style={s.editButton}>
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
          <TouchableOpacity style={s.addButton} onPress={() => router.push("/tutor/cadastro-pet")}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.addButtonText}>Cadastrar um Pet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Ficha Clínica / Diário */}
      <Modal visible={!!fichaPet} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{fichaPet?.nome}</Text>
              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity onPress={() => fichaPet && gerarRG(fichaPet)} style={s.rgButton}>
                  <Ionicons name="id-card" size={20} color="#fff" />
                  <Text style={s.rgButtonText}>RG</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={fecharFicha} style={s.closeModalButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.tabsContainer}>
              <TouchableOpacity style={[s.tab, activeTab === "ficha" && s.activeTab]} onPress={() => setActiveTab("ficha")}>
                <Text style={[s.tabText, activeTab === "ficha" && s.activeTabText]}>Ficha Médica</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.tab, activeTab === "diario" && s.activeTab]} onPress={() => setActiveTab("diario")}>
                <Text style={[s.tabText, activeTab === "diario" && s.activeTabText]}>Diário</Text>
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

            {fichaPet && activeTab === "diario" && (
              <View style={{flex: 1}}>
                <View style={s.diarioInputContainer}>
                  <TextInput 
                    style={s.diarioInput} 
                    placeholder="O que o pet aprontou hoje?" 
                    placeholderTextColor={colors.textMuted}
                    value={nota}
                    onChangeText={setNota}
                    multiline
                  />
                  {fotoNota && (
                    <View style={s.diarioPreviewContainer}>
                      <Image source={{uri: fotoNota}} style={s.diarioPreview} />
                      <TouchableOpacity onPress={() => setFotoNota(null)} style={s.diarioPreviewRemove}>
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={s.diarioActions}>
                    <TouchableOpacity onPress={pickDiarioImage} style={s.diarioBtnIcon}>
                      <Ionicons name="image" size={24} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={salvarNotaDiario} style={s.diarioBtnSave}>
                      <Text style={s.diarioBtnSaveText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
                  {diario.length === 0 ? (
                    <Text style={s.fichaEmptyText}>Seu diário está vazio. Comece a registrar momentos!</Text>
                  ) : (
                    diario.map((item) => (
                      <View key={item.id} style={s.diarioCard}>
                        <Text style={s.diarioDate}>{new Date(item.data).toLocaleDateString('pt-BR')} às {new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</Text>
                        {item.texto ? <Text style={s.diarioText}>{item.texto}</Text> : null}
                        {item.foto ? <Image source={{uri: item.foto}} style={s.diarioImage} /> : null}
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
  rgButton: {
    flexDirection: "row", backgroundColor: "#4f46e5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignItems: "center"
  },
  rgButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 4, fontSize: 14 },
  tabsContainer: { flexDirection: "row", marginBottom: 16, backgroundColor: colors.surfaceSecondary, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: colors.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  tabText: { fontWeight: "600", color: colors.textSecondary },
  activeTabText: { color: colors.text },
  diarioInputContainer: { backgroundColor: colors.surfaceSecondary, borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  diarioInput: { color: colors.text, fontSize: 15, minHeight: 60, textAlignVertical: "top" },
  diarioActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  diarioBtnIcon: { padding: 8, backgroundColor: colors.surface, borderRadius: 12 },
  diarioBtnSave: { backgroundColor: "#10b981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  diarioBtnSaveText: { color: "#fff", fontWeight: "bold" },
  diarioCard: { backgroundColor: colors.surfaceSecondary, borderRadius: 16, padding: 16, marginBottom: 12 },
  diarioDate: { fontSize: 12, color: colors.textSecondary, marginBottom: 8, fontWeight: "500" },
  diarioText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  diarioImage: { width: "100%", height: 200, borderRadius: 12, marginTop: 12 },
  diarioPreviewContainer: { position: "relative", marginTop: 8 },
  diarioPreview: { width: 80, height: 80, borderRadius: 8 },
  diarioPreviewRemove: { position: "absolute", top: -8, left: 64, backgroundColor: "#fff", borderRadius: 12 },
});
