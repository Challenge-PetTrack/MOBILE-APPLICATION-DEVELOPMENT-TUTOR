import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "./Header";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";

export interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  items: FaqItem[];
  accentColor?: string;
}

export default function FaqListScreen({ items, accentColor = "#4f46e5" }: Props) {
  const { colors } = useTheme();
  const s = makeStyles(colors, accentColor);

  return (
    <View style={s.container}>
      <Header title="Perguntas Frequentes" />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {items.map((item, idx) => (
          <View key={idx} style={s.card}>
            <Text style={s.question}>{item.q}</Text>
            <Text style={s.answer}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors, accentColor: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14,
      borderLeftWidth: 4,
      borderLeftColor: accentColor,
      elevation: 2,
    },
    question: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 8 },
    answer: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  });
}
