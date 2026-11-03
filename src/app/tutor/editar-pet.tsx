import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import PetForm from "@/components/PetForm";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme } from "@/context/ThemeContext";
import { usePetById, useUpdatePet } from "@/hooks/usePets";

export default function EditarPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: pet, isLoading, isError, refetch } = usePetById(id);
  const updatePet = useUpdatePet();

  if (isLoading) return <LoadingScreen message="Carregando dados do pet..." />;
  if (isError || !pet) {
    return <ErrorScreen message="Não foi possível localizar o pet." onRetry={refetch} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Editar Pet" />
      <PetForm
        key={pet.id}
        initialValues={{
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca,
          idade: pet.idade,
          peso: pet.peso,
          fotoUri: pet.fotoUri,
        }}
        submitLabel="Salvar Alterações"
        submitting={updatePet.isPending}
        onSubmit={async (fields) => {
          try {
            await updatePet.mutateAsync({ id: pet.id, fields });
            Alert.alert("Atualizado!", "Os dados do pet foram atualizados.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch {
            Alert.alert("Erro", "Não foi possível atualizar os dados do pet.");
          }
        }}
      />
    </View>
  );
}
