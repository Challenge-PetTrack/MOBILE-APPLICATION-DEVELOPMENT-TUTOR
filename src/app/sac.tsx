import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function SAC() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const enviarMensagem = () => {
    if (!assunto.trim() || !mensagem.trim()) {
      Alert.alert("Atenção", "Por favor, preencha o assunto e a mensagem.");
      return;
    }

    // Aqui poderia integrar com uma API real. 
    // Para simplificar, abre o email do usuário ou mostra um alerta.
    Alert.alert(
      "Mensagem Enviada!",
      "Sua solicitação foi enviada para nossa equipe de suporte. Responderemos em breve.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const abrirWhatsAppSuporte = () => {
    Linking.openURL("https://wa.me/5511999999999?text=Olá, preciso de suporte no app PetTrack.");
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Atendimento (SAC)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.contactCard}>
          <Ionicons name="headset" size={40} color="#10b981" />
          <Text style={s.contactTitle}>Como podemos ajudar?</Text>
          <Text style={s.contactSubtitle}>
            Envie sua dúvida, sugestão ou reporte um problema.
          </Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Assunto</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Problema com agendamento"
            placeholderTextColor={colors.textMuted}
            value={assunto}
            onChangeText={setAssunto}
          />

          <Text style={s.label}>Sua Mensagem</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Descreva o que aconteceu..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={mensagem}
            onChangeText={setMensagem}
          />

          <TouchableOpacity style={s.submitButton} onPress={enviarMensagem}>
            <Text style={s.submitButtonText}>Enviar Solicitação</Text>
          </TouchableOpacity>
        </View>

        <View style={s.dividerContainer}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>OU</Text>
          <View style={s.dividerLine} />
        </View>

        <TouchableOpacity style={s.whatsappButton} onPress={abrirWhatsAppSuporte}>
          <Ionicons name="logo-whatsapp" size={24} color="#fff" />
          <Text style={s.whatsappText}>Falar via WhatsApp</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background,
    },
    backButton: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 20, fontWeight: "bold", color: colors.text },
    content: { paddingHorizontal: 24 },
    contactCard: {
      alignItems: "center", padding: 24, backgroundColor: colors.surface, borderRadius: 16,
      marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    contactTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 12, marginBottom: 4 },
    contactSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
    form: {
      backgroundColor: colors.surface, borderRadius: 16, padding: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    input: {
      backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16,
      fontSize: 15, color: colors.text, borderWidth: 1, borderColor: "transparent", marginBottom: 16,
    },
    textArea: { height: 120 },
    submitButton: {
      backgroundColor: "#10b981", borderRadius: 12, paddingVertical: 16, alignItems: "center",
    },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
    dividerText: { marginHorizontal: 16, color: colors.textMuted, fontWeight: "bold" },
    whatsappButton: {
      backgroundColor: "#25D366", flexDirection: "row", borderRadius: 12, paddingVertical: 16,
      alignItems: "center", justifyContent: "center",
      shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    whatsappText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 12 },
  });
}
