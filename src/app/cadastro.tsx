import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function Cadastro() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");

  const handleCadastrar = async () => {
    if (!nome.trim() || !especie.trim()) {
      Alert.alert("Atenção", "Por favor, preencha pelo menos o nome e a espécie do pet.");
      return;
    }

    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) {
        Alert.alert("Erro", "Sessão inválida. Por favor, faça login novamente.");
        return;
      }
      const user = JSON.parse(sessionStr);

      const newPet = {
        id: Date.now().toString(),
        userId: user.id,
        nome,
        especie,
        raca,
        idade,
        peso,
        createdAt: new Date().toISOString()
      };

      const existingPetsJson = await AsyncStorage.getItem("@pets");
      const existingPets = existingPetsJson ? JSON.parse(existingPetsJson) : [];
      
      const updatedPets = [...existingPets, newPet];
      await AsyncStorage.setItem("@pets", JSON.stringify(updatedPets));

      Alert.alert(
        "Sucesso!",
        "O pet foi cadastrado com sucesso.",
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar salvar o cadastro do pet.");
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
          <Text style={s.title}>Cadastrar Pet</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.photoContainer}>
          <View style={s.photoCircle}>
            <Ionicons name="camera" size={40} color={colors.textMuted} />
          </View>
          <Text style={s.photoText}>Adicionar Foto</Text>
        </View>

        <View style={s.form}>
          <View style={s.inputGroup}>
            <Text style={s.label}>Nome do Pet</Text>
            <TextInput 
              style={s.input} 
              placeholder="Ex: Rex" 
              placeholderTextColor={colors.textMuted}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Espécie</Text>
            <TextInput 
              style={s.input} 
              placeholder="Ex: Cachorro, Gato" 
              placeholderTextColor={colors.textMuted}
              value={especie}
              onChangeText={setEspecie}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Raça</Text>
            <TextInput 
              style={s.input} 
              placeholder="Ex: Labrador" 
              placeholderTextColor={colors.textMuted}
              value={raca}
              onChangeText={setRaca}
            />
          </View>

          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={s.label}>Idade (anos)</Text>
              <TextInput 
                style={s.input} 
                placeholder="Ex: 3" 
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
              />
            </View>
            <View style={[s.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={s.label}>Peso (kg)</Text>
              <TextInput 
                style={s.input} 
                placeholder="Ex: 15.5" 
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={peso}
                onChangeText={setPeso}
              />
            </View>
          </View>

          <TouchableOpacity style={s.button} onPress={handleCadastrar}>
            <Text style={s.buttonText}>Salvar Cadastro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  photoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10b981", // Usando verde da home
    borderStyle: "dashed",
    marginBottom: 12,
  },
  photoText: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: 14,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  button: {
    backgroundColor: "#10b981", // Usando verde da home
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#10b981",
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
});
