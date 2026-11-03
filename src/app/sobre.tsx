import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useAppInfo } from "@/hooks/useAppInfo";
import { formatDateTime } from "@/utils/date";

export default function SobreScreen() {
  const { colors } = useTheme();
  const { info, openRepository } = useAppInfo();
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <Header title="Sobre o App" />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={s.logo}
            contentFit="contain"
          />
          <Text style={s.appName}>{info.appName}</Text>
          <Text style={s.tagline}>
            Plataforma integrada de saúde pet para Tutores e Clínicas Veterinárias
          </Text>
          <View style={s.versionPill}>
            <Ionicons name="ribbon-outline" size={16} color="#4f46e5" />
            <Text style={s.versionPillText}>
              Versão {info.version} (build {info.nativeBuildVersion})
            </Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Referência da Versão Publicada</Text>
        <View style={s.commitCard}>
          <View style={s.commitHeader}>
            <View style={s.commitIconBox}>
              <Ionicons name="git-commit-outline" size={24} color="#4f46e5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.commitLabel}>Hash do Commit (curto)</Text>
              <Text selectable style={s.commitShort}>
                {info.gitCommitShort}
              </Text>
            </View>
            <View style={s.branchBadge}>
              <Ionicons name="git-branch-outline" size={13} color="#10b981" />
              <Text style={s.branchText}>{info.gitBranch}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <Text style={s.commitSubLabel}>SHA-1 completo do commit</Text>
          <View style={s.hashBox}>
            <Text selectable style={s.hashFull}>
              {info.gitCommitHash}
            </Text>
          </View>

          {info.gitCommitDate ? (
            <Text style={s.commitDateText}>
              Data do commit: {formatDateTime(info.gitCommitDate)}
            </Text>
          ) : null}
        </View>

        <Text style={s.sectionTitle}>Publicação e Ambiente</Text>
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Text style={s.infoKey}>Canal de Distribuição</Text>
            <Text style={s.infoValue}>{info.distributionChannel}</Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.infoRow}>
            <Text style={s.infoKey}>Pacote Android</Text>
            <Text selectable style={s.infoValue}>
              {info.packageName}
            </Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.infoRow}>
            <Text style={s.infoKey}>Projeto Firebase</Text>
            <Text selectable style={s.infoValue}>
              {info.firebaseProjectId}
            </Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.infoRow}>
            <Text style={s.infoKey}>Arquitetura</Text>
            <Text style={s.infoValue}>Expo Router • TanStack Query • Firestore</Text>
          </View>
        </View>

        <TouchableOpacity style={s.repoButton} onPress={openRepository}>
          <Ionicons name="logo-github" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.repoButtonText}>Abrir Repositório no GitHub</Text>
        </TouchableOpacity>

        <Text style={s.footerNote}>
          FIAP • Mobile Application Development • 4ª Sprint
        </Text>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingBottom: 48 },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    logo: { width: 84, height: 84, marginBottom: 12 },
    appName: { fontSize: 26, fontWeight: "bold", color: colors.text },
    tagline: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
    },
    versionPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#e0e7ff",
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 14,
    },
    versionPillText: { color: "#4f46e5", fontWeight: "bold", fontSize: 13 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 10,
      marginLeft: 4,
    },
    commitCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#4f46e540",
    },
    commitHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    commitIconBox: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#e0e7ff",
      justifyContent: "center",
      alignItems: "center",
    },
    commitLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
    commitShort: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#4f46e5",
      fontFamily: "monospace",
      marginTop: 2,
    },
    branchBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#d1fae5",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    branchText: { fontSize: 12, fontWeight: "bold", color: "#065f46" },
    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 14 },
    commitSubLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600", marginBottom: 6 },
    hashBox: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 12,
    },
    hashFull: {
      fontSize: 12,
      color: colors.text,
      fontFamily: "monospace",
    },
    commitDateText: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 18,
      marginBottom: 24,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      gap: 12,
    },
    infoKey: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
    infoValue: { fontSize: 14, color: colors.text, fontWeight: "bold", flexShrink: 1, textAlign: "right" },
    rowDivider: { height: 1, backgroundColor: colors.borderLight },
    repoButton: {
      backgroundColor: "#1f2937",
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 18,
    },
    repoButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    footerNote: { textAlign: "center", fontSize: 12, color: colors.textMuted },
  });
}
