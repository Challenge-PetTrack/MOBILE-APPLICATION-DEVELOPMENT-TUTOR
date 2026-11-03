import { View, FlatList, StyleSheet } from "react-native";
import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import PetSelectorBar from "@/components/PetSelectorBar";
import VacinaItem from "@/components/VacinaItem";
import EmptyState from "@/components/EmptyState";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme } from "@/context/ThemeContext";
import { useTutorPets } from "@/hooks/usePets";
import { useToggleVacina, useTutorVacinas } from "@/hooks/useVacinas";
import { CATALOGO_VACINAS } from "@/constants/catalogos";
import type { Pet, VacinaRegistro } from "@/types/models";

const EMPTY_PETS: Pet[] = [];

export default function VacinasScreen() {
  const router = useRouter();
  const { petId: paramPetId } = useLocalSearchParams<{ petId?: string }>();
  const { colors } = useTheme();

  const petsQuery = useTutorPets();
  const vacinasQuery = useTutorVacinas();
  const toggleVacina = useToggleVacina();

  const pets = petsQuery.data ?? EMPTY_PETS;
  const vacinasData = vacinasQuery.data;

  const routeKey = paramPetId ?? "";
  const [petOverride, setPetOverride] = useState<{ key: string; petId: string } | null>(null);

  const selectedPetId = useMemo(() => {
    const candidate =
      petOverride && petOverride.key === routeKey ? petOverride.petId : paramPetId ?? null;
    if (candidate && pets.some((p) => p.id === candidate)) return candidate;
    return pets[0]?.id ?? null;
  }, [pets, petOverride, paramPetId, routeKey]);

  const setSelectedPetId = (petId: string) => setPetOverride({ key: routeKey, petId });

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const registrosPorVacina = useMemo(() => {
    const map = new Map<string, VacinaRegistro>();
    (vacinasData ?? [])
      .filter((r) => r.petId === selectedPetId)
      .forEach((r) => map.set(r.vacinaId, r));
    return map;
  }, [vacinasData, selectedPetId]);

  if (petsQuery.isLoading || vacinasQuery.isLoading) {
    return <LoadingScreen message="Carregando carteira de vacinação..." />;
  }
  if (petsQuery.isError || vacinasQuery.isError) {
    return (
      <ErrorScreen
        onRetry={() => {
          petsQuery.refetch();
          vacinasQuery.refetch();
        }}
      />
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Header title="Carteira de Vacinas" />

      {pets.length === 0 ? (
        <EmptyState
          icon="medkit-outline"
          title="Nenhum pet encontrado"
          message="Cadastre um pet primeiro para controlar a carteira de vacinação."
          actionLabel="Cadastrar um Pet"
          onAction={() => router.push("/tutor/cadastro-pet")}
        />
      ) : (
        <>
          <PetSelectorBar
            pets={pets}
            selectedPetId={selectedPetId}
            onSelect={setSelectedPetId}
            accentColor="#ef4444"
          />

          <FlatList
            data={CATALOGO_VACINAS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const registro = registrosPorVacina.get(item.id);
              return (
                <VacinaItem
                  vacina={item}
                  registro={registro}
                  disabled={toggleVacina.isPending || !selectedPet}
                  onToggle={() => {
                    if (!selectedPet) return;
                    toggleVacina.mutate({
                      pet: selectedPet,
                      vacinaId: item.id,
                      currentlyTaken: registro?.tomada === true,
                    });
                  }}
                />
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 24, paddingBottom: 40 },
});
