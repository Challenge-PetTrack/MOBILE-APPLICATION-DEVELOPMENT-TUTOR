import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export type ImageSource = "camera" | "library";

const MAX_WIDTH = 600;
const COMPRESSION = 0.5;

export class PermissionDeniedError extends Error {
  constructor(source: ImageSource) {
    super(source === "camera" ? "Permissão da câmera negada." : "Permissão da galeria negada.");
    this.name = "PermissionDeniedError";
  }
}

async function ensurePermission(source: ImageSource) {
  const result =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!result.granted) throw new PermissionDeniedError(source);
}

/**
 * Abre a câmera ou a galeria e devolve a imagem redimensionada e comprimida
 * como data URI (base64), pronta para ser salva no Firestore e exibida em qualquer aparelho.
 * Retorna `null` se o usuário cancelar.
 */
export async function pickImage(
  source: ImageSource,
  options: { square?: boolean } = {}
): Promise<string | null> {
  await ensurePermission(source);

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: options.square ?? false,
    aspect: options.square ? [1, 1] : undefined,
    quality: 1,
  };

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const resize = asset.width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
  const manipulated = await manipulateAsync(asset.uri, resize, {
    compress: COMPRESSION,
    format: SaveFormat.JPEG,
    base64: true,
  });

  return manipulated.base64 ? `data:image/jpeg;base64,${manipulated.base64}` : manipulated.uri;
}
