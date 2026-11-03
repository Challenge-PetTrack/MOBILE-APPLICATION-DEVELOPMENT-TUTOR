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
import { useClinicaVet, useSaveClinica } from "@/hooks/useClinica";
import { useNotificationPreferences } from "@/hooks/useNotifications";
import { useAppInfo } from "@/hooks/useAppInfo";
import { formatCurrency, parseCurrency } from "@/utils/currency";

export default function AjustesVetScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const clinicaQuery = useClinicaVet();
  const saveClinica = useSaveClinica();
  const { enabled: notificacoes, toggleNotifications } = useNotificationPreferences();
  const { info } = useAppInfo();

  const [modalPerfil, setModalPerfil] = useState(false);
  const [nome, setNome] = useState("");
  const [crmv, setCrmv] = useState("");

  const [modalClinica, setModalClinica] = useState(false);
  const [nomeClinica, setNomeClinica] = useState("");
  const [enderecoClinica, setEnderecoClinica] = useState("");
  const [valorConsulta, setValorConsulta] = useState("150");

  const abrirModalPerfil = () => {
    setNome(user?.nome ?? "");
    setCrmv(user?.crmv ?? "");
    setModalPerfil(true);
  };

  const abrirModalClinica = () => {
    setNomeClinica(clinicaQuery.data?.nome ?? "");
    setEnderecoClinica(clinicaQuery.data?.endereco ?? "");
    setValorConsulta(String(clinicaQuery.data?.valorConsulta ?? 150));
    setModalClinica(true);
  };

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome não pode ficar vazio.");
      return;
    }
    try {
      await updateProfile({ nome, crmv });
      setModalPerfil(false);
      Alert.alert("Sucesso", "Perfil profissional atualizado!");
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o perfil.");
    }
  };

  const salvarDadosClinica = async () => {
    const valorNum = parseCurrency(valorConsulta);
    try {
      await saveClinica.mutateAsync({
        nome: nomeClinica,
        endereco: enderecoClinica,
        valorConsulta: Number.isFinite(valorNum) && valorNum > 0 ? valorNum : 150,
      });
      setModalClinica(false);
      Alert.alert("Sucesso", "Dados da clínica atualizados!");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar os dados da clínica.");
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <Header title="Ajustes Clínicos" />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Profissional e Clínica</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.rowItem} onPress={abrirModalPerfil}>
            <View style={s.rowLeft}>
              <Ionicons name="medkit" size={23} color="#0d9488" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={s.rowText}>Perfil Profissional</Text>
                <Text style={s.rowSubText}>
                  Dr(a). {user?.nome}
                  {user?.crmv ? ` • ${user.crmv}` : ""}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity style={s.rowItem} onPress={abrirModalClinica}>
            <View style={s.rowLeft}>
              <Ionicons name="business" size={23} color="#8b5cf6" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={s.rowText}>Dados da Clínica & Consulta</Text>
                <Text style={s.rowSubText}>
                  {clinicaQuery.data?.nome || "Configurar clínica"} •{" "}
                  {formatCurrency(clinicaQuery.data?.valorConsulta ?? 150)}
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
              <Ionicons name="notifications" size={23} color="#0d9488" />
              <Text style={[s.rowText, { marginLeft: 14 }]}>Alertas de Novos Agendamentos</Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: "#99f6e4" }}
              thumbColor={notificacoes ? "#0d9488" : colors.surfaceSecondary}
            />
          </View>
          <View style={s.divider} />
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="moon" size={23} color={isDark ? "#a78bfa" : "#0d9488"} />
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
          <TouchableOpacity style={s.rowItem} onPress={() => router.push("/vet/faq")}>
            <View style={s.rowLeft}>
              <Ionicons name="help-circle" size={23} color="#10b981" />
              <Text style={[s.rowText, { marginLeft: 14 }]}>Perguntas Frequentes (FAQ)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.rowItem} onPress={() => router.push("/vet/sac")}>
            <View style={s.rowLeft}>
              <Ionicons name="chatbubbles" size={23} color="#0ea5e9" />
              <Text style={[s.rowText, { marginLeft: 14 }]}>Suporte ao Parceiro (SAC)</Text>
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
            <Text style={s.modalTitle}>Perfil Profissional</Text>
            <Text style={s.modalLabel}>Nome Completo</Text>
            <TextInput
              style={s.modalInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Dr(a). Nome"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={s.modalLabel}>CRMV</Text>
            <TextInput
              style={s.modalInput}
              value={crmv}
              onChangeText={setCrmv}
              placeholder="CRMV-SP 12345"
              placeholderTextColor={colors.textMuted}
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

      <Modal visible={modalClinica} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Dados da Clínica</Text>
            <Text style={s.modalLabel}>Nome da Clínica</Text>
            <TextInput
              style={s.modalInput}
              value={nomeClinica}
              onChangeText={setNomeClinica}
              placeholder="Clínica Veterinária PetTrack"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={s.modalLabel}>Endereço</Text>
            <TextInput
              style={s.modalInput}
              value={enderecoClinica}
              onChangeText={setEnderecoClinica}
              placeholder="Av. Paulista, 1106 - São Paulo"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={s.modalLabel}>Valor Padrão da Consulta (R$)</Text>
            <TextInput
              style={s.modalInput}
              value={valorConsulta}
              onChangeText={setValorConsulta}
              keyboardType="decimal-pad"
              placeholder="150,00"
              placeholderTextColor={colors.textMuted}
            />
            <View style={s.modalButtons}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setModalClinica(false)}
              >
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={salvarDadosClinica}>
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
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 18 },
    modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
    modalInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
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
      backgroundColor: "#0d9488",
      alignItems: "center",
    },
    modalSaveText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  });
}
