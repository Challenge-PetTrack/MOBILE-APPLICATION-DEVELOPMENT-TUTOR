import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Image as RNImage
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import * as ImagePicker from "expo-image-picker";

export default function Cadastro() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos acessar sua galeria para adicionar a foto do pet.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, // Salvar como base64 para persistência no AsyncStorage
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Guardar URI local para exibição e base64 para persistência
      setFotoUri(asset.uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos acessar sua câmera para tirar a foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleFotoPress = () => {
    Alert.alert(
      "Foto do Pet",
      "Como deseja adicionar a foto?",
      [
        { text: "Câmera", onPress: takePhoto },
        { text: "Galeria", onPress: pickImage },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

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
        fotoUri: fotoUri || null,
        createdAt: new Date().toISOString()
      };

      const existingPetsJson = await AsyncStorage.getItem("@pets");
      const existingPets = existingPetsJson ? JSON.parse(existingPetsJson) : [];
      
      const updatedPets = [...existingPets, newPet];
      await AsyncStorage.setItem("@pets", JSON.stringify(updatedPets));

      Alert.alert(
        "Sucesso! 🐾",
        "O pet foi cadastrado com sucesso.",
        [{ text: "OK", onPress: () => router.back() }]
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

        {/* Foto do Pet */}
        <TouchableOpacity style={s.photoContainer} onPress={handleFotoPress} activeOpacity={0.8}>
          {fotoUri ? (
            <View style={s.photoWrapper}>
              <RNImage source={{ uri: fotoUri }} style={s.photoImage} />
              <View style={s.photoEditOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </View>
          ) : (
            <View style={s.photoCircle}>
              <Ionicons name="camera" size={40} color="#10b981" />
            </View>
          )}
          <Text style={s.photoText}>{fotoUri ? "Trocar Foto" : "Adicionar Foto"}</Text>
        </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "bold", color: colors.text },
  photoContainer: { alignItems: "center", marginBottom: 32 },
  photoWrapper: { position: "relative", marginBottom: 12 },
  photoImage: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: "#10b981",
  },
  photoEditOverlay: {
    position: "absolute", bottom: 4, right: 4,
    backgroundColor: "#10b981", width: 32, height: 32,
    borderRadius: 16, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: colors.background,
  },
  photoCircle: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: colors.surfaceSecondary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#10b981", borderStyle: "dashed", marginBottom: 12,
  },
  photoText: { color: "#10b981", fontWeight: "600", fontSize: 14 },
  form: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16,
    fontSize: 16, color: colors.text, borderWidth: 1, borderColor: "transparent",
  },
  button: {
    backgroundColor: "#10b981", borderRadius: 16, padding: 18, alignItems: "center",
    marginTop: 12, shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
