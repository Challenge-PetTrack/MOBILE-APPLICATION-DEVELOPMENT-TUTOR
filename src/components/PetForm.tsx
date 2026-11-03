import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import type { SavePetFields } from "@/hooks/usePets";

const ESPECIES = ["Cachorro", "Gato", "Ave", "Outro"];

interface PetFormProps {
  initialValues?: SavePetFields;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (fields: SavePetFields) => Promise<void>;
}

export default function PetForm({
  initialValues,
  submitLabel,
  submitting = false,
  onSubmit,
}: PetFormProps) {
  const { colors } = useTheme();
  const { selectImage } = useImagePicker();
  const s = makeStyles(colors);

  const [nome, setNome] = useState(initialValues?.nome ?? "");
  const [especie, setEspecie] = useState(initialValues?.especie ?? "Cachorro");
  const [raca, setRaca] = useState(initialValues?.raca ?? "");
  const [idade, setIdade] = useState(initialValues?.idade ?? "");
  const [peso, setPeso] = useState(initialValues?.peso ?? "");
  const [fotoUri, setFotoUri] = useState<string | null>(initialValues?.fotoUri ?? null);

  const handleFotoPress = () => {
    const options: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] = [
      {
        text: "Câmera",
        onPress: async () => {
          const uri = await selectImage("camera", { square: true });
          if (uri) setFotoUri(uri);
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const uri = await selectImage("library", { square: true });
          if (uri) setFotoUri(uri);
        },
      },
    ];
    if (fotoUri) {
      options.push({ text: "Remover Foto", style: "destructive", onPress: () => setFotoUri(null) });
    }
    options.push({ text: "Cancelar", style: "cancel" });

    Alert.alert("Foto do Pet", "Escolha uma opção:", options);
  };

  const handleSave = async () => {
    if (!nome.trim() || !especie.trim()) {
      Alert.alert("Atenção", "Preencha pelo menos o nome e a espécie do pet.");
      return;
    }
    await onSubmit({ nome, especie, raca, idade, peso, fotoUri });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={s.photoPicker} onPress={handleFotoPress}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Ionicons name="camera" size={32} color="#4f46e5" />
              <Text style={s.photoHint}>Adicionar Foto</Text>
            </View>
          )}
          <View style={s.cameraBadge}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={s.formCard}>
          <View style={s.inputGroup}>
            <Text style={s.label}>Nome do Pet *</Text>
            <TextInput
              style={s.input}
              placeholder="Ex.: Thor, Luna..."
              placeholderTextColor={colors.textMuted}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Espécie *</Text>
            <View style={s.chipsRow}>
              {ESPECIES.map((item) => {
                const active = especie.toLowerCase() === item.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item}
                    style={[s.chip, active && s.chipActive]}
                    onPress={() => setEspecie(item)}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Raça</Text>
            <TextInput
              style={s.input}
              placeholder="Ex.: Golden Retriever, SRD..."
              placeholderTextColor={colors.textMuted}
              value={raca}
              onChangeText={setRaca}
            />
          </View>

          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.label}>Idade (anos)</Text>
              <TextInput
                style={s.input}
                placeholder="Ex.: 3"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
              />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.label}>Peso (kg)</Text>
              <TextInput
                style={s.input}
                placeholder="Ex.: 12,5"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={peso}
                onChangeText={setPeso}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={s.submitText}>{submitLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    photoPicker: { alignSelf: "center", marginBottom: 24, position: "relative" },
    photo: { width: 116, height: 116, borderRadius: 58, borderWidth: 3, borderColor: "#4f46e5" },
    photoPlaceholder: {
      width: 116,
      height: 116,
      borderRadius: 58,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: "#4f46e5",
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
    },
    photoHint: { fontSize: 12, color: "#4f46e5", fontWeight: "600", marginTop: 4 },
    cameraBadge: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#4f46e5",
      justifyContent: "center",
      alignItems: "center",
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 22,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: colors.surfaceSecondary,
    },
    chipActive: { backgroundColor: "#4f46e5" },
    chipText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
    chipTextActive: { color: "#fff" },
    row: { flexDirection: "row", gap: 12 },
    submitBtn: {
      backgroundColor: "#4f46e5",
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
    },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
