import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import PetSelectorBar from "@/components/PetSelectorBar";
import ScoreGauge from "@/components/ScoreGauge";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useTutorPets } from "@/hooks/usePets";
import { computeScore, useRotinaHoje, useToggleTarefaRotina } from "@/hooks/useRotina";
import { TAREFAS_ROTINA } from "@/constants/catalogos";
import type { Pet } from "@/types/models";

const EMPTY_PETS: Pet[] = [];

export default function ScoreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const petsQuery = useTutorPets();
  const pets = petsQuery.data ?? EMPTY_PETS;
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const activePetId = useMemo(() => {
    if (selectedPetId && pets.some((p) => p.id === selectedPetId)) return selectedPetId;
    return pets[0]?.id ?? null;
  }, [pets, selectedPetId]);

  const rotinaQuery = useRotinaHoje(activePetId ?? undefined);
  const toggleTarefa = useToggleTarefaRotina();

  const concluidas = rotinaQuery.data?.tarefasConcluidas ?? [];
  const score = computeScore(concluidas);

  if (petsQuery.isLoading) return <LoadingScreen message="Carregando rotina diária..." />;

  return (
    <View style={s.container}>
      <Header title="Score de Bem-Estar" />

      {pets.length === 0 ? (
        <EmptyState
          icon="stats-chart-outline"
          title="Nenhum pet cadastrado"
          message="Cadastre um pet para acompanhar diariamente os hábitos de saúde e bem-estar."
          actionLabel="Cadastrar um Pet"
          onAction={() => router.push("/tutor/cadastro-pet")}
        />
      ) : (
        <>
          <PetSelectorBar
            pets={pets}
            selectedPetId={activePetId}
            onSelect={setSelectedPetId}
            accentColor="#f59e0b"
          />

          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <ScoreGauge score={score} />

            <Text style={s.sectionTitle}>Rotina de Hoje</Text>
            {TAREFAS_ROTINA.map((task) => {
              const done = concluidas.includes(task.id);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[s.taskCard, done && s.taskCardDone]}
                  onPress={() =>
                    activePetId &&
                    toggleTarefa.mutate({
                      petId: activePetId,
                      tarefaId: task.id,
                      atuais: concluidas,
                    })
                  }
                >
                  <View style={[s.taskIconBox, done && s.taskIconBoxDone]}>
                    <Ionicons
                      name={task.icon}
                      size={22}
                      color={done ? "#fff" : "#f59e0b"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.taskTitle, done && s.taskTitleDone]}>{task.title}</Text>
                    <Text style={s.taskPoints}>+{task.points} pontos</Text>
                  </View>
                  <Ionicons
                    name={done ? "checkmark-circle" : "ellipse-outline"}
                    size={26}
                    color={done ? "#10b981" : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 14 },
    taskCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      elevation: 2,
    },
    taskCardDone: { borderWidth: 1.5, borderColor: "#10b981" },
    taskIconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#f59e0b20",
      justifyContent: "center",
      alignItems: "center",
    },
    taskIconBoxDone: { backgroundColor: "#10b981" },
    taskTitle: { fontSize: 16, fontWeight: "bold", color: colors.text },
    taskTitleDone: { color: "#10b981" },
    taskPoints: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: "600" },
  });
}
