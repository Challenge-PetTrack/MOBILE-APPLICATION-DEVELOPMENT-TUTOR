import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import LottieView from "lottie-react-native";

export default function NovaConsulta() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [petNome, setPetNome] = useState("");
  const [tutorNome, setTutorNome] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [prescricao, setPrescricao] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSalvar = async () => {
    if (!petNome.trim() || !diagnostico.trim()) {
      Alert.alert("Atenção", "Preencha pelo menos o nome do pet e o diagnóstico.");
      return;
    }

    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) {
        Alert.alert("Erro", "Sessão inválida.");
        return;
      }
      const user = JSON.parse(sessionStr);

      const novaConsulta = {
        id: Date.now().toString(),
        vetId: user.id,
        petNome,
        tutorNome,
        diagnostico,
        prescricao,
        data: new Date().toISOString()
      };

      const existingData = await AsyncStorage.getItem("@consultas");
      const consultas = existingData ? JSON.parse(existingData) : [];
      consultas.push(novaConsulta);

      await AsyncStorage.setItem("@consultas", JSON.stringify(consultas));

      setShowSuccess(true);
      setTimeout(() => {
        router.back();
      }, 2500);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar consulta.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Nova Consulta</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.form}>
          <View style={s.inputGroup}>
            <Text style={s.label}>Nome do Pet Paciente</Text>
            <TextInput 
              style={s.input} 
              placeholder="Ex: Rex" 
              placeholderTextColor={colors.textMuted}
              value={petNome}
              onChangeText={setPetNome}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Nome do Tutor</Text>
            <TextInput 
              style={s.input} 
              placeholder="Ex: João da Silva" 
              placeholderTextColor={colors.textMuted}
              value={tutorNome}
              onChangeText={setTutorNome}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Diagnóstico / Motivo</Text>
            <TextInput 
              style={[s.input, s.textArea]} 
              placeholder="Descreva o quadro clínico..." 
              placeholderTextColor={colors.textMuted}
              multiline={true}
              numberOfLines={4}
              value={diagnostico}
              onChangeText={setDiagnostico}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Prescrição (Medicamentos)</Text>
            <TextInput 
              style={[s.input, s.textArea]} 
              placeholder="Descreva os medicamentos e dosagens..." 
              placeholderTextColor={colors.textMuted}
              multiline={true}
              numberOfLines={4}
              value={prescricao}
              onChangeText={setPrescricao}
            />
          </View>

          <TouchableOpacity style={s.button} onPress={handleSalvar}>
            <Text style={s.buttonText}>Registrar Consulta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showSuccess && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={s.successOverlay} />
          <LottieView
            source={{ uri: "https://lottie.host/e2d091db-a3eb-4601-bd08-9df81bdf9fc6/A2x5uKofgK.json" }}
            autoPlay
            loop={false}
            style={s.lottieAnim}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
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
  form: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: "transparent",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#0d9488", // Teal do Vet
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  lottieAnim: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 1000,
  },
});
