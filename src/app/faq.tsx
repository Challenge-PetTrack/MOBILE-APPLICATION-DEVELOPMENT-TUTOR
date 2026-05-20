import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function FAQ() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const faqs = [
    { q: "Como adiciono um novo pet?", a: "Vá para a tela inicial, clique em 'Cadastro' e preencha as informações do seu pet, incluindo uma foto se desejar." },
    { q: "Como agendo uma consulta?", a: "Na tela inicial, toque em 'Agendar Consulta', selecione o seu pet, a data e o motivo. O veterinário será notificado." },
    { q: "Posso editar os dados do meu pet?", a: "Sim, vá em 'Meu Pet', clique no botão de editar (lápis) no card do pet e atualize as informações." },
    { q: "Como o veterinário acessa os dados do meu pet?", a: "O veterinário tem acesso à ficha médica e agendamentos através do painel dele no aplicativo." },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Perguntas Frequentes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {faqs.map((item, index) => (
          <View key={index} style={s.card}>
            <Text style={s.question}>{item.q}</Text>
            <Text style={s.answer}>{item.a}</Text>
          </View>
        ))}
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
    card: {
      backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    question: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 8 },
    answer: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  });
}
