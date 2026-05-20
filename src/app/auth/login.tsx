import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import LottieView from "lottie-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { checkSession(); }, []));

  const checkSession = async () => {
    try {
      const onboardingDone = await AsyncStorage.getItem("@onboarding_done");
      if (!onboardingDone) {
        router.replace("/auth/onboarding");
        return;
      }

      const session = await AsyncStorage.getItem("@session");
      if (session) {
        const user = JSON.parse(session);
        if (user.perfil === "veterinario") router.replace("/vet/home");
        else router.replace("/tutor/home");
      } else setLoading(false);
    } catch (e) { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!email || !senha) { Alert.alert("Erro", "Preencha todos os campos."); return; }
    try {
      setLoading(true);
      const usersData = await AsyncStorage.getItem("@users");
      const users = usersData ? JSON.parse(usersData) : [];
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
      if (user) {
        await AsyncStorage.setItem("@session", JSON.stringify(user));
        if (user.perfil === "veterinario") router.replace("/vet/home");
        else router.replace("/tutor/home");
      } else { setLoading(false); Alert.alert("Erro", "E-mail ou senha inválidos."); }
    } catch (e) { setLoading(false); Alert.alert("Erro", "Falha ao realizar login."); }
  };

  const s = makeStyles(colors);

  if (loading) return (
    <View style={s.centerContainer}>
      <LottieView
        source={{ uri: "https://lottie.host/802bc4eb-ed30-4e3f-9556-2eabfb4ff456/7q0tG5R5L3.json" }}
        autoPlay
        loop
        style={{ width: 100, height: 100 }}
      />
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image source={require("@/assets/images/icon.png")} style={s.logo} contentFit="contain" />
        <Text style={s.title}>PetTrack</Text>
        <Text style={s.subtitle}>Conectando tutores e veterinários</Text>
      </View>

      <View style={s.form}>
        <View style={s.inputGroup}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input} placeholder="Digite seu e-mail" keyboardType="email-address"
            autoCapitalize="none" value={email} onChangeText={setEmail}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={s.inputGroup}>
          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input} placeholder="Digite sua senha" secureTextEntry
            value={senha} onChangeText={setSenha} placeholderTextColor={colors.textMuted}
          />
        </View>
        <TouchableOpacity style={s.loginButton} onPress={handleLogin}>
          <Text style={s.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.registerLink} onPress={() => router.push("/auth/cadastro-usuario")}>
          <Text style={s.registerLinkText}>Ainda não tem conta? <Text style={s.registerLinkHighlight}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
    header: { alignItems: "center", marginBottom: 48 },
    logo: { width: 100, height: 100, marginBottom: 16 },
    title: { fontSize: 32, fontWeight: "bold", color: colors.text },
    subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
    form: {
      backgroundColor: colors.surface, borderRadius: 20, padding: 24,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    input: {
      backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16,
      fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
    },
    loginButton: {
      backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, alignItems: "center",
      marginTop: 8, shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    registerLink: { marginTop: 24, alignItems: "center" },
    registerLinkText: { color: colors.textSecondary, fontSize: 14 },
    registerLinkHighlight: { color: "#4f46e5", fontWeight: "bold" },
  });
}
