// src/app/integrantes.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";

const integrantes = [
  { id: "1", nome: "Gabriel Sbrana", rm: "RM 565849", foto: require("../../images/integrantes/gabriel.jpeg"), descricao: "Olá, sou o Gabriel. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP." },
  { id: "2", nome: "Moisés Waidemann",  rm: "RM 563719", foto: require("../../images/integrantes/moises.jpeg"), descricao: "Olá, sou o Moisés. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP."},
  { id: "3", nome: "Richard Freitas", rm: "RM 566127", foto: require("../../images/integrantes/richard.jpeg"), descricao: "Olá, sou o Richard. Tenho 19 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP." },
  { id: "4", nome: "Thiago Rodrigues",  rm: "RM 563765", foto: require("../../images/integrantes/thiago.jpeg"), descricao: "Olá, sou o Thiago. Tenho 21 anos, sou estudante de Análise e Desenvolvimento de Sistemas na FIAP."},
];

export default function Integrantes() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Integrantes</Text>
      <Text style={styles.subtitulo}>Equipe PetTrack</Text>

      <FlatList
        data={integrantes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        <View style={styles.card}>
                <Image source={item.foto} style={styles.foto} />
            <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.rm}>{item.rm}</Text>
                <Text style={styles.descricao}>{item.descricao}</Text>
            </View>
        </View>
        )}
      />

      <TouchableOpacity style={styles.botao} onPress={() => router.push("/")}>
        <Text style={styles.botaoTexto}>Voltar para Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  nome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  rm: {
    fontSize: 14,
    color: "#888",
  },
  botao: {
    marginTop: 24,
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  foto: {
  width: 52,
  height: 52,
  borderRadius: 26,
  marginRight: 16,
  },
  info: {
  flex: 1,
  },
  descricao: {
  fontSize: 12,
  color: "#303030",
  marginTop: 4,
  },
});