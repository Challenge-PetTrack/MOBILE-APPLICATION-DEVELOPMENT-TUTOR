import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ActionCardProps = {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  badgeCount?: number;
  isDark?: boolean;
};

export default function ActionCard({ title, iconName, iconColor, onPress, badgeCount, isDark }: ActionCardProps) {
  const s = makeStyles(isDark);
  return (
    <TouchableOpacity style={s.actionCard} onPress={onPress}>
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

const makeStyles = (isDark: boolean = false) => StyleSheet.create({
  actionCard: {
    width: "48%",
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
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
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: isDark ? "#f3f4f6" : "#1f2937",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: isDark ? "#1f2937" : "#ffffff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
