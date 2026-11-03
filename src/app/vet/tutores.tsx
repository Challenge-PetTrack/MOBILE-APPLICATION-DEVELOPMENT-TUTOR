import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useContactWhatsApp, useTutores } from "@/hooks/useTutores";
import { useAllPets } from "@/hooks/usePets";
import { maskPhone } from "@/utils/validation";

export default function TutoresVetScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const tutoresQuery = useTutores();
  const petsQuery = useAllPets();
  const contactWhatsApp = useContactWhatsApp();
  const [busca, setBusca] = useState("");

  const petsPorTutor = useMemo(() => {
    const map = new Map<string, string[]>();
    (petsQuery.data ?? []).forEach((p) => {
      const list = map.get(p.tutorId) ?? [];
      list.push(p.nome);
      map.set(p.tutorId, list);
    });
    return map;
  }, [petsQuery.data]);

  const filtrados = useMemo(() => {
    const list = tutoresQuery.data ?? [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return list;
    return list.filter(
      (t) =>
        t.nome.toLowerCase().includes(termo) ||
        t.email.toLowerCase().includes(termo) ||
        (petsPorTutor.get(t.uid) ?? []).some((petNome) =>
          petNome.toLowerCase().includes(termo)
        )
    );
  }, [tutoresQuery.data, busca, petsPorTutor]);

  if (tutoresQuery.isLoading) return <LoadingScreen message="Carregando tutores..." />;
  if (tutoresQuery.isError) return <ErrorScreen onRetry={() => tutoresQuery.refetch()} />;

  return (
    <View style={s.container}>
      <Header title="Tutores Cadastrados" />

      <View style={s.searchBox}>
        <Ionicons name="search" size={19} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nome, e-mail ou pet..."
          placeholderTextColor={colors.textMuted}
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca("")}>
            <Ionicons name="close-circle" size={19} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {filtrados.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Nenhum tutor encontrado"
          message="Os tutores cadastrados no PetTrack aparecerão automaticamente aqui."
        />
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {filtrados.map((tutor) => {
            const pets = petsPorTutor.get(tutor.uid) ?? [];
            return (
              <View key={tutor.uid} style={s.card}>
                <View style={s.avatar}>
                  <Text style={s.avatarLetter}>
                    {(tutor.nome[0] || "T").toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{tutor.nome}</Text>
                  <Text style={s.email}>{tutor.email}</Text>
                  {tutor.telefone ? (
                    <Text style={s.phone}>{maskPhone(tutor.telefone)}</Text>
                  ) : null}
                  {pets.length > 0 && (
                    <View style={s.petsRow}>
                      <Ionicons name="paw" size={13} color="#0d9488" />
                      <Text style={s.petsText}>{pets.join(", ")}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    s.whatsBtn,
                    !tutor.telefone && { backgroundColor: colors.surfaceSecondary },
                  ]}
                  onPress={() =>
                    contactWhatsApp(
                      tutor.telefone,
                      `Olá ${tutor.nome}, entramos em contato pela Clínica PetTrack.`
                    )
                  }
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={20}
                    color={tutor.telefone ? "#fff" : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      marginHorizontal: 24,
      marginBottom: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      elevation: 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#fef3c7",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarLetter: { fontSize: 19, fontWeight: "bold", color: "#b45309" },
    nome: { fontSize: 16, fontWeight: "bold", color: colors.text },
    email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    phone: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    petsRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
    petsText: { fontSize: 12, fontWeight: "600", color: "#0d9488" },
    whatsBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#16a34a",
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
