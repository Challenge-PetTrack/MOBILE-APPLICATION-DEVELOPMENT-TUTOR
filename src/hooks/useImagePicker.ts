import { useCallback } from "react";
import { Alert } from "react-native";
import {
  pickImage,
  PermissionDeniedError,
  type ImageSource,
} from "@/services/imageService";

export function useImagePicker() {
  const selectImage = useCallback(
    async (source: ImageSource, options?: { square?: boolean }): Promise<string | null> => {
      try {
        return await pickImage(source, options);
      } catch (error) {
        if (error instanceof PermissionDeniedError) {
          Alert.alert("Permissão necessária", error.message);
          return null;
        }
        Alert.alert("Erro", "Não foi possível carregar a imagem selecionada.");
        return null;
      }
    },
    []
  );

  return { selectImage };
}
