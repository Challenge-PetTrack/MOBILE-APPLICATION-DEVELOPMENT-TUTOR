import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const integrantes = [
  { id: "1", nome: "Gabriel Sbrana", rm: "RM - 565849", foto: require("../../images/integrantes/gabriel.jpeg"), descricao: "Olá, sou o Gabriel. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP." },
  { id: "2", nome: "Moisés Waidemann",  rm: "RM - 563719", foto: require("../../images/integrantes/moises.jpeg"), descricao: "Olá, sou o Moisés. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP."},
  { id: "3", nome: "Richard Freitas", rm: "RM - 566127", foto: require("../../images/integrantes/richard.jpeg"), descricao: "Olá, sou o Richard. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP." },
  { id: "4", nome: "Thiago Rodrigues",  rm: "RM - 563765", foto: require("../../images/integrantes/thiago.jpeg"), descricao: "Olá, sou o Thiago. Tenho 21 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP."},
];

export default function Integrantes() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Nossa Equipe</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={integrantes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={s.pageHeader}>
            <Text style={s.pageSubtitle}>Conheça os desenvolvedores do PetTrack</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Image source={item.foto} style={s.foto} />
              <View style={s.cardTitleContainer}>
                <Text style={s.nome}>{item.nome}</Text>
                <Text style={s.rm}>{item.rm}</Text>
              </View>
            </View>
            <View style={s.cardBody}>
              <Text style={s.descricao}>{item.descricao}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  pageHeader: {
    marginBottom: 24,
  },
  pageSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  listContainer: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 16,
  },
  foto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  cardTitleContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  rm: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
  },
  cardBody: {
    paddingTop: 4,
  },
  descricao: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});