import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import type { Pet } from "@/types/models";

interface PetSelectorBarProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (petId: string) => void;
  accentColor?: string;
}

export default function PetSelectorBar({
  pets,
  selectedPetId,
  onSelect,
  accentColor = "#4f46e5",
}: PetSelectorBarProps) {
  const { colors } = useTheme();

  return (
    <View style={s.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {pets.map((pet) => {
          const selected = pet.id === selectedPetId;
          return (
            <TouchableOpacity
              key={pet.id}
              style={[
                s.pill,
                { backgroundColor: selected ? accentColor : colors.surfaceSecondary },
              ]}
              onPress={() => onSelect(pet.id)}
            >
              <Ionicons
                name="paw"
                size={15}
                color={selected ? "#fff" : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={[s.pillText, { color: selected ? "#fff" : colors.textSecondary }]}>
                {pet.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  scroll: { paddingHorizontal: 24, gap: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillText: { fontSize: 14, fontWeight: "600" },
});
