import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function CadastroUsuarioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<"tutor" | "veterinario">("tutor");

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    if (perfil === "tutor" && !telefone) {
      Alert.alert("Erro", "Tutores precisam informar um número de WhatsApp.");
      return;
    }

    try {
      const usersData = await AsyncStorage.getItem("@users");
      const users = usersData ? JSON.parse(usersData) : [];
      
      const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        Alert.alert("Erro", "Este e-mail já está cadastrado.");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        nome,
        email,
        telefone: telefone.replace(/\D/g, ""), // só números
        senha,
        perfil
      };

      users.push(newUser);
      await AsyncStorage.setItem("@users", JSON.stringify(users));
      
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível criar a conta.");
    }
  };

  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Nova Conta</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.form}>
        <Text style={s.sectionTitle}>Escolha seu perfil</Text>
        
        <View style={s.roleContainer}>
          <TouchableOpacity 
            style={[s.roleCard, perfil === "tutor" && s.roleCardActive]} 
            onPress={() => setPerfil("tutor")}
          >
            <Ionicons name="person" size={32} color={perfil === "tutor" ? "#4f46e5" : colors.textMuted} />
            <Text style={[s.roleText, perfil === "tutor" && s.roleTextActive]}>Tutor de Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.roleCard, perfil === "veterinario" && s.roleCardActiveVet]} 
            onPress={() => setPerfil("veterinario")}
          >
            <Ionicons name="medical" size={32} color={perfil === "veterinario" ? "#0d9488" : colors.textMuted} />
            <Text style={[s.roleText, perfil === "veterinario" && s.roleTextActiveVet]}>Veterinário</Text>
          </TouchableOpacity>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Nome Completo</Text>
          <TextInput
            style={s.input}
            placeholder="Digite seu nome"
            placeholderTextColor={colors.textMuted}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {perfil === "tutor" && (
          <View style={s.inputGroup}>
            <Text style={s.label}>WhatsApp {perfil === "tutor" ? "(obrigatório)" : ""}</Text>
            <View style={s.phoneRow}>
              <View style={s.phonePrefix}>
                <Text style={s.phonePrefixText}>🇧🇷 +55</Text>
              </View>
              <TextInput
                style={[s.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>
          </View>
        )}

        <View style={s.inputGroup}>
          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input}
            placeholder="Crie uma senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity 
          style={[s.submitButton, perfil === "veterinario" && s.submitButtonVet]} 
          onPress={handleCadastro}
        >
          <Text style={s.submitButtonText}>Criar Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
    backButton: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      justifyContent: "center", alignItems: "center",
      shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    form: {
      backgroundColor: colors.surface, borderRadius: 20, padding: 24,
      shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 16, textAlign: "center" },
    roleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
    roleCard: {
      flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: 16, padding: 16,
      alignItems: "center", marginHorizontal: 4, borderWidth: 2, borderColor: "transparent",
    },
    roleCardActive: { backgroundColor: "#e0e7ff", borderColor: "#4f46e5" },
    roleCardActiveVet: { backgroundColor: "#ccfbf1", borderColor: "#0d9488" },
    roleText: { marginTop: 8, fontSize: 14, fontWeight: "600", color: colors.textSecondary },
    roleTextActive: { color: "#4f46e5" },
    roleTextActiveVet: { color: "#0d9488" },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    phoneRow: { flexDirection: "row" },
    phonePrefix: {
      backgroundColor: colors.surfaceSecondary, paddingHorizontal: 14, borderRadius: 12,
      borderTopRightRadius: 0, borderBottomRightRadius: 0, justifyContent: "center",
      borderWidth: 1, borderColor: colors.border, borderRightWidth: 0,
    },
    phonePrefixText: { fontSize: 14, color: colors.text, fontWeight: "600" },
    input: {
      backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16,
      fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
    },
    submitButton: {
      backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center",
      marginTop: 8, shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    submitButtonVet: { backgroundColor: "#0d9488", shadowColor: "#0d9488" },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
