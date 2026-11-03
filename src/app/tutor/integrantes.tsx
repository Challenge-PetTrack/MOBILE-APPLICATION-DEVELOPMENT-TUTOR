import { View, Text, StyleSheet, FlatList } from "react-native";
import { Image } from "expo-image";
import Header from "@/components/Header";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";

const INTEGRANTES = [
  {
    id: "1",
    nome: "Gabriel Sbrana",
    rm: "RM - 565849",
    foto: require("../../../images/integrantes/gabriel.jpeg"),
    descricao:
      "Olá, sou o Gabriel. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP.",
  },
  {
    id: "2",
    nome: "Moisés Waidemann",
    rm: "RM - 563719",
    foto: require("../../../images/integrantes/moises.jpeg"),
    descricao:
      "Olá, sou o Moisés. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP.",
  },
  {
    id: "3",
    nome: "Richard Freitas",
    rm: "RM - 566127",
    foto: require("../../../images/integrantes/richard.jpeg"),
    descricao:
      "Olá, sou o Richard. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP.",
  },
  {
    id: "4",
    nome: "Thiago Rodrigues",
    rm: "RM - 563765",
    foto: require("../../../images/integrantes/thiago.jpeg"),
    descricao:
      "Olá, sou o Thiago. Tenho 21 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP.",
  },
];

export default function IntegrantesScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <Header title="Nossa Equipe" />

      <FlatList
        data={INTEGRANTES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={s.pageSubtitle}>Conheça os desenvolvedores do PetTrack</Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Image source={item.foto} style={s.foto} />
              <View style={{ flex: 1 }}>
                <Text style={s.nome}>{item.nome}</Text>
                <Text style={s.rm}>{item.rm}</Text>
              </View>
            </View>
            <Text style={s.descricao}>{item.descricao}</Text>
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    pageSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 18,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingBottom: 14,
    },
    foto: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
      borderWidth: 2,
      borderColor: colors.borderLight,
    },
    nome: { fontSize: 19, fontWeight: "bold", color: colors.text, marginBottom: 4 },
    rm: { fontSize: 14, color: "#8b5cf6", fontWeight: "600" },
    descricao: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  });
}
