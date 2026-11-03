import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotifications";
import { useAppInfo } from "@/hooks/useAppInfo";
import { maskPhone, onlyDigits } from "@/utils/validation";

export default function AjustesTutorScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const { enabled: notificacoes, scheduledCount, toggleNotifications } =
    useNotificationPreferences();
  const { info } = useAppInfo();

  const [modalPerfil, setModalPerfil] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const abrirModalPerfil = () => {
    setNome(user?.nome ?? "");
    setTelefone(maskPhone(user?.telefone ?? ""));
    setModalPerfil(true);
  };

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome não pode ficar vazio.");
      return;
    }
    try {
      await updateProfile({ nome, telefone: onlyDigits(telefone) });
      setModalPerfil(false);
      Alert.alert("Sucesso", "Seu perfil foi atualizado.");
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o perfil.");
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <Header title="Ajustes e Perfil" />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Conta</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.rowItem} onPress={abrirModalPerfil}>
            <View style={s.rowLeft}>
              <Ionicons name="person" size={23} color="#4f46e5" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={s.rowText}>Editar Meu Perfil</Text>
                <Text style={s.rowSubText}>
                  {user?.nome}
                  {user?.telefone ? ` • ${maskPhone(user.telefone)}` : ""}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Preferências</Text>
        <View style={s.card}>
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="notifications" size={23} color="#10b981" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={s.rowText}>Notificações Locais</Text>
                <Text style={s.rowSubText}>
                  {notificacoes
                    ? `${scheduledCount} lembrete(s) ativo(s)`
                    : "Notificações desativadas"}
                </Text>
              </View>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: "#a7f3d0" }}
              thumbColor={notificacoes ? "#10b981" : colors.surfaceSecondary}
            />
          </View>
          <View style={s.divider} />
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="moon" size={23} color={isDark ? "#a78bfa" : "#4f46e5"} />
              <Text style={[s.rowText, { marginLeft: 14 }]}>Modo Escuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: "#c4b5fd" }}
              thumbColor={isDark ? "#7c3aed" : colors.surfaceSecondary}
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>Suporte e Informações</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.rowItem} onPress={() => router.push("/tutor/faq")}>
            <View style={s.rowLeft}>
              <Ionicons name="help-circle" size={23} color="#10b981" />
              <Text style={[s.rowText, { marginLeft: 14 }]}>Perguntas Frequentes (FAQ)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.rowItem} onPress={() => router.push("/tutor/sac")}>
            <View style={s.rowLeft}>
              <Ionicons name="chatbubbles" size={23} color="#0ea5e9" />
              <Text style={[s.rowText, { marginLeft: 14 }]}>Fale Conosco (SAC)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.rowItem} onPress={() => router.push("/sobre")}>
            <View style={s.rowLeft}>
              <Ionicons name="information-circle" size={23} color="#4f46e5" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={s.rowText}>Sobre o App</Text>
                <Text style={s.rowSubText}>
                  v{info.version} • commit {info.gitCommitShort}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={s.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalPerfil} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Editar Perfil</Text>
            <Text style={s.modalLabel}>Nome Completo</Text>
            <TextInput
              style={s.modalInput}
              value={nome}
              onChangeText={setNome}
              placeholderTextColor={colors.textMuted}
              placeholder="Seu nome"
            />
            <Text style={s.modalLabel}>Telefone (WhatsApp)</Text>
            <TextInput
              style={s.modalInput}
              value={telefone}
              onChangeText={(txt) => setTelefone(maskPhone(txt))}
              placeholderTextColor={colors.textMuted}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
            <View style={s.modalButtons}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setModalPerfil(false)}
              >
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={salvarPerfil}>
                <Text style={s.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingBottom: 48 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: colors.textMuted,
      marginTop: 20,
      marginBottom: 10,
      marginLeft: 6,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingVertical: 6,
      elevation: 2,
    },
    rowItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    rowLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
    rowText: { fontSize: 15, color: colors.text, fontWeight: "600" },
    rowSubText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 52 },
    logoutBtn: {
      marginTop: 28,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: "#ef444440",
    },
    logoutText: { color: "#ef4444", fontWeight: "bold", fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 26,
      paddingBottom: 38,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 20 },
    modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
    modalInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 15,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    modalButtons: { flexDirection: "row", gap: 12, marginTop: 6 },
    modalCancelBtn: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
    },
    modalCancelText: { color: colors.text, fontWeight: "600", fontSize: 15 },
    modalSaveBtn: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      backgroundColor: "#4f46e5",
      alignItems: "center",
    },
    modalSaveText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  });
}
