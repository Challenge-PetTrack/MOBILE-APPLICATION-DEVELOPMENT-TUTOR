import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { authErrorMessage, isValidEmail } from "@/utils/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { login } = useAuth();
  const { isDone } = useOnboarding();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isDone === false) {
      router.replace("/auth/onboarding");
    }
  }, [isDone, router]);

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Atenção", "Informe um endereço de e-mail válido.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, senha);
    } catch (error) {
      setSubmitting(false);
      Alert.alert("Falha no login", authErrorMessage(error));
    }
  };

  const s = makeStyles(colors);

  if (isDone === null || submitting) {
    return (
      <View style={s.centerContainer}>
        <LottieView
          source={{
            uri: "https://lottie.host/802bc4eb-ed30-4e3f-9556-2eabfb4ff456/7q0tG5R5L3.json",
          }}
          autoPlay
          loop
          style={{ width: 110, height: 110 }}
        />
        <Text style={s.loadingText}>Autenticando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={toggleTheme} accessibilityLabel="Alternar tema">
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => router.push("/sobre")}
            accessibilityLabel="Sobre o aplicativo"
          >
            <Ionicons name="information-circle-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={s.header}>
          <Image source={require("@/assets/images/icon.png")} style={s.logo} contentFit="contain" />
          <Text style={s.title}>PetTrack</Text>
          <Text style={s.subtitle}>Conectando tutores e veterinários</Text>
        </View>

        <View style={s.form}>
          <View style={s.inputGroup}>
            <Text style={s.label}>E-mail</Text>
            <TextInput
              style={s.input}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Senha</Text>
            <TextInput
              style={s.input}
              placeholder="Digite sua senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity style={s.loginButton} onPress={handleLogin}>
            <Text style={s.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.registerLink}
            onPress={() => router.push("/auth/cadastro-usuario")}
          >
            <Text style={s.registerLinkText}>
              Ainda não tem conta? <Text style={s.registerLinkHighlight}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.aboutFooter} onPress={() => router.push("/sobre")}>
          <Ionicons name="git-commit-outline" size={16} color={colors.textMuted} />
          <Text style={s.aboutFooterText}>Sobre o App e Versão Publicada</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      padding: 24,
      paddingTop: 56,
      justifyContent: "center",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: { marginTop: 8, color: colors.textSecondary, fontSize: 15 },
    topActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginBottom: 16,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    header: { alignItems: "center", marginBottom: 36 },
    logo: { width: 96, height: 96, marginBottom: 14 },
    title: { fontSize: 32, fontWeight: "bold", color: colors.text },
    subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loginButton: {
      backgroundColor: "#4f46e5",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 8,
      shadowColor: "#4f46e5",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    registerLink: { marginTop: 22, alignItems: "center" },
    registerLinkText: { color: colors.textSecondary, fontSize: 14 },
    registerLinkHighlight: { color: "#4f46e5", fontWeight: "bold" },
    aboutFooter: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginTop: 28,
      paddingVertical: 8,
    },
    aboutFooterText: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
  });
}
