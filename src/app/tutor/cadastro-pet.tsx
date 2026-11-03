import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import PetForm from "@/components/PetForm";
import { useTheme } from "@/context/ThemeContext";
import { useCreatePet } from "@/hooks/usePets";

export default function CadastroPetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const createPet = useCreatePet();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Cadastrar Pet" />
      <PetForm
        submitLabel="Salvar Pet"
        submitting={createPet.isPending}
        onSubmit={async (fields) => {
          try {
            await createPet.mutateAsync(fields);
            Alert.alert("Sucesso!", `${fields.nome.trim()} foi cadastrado no PetTrack.`, [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch {
            Alert.alert("Erro", "Não foi possível salvar o cadastro do pet.");
          }
        }}
      />
    </View>
  );
}
