import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

type ActionCardProps = {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  badgeCount?: number;
};

export default function ActionCard({ title, iconName, iconColor, onPress, badgeCount }: ActionCardProps) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  
  return (
    <TouchableOpacity style={s.actionCard} activeOpacity={0.7} onPress={onPress}>
      <View style={{ position: "relative" }}>
        <View style={[s.iconContainer, { backgroundColor: iconColor + "20" }]}>
          <Ionicons name={iconName} size={32} color={iconColor} />
        </View>
        {(badgeCount ?? 0) > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{(badgeCount ?? 0) > 9 ? "9+" : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={s.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  actionCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});
