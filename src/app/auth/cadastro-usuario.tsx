import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  authErrorMessage,
  isValidEmail,
  isValidPhone,
  maskPhone,
  onlyDigits,
} from "@/utils/validation";
import type { Perfil } from "@/types/models";

export default function CadastroUsuarioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crmv, setCrmv] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("tutor");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert("Atenção", "Preencha nome, e-mail e senha.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Atenção", "Informe um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (perfil === "tutor" && !isValidPhone(telefone)) {
      Alert.alert("Atenção", "Informe um número de WhatsApp válido com DDD.");
      return;
    }

    try {
      setLoading(true);
      await register({
        nome,
        email,
        senha,
        perfil,
        telefone: perfil === "tutor" ? onlyDigits(telefone) : undefined,
        crmv: perfil === "veterinario" ? crmv : undefined,
      });

      Alert.alert("Conta criada!", "Agora faça login com suas credenciais.", [
        { text: "Ir para o Login", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (error) {
      Alert.alert("Erro no cadastro", authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Nova Conta" />
      <ScrollView contentContainerStyle={s.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={s.form}>
          <Text style={s.sectionTitle}>Escolha seu perfil</Text>

          <View style={s.roleContainer}>
            <TouchableOpacity
              style={[s.roleCard, perfil === "tutor" && s.roleCardActive]}
              onPress={() => setPerfil("tutor")}
            >
              <Ionicons
                name="person"
                size={30}
                color={perfil === "tutor" ? "#4f46e5" : colors.textMuted}
              />
              <Text style={[s.roleText, perfil === "tutor" && s.roleTextActive]}>
                Tutor de Pet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.roleCard, perfil === "veterinario" && s.roleCardActiveVet]}
              onPress={() => setPerfil("veterinario")}
            >
              <Ionicons
                name="medical"
                size={30}
                color={perfil === "veterinario" ? "#0d9488" : colors.textMuted}
              />
              <Text style={[s.roleText, perfil === "veterinario" && s.roleTextActiveVet]}>
                Veterinário
              </Text>
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

          {perfil === "tutor" ? (
            <View style={s.inputGroup}>
              <Text style={s.label}>WhatsApp (obrigatório)</Text>
              <View style={s.phoneRow}>
                <View style={s.phonePrefix}>
                  <Text style={s.phonePrefixText}>+55</Text>
                </View>
                <TextInput
                  style={[s.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={(txt) => setTelefone(maskPhone(txt))}
                />
              </View>
            </View>
          ) : (
            <View style={s.inputGroup}>
              <Text style={s.label}>Registro CRMV (opcional)</Text>
              <TextInput
                style={s.input}
                placeholder="Ex.: CRMV-SP 12345"
                placeholderTextColor={colors.textMuted}
                value={crmv}
                onChangeText={setCrmv}
              />
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={s.label}>Senha (mínimo 6 caracteres)</Text>
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
            style={[
              s.submitButton,
              perfil === "veterinario" && s.submitButtonVet,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    contentContainer: { padding: 24, paddingTop: 8, paddingBottom: 40 },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    roleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    roleCard: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 4,
      borderWidth: 2,
      borderColor: "transparent",
    },
    roleCardActive: { backgroundColor: "#e0e7ff", borderColor: "#4f46e5" },
    roleCardActiveVet: { backgroundColor: "#ccfbf1", borderColor: "#0d9488" },
    roleText: { marginTop: 8, fontSize: 14, fontWeight: "600", color: colors.textSecondary },
    roleTextActive: { color: "#4f46e5" },
    roleTextActiveVet: { color: "#0d9488" },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    phoneRow: { flexDirection: "row" },
    phonePrefix: {
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRightWidth: 0,
    },
    phonePrefixText: { fontSize: 14, color: colors.text, fontWeight: "600" },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitButton: {
      backgroundColor: "#4f46e5",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 8,
    },
    submitButtonVet: { backgroundColor: "#0d9488" },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
