import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "./Header";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useCreateChamado, useMeusChamados, useSuporteWhatsApp } from "@/hooks/useChamados";
import { formatDateTime } from "@/utils/date";

interface Props {
  accentColor?: string;
  subtitle: string;
}

export default function SacSupportScreen({ accentColor = "#10b981", subtitle }: Props) {
  const { colors } = useTheme();
  const s = makeStyles(colors, accentColor);

  const chamadosQuery = useMeusChamados();
  const createChamado = useCreateChamado();
  const abrirWhatsApp = useSuporteWhatsApp();

  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleEnviar = async () => {
    if (!assunto.trim() || !mensagem.trim()) {
      Alert.alert("Atenção", "Preencha o assunto e a mensagem.");
      return;
    }

    try {
      await createChamado.mutateAsync({ assunto, mensagem });
      setAssunto("");
      setMensagem("");
      Alert.alert(
        "Chamado registrado!",
        "Sua solicitação foi salva na nossa central de atendimento."
      );
    } catch {
      Alert.alert("Erro", "Não foi possível registrar seu chamado.");
    }
  };

  const chamados = chamadosQuery.data ?? [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Fale Conosco (SAC)" />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.whatsCard} onPress={abrirWhatsApp}>
          <View style={s.whatsIcon}>
            <Ionicons name="logo-whatsapp" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.whatsTitle}>Atendimento Rápido via WhatsApp</Text>
            <Text style={s.whatsSub}>{subtitle}</Text>
          </View>
          <Ionicons name="open-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={s.formCard}>
          <Text style={s.sectionTitle}>Abrir Chamado no Aplicativo</Text>

          <Text style={s.label}>Assunto</Text>
          <TextInput
            style={s.input}
            placeholder="Ex.: Dúvida sobre agendamento"
            placeholderTextColor={colors.textMuted}
            value={assunto}
            onChangeText={setAssunto}
          />

          <Text style={s.label}>Mensagem</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Descreva sua solicitação em detalhes..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={mensagem}
            onChangeText={setMensagem}
          />

          <TouchableOpacity
            style={s.sendBtn}
            onPress={handleEnviar}
            disabled={createChamado.isPending}
          >
            <Ionicons name="send" size={17} color="#fff" />
            <Text style={s.sendBtnText}>
              {createChamado.isPending ? "Enviando..." : "Enviar Solicitação"}
            </Text>
          </TouchableOpacity>
        </View>

        {chamados.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={s.sectionTitle}>Meus Chamados ({chamados.length})</Text>
            {chamados.map((ch) => (
              <View key={ch.id} style={s.ticketCard}>
                <View style={s.ticketHeader}>
                  <Text style={s.ticketSubject}>{ch.assunto}</Text>
                  <View style={s.ticketBadge}>
                    <Text style={s.ticketBadgeText}>
                      {ch.status === "respondido" ? "Respondido" : "Em análise"}
                    </Text>
                  </View>
                </View>
                <Text style={s.ticketBody}>{ch.mensagem}</Text>
                <Text style={s.ticketDate}>{formatDateTime(ch.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors, accentColor: string) {
  return StyleSheet.create({
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    whatsCard: {
      backgroundColor: "#16a34a",
      borderRadius: 20,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 20,
    },
    whatsIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    whatsTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    whatsSub: { color: "#dcfce7", fontSize: 12, marginTop: 2 },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 22,
      elevation: 2,
    },
    sectionTitle: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: 14 },
    label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    textArea: { height: 110, textAlignVertical: "top" },
    sendBtn: {
      backgroundColor: accentColor,
      borderRadius: 14,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    sendBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    ticketCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    ticketHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    ticketSubject: { fontSize: 15, fontWeight: "bold", color: colors.text, flex: 1 },
    ticketBadge: {
      backgroundColor: "#fef3c7",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    ticketBadgeText: { fontSize: 11, fontWeight: "bold", color: "#92400e" },
    ticketBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
    ticketDate: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
  });
}
