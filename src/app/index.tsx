import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();

  const menuItems = [
    { title: "Meu Pet", icon: "paw", route: "/pet", color: "#4f46e5" },
    { title: "Cadastro", icon: "add-circle", route: "/cadastro", color: "#10b981" },
    { title: "Score", icon: "stats-chart", route: "/score", color: "#f59e0b" },
    { title: "Vacinas", icon: "medkit", route: "/vacinas", color: "#ef4444" },
    { title: "Medicamentos", icon: "medical", route: "/medicamentos", color: "#ec4899" },
    { title: "Equipe", icon: "people", route: "/integrantes", color: "#8b5cf6" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, tutor!</Text>
          <Text style={styles.subtitle}>Bem-vindo ao PetTrack</Text>
        </View>
        <Image 
          source={require("../../assets/images/icon.png")} 
          style={styles.profileImage} 
          contentFit="contain"
        />
      </View>

      <View style={styles.banner}>
        <Ionicons name="heart" size={32} color="#fff" />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Cuidando de quem te ama</Text>
          <Text style={styles.bannerSubtitle}>Acompanhe a saúde e a rotina do seu pet de forma simples.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card} 
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={32} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e5e7eb",
  },
  banner: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: "#e0e7ff",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    width: "47%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});
