import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Linking, Alert } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function TutoresVet() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tutores, setTutores] = useState<any[]>([]);
  const [filtrados, setFiltrados] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTutores();
    }, [])
  );

  const loadTutores = async () => {
    try {
      setLoading(true);
      const usersData = await AsyncStorage.getItem("@users");
      if (usersData) {
        const users = JSON.parse(usersData);
        const onlyTutores = users.filter((u: any) => u.perfil === "tutor");
        setTutores(onlyTutores);
        setFiltrados(onlyTutores);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusca = (text: string) => {
    setBusca(text);
    if (!text.trim()) {
      setFiltrados(tutores);
    } else {
      setFiltrados(tutores.filter(t => 
        t.nome?.toLowerCase().includes(text.toLowerCase()) ||
        t.email?.toLowerCase().includes(text.toLowerCase())
      ));
    }
  };

  const abrirWhatsApp = (tutor: any) => {
    const numero = tutor.telefone?.replace(/\D/g, "");
    if (!numero) {
      Alert.alert("Sem WhatsApp", "Este tutor não cadastrou um número de WhatsApp.");
      return;
    }
    const url = `https://wa.me/55${numero}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
      }
    });
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Tutores Cadastrados</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.searchBarContainer}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput 
            style={s.searchInput}
            placeholder="Buscar tutor pelo nome..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={handleBusca}
          />
        </View>
      </View>

      {loading ? (
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
          {filtrados.length > 0 ? (
            filtrados.map(tutor => (
              <View key={tutor.id} style={s.card}>
                <View style={s.avatarContainer}>
                  <Text style={s.avatarText}>{(tutor.nome || "?")[0].toUpperCase()}</Text>
                </View>
                <View style={s.infoContainer}>
                  <Text style={s.tutorName}>{tutor.nome || "Tutor Sem Nome"}</Text>
                  <View style={s.contactRow}>
                    <Ionicons name="mail" size={14} color={colors.textMuted} />
                    <Text style={s.contactText}>{tutor.email}</Text>
                  </View>
                  {tutor.telefone ? (
                    <View style={s.contactRow}>
                      <Ionicons name="call" size={14} color={colors.textMuted} />
                      <Text style={s.contactText}>{tutor.telefone}</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity 
                  style={[s.whatsappButton, !tutor.telefone && s.whatsappButtonDisabled]} 
                  onPress={() => abrirWhatsApp(tutor)}
                >
                  <Ionicons name="logo-whatsapp" size={24} color={tutor.telefone ? "#fff" : colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={s.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.textMuted} />
              <Text style={s.emptyText}>Nenhum tutor encontrado.</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    searchBarContainer: { paddingHorizontal: 24, marginBottom: 20 },
    searchBar: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
      borderRadius: 16, paddingHorizontal: 16, height: 50,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: colors.text },
    list: { paddingHorizontal: 24 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: {
      flexDirection: "row", backgroundColor: colors.surface, padding: 16,
      borderRadius: 16, marginBottom: 16, alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    avatarContainer: {
      width: 50, height: 50, borderRadius: 25, backgroundColor: "#fef3c7",
      justifyContent: "center", alignItems: "center", marginRight: 16,
    },
    avatarText: { fontSize: 20, fontWeight: "bold", color: "#d97706" },
    infoContainer: { flex: 1 },
    tutorName: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 4 },
    contactRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
    contactText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6 },
    whatsappButton: {
      width: 44, height: 44, borderRadius: 22, backgroundColor: "#25D366",
      justifyContent: "center", alignItems: "center",
    },
    whatsappButtonDisabled: { backgroundColor: colors.surfaceSecondary },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 60 },
    emptyText: { marginTop: 16, fontSize: 16, color: colors.textMuted },
  });
}
