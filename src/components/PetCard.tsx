import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { PetDTO } from "@/service/petService";

interface Props {
  pet: PetDTO;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFicha?: () => void;
  isDeleting?: boolean;
}

export default function PetCard({ pet, onPress, onEdit, onDelete, onFicha, isDeleting }: Props) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <TouchableOpacity 
      style={s.card} 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={s.imageContainer}>
        {pet.fotoUri ? (
          <Image source={{ uri: pet.fotoUri }} style={s.image} />
        ) : (
          <View style={s.placeholderImage}>
            <Ionicons name="paw" size={32} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={s.infoContainer}>
        <View style={s.headerRow}>
          <Text style={s.name} numberOfLines={1}>{pet.nome}</Text>
          <View style={s.actionIcons}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={s.iconButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="pencil" size={18} color={colors.secondary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={s.iconButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} disabled={isDeleting}>
                <Ionicons name="trash" size={18} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={s.subtitle}>
          {pet.especie} {pet.raca ? `• ${pet.raca}` : ""}
        </Text>

        <View style={s.tagsRow}>
          {pet.idade && (
            <View style={s.tag}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={s.tagText}>{pet.idade} anos</Text>
            </View>
          )}
          {pet.peso && (
            <View style={s.tag}>
              <Ionicons name="scale-outline" size={14} color={colors.textSecondary} />
              <Text style={s.tagText}>{pet.peso} kg</Text>
            </View>
          )}
        </View>

        {onFicha && (
          <TouchableOpacity style={s.fichaButton} onPress={onFicha}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={s.fichaButtonText}>Ficha Clínica</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  actionIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
  },
  fichaButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  fichaButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
});
