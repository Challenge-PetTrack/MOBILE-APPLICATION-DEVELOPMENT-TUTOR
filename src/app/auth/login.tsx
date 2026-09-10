import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !senha) { 
      setErrorMsg("Preencha todos os campos.");
      return; 
    }
    setErrorMsg("");
    try {
      setIsSubmitting(true);
      await login(email, senha);
      // Redirect is handled automatically by AuthContext
    } catch (e: any) { 
      setErrorMsg(e.message || "Falha ao realizar login."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const s = makeStyles(colors);

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

        {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={s.loginButton} onPress={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.loginButtonText}>Entrar</Text>
          )}
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
    errorText: { color: "red", marginBottom: 12, textAlign: "center", fontSize: 14 },
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
