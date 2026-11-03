import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Header from "@/components/Header";
import PetSelectorBar from "@/components/PetSelectorBar";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useAllPets } from "@/hooks/usePets";
import { useClinicaVet } from "@/hooks/useClinica";
import { useRegistrarAtendimentoVet } from "@/hooks/useConsultas";
import { parseCurrency } from "@/utils/currency";
import type { Pet } from "@/types/models";

const EMPTY_PETS: Pet[] = [];

export default function NovaConsultaScreen() {
  const router = useRouter();
  const { petId: initialPetId } = useLocalSearchParams<{ petId?: string }>();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const petsQuery = useAllPets();
  const clinicaQuery = useClinicaVet();
  const registrarAtendimento = useRegistrarAtendimentoVet();

  const pets = petsQuery.data ?? EMPTY_PETS;
  const [selectedPetId, setSelectedPetId] = useState<string | null>(initialPetId ?? null);
  const [manualPetNome, setManualPetNome] = useState("");
  const [manualTutorNome, setManualTutorNome] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState("");
  const [prescricao, setPrescricao] = useState("");
  const [valorEditado, setValorEditado] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const petNome = selectedPet ? selectedPet.nome : manualPetNome;
  const tutorNome = manualTutorNome ?? (selectedPet ? selectedPet.tutorNome : "");
  const valor =
    valorEditado ??
    (clinicaQuery.data?.valorConsulta ? String(clinicaQuery.data.valorConsulta) : "");

  const handleSelectPet = (id: string) => {
    const nextId = selectedPetId === id ? null : id;
    setSelectedPetId(nextId);
    const found = pets.find((p) => p.id === nextId);
    if (found) {
      setManualPetNome(found.nome);
      setManualTutorNome(found.tutorNome);
    } else {
      setManualTutorNome(null);
    }
  };

  const handleSalvar = async () => {
    const finalPetNome = selectedPet?.nome || petNome.trim();
    if (!finalPetNome || !diagnostico.trim()) {
      Alert.alert("Atenção", "Preencha pelo menos o paciente e o diagnóstico clínico.");
      return;
    }

    const parsedValor = parseCurrency(valor);

    try {
      await registrarAtendimento.mutateAsync({
        pet: selectedPet,
        petNome: finalPetNome,
        tutorNome,
        diagnostico,
        prescricao,
        valor: Number.isFinite(parsedValor) && parsedValor > 0 ? parsedValor : undefined,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1800);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o atendimento.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Novo Atendimento" />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {pets.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Selecionar Paciente Cadastrado (opcional)</Text>
            <View style={{ marginHorizontal: -24 }}>
              <PetSelectorBar
                pets={pets}
                selectedPetId={selectedPetId}
                onSelect={handleSelectPet}
                accentColor="#0d9488"
              />
            </View>
          </>
        )}

        <View style={s.formCard}>
          <Text style={s.label}>Nome do Paciente *</Text>
          <TextInput
            style={s.input}
            placeholder="Ex.: Rex"
            placeholderTextColor={colors.textMuted}
            value={petNome}
            onChangeText={(txt) => {
              setSelectedPetId(null);
              setManualPetNome(txt);
            }}
          />

          <Text style={s.label}>Nome do Tutor</Text>
          <TextInput
            style={s.input}
            placeholder="Ex.: Maria Silva"
            placeholderTextColor={colors.textMuted}
            value={tutorNome}
            onChangeText={setManualTutorNome}
          />

          <Text style={s.label}>Diagnóstico Clínico *</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Descreva os achados clínicos e o diagnóstico..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={diagnostico}
            onChangeText={setDiagnostico}
          />

          <Text style={s.label}>Prescrição / Recomendações</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Medicamentos, doses e orientações ao tutor..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={prescricao}
            onChangeText={setPrescricao}
          />

          <Text style={s.label}>Valor Cobrado (R$)</Text>
          <TextInput
            style={s.input}
            placeholder="150,00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValorEditado}
          />

          <TouchableOpacity
            style={s.submitBtn}
            onPress={handleSalvar}
            disabled={registrarAtendimento.isPending}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={s.submitText}>
              {registrarAtendimento.isPending
                ? "Registrando..."
                : "Finalizar e Salvar Prontuário"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={s.successOverlay}>
          <View style={s.successBox}>
            <LottieView
              source={{
                uri: "https://lottie.host/7833bdc6-ccb3-4f93-b6d3-24151a66ccbc/hOmsaI1J3u.json",
              }}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
            <Text style={s.successTitle}>Atendimento Registrado!</Text>
            <Text style={s.successSub}>O prontuário já está disponível para o tutor.</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    sectionLabel: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 10 },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 22,
      elevation: 2,
    },
    label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    textArea: { height: 96, textAlignVertical: "top" },
    submitBtn: {
      backgroundColor: "#0d9488",
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    submitText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    successOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    successBox: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      width: "85%",
    },
    successTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginTop: 8 },
    successSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: "center" },
  });
}
