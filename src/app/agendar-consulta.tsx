import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Alert, Platform, KeyboardAvoidingView
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function AgendarConsulta() {
  const router = useRouter();
  const { colors } = useTheme();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [motivo, setMotivo] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const loadPets = async () => {
    const sessionStr = await AsyncStorage.getItem("@session");
    if (!sessionStr) return;
    const user = JSON.parse(sessionStr);
    const petsData = await AsyncStorage.getItem("@pets");
    if (petsData) {
      const all = JSON.parse(petsData);
      const meusPets = all.filter((p: any) => p.userId === user.id);
      setPets(meusPets);
    }
  };

  const handleAgendar = async () => {
    if (!selectedPetId || !data.trim() || !horario.trim() || !motivo.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos e selecione um pet.");
      return;
    }

    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);
      const petSelecionado = pets.find(p => p.id === selectedPetId);

      const novoAgendamento = {
        id: Date.now().toString(),
        tutorId: user.id,
        tutorNome: user.nome,
        pet: petSelecionado?.nome || "Sem pet",
        horario,
        data,
        motivo,
        status: "pendente",
        origem: "tutor", // para diferenciar na agenda do vet
        createdAt: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("@agenda_consultas");
      const agenda = existing ? JSON.parse(existing) : [];
      agenda.push(novoAgendamento);
      await AsyncStorage.setItem("@agenda_consultas", JSON.stringify(agenda));

      Alert.alert(
        "Agendado! 🐾",
        `Consulta marcada para ${data} às ${horario}. Em breve um veterinário confirmará.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert("Erro", "Falha ao agendar consulta.");
    }
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Agendar Consulta</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Selecionar Pet */}
        <Text style={s.sectionLabel}>Selecione o Pet</Text>
        {pets.length === 0 ? (
          <View style={s.emptyPets}>
            <Ionicons name="paw-outline" size={32} color={colors.textMuted} />
            <Text style={s.emptyPetsText}>Cadastre um pet primeiro</Text>
            <TouchableOpacity onPress={() => router.push("/cadastro")} style={s.linkButton}>
              <Text style={s.linkButtonText}>Ir para Cadastro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.petScroll}>
            {pets.map(pet => {
              const selected = pet.id === selectedPetId;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[s.petPill, selected && s.petPillSelected]}
                  onPress={() => setSelectedPetId(pet.id)}
                >
                  <Ionicons name="paw" size={16} color={selected ? "#fff" : colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[s.petPillText, selected && s.petPillTextSelected]}>{pet.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Formulário */}
        <View style={s.form}>
          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={s.label}>Data</Text>
              <TextInput
                style={s.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textMuted}
                value={data}
                onChangeText={setData}
                keyboardType="numeric"
              />
            </View>
            <View style={[s.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={s.label}>Horário</Text>
              <TextInput
                style={s.input}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
                value={horario}
                onChangeText={setHorario}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Motivo da Consulta</Text>
            <TextInput
              style={[s.input, s.textArea]}
              placeholder="Descreva o motivo da consulta..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={motivo}
              onChangeText={setMotivo}
            />
          </View>

          <TouchableOpacity style={s.button} onPress={handleAgendar}>
            <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.buttonText}>Confirmar Agendamento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
    backButton: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    sectionLabel: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 },
    petScroll: { marginBottom: 24 },
    petPill: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceSecondary,
      paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, marginRight: 10,
      borderWidth: 2, borderColor: "transparent",
    },
    petPillSelected: { backgroundColor: "#4f46e5", borderColor: "#3730a3" },
    petPillText: { fontSize: 15, fontWeight: "600", color: colors.textSecondary },
    petPillTextSelected: { color: "#fff" },
    emptyPets: {
      alignItems: "center", backgroundColor: colors.surface, padding: 24,
      borderRadius: 16, marginBottom: 24,
    },
    emptyPetsText: { color: colors.textMuted, marginTop: 8, fontSize: 15 },
    linkButton: { marginTop: 12, backgroundColor: "#4f46e5", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    linkButtonText: { color: "#fff", fontWeight: "bold" },
    form: {
      backgroundColor: colors.surface, borderRadius: 24, padding: 24,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    row: { flexDirection: "row" },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    input: {
      backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16,
      fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
    },
    textArea: { height: 100, textAlignVertical: "top" },
    button: {
      backgroundColor: "#4f46e5", borderRadius: 16, padding: 18,
      alignItems: "center", flexDirection: "row", justifyContent: "center",
      marginTop: 8,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
